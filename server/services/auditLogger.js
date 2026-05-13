const AuditLog = require('../models/AuditLog');

async function auditLog(actor, action, entityType, entityId, metadata = {}) {
  try {
    await AuditLog.create({
      actor,
      action,
      entity: { type: entityType, id: entityId },
      metadata,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
}

module.exports = { auditLog };
