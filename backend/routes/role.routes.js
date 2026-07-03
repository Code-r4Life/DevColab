import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.put(
  '/update', 
  auth, 
  roleCheck('Owner', 'Admin'), 
  async (req, res) => {
    try {
      const { targetUserId, newRole } = req.body;

      const validRoles = ['Owner', 'Admin', 'Contributor', 'Member', 'Viewer'];
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({ success: false, message: 'Invalid role provided' });
      }

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (newRole === 'Owner' && req.user.role !== 'Owner') {
        return res.status(403).json({ 
          success: false, 
          message: 'Only an Owner can grant Owner privileges' 
        });
      }

      if (targetUser.role === 'Owner' && req.user.role !== 'Owner') {
        return res.status(403).json({ 
          success: false, 
          message: 'Only an Owner can change another Owner\'s role' 
        });
      }

      targetUser.role = newRole;
      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: `Successfully updated ${targetUser.name}'s role to ${newRole}`,
        user: {
          id: targetUser._id,
          name: targetUser.name,
          role: targetUser.role
        }
      });

    } catch (error) {
      console.error('Role Update Error:', error);
      return res.status(500).json({ success: false, message: 'Server error while updating role' });
    }
  }
);

export default router;