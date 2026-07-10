import Channel from '../models/Channel.js';
import Message from '../models/Message.js';
import asyncHandler from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/http.js';

export const getWorkspaceChannels = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const channels = await Channel.find({ workspaceId }).sort({ createdAt: 1 });
  
  return ok(res, { channels });
});

export const createChannel = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { name, description, isPrivate } = req.body;
  const targetId = req.user._id || req.user.id;

  const channel = await Channel.create({
    name: name.toLowerCase().replace(/\s+/g, '-'), 
    description,
    workspaceId,
    isPrivate: isPrivate || false,
    createdBy: targetId,
    members: [targetId]
  });

  return ok(res, { channel }, 201);
});

export const getChannelMessages = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const messages = await Message.find({ channelId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('senderId', 'name avatar email');
  return ok(res, { messages: messages.reverse() });
});