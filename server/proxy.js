const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const API_TOKEN = process.env.EXPO_PUBLIC_HUGGINGFACE_API_TOKEN;

const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/api/try-on', upload.fields([
  { name: 'person_image', maxCount: 1 },
  { name: 'garment_image', maxCount: 1 },
]), async (req, res) => {
  try {
    const personFile = req.files['person_image'][0];
    const garmentFile = req.files['garment_image'][0];

    const models = [
      'yisol/IDM-VTON',
      'Kwai-Kolors/Kolors-Virtual-Try-On',
    ];

    let lastError = null;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);

        const formData = new FormData();
        formData.append('person_image', fs.createReadStream(personFile.path), personFile.originalname);
        formData.append('garment_image', fs.createReadStream(garmentFile.path), garmentFile.originalname);

        const response = await fetch(`${HF_API_URL}/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            ...formData.getHeaders(),
          },
          body: formData,
        });

        const contentType = response.headers.get('content-type') || '';

        if (!response.ok) {
          const errText = await response.text();
          let errMsg = errText;
          try {
            const errJson = JSON.parse(errText);
            errMsg = errJson.error || errText;
          } catch {}
          throw new Error(errMsg);
        }

        if (contentType.includes('application/json')) {
          const json = await response.json();
          if (json.error) throw new Error(json.error);
          if (json.estimated_time) {
            throw new Error(`Модель загружается (~${Math.round(json.estimated_time)}с)`);
          }
          throw new Error('unexpected JSON');
        }

        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');
        const mimeType = contentType.includes('png') ? 'image/png' : 'image/jpeg';

        fs.unlinkSync(personFile.path);
        fs.unlinkSync(garmentFile.path);

        return res.json({
          success: true,
          image: `data:${mimeType};base64,${base64}`,
        });
      } catch (error) {
        console.log(`Model ${model} failed:`, error.message);
        lastError = error.message;
        continue;
      }
    }

    fs.unlinkSync(personFile.path);
    fs.unlinkSync(garmentFile.path);

    return res.json({
      success: false,
      error: lastError || 'Все модели недоступны',
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
