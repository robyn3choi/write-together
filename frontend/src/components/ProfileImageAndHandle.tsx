import { Avatar, Group, Text } from '@mantine/core'
import Profile from 'types/Profile'

type Props = {
  profile: Profile
}

export default function ProfileImageAndHandle({ profile }: Props) {
  return (
    <Group spacing="sm">
      <Avatar radius="xl" src={profile.imageUrl} alt={profile.handle} />
      <Text>{profile.handle}</Text>
    </Group>
  )
}
