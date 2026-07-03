import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  
  // Updated enum to perfectly match your new professional standard
  role: { 
    type: String, 
    enum: ['Owner', 'Admin', 'Contributor', 'Member', 'Viewer'], 
    default: 'Member' 
  },
  
  token: { type: String, required: true, unique: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: Date,
  accepted: { type: Boolean, default: false },
});

inviteSchema.index({ workspaceId: 1, accepted: 1 });
inviteSchema.set('toJSON', { 
  transform: (doc, ret) => { 
    ret.id = ret._id.toString(); 
    delete ret.__v; 
    return ret; 
  } 
});

export default mongoose.model('Invite', inviteSchema);