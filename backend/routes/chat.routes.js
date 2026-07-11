import express from 'express';
import Channel from '../models/Channel.js'; 
import Message from '../models/Message.js';

const router = express.Router();

// 1. Create a new channel
router.post('/channels', async (req, res) => {
  try {
    const { name, workspaceId, description, createdBy } = req.body; 

    const newChannel = new Channel({
      name,
      workspaceId,
      description,
      createdBy 
    });

    await newChannel.save();
    res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ message: "Server error while creating channel" });
  }
});

// 2. Get all channels for a specific workspace
router.get('/workspace/:workspaceId/channels', async (req, res) => {
  try {
    const channels = await Channel.find({ workspaceId: req.params.workspaceId });
    res.status(200).json({ channels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ message: "Server error while fetching channels" });
  }
});

// 3. Get all messages for a specific channel
router.get('/channels/:channelId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ channelId: req.params.channelId })
      .populate('senderId', 'name avatar email') 
      .sort({ createdAt: 1 });
      
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
});

// 4. NEW: Delete a channel and its messages
router.delete('/channels/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    
    // Delete the channel
    await Channel.findByIdAndDelete(channelId);
    
    // Clean up: Delete all messages that belonged to this channel
    await Message.deleteMany({ channelId });
    
    res.status(200).json({ message: 'Channel and associated messages deleted successfully' });
  } catch (error) {
    console.error("Error deleting channel:", error);
    res.status(500).json({ message: "Server error while deleting channel" });
  }
});

export default router;