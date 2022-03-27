import { useEffect, useState } from 'react'
import { Avatar, Text, Title, Group, Button, Tabs, Space } from '@mantine/core'
import { useRouter } from 'next/router'
import { useProfile } from 'context/ProfileContext'
import { useAccount } from 'context/AccountContext'
import { getProfiles, createProfile } from 'utils/profile'
import { getPublicationsByProfileId } from 'utils/getPublications'
import { follow, doesFollow, unfollow, getFollowing } from 'utils/follow'
import FeedPublication from 'components/FeedPublication'
import { getTraitFromMetadata } from 'utils/helpers'
import ProfileImageAndHandle from 'components/ProfileImageAndHandle'
import Link from 'next/link'
import Loader from 'components/Loader'

export default function ProfileView() {
  const router = useRouter()
  const profileId = router.query.profileId as string
  const { activeProfile } = useProfile()
  const { contract, address, provider } = useAccount()

  const [profile, setProfile] = useState<any>()
  const [publications, setPublications] = useState<any>()
  const [isFollowingProfile, setIsFollowingProfile] = useState<boolean | null>(null)
  const [followedProfiles, setFollowedProfiles] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPublications, setIsLoadingPublications] = useState(false)
  const [isLoadingFollow, setIsLoadingFollow] = useState(false)
  const [isLoadingFollowedProfiles, setIsLoadingFollowedProfiles] = useState(false)

  useEffect(() => {
    async function getProfile() {
      setIsLoadingProfile(true)
      const res = await getProfiles({ profileIds: [profileId as string] })
      setProfile(res.data.profiles.items[0])
      setIsLoadingProfile(false)
    }
    if (profileId && !profile && !isLoadingProfile) {
      getProfile()
    }
  }, [profileId, profile, isLoadingProfile])

  useEffect(() => {
    async function getPublications() {
      setIsLoadingPublications(true)
      const res = await getPublicationsByProfileId(profileId)
      const formatted = res.publications.items
        .filter((p) => p.appId === process.env.NEXT_PUBLIC_APP_ID)
        .map((p) => ({
          createdAt: p.createdAt,
          id: p.id,
          name: p.metadata.name,
          profile: p.profile,
          content: p.metadata.content,
          font: getTraitFromMetadata(p.metadata, 'Font'),
          page: parseInt(getTraitFromMetadata(p.metadata, 'Page')),
          partOfStory: getTraitFromMetadata(p.metadata, 'Part of Story'),
          continuedFrom: getTraitFromMetadata(p.metadata, 'Continued from') || p.mainPost?.id,
          mainPost: p.mainPost?.id,
        }))

      setPublications(formatted)
      setIsLoadingPublications(false)
    }
    if (profileId && !publications && !isLoadingPublications) {
      getPublications()
    }
  }, [profileId, publications, isLoadingPublications])

  useEffect(() => {
    async function getIsFollowing() {
      setIsLoadingFollow(true)
      const res = await doesFollow(address!, profileId)

      setIsFollowingProfile(res.doesFollow[0].follows)
      setIsLoadingFollow(false)
    }
    if (profileId && address && isFollowingProfile === null && !isLoadingFollow) {
      getIsFollowing()
    }
  }, [profileId, isFollowingProfile, isLoadingFollow, address])

  useEffect(() => {
    async function getFollowedProfiles() {
      setIsLoadingFollowedProfiles(true)
      const res = await getFollowing(address!)
      setFollowedProfiles(res.following.items)
      setIsLoadingFollowedProfiles(false)
    }
    if (profileId && address && followedProfiles === null && !isLoadingFollowedProfiles) {
      getFollowedProfiles()
    }
  }, [profileId, followedProfiles, isLoadingFollowedProfiles, address])

  async function toggleFollow() {
    setIsLoadingFollow(true)
    if (isFollowingProfile) {
      await unfollow(profileId, provider!.getSigner())
    } else {
      await follow(profileId, provider!.getSigner())
    }
    setIsFollowingProfile((prevState) => !prevState)
    setIsLoadingFollow(false)
  }

  return (
    <div>
      {!profile ? (
        <Loader />
      ) : (
        <>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <Avatar
              src={profile.picture.original?.url || profile.picture.uri || null}
              size={200}
              radius={200}
              m="auto"
            />
            <Title py="lg">{profile.handle}</Title>
            <Text>{profile.id}</Text>
            <Text>{profile.ownedBy}</Text>
            <Group position="center">
              <Text>{`Followers: ${profile.stats.totalFollowers}`}</Text>
              <Text>{`Following: ${profile.stats.totalFollowing}`}</Text>
            </Group>
            {activeProfile ? (
              <Button
                style={{ position: 'absolute', right: 0, top: 0 }}
                onClick={toggleFollow}
                loading={isLoadingFollow}
              >
                {isFollowingProfile ? 'Unfollow' : 'Follow'}
              </Button>
            ) : (
              <Button
                variant="subtle"
                style={{ display: 'block', background: 'transparent', position: 'absolute', right: 0, top: 0 }}
                m="auto"
                disabled
              >
                Log in to follow
              </Button>
            )}
          </div>
          <Space h="xl" />
          <Tabs
            grow
            variant="outline"
            styles={(theme) => ({
              tabActive: {
                background: `${theme.colors.yellow[1]} !important`,
              },
              body: { background: `${theme.colors.yellow[1]} !important`, padding: theme.spacing.lg },
            })}
            className="shadow-xl"
          >
            <Tabs.Tab label="Activity">
              {!publications ? <Loader /> : publications.map((p) => <FeedPublication key={p.id} publication={p} />)}
            </Tabs.Tab>
            <Tabs.Tab label="Story Beginnings">
              {!publications ? (
                <Loader />
              ) : (
                publications.filter((p) => p.page === 1).map((p) => <FeedPublication key={p.id} publication={p} />)
              )}
            </Tabs.Tab>
            <Tabs.Tab label="Following">
              {!followedProfiles ? (
                <Loader />
              ) : (
                followedProfiles.map((p) => (
                  <Link key={p.profile.id} href={`/profile/${p.profile.id}`} passHref>
                    <div className="p-4 hover:bg-gray-100 cursor-pointer">
                      <ProfileImageAndHandle key={p.profile.id} profile={p.profile} />
                    </div>
                  </Link>
                ))
              )}
            </Tabs.Tab>
          </Tabs>
        </>
      )}
    </div>
  )
}
