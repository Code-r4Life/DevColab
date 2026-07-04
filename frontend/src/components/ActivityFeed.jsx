import { useEffect, useState } from 'react';
import api, { unwrap } from '../lib/api';

const ActivityFeed = ({ workspaceId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = unwrap(await api.get(`/activity/workspace/${workspaceId}`));
        setActivities(data.activities || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load activity feed');
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchActivities();
    }
  }, [workspaceId]);

  if (loading) return <div className="p-4 text-gray-500">Loading activity history...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (activities.length === 0) return <div className="p-4 text-gray-500">No activity yet. Trigger an action to see it here!</div>;

  return (
    <div className="bg-white dark:bg-black/20 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-dark-border">
      <div className="space-y-4">
        {activities.map((log) => (
          <div key={log._id} className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              {log.userId?.name ? log.userId.name.charAt(0).toUpperCase() : '?'}
            </div>
            
            {/* Log Content */}
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <span className="font-semibold">{log.userId?.name || 'Unknown User'}</span>
                {' '}
                <span className="text-gray-500">{formatActionText(log.action)}</span>
                {' '}
                <span className="font-medium text-primary">{log.entityName}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatActionText = (action) => {
  const dictionary = {
    'project.created': 'created the project',
    'project.updated': 'updated the project',
    'project.deleted': 'deleted the project',
    'project.member_added': 'added a member to project',
  };
  return dictionary[action] || 'modified';
};

export default ActivityFeed;