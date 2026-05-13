const Project = require('../models/Project');

async function getMemberProject(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw Object.assign(new Error('Project not found'), { status: 404 });
  }
  const isMember = project.members.some(
    m => m.userId.toString() === userId.toString()
  );
  if (!isMember) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }
  return project;
}

module.exports = { getMemberProject };
