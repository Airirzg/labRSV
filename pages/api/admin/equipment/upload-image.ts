import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: function ({ mimetype }) {
        return mimetype ? mimetype.includes('image') : false;
      },
    });

    const [fields, files] = await form.parse(req);
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ message: 'Invalid file type. Only JPG, PNG and GIF allowed.' });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${file.originalFilename}`;
    const newPath = path.join(uploadsDir, fileName);

    // Move file to final location
    fs.renameSync(file.filepath, newPath);

    // Return the URL for the uploaded file
    const imageUrl = `/uploads/${fileName}`;
    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Error uploading image' });
  }
}
