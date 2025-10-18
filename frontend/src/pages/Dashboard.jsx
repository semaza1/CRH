import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Filter,
  Calendar,
  MapPin,
  Building,
  Users,
  Star,
  ExternalLink,
  Send,
  Bell,
  Briefcase,
  GraduationCap,
  Award,
  Target
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HeroVideo from '../assets/Hero.mp4';

const Dashboard = () => {
  const { user, api, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Dashboard data
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  });

  const [myApplications, setMyApplications] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filters
  const [resourceFilters, setResourceFilters] = useState({
    search: '',
    type: '',
    category: '',
    location: ''
  });

  // Modal states
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    motivation: '',
    resumeFile: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (Object.values(resourceFilters).some(filter => filter !== '')) {
      loadAvailableResources();
    }
  }, [resourceFilters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMyApplications(),
        loadAvailableResources(),
        loadFeaturedResources(),
        loadAnnouncements(),
        loadUnreadCount()
      ]);
    } catch (error) {
      showMessage('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const loadMyApplications = async () => {
    try {
      const response = await api.get('/applications?limit=10');
      const applications = response.data.data || [];
      setMyApplications(applications);
      
      // Calculate stats
      setStats({
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        approvedApplications: applications.filter(app => app.status === 'approved').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length
      });
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const loadAvailableResources = async () => {
    try {
      const params = new URLSearchParams({
        limit: '20',
        status: 'active'
      });

      // Add filters
      if (resourceFilters.search) params.append('search', resourceFilters.search);
      if (resourceFilters.type) params.append('type', resourceFilters.type);
      if (resourceFilters.category) params.append('category', resourceFilters.category);

      const response = await api.get(`/resources?${params}`);
      setAvailableResources(response.data.data || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const loadFeaturedResources = async () => {
    try {
      const response = await api.get('/resources/featured');
      setFeaturedResources(response.data.data || []);
    } catch (error) {
      console.error('Failed to load featured resources:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await api.get('/announcements?limit=5');
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/announcements/unread/count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setShowResourceModal(true);
  };

  const handleApplyClick = (resource) => {
    setSelectedResource(resource);
    setApplicationForm({
      coverLetter: '',
      motivation: '',
      resumeFile: null
    });
    setShowApplicationModal(true);
    setShowResourceModal(false);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const requiresResume = ['job', 'internship'].includes(selectedResource.type);
      if (requiresResume && !applicationForm.resumeFile) {
        showMessage('Please upload your CV for this opportunity', 'error');
        setLoading(false);
        return;
      }

      // We don't have file upload wired yet; include filename as placeholder
      const payload = {
        resourceId: selectedResource._id,
        applicationData: {
          coverLetter: applicationForm.coverLetter,
          motivation: applicationForm.motivation,
          resumeFilename: applicationForm.resumeFile ? applicationForm.resumeFile.name : null
        }
      };

      await api.post('/applications', payload);

      showMessage('Application submitted successfully!');
      setShowApplicationModal(false);
      await loadMyApplications();
      await loadAvailableResources();

      // reset form
      setApplicationForm({ coverLetter: '', motivation: '', resumeFile: null });

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'under_review': return 'primary';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'internship': return <Briefcase className="w-4 h-4" />;
      case 'job': return <Building className="w-4 h-4" />;
      case 'course': return <GraduationCap className="w-4 h-4" />;
      case 'mentorship': return <Users className="w-4 h-4" />;
      case 'scholarship': return <Award className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const hasUserApplied = (resourceId) => {
    return myApplications.some(app => app.resource?._id === resourceId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Ready to take the next step in your career journey?
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <div className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="font-medium">{unreadCount} new announcements</span>
              </div>
            )}

            {/* Logout next to announcements */}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="ml-3 inline-flex items-center px-3 py-2 border border-gray-200 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Hero banner - marketing style */}
      <section className="relative rounded-lg overflow-hidden mb-8">
        <video src={HeroVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="relative z-10 bg-black bg-opacity-40 p-6 md:p-12 text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3">
              <h2 className="text-3xl md:text-4xl font-extrabold">Advance your career with curated courses, trainings and real opportunities</h2>
              <p className="mt-3 text-sm md:text-base text-white/90">Explore high-quality courses, internships and jobs hand-picked to help you grow. Practical, career-focused and trusted by employers.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => navigate('/courses')} variant="primary">Explore Courses</Button>
                <Button onClick={() => setResourceFilters({ ...resourceFilters, type: 'job' })} variant="outline">Find Jobs</Button>
              </div>
            </div>
            <div className="md:w-1/3 mt-6 md:mt-0 hidden md:block">
              {/* optional area for logo or promo */}
            </div>
          </div>
        </div>
      </section>

      {message && (
        <Alert 
          type={messageType} 
          message={message} 
          onClose={() => setMessage('')}
          className="mb-6"
        />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
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
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approvedApplications}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejectedApplications}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Opportunities */}
          {featuredResources.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  Featured Opportunities
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredResources.slice(0, 4).map(resource => (
                  <Card key={resource._id} className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                    <Card.Body className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(resource.type)}
                          <Badge variant="primary">{resource.type}</Badge>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                        <Badge variant="gray">{resource.category}</Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        {resource.details?.company && (
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2" />
                            {resource.details.company}
                          </div>
                        )}
                        {resource.details?.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {resource.details.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Deadline: {new Date(resource.applicationDeadline).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResourceClick(resource)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {!hasUserApplied(resource._id) && (
                          <Button
                            size="sm"
                            onClick={() => handleApplyClick(resource)}
                            className="flex-1"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Apply
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Browse Opportunities */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Browse Opportunities</h2>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <Card.Body className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search opportunities..."
                        className="form-input pl-10"
                        value={resourceFilters.search}
                        onChange={(e) => setResourceFilters({ ...resourceFilters, search: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <select
                    className="form-input"
                    value={resourceFilters.type}
                    onChange={(e) => setResourceFilters({ ...resourceFilters, type: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="internship">Internships</option>
                    <option value="job">Jobs</option>
                    <option value="course">Courses</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="scholarship">Scholarships</option>
                    <option value="workshop">Workshops</option>
                  </select>
                  
                  <select
                    className="form-input"
                    value={resourceFilters.category}
                    onChange={(e) => setResourceFilters({ ...resourceFilters, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
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
                  
                  <Button
                    variant="outline"
                    onClick={() => setResourceFilters({ search: '', type: '', category: '', location: '' })}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Available Resources */}
            <div className="space-y-4">
              {availableResources.map(resource => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                  <Card.Body className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(resource.type)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {resource.title}
                          </h3>
                          <Badge variant="primary">{resource.type}</Badge>
                          <Badge variant="gray">{resource.category}</Badge>
                          {hasUserApplied(resource._id) && (
                            <Badge variant="success">Applied</Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {resource.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          {resource.details?.company && (
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              {resource.details.company}
                            </div>
                          )}
                          {resource.details?.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {resource.details.location}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Deadline: {new Date(resource.applicationDeadline).toLocaleDateString()}
                          </div>
                          {resource.currentApplications !== undefined && (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {resource.currentApplications} applicants
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResourceClick(resource)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {!hasUserApplied(resource._id) && (
                          <Button
                            size="sm"
                            onClick={() => handleApplyClick(resource)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
              
              {availableResources.length === 0 && (
                <Card className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search filters or check back later for new opportunities.</p>
                  <Button onClick={() => setResourceFilters({ search: '', type: '', category: '', location: '' })}>
                    Clear Filters
                  </Button>
                </Card>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* My Applications */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">My Applications</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {myApplications.slice(0, 5).map(application => (
                  <div key={application._id} className="border-l-4 border-primary-400 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {application.resource?.title || 'Resource not found'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(application.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(application.status)} className="ml-2">
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {myApplications.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No applications yet</p>
                    <p className="text-gray-400 text-xs mt-1">Start applying to opportunities!</p>
                  </div>
                )}
                
                {myApplications.length > 5 && (
                  <div className="pt-3 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Applications
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Latest Announcements */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Latest Announcements</h3>
                {unreadCount > 0 && (
                  <Badge variant="primary">{unreadCount}</Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {announcements.map(announcement => (
                  <div key={announcement._id} className="border-l-4 border-blue-400 pl-4 py-2">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {announcement.title}
                      </h4>
                      <Badge variant={announcement.priority === 'high' ? 'danger' : 'primary'}>
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                
                {announcements.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No announcements</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Quick Stats */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium">
                    {stats.totalApplications > 0 
                      ? Math.round((stats.approvedApplications / stats.totalApplications) * 100) 
                      : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Applications</span>
                  <span className="text-sm font-medium">{stats.pendingApplications}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Resource Details Modal */}
      {showResourceModal && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(selectedResource.type)}
                    <h2 className="text-2xl font-bold text-gray-900">{selectedResource.title}</h2>
                    <Badge variant="primary">{selectedResource.type}</Badge>
                  </div>
                  {selectedResource.details?.company && (
                    <p className="text-gray-600">{selectedResource.details.company}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowResourceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedResource.description}</p>
                    </div>

                    {selectedResource.requirements && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                        <div className="space-y-3">
                          {selectedResource.requirements.education && (
                            <div>
                              <h4 className="font-medium text-gray-800">Education</h4>
                              <p className="text-gray-600 text-sm">{selectedResource.requirements.education}</p>
                            </div>
                          )}
                          {selectedResource.requirements.experience && (
                            <div>
                              <h4 className="font-medium text-gray-800">Experience</h4>
                              <p className="text-gray-600 text-sm">{selectedResource.requirements.experience}</p>
                            </div>
                          )}
                          {selectedResource.requirements.skills && selectedResource.requirements.skills.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-800">Skills</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedResource.requirements.skills.map((skill, index) => (
                                  <Badge key={index} variant="gray">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Card>
                    <Card.Header>
                      <h3 className="font-semibold text-gray-900">Details</h3>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-3">
                        {selectedResource.details?.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Location</p>
                              <p className="text-sm text-gray-600">{selectedResource.details.location}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedResource.details?.duration && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Duration</p>
                              <p className="text-sm text-gray-600">{selectedResource.details.duration}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedResource.details?.stipend && (
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Stipend/Salary</p>
                              <p className="text-sm text-gray-600">{selectedResource.details.stipend}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Application Deadline</p>
                            <p className="text-sm text-gray-600">
                              {new Date(selectedResource.applicationDeadline).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {selectedResource.currentApplications !== undefined && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Applications</p>
                              <p className="text-sm text-gray-600">
                                {selectedResource.currentApplications} 
                                {selectedResource.maxApplications && ` / ${selectedResource.maxApplications}`}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {selectedResource.details?.website && (
                          <div className="flex items-center">
                            <ExternalLink className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Website</p>
                              <a 
                                href={selectedResource.details.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-500"
                              >
                                Visit Website
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t">
                        {hasUserApplied(selectedResource._id) ? (
                          <Badge variant="success" className="w-full justify-center py-2">
                            ✓ Application Submitted
                          </Badge>
                        ) : (
                          <Button 
                            onClick={() => handleApplyClick(selectedResource)}
                            className="w-full"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
                  <p className="text-gray-600">{selectedResource.title}</p>
                </div>
                <button
                  onClick={() => { setShowApplicationModal(false); setApplicationForm({ coverLetter: '', motivation: '', resumeFile: null }); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                <div>
                  <label className="form-label">Cover Letter *</label>
                  <textarea
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                    className="form-input"
                    rows="4"
                    placeholder="Tell us why you're interested in this opportunity and why you'd be a great fit..."
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Why are you interested in this opportunity?</label>
                  <textarea
                    value={applicationForm.motivation}
                    onChange={(e) => setApplicationForm({ ...applicationForm, motivation: e.target.value })}
                    className="form-input"
                    rows="3"
                    placeholder="Explain what motivates you about this opportunity..."
                  />
                </div>

                {/* Only ask for resume for job/internship opportunities */}
                {['job', 'internship'].includes(selectedResource.type) && (
                  <div>
                    <label className="form-label">Upload CV *</label>
                    <input
                      type="file"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setApplicationForm({ ...applicationForm, resumeFile: e.target.files[0] || null })}
                      className="form-input"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Only required for job/internship opportunities. No CV required for academic/course roles.</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowApplicationModal(false); setApplicationForm({ coverLetter: '', motivation: '', resumeFile: null }); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
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

export default Dashboard;