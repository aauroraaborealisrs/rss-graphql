import { PrismaClient } from "@prisma/client";
import { createMemberLoader, createPostLoader, createProfileLoader, createUserLoader } from "../loaders.js";

type MemberTypeLoader = ReturnType<typeof createMemberLoader>;
type PostLoader = ReturnType<typeof createPostLoader>;
type ProfileLoader = ReturnType<typeof createProfileLoader>;
type UserLoader = ReturnType<typeof createUserLoader>;

export interface IsubsFields {
    userSubscribedTo?: boolean;
    subscribedToUser?: boolean;
}

export interface IContext {
    prisma: PrismaClient;
    userLoader: UserLoader;
    memberTypeLoader: MemberTypeLoader;
    postLoader: PostLoader;
    profileLoader: ProfileLoader;
}
