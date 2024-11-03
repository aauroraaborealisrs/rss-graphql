import { GraphQLList, GraphQLNonNull } from 'graphql';
import { IContext } from './types/interfaces.js';
import { Post } from './types/types.js';
import { UUIDType } from './types/uuid.js';
import { PrismaClient } from '@prisma/client';

export const posts = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
  resolve: async (_obj: any, _args: any, context: IContext) => {
    const posts = await context.prisma.post.findMany();
    posts.forEach(post => context.postLoader.prime(post.id, post));
    return posts;
  },
};

export const post = {
  type: Post,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_: any, args: any, { prisma }: { prisma: PrismaClient }) =>
    prisma.post.findUnique({ where: { id: args.id } }),
};
