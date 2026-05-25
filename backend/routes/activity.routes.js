import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getWorkspaceActivity } from '../controllers/activity.controller.js';

const router = Router();
router.use(auth);

router.get('/workspace/:workspaceId', getWorkspaceActivity);

export default router;