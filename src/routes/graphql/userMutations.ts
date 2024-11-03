import { GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from 'graphql';
import { IContext } from './types/interfaces.js';
import { ChangeUserInput, CreateUserInput, User } from './types/types.js';
import { UUIDType } from './types/uuid.js';

export const createUser: GraphQLFieldConfig<any, any> = {
  type: new GraphQLNonNull(User),
  args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
  resolve: (_, args, { prisma }) =>
    prisma.user
      .create({
        data: { name: args.dto.name, balance: args.dto.balance },
      })
      .then((user) => user),
};

export const changeUser: GraphQLFieldConfig<any, any> = {
  type: new GraphQLNonNull(User),
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeUserInput) },
  },
  resolve: (_, args, context: IContext) => {
    context.userLoader.clear(args.id);

    return context.prisma.user
      .update({
        where: { id: args.id },
        data: args.dto,
      })
      .then((user) => user);
  },
};

export const deleteUser = {
  type: GraphQLString,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_, args, context: IContext) => {
    context.userLoader.clear(args.id);

    return context.prisma.user
      .delete({
        where: { id: args.id },
      })
      .then(() => null);
  },
};
