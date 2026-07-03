import Workspace from '../models/Workspace.js'; 

const roleCheck = (...allowedRoles) => {
  return async (req, res, next) => {
    try {

      const workspaceId = req.params.workspaceId || req.body.workspaceId;
      
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      const member = workspace.members.find(
        (m) => (m.userId?._id || m.userId).toString() === req.user._id.toString()
      );

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied: This action requires one of the following roles: ${allowedRoles.join(', ')}` 
        });
      }

      req.user.role = member.role; 
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error checking role' });
    }
  };
};

export default roleCheck;