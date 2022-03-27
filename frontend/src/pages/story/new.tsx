import { useEffect, useState } from 'react'
import { Button, Space, TextInput } from '@mantine/core'
import { uploadIpfs } from 'utils/ipfs'
import { createPost } from 'utils/post'
import { getImageFromRichText } from 'utils/helpers'
import { useProfile } from 'context/ProfileContext'
import FontPicker from 'components/FontPicker'
import { useAccount } from 'context/AccountContext'
import TextEditor from 'components/TextEditor'
import { pollUntilIndexed } from 'utils/pollUntilIndexed'
import { useRouter } from 'next/router'

export default function NewStory() {
  const router = useRouter()
  const { activeProfile } = useProfile()
  const { provider } = useAccount()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('<p>It was a dark and stormy night...</p>')
  const [font, setFont] = useState('Georgia')
  const [isCreating, setIsCreating] = useState(false)

  async function createStory() {
    setIsCreating(true)
    const description = `The beginning of a new story by ${activeProfile.handle}.`
    // the ql classnames only work inside the text editor
    const content = body
      .replace('class="ql-align-right"', 'style="text-align: right;"')
      .replace('class="ql-align-center"', 'style="text-align: center;"')
    const attributes = [
      { traitType: 'Page', value: '1' },
      { traitType: 'Part of Story', value: 'Beginning' },
      { traitType: 'Font', value: font },
    ]
    const image = getImageFromRichText(body, font)
    const ipfsRes = await uploadIpfs({ name: title, description, content, image, attributes })
    const postTx = await createPost(activeProfile.id, ipfsRes, provider!.getSigner())
    console.log(postTx)
    await pollUntilIndexed(postTx.hash)

    //router.push(`/story/${}`)
  }

  return (
    <div>
      <TextInput
        label="Story title"
        placeholder="The Return of the Lizard People"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        mb="sm"
      />
      <FontPicker value={font} onChange={(val) => setFont(val)} />
      <Space h="sm" />
      <TextEditor value={body} onChange={setBody} font={font} />
      <Button
        className="w-full mt-4"
        disabled={!title || !body || !activeProfile}
        onClick={createStory}
        loading={isCreating}
      >
        {activeProfile ? 'Create Story' : 'Log In to Create Story'}
      </Button>
    </div>
  )
}
