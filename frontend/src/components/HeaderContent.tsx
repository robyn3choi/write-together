import { useEffect, useState } from 'react'
import { ActionIcon, Button, Group } from '@mantine/core'
import { SunIcon, MoonIcon } from '@heroicons/react/solid'
import { explorePublications } from 'utils/apollo'
import { useAccount } from 'context/AccountContext'
import { useAuth } from 'context/AuthContext'
import NewStory from 'components/NewStory'
import CreateProfileModal from './CreateProfileModal'
import { useProfile } from 'context/ProfileContext'
import ProfileImageAndHandle from './ProfileImageAndHandle'

type Props = {
  colorScheme: string
  toggleColorScheme: () => void
}

export default function HeaderContent({ colorScheme, toggleColorScheme }: Props) {
  const { address, connectWallet } = useAccount()
  const { login, isLoggedIn } = useAuth()
  const { activeProfile } = useProfile()

  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false)

  return (
    <>
      <Group>
        {address || <Button onClick={connectWallet}>connect wallet</Button>}
        {!isLoggedIn && <Button onClick={login}>login</Button>}
        {isLoggedIn && <Button onClick={() => setShowCreateProfileModal(true)}>create profile</Button>}
        {activeProfile && <ProfileImageAndHandle profile={activeProfile} />}
        <ActionIcon onClick={toggleColorScheme}>{colorScheme === 'dark' ? <MoonIcon /> : <SunIcon />}</ActionIcon>
      </Group>
      {showCreateProfileModal && <CreateProfileModal onClose={() => setShowCreateProfileModal(false)} />}
    </>
  )
}
