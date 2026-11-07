import Task from '../models/Task.js';
import Project from '../models/Project.js';

// Helper function to calculate average task progress and apply it to the project
const syncProjectProgress = async (projectId) => {
  if (!projectId) return null;
  const tasks = await Task.find({ projectId });
  
  if (tasks.length === 0) {
    return await Project.findByIdAndUpdate(projectId, { progress: 0, status: 'Planning' }, { new: true });
  }

  const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
  const avgProgress = Math.round(totalProgress / tasks.length);
  
  const status = avgProgress === 100 ? 'Completed' : (avgProgress > 0 ? 'In Progress' : 'Planning');

  return await Project.findByIdAndUpdate(projectId, { 
    progress: avgProgress,
    status: status
  }, { new: true });
};

// Get tasks (optionally filter by projectId)
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const tasks = projectId ? await Task.find({ projectId }) : await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a task
export const createTask = async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    
    // Automatically trigger backend sync to recalculate project average
    let updatedProject = null;
    if (savedTask.projectId) {
      updatedProject = await syncProjectProgress(savedTask.projectId);
    }
    
    res.status(201).json({ task: savedTask, project: updatedProject });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    
    // Automatically trigger backend sync to recalculate project average
    let updatedProject = null;
    if (updatedTask.projectId) {
      updatedProject = await syncProjectProgress(updatedTask.projectId);
    }

    res.json({ task: updatedTask, project: updatedProject });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    
    // Automatically trigger backend sync to recalculate project average
    let updatedProject = null;
    if (deletedTask.projectId) {
      updatedProject = await syncProjectProgress(deletedTask.projectId);
    }

    res.json({ message: 'Task deleted', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
