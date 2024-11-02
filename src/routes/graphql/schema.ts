
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLEnumType,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { createMemberTypeLoader, createPostLoader, createProfileLoader, createUserLoader } from './loaders.js';
import { PrismaClient } from '@prisma/client';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

interface Subscriptions {
  userSubscribedTo?: boolean;
  subscribedToUser?: boolean;
}

interface IContext {
  prisma: PrismaClient;
  userLoader: ReturnType<typeof createUserLoader>;
  memberTypeLoader: ReturnType<typeof createMemberTypeLoader>;
  postLoader: ReturnType<typeof createPostLoader>;
  profileLoader: ReturnType<typeof createProfileLoader>;
}

const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(MemberTypeId) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberTypeType),
      resolve: async (profile, _, { memberTypeLoader }) => {
        return memberTypeLoader.load(profile.memberTypeId);
      },
    },
  },
});


const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (user, _, { profileLoader }) => {
        return profileLoader.load(user.id);
      },
    },
    posts: {
      type: new GraphQLList(new GraphQLNonNull(PostType)),
      resolve: async (user, _, { postLoader }) => {
        return postLoader.load(user.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(new GraphQLNonNull(UserType)),
      resolve: async (user, _, { subscriptionsByUserId }) => {
        return subscriptionsByUserId.load(user.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(new GraphQLNonNull(UserType)),
      resolve: async (user, _, { subscriptionsByUserId }) => {
        return subscriptionsByUserId.load(user.id);
      },
    },
  }),
});


const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  },
});

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

  const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});  

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeId },
  },
});

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});


const RootQueryType: GraphQLObjectType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    memberTypes: {
      type: new GraphQLList(MemberTypeType),
      resolve: async (_obj, _args, context) => {
        const memberTypes = await context.prisma.memberType.findMany();
        memberTypes.forEach((memberType) =>
          (context as IContext).memberTypeLoader.prime(memberType.id, memberType),
        );

        return memberTypes;
      },
    },
    memberType: {
      type: MemberTypeType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      resolve: (_, args, { prisma }: { prisma: PrismaClient }) => {
        return prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    },

    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (_obj, _args, context, info) => {
        const parsedResolveInfo = parseResolveInfo(info);
        const fields = parsedResolveInfo?.fieldsByTypeName.User;
        const include: Subscriptions = {};
        if (fields && 'userSubscribedTo' in fields) {
          include.userSubscribedTo = true;
        }
        if (fields && 'subscribedToUser' in fields) {
          include.subscribedToUser = true;
        }

        const users = await context.prisma.user.findMany({
          include,
        });
        users.forEach((user) => (context as IContext).userLoader.prime(user.id, user));
        return users;
      },
    },

    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, context) => {
        return await (context as IContext).userLoader.load(args.id);
      },
    },

    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: async (_obj, _args, context) => {
        const posts = await context.prisma.post.findMany();
        posts.forEach((post) => (context as IContext).postLoader.prime(post.id, post));

        return posts;
      },
    },

    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, { prisma }) => {
        return await prisma.post.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    },

    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
      resolve: async (_obj, _args, context) => {
        const profiles = await context.prisma.profile.findMany();
        profiles.forEach((profile) =>
          (context as IContext).profileLoader.prime(profile.id, profile),
        );

        return profiles;
      },
    },

    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, { prisma }) => {
        return await prisma.profile.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    },
  }),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: async (_, { dto }, { prisma }) => prisma.user.create({ data: dto }),
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: async (_, { dto }, { prisma }) => prisma.profile.create({ data: dto }),
    },
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: async (_, { dto }, { prisma }) => prisma.post.create({ data: dto }),
    },
    changePost: {
      type: new GraphQLNonNull(PostType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) =>
        prisma.post.update({
          where: { id },
          data: dto,
          select: { id: true, title: true, content: true },
        }),
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) =>
        prisma.profile.update({
          where: { id },
          data: dto,
          select: { id: true, isMale: true, yearOfBirth: true, memberTypeId: true },
        }),
    },
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_, { id, dto }, { prisma }) =>
        prisma.user.update({
          where: { id },
          data: dto,
          select: { id: true, name: true, balance: true },
        }),
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.user.delete({ where: { id } });
        return 'User deleted successfully';
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.post.delete({ where: { id } });
        return 'Post deleted successfully';
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }, { prisma }) => {
        await prisma.profile.delete({ where: { id } });
        return 'Profile deleted successfully';
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }, { prisma }) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId: authorId,
          },
        });
        return 'Subscribed successfully';
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }, { prisma }) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: { subscriberId: userId, authorId: authorId },
          },
        });
        return 'Unsubscribed successfully';
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutation,
});
