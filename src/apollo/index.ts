import {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache,
  makeVar,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  credentials: "same-origin",
  uri: "/graphql",
});

const ACCESS_TOKEN = gql`
  query GetAccessToken {
    accessToken {
      token
    }
  }
`;

interface TokenResult {
  accessToken: {
    token: string;
  };
}

export const isLoggedIn = makeVar(false);

const authLink = setContext((_, { cache, headers = {} }) => {
  const cachedTokenQuery: TokenResult = cache.readQuery({
    query: ACCESS_TOKEN,
  });

  const token = cachedTokenQuery?.accessToken?.token;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    headers,
  };
});

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      AccessTokenPayload: {
        keyFields: [],
      },
    },
  }),
  link: authLink.concat(httpLink),
});

client.writeQuery({
  query: gql`
    query InitDefaultValues {
      accessToken {
        token
      }
    }
  `,
  data: {
    accessToken: {
      token: null,
    },
  },
});

export default client;
