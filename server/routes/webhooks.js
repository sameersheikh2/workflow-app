const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const { getMemberProject } = require('../utils/memberGuard');
const WebhookDelivery = require('../models/WebhookDelivery');

router.use(authGuard);

router.post('/:projectId/webhook', async (req, res, next) => {
  try {
    const project = await getMemberProject(req.params.projectId, req.user.userId);
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'Webhook URL is required' });
    }

    project.webhookUrl = url;
    await project.save();

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

router.get('/:projectId/webhook/logs', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const logs = await WebhookDelivery.find({ projectId: req.params.projectId })
      .sort({ sentAt: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
