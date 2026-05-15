const { decrypt } = require('./encrypt');

function decryptTask(task) {
  const obj = task.toObject ? task.toObject() : { ...task };
  obj.description = decrypt(obj.description);
  return obj;
}

module.exports = { decryptTask };
