import { GraphQLList, GraphQLNonNull } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { IContext, IsubsFields } from './types/interfaces.js';
import { User } from './types/types.js';
import { UUIDType } from './types/uuid.js';

export const users = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
  resolve: async (_obj: any, _args: any, context: IContext, info: any) => {
    const parsedInfo = parseResolveInfo(info);
    const fields = parsedInfo?.fieldsByTypeName.User;

    const include: IsubsFields = {};
    if (fields && fields.hasOwnProperty('userSubscribedTo')) {
      include.userSubscribedTo = true;
    }
    if (fields && fields.hasOwnProperty('subscribedToUser')) {
      include.subscribedToUser = true;
    }

    const users = await context.prisma.user.findMany({ include });
    users.forEach((user) => context.userLoader.prime(user.id, user));
    return users;
  },
};

export const user = {
  type: User,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: (_: any, args: any, context: IContext) => context.userLoader.load(args.id),
};
