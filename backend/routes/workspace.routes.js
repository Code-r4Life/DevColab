import { Router } from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import {
  changeMemberRole,
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  listMembers,
  listWorkspaces,
  removeMember,
  updateWorkspace,
} from '../controllers/workspace.controller.js';

const router = Router();

router.use(auth);

router.post('/', createWorkspace);
router.get('/', listWorkspaces);
router.get('/:workspaceId', roleCheck('Owner', 'Admin', 'Contributor', 'Member'), getWorkspace);
router.put('/:workspaceId', roleCheck('Owner', 'Admin'), updateWorkspace);
router.delete('/:workspaceId', roleCheck('Owner'), deleteWorkspace);
router.get('/:workspaceId/members', roleCheck('Owner', 'Admin', 'Contributor', 'Member'), listMembers);
router.put('/:workspaceId/members/:userId/role', roleCheck('Owner', 'Admin'), changeMemberRole);
router.delete('/:workspaceId/members/:userId', roleCheck('Owner', 'Admin'), removeMember);

export default router;