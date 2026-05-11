/**
 * Simulated data for Demo Mode
 */

export const demoData = {
  emails: [
    {
      id: 'd1',
      subject: 'Project Launch Sync',
      sender_name: 'Sarah Chen',
      sender_email: 'sarah@example.com',
      preview: 'Hi! Can we meet tomorrow at 10am to discuss the launch?',
      received_at: new Date().toISOString(),
      type: 'meeting'
    },
    {
      id: 'd2',
      subject: 'Urgent: Server Down',
      sender_name: 'AWS Alerts',
      sender_email: 'no-reply@amazon.com',
      preview: 'Your instance i-09238 is unresponsive.',
      received_at: new Date(Date.now() - 3600000).toISOString(),
      type: 'urgent'
    }
  ],
  actions: [
    {
      id: 'a1',
      detected: 'Meeting detected',
      action_label: 'Schedule Meeting',
      time_text: 'Tomorrow at 10:00 AM',
      confidence: 0.95,
      urgency: 'High'
    }
  ]
};
