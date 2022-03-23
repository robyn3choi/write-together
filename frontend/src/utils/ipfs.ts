import { create } from 'ipfs-http-client'
import { v4 as uuidv4 } from 'uuid'

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
})

export const uploadIpfs = async ({ name, description, content, image, attributes }) => {
  const result = await client.add(
    JSON.stringify({
      version: '1.0.0',
      metadata_id: uuidv4(),
      name,
      description,
      content,
      image,
      attributes,
      appId: process.env.NEXT_PUBLIC_APP_ID,
    })
  )

  console.log('upload result ipfs', result)
  return result
}

// - { traitType: "Part of Story",  value: "End" } attribute if it's an ending
// - { traitType: "Part of Story",  value: "Middle" } attribute if it's an ending
// - { traitType: "Part of Story",  value: "Beginning" } attribute if it's a post
// - { traitType: "Page": value: "2" } if it's page 2
// - { traitType: "Font": value: "Georgia" } on posts and comments
// for now put the rich text into the content
// name is the story title for a post
// name is "Page 2 of story title by profile handle" for
