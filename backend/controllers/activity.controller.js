import ActivityLog from '../models/ActivityLog.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/http.js';

export const getWorkspaceActivity = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  if (!workspaceId) return fail(res, 'Workspace ID parameter is required', 422);

  const activities = await ActivityLog.find({ workspaceId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20);

  return ok(res, { activities });
});