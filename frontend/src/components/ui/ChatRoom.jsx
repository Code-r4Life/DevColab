import React, { useState, useEffect, useRef } from 'react';
import { chatSocket } from '../../lib/socket';
import api from '../../lib/api'; 
import { useAuth } from '../../context/useAuth'; 
import { Button, Textarea, Avatar, Spinner } from './index';

const ChatRoom = ({ channelId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!channelId) return;

    const room = channelId.toString();

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/chat/channels/${room}/messages`);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Failed to load message history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    if (!chatSocket.connected) {
      chatSocket.connect();
    }
    
    chatSocket.emit('join_channel', room);

    const handleReceiveMessage = (message) => {
      if (message.channelId === room || message.channelId?._id === room) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleUserTyping = ({ userName }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(userName);
        return newSet;
      });
    };

    const handleUserStoppedTyping = ({ userName }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userName);
        return newSet;
      });
    };

    chatSocket.on('receive_message', handleReceiveMessage);
    chatSocket.on('user_typing', handleUserTyping);
    chatSocket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      chatSocket.emit('leave_channel', room);
      chatSocket.off('receive_message', handleReceiveMessage);
      chatSocket.off('user_typing', handleUserTyping);
      chatSocket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [channelId]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (channelId) {
      chatSocket.emit('typing', { channelId: channelId.toString(), userName: user?.name });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        chatSocket.emit('stop_typing', { channelId: channelId.toString(), userName: user?.name });
      }, 2000);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId) return;

    const messageData = {
      channelId: channelId.toString(),
      senderId: user?._id || user?.id,
      content: newMessage.trim(),
    };

    chatSocket.emit('send_message', messageData);
    
    chatSocket.emit('stop_typing', { channelId: channelId.toString(), userName: user?.name });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-[600px] surface border border-light-border dark:border-dark-border rounded-lg shadow-sm w-full max-w-4xl mx-auto overflow-hidden">
      
      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-900/20">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
            <Avatar name="Channel" size="lg" className="opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId?._id === (user?._id || user?.id);
            
            return (
              <div key={msg._id || idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isMe && (
                  <Avatar 
                    name={msg.senderId?.name} 
                    src={msg.senderId?.avatar} 
                    size="sm" 
                    className="mt-1"
                  />
                )}
                
                {/* Message Bubble */}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[11px] font-medium text-gray-500 mb-1 ml-1">
                      {msg.senderId?.name || 'Unknown User'}
                    </span>
                  )}
                  <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    isMe 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'surface border border-light-border dark:border-dark-border rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 italic animate-fade-in pl-12">
            <Spinner size="sm" className="border-gray-400" />
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="p-4 surface border-t border-light-border dark:border-dark-border">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send)"
              className="min-h-[44px] max-h-[120px] py-3 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={!newMessage.trim()}
            className="mb-1 rounded-xl px-6"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;