import DataLoader from 'dataloader';

export const createUserLoader = (prisma) => {
  return new DataLoader(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        userSubscribedTo: true,
        subscribedToUser: true,
      },
    });
    const usersLookup = users.reduce((map, user) => map.set(user.id, user), new Map());
    return userIds.map((userId) => usersLookup.get(userId) || null);
  });
};

export const createMemberLoader = (prisma) => {
  return new DataLoader(async (memberTypeIds) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: memberTypeIds } },
    });
    const memberTypeLookup = memberTypes.reduce((map, type) => map.set(type.id, type), new Map());
    return memberTypeIds.map((id) => memberTypeLookup.get(id) || null);
  });
};

export const createPostLoader = (prisma) => {
  return new DataLoader(async (authorIds) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: authorIds } },
    });

    const postsByAuthor = posts.reduce((map, post) => {
      if (!map.has(post.authorId)) map.set(post.authorId, []);
      map.get(post.authorId).push(post);
      return map;
    }, new Map());

    return authorIds.map((authorId) => postsByAuthor.get(authorId) || []);
  });
};

export const createProfileLoader = (prisma) => {
  return new DataLoader(async (userIds) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: userIds } },
    });
    const profilesLookup = profiles.reduce((map, profile) => map.set(profile.userId, profile), new Map());
    return userIds.map((userId) => profilesLookup.get(userId) || null);
  });
};
