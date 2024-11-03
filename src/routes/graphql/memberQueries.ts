import { GraphQLList, GraphQLNonNull } from 'graphql';
import { IContext } from './types/interfaces.js';
import { MemberIdType, MemberType } from './types/types.js';
import { PrismaClient } from '@prisma/client';

export const memberTypes = {
  type: new GraphQLList(MemberType),
  resolve: async (_obj: any, _args: any, context: IContext) => {
    const memberTypes = await context.prisma.memberType.findMany();
    memberTypes.forEach(memberType => context.memberTypeLoader.prime(memberType.id, memberType));
    return memberTypes;
  },
};

export const memberType = {
  type: MemberType,
  args: { id: { type: new GraphQLNonNull(MemberIdType) } },
  resolve: (_: any, args: any, { prisma }: { prisma: PrismaClient }) =>
    prisma.memberType.findUnique({ where: { id: args.id } }),
};
