import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseExcelFile, validateExcelStructure } from '@/lib/excel-parser';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }

    // Obtener archivo del formulario
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    // Verificar tipo de archivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un Excel (.xlsx o .xls)' },
        { status: 400 }
      );
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar estructura del Excel
    const validation = validateExcelStructure(buffer);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Estructura de archivo inválida',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Parsear datos del Excel
    let excelData;
    try {
      excelData = parseExcelFile(buffer);
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al procesar el archivo Excel' },
        { status: 400 }
      );
    }

    if (excelData.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron datos válidos en el archivo' },
        { status: 400 }
      );
    }

    // Crear registro de carga en la base de datos
    const balanceData = await prisma.balanceData.create({
      data: {
        fileName: file.name,
        userId: payload.userId,
        entries: {
          create: excelData.map(entry => ({
            cuenta: entry.cuenta,
            descripcion: entry.descripcion,
            saldoInicial: entry.saldoInicial,
            saldoFinal: entry.saldoFinal,
            entradas: entry.entradas,
            salidas: entry.salidas,
            fecha: entry.fecha,
            tipo: entry.tipo,
            categoria: entry.categoria,
            moneda: entry.moneda,
          }))
        }
      },
      include: {
        entries: true
      }
    });

    return NextResponse.json({
      message: 'Archivo procesado exitosamente',
      balanceDataId: balanceData.id,
      entriesCount: balanceData.entries.length,
      fileName: file.name,
    });

  } catch (error) {
    console.error('Error en upload:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}