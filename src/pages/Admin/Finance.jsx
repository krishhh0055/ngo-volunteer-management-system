import { Download, Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { IncomeCategoryChart } from '../../components/charts/IncomeCategoryChart';
import { useData } from '../../context/DataContext';
import { exportToExcel } from '../../lib/excel';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Finance() {
  const { funds, addDonation } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    donor: '',
    category: 'Donations',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addDonation(formData);
    setIsAdding(false);
    setFormData({ donor: '', category: 'Donations', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Finance & Donations</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportToExcel(funds.recentDonations, 'Donations_Report')}>
              <Download size={18} className="mr-2" />
              Export Report
            </Button>
            <Button onClick={() => setIsAdding(true)}>
              <Plus size={18} className="mr-2" />
              Add Donation
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="border-green-100 bg-green-50/30">
                <CardHeader>
                  <CardTitle>Record New Donation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <Input
                        label="Donor / Source"
                        value={formData.donor}
                        onChange={e => setFormData({ ...formData, donor: e.target.value })}
                        required
                        placeholder="e.g. Global Corp"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <Input
                        label="Amount (₹)"
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        required
                        placeholder="5000"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                      <Button type="submit">Record</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-2 h-96">
            <RevenueChart />
          </div>
          <div className="h-96">
            <IncomeCategoryChart />
          </div>
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Fund Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Total Raised</p>
                  <p className="text-3xl font-bold text-gray-900">₹{funds.totalRaised.toLocaleString()}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((funds.totalRaised / funds.target) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Goal: ₹{funds.target.toLocaleString()}</p>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">Recent Transactions</h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {funds.recentDonations.map(d => (
                      <div key={d.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium">{d.donor}</p>
                          <p className="text-gray-500 text-xs">{d.date} • {d.category || 'Donation'}</p>
                        </div>
                        <span className="font-bold text-green-600">+₹{Number(d.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
