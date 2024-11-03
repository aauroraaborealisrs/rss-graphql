import { GraphQLNonNull, GraphQLString } from 'graphql';
import { ChangePostInput, CreatePostInput, Post } from './types/types.js';
import { UUIDType } from './types/uuid.js';

export const createPost = {
  type: new GraphQLNonNull(Post),
  args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
  resolve: (_, args, { prisma }) =>
    prisma.post.create({ data: args.dto }).then(post => post),
};

export const changePost = {
  type: new GraphQLNonNull(Post),
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangePostInput) },
  },
  resolve: (_, args, { prisma }) =>
    prisma.post.update({
      where: { id: args.id },
      data: args.dto,
    }).then(post => post),
};

export const deletePost = {
  type: GraphQLString,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_, args, { prisma }) =>
    prisma.post.delete({
      where: { id: args.id },
    }).then(() => null),
};
