// pages/api/avaturn-webhook.js
// Drop this file into your Next.js project at: pages/api/avaturn-webhook.js
// Set your Avaturn webhook URL to: https://hushafterhours.live/api/avaturn-webhook

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key here (server-side only)
);

const AVATURN_API_KEY = process.env.AVATURN_API_KEY;
const AVATURN_BASE_URL = 'https://api.avaturn.me/api/v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const event = req.body;
  console.log('Avaturn webhook received:', event);

  // Handle avatar.ready event
  if (event.type === 'avatar.ready') {
    const { avatar_id, user_id } = event;

    try {
      // Step 1: Export the avatar to get the GLB URL
      const exportResponse = await fetch(`${AVATURN_BASE_URL}/exports/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AVATURN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_id: avatar_id,
          format: 'glb', // GLB format for Unity/GLTFast
        }),
      });

      if (!exportResponse.ok) {
        const err = await exportResponse.text();
        console.error('Export failed:', err);
        return res.status(500).json({ error: 'Export failed' });
      }

      const exportData = await exportResponse.json();
      const glbUrl = exportData.url; // This is the permanent httpURL

      console.log('GLB URL received:', glbUrl);

      // Step 2: Save GLB URL to Supabase
      // We match on avaturn_user_id which was saved during signup
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({
          avatar_glb_url: glbUrl,
          avatar_id: avatar_id,
          avatar_ready: true,
          updated_at: new Date().toISOString(),
        })
        .eq('avaturn_user_id', user_id);

      if (supabaseError) {
        console.error('Supabase update failed:', supabaseError);
        return res.status(500).json({ error: 'Database update failed' });
      }

      console.log('Avatar saved to Supabase for avaturn_user_id:', user_id);
      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('Webhook handler error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Acknowledge other event types
  return res.status(200).json({ received: true });
}
