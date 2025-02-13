import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/utils/auth';

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
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

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

    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          resolve(res.status(500).json({ message: 'Error uploading file' }));
          return;
        }

        const file = files.image?.[0];
        if (!file) {
          resolve(res.status(400).json({ message: 'No file uploaded' }));
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype || '')) {
          fs.unlinkSync(file.filepath);
          resolve(res.status(400).json({ message: 'Invalid file type. Only JPG, PNG and GIF allowed.' }));
          return;
        }

        try {
          // Generate unique filename
          const fileName = `${Date.now()}-${file.originalFilename}`;
          const newPath = path.join(uploadsDir, fileName);

          // Rename file to include timestamp
          fs.renameSync(file.filepath, newPath);

          // Return the relative URL
          const imageUrl = `/uploads/${fileName}`;
          resolve(res.status(200).json({ imageUrl }));
        } catch (error) {
          console.error('Error processing file:', error);
          resolve(res.status(500).json({ message: 'Error processing file' }));
        }
      });
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
