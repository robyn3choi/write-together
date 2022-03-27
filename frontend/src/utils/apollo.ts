import { ApolloClient, InMemoryCache, gql, ApolloLink, HttpLink } from '@apollo/client'

export function initializeApolloClientWithNewToken(token) {
  const httpLink = new HttpLink({
    uri: 'https://api-mumbai.lens.dev/',
    fetch,
  })

  // example how you can pass in the x-access-token into requests using `ApolloLink`
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        'x-access-token': token ? `Bearer ${token}` : '',
      },
    })
    // Call the next link in the middleware chain.
    return forward(operation)
  })

  apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  })
}

const OverrideCache = new Proxy(new InMemoryCache(), {
  get(target, name, receiver) {
    return Reflect.get(target, name, receiver)
  },
})

export let apolloClient = new ApolloClient({
  uri: 'https://api-mumbai.lens.dev/',
  cache: OverrideCache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export async function checkHealth() {
  const query = gql`
    query {
      ping
    }
  `
  const res = await apolloClient.query({
    query,
  })
}
