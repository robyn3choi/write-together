import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export const apolloClient = new ApolloClient({
  uri: 'https://api-mumbai.lens.dev/',
  cache: new InMemoryCache(),
})

const ApiContext = createContext<any>(undefined)
type Props = { children: ReactNode }

export function ApiProvider({ children }: Props) {
  async function getStories() {
    const query = gql`
      query {
        ping
      }
    `
    const res = await apolloClient.query({
      query,
    })
  }

  const value = {
    getStories,
  }
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export function useApi() {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApi must be used within a ApiProvider')
  }
  return context
}
