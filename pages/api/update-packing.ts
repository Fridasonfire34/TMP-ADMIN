// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pool = require("../../lib/db");

  try {
    const query = req.query;
    const { qty, id, part } = query;

    if (qty && id && part) {
      const allTasks = await pool.query(
        "UPDATE WEEKLY_INVENTORY SET qty = $1 WHERE packingdiskno = $2 and PartNumber = $3",
        [qty, id, part]
      );
      return res.status(200).json(allTasks.rows);
    }

    return res.status(400).json({
      message: "Bad Request",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
