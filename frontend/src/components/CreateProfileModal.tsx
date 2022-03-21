import { useState } from 'react'
import { Modal, Button, Group, TextInput, Avatar, Text } from '@mantine/core'
import { useProfile } from 'context/ProfileContext'

export default function CreateProfileModal({ onClose }) {
  const { createProfile } = useProfile()

  const [handle, setHandle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)

  async function handleSubmit() {
    setIsCreatingProfile(true)
    try {
      const res = await createProfile(handle, imageUrl)
      setIsCreatingProfile(false)
      onClose()
    } catch (err: any) {
      if (err.message === 'HANDLE_TAKEN') {
        setError('This handle name is already taken :(')
      } else {
        setError('There was an error.')
      }
      setIsCreatingProfile(false)
    }
  }

  return (
    <Modal centered opened onClose={onClose} title="Create profile">
      <Group>
        <Avatar radius="xl" size="lg" src={imageUrl} alt="Your profile pic" />
        <div>
          <TextInput placeholder="Your handle" required value={handle} onChange={(e) => setHandle(e.target.value)} />
          {error && (
            <Text color="red" size="xs">
              {error}
            </Text>
          )}
          <TextInput
            mt="xs"
            placeholder="URL to your profile pic"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
      </Group>
      <Button onClick={handleSubmit} disabled={!handle} loading={isCreatingProfile}>
        Create
      </Button>
    </Modal>
  )
}
