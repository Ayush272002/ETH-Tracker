import prisma from '@repo/db/client';

const getUser = async (userId: string) => {
  let user = await prisma.user.findFirst({
    where: {
      discordId: userId,
    },
    include: {
      wallets: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        discordId: userId,
      },
      include: {
        wallets: true,
      },
    });
  }

  return user;
};

export { getUser };
