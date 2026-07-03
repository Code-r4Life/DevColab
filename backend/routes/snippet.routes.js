import { Router } from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { createSnippet, deleteSnippet, getSnippet, listSnippets, updateSnippet } from '../controllers/snippet.controller.js';

const router = Router();
router.use(auth);
router.post('/', roleCheck('Owner', 'Admin', 'Contributor', 'Member'), createSnippet);
router.get('/project/:projectId', roleCheck('Owner', 'Admin', 'Contributor', 'Member'), listSnippets);
router.get('/:snippetId', getSnippet);
router.put('/:snippetId', updateSnippet);
router.delete('/:snippetId', deleteSnippet);

export default router;