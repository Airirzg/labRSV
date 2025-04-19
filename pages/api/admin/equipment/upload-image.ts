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
      maxFiles: 10, // Increase max files to support multiple uploads
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

        // Handle multiple files
        const uploadedFiles = files.image;
        if (!uploadedFiles || uploadedFiles.length === 0) {
          resolve(res.status(400).json({ message: 'No files uploaded' }));
          return;
        }

        try {
          // Process each file
          const imageUrls = uploadedFiles.map(file => {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.mimetype || '')) {
              // Skip invalid files
              console.warn(`Skipping file with invalid type: ${file.mimetype}`);
              fs.unlinkSync(file.filepath);
              return null;
            }

            // Generate unique filename
            const originalName = file.originalFilename || 'unnamed';
            // Sanitize filename: remove spaces and special characters
            const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}-${sanitizedName}`;
            const newPath = path.join(uploadsDir, fileName);

            // Rename file to include timestamp
            fs.renameSync(file.filepath, newPath);

            // Return the relative URL with proper encoding
            return `/uploads/${encodeURIComponent(fileName)}`;
          }).filter(url => url !== null); // Filter out any null values (invalid files)

          if (imageUrls.length === 0) {
            resolve(res.status(400).json({ message: 'No valid images uploaded' }));
            return;
          }

          // Return all image URLs
          resolve(res.status(200).json({ 
            imageUrl: imageUrls[0], // First image as primary
            imageUrls: imageUrls // All images
          }));
        } catch (error) {
          console.error('Error processing files:', error);
          resolve(res.status(500).json({ message: 'Error processing files' }));
        }
      });
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
