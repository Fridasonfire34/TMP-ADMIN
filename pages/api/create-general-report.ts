// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import excel from "exceljs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pool = require("../../lib/db");

  try {
    const allTasks = await pool.query("SELECT * FROM WEEKLY_INVENTORY");
    const { rows } = allTasks;
    if (rows?.length) {
      const items = rows.filter((value: any) => Number(value.qty) > 0);
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("General Report");
      worksheet.columns = [
        { header: "Part Number", key: "partnumber", width: 10 },
        { header: "Build Sequence", key: "buildsequence", width: 10 },
        { header: "Balloon Number", key: "balloonnumber", width: 10 },
        { header: "Quantity", key: "qty", width: 10 },
        { header: "PO No.", key: "pono", width: 10 },
        { header: "Vendor No.", key: "vendorno", width: 10 },
        { header: "Packing Disk No.", key: "packingdiskno", width: 10 },
        { header: "Linea", key: "linea", width: 10 },
        { header: "Update At", key: "updateat", width: 10 },
      ];
      worksheet.addRows(items);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + `general_report_${new Date()}.xlsx`
      );

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    }
    return res.status(404).json({ message: "Not records found" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "There was a error" });
  }
}
