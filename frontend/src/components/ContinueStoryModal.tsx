import { Button, Checkbox, Modal, Paper, Space, Text, Title, Group } from '@mantine/core'
import { useEffect, useState, useRef } from 'react'
import { useProfile } from 'context/ProfileContext'
import { sanitize, getImageFromRichText } from 'utils/helpers'
import { uploadIpfs } from 'utils/ipfs'
import { createComment } from 'utils/comment'
import ProfileImageAndHandle from './ProfileImageAndHandle'
import TextEditor from './TextEditor'
import { useAccount } from 'context/AccountContext'
import { pollUntilIndexed } from 'utils/pollUntilIndexed'

type Props = {
  firstPage: any
  previousPage: any
  font: string
  allPublicationsInStory: any
  onClose: () => void
  onFinishSubmit: () => void
}

export default function ContinueStoryModal({
  firstPage,
  previousPage,
  font,
  onClose,
  onFinishSubmit,
  allPublicationsInStory,
}: Props) {
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
    const commentName = isEnding
      ? `${storyName} - with ending by ${activeProfile.handle}`
      : `${activeProfile.handle}'s page ${previousPage.page + 1} of ${storyName}`
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

    const contentLeadingUpToHereArray: string[] = [content]
    let continuedFrom = previousPage
    while (continuedFrom) {
      contentLeadingUpToHereArray.push(continuedFrom.content)
      const previousId = continuedFrom.continuedFrom
      continuedFrom = previousId ? allPublicationsInStory.find((p) => p.id === previousId) : null
    }
    const description = contentLeadingUpToHereArray.reverse().join('')
    const image = getImageFromRichText(description, font)
    const ipfsRes = await uploadIpfs({ name: commentName, description, content, image, attributes })
    const commentTx = await createComment(activeProfile.id, firstPage.id, ipfsRes, provider!.getSigner(), isEnding)

    await pollUntilIndexed(commentTx.hash)

    setIsSubmitting(false)
    handleClose()
    onFinishSubmit()
  }

  return (
    <>
      <Modal
        centered
        opened
        size={1024}
        closeOnClickOutside={false}
        onClose={() => setShowCloseConfirmation(true)}
        title={<Title order={2}>Write the Next Page</Title>}
      >
        <Space h="sm" />
        <Paper withBorder className="p-4 mb-4 border-gray-300">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize(previousPage.content),
            }}
            style={{ fontFamily: font }}
          />
        </Paper>
        <TextEditor value={body} onChange={setBody} font={font} />
        <Group mt="lg" position="center">
          <Checkbox
            size="lg"
            label="This is an ending"
            checked={isEnding}
            onChange={(event) => setIsEnding(event.currentTarget.checked)}
          />
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Submit
          </Button>
        </Group>
      </Modal>
      <Modal
        centered
        withCloseButton={false}
        opened={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
      >
        <Text mb="lg">Are you sure you want to leave? Your changes won&apos;t be saved.</Text>
        <Button onClick={() => setShowCloseConfirmation(false)}>Stay</Button>
        <Button ml="xs" variant="outline" onClick={handleClose} disabled={!body}>
          Leave
        </Button>
      </Modal>
    </>
  )
}
