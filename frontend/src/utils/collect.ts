import { gql } from '@apollo/client/core'
import { ethers, utils } from 'ethers'
import { apolloClient } from './apollo'
import { lensHub } from './lensHub'
import { signedTypeData } from './helpers'

const CREATE_COLLECT_TYPED_DATA = `
  mutation($request: CreateCollectRequest!) { 
    createCollectTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          CollectWithSig {
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
        pubId
        data
      }
     }
   }
 }
`

// TODO typings
const createCollectTypedData = (createCollectTypedDataRequest: any) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_COLLECT_TYPED_DATA),
    variables: {
      request: createCollectTypedDataRequest,
    },
  })
}

export const collect = async (publicationId, signer: ethers.providers.JsonRpcSigner) => {
  // must follow to collect need to wait for it to be indexed!
  // await follow('0x032f1a');

  // hard coded to make the code example clear
  // remember you must make sure you approved allowance of
  // this currency on the module
  const collectRequest = {
    publicationId,
  }

  const result = await createCollectTypedData(collectRequest)
  console.log('collect: createCollectTypedData', result)

  const typedData = result.data.createCollectTypedData.typedData
  console.log('collect: typedData', typedData)

  const signature = await signedTypeData(signer, typedData.domain, typedData.types, typedData.value)

  console.log('collect: signature', signature)

  const { v, r, s } = utils.splitSignature(signature)

  const tx = await lensHub!.collectWithSig(
    {
      collector: signer.getAddress(),
      profileId: typedData.value.profileId,
      pubId: typedData.value.pubId,
      data: typedData.value.data,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    },
    { gasLimit: 1000000 }
  )
  console.log('collect: tx hash', tx.hash)
  return tx
}
