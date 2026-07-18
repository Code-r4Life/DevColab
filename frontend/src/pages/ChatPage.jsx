import { useState, useEffect } from 'react';
import api from "../lib/api";
import ChatRoom from "../components/ui/ChatRoom.jsx";
import { Spinner, Button, Input, Modal } from "../components/ui";
import { useWorkspace } from "../context/useWorkspace"; 
import { useAuth } from "../context/useAuth"; 
import { Plus, Trash2 } from "lucide-react"; // <-- Added Trash2 icon

const ChatPage = () => {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth(); 
  
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    channelToDelete: null
  });

  const currentWorkspaceId = currentWorkspace?._id || currentWorkspace?.id;

  const loadChannels = async () => {
    if (!currentWorkspaceId) return;
    
    try {
      setLoading(true);
      const res = await api.get(`/chat/workspace/${currentWorkspaceId}/channels`);
      const fetchedChannels = res.data.channels || [];
      
      setChannels(fetchedChannels);
      
      if (fetchedChannels.length > 0 && !activeChannel) {
        setActiveChannel(fetchedChannels[0]);
      }
    } catch (error) {
      console.error("Failed to load channels", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, [currentWorkspaceId]);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim() || !currentWorkspaceId || !user) return;

    try {
      const res = await api.post('/chat/channels', {
        name: newChannelName.toLowerCase().replace(/\s+/g, '-'), 
        workspaceId: currentWorkspaceId,
        description: "Team discussion channel",
        createdBy: user._id || user.id 
      });
      
      const createdChannel = res.data.channel || res.data;
      
      setChannels(prev => [...prev, createdChannel]);
      setActiveChannel(createdChannel);
      setIsCreating(false);
      setNewChannelName("");
    } catch (error) {
      console.error("Failed to create channel", error);
    }
  };

  // NEW: Delete Channel Function
  const handleDeleteChannel = (e, channelId) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      channelToDelete: channelId
    });
  };

  const confirmDeleteChannel = async () => {
    const channelId = confirmModal.channelToDelete;
    if (!channelId) return;
    try {
      await api.delete(`/chat/channels/${channelId}`);
      setChannels(prev => prev.filter(c => c._id !== channelId));
      if (activeChannel?._id === channelId) {
        setActiveChannel(null);
      }
      setConfirmModal({ isOpen: false, channelToDelete: null });
    } catch (error) {
      console.error("Failed to delete channel", error);
    }
  };

  if (!currentWorkspaceId) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 h-screen">
        Loading workspace data...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#070709] text-white">
      {/* Left Sidebar: Channel List */}
      <div className="w-64 border-r border-white/10 bg-white/[0.02] flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-bold text-lg">Team Channels</h2>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="text-zinc-400 hover:text-white transition-colors p-1 bg-white/5 rounded-md"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* New Channel Input Form */}
        {isCreating && (
          <div className="p-3 border-b border-white/10 bg-black/20">
            <form onSubmit={handleCreateChannel} className="flex flex-col gap-2">
              <Input 
                autoFocus
                placeholder="e.g. engineering" 
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="flex-1 text-xs py-1" disabled={!newChannelName.trim()}>Create</Button>
              </div>
            </form>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="flex justify-center p-4"><Spinner size="sm" /></div>
          ) : channels.length === 0 ? (
            <div className="text-center mt-6">
              <p className="text-sm text-zinc-500 mb-3">No channels yet.</p>
              <Button size="sm" variant="secondary" onClick={() => setIsCreating(true)}>
                Create the first one
              </Button>
            </div>
          ) : (
            channels.map((channel) => (
              // NEW: Added a group wrapper for hover effects
              <div key={channel._id} className="group relative flex items-center">
                <button
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                    activeChannel?._id === channel._id 
                      ? 'bg-indigo-600/20 text-indigo-400 font-medium' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-lg opacity-50">#</span>
                  <span className="flex-1 truncate pr-6">{channel.name}</span>
                </button>
                
                {/* NEW: Delete Button (Appears on Hover) */}
                <button
                  onClick={(e) => handleDeleteChannel(e, channel._id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity rounded"
                  title="Delete Channel"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Main Area: The Chat Room (Message Box) */}
      <div className="flex-1 flex flex-col bg-white/[0.01]">
        {activeChannel ? (
          <>
            <div className="p-4 border-b border-white/10 flex items-center gap-2 h-[65px]">
              <span className="text-xl text-zinc-500">#</span>
              <h2 className="font-bold text-lg">{activeChannel.name}</h2>
              {activeChannel.description && (
                <span className="text-sm text-zinc-500 ml-2 border-l border-white/10 pl-2">
                  {activeChannel.description}
                </span>
              )}
            </div>
            {/* THIS IS YOUR MESSAGE BOX COMPONENT! */}
            <div className="flex-1 p-0 overflow-hidden">
              <div className="h-full w-full">
                <ChatRoom channelId={activeChannel._id} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500 flex-col gap-4">
            <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Create or select a channel to start chatting</p>
          </div>
        )}
    </div>
      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, channelToDelete: null })}
        title="Delete Channel"
        footer={
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => setConfirmModal({ isOpen: false, channelToDelete: null })}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDeleteChannel}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-300">
          Are you sure you want to delete this channel? All messages will be lost permanently. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ChatPage;