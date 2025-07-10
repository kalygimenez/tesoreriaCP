import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
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

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }

    // Obtener entradas de balance del usuario
    let balanceData;
    
    if (user.role === 'ADMIN') {
      // Admin puede ver todos los datos
      balanceData = await prisma.balanceData.findMany({
        include: {
          entries: {
            orderBy: { createdAt: 'desc' },
            take: 50, // Limitar a las últimas 50 entradas
          },
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { uploadDate: 'desc' },
        take: 10, // Últimas 10 cargas
      });
    } else {
      // Usuarios normales solo ven sus propios datos
      balanceData = await prisma.balanceData.findMany({
        where: { userId: payload.userId },
        include: {
          entries: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          }
        },
        orderBy: { uploadDate: 'desc' },
        take: 10,
      });
    }

    // Aplanar las entradas para facilitar el uso en el frontend
    const entries = balanceData.flatMap(data => 
      data.entries.map(entry => ({
        id: entry.id,
        cuenta: entry.cuenta,
        descripcion: entry.descripcion,
        saldoInicial: entry.saldoInicial,
        saldoFinal: entry.saldoFinal,
        entradas: entry.entradas,
        salidas: entry.salidas,
        fecha: entry.fecha.toISOString(),
        tipo: entry.tipo,
        categoria: entry.categoria,
        moneda: entry.moneda,
      }))
    );

    return NextResponse.json({
      user,
      entries,
      uploads: balanceData.map(data => ({
        id: data.id,
        fileName: data.fileName,
        uploadDate: data.uploadDate.toISOString(),
        entriesCount: data.entries.length,
        uploader: user.role === 'ADMIN' ? data.user?.name : undefined,
      }))
    });

  } catch (error) {
    console.error('Error en dashboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}