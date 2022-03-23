import { Avatar, Group, Text } from '@mantine/core'

type Props = {
  profile: any
}

export default function ProfileImageAndHandle({ profile }: Props) {
  return (
    <Group spacing="sm">
      <Avatar radius="xl" src={profile.picture.original?.url || profile.picture.uri || null} alt={profile.handle} />
      <Text>{profile.handle}</Text>
    </Group>
  )
}
