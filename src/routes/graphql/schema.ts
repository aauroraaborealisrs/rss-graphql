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
        resolve: async (profile, _, { prisma }) => {
          return prisma.memberType.findUnique({ where: { id: profile.memberTypeId } });
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
        resolve: async (user, _, { prisma }) => {
          return prisma.profile.findUnique({ where: { userId: user.id } });
        },
      },
      posts: {
        type: new GraphQLList(new GraphQLNonNull(PostType)),
        resolve: async (user, _, { prisma }) => {
          return prisma.post.findMany({ where: { authorId: user.id } });
        },
      },
      userSubscribedTo: {
        type: new GraphQLList(new GraphQLNonNull(UserType)),
        resolve: async (user, _, { prisma }) => {
          const subscriptions = await prisma.subscribersOnAuthors.findMany({
            where: { subscriberId: user.id },
            include: { author: true },
          });
          return subscriptions.map((sub) => sub.author);
        },
      },
      subscribedToUser: {
        type: new GraphQLList(new GraphQLNonNull(UserType)),
        resolve: async (user, _, { prisma }) => {
          const subscribers = await prisma.subscribersOnAuthors.findMany({
            where: { authorId: user.id },
            include: { subscriber: true },
          });
          return subscribers.map((sub) => sub.subscriber);
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
  
  const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLList(new GraphQLNonNull(MemberTypeType)),
        resolve: async (_, __, { prisma }) => prisma.memberType.findMany(),
      },
      memberType: {
        type: MemberTypeType,
        args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
        resolve: async (_, { id }, { prisma }) => prisma.memberType.findUnique({ where: { id } }),
      },
      users: {
        type: new GraphQLList(new GraphQLNonNull(UserType)),
        resolve: async (_, __, { prisma }) => prisma.user.findMany(),
      },
      user: {
        type: UserType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),
      },
      posts: {
        type: new GraphQLList(new GraphQLNonNull(PostType)),
        resolve: async (_, __, { prisma }) => prisma.post.findMany(),
      },
      post: {
        type: PostType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_, { id }, { prisma }) => prisma.post.findUnique({ where: { id } }),
      },
      profiles: {
        type: new GraphQLList(new GraphQLNonNull(ProfileType)),
        resolve: async (_, __, { prisma }) => prisma.profile.findMany(),
      },
      profile: {
        type: ProfileType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_, { id }, { prisma }) => prisma.profile.findUnique({ where: { id } }),
      },
    },
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
  