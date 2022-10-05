// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pool = require("../../lib/db");

  try {
    const allTasks = await pool.query("SELECT * FROM WEEKLY_INVENTORY");
    return res.status(200).json(allTasks.rows);
  } catch (error) {
    return res.status(400).json({ name: "Not found data" });
  }
}
