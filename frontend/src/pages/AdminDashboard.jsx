import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart3,
  Calendar,
  Send,
  X,
  Search,
  Filter,
  Download,
  Bell,
  User,
  Home,
  LogOut,
  Menu
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const { user, api, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResources: 0,
    totalApplications: 0,
    pendingApplications: 0
  });

  // Resources state
  const [resources, setResources] = useState([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'internship',
    category: 'technology',
    requirements: {
      education: '',
      experience: '',
      skills: '',
      other: ''
    },
    details: {
      company: '',
      location: '',
      duration: '',
      stipend: '',
      contactEmail: '',
      website: ''
    },
    applicationDeadline: '',
    startDate: '',
    maxApplications: '',
    tags: ''
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    targetAudience: {
      roles: ['user'],
      categories: []
    },
    expiresAt: ''
  });

  // Applications state
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);

  // Recent announcements for notifications
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'applications', label: 'Applications', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: User }
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadResources(),
        loadApplications(),
        loadUsers(),
        loadAnnouncements()
      ]);
    } catch (error) {
      showMessage('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const loadStats = async () => {
    try {
      const [userStats, resourceStats, appStats] = await Promise.all([
        api.get('/users/stats'),
        api.get('/resources/admin/stats'),
        api.get('/applications/stats')
      ]);

      setStats({
        totalUsers: userStats.data.data.overview.totalUsers,
        totalResources: resourceStats.data.data.overview.totalResources,
        totalApplications: appStats.data.data.overview.total || 0,
        pendingApplications: appStats.data.data.overview.pending || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await api.get('/resources?limit=50');
      setResources(response.data.data || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await api.get('/applications?limit=50');
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users?limit=50');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await api.get('/announcements/admin/all?limit=50');
      const allAnnouncements = response.data.data || [];
      setAnnouncements(allAnnouncements);
      
      // Get recent announcements (last 7 days) for notifications
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recent = allAnnouncements.filter(announcement => 
        new Date(announcement.createdAt) >= sevenDaysAgo
      ).slice(0, 5); // Show only latest 5
      
      setRecentAnnouncements(recent);
      setUnreadNotifications(recent.length);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  };

  // Resource CRUD Operations
  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const resourceData = {
        ...resourceForm,
        requirements: {
          ...resourceForm.requirements,
          skills: resourceForm.requirements.skills.split(',').map(s => s.trim()).filter(s => s)
        },
        tags: resourceForm.tags.split(',').map(t => t.trim()).filter(t => t),
        maxApplications: resourceForm.maxApplications ? parseInt(resourceForm.maxApplications) : null
      };

      let response;
      if (editingResource) {
        response = await api.put(`/resources/${editingResource._id}`, resourceData);
        showMessage('Resource updated successfully');
      } else {
        response = await api.post('/resources', resourceData);
        showMessage('Resource created successfully');
      }
      
      setShowResourceModal(false);
      resetResourceForm();
      await loadResources();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save resource';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setResourceForm({
      title: resource.title || '',
      description: resource.description || '',
      type: resource.type || 'internship',
      category: resource.category || 'technology',
      requirements: {
        education: resource.requirements?.education || '',
        experience: resource.requirements?.experience || '',
        skills: Array.isArray(resource.requirements?.skills) ? resource.requirements.skills.join(', ') : '',
        other: resource.requirements?.other || ''
      },
      details: {
        company: resource.details?.company || '',
        location: resource.details?.location || '',
        duration: resource.details?.duration || '',
        stipend: resource.details?.stipend || '',
        contactEmail: resource.details?.contactEmail || '',
        website: resource.details?.website || ''
      },
      applicationDeadline: resource.applicationDeadline ? new Date(resource.applicationDeadline).toISOString().split('T')[0] : '',
      startDate: resource.startDate ? new Date(resource.startDate).toISOString().split('T')[0] : '',
      maxApplications: resource.maxApplications?.toString() || '',
      tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : ''
    });
    setShowResourceModal(true);
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await api.delete(`/resources/${resourceId}`);
      showMessage('Resource deleted successfully');
      await loadResources();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete resource';
      showMessage(errorMessage, 'error');
    }
  };

  const resetResourceForm = () => {
    setResourceForm({
      title: '',
      description: '',
      type: 'internship',
      category: 'technology',
      requirements: {
        education: '',
        experience: '',
        skills: '',
        other: ''
      },
      details: {
        company: '',
        location: '',
        duration: '',
        stipend: '',
        contactEmail: '',
        website: ''
      },
      applicationDeadline: '',
      startDate: '',
      maxApplications: '',
      tags: ''
    });
    setEditingResource(null);
  };

  // Announcement Operations
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await api.post('/announcements', announcementForm);
      showMessage('Announcement sent successfully');
      setShowAnnouncementModal(false);
      resetAnnouncementForm();
      await loadAnnouncements();
      
      // Increment unread notifications when new announcement is created
      setUnreadNotifications(prev => prev + 1);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send announcement';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      targetAudience: {
        roles: ['user'],
        categories: []
      },
      expiresAt: ''
    });
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await api.delete(`/announcements/${announcementId}`);
      showMessage('Announcement deleted successfully');
      await loadAnnouncements();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete announcement';
      showMessage(errorMessage, 'error');
    }
  };

  // Application Operations
  const handleApplicationAction = async (applicationId, action, notes = '') => {
    try {
      await api.put(`/applications/${applicationId}/review`, {
        status: action,
        reviewNotes: notes
      });
      
      showMessage(`Application ${action} successfully`);
      await loadApplications();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${action} application`;
      showMessage(errorMessage, 'error');
    }
  };

  // User Operations
  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/status`);
      showMessage('User status updated successfully');
      await loadUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update user status';
      showMessage(errorMessage, 'error');
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      // Mark notifications as read when dropdown opens
      setUnreadNotifications(0);
    }
  };

  // Close notification dropdown when clicking outside
  const closeNotificationDropdown = () => {
    setNotificationOpen(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-white font-semibold text-lg">Career Hub</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{user?.name || 'Admin'}</p>
                <p className="text-slate-400 text-xs">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'resources' && 'Resource Management'}
                  {activeTab === 'applications' && 'Application Reviews'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'announcements' && 'Announcements'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === 'overview' && 'Monitor your platform performance and statistics'}
                  {activeTab === 'resources' && 'Create and manage job opportunities and resources'}
                  {activeTab === 'applications' && 'Review and manage user applications'}
                  {activeTab === 'users' && 'Manage user accounts and permissions'}
                  {activeTab === 'announcements' && 'Send announcements and notifications to users'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
              
              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 relative"
                  onClick={handleNotificationClick}
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {(unreadNotifications > 0 || stats.pendingApplications > 0) && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                      {unreadNotifications + stats.pendingApplications}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={closeNotificationDropdown}
                    ></div>
                    
                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {/* Pending Applications */}
                        {stats.pendingApplications > 0 && (
                          <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {stats.pendingApplications} Pending Applications
                                </p>
                                <p className="text-xs text-gray-500">Applications waiting for review</p>
                              </div>
                              <button 
                                className="text-blue-600 text-sm font-medium hover:text-blue-800"
                                onClick={() => {
                                  setActiveTab('applications');
                                  setNotificationOpen(false);
                                }}
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Recent Announcements */}
                        {recentAnnouncements.length > 0 ? (
                          recentAnnouncements.map((announcement) => (
                            <div key={announcement._id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <MessageSquare className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 mb-1">
                                    {announcement.title}
                                  </p>
                                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {announcement.content}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={announcement.priority === 'high' ? 'danger' : announcement.priority === 'medium' ? 'warning' : 'gray'}>
                                      {announcement.priority}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {new Date(announcement.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          stats.pendingApplications === 0 && (
                            <div className="p-8 text-center">
                              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No new notifications</p>
                            </div>
                          )
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="p-3 border-t border-gray-200">
                        <button 
                          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => {
                            setActiveTab('announcements');
                            setNotificationOpen(false);
                          }}
                        >
                          View All Announcements
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {message && (
            <Alert 
              type={messageType} 
              message={message} 
              onClose={() => setMessage('')}
              className="mb-6"
            />
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Resources</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalResources}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Applications</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Bell className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </Card.Header>
                <Card.Body>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => {
                        setActiveTab('resources');
                        setShowResourceModal(true);
                      }}
                      className="justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Resource
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setActiveTab('announcements');
                        setShowAnnouncementModal(true);
                      }}
                      className="justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Announcement
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('applications')}
                      className="justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review Applications
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Resource Management</h2>
                <Button 
                  onClick={() => {
                    resetResourceForm();
                    setShowResourceModal(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Resource
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {resources.map(resource => (
                  <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                    <Card.Header>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {resource.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="primary">{resource.type}</Badge>
                            <Badge variant="gray">{resource.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p><strong>Company:</strong> {resource.details?.company || 'N/A'}</p>
                        <p><strong>Location:</strong> {resource.details?.location || 'N/A'}</p>
                        <p><strong>Deadline:</strong> {new Date(resource.applicationDeadline).toLocaleDateString()}</p>
                        <p>
                          <strong>Applications:</strong> {resource.currentApplications || 0}
                          {resource.maxApplications && ` / ${resource.maxApplications}`}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant={resource.status === 'active' ? 'success' : 'gray'}>
                          {resource.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditResource(resource)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteResource(resource._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {resources.length === 0 && (
                <Card className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
                  <p className="text-gray-600 mb-6">Create your first resource to get started.</p>
                  <Button onClick={() => setShowResourceModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Resource
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Application Reviews</h2>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">All</Button>
                  <Button size="sm" variant="outline">Pending</Button>
                  <Button size="sm" variant="outline">Approved</Button>
                  <Button size="sm" variant="outline">Rejected</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {applications.map(application => (
                  <Card key={application._id} className="hover:shadow-lg transition-shadow">
                    <Card.Header>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.resource?.title || 'Resource not found'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Applied by: {application.user?.name} ({application.user?.email})
                          </p>
                        </div>
                        <Badge variant={
                          application.status === 'pending' ? 'warning' :
                          application.status === 'approved' ? 'success' : 
                          application.status === 'rejected' ? 'danger' : 'gray'
                        }>
                          {application.status}
                        </Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Applied:</strong> {new Date(application.submittedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Type:</strong> {application.resource?.type || 'N/A'}
                          </p>
                        </div>
                        
                        {application.applicationData?.coverLetter && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Cover Letter:</p>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {application.applicationData.coverLetter}
                            </p>
                          </div>
                        )}
                        
                        {application.status === 'pending' && (
                          <div className="flex space-x-2 pt-3 border-t">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApplicationAction(application._id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleApplicationAction(application._id, 'rejected')}
                            >
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {applications.length === 0 && (
                <Card className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here when users start applying.</p>
                </Card>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
                <Button onClick={() => setShowAnnouncementModal(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Announcement
                </Button>
              </div>

              <div className="space-y-4">
                {announcements.map(announcement => (
                  <Card key={announcement._id}>
                    <Card.Body>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {announcement.title}
                            </h3>
                            <Badge variant={announcement.priority === 'high' ? 'danger' : announcement.priority === 'medium' ? 'warning' : 'gray'}>
                              {announcement.priority}
                            </Badge>
                            <Badge variant="primary">{announcement.type}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{announcement.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Published: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                            <span>Views: {announcement.views || 0}</span>
                            <span>Status: {announcement.status}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => handleDeleteAnnouncement(announcement._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {announcements.length === 0 && (
                <Card className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
                  <p className="text-gray-600 mb-6">Send your first announcement to users.</p>
                  <Button onClick={() => setShowAnnouncementModal(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Announcement
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Users
                </Button>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-5 h-5 text-primary-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.role === 'admin' ? 'warning' : 'primary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.isActive ? 'success' : 'danger'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              size="sm"
                              variant={user.isActive ? 'warning' : 'success'}
                              onClick={() => handleUserStatusToggle(user._id, user.isActive)}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {users.length === 0 && (
                <Card className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
                  <p className="text-gray-600">Users will appear here when they register.</p>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingResource ? 'Edit Resource' : 'Create New Resource'}
                </h2>
                <button
                  onClick={() => {
                    setShowResourceModal(false);
                    resetResourceForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleResourceSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Type *</label>
                    <select
                      value={resourceForm.type}
                      onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="internship">Internship</option>
                      <option value="job">Job</option>
                      <option value="course">Course</option>
                      <option value="mentorship">Mentorship</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    className="form-input"
                    rows="4"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      value={resourceForm.category}
                      onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="technology">Technology</option>
                      <option value="business">Business</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="marketing">Marketing</option>
                      <option value="design">Design</option>
                      <option value="engineering">Engineering</option>
                      <option value="finance">Finance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Company/Organization</label>
                    <input
                      type="text"
                      value={resourceForm.details.company}
                      onChange={(e) => setResourceForm({ 
                        ...resourceForm, 
                        details: { ...resourceForm.details, company: e.target.value }
                      })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Details Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        value={resourceForm.details.location}
                        onChange={(e) => setResourceForm({ 
                          ...resourceForm, 
                          details: { ...resourceForm.details, location: e.target.value }
                        })}
                        className="form-input"
                        placeholder="Remote, New York, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Duration</label>
                      <input
                        type="text"
                        value={resourceForm.details.duration}
                        onChange={(e) => setResourceForm({ 
                          ...resourceForm, 
                          details: { ...resourceForm.details, duration: e.target.value }
                        })}
                        className="form-input"
                        placeholder="3 months, 6 weeks, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Stipend/Salary</label>
                      <input
                        type="text"
                        value={resourceForm.details.stipend}
                        onChange={(e) => setResourceForm({ 
                          ...resourceForm, 
                          details: { ...resourceForm.details, stipend: e.target.value }
                        })}
                        className="form-input"
                        placeholder="$2000/month, Unpaid, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Contact Email</label>
                      <input
                        type="email"
                        value={resourceForm.details.contactEmail}
                        onChange={(e) => setResourceForm({ 
                          ...resourceForm, 
                          details: { ...resourceForm.details, contactEmail: e.target.value }
                        })}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      value={resourceForm.details.website}
                      onChange={(e) => setResourceForm({ 
                        ...resourceForm, 
                        details: { ...resourceForm.details, website: e.target.value }
                      })}
                      className="form-input"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                {/* Dates and Limits */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates & Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="form-label">Application Deadline *</label>
                      <input
                        type="date"
                        value={resourceForm.applicationDeadline}
                        onChange={(e) => setResourceForm({ ...resourceForm, applicationDeadline: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        value={resourceForm.startDate}
                        onChange={(e) => setResourceForm({ ...resourceForm, startDate: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Max Applications</label>
                      <input
                        type="number"
                        value={resourceForm.maxApplications}
                        onChange={(e) => setResourceForm({ ...resourceForm, maxApplications: e.target.value })}
                        className="form-input"
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={resourceForm.tags}
                    onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })}
                    className="form-input"
                    placeholder="remote, entry-level, paid"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowResourceModal(false);
                      resetResourceForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    {editingResource ? 'Update Resource' : 'Create Resource'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Send Announcement</h2>
                <button
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    resetAnnouncementForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                <div>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Content *</label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    className="form-input"
                    rows="4"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Type</label>
                    <select
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                      className="form-input"
                    >
                      <option value="general">General</option>
                      <option value="new_resource">New Resource</option>
                      <option value="deadline_reminder">Deadline Reminder</option>
                      <option value="system_update">System Update</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Priority</label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                      className="form-input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={announcementForm.expiresAt}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAnnouncementModal(false);
                      resetAnnouncementForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    Send Announcement
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;