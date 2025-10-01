// API entry point for Vercel
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Inventory API is running on Vercel',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
}