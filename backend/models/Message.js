import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        url: String,
        fileType: String,
        name: String,
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    }
  },
  { timestamps: true }
);
messageSchema.index({ channelId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;