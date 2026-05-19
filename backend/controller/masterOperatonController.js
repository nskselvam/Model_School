const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const { where } = require("sequelize");
const { formatDateOnly } = require("../utils/formatDateTime");
const { uploadCertificateToS3 } = require("../utils/s3Upload");



const getDistrictMasterData = asyncHandler(async (req, res) => {


    const masterData = await db.Master_11.findAll({
        where: { selFlg: 'Y' },
        attributes: ['Emis_No', 'udise_code', 'district_name', 'school_name', 'father_name', 'name', 'com', 'sex', 'pstm', 'dob', 'Zone_Name_Jee', 'Zone_Name_Neet', 'ph', 'Disability_Name', 'candidate_option']
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

   const masterData = await db.Master_11.findAll({
        where: { selFlg: 'Y' ,
            distFlg: 'Y'
        },
        attributes: ['Emis_No', 'udise_code', 'district_name', 'school_name', 'father_name', 'name', 'com', 'sex', 'pstm', 'dob', 'Zone_Name_Jee', 'Zone_Name_Neet', 'ph', 'Disability_Name', 'candidate_status', 'candidate_preferences', 'remarks']
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


module.exports = {
    getDistrictMasterData,
    districtSendData,
    getDistrictSelectedData,
    updateDistrictData
}

