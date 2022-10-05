// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const pool = require("../../lib/db");

  try {
    const allTasks = await pool.query("SELECT * FROM WEEKLY_INVENTORY");
    return res.status(200).json(allTasks.rows);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({ name: "Test Demo" });
}
