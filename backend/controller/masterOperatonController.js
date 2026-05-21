const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const { where } = require("sequelize");
const { formatDateOnly } = require("../utils/formatDateTime");
const { uploadCertificateToS3 } = require("../utils/s3Upload");



const getDistrictMasterData = asyncHandler(async (req, res) => {

    console.log("District Code:", req.body);


    const masterData = await db.Master_11.findAll({
        where: { selFlg: 'Y' ,
            distFlg: 'N'
        },
        attributes: ['Emis_No', 'udise_code', 'district_name', 'school_name', 'father_name', 'name', 'com', 'sex', 'pstm', 'dob', 'Zone_Name_Jee', 'Zone_Name_Neet', 'ph', 'Disability_Name','Student_Status', 'PHONE_NUMBER', 'HOUSE_ADDRESS']
    });

    // Format the DOB field to dd-mm-yyyy
    const formattedData = masterData.map(record => {
        const data = record.toJSON();
        if (data.dob) {
            data.dob = formatDateOnly(data.dob);
        }
        return data;
    });

    res.json({ message: "Master Data Operation Controller", data: formattedData });



});

const districtSendData = asyncHandler(async (req, res) => {

    const data = req.body;

    console.log("Received data from frontend:", data);
    console.log("Number of records:", Array.isArray(data) ? data.length : 0);

    // Validate data
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return res.status(400).json({
            status: "fail",
            message: "No data received"
        });
    }

    for (const record of data) {
        const { Emis_No, udise_code } = record;

        // Validate required fields
        if (!Emis_No || !udise_code) {
            console.warn(`Skipping record with missing required fields: ${JSON.stringify(record)}`);
            continue; // Skip this record and move to the next one
        }

        try {
            await db.Master_11.update(
                { distFlg: 'Y' },
                {
                    where: {
                        Emis_No: Emis_No,
                        udise_code: udise_code
                    }
                }
            );
        } catch (error) {
            console.error(`Error processing record: ${JSON.stringify(record)}`, error);
        }
    }

    // Process the received data as needed
    // For example, you can save it to the database or perform any other operations

    // Here, we are just sending a response back with the received data
    res.json({
        status: "success",
        message: `Data received successfully. ${Array.isArray(data) ? data.length : 0} records processed.`,
        receivedData: data
    });

});

const getDistrictSelectedData = asyncHandler(async (req, res) => {

    console.log("District Code for selected data:", req.query);
    const { Centre_Code } = req.query;

    const whereCondition = { 
        selFlg: 'Y',
        distFlg: 'Y',
        statFlg: 'N' // Only fetch records that have not been processed (statFlg = 'N')
    };

    // Add district filter if Centre_Code is provided
    if (Centre_Code && Centre_Code !== '00') {
        whereCondition.Cen_Code = Centre_Code;
    }

   const masterData = await db.Master_11.findAll({
        where: whereCondition,
        attributes: ['Emis_No', 'udise_code', 'district_name', 'school_name', 'father_name', 'name', 'com', 'sex', 'pstm', 'dob', 'Zone_Name_Jee', 'Zone_Name_Neet', 'ph', 'Disability_Name', 'candidate_status', 'candidate_preferences', 'remarks','Student_Status', 'PHONE_NUMBER', 'HOUSE_ADDRESS']
    });

    // Mapping for preferences
    const preferenceCodeMap = {
        '1': 'JEE',
        '2': 'NEET',
        '3': 'TNEA',
        '4': 'CLAT',
        '5': 'CA',
        '6': 'Civil Services'
    };

    // Format the DOB field to dd-mm-yyyy and parse preferences
    const formattedData = masterData.map(record => {
        const data = record.toJSON();
        if (data.dob) {
            data.dob = formatDateOnly(data.dob);
        }
        
        // Parse comma-separated preferences back to individual fields
        if (data.candidate_preferences) {
            const prefs = data.candidate_preferences.split(',').filter(p => p);
            prefs.forEach((pref, index) => {
                data[`preference_${index + 1}`] = preferenceCodeMap[pref.trim()] || pref.trim();
            });
        }
        
        return data;
    });

    res.json({ message: "Master Data Operation Controller", data: formattedData });

});

const updateDistrictData = asyncHandler(async (req, res) => {
    const { Emis_No, udise_code, ...updateData } = req.body;
    const remarks = req.body.remarks;
    const files = req.files;

    console.log("Updating record:", { Emis_No, udise_code });
    console.log("Uploaded files:", files);
    console.log("Update data:", updateData);
    console.log("Remarks:", remarks);

    // Validate required fields
    if (!Emis_No || !udise_code) {
        return res.status(400).json({
            status: "fail",
            message: "EMIS No and UDISE Code are required"
        });
    }

    // Remove fields that should not be updated (read-only fields from frontend)
    delete updateData.dob; // DOB is disabled in frontend, don't update
    delete updateData.district_name; // District is disabled
    delete updateData.school_name; // School is disabled
    delete updateData.Zone_Name_Jee; // Zone fields are disabled
    delete updateData.Zone_Name_Neet;
    
    // Remove remarks from updateData if it exists there, we'll add it explicitly
    delete updateData.remarks;

    // Process candidate preferences into comma-separated format
    const candidateOptionMap = {
        'JEE': '1',
        'NEET': '2',
        'TNEA': '3',
        'CLAT': '4',
        'CA': '5',
        'Civil Services': '6'
    };
    
    const preferences = [];
    for (let i = 1; i <= 6; i++) {
        const prefKey = `preference_${i}`;
        if (updateData[prefKey]) {
            const prefValue = candidateOptionMap[updateData[prefKey]] || updateData[prefKey];
            preferences.push(prefValue);
        }
        delete updateData[prefKey]; // Remove individual preference fields
    }
    
    // Store preferences as comma-separated string, or null if empty
    if (preferences.length > 0) {
        updateData.candidate_preferences = preferences.join(',');
        console.log("✅ Candidate preferences:", updateData.candidate_preferences);
    } else {
        // Explicitly set to null to clear old preferences when status is not Present
        updateData.candidate_preferences = null;
        console.log("✅ Candidate preferences cleared (set to null)");
    }

    // Add remarks to update data if provided
    if (remarks !== undefined && remarks !== null && remarks !== '') {
        updateData.remarks = remarks;
        console.log("✅ Remarks will be updated:", remarks);
    }

    // Generate S3 folder path: admission_2026/std_11/DD-MM-YYYY/Emis_No
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const dateFolder = `${day}-${month}-${year}`;
    const s3FolderPath = `admission_2026/std_11/${dateFolder}/${Emis_No}`;

    console.log(`📁 S3 Upload folder: ${s3FolderPath}`);

    // Upload files to S3 and add URLs to update data
    const uploadedDocuments = {};
    
    try {
        if (files) {
            // Upload Birth Certificate to S3
            if (files.birthCertificate && files.birthCertificate[0]) {
                const s3Result = await uploadCertificateToS3(files.birthCertificate[0], s3FolderPath);
                updateData.birth_certificate_path = s3Result.key;
             //   updateData.birth_certificate_key = s3Result.key;
              //  uploadedDocuments.birthCertificate = s3Result.url;
                console.log("✅ Birth Certificate uploaded to S3:", s3Result.url);
            }
            
            // Upload Community Certificate to S3
            if (files.communityCertificate && files.communityCertificate[0]) {
                const s3Result = await uploadCertificateToS3(files.communityCertificate[0], s3FolderPath);
                updateData.community_certificate_path = s3Result.key;
            //    updateData.community_certificate_key = s3Result.key;
               // uploadedDocuments.communityCertificate = s3Result.url;
                console.log("✅ Community Certificate uploaded to S3:", s3Result.url);
            }
            
            // Upload Aadhar Card to S3
            if (files.aadharCard && files.aadharCard[0]) {
                const s3Result = await uploadCertificateToS3(files.aadharCard[0], s3FolderPath);
                updateData.aadhar_card_path = s3Result.key;
           //     updateData.aadhar_card_key = s3Result.key;
               // uploadedDocuments.aadharCard = s3Result.url;
                console.log("✅ Aadhar Card uploaded to S3:", s3Result.url);
            }
            
            // Upload Other Certificate to S3
            if (files.otherCertificate && files.otherCertificate[0]) {
                const s3Result = await uploadCertificateToS3(files.otherCertificate[0], s3FolderPath);
                updateData.other_certificate_path = s3Result.key;
             //   updateData.other_certificate_key = s3Result.key;
                //uploadedDocuments.otherCertificate = s3Result.url;
                console.log("✅ Other Certificate uploaded to S3:", s3Result.url);
            }
        }

        // Update database record
        console.log("📝 Final updateData being sent to database:", JSON.stringify(updateData, null, 2));
        const [updatedRows] = await db.Master_11.update(
            updateData,
            {
                where: {
                    Emis_No: Emis_No,
                    udise_code: udise_code
                }
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Record not found"
            });
        }

        res.json({
            status: "success",
            message: "Record and documents updated successfully",
            updatedRows,
            uploadedDocuments
        });
    } catch (error) {
        console.error("❌ Error updating record:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Failed to update record"
        });
    }
});


const getDashboardStatistics = asyncHandler(async (req, res) => {
    const { districtCode } = req.query;

    // Build where condition - filter by selFlg = 'Y' (eligible candidates)
    // For State Dashboard (districtCode = '00' or not provided): only selFlg = 'Y'
    // For District Dashboard (specific district): selFlg = 'Y' AND distFlg = 'Y'
    const whereCondition = { selFlg: 'Y' };

    // Add district filter if provided and not '00' (all districts)
    if (districtCode && districtCode !== '00') {
        whereCondition.Cen_Code = districtCode;
        whereCondition.distFlg = 'Y'; // Only add distFlg for District Dashboard
    }

    try {
        // Use a single optimized query with conditional aggregation
        // For State Dashboard: only selFlg = 'Y'
        // For District Dashboard: selFlg = 'Y' AND distFlg = 'Y'
        const tableName = db.Master_11.getTableName();
        const distFlgCondition = (districtCode && districtCode !== '00') ? `AND "distFlg" = 'Y'` : '';
        const results = await db.sequelize.query(`
            SELECT 
                COUNT(*) as "totalCandidates",
                SUM(CASE WHEN candidate_status = 1 THEN 1 ELSE 0 END) as "presentCount",
                SUM(CASE WHEN candidate_status = 4 THEN 1 ELSE 0 END) as "absentCount",
                SUM(CASE WHEN ph = 1 THEN 1 ELSE 0 END) as "disabledCount",
                SUM(CASE WHEN "Student_Status" = 1 THEN 1 ELSE 0 END) as "modelSchoolCount",
                SUM(CASE WHEN "Student_Status" = 2 THEN 1 ELSE 0 END) as "govtSchoolCount"
            FROM ${tableName}
            WHERE "selFlg" = 'Y' ${distFlgCondition}
            ${districtCode && districtCode !== '00' ? `AND "Cen_Code" = '${districtCode}'` : ''}
        `, { 
            type: db.Sequelize.QueryTypes.SELECT 
        });

        const stats = results && results[0] ? results[0] : {
            totalCandidates: 0,
            presentCount: 0,
            absentCount: 0,
            disabledCount: 0,
            modelSchoolCount: 0,
            govtSchoolCount: 0
        };

        // District-wise present count where condition
        // For State Dashboard: show all eligible candidates (selFlg = 'Y' only)
        // For District Dashboard: show only candidates sent to district (selFlg = 'Y' AND distFlg = 'Y')
        const districtWiseWhereCondition = { selFlg: 'Y', candidate_status: 1 };
        if (districtCode && districtCode !== '00') {
            districtWiseWhereCondition.distFlg = 'Y';
        }

        // Get all grouped distributions in parallel
        const [
            communityDistribution,
            genderDistribution,
            schoolTypeDistribution,
            categoryDistribution,
            candidatesByStatus,
            managementDistribution,
            studentStatusDistribution,
            districtWisePresentCount
        ] = await Promise.all([
            // Community distribution
            db.Master_11.findAll({
                attributes: [
                    'com',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('com')), 'count']
                ],
                where: whereCondition,
                group: ['com'],
                raw: true
            }),
            // Gender distribution
            db.Master_11.findAll({
                attributes: [
                    'sex',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('sex')), 'count']
                ],
                where: whereCondition,
                group: ['sex'],
                raw: true
            }),
            // School type distribution
            db.Master_11.findAll({
                attributes: [
                    'school_type',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('school_type')), 'count']
                ],
                where: whereCondition,
                group: ['school_type'],
                raw: true
            }),
            // Category distribution
            db.Master_11.findAll({
                attributes: [
                    'category',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('category')), 'count']
                ],
                where: whereCondition,
                group: ['category'],
                raw: true
            }),
            // Candidate status breakdown
            db.Master_11.findAll({
                attributes: [
                    'candidate_status',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('candidate_status')), 'count']
                ],
                where: whereCondition,
                group: ['candidate_status'],
                raw: true
            }),
            // Management distribution
            db.Master_11.findAll({
                attributes: [
                    'management',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('management')), 'count']
                ],
                where: whereCondition,
                group: ['management'],
                raw: true
            }),
            // Student Status distribution
            db.Master_11.findAll({
                attributes: [
                    'Student_Status',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('Student_Status')), 'count']
                ],
                where: whereCondition,
                group: ['Student_Status'],
                raw: true
            }),
            // District-wise present count
            db.Master_11.findAll({
                attributes: [
                    'Cen_Code',
                    'district_name',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('Cen_Code')), 'count']
                ],
                where: districtWiseWhereCondition,
                group: ['Cen_Code', 'district_name'],
                order: [[db.Sequelize.literal('count'), 'DESC']],
                raw: true
            })
        ]);

        // Format data for response
        res.json({
            status: 'success',
            data: {
                totalCandidates: parseInt(stats.totalCandidates) || 0,
                presentCount: parseInt(stats.presentCount) || 0,
                absentCount: parseInt(stats.absentCount) || 0,
                disabledCount: parseInt(stats.disabledCount) || 0,
                modelSchoolCount: parseInt(stats.modelSchoolCount) || 0,
                govtSchoolCount: parseInt(stats.govtSchoolCount) || 0,
                districtWisePresentCount: districtWisePresentCount.map(item => ({
                    districtCode: item.Cen_Code,
                    districtName: item.district_name || `District ${item.Cen_Code}`,
                    count: parseInt(item.count)
                })),
                communityDistribution: communityDistribution.map(item => ({
                    community: item.com,
                    count: parseInt(item.count)
                })),
                genderDistribution: genderDistribution.map(item => ({
                    gender: item.sex,
                    count: parseInt(item.count)
                })),
                schoolTypeDistribution: schoolTypeDistribution.map(item => ({
                    type: item.school_type,
                    count: parseInt(item.count)
                })),
                categoryDistribution: categoryDistribution.map(item => ({
                    category: item.category,
                    count: parseInt(item.count)
                })),
                candidatesByStatus: candidatesByStatus.map(item => ({
                    status: item.candidate_status,
                    count: parseInt(item.count)
                })),
                managementDistribution: managementDistribution.map(item => ({
                    management: item.management,
                    count: parseInt(item.count)
                })),
                studentStatusDistribution: studentStatusDistribution.map(item => ({
                    studentStatus: item.Student_Status,
                    count: parseInt(item.count)
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Failed to fetch dashboard statistics"
        });
    }
});

const getStudentProcessingReport = asyncHandler(async (req, res) => {
    const { districtCode, candidateStatus, schoolType } = req.query;

    // Build where condition - filter by selFlg = 'Y' (eligible candidates)
    // For State view: only selFlg = 'Y'
    // For District view: selFlg = 'Y' AND distFlg = 'Y' (sent to district)
    const whereCondition = { selFlg: 'Y' };

    console.log("Received filters - District Code:", districtCode, "Candidate Status:", candidateStatus, "School Type:", schoolType);
    
    // Special handling for candidateStatus = 5 (Pending/Not Processed)
    if(candidateStatus == '5') {
        whereCondition.candidate_status = 0; // Candidates not yet processed
    }

    console.log("Constructed where condition:", whereCondition);

    // Add district filter if provided and not '00' or 'all'
    if (districtCode && districtCode !== '00' && districtCode !== 'all') {
        whereCondition.Cen_Code = districtCode;
        whereCondition.distFlg = 'Y'; // Only add distFlg for specific district view
    }

    // Add candidate status filter if provided (skip for '5' as it's handled above)
    if (candidateStatus !== undefined && candidateStatus !== 'all' && candidateStatus !== '5') {
        whereCondition.candidate_status = parseInt(candidateStatus);
    }

    // Add school type filter if provided
    if (schoolType && schoolType !== 'all') {
        whereCondition.Student_Status = parseInt(schoolType);
    }

    try {
        // Get individual student records
        const studentRecords = await db.Master_11.findAll({
            attributes: [
                'Emis_No',
                'udise_code',
                'school_name',
                'district_name',
                'Cen_Code',
                'name',
                'father_name',
                'Student_Status',
                'candidate_status',
                'com',
                'sex',
                'pstm',
                'dob',
                'ph',
                'Disability_Name',
                'Zone_Name_Jee',
                'Zone_Name_Neet',
                'candidate_preferences',
                'PHONE_NUMBER',
                'HOUSE_ADDRESS'
            ],
            where: whereCondition,
            order: [
                ['Cen_Code', 'ASC'],
                ['Emis_No', 'ASC']
            ]
        });

        // Format dates in the response
        const formattedRecords = studentRecords.map(record => {
            const data = record.toJSON();
            if (data.dob) {
                data.dob = formatDateOnly(data.dob);
            }
            return data;
        });

        // Get summary statistics
        const totalRecords = formattedRecords.length;
        const presentCount = formattedRecords.filter(r => r.candidate_status === 1).length;
        const absentCount = formattedRecords.filter(r => r.candidate_status === 4).length;
        const notProcessedCount = formattedRecords.filter(r => r.candidate_status === 0).length;
        const status2Count = formattedRecords.filter(r => r.candidate_status === 2).length;
        const status3Count = formattedRecords.filter(r => r.candidate_status === 3).length;
        

        
        // Get unique districts for dropdown
        const uniqueDistricts = await db.Master_11.findAll({
            attributes: [
                [db.Sequelize.fn('DISTINCT', db.Sequelize.col('Cen_Code')), 'Cen_Code'],
                'district_name'
            ],
            where: { selFlg: 'Y' },
            order: [['Cen_Code', 'ASC']],
            raw: true
        });

        res.json({
            status: 'success',
            data: formattedRecords,
            summary: {
                totalRecords,
                presentCount,
                absentCount,
                notProcessedCount,
                status2Count,
                status3Count
            },
            districts: uniqueDistricts.map(d => ({
                code: d.Cen_Code,
                name: d.district_name || `District ${d.Cen_Code}`
            })),
            filters: {
                districtCode: districtCode || 'all',
                candidateStatus: candidateStatus || 'all',
                schoolType: schoolType || 'all'
            }
        });
    } catch (error) {
        console.error("Error fetching student processing report:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Failed to fetch student processing report"
        });
    }
});

const updateCertificateVerifiedStatus = asyncHandler(async (req, res) => {
    const { Emis_No, udise_code } = req.body;

    console.log("Updating certificate verification status for:", { Emis_No, udise_code });

    // Validate required fields
    if (!Emis_No || !udise_code) {
        return res.status(400).json({
            status: "fail",
            message: "EMIS No and UDISE Code are required"
        });
    }

    try {
        // Update statFlg to 'Y' (certificate verified/printed)
        const [updatedRows] = await db.Master_11.update(
            { statFlg: 'Y' },
            {
                where: {
                    Emis_No: Emis_No,
                    udise_code: udise_code
                }
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Record not found"
            });
        }

        res.json({
            status: "success",
            message: "Certificate verification status updated successfully",
            updatedRows
        });
    } catch (error) {
        console.error("❌ Error updating certificate verification status:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Failed to update certificate verification status"
        });
    }
});

module.exports = {
    getDistrictMasterData,
    districtSendData,
    getDistrictSelectedData,
    updateDistrictData,
    getDashboardStatistics,
    getStudentProcessingReport,
    updateCertificateVerifiedStatus
}

