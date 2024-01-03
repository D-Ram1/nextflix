export async function insertStats(
  token,
  { userId, videoId, favorited, watched }
) {
  const operationsDoc = `
  mutation insertStats($favorited: Int!, $userId: String!, $videoId: String!, $watched: Boolean!) {
    insert_stats_one(
      object: {
        favorited: $favorited, 
        userId: $userId, 
        videoId: $videoId, 
        watched: $watched}) {
            favorited
            userId
        }
  }
`;

  return await queryHasuraGraphQl(
    operationsDoc,
    "insertStats",
    { userId, videoId, favorited, watched },
    token
  );
};


export async function updateStats(
  token,
  { userId, videoId, favorited, watched }
) {
  const operationsDoc = `
    mutation updateStats($userId: String!, $videoId: String!, $favorited: Int!, $watched: Boolean!) {
      update_stats( 
        _set: {favorited: $favorited, watched: $watched,}, 
        where: {
          userId: {_eq: $userId}, 
          videoId: {_eq: $videoId}
        }) {
        returning {
          userId
          videoId
          favorited
          watched
        }
      }
    }
`;

  return await queryHasuraGraphQl(
    operationsDoc,
    "updateStats",
    { userId, videoId, favorited, watched },
    token
  );
};


export async function findVideoIdByUser(token, userId, videoId) {
  const operationsDoc = `
    query findVideoIdByUser($userId: String!, $videoId: String!) {
      stats(where: {userId: {_eq: $userId}, videoId: {_eq:  $videoId}}) {
        id
        userId
        videoId
        favorited
        watched
      }
    }
  `;

  const response = await queryHasuraGraphQl(
    operationsDoc,
    "findVideoIdByUser",
    {
      videoId,
      userId,
    },
    token
  );

  return response?.data?.stats;
};


export async function createNewUser(token, metadata) {
  const operationsDoc = `
  mutation createNewUser($issuer: String!, $email: String!, $publicAddress: String!) {
    insert_users(objects: {email: $email, issuer: $issuer, publicAddress: $publicAddress}) {
      returning {
        email
        id
        issuer
      }
    }
  }
`;

  const { issuer, email, publicAddress } = metadata;
  const response = await queryHasuraGraphQl(
    operationsDoc,
    "createNewUser",
    {
      issuer,
      email,
      publicAddress,
    },
    token
  );
  return response;
};


export async function isNewUser(token, issuer) {
  const operationsDoc = `
  query isNewUser($issuer: String!) {
    users(where: {issuer: {_eq: $issuer}}) {
      id
      email
      issuer
    }
  }
`;

  const response = await queryHasuraGraphQl(
    operationsDoc,
    "isNewUser",
    {
      issuer,
    },
    token
  );
  return response?.data?.users?.length === 0;
};


export async function queryHasuraGraphQl(operationsDoc, operationName, variables, token) {
  const result = await fetch(process.env.NEXT_PUBLIC_HASURA_ADMIN_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
        "x-hasura-role": "user",
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    });

  return await result.json();
}


export async function getWatchedVideos(userId, token) {
  const operationsDoc = `
    query getWatchedVideos($userId: String!) {
      stats(where: {
        watched: {_eq: true}, 
        userId: {_eq: $userId}, 
      }) {
          videoId
      }
    }
  `;

  const response = await queryHasuraGraphQl(
    operationsDoc,
    "getWatchedVideos",
    {
      userId,
    },
    token
  );

  return response?.data?.stats;
};


export async function getMyListVideos(userId, token) {
  const operationsDoc = `
  query favoritedVideos($userId: String!) {
    stats(where: {
      userId: {_eq: $userId}, 
      favorited: {_eq: 1}
    }) {
        videoId
    }
  }
`;

  const response = await queryHasuraGraphQl(
    operationsDoc,
    "favoritedVideos",
    {
      userId,
    },
    token
  );

  return response?.data?.stats;
};