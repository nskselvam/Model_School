import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useUpdateGeneralBioDataMutation } from '../../redux-slice/adminOperationApiSlice';
import { useGetCenterDataQuery } from '../../redux-slice/GeneralGetSqlOperationApiSlice';

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
    mode = 'edit',
    onSave = () => { },
    onHide = () => { },
}) => {
    const [formData, setFormData] = useState(currentRow);
    const [selectedRole, setSelectedRole] = useState(currentRow.Role || '');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [updateGeneralBioData] = useUpdateGeneralBioDataMutation();
    const prevUserIdRef = useRef();

    const regulationInfo = useSelector((state) => state.auth.regulationInfo);
    const regulation = regulationInfo?.regulation || '';

    const { data: centerDataRes, isLoading: isLoadingDistricts } = useGetCenterDataQuery(
        undefined,
        { skip: String(selectedRole) !== '2' }
    );
    const districtList = centerDataRes?.data || [];

    // Sync form when a different user is opened
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
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    // Handle Role Select Change
    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setSelectedRole(roleId);
        setFormData({ ...formData, Role: roleId });
        if (errors.Role) setErrors({ ...errors, Role: '' });
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

    // Handle Modal Close — reset prevUserIdRef so same user can be re-opened cleanly
    const handleClose = () => {
        setFormData(currentRow);
        setSelectedRole(currentRow.Role || '');
        setErrors({});
        setMessage({ type: '', text: '' });
        prevUserIdRef.current = null;
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

                    {/* Student-only fields */}
                    {String(selectedRole) === '2' && (
                        <>
                            {/* District Dropdown */}
                            <Form.Group className="mb-4">
                                <Form.Label>District</Form.Label>
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

                            {/* DNAME — auto-filled */}
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

                            {/* DIST_NAME — auto-filled */}
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
                                <Form.Label>Sub-Center Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="SUB_CEN"
                                    value={formData.SUB_CEN || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter sub-center code"
                                    maxLength={2}
                                />
                            </Form.Group>

                            {/* Roll Number */}
                            <Form.Group className="mb-4">
                                <Form.Label>Roll Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Rollno"
                                    value={formData.Rollno || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter roll number"
                                    maxLength={20}
                                />
                            </Form.Group>

                            {/* Regulation — read-only from Redux */}
                            <Form.Group className="mb-4">
                                <Form.Label>Regulation</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.Regulation || regulation}
                                    readOnly
                                    className="bg-light"
                                    placeholder="From active regulation"
                                />
                            </Form.Group>

                            {/* Reg_Status */}
                            <Form.Group className="mb-4">
                                <Form.Label>Admission Type</Form.Label>
                                <div className="d-flex gap-4 mt-1">
                                    <Form.Check
                                        type="radio"
                                        id="edit-reg-regular"
                                        name="Reg_Status"
                                        label="Regular"
                                        value="1"
                                        checked={String(formData.Reg_Status) === '1'}
                                        onChange={handleInputChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="edit-reg-correspondence"
                                        name="Reg_Status"
                                        label="Correspondence"
                                        value="0"
                                        checked={String(formData.Reg_Status) === '0'}
                                        onChange={handleInputChange}
                                    />
                                </div>
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