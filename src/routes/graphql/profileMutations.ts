import { GraphQLNonNull, GraphQLString } from 'graphql';
import { IContext } from './types/interfaces.js';
import { ChangeProfileInput, CreateProfileInput, Profile } from './types/types.js';
import { UUIDType } from './types/uuid.js';

export const createProfile = {
  type: new GraphQLNonNull(Profile),
  args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
  resolve: (_, args, { prisma }) =>
    prisma.profile.create({ data: args.dto }).then(profile => profile),
};

export const changeProfile = {
  type: new GraphQLNonNull(Profile),
  args: {
    id: { type: new GraphQLNonNull(UUIDType)},
    dto: { type: new GraphQLNonNull(ChangeProfileInput) },
  },
  resolve: (_, args, { prisma }: IContext) =>
    prisma.profile.update({
      where: { id: args.id },
      data: args.dto,
    }).then(profile => profile),
};

export const deleteProfile = {
  type: GraphQLString,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_, args, { prisma }) =>
    prisma.profile.delete({
      where: { id: args.id },
    }).then(() => null),
};
