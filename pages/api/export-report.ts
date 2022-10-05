// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument, { text } from "pdfkit";
import fs from "fs";
import path from "path";
import { Base64Encode } from "base64-stream";

function createDirectories(pathname: string) {
  const __dirname = path.resolve();
  pathname = pathname.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ""); // Remove leading directory markers, and remove ending /file-name.extension
  fs.mkdir(path.resolve(__dirname, pathname), { recursive: true }, (e) => {
    if (e) {
      console.error(e);
    } else {
      console.log("Success");
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query;
  const { id } = query;

  try {
    if (id && id.length) {
      const pool = require("../../lib/db");
      const allTasks = await pool.query(
        "SELECT * FROM WEEKLY_INVENTORY WHERE PackingDiskNo = $1",
        [id]
      );
      if (allTasks?.rows.length) {
        await pool.query(
          "UPDATE WEEKLY_INVENTORY SET UpdateAt = $1 WHERE PackingDiskNo = $2",
          [new Date(), id]
        );
        const { rows } = allTasks;
        const items = rows.filter((value: any) => Number(value.qty) > 0);
        if (items?.length) {
          const doc = new PDFDocument();
          var finalString = "";
          var stream = doc.pipe(new Base64Encode());
          createDirectories("/src/reports");

          var dir = fs.createWriteStream(`src/reports/report-${id}.pdf`);
          doc.pipe(dir);
          doc
            .fontSize(27)
            .text(
              `Kit ${id} Incompleto. Piezas pendientes por verificar:`,
              100,
              70
            );
            doc.fontSize(15).text(`${new Date()}`,100,150);
          doc.text("", 100, 100);
          const k_TABLE_TOP_Y=200;
          const _kPART_X = 100;
          const _kQuty_X = 450;
          doc
          .fontSize(15)
          .text(
            'Piezas:',_kPART_X, k_TABLE_TOP_Y
          )
          .text(
            'Cantidad',_kQuty_X,k_TABLE_TOP_Y,
          );
          if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const _kItem_X = 100;
              const _kQty_X = 450;
              let yCoord = k_TABLE_TOP_Y + 25 + (i * 25);
              doc
                .fontSize(15)
                .text(
                  `${item.partnumber}`,_kItem_X,yCoord)
                .text(
                  `${item.qty}`, _kQty_X, yCoord,)
            }
          }
          doc.end();

          stream.on("data", function (chunk) {
            finalString += chunk;
          });

          stream.on("end", () => {
            res.json({
              blob: finalString,
            });
          });

          return;
        } else {
          const doc = new PDFDocument();
          var finalString = "";
          var stream = doc.pipe(new Base64Encode());

          doc.pipe(fs.createWriteStream(`file-${id}.pdf`));
          doc.fontSize(27).text(`Kit ${id} completo`, 100, 100);
          doc.fontSize(15).text(`${new Date()}`, 100, 200);
          doc.end();

          stream.on("data", function (chunk) {
            finalString += chunk;
          });

          stream.on("end", () => {
            return res.json({
              blob: finalString,
            });
          });

          return;
        }
      }
      return res.status(404).json({ message: "Not found ID" });
    }
    return res.status(400).json({ message: "There was a error" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
