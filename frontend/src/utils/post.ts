import { gql } from '@apollo/client/core'
import { ethers, utils } from 'ethers'
import { apolloClient } from './apollo'
import { lensHub } from './lensHub'
import { signedTypeData } from './helpers'

const CREATE_POST_TYPED_DATA = `
  mutation($request: CreatePublicPostRequest!) { 
    createPostTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        contentURI
        collectModule
        collectModuleData
        referenceModule
        referenceModuleData
      }
    }
  }
}
`

//TODO typings
const createPostTypedData = (createPostTypedDataRequest: any) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_POST_TYPED_DATA),
    variables: {
      request: createPostTypedDataRequest,
    },
  })
}

export const createPost = async (profileId: string, ipfsResult: any, signer: ethers.providers.JsonRpcSigner) => {
  // hard coded to make the code example clear
  const createPostRequest = {
    profileId,
    contentURI: 'ipfs://' + ipfsResult.path,
    collectModule: {
      revertCollectModule: true,
    },
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
  }

  const result = await createPostTypedData(createPostRequest)
  console.log('create post: createPostTypedData', result)

  const typedData = result.data.createPostTypedData.typedData
  console.log('create post: typedData', typedData)

  const signature = await signedTypeData(signer, typedData.domain, typedData.types, typedData.value)
  console.log('create post: signature', signature)

  const { v, r, s } = utils.splitSignature(signature)

  const tx = await lensHub!.postWithSig({
    profileId: typedData.value.profileId,
    contentURI: typedData.value.contentURI,
    collectModule: typedData.value.collectModule,
    collectModuleData: typedData.value.collectModuleData,
    referenceModule: typedData.value.referenceModule,
    referenceModuleData: typedData.value.referenceModuleData,
    sig: {
      v,
      r,
      s,
      deadline: typedData.value.deadline,
    },
  })
  console.log('create post: tx hash', tx.hash)
}
