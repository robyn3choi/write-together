import { gql } from '@apollo/client/core'
import { apolloClient } from './apollo'
import { signedTypeData } from './helpers'
import { ethers, utils } from 'ethers'
import { lensHub } from './lensHub'

const CREATE_COMMENT_TYPED_DATA = `
  mutation($request: CreatePublicCommentRequest!) { 
    createCommentTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          CommentWithSig {
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
        profileIdPointed
        pubIdPointed
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

// TODO types
const createCommentTypedData = (createCommentTypedDataRequest: any) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_COMMENT_TYPED_DATA),
    variables: {
      request: createCommentTypedDataRequest,
    },
  })
}

export const createComment = async (
  profileId: string,
  postId: string,
  ipfsResult: any,
  signer: ethers.providers.JsonRpcSigner
) => {
  const createCommentRequest = {
    profileId,
    publicationId: postId,
    contentURI: 'ipfs://' + ipfsResult.path,
    collectModule: {
      revertCollectModule: true,
    },
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
  }

  const result = await createCommentTypedData(createCommentRequest)
  console.log('create comment: createCommentTypedData', result)

  const typedData = result.data.createCommentTypedData.typedData
  console.log('create comment: typedData', typedData)

  const signature = await signedTypeData(signer, typedData.domain, typedData.types, typedData.value)
  console.log('create comment: signature', signature)

  const { v, r, s } = utils.splitSignature(signature)

  const tx = await lensHub!.commentWithSig({
    profileId: typedData.value.profileId,
    contentURI: typedData.value.contentURI,
    profileIdPointed: typedData.value.profileIdPointed,
    pubIdPointed: typedData.value.pubIdPointed,
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
  console.log('create comment: tx hash', tx.hash)
}
