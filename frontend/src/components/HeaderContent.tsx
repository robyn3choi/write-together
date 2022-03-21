import { useEffect, useState } from 'react'
import { Button } from '@mantine/core'
import { explorePublications } from 'utils/apollo'
import { useAccount } from 'context/AccountContext'
import { useAuth } from 'context/AuthContext'
import NewStory from 'components/NewStory'
import CreateProfileModal from './CreateProfileModal'
import { useProfile } from 'context/ProfileContext'
import ProfileImageAndHandle from './ProfileImageAndHandle'

export default function HeaderContent() {
  const { address, connectWallet } = useAccount()
  const { login, isLoggedIn } = useAuth()
  const { activeProfile } = useProfile()

  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false)

  return (
    <>
      <div>
        {address || <Button onClick={connectWallet}>connect wallet</Button>}
        {!isLoggedIn && <Button onClick={login}>login</Button>}
        {isLoggedIn && <Button onClick={() => setShowCreateProfileModal(true)}>create profile</Button>}
        {activeProfile && <ProfileImageAndHandle profile={activeProfile} />}
      </div>
      {showCreateProfileModal && <CreateProfileModal onClose={() => setShowCreateProfileModal(false)} />}
    </>
  )
}
