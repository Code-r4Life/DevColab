import { Router } from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../controllers/project.controller.js';

const router = Router();
router.use(auth);
router.post('/', roleCheck('Owner', 'Admin', 'Contributor', 'Member'), createProject)
router.get('/workspace/:workspaceId', roleCheck('Owner', 'Admin', 'Contributor', 'Member'), listProjects);
router.get('/:projectId', roleCheck('Owner', 'Admin', 'Contributor', 'Member'), getProject);
router.put('/:projectId', roleCheck('Owner', 'Admin'), updateProject);
router.delete('/:projectId', roleCheck('Owner', 'Admin'), deleteProject);

export default router;