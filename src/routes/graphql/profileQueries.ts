import { PrismaClient } from '@prisma/client';
import { GraphQLList, GraphQLNonNull } from 'graphql';
import { Profile } from './types/types.js';
import { IContext } from './types/interfaces.js';
import { UUIDType } from './types/uuid.js';

export const profiles = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
  resolve: async (_obj: any, _args: any, context: IContext) => {
    const profiles = await context.prisma.profile.findMany();
    profiles.forEach((profile) => context.profileLoader.prime(profile.id, profile));
    return profiles;
  },
};

export const profile = {
  type: Profile,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_: any, args: any, { prisma }: { prisma: PrismaClient }) =>
    prisma.profile.findUnique({ where: { id: args.id } }),
};
