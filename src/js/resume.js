// main.js
import client from './apolloClient.js';
import { GET_COUNTRIES } from './queries.js';

async function fetchCountries() {
  try {
    const { data } = await client.query({ query: GET_COUNTRIES });
    console.log('Countries:', data.countries);
  } catch (error) {
    console.error('GraphQL error:', error);
  }
}

fetchCountries();