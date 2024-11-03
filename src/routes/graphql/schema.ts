import { GraphQLSchema } from 'graphql';
import { RootQueryType } from './query.js';
import { Mutation } from './mutation.js';

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutation,
});
