import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import DataTable from 'react-data-table-component/dist/index.es.js'
import { useGetDistrictMasterDataQuery, useGetVacancyDataQuery } from '../../../redux-slice/vacancyApiSlice'

const Vacancy_master_Dashboard = () => {
    // Get user's district code from Redux state
    const { regulationInfo } = useSelector((state) => state.auth);
    const userDistrictCode = regulationInfo?.district || "00";
    
    // If D_Code is "00" (All District), fetch all data. Otherwise, fetch specific district data
    const districtParam = userDistrictCode === "00" ? "ALL" : userDistrictCode;
 
    const { data: districtMasterData, isLoading: isDistrictMasterDataLoading, error: districtMasterDataError } = useGetDistrictMasterDataQuery();
    const { data: vacancyData, isLoading: isVacancyDataLoading, error: vacancyDataError } = useGetVacancyDataQuery(districtParam);

    // State for district filter
    const [selectedDistrict, setSelectedDistrict] = useState("ALL");

    // Define columns for DataTable
    const columns = [
        {
            name: 'S.No',
            selector: (row, index) => index + 1,
            sortable: true,
            width: '70px'
        },
        {
            name: 'District Code',
            selector: row => row.dCode,
            sortable: true,
            width: '120px'
        },
        {
            name: 'Category',
            selector: row => row.Catgegory,
            sortable: true,
            wrap: true
        },
        {
            name: 'Vacancy',
            selector: row => row.Vacancy,
            sortable: true,
            width: '100px'
        },
        {
            name: 'Vacancy Status',
            selector: row => row.Vac_Status,
            sortable: true,
            width: '130px'
        },
        {
            name: 'Sex',
            selector: row => row.sex,
            sortable: true,
            width: '80px'
        },
        {
            name: 'PSTM',
            selector: row => row.pstm,
            sortable: true,
            width: '90px'
        },
        {
            name: 'Student Status',
            selector: row => row.Student_Status,
            sortable: true,
            width: '130px'
        },
        {
            name: 'Community',
            selector: row => row.Com,
            sortable: true,
            width: '110px'
        },
        {
            name: 'PH',
            selector: row => row.ph,
            sortable: true,
            width: '80px'
        },
        {
            name: 'Sequence',
            selector: row => row.seq,
            sortable: true,
            width: '100px'
        },
        {
            name: 'Vacancy Type',
            selector: row => row.Vacancy_Type,
            sortable: true,
            width: '120px'
        },
        {
            name: 'Center Type',
            selector: row => row.Center_Type,
            sortable: true,
            wrap: true
        },
        {
            name: 'Zone Code',
            selector: row => row.Zone_Code,
            sortable: true,
            width: '110px'
        },
        {
            name: 'Zone Name',
            selector: row => row.Zone_Name,
            sortable: true,
            wrap: true
        },
        {
            name: 'Student Type',
            selector: row => row.student_type,
            sortable: true,
            wrap: true
        },
        {
            name: 'Remarks',
            selector: row => row.REM,
            sortable: true,
            wrap: true
        }
    ];

    // Filter data based on selected district
    const filteredData = useMemo(() => {
        if (!vacancyData) return [];
        
        // Show all data if "ALL" is selected or if district code is "00" (All District)
        if (selectedDistrict === "ALL" || selectedDistrict === "00") {
            return vacancyData;
        }
        
        return vacancyData.filter(item => item.dCode === selectedDistrict);
    }, [vacancyData, selectedDistrict]);

    // Get unique district options
    const districtOptions = useMemo(() => {
        if (!districtMasterData) return [];
        
        // If user has access to all districts
        if (userDistrictCode === "00") {
            return districtMasterData;
        }
        
        // If user has specific district access
        return districtMasterData.filter(district => district.DCODE === userDistrictCode);
    }, [districtMasterData, userDistrictCode]);

    if (isDistrictMasterDataLoading || isVacancyDataLoading) {
        return <div className="text-center p-4">Loading...</div>;
    }

    if (districtMasterDataError || vacancyDataError) {
        return (
            <div className="alert alert-danger m-3">
                {districtMasterDataError && <p>District Master Error: {districtMasterDataError?.data?.message || 'Failed to load districts'}</p>}
                {vacancyDataError && <p>Vacancy Error: {vacancyDataError?.data?.message || 'Failed to load vacancy data'}</p>}
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Vacancy Master Dashboard</h4>
                </div>
                <div className="card-body">
                    {/* District Filter */}
                    <div className="mb-3 row align-items-center">
                        <label className="col-sm-2 col-form-label">
                            <strong>Filter by District:</strong>
                        </label>
                        <div className="col-sm-4">
                            <select 
                                className="form-select"
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={userDistrictCode !== "00"}
                            >
                                <option value="ALL">All Districts</option>
                                {districtOptions.map((district) => (
                                    <option key={district.DCODE} value={district.DCODE}>
                                        {district.DNAME} ({district.DCODE})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-sm-6">
                            <span className="badge bg-info">
                                Showing {filteredData.length} records
                            </span>
                        </div>
                    </div>

                    {/* DataTable */}
                    {filteredData.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            striped
                            responsive
                            dense
                            fixedHeader
                            fixedHeaderScrollHeight="500px"
                        />
                    ) : (
                        <div className="alert alert-warning text-center">
                            <h5>No Data Found</h5>
                            <p>No vacancy records available for the selected district.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Vacancy_master_Dashboard
