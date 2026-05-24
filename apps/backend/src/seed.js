import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: 'Johan',
      email: 'joudejans76@gmail.com',
      password: 'Sagitarius1%',
      role: 'admin',
      approved: true,
      blocked: false,
    },
    {
      name: 'LottoLoJo',
      email: 'lottolojo@gmail.com',
      password: 'Sagitarius1%',
      role: 'admin',
      approved: true,
      blocked: false,
    },
    {
      name: 'Nettie',
      email: 'fvanoorspronk@hotmail.com',
      password: 'HenkHenk10',
      role: 'participant',
      approved: true,
      blocked: false,
    },
  ];

  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: password_hash,
        role: user.role,
        approved: user.approved,
        blocked: user.blocked,
        profile: {
          create: { creditsBalance: 0, active: true },
        },
      },
    });
  }
  console.log('Seed klaar: Johan, LottoLoJo en Nettie zijn aangemaakt.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
