const axios = require('axios');
const WebhookDelivery = require('../models/WebhookDelivery');

async function fire(projectId, url, task, attempt = 1) {
  try {
    const res = await axios.post(url, {
      event: 'task.completed',
      task: { id: task._id, title: task.title, projectId },
      timestamp: new Date(),
    }, { timeout: 5000 });

    await WebhookDelivery.create({
      projectId,
      webhookUrl: url,
      taskId: task._id,
      status: 'success',
      attempts: attempt,
      responseCode: res.status,
    });
  } catch (err) {
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 2000 * attempt));
      return fire(projectId, url, task, attempt + 1);
    }
    await WebhookDelivery.create({
      projectId,
      webhookUrl: url,
      taskId: task._id,
      status: 'failed',
      attempts: attempt,
      responseCode: err.response?.status || 0,
    });
  }
}

module.exports = { fire };
