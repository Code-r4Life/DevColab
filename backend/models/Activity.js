import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  action: { type: String, required: true },
  
  entityType: { type: String, required: true }, 
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityName: { type: String, required: true },
  
  timestamp: { type: Date, default: Date.now, index: true },
});

activitySchema.index({ workspaceId: -1, timestamp: -1 });

export default mongoose.model('Activity', activitySchema);