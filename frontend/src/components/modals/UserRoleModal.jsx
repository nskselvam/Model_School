import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useAddNewUserMutation } from '../../redux-slice/adminOperationApiSlice';

// Role Master data for mapping role IDs to names
const roleMaster = [
    { id: "0", name: "State User" },
    { id: "1", name: "District User" },
    { id: "2", name: "Student User" },
    { id: "3", name: "Zone User" },
];

/**
 * User Role Add Modal Component - Simplified version
 * Only shows Role, Name, and Email fields
 */
const UserRoleModal = ({
    show = false,
    onHide = () => { },
    onSave = () => { },
}) => {
    const [formData, setFormData] = useState({ candidateName: '', Email_Id: '', Role: '' });
    const [selectedRole, setSelectedRole] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    const [addNewUser, { isLoading: isAdding }] = useAddNewUserMutation();

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Handle Role Select Change
    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setSelectedRole(roleId);
        setFormData({ ...formData, Role: roleId });
        if (errors.Role) {
            setErrors({ ...errors, Role: '' });
        }
    };

    // Validate Form
    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!selectedRole) {
            newErrors.Role = 'Role is required';
        }
        
        if (!formData.candidateName?.trim()) {
            newErrors.candidateName = 'Name is required';
        }

        // Email validation
        if (!formData.Email_Id?.trim()) {
            newErrors.Email_Id = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.Email_Id)) {
                newErrors.Email_Id = 'Please enter a valid email address';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Save
    const handleSave = async () => {
        if (!validateForm()) {
            setMessage({ type: 'danger', text: 'Please fill all required fields correctly.' });
            return;
        }
        
        try {
            const result = await addNewUser(formData).unwrap();
            
            // Show success message
            setMessage({ type: 'success', text: 'User added successfully!' });
            
            // Clear form and close modal after 1.5 seconds
            setTimeout(() => {
                setFormData({ candidateName: '', Email_Id: '', Role: '' });
                setSelectedRole('');
                setErrors({});
                setMessage({ type: '', text: '' });
                onHide();
                if (onSave) onSave(result);
            }, 1500);
            
        } catch (error) {
            console.error('Error adding user:', error);
            setMessage({ 
                type: 'danger', 
                text: error?.data?.message || 'Failed to add user. Please try again.' 
            });
        }
    };

    // Handle Modal Close
    const handleClose = () => {
        setFormData({ candidateName: '', Email_Id: '', Role: '' });
        setSelectedRole('');
        setErrors({});
        setMessage({ type: '', text: '' });
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            keyboard={false}
            size="lg"
        >
            <Modal.Header
                closeButton
                style={{ backgroundColor: '#335e8a', color: 'white' }}
            >
                <Modal.Title>
                    Add New User
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 py-4">
                {/* Success/Error Message */}
                {message.text && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                        {message.text}
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setMessage({ type: '', text: '' })}
                        ></button>
                    </div>
                )}

                <Form>
                    {/* Role Selection */}
                    <Form.Group className="mb-4">
                        <Form.Label>
                            Role <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                            name="Role"
                            value={selectedRole}
                            onChange={handleRoleChange}
                            isInvalid={!!errors.Role}
                        >
                            <option value="">-- Select Role --</option>
                            {roleMaster.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.Role}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Name Field */}
                    <Form.Group className="mb-4">
                        <Form.Label>
                            Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="candidateName"
                            value={formData.candidateName || ''}
                            onChange={handleInputChange}
                            placeholder="Enter name"
                            isInvalid={!!errors.candidateName}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.candidateName}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Email Field */}
                    <Form.Group className="mb-4">
                        <Form.Label>
                            Email <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="email"
                            name="Email_Id"
                            value={formData.Email_Id || ''}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                            isInvalid={!!errors.Email_Id}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.Email_Id}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: '#f8f9fa' }}>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    style={{ minWidth: '100px' }}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isAdding}
                    style={{ minWidth: '100px' }}
                >
                    {isAdding ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Adding...
                        </>
                    ) : (
                        'Add User'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserRoleModal;
