const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../backend/db/models");
const { Sequelize, Op } = require("sequelize");
const valid_sections = db.valid_sections;
const valid_question = db.valid_question;
const AppError = require("../backend/utils/appError");
const {
  getCurrentISTDateTime,
  getClientIP,
} = require("../backend/utils/formatDateTime");
const { get } = require("http");
const subcode_Fetech = asyncHandler(async (req, res) => {
  console.log(req.query);
  const { subcode } = req.query;
  const subcodeData = await valid_sections.findAll({
    where: { sub_code: subcode },
    attributes: {
      include: [
        [Sequelize.literal("''"), "Mark"],
        [Sequelize.literal("''"), "barcode"],
        [Sequelize.literal("''"), "eva_id"],
        [Sequelize.literal("''"), "valuation_type"],
        [Sequelize.literal("''"), "Examiner_type"],
        [Sequelize.literal("''"), "Dep_Name"],
        [Sequelize.literal("''"), "page_no"],
        [Sequelize.literal("''"), "Qbs_Page_No"],
        // Add empty string as dummy column
      ],
    },
    order: [
      ["section", "ASC"],
      ["qstn_num", "ASC"],
      ["sub_section", "ASC"],
      ["add_sub_section", "ASC"],
    ],
  });

  if (!subcodeData || subcodeData.length === 0) {
    res.status(404);
    throw new AppError("Subject  not found", 404);
  }

  const validQuestionData = await valid_question.findAll({
    where: { SUBCODE: subcode },
    order: [
      ["SECTION", "ASC"],
      ["FROM_QST", "ASC"],
      ["SUB_SEC", "ASC"],
    ],
  });

  if (!validQuestionData || validQuestionData.length === 0) {
    res.status(404);
    throw new AppError("Questions not found", 404);
  }

  res
    .status(200)
    .json({ Valid_Section: subcodeData, Valid_Question: validQuestionData });
});

const valuation_Barcode_Fetch = asyncHandler(async (req, res) => {
  let BarcodeStatus = false;
  const { subcode, valuation_type, Eva_Id, Eva_Mon_Year } = req.query;
  console.log(getCurrentISTDateTime());

  const flname = `import${valuation_type}`;
  const model = db[flname];
  console.log(flname);
  const barcodeData = await model.findOne({
    where: {
      Eva_Mon_Year: Eva_Mon_Year,
      [Op.or]: [
        {
          [Op.and]: [
            { Evaluator_Id: Eva_Id },
            { subcode: subcode },
            { E_flg: "A" },
            { Checked: "NO" },
          ],
        },
        {
          [Op.and]: [{ subcode: subcode }, { E_flg: "N" }, { Checked: "NO" }],
        },
      ],
    },
    order: [
      Sequelize.literal(
        `CASE WHEN "Evaluator_Id" = '${Eva_Id}' THEN 0 ELSE 1 END`
      ),
      Sequelize.literal("RANDOM()"),
    ],
  });

  if (!barcodeData) {
    res.status(404);
    throw new AppError("Barcode not found", 404);
  } else {
    BarcodeStatus = true;
    barcodeData.E_flg = "A";
    barcodeData.Evaluator_Id = Eva_Id;
    barcodeData.A_date = getCurrentISTDateTime();
    await barcodeData.save();
  }
  res.status(200).json({
    data: barcodeData,
    BarcodeStatus: BarcodeStatus,
  });
  //   const { subcode } = req.query;
  //   const subcodeData = await valid_sections.findAll({
  //     where: { sub_code: subcode },
  //   });
  //   if (!subcodeData || subcodeData.length === 0) {
  //     res.status(404);
  //     throw new AppError("Subject  not found", 404);
  //   }
  //   res.status(200).json({ data: subcodeData });
});

const valuation_Image_Fetch = asyncHandler(async (req, res) => {
  const { batchname, subcode, Dep_Name, Eva_Mon_Year, Img_Number } = req.query;

  const fs = require("fs");
  const path = require("path");
  const imageDir = path.join(
    __dirname,
    "..",
    "uploads",
    Eva_Mon_Year,
    "ImgImp",
    Dep_Name,
    batchname
  );
  //82183094_01_TE24101T
  let Img_flname =
    batchname + "_" + Img_Number.padStart(2, "0") + "_" + subcode;
  const imagePath = path.join(imageDir, `${Img_flname}.jpg`);
  if (fs.existsSync(imagePath)) {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");
    res.status(200).json({ image: base64Image });
  } else {
    res.status(404);
    throw new AppError("Image not found", 404);
  }

  let flname = console.log(req.body);
});

const valuation_Data_Update = asyncHandler(async (req, res) => {
  const {
    barcode,
    subcode,
    Eva_Id,
    sec_id,
    page_no,
    Qbs_Page_No,
    Dep_Name,
    Marks_Get,
    section,
    sub_section,
    add_sub_section,
    max_marks,
    checkdate,
    qbno,
    Eva_Mon_Year,
    valuation_type,
    Examiner_type,
    BL_Point,
    CO_Point,
    PO_Point,
  } = req.body;

  console.log(req.body)

  flname = `val_data_${Dep_Name}`;
  console.log(flname);

  const val_data = await db[flname].findOne({
    where: {
      barcode: barcode,
      subcode: subcode,
      sec_id: sec_id,
      eva_id: Eva_Id,
      section: section,
      valuation_type: valuation_type,
      Examiner_type: Examiner_type,
      Dep_Name: Dep_Name,
    },
  });
  if (!val_data) {
    await db[flname].create({
      barcode: barcode,
      subcode: subcode,
      sec_id: sec_id,
      eva_id: Eva_Id,
      page_no: page_no,
      Qbs_Page_No: Qbs_Page_No,
      section: section,
      sub_section: sub_section,
      add_sub_section: add_sub_section,
      max_marks: max_marks,
      Marks_Get: Marks_Get,
      checkdate: getCurrentISTDateTime(),
      qbno: qbno,
      valuation_type: valuation_type,
      Examiner_type: Examiner_type,
      Dep_Name: Dep_Name,
      Eva_Mon_Year: Eva_Mon_Year,
      BL_Point: BL_Point,
      CO_Point: CO_Point,
      PO_Point: PO_Point,
    });
  } else {
    val_data.Marks_Get = Marks_Get;
    val_data.page_no = page_no;
    val_data.Qbs_Page_No = Qbs_Page_No;
    val_data.section = section;
    val_data.sub_section = sub_section;
    val_data.add_sub_section = add_sub_section;
    val_data.max_marks = max_marks;
    val_data.checkdate = getCurrentISTDateTime();
    val_data.qbno = qbno;
    await val_data.save();
  }

  res.status(200).json({ message: "Data received successfully", flname });
});

const valuation_Finalize = asyncHandler(async (req, res) => {
  const {
    barcode,
    subcode,
    Eva_Id,
    Dep_Name,
    valuation_type,
    Eva_Mon_Year,
    Examiner_type,
    Final_Marks_Front,
    Regular_Questions,
    AB_Questions,
    Total_Rounded_Marks_Front,
  } = req.body;

  const ClintIP = getClientIP(req);
  const flname = `val_data_${Dep_Name}`;
  const model = db[flname];
  const val_data = await model.update(
    { valid_qbs: "N" },
    {
      where: {
        barcode: barcode,
        subcode: subcode,
        eva_id: Eva_Id,
        Eva_Mon_Year: Eva_Mon_Year,
        valuation_type: valuation_type,
        Dep_Name: Dep_Name,
        Examiner_type: Examiner_type,
      },
    }
  );

  //Valid_Question_Bank fetch
  const valid_Question = await db.valid_question.findAll({
    where: { SUBCODE: subcode },
    order: [
      ["SECTION", "ASC"],
      ["FROM_QST", "ASC"],
    ],
  });

  //Mark for finalization fetch
  const val_data_section = await model.findAll({
    where: {
      barcode: barcode,
      subcode: subcode,
      eva_id: Eva_Id,
      Eva_Mon_Year: Eva_Mon_Year,
      valuation_type: valuation_type,
      Dep_Name: Dep_Name,
      Examiner_type: Examiner_type,
    },
    order: [
      ["qbno", "ASC"],
      ["section", "ASC"],
      ["sub_section", "ASC"],
      ["add_sub_section", "ASC"],
    ],
  });

  // Create sections object to hold marks for each section
  const sections = {};
  let sectionKey;
  let sectionKey1;

  for (const question of valid_Question) {
    const matchingMarks = val_data_section.filter(
      (mark) =>
        mark.section === question.SECTION &&
        parseInt(question.FROM_QST) <= parseInt(mark.qbno) &&
        parseInt(mark.qbno) <= parseInt(question.TO_QST)
    );

    if (question.SUB_SEC === "ab") {
      sectionKey = `Section${question.SECTION}a`;
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }

      sectionKey1 = `Section${question.SECTION}b`;
      if (!sections[sectionKey1]) {
        sections[sectionKey1] = [];
      }
    } else {
      sectionKey = `Section${question.SECTION}`;
      if (!sections[sectionKey]) {
        sections[sectionKey] = [];
      }
    }

    // Process matching marks for the current question

    let existingMark;

    matchingMarks.forEach((mark) => {
      if (question.SUB_SEC != "ab") {
        existingMark = sections[sectionKey].find((m) => m.qbno === mark.qbno);
        if (existingMark) {
          existingMark.marks +=
            mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
          existingMark.dummy_marks +=
            mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
        } else {
          sections[sectionKey].push({
            qbno: mark.qbno,
            marks: mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get),
            dummy_marks:
              mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get),
            Qst_Valid: "N",
          });
        }
      } else {
        if (mark.sub_section === "a") {
          existingMark = sections[sectionKey].find((m) => m.qbno === mark.qbno);
          if (existingMark) {
            existingMark.marks +=
              mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
            existingMark.dummy_marks +=
              mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
          } else {
            sections[sectionKey].push({
              qbno: mark.qbno,
              marks: mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get),
              dummy_marks:
                mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get),
              Qst_Valid: "N",
            });
          }
        } else if (mark.sub_section === "b") {
          existingMark = sections[sectionKey1].find(
            (m) => m.qbno === mark.qbno
          );
          if (existingMark) {
            existingMark.marks +=
              mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
            existingMark.dummy_marks +=
              mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get);
          } else {
            sections[sectionKey1].push({
              qbno: mark.qbno,
              marks: mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get),
              dummy_marks:
                mark.Marks_Get == "NA" ? 0 : parseFloat(mark.Marks_Get),
              Qst_Valid: "N",
            });
          }
        }
      }
    });
  }

  // Store all Object keys

  const allSectionKeys = Object.keys(sections);

  // Compulsory Questions Handling C_QST
  // Remove unused C_QST_List code block
  let C_QST_List = [];
  valid_Question.forEach((question) => {
    if (question.C_QST) {
      C_QST_List = question.C_QST.split(",");
      let newSection = "Section" + question.SECTION;
      for (let i = 0; i < C_QST_List.length; i++) {
        C_QST_List[i] = C_QST_List[i].trim();
        sections[newSection].forEach((item) => {
          if (C_QST_List.includes(item.qbno.toString())) {
            item.dummy_marks = 99;
          }
        });
      }
    }
  });

  // Sort each section based on dummy_marks in descending order
  allSectionKeys.forEach((key) => {
    sections[key] = sections[key].sort(
      (a, b) => parseFloat(b.dummy_marks) - parseFloat(a.dummy_marks)
    );
  });

  // Element Selection Based on Valid Questions

  let Final_Qst = { Sections: [] };
  let Final_Marks = 0;
  let Section_Qst = { Sectionsab: [] };
  valid_Question.forEach((question) => {
    if (question.SUB_SEC == "ab") {
      const foundItemA = sections[`Section${question.SECTION}a`];
      const foundItemB = sections[`Section${question.SECTION}b`];
      if (foundItemA && foundItemB) {
        for (let i = 0; i < foundItemA.length; i++) {
          if (foundItemA[i] >= foundItemB[i]) {
            Section_Qst["Sectionsab"].push({
              qbno: foundItemA[i].qbno,
              sub_subction: "a",
            });
            foundItemA[i].Qst_Valid = "Y";
            Final_Marks += foundItemA[i].marks;
          } else {
            Section_Qst["Sectionsab"].push({
              qbno: foundItemB[i].qbno,
              sub_subction: "b",
            });
            Final_Marks += foundItemB[i].marks;
            foundItemB[i].Qst_Valid = "Y";
          }
        }
      }
    } else {
      const foundItem = sections[`Section${question.SECTION}`];
      if (foundItem) {
        for (let i = 0; i < foundItem.length; i++) {
          if (parseInt(question.NOQST) > i) {
            Final_Qst["Sections"].push({
              qbno: foundItem[i].qbno,
            });
            Final_Marks += foundItem[i].marks;
            foundItem[i].Qst_Valid = "Y";
          }
        }
      }
    }
  });

  allSectionKeys.forEach((key) => {
    console.log(`Updated ${key}:`, sections[key]);
  });

  // Update valid_qbs='Y' for regular sections

  const valid_data_tbl = `val_data_${Dep_Name}`;
  const model_valid_data = db[valid_data_tbl];
  if (Final_Qst.Sections && Final_Qst.Sections.length > 0) {
    const qbnoArray = Final_Qst.Sections.map((item) => item.qbno);

    await model_valid_data.update(
      { valid_qbs: "Y" },
      {
        where: {
          barcode: barcode,
          subcode: subcode,
          eva_id: Eva_Id,
          Eva_Mon_Year: Eva_Mon_Year,
          valuation_type: valuation_type,
          Examiner_type: Examiner_type,
          Dep_Name: Dep_Name,
          qbno: { [Op.in]: qbnoArray },
          Marks_Get: { [Op.ne]: "NA" },
        },
      }
    );
  }

  if (Section_Qst.Sectionsab && Section_Qst.Sectionsab.length > 0) {
    for (const item of Section_Qst.Sectionsab) {
      await model_valid_data.update(
        { valid_qbs: "Y" },
        {
          where: {
            barcode: barcode,
            subcode: subcode,
            eva_id: Eva_Id,
            Eva_Mon_Year: Eva_Mon_Year,
            valuation_type: valuation_type,
            Examiner_type: Examiner_type,
            Dep_Name: Dep_Name,
            qbno: item.qbno,
            sub_section: item.sub_subction,
            Marks_Get: { [Op.ne]: "NA" },
          },
        }
      );
    }
  }

  console.log("Final Marks Calculated:", Final_Marks);
  console.log("Final Marks from Frontend:", Final_Marks_Front);

  let totalRoundedMarks = Math.round(Final_Marks);
  if (Total_Rounded_Marks_Front != totalRoundedMarks) {
    res.status(201).json({
      message: "Finalization marks mismatch",
      Final_Marks: Final_Marks,
      Mark_Error: true,
      Regular_Questions: Final_Qst.Sections.length,
      AB_Questions: Section_Qst.Sectionsab.length,
      Total_Rounded_Marks: totalRoundedMarks,
      Total_Mark_Calculated_Front: Total_Rounded_Marks_Front,
    });
    return;
  }

  const flname_import = `import${valuation_type}`;
  const model_import = db[flname_import];
  let import_record;
  if (Examiner_type == 1) {
    import_record = await model_import.update(
      {
        Checked: "Yes",
        E_flg: "Y",
        total: Final_Marks,
        tot_round: totalRoundedMarks,
        checkdate: getCurrentISTDateTime(),
        ip: ClintIP,
      },
      {
        where: {
          barcode: barcode,
          subcode: subcode,
          Eva_Mon_Year: Eva_Mon_Year,
          Evaluator_Id: Eva_Id,
          Dep_Name: Dep_Name,
        },
      }
    );
  } else if (Examiner_type == 2) {
    import_record = await model_import.update(
      {
        Chief_Checked: "Yes",
        Chief_E_flg: "Y",
        Chief_total: Final_Marks,
        Chief_tot_rounded: totalRoundedMarks,
        Chief_checkdate: getCurrentISTDateTime(),
        Chief_ip: ClintIP,
      },
      {
        where: {
          barcode: barcode,
          subcode: subcode,
          Eva_Mon_Year: Eva_Mon_Year,
          Evaluator_Id: Eva_Id,
          Dep_Name: Dep_Name,
        },
      }
    );
  }
  if (!import_record) {
    res.status(201);
    throw new AppError("Finalization failed during import update", 201);
  }

  console.log(Total_Rounded_Marks_Front, totalRoundedMarks);
  res.status(200).json({
    message: "Finalization successful",
    Final_Marks: Final_Marks,
    Regular_Questions: Final_Qst.Sections.length,
    AB_Questions: Section_Qst.Sectionsab.length,
    Total_Rounded_Marks: totalRoundedMarks,
    Mark_Error: false,
    Total_Mark_Calculated_Front: Total_Rounded_Marks_Front,
  });
});

const examminer_valuation_data_get = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { subcode, Eva_Id, valuation_type, barcode, Dep_Name } = req.body;
  flname = `val_data_${Dep_Name}`;
  const examminer_valuation_data = await db[flname].findAll({
    where: {
      subcode: subcode,
      eva_id: Eva_Id,
      valuation_type: valuation_type,
      barcode: barcode,
    },
    order: [
      ["section", "ASC"],
      ["sub_section", "ASC"],
      ["add_sub_section", "ASC"],
    ],
  });
  if (!examminer_valuation_data || examminer_valuation_data.length === 0) {
    res.status(404);
    throw new AppError("Examminer Valuation Data not found", 404);
  }
  res.status(200).json({ data: examminer_valuation_data });
});

const examiner_review_data_get = asyncHandler(async (req, res) => {
  const {
    subcode,
    Eva_Id,
    Dep_Name,
    Eva_Mon_Year,
    valuation_type,
    Examiner_type,
  } = req.query;

  const flname_import = `import${valuation_type}`;
  const model_import = db[flname_import];
  let import_record = await model_import.findAll({
    where: {
      subcode: subcode,
      Eva_Mon_Year: Eva_Mon_Year,
      Evaluator_Id: Eva_Id,
      Dep_Name: Dep_Name,
      Checked: "Yes",
    },
    order: [
      ["checkdate", "DESC"],
      ["subcode", "ASC"],
      ["barcode", "ASC"],
    ],
  });
  res
    .status(200)
    .json({
      message: "Import record fetched successfully",
      data: import_record,
    });
});

const examiner_review_value_data_get = asyncHandler(async (req, res) => {
  const {
    subcode,
    barcode,
    Dep_Name,
    Eva_Id,
    Eva_Mon_Year,
    valuation_type,
    Examiner_type,
  } = req.query;

  console.log(req.query);

  const flname = `val_data_${Dep_Name}`;
  const model = db[flname];
  let valuation_data = await model.findAll({
    where: {
      barcode: barcode,
      subcode: subcode,
      eva_id: Eva_Id,
      Eva_Mon_Year: Eva_Mon_Year,
      valuation_type: valuation_type,
      Examiner_type: Examiner_type,

    },
    order: [
      ["qbno", "ASC"],
      ["section", "ASC"],
      ["sub_section", "ASC"],
      ["add_sub_section", "ASC"],
    ],
  });

  res
    .status(200)
    .json({
      message: "Examiner review value data fetched successfully",
      data: valuation_data,
    });
});

module.exports = {
  subcode_Fetech,
  valuation_Barcode_Fetch,
  valuation_Image_Fetch,
  valuation_Data_Update,
  examminer_valuation_data_get,
  valuation_Finalize,
  examiner_review_data_get,
  examiner_review_value_data_get,
};
