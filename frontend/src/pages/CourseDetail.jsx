import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  PlayCircle,
  CheckCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

const CourseDetail = () => {
  const { api, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const courseResponse = await api.get(`/courses/${id}`);
      setCourse(courseResponse.data.data);
      
      // Check if user is enrolled
      if (isAuthenticated()) {
        const enrolled = courseResponse.data.data.enrolledStudents?.includes(api.user?.id);
        setIsEnrolled(enrolled);
        
        if (enrolled) {
          // Load lessons if enrolled
          const lessonsResponse = await api.get(`/lessons/course/${id}`);
          setLessons(lessonsResponse.data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      showMessage('Failed to load course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/courses/${id}/enroll`);
      showMessage('Successfully enrolled in course! Check your email for confirmation.');
      setIsEnrolled(true);
      await loadCourseDetails();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to enroll in course', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (lessons.length > 0) {
      navigate(`/courses/${id}/lessons/${lessons[0]._id}`);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      design: 'bg-purple-100 text-purple-800',
      marketing: 'bg-orange-100 text-orange-800',
      'personal-development': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading course..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {message && (
        <Alert 
          type={messageType} 
          message={message} 
          onClose={() => setMessage('')}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-3 py-1 text-sm rounded ${getCategoryColor(course.category)}`}>
                {course.category}
              </span>
              <span className={`px-3 py-1 text-sm rounded ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-5 h-5" />
                <span>{course.totalEnrollments || 0} students</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>{course.duration} hours</span>
              </div>
              {course.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>{course.rating.toFixed(1)} ({course.totalRatings} ratings)</span>
                </div>
              )}
            </div>
          </div>

          {/* Course Thumbnail */}
          {course.thumbnail && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* What You'll Learn */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <Card className="mb-6">
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">What You'll Learn</h2>
              </Card.Header>
              <Card.Body>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card className="mb-6">
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">Prerequisites</h2>
              </Card.Header>
              <Card.Body>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}

          {/* Course Content (Lessons) */}
          {isEnrolled && lessons.length > 0 && (
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
                <p className="text-sm text-gray-600 mt-1">{lessons.length} lessons</p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div 
                      key={lesson._id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="text-left">
                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <PlayCircle className="w-4 h-4" />
                              <span>{lesson.duration} min</span>
                              {lesson.type === 'video' && <Badge variant="primary">Video</Badge>}
                              {lesson.type === 'text' && <Badge variant="gray">Reading</Badge>}
                            </div>
                          </div>
                        </div>
                        {expandedSection === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedSection === index && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                          <Button 
                            size="sm"
                            onClick={() => navigate(`/courses/${id}/lessons/${lesson._id}`)}
                          >
                            Start Lesson
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Instructor */}
          {course.instructor && (
            <Card className="mt-6">
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">Instructor</h2>
              </Card.Header>
              <Card.Body>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {course.instructor.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.instructor.name}</h3>
                    <p className="text-sm text-gray-600">{course.instructor.email}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card>
              <Card.Body>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {course.isPaid ? `$${course.price}` : 'Free'}
                  </div>
                  {course.isPaid && (
                    <p className="text-sm text-gray-600">One-time payment</p>
                  )}
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <Button 
                      className="w-full"
                      onClick={handleStartLearning}
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You're enrolled</span>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={handleEnroll}
                    loading={enrolling}
                  >
                    Enroll Now
                  </Button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <h3 className="font-semibold text-gray-900">This course includes:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <PlayCircle className="w-5 h-5 text-gray-400" />
                      <span>{course.duration} hours on-demand content</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <span>{lessons.length || course.totalLessons || 0} lessons</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <Award className="w-5 h-5 text-gray-400" />
                      <span>Certificate of completion</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>Lifetime access</span>
                    </li>
                  </ul>
                </div>

                {course.tags && course.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;