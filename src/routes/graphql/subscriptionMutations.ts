import { GraphQLNonNull, GraphQLString } from 'graphql';
import { IContext } from './types/interfaces.js';
import { UUIDType } from './types/uuid.js';

export const subscribeTo = {
  type: new GraphQLNonNull(GraphQLString),
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: (_, args, context: IContext) => {
    context.userLoader.clear(args.userId);
    return context.prisma.subscribersOnAuthors.create({
      data: {
        subscriberId: args.userId,
        authorId: args.authorId,
      },
    }).then(() => 'Subscribed successfully');
  },
};

export const unsubscribeFrom = {
  type: new GraphQLNonNull(GraphQLString),
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: (_, args, context: IContext) => {
    context.userLoader.clear(args.userId);
    return context.prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      },
    }).then(() => 'Unsubscribed successfully');
  },
};
