import { useEffect, useState } from 'react'
import { RadioGroup, Radio, Group, Space } from '@mantine/core'
import { useRouter } from 'next/router'
import { useProfile } from 'context/ProfileContext'
import { useAccount } from 'context/AccountContext'
import { getFollowing } from 'utils/follow'
import { getPublicationsByProfileId } from 'utils/getPublications'
import FeedPublication from 'components/FeedPublication'
import { getTraitFromMetadata } from 'utils/helpers'
import ProfileImageAndHandle from 'components/ProfileImageAndHandle'
import Link from 'next/link'
import { getPublication } from 'utils/getPublication'
import Loader from 'components/Loader'

export default function Feed() {
  const router = useRouter()
  const profileId = router.query.profileId as string
  const { activeProfile } = useProfile()
  const { contract, address, provider } = useAccount()

  const [feedType, setFeedType] = useState('stories')
  const [profilesFeed, setProfilesFeed] = useState<any>(null)
  const [storiesFeed, setStoriesFeed] = useState<any>(null)
  const [isLoadingProfilesFeed, setIsLoadingProfilesFeed] = useState(false)
  const [isLoadingStoriesFeed, setIsLoadingStoriesFeed] = useState(false)
  const [isLoadingFollow, setIsLoadingFollow] = useState(false)

  // useEffect(() => {
  //   async function getProfile() {
  //     setIsLoadingProfile(true)
  //     const res = await getProfiles({ profileIds: [profileId as string] })
  //     setProfile(res.data.profiles.items[0])
  //     setIsLoadingProfile(false)
  //   }
  //   if (profileId && !profile && !isLoadingProfile) {
  //     getProfile()
  //   }
  // }, [profileId, profile, isLoadingProfile])

  useEffect(() => {
    async function getFollowedStoriesActivity() {
      setIsLoadingStoriesFeed(true)

      const followedStoryIds = await contract!.getFollowedStories(activeProfile.id)

      let publications: any = []
      for (let publicationId of followedStoryIds) {
        const pubRes = await getPublication(publicationId)
        publications.push(pubRes.publication)
      }

      const formatted = publications.map((p) => ({
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
      formatted.sort((a, b) => a.createdAt - b.createdAt)
      setStoriesFeed(formatted)
      setIsLoadingStoriesFeed(false)
    }
    if (contract && activeProfile && storiesFeed === null && !isLoadingStoriesFeed) {
      getFollowedStoriesActivity()
    }
  }, [contract, activeProfile, storiesFeed, isLoadingStoriesFeed])

  useEffect(() => {
    async function getFollowedProfilesActivity() {
      setIsLoadingProfilesFeed(true)
      const res = await getFollowing(address!)

      let publications: any = []

      for (let profile of res.following.items) {
        const pubRes = await getPublicationsByProfileId(profile.profile.id)
        publications = [...publications, ...pubRes.publications.items]
      }

      const formatted = publications
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
      formatted.sort((a, b) => a.createdAt - b.createdAt)
      setProfilesFeed(formatted)
      setIsLoadingProfilesFeed(false)
    }
    if (address && profilesFeed === null && !isLoadingProfilesFeed) {
      getFollowedProfilesActivity()
    }
  }, [profilesFeed, isLoadingProfilesFeed, address])

  return (
    <div>
      {/* <CheckboxGroup defaultValue={['stories', 'profiles']} label="Activity from:" size="lg">
        <Checkbox value="stories" label="Followed Stories" />
        <Checkbox value="profiles" label="Followed Profiles" />
      </CheckboxGroup> */}
      <RadioGroup label="Activity from:" size="lg" value={feedType} onChange={setFeedType}>
        <Radio value="stories" label="Followed Stories" />
        <Radio value="profiles" label="Followed Profiles" />
      </RadioGroup>
      <Space h="xl" />
      {feedType === 'stories' ? (
        storiesFeed === null ? (
          <Loader />
        ) : (
          storiesFeed.map((p) => <FeedPublication key={p.id} publication={p} />)
        )
      ) : profilesFeed === null ? (
        <Loader />
      ) : (
        profilesFeed.map((p) => <FeedPublication key={p.id} publication={p} />)
      )}
    </div>
  )
}
