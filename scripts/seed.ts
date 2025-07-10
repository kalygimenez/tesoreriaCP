import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando base de datos...');

  // Crear usuario administrador
  const adminEmail = 'admin@balancedashboard.com';
  const adminPassword = 'admin123';

  // Verificar si ya existe el admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('✅ Usuario administrador ya existe');
  } else {
    const hashedPassword = await hashPassword(adminPassword);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      }
    });

    console.log('✅ Usuario administrador creado:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Contraseña: ${adminPassword}`);
  }

  // Crear algunos usuarios de ejemplo
  const users = [
    {
      name: 'Juan Pérez',
      email: 'juan@empresa.com',
      password: 'usuario123',
      role: 'USER' as const,
    },
    {
      name: 'María García',
      email: 'maria@empresa.com',
      password: 'usuario123',
      role: 'MANAGER' as const,
    },
    {
      name: 'Carlos López',
      email: 'carlos@empresa.com',
      password: 'usuario123',
      role: 'VIEWER' as const,
    },
  ];

  for (const userData of users) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!existing) {
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          isActive: true,
        }
      });

      console.log(`✅ Usuario creado: ${user.name} (${user.email})`);
    }
  }

  console.log('🎉 Base de datos inicializada correctamente');
  console.log('\n📋 Credenciales de acceso:');
  console.log('Admin: admin@balancedashboard.com / admin123');
  console.log('Usuario: juan@empresa.com / usuario123');
  console.log('Manager: maria@empresa.com / usuario123');
  console.log('Viewer: carlos@empresa.com / usuario123');
}

main()
  .catch((e) => {
    console.error('❌ Error al sembrar la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });