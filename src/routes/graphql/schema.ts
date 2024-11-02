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
  import { PrismaClient } from '@prisma/client';
  
  const prisma = new PrismaClient();
  
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
        resolve: async (profile) => {
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
        resolve: async (user) => {
          return prisma.profile.findUnique({ where: { userId: user.id } });
        },
      },
      posts: {
        type: new GraphQLList(new GraphQLNonNull(PostType)),
        resolve: async (user) => {
          return prisma.post.findMany({ where: { authorId: user.id } });
        },
      },
      userSubscribedTo: {
        type: new GraphQLList(new GraphQLNonNull(UserType)),
        resolve: async (user) => {
          const subscriptions = await prisma.subscribersOnAuthors.findMany({
            where: { subscriberId: user.id },
            include: { author: true },
          });
          return subscriptions.map((sub) => sub.author);
        },
      },
      subscribedToUser: {
        type: new GraphQLList(new GraphQLNonNull(UserType)),
        resolve: async (user) => {
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
  
  const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLList(new GraphQLNonNull(MemberTypeType)),
        resolve: async () => prisma.memberType.findMany(),
      },
      memberType: {
        type: MemberTypeType,
        args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
        resolve: async (_, { id }) => prisma.memberType.findUnique({ where: { id } }),
      },
      users: {
        type: new GraphQLList(new GraphQLNonNull(UserType)),
        resolve: async () => prisma.user.findMany(),
      },
      user: {
        type: UserType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_, { id }) => prisma.user.findUnique({ where: { id } }),
      },
      posts: {
        type: new GraphQLList(new GraphQLNonNull(PostType)),
        resolve: async () => prisma.post.findMany(),
      },
      post: {
        type: PostType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_, { id }) => prisma.post.findUnique({ where: { id } }),
      },
      profiles: {
        type: new GraphQLList(new GraphQLNonNull(ProfileType)),
        resolve: async () => prisma.profile.findMany(),
      },
      profile: {
        type: ProfileType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_, { id }) => prisma.profile.findUnique({ where: { id } }),
      },
    },
  });
    
  const Mutation = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
      createUser: {
        type: new GraphQLNonNull(UserType),
        args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
        resolve: async (_, { dto }) => prisma.user.create({ data: dto }),
      },
      createProfile: {
        type: new GraphQLNonNull(ProfileType),
        args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
        resolve: async (_, { dto }) => prisma.profile.create({ data: dto }),
      },
      createPost: {
        type: new GraphQLNonNull(PostType),
        args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
        resolve: async (_, { dto }) => prisma.post.create({ data: dto }),
      },
      deleteUser: {
        type: new GraphQLNonNull(GraphQLString),
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_, { id }) => {
          await prisma.user.delete({ where: { id } });
          return 'User deleted';
        },
      },
    },
  });
  
  export const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: Mutation,
  });
  