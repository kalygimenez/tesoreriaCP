import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando base de datos...');

  const adminEmail = 'admin@balancedashboard.com';
  const adminPassword = 'admin123';

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

  console.log('🎉 Base de datos inicializada correctamente');
  console.log('\n📋 Credenciales de acceso:');
  console.log('Admin: admin@balancedashboard.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
