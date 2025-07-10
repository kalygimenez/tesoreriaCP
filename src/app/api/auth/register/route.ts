import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}