import { PrismaClient } from '@prisma/client';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { Post, User, MemberIdType, MemberType, Profile, CreatePostInput, ChangeUserInput, ChangeProfileInput, ChangePostInput, CreateProfileInput, CreateUserInput,} from './types/types.js';
import { UUIDType } from './types/uuid.js';
import { IContext, IsubsFields } from './types/interfaces.js';

const RootQueryType: GraphQLObjectType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_obj, _args, context) => {
        const memberTypes = await context.prisma.memberType.findMany();
        
        for (const memberType of memberTypes) {
          (context as IContext).memberTypeLoader.prime(memberType.id, memberType);
        }
        
        return memberTypes;
      },
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(MemberIdType) } },
      resolve: (_, args, { prisma }: { prisma: PrismaClient }) => 
        prisma.memberType.findUnique({ where: { id: args.id } }),
    },

    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (_obj, _args, context, info) => {
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
        
        for (const user of users) {
          (context as IContext).userLoader.prime(user.id, user);
        }
        
        return users;
      },
    },

    user: {
      type: User,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, context) =>
        (context as IContext).userLoader.load(args.id),
    },

    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (_obj, _args, context) => {
        const posts = await context.prisma.post.findMany();
        
        for (const post of posts) {
          (context as IContext).postLoader.prime(post.id, post);
        }
        
        return posts;
      },
    },

    post: {
      type: Post,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, { prisma }) =>
        prisma.post.findUnique({ where: { id: args.id } }),
    },

    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: async (_obj, _args, context) => {
        const profiles = await context.prisma.profile.findMany();
        
        for (const profile of profiles) {
          (context as IContext).profileLoader.prime(profile.id, profile);
        }
        
        return profiles;
      },
    },

    profile: {
      type: Profile,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, { prisma }) =>
        prisma.profile.findUnique({ where: { id: args.id } }),
    },
  }),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutations',
  fields: () => ({
    createUser: {
      type: new GraphQLNonNull(User),
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: (_, args, { prisma }) => 
        prisma.user.create({
          data: { name: args.dto.name, balance: args.dto.balance },
        }).then(user => user),
    },
    createProfile: {
      type: new GraphQLNonNull(Profile),
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: (_, args, { prisma }) =>
        prisma.profile.create({ data: args.dto }).then(profile => profile),
    },
    createPost: {
      type: new GraphQLNonNull(Post),
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: (_, args, { prisma }) =>
        prisma.post.create({ data: args.dto }).then(post => post),
    },
    changePost: {
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
    },
    changeProfile: {
      type: new GraphQLNonNull(Profile),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: (_, args, { prisma }) =>
        prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        }).then(profile => profile),
    },
    changeUser: {
      type: new GraphQLNonNull(User),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: (_, args, context) => {
        (context as IContext).userLoader.clear(args.id);

        return context.prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        }).then(user => user);
      },
    },
    deleteUser: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, context) => {
        (context as IContext).userLoader.clear(args.id);

        return context.prisma.user.delete({
          where: { id: args.id },
        }).then(() => null);
      },
    },
    deletePost: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, { prisma }) =>
        prisma.post.delete({
          where: { id: args.id },
        }).then(() => null),
    },
    deleteProfile: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: (_, args, { prisma }) =>
        prisma.profile.delete({
          where: { id: args.id },
        }).then(() => null),
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, args, context) => {
        (context as IContext).userLoader.clear(args.userId);

        return context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: args.userId,
            authorId: args.authorId,
          },
        }).then(() => 'Subscribed successfully');
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, args, context) => {
        (context as IContext).userLoader.clear(args.userId);

        return context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          },
        }).then(() => 'Unsubscribed successfully');
      },
    },
  }),
});


export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutation,
});