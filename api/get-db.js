export default async function handler(req, res) {
  const repo = 'AlexanderMartinez10/LuAn-Tienda-Online-Oficial';
  const path = 'db.json';
  const token = process.env.GH_TOKEN;
  
  try {
    const getUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
    const options = {
      headers: {
        Accept: 'application/vnd.github.v3.raw'
      }
    };
    if (token) options.headers.Authorization = `Bearer ${token}`;

    const response = await fetch(getUrl, options);
    
    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else if (response.status === 404) {
      // Si no existe el archivo aún, devolvemos arrays vacíos por defecto
      res.status(200).json({ categories: [], products: [] });
    } else {
      const err = await response.text();
      res.status(response.status).json({ error: 'Error al obtener base de datos en vivo', details: err });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno', details: error.message });
  }
}
