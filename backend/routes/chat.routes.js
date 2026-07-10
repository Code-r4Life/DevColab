import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createChannel, getWorkspaceChannels, getChannelMessages } from '../controllers/chat.controller.js';

const router = Router()
router.use(auth)
router.get('/workspace/:workspaceId/channels', getWorkspaceChannels);
router.post('/workspace/:workspaceId/channels', createChannel)
router.get('/channels/:channelId/messages', getChannelMessages);

export default router;