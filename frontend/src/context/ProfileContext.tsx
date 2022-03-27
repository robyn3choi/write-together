import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getProfiles, createProfile } from 'utils/profile'
import { pollUntilIndexed } from 'utils/pollUntilIndexed'
import { useAccount } from './AccountContext'
import { ActionIcon } from '@mantine/core'
import { RefreshIcon } from '@heroicons/react/outline'

const ProfileContext = createContext<ProviderValue | undefined>(undefined)
type Props = { children: ReactNode }

type ProviderValue = {
  profiles: any[]
  activeProfile: any
  setActiveProfileId: (id: string) => void
  createProfile: (handle: string, imageUrl: string) => void
}

export function ProfileProvider({ children }: Props) {
  const { address } = useAccount()
  const { isLoggedIn } = useAuth()
  const [profiles, setProfiles] = useState<any>(null)
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [keyCounter, setKeyCounter] = useState(0)

  async function getOwnedProfiles() {
    const res = await getProfiles({ ownedBy: address! })
    setProfiles(res.data.profiles.items)
    setActiveProfileId(res.data.profiles.items[0].id)
  }
  // TODO: dependencies
  useEffect(() => {
    if (address && isLoggedIn && !profiles) {
      getOwnedProfiles()
    }
  }, [isLoggedIn])

  async function handleCreateProfile(handle, profilePictureUri) {
    const res = await createProfile({
      handle,
      profilePictureUri,
    })
    if (!res.data.createProfile.txHash) {
      throw new Error(res.data.createProfile.reason)
    }

    const result = await pollUntilIndexed(res.data.createProfile.txHash)
    console.log('create profile: profile has been indexed', result)
    // refetch owned profiles after new profile has been indexed
    getOwnedProfiles()

    return result.data
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile: profiles?.find((p) => p.id === activeProfileId),
        setActiveProfileId,
        createProfile: handleCreateProfile,
      }}
      key={keyCounter}
    >
      {children}
      {/* <ActionIcon
        size="xl"
        radius="xl"
        variant="filled"
        color="blue"
        className="fixed bottom-6 right-6 p-2"
        onClick={() => setKeyCounter(keyCounter + 1)}
      >
        <RefreshIcon />
      </ActionIcon> */}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
