import Workspace from '../models/Workspace.js'; 

const roleCheck = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
      
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }

      const currentUserId = (req.user?.id || req.user?._id)?.toString();

      const member = workspace.members.find(
        (m) => (m.userId?._id || m.userId)?.toString() === currentUserId
      );

      const hasRole = member && allowedRoles.some(
        role => role.toLowerCase() === member.role?.toLowerCase()
      );

      if (!member || !hasRole) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied: You are ${member ? `a ${member.role}` : 'not a member of this workspace'}. Required: ${allowedRoles.join(', ')}` 
        });
      }

      req.user.role = member.role; 
      next();
    } catch (error) {
      console.error("RoleCheck Middleware Error:", error);
      return res.status(500).json({ success: false, message: 'Error checking role' });
    }
  };
};

export default roleCheck;