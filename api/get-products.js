const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'products.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    res.status(200).json([]); // Devolver vacío si no existe
  }
}
