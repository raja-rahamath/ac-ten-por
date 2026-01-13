import { NextRequest, NextResponse } from 'next/server';

const TENANT_API_URL = process.env.TENANT_API_URL || 'http://localhost:4001';

/**
 * Public endpoint to fetch available services (complaint types)
 * No authentication required - returns only public-safe fields
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch complaint types from backend API (using service account or public endpoint)
    const response = await fetch(`${TENANT_API_URL}/api/v1/complaint-types`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If backend requires auth, return fallback services
      return NextResponse.json({
        success: true,
        data: getDefaultServices(),
      });
    }

    const data = await response.json();

    // Filter to only public-safe fields (no pricing, internal IDs, etc.)
    const publicServices = (data.data || []).map((service: any) => ({
      id: service.id,
      name: service.name,
      nameAr: service.nameAr || null,
      description: service.description || null,
    }));

    return NextResponse.json({
      success: true,
      data: publicServices,
    });
  } catch (error: any) {
    console.error('Public services fetch error:', error);

    // Return default services on error for better UX
    return NextResponse.json({
      success: true,
      data: getDefaultServices(),
    });
  }
}

/**
 * Default services to show when backend is unavailable
 */
function getDefaultServices() {
  return [
    {
      id: 'plumbing',
      name: 'Plumbing',
      nameAr: 'السباكة',
      description: 'Professional plumbing services including repairs, installations, and maintenance for all your water and drainage needs.',
    },
    {
      id: 'ac-maintenance',
      name: 'AC Maintenance',
      nameAr: 'صيانة التكييف',
      description: 'Complete air conditioning services including cleaning, repairs, and regular maintenance to keep your home cool.',
    },
    {
      id: 'electrical',
      name: 'Electrical',
      nameAr: 'الكهرباء',
      description: 'Certified electrical services for installations, repairs, and safety inspections by licensed professionals.',
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      nameAr: 'التنظيف',
      description: 'Professional home and office cleaning services including deep cleaning, regular maintenance, and specialized treatments.',
    },
    {
      id: 'pest-control',
      name: 'Pest Control',
      nameAr: 'مكافحة الآفات',
      description: 'Safe and effective pest control solutions for homes and businesses, including prevention and treatment services.',
    },
    {
      id: 'painting',
      name: 'Painting',
      nameAr: 'الدهان',
      description: 'Interior and exterior painting services with quality materials and experienced painters for a perfect finish.',
    },
  ];
}
