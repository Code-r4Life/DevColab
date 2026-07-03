import { Router } from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { getWorkspaceActivity } from '../controllers/activity.controller.js';

const router = Router();

router.use(auth);
router.get('/workspace/:workspaceId', roleCheck('Owner', 'Admin', 'Contributor', 'Member'), getWorkspaceActivity);

export default router;