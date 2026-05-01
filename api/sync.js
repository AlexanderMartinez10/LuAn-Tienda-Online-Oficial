export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { products, categories, pass } = req.body;
  
  if (pass !== 'luan2024') {
    return res.status(401).json({ error: 'Unauthorized: Incorrect password' });
  }

  const token = process.env.GH_TOKEN;
  const repo = 'AlexanderMartinez10/LuAn-Tienda-Online-Oficial';
  const path = 'db.json';

  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    const getUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    let sha = undefined;
    if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
    } else if (getResponse.status !== 404) {
        const errData = await getResponse.json();
        return res.status(500).json({ error: 'Error getting db.json from GitHub', details: errData });
    }

    const newDb = { categories: categories || [], products: products || [] };
    const newContent = Buffer.from(JSON.stringify(newDb, null, 2), 'utf8').toString('base64');

    const putResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Sincronización de base de datos desde la web`,
        content: newContent,
        sha: sha
      })
    });

    if (putResponse.ok) {
      res.status(200).json({ success: true, message: 'Base de datos sincronizada' });
    } else {
      const errorData = await putResponse.json();
      res.status(500).json({ error: 'Error al subir a GitHub', details: errorData });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
}
