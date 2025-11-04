// apolloClient.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Example endpoint: you can replace it with your own API
const client = new ApolloClient({
  link: new HttpLink({
	uri: 'https://countries.trevorblades.com/', // public GraphQL API
  }),
  cache: new InMemoryCache(),
});

export default client;
