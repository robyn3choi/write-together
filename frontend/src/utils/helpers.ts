import sanitizeHtml from 'sanitize-html'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import omitDeep from 'omit-deep'
import abi from 'contracts/StoryInteractions.json'

export const storyInteractionsContractAddress = '0x70c99ddC55FC2c33a9cC51816193B260BA04b505'
export const storyInteractionsAbi = abi.abi

export const sanitize = (html) => sanitizeHtml(html, { allowedAttributes: false, allowedTags: false })

export const signedTypeData = (
  signer,
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>
) => {
  // remove the __typedname from the signature!
  return signer._signTypedData(omit(domain, '__typename'), omit(types, '__typename'), omit(value, '__typename'))
}

export const omit = (object: any, name: string) => {
  return omitDeep(object, name)
}

// not sure if html actually renders properly as the image
export function getImageFromRichText(richText, font) {
  const startTags = `<html><div style="font-family: ${font};">`
  const endTags = `</div></html>`
  const wholeHtml = startTags + richText + endTags
  const prefix = 'data:image/svg+xml;base64,'
  const base64 = Buffer.from(wholeHtml).toString('base64')
  return prefix + base64
}

export function getTraitFromMetadata(metadata, traitType) {
  return metadata.attributes.find((a) => a.traitType === traitType)?.value
}
