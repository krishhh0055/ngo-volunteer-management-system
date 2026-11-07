export const USERS = [
  { id: 'u1', name: 'Admin User', email: 'admin@ngo.org', role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Admin+User' },
  { id: 'u2', name: 'Sarah Staff', email: 'sarah@ngo.org', role: 'staff', avatar: 'https://ui-avatars.com/api/?name=Sarah+Staff' },
  { id: 'u3', name: 'Mike Volunteer', email: 'mike@ngo.org', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Mike+Volunteer' },
  { id: 'u4', name: 'Sarah Volunteer', email: 'sarah.v@ngo.org', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Sarah+Volunteer' },
  { id: 'u5', name: 'David Volunteer', email: 'david.v@ngo.org', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=David+Volunteer' },
  { id: 'u6', name: 'Emily Volunteer', email: 'emily.v@ngo.org', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Emily+Volunteer' },
  { id: 'u7', name: 'Jessica Volunteer', email: 'jessica.v@ngo.org', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Jessica+Volunteer' },
  { id: 'u8', name: 'Robert Volunteer', email: 'robert.v@ngo.org', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Robert+Volunteer' },
  { id: 'u9', name: 'Sophia Volunteer', email: 'sophia.v@ngo.org', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Sophia+Volunteer' },
  { id: 'u10', name: 'James Staff', email: 'james.s@ngo.org', role: 'staff', avatar: 'https://ui-avatars.com/api/?name=James+Staff' },
  { id: 'u11', name: 'John Staff', email: 'john@ngo.org', role: 'staff', avatar: 'https://ui-avatars.com/api/?name=John+Staff' },
];

export const PROJECTS = [
  {
    id: 'p1',
    title: 'Clean Water Initiative',
    description: 'Providing clean drinking water to remote villages.',
    budget: 50000,
    raised: 35000,
    status: 'In Progress',
    endDate: '2026-12-31',
    assignedStaff: ['u2'],
    progress: 65
  },
  {
    id: 'p2',
    title: 'Education for All',
    description: 'Building schools and providing supplies.',
    budget: 120000,
    raised: 90000,
    status: 'In Progress',
    endDate: '2026-06-30',
    assignedStaff: ['u2'],
    progress: 75
  },
  {
    id: 'p3',
    title: 'Health Camp 2026',
    description: 'Free medical checkups for 5000 people.',
    budget: 25000,
    raised: 5000,
    status: 'Planning',
    endDate: '2026-03-15',
    assignedStaff: [],
    progress: 10
  }
];

export const FUNDS = {
  totalRaised: 130000,
  target: 200000,
  recentDonations: [
    { id: 'd1', donor: 'John Doe', amount: 500, date: '2026-01-20', project: 'Clean Water Initiative' },
    { id: 'd2', donor: 'Jane Smith', amount: 1200, date: '2026-01-22', project: 'Education for All' },
    { id: 'd3', donor: 'Corp Inc.', amount: 5000, date: '2026-01-25', project: 'Health Camp 2026' },
  ]
};

export const TASKS = [
  { id: 't1', title: 'Survey Village A', projectId: 'p1', assignedTo: 'u3', status: 'Pending', dueDate: '2026-02-10' },
  { id: 't2', title: 'Distribute Books', projectId: 'p2', assignedTo: 'u3', status: 'Completed', dueDate: '2026-01-15' },
];

export const EXPENSES = [
  { id: 'e1', title: 'Transport to Village A', projectId: 'p1', amount: 500, date: '2026-01-20', addedBy: 'u2' },
  { id: 'e2', title: 'Printing Flyers', projectId: 'p1', amount: 1200, date: '2026-01-22', addedBy: 'u2' },
];
