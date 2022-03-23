import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getProfiles, createProfile } from 'utils/profile'
import { pollUntilIndexed } from 'utils/pollUntilIndexed'
import { useAccount } from './AccountContext'
import { getPublicationsByProfileId } from 'utils/getPublications'

const ProfileContext = createContext<ProviderValue | undefined>(undefined)
type Props = { children: ReactNode }

type ProviderValue = {
  profiles: any[]
  activeProfile: any
  createProfile: (handle: string, imageUrl: string) => void
}

export function ProfileProvider({ children }: Props) {
  const { address } = useAccount()
  const { isLoggedIn } = useAuth()
  const [profiles, setProfiles] = useState<any>(null)
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)

  async function getOwnedProfiles() {
    const res = await getProfiles({ ownedBy: address! })
    setProfiles(res.data.profiles.items)
    setActiveProfileId(res.data.profiles.items[0].id)
    const blah = await getPublicationsByProfileId(res.data.profiles.items[0].id)
  }

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
        createProfile: handleCreateProfile,
      }}
    >
      {children}
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
