export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, negativePrompt, contentClass, style, size } = req.body;

    const FEEDIFY_API_KEY = process.env.FEEDIFY_API_KEY;

    if (!FEEDIFY_API_KEY) {
      return res.status(500).json({ 
        error: 'API key tidak ditemukan',
        message: 'Mohon set FEEDIFY_API_KEY di Vercel Environment Variables'
      });
    }

    const requestBody = {
      prompt: prompt,
      contentClass: contentClass || 'photo',
      size: {
        width: size?.width || 1024,
        height: size?.height || 1024
      },
      n: 1
    };

    if (negativePrompt) {
      requestBody.negativePrompt = negativePrompt;
    }

    if (style) {
      requestBody.styles = {
        presets: [style]
      };
    }

    const response = await fetch('https://api.feedify.pro/v1/firefly/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FEEDIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Feedify API Error:', data);
      return res.status(response.status).json({
        error: 'Feedify Firefly API error',
        message: data.message || data.error || 'Terjadi kesalahan saat generate gambar',
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
