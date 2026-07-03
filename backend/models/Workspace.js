import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { 
    type: String, 
    // The new 5 professional roles requested by your leader
    enum: ['Owner', 'Admin', 'Contributor', 'Member', 'Viewer'], 
    default: 'Member' 
  },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatar: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  createdAt: { type: Date, default: Date.now },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

workspaceSchema.virtual('projectCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'workspaceId',
  count: true,
});

workspaceSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

workspaceSchema.pre('save', function (next) {
  const seen = new Set();
  this.members = this.members.filter((m) => {
    if (!m.userId) return false;
    const id = m.userId.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  next();
});

export default mongoose.model('Workspace', workspaceSchema);