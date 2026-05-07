export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const AVATURN_API_KEY = process.env.AVATURN_API_KEY
  if (!AVATURN_API_KEY) return res.status(500).json({ error: 'API key not configured' })

  try {
    const response = await fetch('https://api.avaturn.me/v1/sessions/new', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AVATURN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: req.body.userId || 'guest'
      })
    })

    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    console.error('Avaturn session error:', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
}
