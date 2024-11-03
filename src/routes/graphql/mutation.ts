import { GraphQLObjectType } from 'graphql';
import { changeUser, createUser, deleteUser } from './userMutations.js';
import { changeProfile, createProfile, deleteProfile } from './profileMutations.js';
import { changePost, createPost, deletePost } from './postMutations.js';
import { subscribeTo, unsubscribeFrom } from './subscriptionMutations.js';

export const Mutation = new GraphQLObjectType({
  name: 'Mutations',
  fields: () => ({
    createUser,
    changeUser,
    deleteUser,
    createProfile,
    changeProfile,
    deleteProfile,
    createPost,
    changePost,
    deletePost,
    subscribeTo,
    unsubscribeFrom,
  }),
});
