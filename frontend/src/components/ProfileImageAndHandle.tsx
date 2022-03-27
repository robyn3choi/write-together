import { Avatar, Group, Text } from '@mantine/core'
import Link from 'next/link'

type Props = {
  profile: any
}

export default function ProfileImageAndHandle({ profile }: Props) {
  return (
    <Link href={`/profile/${profile.id}`} passHref>
      <Group spacing="sm" className="cursor-pointer">
        <Avatar radius="xl" src={profile.picture.original?.url || profile.picture.uri || null} alt={profile.handle} />
        <Text>{profile.handle}</Text>
      </Group>
    </Link>
  )
}
