import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useUpdateGeneralBioDataMutation } from '../../redux-slice/adminOperationApiSlice';

// Role Master data for mapping role IDs to names
const roleMaster = [
    { id: "0", name: "State User" },
    { id: "1", name: "District User" },
    { id: "2", name: "Student User" },
    { id: "3", name: "Zone User" },
];

/**
 * User Edit Modal Component - Simplified version
 * Only shows Role, Name, and Email fields
 */

const UserEditModalf = ({
    show = false,
    currentRow = { id: '', candidateName: '', Email_Id: '', Role: '' },
    mode = 'edit', // 'add' or 'edit'
    onSave = () => { },
    onHide = () => { },
}) => {
    const [formData, setFormData] = useState(currentRow);
    const [selectedRole, setSelectedRole] = useState(currentRow.Role || '');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [updateGeneralBioData] = useUpdateGeneralBioDataMutation();
    
    // Track previous user ID to detect when editing a different user
    const prevUserIdRef = useRef();

    // Update form data when modal opens or when editing a different user
    React.useEffect(() => {
        if (show && currentRow.id !== prevUserIdRef.current) {
            setFormData(currentRow);
            setSelectedRole(currentRow.Role || '');
            setErrors({});
            setMessage({ type: '', text: '' });
            prevUserIdRef.current = currentRow.id;
        }
    }, [show, currentRow]);

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

        setIsLoading(true);
        try {
            const response = await updateGeneralBioData(formData).unwrap();
            console.log('Update response:', response);
            
            setIsLoading(false);
            setMessage({ type: 'success', text: 'User updated successfully!' });
            
            // Call the parent's onSave callback
            if (onSave) {
                onSave(formData);
            }
            
            // Close modal after showing success message
            setTimeout(() => {
                onHide();
            }, 1500);
        } catch (error) {
            console.error('Save error:', error);
            setIsLoading(false);
            setMessage({ type: 'danger', text: error?.data?.message || 'Failed to save. Please try again.' });
        }
    };

    // Handle Modal Close
    const handleClose = () => {
        setFormData(currentRow);
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
                    {mode === 'add' ? 'Add New User' : 'Edit Information'}
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
                    disabled={isLoading}
                    style={{ minWidth: '100px' }}
                >
                    {isLoading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Saving...
                        </>
                    ) : (
                        mode === 'add' ? 'Add User' : 'Save Changes'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserEditModalf;