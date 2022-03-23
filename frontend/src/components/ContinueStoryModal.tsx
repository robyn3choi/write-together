import { Button, Checkbox, Modal, Text } from '@mantine/core'
import { useEffect, useState, useRef } from 'react'
import { useProfile } from 'context/ProfileContext'
import { sanitize, getImageFromRichText } from 'utils/helpers'
import { uploadIpfs } from 'utils/ipfs'
import { createComment } from 'utils/comment'
import ProfileImageAndHandle from './ProfileImageAndHandle'
import TextEditor from './TextEditor'
import { useAccount } from 'context/AccountContext'

type Props = {
  firstPage: any
  previousPage: any
  font: string
  onClose: () => void
}

export default function ContinueStoryModal({ firstPage, previousPage, font, onClose }: Props) {
  const { activeProfile } = useProfile()
  const { provider } = useAccount()
  const [body, setBody] = useState('')
  const [isEnding, setIsEnding] = useState(false)
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleClose() {
    setBody('')
    onClose()
  }

  async function handleSubmit() {
    setIsSubmitting(true)

    const storyName = firstPage.name
    const commentName = `${activeProfile.handle}'s page ${previousPage.page + 1} of ${storyName}`
    const description = `The continuation of a story started by ${activeProfile.handle}.`
    // the ql classnames only work inside the text editor
    const content = body
      .replace('class="ql-align-right"', 'style="text-align: right;"')
      .replace('class="ql-align-center"', 'style="text-align: center;"')
    const attributes = [
      { traitType: 'Page', value: previousPage.page + 1 },
      { traitType: 'Part of Story', value: isEnding ? 'End' : 'Middle' },
      { traitType: 'Font', value: font },
      { traitType: 'Continued from', value: previousPage.id },
    ]
    const image = getImageFromRichText(body, font)
    const ipfsRes = await uploadIpfs({ name: commentName, description, content, image, attributes })
    const commentRes = await createComment(activeProfile.id, firstPage.id, ipfsRes, provider!.getSigner())

    setIsSubmitting(false)
  }

  return (
    <>
      <Modal
        centered
        opened
        size={1024}
        closeOnClickOutside={false}
        onClose={() => setShowCloseConfirmation(true)}
        title="Write the next part of the story"
      >
        <ProfileImageAndHandle profile={previousPage.profile} />
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(previousPage.content),
          }}
          style={{ fontFamily: font }}
        />
        <ProfileImageAndHandle profile={activeProfile} />
        <TextEditor value={body} onChange={setBody} font={font} />
        <Checkbox
          size="xl"
          label="This is an ending"
          checked={isEnding}
          onChange={(event) => setIsEnding(event.currentTarget.checked)}
        />
        <Button onClick={handleSubmit}>Submit</Button>
      </Modal>
      <Modal centered opened={showCloseConfirmation} onClose={() => setShowCloseConfirmation(false)} title="Close?">
        <Text>Are you sure you want to leave? Your changes won't be saved.</Text>
        <Button onClick={handleClose} loading={isSubmitting}>
          Yes
        </Button>
        <Button ml="xs" onClick={() => setShowCloseConfirmation(false)}>
          No
        </Button>
      </Modal>
    </>
  )
}
