import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { schema } from './schema.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';

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
          return { errors, prisma };
        }

        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: { prisma }, 
        });

        return result;
      } catch (err) {
        return { errors: err, prisma };
      }
    },
        
  });
};

export default plugin;
