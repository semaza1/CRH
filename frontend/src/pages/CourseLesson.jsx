import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  FileText,
  Award,
  Clock
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

const CourseLesson = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadLessonData();
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      
      // Load course, lessons, and current lesson
      const [courseRes, lessonsRes, lessonRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/lessons/course/${courseId}`),
        api.get(`/lessons/${lessonId}`)
      ]);

      setCourse(courseRes.data.data);
      setLessons(lessonsRes.data.data || []);
      setCurrentLesson(lessonRes.data.data);
    } catch (error) {
      console.error('Failed to load lesson:', error);
      showMessage('Failed to load lesson', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleCompleteLesson = async () => {
    try {
      setCompleting(true);
      const response = await api.post(`/lessons/${lessonId}/complete`);
      setProgress(response.data.data);
      showMessage('Lesson completed! 🎉');
      
      // Check if course is completed
      if (response.data.data.progress === 100) {
        showMessage('Congratulations! You completed the course! Check your email for certificate.', 'success');
        setTimeout(() => {
          navigate(`/certificates/${courseId}`);
        }, 2000);
      } else {
        // Move to next lesson
        const currentIndex = lessons.findIndex(l => l._id === lessonId);
        if (currentIndex < lessons.length - 1) {
          const nextLesson = lessons[currentIndex + 1];
          setTimeout(() => {
            navigate(`/courses/${courseId}/lessons/${nextLesson._id}`);
          }, 1500);
        }
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to complete lesson', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handlePreviousLesson = () => {
    const currentIndex = lessons.findIndex(l => l._id === lessonId);
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      navigate(`/courses/${courseId}/lessons/${prevLesson._id}`);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = lessons.findIndex(l => l._id === lessonId);
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      navigate(`/courses/${courseId}/lessons/${nextLesson._id}`);
    }
  };

  const handleTakeQuiz = () => {
    navigate(`/courses/${courseId}/lessons/${lessonId}/quiz`);
  };

  const currentIndex = lessons.findIndex(l => l._id === lessonId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading lesson..." />
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not found</h2>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Course
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{course?.title}</h1>
                <p className="text-sm text-gray-600">
                  Lesson {currentIndex + 1} of {lessons.length}
                </p>
              </div>
            </div>
            {progress && (
              <div className="text-sm text-gray-600">
                Progress: <span className="font-semibold">{progress.progress}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <Alert 
            type={messageType} 
            message={message} 
            onClose={() => setMessage('')}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentLesson.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{currentLesson.duration} minutes</span>
                      </div>
                      {currentLesson.type === 'video' && (
                        <Badge variant="primary">
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Video Lesson
                        </Badge>
                      )}
                      {currentLesson.type === 'text' && (
                        <Badge variant="gray">
                          <FileText className="w-3 h-3 mr-1" />
                          Reading Material
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body>
                {/* Video Content */}
                {currentLesson.type === 'video' && currentLesson.content?.videoUrl && (
                  <div className="mb-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={currentLesson.content.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Text Content */}
                {currentLesson.content?.text && (
                  <div className="prose prose-lg max-w-none mb-6">
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content.text }} />
                  </div>
                )}

                {/* Lesson Description */}
                {currentLesson.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Lesson</h3>
                    <p className="text-gray-600">{currentLesson.description}</p>
                  </div>
                )}

                {/* Resources */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources</h3>
                    <div className="space-y-2">
                      {currentLesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{resource.title}</p>
                            <p className="text-sm text-gray-600">{resource.type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleCompleteLesson}
                    loading={completing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={handleTakeQuiz}
                  >
                    Take Quiz
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousLesson}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous Lesson
              </Button>
              
              <Button
                onClick={handleNextLesson}
                disabled={!hasNext}
              >
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <Card>
              <Card.Header>
                <h3 className="font-semibold text-gray-900">Course Content</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson._id}
                      onClick={() => navigate(`/courses/${courseId}/lessons/${lesson._id}`)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        lesson._id === lessonId
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-500 mt-1">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            lesson._id === lessonId ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {lesson.duration} min
                          </p>
                        </div>
                        {lesson.type === 'video' && (
                          <PlayCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLesson;