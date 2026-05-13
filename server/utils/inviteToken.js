const jwt = require('jsonwebtoken');

function generateInviteToken(projectId, createdBy) {
  return jwt.sign(
    { projectId, createdBy },
    process.env.INVITE_SECRET,
    { expiresIn: '30m' }
  );
}

function verifyInviteToken(token) {
  return jwt.verify(token, process.env.INVITE_SECRET);
}

module.exports = { generateInviteToken, verifyInviteToken };
