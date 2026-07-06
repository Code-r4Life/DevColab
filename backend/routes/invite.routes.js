import { Router } from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { acceptInvite, createInvite, listPendingInvites, validateInvite, deleteInvite } from '../controllers/invite.controller.js';

const router = Router();

router.get('/accept/:token', validateInvite);
router.post('/accept/:token', auth, acceptInvite);

router.post('/', auth, roleCheck('Owner', 'Admin'), createInvite);
router.get('/workspace/:workspaceId', auth, roleCheck('Owner', 'Admin'), listPendingInvites);
router.delete('/:id', auth, roleCheck('Owner', 'Admin'), deleteInvite);

export default router;