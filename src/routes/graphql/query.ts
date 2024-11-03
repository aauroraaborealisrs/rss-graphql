import { GraphQLObjectType } from 'graphql';
import { memberType, memberTypes } from './memberQueries.js';
import { user, users } from './userQueries.js';
import { post, posts } from './postQueries.js';
import { profile, profiles } from './profileQueries.js';

const rootQueryFields = {
  memberTypes,
  memberType,
  users,
  user,
  posts,
  post,
  profiles,
  profile,
};

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: rootQueryFields,
});