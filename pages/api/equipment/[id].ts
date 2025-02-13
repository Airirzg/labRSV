import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data
const equipment = [
  {
    id: '1',
    name: 'Microscope XR-500',
    description: 'High-precision digital microscope with 500x magnification and digital imaging capabilities.',
    category: 'Laboratory',
    available: true,
    image: '/images/microscope.jpg'
  },
  {
    id: '2',
    name: 'Centrifuge Pro',
    description: 'Advanced centrifuge system for sample preparation and analysis.',
    category: 'Laboratory',
    available: false,
    image: '/images/centrifuge.jpg'
  },
  {
    id: '3',
    name: 'Spectrophotometer',
    description: 'UV-Visible spectrophotometer for chemical analysis and research.',
    category: 'Research',
    available: true,
    image: '/images/spectrophotometer.jpg'
  },
  {
    id: '4',
    name: 'PCR Thermal Cycler',
    description: 'High-throughput PCR system for DNA amplification with real-time monitoring.',
    category: 'Research',
    available: false,
    image: '/images/pcr.jpg'
  },
  {
    id: '5',
    name: 'Flow Cytometer',
    description: 'Advanced cell analysis system with multi-parameter detection capabilities.',
    category: 'Medical',
    available: true,
    image: '/images/cytometer.jpg'
  },
  {
    id: '6',
    name: 'Mass Spectrometer',
    description: 'High-resolution mass spectrometer for molecular analysis and identification.',
    category: 'Research',
    available: false,
    image: '/images/mass-spec.jpg'
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const item = equipment.find(e => e.id === id);
    
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: 'Equipment not found' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
