// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pool = require("../../lib/db");

  try {
    const allTasks = await pool.query("TRUNCATE WEEKLY_INVENTORY");
    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
