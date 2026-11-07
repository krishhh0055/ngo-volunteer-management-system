import Salary from '../models/Salary.js';

export const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().sort({ year: -1, month: -1 });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSalary = async (req, res) => {
  try {
    const salary = new Salary(req.body);
    const saved = await salary.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSalary = async (req, res) => {
  try {
    const updated = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Salary record not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSalary = async (req, res) => {
  try {
    const deleted = await Salary.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Salary record not found' });
    res.json({ message: 'Salary record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
