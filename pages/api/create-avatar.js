// pages/api/create-avatar.js
// Called from your profile setup page when user submits their 3 photos
// POST to: /api/create-avatar
// Body: FormData with fields: userId, bodyType, imageFrontal, imageSide1, imageSide2

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AVATURN_API_KEY = process.env.AVATURN_API_KEY;
const AVATURN_BASE_URL = 'https://api.avaturn.me/api/v1';

export const config = {
  api: {
    bodyParser: false, // We handle multipart/form-data manually
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse the incoming FormData
  const { IncomingForm } = await import('formidable');
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'Failed to parse form data' });
    }

    const userId = fields.userId?.[0] || fields.userId;
    const bodyType = fields.bodyType?.[0] || fields.bodyType || 'male';

    try {
      // Step 1: Create an Avaturn user
      const userResponse = await fetch(`${AVATURN_BASE_URL}/users/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AVATURN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create Avaturn user');
      }

      const avaturnUser = await userResponse.json();
      const avaturnUserId = avaturnUser.id;

      // Step 2: Save avaturn_user_id to Supabase
      await supabase
        .from('profiles')
        .update({ avaturn_user_id: avaturnUserId })
        .eq('id', userId);

      // Step 3: Create avatar and get upload URL
      const avatarResponse = await fetch(`${AVATURN_BASE_URL}/avatars/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AVATURN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: avaturnUserId }),
      });

      if (!avatarResponse.ok) {
        throw new Error('Failed to initiate avatar creation');
      }

      const avatarData = await avatarResponse.json();
      const uploadUrl = avatarData.upload_url;

      // Step 4: Upload photos to Avaturn
      const fs = await import('fs');
      const FormData = (await import('form-data')).default;

      const uploadForm = new FormData();
      uploadForm.append('body-type', bodyType);
      uploadForm.append('telephoto', 'false');
      uploadForm.append('image-frontal', fs.createReadStream(files.imageFrontal[0].filepath), 'frontal.jpg');
      uploadForm.append('image-side-1', fs.createReadStream(files.imageSide1[0].filepath), 'side1.jpg');
      uploadForm.append('image-side-2', fs.createReadStream(files.imageSide2[0].filepath), 'side2.jpg');

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: uploadForm,
        headers: uploadForm.getHeaders(),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photos to Avaturn');
      }

      // Avatar is now processing — webhook will fire when ready
      return res.status(200).json({
        success: true,
        message: 'Avatar is processing. You will be notified when it is ready.',
        avaturnUserId,
      });

    } catch (error) {
      console.error('Create avatar error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}
