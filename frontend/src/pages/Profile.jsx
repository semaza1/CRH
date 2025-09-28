import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Download,
  Upload,
  Star,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile, changePassword, api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.profile?.phone || '',
    education: user?.profile?.education || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills?.join(', ') || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || '',
    linkedin: user?.profile?.linkedin || '',
    github: user?.profile?.github || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Show password states
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    announcements: user?.subscriptions?.announcements ?? true,
    newResources: user?.subscriptions?.newResources ?? true,
    applicationUpdates: user?.subscriptions?.applicationUpdates ?? true,
    emailNotifications: user?.subscriptions?.emailNotifications ?? true
  });

  // User statistics
  const [userStats, setUserStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    profileCompletion: 0,
    joinDate: user?.createdAt || new Date(),
    lastActive: new Date()
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.profile?.phone || '',
        education: user.profile?.education || '',
        bio: user.profile?.bio || '',
        skills: user.profile?.skills?.join(', ') || '',
        location: user.profile?.location || '',
        website: user.profile?.website || '',
        linkedin: user.profile?.linkedin || '',
        github: user.profile?.github || ''
      });
      
      setNotificationPrefs({
        announcements: user.subscriptions?.announcements ?? true,
        newResources: user.subscriptions?.newResources ?? true,
        applicationUpdates: user.subscriptions?.applicationUpdates ?? true,
        emailNotifications: user.subscriptions?.emailNotifications ?? true
      });

      calculateProfileCompletion();
      loadUserStats();
    }
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const calculateProfileCompletion = () => {
    const fields = [
      user?.name,
      user?.email,
      user?.profile?.phone,
      user?.profile?.education,
      user?.profile?.bio,
      user?.profile?.skills?.length > 0
    ];
    
    const completedFields = fields.filter(field => field).length;
    const completion = Math.round((completedFields / fields.length) * 100);
    
    setUserStats(prev => ({ ...prev, profileCompletion: completion }));
  };

  const loadUserStats = async () => {
    try {
      const response = await api.get('/applications');
      const applications = response.data.data || [];
      
      setUserStats(prev => ({
        ...prev,
        totalApplications: applications.length,
        approvedApplications: applications.filter(app => app.status === 'approved').length
      }));
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const updatedData = {
        ...profileData,
        skills: profileData.skills ? profileData.skills.split(',').map(s => s.trim()).filter(s => s) : []
      };

      const result = await updateProfile(updatedData);
      
      if (result.success) {
        showMessage('Profile updated successfully!');
        setIsEditing(false);
        calculateProfileCompletion();
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      setLoading(true);
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        showMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      // TODO: Implement notification preferences update API
      showMessage('Notification preferences updated successfully!');
    } catch (error) {
      showMessage('Failed to update notification preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity', label: 'Activity', icon: TrendingUp }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
          </div>
          
          {/* Profile Completion */}
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Profile Completion</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${userStats.profileCompletion}%`}}
                ></div>
              </div>
              <span className="text-sm font-medium text-primary-600">
                {userStats.profileCompletion}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <Alert 
          type={messageType} 
          message={message} 
          onClose={() => setMessage('')}
          className="mb-6"
        />
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">
                          <User className="w-4 h-4 inline mr-2" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="form-input"
                          disabled={!isEditing}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="form-input bg-gray-50"
                          disabled
                        />
                        <small className="text-gray-500">Email cannot be changed</small>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="form-input"
                          disabled={!isEditing}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="form-label">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleProfileChange}
                          className="form-input"
                          disabled={!isEditing}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        <GraduationCap className="w-4 h-4 inline mr-2" />
                        Education
                      </label>
                      <input
                        type="text"
                        name="education"
                        value={profileData.education}
                        onChange={handleProfileChange}
                        className="form-input"
                        disabled={!isEditing}
                        placeholder="e.g., Bachelor's in Computer Science"
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        Skills
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={profileData.skills}
                        onChange={handleProfileChange}
                        className="form-input"
                        disabled={!isEditing}
                        placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                      />
                    </div>

                    <div>
                      <label className="form-label">Bio</label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        className="form-input"
                        rows="4"
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Social Links */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Social Links</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="form-label">Website</label>
                          <input
                            type="url"
                            name="website"
                            value={profileData.website}
                            onChange={handleProfileChange}
                            className="form-input"
                            disabled={!isEditing}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">LinkedIn</label>
                            <input
                              type="url"
                              name="linkedin"
                              value={profileData.linkedin}
                              onChange={handleProfileChange}
                              className="form-input"
                              disabled={!isEditing}
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>
                          
                          <div>
                            <label className="form-label">GitHub</label>
                            <input
                              type="url"
                              name="github"
                              value={profileData.github}
                              onChange={handleProfileChange}
                              className="form-input"
                              disabled={!isEditing}
                              placeholder="https://github.com/username"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end pt-6 border-t">
                        <Button type="submit" loading={loading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </form>
                </Card.Body>
              </Card>
            </div>

            {/* Profile Summary */}
            <div className="space-y-6">
              {/* Profile Preview */}
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Preview</h3>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{user?.name}</h4>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                    {profileData.location && (
                      <p className="text-gray-500 text-sm mt-1">📍 {profileData.location}</p>
                    )}
                    <Badge variant="primary" className="mt-2">
                      {user?.role}
                    </Badge>
                  </div>

                  {profileData.bio && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-gray-600 text-sm text-center">{profileData.bio}</p>
                    </div>
                  )}

                  {profileData.skills && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.split(',').map((skill, index) => (
                          <Badge key={index} variant="gray" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="text-sm font-medium">
                        {new Date(userStats.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Applications</span>
                      <span className="text-sm font-medium">{userStats.totalApplications}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Approved Applications</span>
                      <span className="text-sm font-medium text-green-600">
                        {userStats.approvedApplications}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium">
                        {userStats.totalApplications > 0 
                          ? Math.round((userStats.approvedApplications / userStats.totalApplications) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="max-w-2xl">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <p className="text-gray-600 text-sm">Update your password to keep your account secure</p>
              </Card.Header>
              <Card.Body>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="form-label">Current Password *</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="form-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">New Password *</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="form-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="flex space-x-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded ${
                                i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password *</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`form-input pr-10 ${
                          passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword 
                            ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                            : ''
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button type="submit" loading={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-gray-600 text-sm">Choose what notifications you'd like to receive</p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Announcements</h4>
                      <p className="text-sm text-gray-600">Get notified about platform announcements and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationPrefs.announcements}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, announcements: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">New Resources</h4>
                      <p className="text-sm text-gray-600">Get notified when new opportunities are posted</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationPrefs.newResources}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, newResources: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Application Updates</h4>
                      <p className="text-sm text-gray-600">Get notified about your application status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationPrefs.applicationUpdates}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, applicationUpdates: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email in addition to in-app</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationPrefs.emailNotifications}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, emailNotifications: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button onClick={handleNotificationUpdate} loading={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* Account Overview */}
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">Account Activity</h3>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalApplications}</p>
                    <p className="text-gray-600 text-sm">Total Applications</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{userStats.approvedApplications}</p>
                    <p className="text-gray-600 text-sm">Approved Applications</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{userStats.profileCompletion}%</p>
                    <p className="text-gray-600 text-sm">Profile Complete</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Recent Activity */}
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Profile updated</p>
                      <p className="text-xs text-gray-500">Updated personal information</p>
                    </div>
                    <span className="text-xs text-gray-400">Today</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Account created</p>
                      <p className="text-xs text-gray-500">Joined Career Reach Hub</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(userStats.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Data Export */}
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">Data & Privacy</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Export Your Data</h4>
                      <p className="text-sm text-gray-600">Download a copy of your account data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Account Deletion</h4>
                      <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="danger" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;