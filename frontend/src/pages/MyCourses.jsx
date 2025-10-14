import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  PlayCircle,
  Award
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MyCourses = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses/my/courses');
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (courseId) => {
    navigate(`/courses/${courseId}/learn`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your courses..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="mt-2 text-gray-600">Continue your learning journey</p>
      </div>

      {/* Course Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              {course.thumbnail && (
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <Card.Body>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    <span>{course.totalLessons || 0} lessons</span>
                  </div>
                </div>

                {course.progress === 100 ? (
                  <Button
                    className="w-full"
                    variant="success"
                    onClick={() => navigate(`/certificates/${course._id}`)}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    View Certificate
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleContinue(course._id)}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses yet</h3>
          <p className="text-gray-600 mb-6">Start learning by enrolling in a course</p>
          <Button onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MyCourses;