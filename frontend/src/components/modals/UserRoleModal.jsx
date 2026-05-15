import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAddNewUserMutation } from '../../redux-slice/adminOperationApiSlice';
import { useGetCenterDataQuery } from '../../redux-slice/GeneralGetSqlOperationApiSlice';

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
    const [formData, setFormData] = useState({ candidateName: '', Email_Id: '', Role: '', DCODE: '', DNAME: '', DIST_NAME: '', SUB_CEN: '', Rollno: '', Reg_Status: '', Regulation: '' });
    const [selectedRole, setSelectedRole] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    const regulationInfo = useSelector((state) => state.auth.regulationInfo);
    const regulation = regulationInfo?.regulation || '';

    const [addNewUser, { isLoading: isAdding }] = useAddNewUserMutation();
    const { data: centerDataRes, isLoading: isLoadingDistricts } = useGetCenterDataQuery(
        undefined,
        { skip: selectedRole !== '2' }  // only fetch when Student User is selected
    );
    const districtList = centerDataRes?.data || [];

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
        // Clear student-only fields when switching away from Student User
        setFormData({ ...formData, Role: roleId, DCODE: '', DNAME: '', DIST_NAME: '', SUB_CEN: '', Rollno: '', Reg_Status: '', Regulation: roleId === '2' ? regulation : '' });
        if (errors.Role) {
            setErrors({ ...errors, Role: '', DCODE: '', SUB_CEN: '', Rollno: '', Reg_Status: '' });
        }
    };

    // Handle District dropdown — auto-fills DNAME and DIST_NAME from master
    const handleDistrictChange = (e) => {
        const dcode = e.target.value;
        const district = districtList.find((d) => d.DCODE === dcode);
        setFormData((prev) => ({
            ...prev,
            DCODE: dcode,
            DNAME: district?.DNAME || '',
            DIST_NAME: district?.dist_Name || '',
        }));
        if (errors.DCODE) setErrors((prev) => ({ ...prev, DCODE: '' }));
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

        // Student-only fields
        if (selectedRole === '2') {
            if (!formData.DCODE) {
                newErrors.DCODE = 'District is required for Student User';
            }
            if (!formData.SUB_CEN?.trim()) {
                newErrors.SUB_CEN = 'Sub-center code is required';
            }
            if (!formData.Rollno?.trim()) {
                newErrors.Rollno = 'Roll number is required';
            }
            if (formData.Reg_Status === '') {
                newErrors.Reg_Status = 'Please select Regular or Correspondence';
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
            // For student, ensure Regulation is set from Redux before submitting
            const payload = selectedRole === '2'
                ? { ...formData, Regulation: regulation }
                : formData;
            const result = await addNewUser(payload).unwrap();
            
            // Show success message
            setMessage({ type: 'success', text: 'User added successfully!' });
            
            // Clear form and close modal after 1.5 seconds
            setTimeout(() => {
                setFormData({ candidateName: '', Email_Id: '', Role: '', DCODE: '', DNAME: '', DIST_NAME: '', SUB_CEN: '', Rollno: '', Reg_Status: '', Regulation: '' });
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
        setFormData({ candidateName: '', Email_Id: '', Role: '', DCODE: '', DNAME: '', DIST_NAME: '', SUB_CEN: '', Rollno: '', Reg_Status: '', Regulation: '' });
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

                    {/* Student-only fields */}
                    {selectedRole === '2' && (
                        <>
                            {/* District Dropdown (DCODE from Icm_Name_masters) */}
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    District <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="DCODE"
                                    value={formData.DCODE || ''}
                                    onChange={handleDistrictChange}
                                    isInvalid={!!errors.DCODE}
                                    disabled={isLoadingDistricts}
                                >
                                    <option value="">
                                        {isLoadingDistricts ? 'Loading districts...' : '-- Select District --'}
                                    </option>
                                    {districtList.map((d) => (
                                        <option key={d.id} value={d.DCODE}>
                                            {d.dist_Name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.DCODE}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* DNAME — auto-filled from selected district */}
                            <Form.Group className="mb-4">
                                <Form.Label>Department Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.DNAME || ''}
                                    readOnly
                                    className="bg-light"
                                    placeholder="Auto-filled from district"
                                />
                            </Form.Group>

                            {/* DIST_NAME — auto-filled from selected district */}
                            <Form.Group className="mb-4">
                                <Form.Label>District Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.DIST_NAME || ''}
                                    readOnly
                                    className="bg-light"
                                    placeholder="Auto-filled from district"
                                />
                            </Form.Group>

                            {/* Sub-Center Code */}
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    Sub-Center Code <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="SUB_CEN"
                                    value={formData.SUB_CEN || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter sub-center code"
                                    maxLength={2}
                                    isInvalid={!!errors.SUB_CEN}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.SUB_CEN}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Roll Number */}
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    Roll Number <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Rollno"
                                    value={formData.Rollno || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter roll number"
                                    maxLength={20}
                                    isInvalid={!!errors.Rollno}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.Rollno}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Regulation — auto-filled from Redux */}
                            <Form.Group className="mb-4">
                                <Form.Label>Regulation</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={regulation}
                                    readOnly
                                    className="bg-light"
                                    placeholder="From active regulation"
                                />
                            </Form.Group>

                            {/* Reg_Status Field */}
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    Admission Type <span className="text-danger">*</span>
                                </Form.Label>
                                <div className="d-flex gap-4 mt-1">
                                    <Form.Check
                                        type="radio"
                                        id="reg-regular"
                                        name="Reg_Status"
                                        label="Regular"
                                        value="1"
                                        checked={formData.Reg_Status === '1'}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.Reg_Status}
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="reg-correspondence"
                                        name="Reg_Status"
                                        label="Correspondence"
                                        value="0"
                                        checked={formData.Reg_Status === '0'}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.Reg_Status}
                                    />
                                </div>
                                {errors.Reg_Status && (
                                    <div className="text-danger" style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
                                        {errors.Reg_Status}
                                    </div>
                                )}
                            </Form.Group>
                        </>
                    )}
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
