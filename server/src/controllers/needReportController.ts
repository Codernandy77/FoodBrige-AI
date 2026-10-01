import { Response } from 'express';
import { NeedReportModel } from '../models/NeedReport';
import { AuthenticatedRequest } from '../middleware/auth';
import { ActivityLogModel } from '../models/ActivityLog';

export const createNeedReport = async (req: AuthenticatedRequest, res: Response) => {
  const { areaName, needLevel, servingsNeeded, latitude, longitude, details } = req.body;
  const userId = req.user?.id;
  const reporterName = req.user?.name || 'Partner';

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (!areaName || !needLevel || !servingsNeeded || !latitude || !longitude) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const report = await NeedReportModel.create({
      userId,
      reporterName,
      areaName,
      needLevel,
      servingsNeeded: Number(servingsNeeded),
      latitude: Number(latitude),
      longitude: Number(longitude),
      details
    });

    await ActivityLogModel.create({
      userId,
      action: 'NEED_REPORT_CREATE',
      details: `Reported hunger need in area ${areaName} (Level: ${needLevel})`
    });

    return res.status(201).json({ success: true, report });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getNeedReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await NeedReportModel.find({});
    return res.json(reports);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
