import {
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLString,
  } from 'graphql';
  
  import {
    CreatePostInput,
    ChangePostInput,
    CreateUserInput,
    ChangeUserInput,
    CreateProfileInput,
    ChangeProfileInput,
    MemberIdType,
  } from './types.js';
  import { UUIDType } from './uuid.js';
  
  export const NonNullUUID = { type: new GraphQLNonNull(UUIDType) };
  export const NonNullUserInput = { type: new GraphQLNonNull(CreateUserInput) };
  export const NonNullProfileInput = { type: new GraphQLNonNull(CreateProfileInput) };
  export const NonNullPostInput = { type: new GraphQLNonNull(CreatePostInput) };
  export const NonNullChangeUserInput = { type: new GraphQLNonNull(ChangeUserInput) };
  export const NonNullChangePostInput = { type: new GraphQLNonNull(ChangePostInput) };
  export const NonNullChangeProfileInput = { type: new GraphQLNonNull(ChangeProfileInput) };
  export const NonNullMemberIdType = { type: new GraphQLNonNull(MemberIdType) };
  export const NonNullString = { type: new GraphQLNonNull(GraphQLString) };
  export const NonNullFloat = { type: new GraphQLNonNull(GraphQLFloat) };
  export const NonNullInt = { type: new GraphQLNonNull(GraphQLInt) };
  export const NonNullBoolean = { type: new GraphQLNonNull(GraphQLBoolean) };
  
  