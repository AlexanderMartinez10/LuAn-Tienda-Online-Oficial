const fetch = require('node-fetch');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cat, name, desc, price, stock, img } = req.body;
  const token = process.env.GH_TOKEN; // Usaremos variable de entorno en Vercel
  const repo = 'AlexanderMartinez10/LuAn-Tienda-Online-Oficial';
  const path = 'products.json';

  try {
    // 1. Obtener el archivo actual y su SHA de GitHub
    const getUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const response = await fetch(getUrl, {
      headers: { Authorization: `token ${token}` }
    });
    const fileData = await response.json();
    const sha = fileData.sha;
    const content = Buffer.from(fileData.content, 'base64').toString();
    const products = JSON.parse(content);

    // 2. Agregar el nuevo producto
    products.push({ cat, name, desc, price, stock, img });

    // 3. Subir el nuevo archivo a GitHub
    const newContent = Buffer.from(JSON.stringify(products, null, 2)).toString('base64');
    const putResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Añadir producto: ${name}`,
        content: newContent,
        sha: sha
      })
    });

    if (putResponse.ok) {
      res.status(200).json({ success: true, message: 'Producto guardado y sincronizando con GitHub' });
    } else {
      const errorData = await putResponse.json();
      res.status(500).json({ error: 'Error al subir a GitHub', details: errorData });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
}
