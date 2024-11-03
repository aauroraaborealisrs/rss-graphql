import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { schema } from './schema.js';
import depthLimit from 'graphql-depth-limit';
import {
  createMemberLoader,
  createPostLoader,
  createProfileLoader,
  createUserLoader,
} from './loaders.js';
import { PrismaClient } from '@prisma/client';

const MAX_DEPTH = 5;

function createContext(prisma: PrismaClient) {
  return {
    prisma,
    userLoader: createUserLoader(prisma),
    memberTypeLoader: createMemberLoader(prisma),
    postLoader: createPostLoader(prisma),
    profileLoader: createProfileLoader(prisma),
  };
}

function validateQuery(query: string) {
  const queryDocument = parse(query);
  const errors = validate(schema, queryDocument, [depthLimit(MAX_DEPTH)]);
  return errors;
}

async function executeGraphqlQuery(query: string, variables: any, context: any) {
  return graphql({
    schema,
    source: query,
    contextValue: context,
    variableValues: variables,
  });
}

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
    async handler(req, reply) {
      const { query, variables } = req.body;

      try {
        const errors = validateQuery(query);
        if (errors.length) {
          return { errors };
        }

        const context = createContext(prisma);

        const res = await executeGraphqlQuery(query, variables, context);

        return res;
      } catch (err) {
        fastify.log.error(err);
        return { errors: [{ message: 'We are in trouble' }] };
      }
    },
  });
};

export default plugin;
