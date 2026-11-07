import Fund from '../models/Fund.js';

export const getFunds = async (req, res) => {
  try {
    let funds = await Fund.findOne();
    if (!funds) {
      // Create initial fund document if none exists
      funds = new Fund({ totalRaised: 130000, target: 200000, recentDonations: [] });
      await funds.save();
    }
    res.json(funds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addDonation = async (req, res) => {
  try {
    const funds = await Fund.findOne();
    if (!funds) return res.status(404).json({ message: 'Fund record not found' });

    funds.recentDonations.unshift(req.body); // Add to beginning
    funds.totalRaised += Number(req.body.amount);

    const updatedFunds = await funds.save();
    res.status(201).json(updatedFunds);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
