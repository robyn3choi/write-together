import { gql } from '@apollo/client/core'
import { apolloClient } from './apollo'

const GET_PROFILES = `
  query($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }
`

export interface ProfilesRequest {
  profileIds?: string[]
  ownedBy?: string
  handles?: string[]
  whoMirroredPublicationId?: string
}

export const getProfiles = (request: ProfilesRequest) => {
  return apolloClient.query({
    query: gql(GET_PROFILES),
    variables: {
      request,
    },
  })
}

const CREATE_PROFILE = `
  mutation($request: CreateProfileRequest!) { 
    createProfile(request: $request) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
            __typename
    }
 }
`

export const createProfile = (createProfileRequest) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_PROFILE),
    variables: {
      request: createProfileRequest,
    },
  })
}
