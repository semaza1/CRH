const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const emailService = require('../services/emailService');

// @desc    Get quiz for a lesson
// @route   GET /api/lessons/:lessonId/quiz
// @access  Private
const getQuiz = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const quiz = await Quiz.findOne({ lesson: req.params.lessonId });

    if (!quiz) {
      return res.status(404).json({ message: 'No quiz found for this lesson' });
    }

    // Get user's previous attempts
    const attempts = await QuizAttempt.find({
      user: req.user.id,
      quiz: quiz._id
    }).sort({ createdAt: -1 });

    // Remove correct answers from response for security
    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options.map(opt => ({ text: opt.text, _id: opt._id })),
      points: q.points
    }));

    res.json({
      success: true,
      data: {
        quiz: quizData,
        attempts: attempts.length,
        maxAttempts: quiz.attempts,
        canRetake: attempts.length < quiz.attempts,
        bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error while fetching quiz' });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:quizId/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const lesson = await Lesson.findById(quiz.lesson);
    const course = await Course.findById(quiz.course);

    // Check attempts limit
    const previousAttempts = await QuizAttempt.countDocuments({
      user: req.user.id,
      quiz: quiz._id
    });

    if (previousAttempts >= quiz.attempts) {
      return res.status(400).json({ 
        message: `Maximum attempts (${quiz.attempts}) reached for this quiz` 
      });
    }

    // Grade the quiz
    const { answers, timeSpent } = req.body;
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedAnswers = [];

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      const userAnswer = answers[index];
      let isCorrect = false;
      let pointsEarned = 0;

      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctOption._id.toString();
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === 'short-answer') {
        // Simple string comparison (case-insensitive)
        isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        pointsEarned = isCorrect ? question.points : 0;
      }

      earnedPoints += pointsEarned;

      gradedAnswers.push({
        questionId: question._id,
        answer: userAnswer,
        isCorrect,
        pointsEarned,
        correctAnswer: question.type === 'multiple-choice' || question.type === 'true-false' 
          ? question.options.find(opt => opt.isCorrect).text 
          : question.correctAnswer,
        explanation: question.explanation
      });
    });

    const percentage = (earnedPoints / totalPoints) * 100;
    const passed = percentage >= quiz.passingScore;

    // Create quiz attempt
    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      user: req.user.id,
      course: course._id,
      lesson: lesson._id,
      answers: gradedAnswers,
      score: earnedPoints,
      totalPoints,
      percentage,
      passed,
      attemptNumber: previousAttempts + 1,
      timeSpent: timeSpent || 0
    });

    // Update course progress
    const progress = await CourseProgress.findOne({
      user: req.user.id,
      course: course._id
    });

    if (progress) {
      const existingQuizIndex = progress.quizResults.findIndex(
        qr => qr.quiz.toString() === quiz._id.toString()
      );

      if (existingQuizIndex >= 0) {
        progress.quizResults[existingQuizIndex].attempts = previousAttempts + 1;
        if (percentage > progress.quizResults[existingQuizIndex].bestScore) {
          progress.quizResults[existingQuizIndex].bestScore = percentage;
          progress.quizResults[existingQuizIndex].passed = passed;
        }
      } else {
        progress.quizResults.push({
          quiz: quiz._id,
          attempts: 1,
          bestScore: percentage,
          passed
        });
      }

      await progress.save();
    }

    // Send quiz result email (async)
    emailService.sendQuizResultEmail(req.user, quiz, attempt, lesson, course).catch(error => {
      console.error('Failed to send quiz result email:', error);
    });

    res.json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz!' : 'Quiz completed. Review and try again!',
      data: {
        attempt: {
          score: earnedPoints,
          totalPoints,
          percentage: percentage.toFixed(1),
          passed,
          attemptNumber: previousAttempts + 1,
          maxAttempts: quiz.attempts
        },
        answers: gradedAnswers,
        canRetake: previousAttempts + 1 < quiz.attempts
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error while submitting quiz' });
  }
};

// @desc    Create quiz for a lesson
// @route   POST /api/lessons/:lessonId/quiz
// @access  Private/Admin
const createQuiz = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ lesson: req.params.lessonId });
    if (existingQuiz) {
      return res.status(400).json({ message: 'Quiz already exists for this lesson' });
    }

    const quizData = {
      ...req.body,
      lesson: req.params.lessonId,
      course: lesson.course
    };

    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: 'Server error while creating quiz' });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
const updateQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error while updating quiz' });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error while deleting quiz' });
  }
};

// @desc    Get quiz attempts for a user
// @route   GET /api/quizzes/:quizId/attempts
// @access  Private
const getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quiz: req.params.quizId,
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ message: 'Server error while fetching quiz attempts' });
  }
};

module.exports = {
  getQuiz,
  submitQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizAttempts
};