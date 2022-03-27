import { useState, forwardRef } from 'react'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { ActionIcon, Popover, Group, Menu, Divider, UnstyledButtonProps, UnstyledButton, Button } from '@mantine/core'
import { useProfile } from 'context/ProfileContext'
import ProfileImageAndHandle from './ProfileImageAndHandle'
import CreateProfileModal from './CreateProfileModal'

export default function ProfileDropdown() {
  const { profiles, activeProfile, setActiveProfileId } = useProfile()
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false)
  console.log(activeProfile)
  if (!activeProfile) {
    return <Button onClick={() => {}}>Create Profile</Button>
  }

  return (
    <>
      <Menu placement="center" control={<UserButton profile={activeProfile} />} size="lg">
        {profiles
          .filter((p) => p.id !== activeProfile.id)
          .map((p) => (
            <Menu.Item key={p.id} onClick={() => setActiveProfileId(p.id)}>
              <ProfileImageAndHandle profile={p} isLink={false} />
            </Menu.Item>
          ))}
        <Divider />
        <Menu.Item onClick={() => setShowCreateProfileModal(true)}>Create New Profile</Menu.Item>
      </Menu>
      {showCreateProfileModal && <CreateProfileModal onClose={() => setShowCreateProfileModal(false)} />}
    </>
  )
}

interface UserButtonProps extends UnstyledButtonProps {
  profile: any
  icon?: React.ReactNode
}

// eslint-disable-next-line
const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ profile, icon, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      sx={(theme) => ({
        display: 'block',
        width: '240px',
        padding: theme.spacing.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
      {...others}
    >
      <Group>
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        <ProfileImageAndHandle profile={profile} isLink={false} />
      </Group>
    </UnstyledButton>
  )
)
