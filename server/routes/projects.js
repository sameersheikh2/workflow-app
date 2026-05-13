const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const Project = require('../models/Project');
const AuditLog = require('../models/AuditLog');
const { generateInviteToken, verifyInviteToken } = require('../utils/inviteToken');
const { auditLog } = require('../services/auditLogger');
const { getMemberProject } = require('../utils/memberGuard');

router.use(authGuard);

router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({ 'members.userId': req.user.userId });
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user.userId,
      members: [{ userId: req.user.userId, role: 'owner' }],
    });

    auditLog(req.user.userId, 'project.created', 'Project', project._id);

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await getMemberProject(req.params.id, req.user.userId);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/invite', async (req, res, next) => {
  try {
    const project = await getMemberProject(req.params.id, req.user.userId);

    const isOwner = project.members.some(
      m => m.userId.toString() === req.user.userId.toString() && m.role === 'owner'
    );
    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Only owner can generate invite' });
    }

    const token = generateInviteToken(project._id.toString(), req.user.userId);
    project.inviteToken = token;
    project.inviteTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
    await project.save();

    auditLog(req.user.userId, 'invite.generated', 'Project', project._id);

    res.json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
});

router.post('/join', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Invite token is required' });
    }

    const decoded = verifyInviteToken(token);
    const project = await Project.findById(decoded.projectId);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const alreadyMember = project.members.some(
      m => m.userId.toString() === req.user.userId.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ success: false, error: 'Already a member' });
    }

    project.members.push({ userId: req.user.userId, role: 'member' });
    await project.save();

    auditLog(req.user.userId, 'member.joined', 'Project', project._id);

    res.json({ success: true, data: project });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, error: 'Invalid or expired invite token' });
    }
    next(err);
  }
});

router.get('/:id/audit', async (req, res, next) => {
  try {
    await getMemberProject(req.params.id, req.user.userId);
    const logs = await AuditLog.find({ 'entity.id': req.params.id })
      .sort({ timestamp: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
