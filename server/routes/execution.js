const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');
const { getMemberProject } = require('../utils/memberGuard');
const { computeExecutionPlan } = require('../services/executionEngine');
const { simulate } = require('../services/simulationEngine');

router.use(authGuard);

router.post('/:projectId/compute-execution', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const result = await computeExecutionPlan(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/:projectId/simulate', async (req, res, next) => {
  try {
    await getMemberProject(req.params.projectId, req.user.userId);
    const { availableHours, failedTaskIds } = req.body;

    if (availableHours == null) {
      return res.status(400).json({ success: false, error: 'availableHours is required' });
    }

    const result = await simulate(req.params.projectId, availableHours, failedTaskIds || []);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
