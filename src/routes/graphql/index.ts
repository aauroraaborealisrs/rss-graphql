import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { schema } from './schema.js';
import depthLimit from 'graphql-depth-limit';
import { createMemberTypeLoader, createPostLoader, createProfileLoader, createUserLoader, createSubscriptionsByUserIdLoader } from './loaders.js';

const MAX_DEPTH = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      try {
        const queryDocument = parse(query);
        const errors = validate(schema, queryDocument, [depthLimit(MAX_DEPTH)]);
        if (errors.length) {
          return { errors };
        }

        const res = await graphql({
          schema,
          source: query,
          contextValue: {
            prisma,
            userLoader: createUserLoader(prisma),
            memberTypeLoader: createMemberTypeLoader(prisma),
            postLoader: createPostLoader(prisma),
            profileLoader: createProfileLoader(prisma),
            subscriptionsByUserId: createSubscriptionsByUserIdLoader(prisma),
          },
          variableValues: variables,
        });

        return res;
      } catch (err) {
        return { errors: err };
      }
    },
  });
};

export default plugin;
