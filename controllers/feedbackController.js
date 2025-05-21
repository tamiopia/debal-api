const UserReport = require('../models/UserReport');
const UserFeedback = require('../models/UserFeedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    const feedback = new UserFeedback({ userId, subject, message });
    await feedback.save();

    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('Submit Feedback Error:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

exports.reportUser = async (req, res) => {
  try {
    const { reporterId, reportedUserId, reason, description } = req.body;

    const report = new UserReport({ reporterId, reportedUserId, reason, description });
    await report.save();

    res.status(200).json({ message: 'User reported successfully' });
  } catch (err) {
    console.error('Report User Error:', err);
    res.status(500).json({ error: 'Failed to report user' });
  }
};
