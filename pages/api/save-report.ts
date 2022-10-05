// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import multiparty from "multiparty";
import xlsx from "node-xlsx";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  const form = new multiparty.Form();
  const data: any = await new Promise((resolve, reject) => {
    form.parse(req, function (err, fields, files) {
      if (err) reject({ err });
      resolve({ fields, files });
    });
  });
  const files = data.files;
  const file = files.blob[0];
  if (file?.size > 0) {
    const fileObj = xlsx.parse(file.path);
    const parseFile = fileObj[0].data;
    const [, ...rows] = parseFile;
    if (rows.length > 0) {
      const pool = require("../../lib/db");
      try {
        rows.map(async (item: any) => {
          await pool.query(
            "INSERT INTO WEEKLY_INVENTORY(PartNumber, BuildSequence, BalloonNumber, Qty, PONo, VendorNo, PackingDiskNo, Linea) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [
              item[0],
              item[1],
              item[2],
              item[3],
              item[4],
              item[5],
              item[6],
              item[7],
            ]
          );
        });
        return res
          .status(200)
          .json({ message: "The file was successfully updated" });
      } catch (err) {
        return res.status(500).json({ message: err });
      }
    }

    return res.status(400).json({ message: "Document not valid" });
  }

  return res.status(500).json({ message: "File not found" });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
