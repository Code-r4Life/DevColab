import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import {
  changeMemberRole,
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  listMembers,
  listWorkspaces,
  removeMember,
  updateWorkspace,
  upgradeWorkspacePlan, // Imported your new subcription tier update method
} from '../controllers/workspace.controller.js';

const router = Router();

// Apply global JWT authentication mapping check to all internal workspace paths
router.use(auth);

// Base Collection Routing Actions
router.post('/', createWorkspace);
router.get('/', listWorkspaces);

// Operational Subscription Plan Tier Control Route
router.put('/:workspaceId/upgrade', requireRole('owner'), upgradeWorkspacePlan);

// Individual Workspace Document Instance Control Targets
router.get('/:workspaceId', requireRole('viewer'), getWorkspace);
router.put('/:workspaceId', requireRole('admin'), updateWorkspace);
router.delete('/:workspaceId', requireRole('owner'), deleteWorkspace);

// Team Member Matrix Management Configuration Slugs
router.get('/:workspaceId/members', requireRole('viewer'), listMembers);
router.put('/:workspaceId/members/:userId/role', requireRole('admin'), changeMemberRole);
router.delete('/:workspaceId/members/:userId', requireRole('admin'), removeMember);

export default router;