import React, { useState } from 'react';
import { 
  ArrowRight, 
  Star,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Briefcase,
  Users,
  GraduationCap,
  TrendingUp,
  Send
} from 'lucide-react';

const Home = () => {
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('internships');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
    alert('Thank you for subscribing to our newsletter!');
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at Google',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Career Reach Hub helped me land my dream internship at Google. The mentorship program was incredible and the guidance I received was invaluable for my career growth.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist at Microsoft',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'The courses here prepared me perfectly for my current role. The hands-on projects and expert mentorship made all the difference in my career transition.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Product Manager at Amazon',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'Found my mentor through CRH who guided me through my career transition. The networking opportunities and professional development resources are exceptional.',
      rating: 5
    },
    {
      name: 'David Rodriguez',
      role: 'UX Designer at Apple',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'The design courses and portfolio feedback sessions helped me pivot from marketing to UX design. Now I am working at my dream company!',
      rating: 5
    }
  ];

  const teamMembers = [
    {
      name: 'Alex Thompson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
      email: 'alex@careerreachhub.com',
      phone: '+1 (555) 123-4567',
      linkedin: 'https://linkedin.com/in/alexthompson'
    },
    {
      name: 'Maria Garcia',
      role: 'Head of Mentorship',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
      email: 'maria@careerreachhub.com',
      phone: '+1 (555) 234-5678',
      linkedin: 'https://linkedin.com/in/mariagarcia'
    },
    {
      name: 'James Wilson',
      role: 'Director of Partnerships',
      image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=200&h=200&fit=crop&crop=face',
      email: 'james@careerreachhub.com',
      phone: '+1 (555) 345-6789',
      linkedin: 'https://linkedin.com/in/jameswilson'
    },
    {
      name: 'Lisa Chen',
      role: 'Head of Learning',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
      email: 'lisa@careerreachhub.com',
      phone: '+1 (555) 456-7890',
      linkedin: 'https://linkedin.com/in/lisachen'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Video Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay 
          muted 
          loop
          playsInline
        >
          <source src="/path-to-your-video.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback background image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop')"
          }}
        ></div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Launch Your
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Dream Career
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Your gateway to internships, career opportunities, courses, and mentorship programs. 
            Connect with industry professionals and accelerate your career growth.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg rounded-lg transition-colors flex items-center justify-center">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-lg transition-colors">
                Sign In
              </button>
            </div>
          ) : (
            <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg rounded-lg transition-colors flex items-center justify-center mx-auto">
              Go to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Career Reach Hub
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded in 2020, Career Reach Hub has been at the forefront of connecting ambitious professionals 
                with life-changing opportunities. We believe that everyone deserves access to quality mentorship, 
                meaningful internships, and career advancement opportunities.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform bridges the gap between talent and opportunity, providing a comprehensive ecosystem 
                where students, professionals, and industry experts collaborate to build successful careers. 
                Through our innovative approach to career development, we have helped thousands of individuals 
                achieve their professional dreams.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-gray-600">Opportunities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10k+</div>
                  <div className="text-gray-600">Success Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-gray-600">Partner Companies</div>
                </div>
              </div>

              <button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors flex items-center">
                Learn More About Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" 
                alt="Team collaboration" 
                className="rounded-lg shadow-lg w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm font-semibold text-gray-900">Proven Results</span>
                </div>
                <p className="text-sm text-gray-600">
                  95% of our users find their ideal career opportunity within 6 months
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200">
                  <button 
                    onClick={() => setActiveTab('internships')}
                    className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                      activeTab === 'internships' 
                        ? 'border-blue-600 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    INTERNSHIPS
                  </button>
                  <button 
                    onClick={() => setActiveTab('summer')}
                    className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                      activeTab === 'summer' 
                        ? 'border-blue-600 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    SUMMER PROGRAMS
                  </button>
                  <button 
                    onClick={() => setActiveTab('college')}
                    className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                      activeTab === 'college' 
                        ? 'border-blue-600 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    COLLEGE PREP
                  </button>
                  <button 
                    onClick={() => setActiveTab('jobs')}
                    className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                      activeTab === 'jobs' 
                        ? 'border-blue-600 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    JOBS
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    EXPLORE YOUR PATH, ANYTIME, ANYWHERE
                  </h2>
                  
                  {/* Internships Tab */}
                  {activeTab === 'internships' && (
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Paid Internships</h3>
                          <p className="text-gray-600 mb-3">Discover high-quality paid internship opportunities across various industries with leading companies worldwide.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Remote Internships</h3>
                          <p className="text-gray-600 mb-3">Access flexible remote internship programs that allow you to gain experience from anywhere in the world.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Support</h3>
                          <p className="text-gray-600 mb-3">Get personalized assistance with your internship applications, including resume reviews and interview preparation.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summer Programs Tab */}
                  {activeTab === 'summer' && (
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <GraduationCap className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Programs</h3>
                          <p className="text-gray-600 mb-3">Join prestigious summer research programs at top universities and research institutions worldwide.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <Star className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Leadership Camps</h3>
                          <p className="text-gray-600 mb-3">Develop leadership skills through intensive summer camps and workshops designed for ambitious students.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill Development</h3>
                          <p className="text-gray-600 mb-3">Intensive summer programs focused on developing technical and soft skills for career advancement.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* College Prep Tab */}
                  {activeTab === 'college' && (
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Guidance</h3>
                          <p className="text-gray-600 mb-3">Comprehensive support for college applications, including essay writing, recommendation letters, and application strategy.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <Star className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Preparation</h3>
                          <p className="text-gray-600 mb-3">Expert-led preparation courses for SAT, ACT, and other standardized tests to maximize your scores.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <Mail className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Search</h3>
                          <p className="text-gray-600 mb-3">Access to comprehensive scholarship databases and personalized matching to fund your education.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Jobs Tab */}
                  {activeTab === 'jobs' && (
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <Briefcase className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Entry-Level Positions</h3>
                          <p className="text-gray-600 mb-3">Find entry-level job opportunities perfect for recent graduates and career changers across various industries.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Advancement</h3>
                          <p className="text-gray-600 mb-3">Explore mid-level and senior positions to take the next step in your career with leading companies.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                          <Users className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Matching</h3>
                          <p className="text-gray-600 mb-3">Our AI-powered matching system connects you with jobs that align with your skills, interests, and career goals.</p>
                          <button 
                            onClick={() => window.location.href = '/login'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            Learn more <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 rounded-2xl p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded mr-3 flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    </div>
                    <span className="text-white font-semibold">CAREER REACH HUB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">⭐</span>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                      <span className="text-white text-sm">Welcome back, Student</span>
                    </div>
                  </div>
                </div>
                
                {/* Welcome Message */}
                <div className="mb-8">
                  <h3 className="text-white text-2xl font-bold mb-2">Welcome back, Student</h3>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center">
                    <div className="w-12 h-8 bg-blue-300 rounded mr-3"></div>
                    <div>
                      <p className="text-white text-sm">Your next opportunity awaits</p>
                      <p className="text-blue-200 text-xs">Explore new internships and programs</p>
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-white">
                      <h4 className="font-semibold mb-2">Personal Account</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-200 text-sm">●●●●●●●●●●●●1234</span>
                          <span className="text-blue-200 text-sm">💳</span>
                        </div>
                        <p className="text-xs text-blue-300">View applications</p>
                        <p className="text-xs text-blue-300">Message center</p>
                        <p className="text-xs text-blue-300">Update account</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-white">
                      <h4 className="font-semibold mb-2">Quick Actions</h4>
                      <div className="space-y-2">
                        <p className="text-xs text-blue-300">📋 Apply now</p>
                        <p className="text-xs text-blue-300">💼 Browse jobs</p>
                        <p className="text-xs text-blue-300">🎓 Course catalog</p>
                        <p className="text-xs text-blue-300">🤝 Find mentors</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 col-span-2">
                    <div className="text-white">
                      <h4 className="font-semibold mb-2">Recent Activity</h4>
                      <div className="space-y-1">
                        <p className="text-xs text-blue-300">✓ Application submitted</p>
                        <p className="text-xs text-blue-300">📩 Message from mentor</p>
                        <p className="text-xs text-blue-300">🎯 Profile viewed</p>
                        <p className="text-xs text-blue-300">⭐ Course completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Career Reach Hub has transformed careers and lives across industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
                  />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-blue-600 font-medium">{testimonial.role}</p>
                    <div className="flex mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic leading-relaxed text-lg">
                  "{testimonial.content}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The dedicated professionals behind your career success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="relative mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200 group-hover:border-blue-300 transition-colors duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {member.role}
                </p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${member.email}`} className="hover:text-blue-600 transition-colors">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <a href={`tel:${member.phone}`} className="hover:text-blue-600 transition-colors">
                      {member.phone}
                    </a>
                  </div>
                </div>
                
                <a 
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stay Updated with Career Opportunities
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest internships, job openings, and career tips delivered to your inbox weekly.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button 
                onClick={handleNewsletterSubmit}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 font-semibold whitespace-nowrap rounded-lg transition-colors flex items-center justify-center"
              >
                Subscribe
                <Send className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-blue-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold mb-4">Career Reach Hub</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connecting ambitious professionals with life-changing opportunities. Your gateway to career success.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Internships</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Career Opportunities</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Courses</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mentorship</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Career Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Resume Templates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Interview Prep</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Salary Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-1 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400">123 Career Street</p>
                    <p className="text-gray-400">Business District</p>
                    <p className="text-gray-400">Kigali, Rwanda</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                  <a href="tel:+250788123456" className="text-gray-400 hover:text-white transition-colors">
                    +250 788 123 456
                  </a>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                  <a href="mailto:info@careerreachhub.com" className="text-gray-400 hover:text-white transition-colors">
                    info@careerreachhub.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Career Reach Hub. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;