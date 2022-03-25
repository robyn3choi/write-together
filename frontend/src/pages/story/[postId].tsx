import { useEffect, useState } from 'react'
import { Loader } from '@mantine/core'
import { useRouter } from 'next/router'
import { useProfile } from 'context/ProfileContext'
import { getPublication } from 'utils/getPublication'
import ContinueStoryModal from 'components/ContinueStoryModal'
import { getTraitFromMetadata } from 'utils/helpers'
import Comments from 'components/Comments'
import Page from 'types/Page'
import PageView from 'components/PageView'
import { useAccount } from 'context/AccountContext'

export default function Story() {
  const router = useRouter()
  const { postId } = router.query
  const { activeProfile } = useProfile()
  const { contract } = useAccount()

  const [post, setPost] = useState<any>()
  const [likes, setLikes] = useState<number>(0)
  const [isFollowedByActiveProfile, setIsFollowedByActiveProfile] = useState(null)
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const [isLoadingFollow, setIsLoadingFollow] = useState(false)
  const [publicationToContinue, setPublicationToContinue] = useState(null)

  useEffect(() => {
    async function getPost() {
      setIsLoadingPost(true)
      const postRes = await getPublication(postId)
      const _likes = await contract!.getPageLikes(postId)

      const p = postRes.publication
      const processed: Page = {
        createdAt: p.createdAt,
        id: p.id,
        name: p.metadata.name,
        profile: p.profile,
        content: p.metadata.content,
        font: getTraitFromMetadata(p.metadata, 'Font'),
        page: 1,
        partOfStory: 'Beginning',
        continuedFrom: null,
      }
      setPost(processed)
      setLikes(_likes.toNumber())
      setIsLoadingPost(false)
    }
    if (!post && !isLoadingPost && postId) {
      getPost()
    }
  })

  useEffect(() => {
    async function checkIfActiveProfileFollowsPost() {
      setIsLoadingFollow(true)
      const doesProfileFollowStory = await contract!.doesProfileFollowStory(activeProfile.id, postId)
      setIsFollowedByActiveProfile(doesProfileFollowStory)
      setIsLoadingFollow(false)
    }
    if (isFollowedByActiveProfile === null && activeProfile && !isLoadingFollow && postId) {
      checkIfActiveProfileFollowsPost()
    }
  }, [activeProfile, isLoadingFollow, postId, contract, isFollowedByActiveProfile])

  async function handleToggleFollow() {
    setIsLoadingFollow(true)
    if (isFollowedByActiveProfile) {
      await contract!.unfollowStory(activeProfile.id, postId)
    } else {
      await contract!.followStory(activeProfile.id, postId)
    }
    setIsLoadingFollow(false)
  }

  return (
    <>
      {!post ? (
        <Loader />
      ) : (
        <PageView
          page={post}
          likes={likes}
          isFollowedByActiveProfile={isFollowedByActiveProfile}
          onContinue={() => setPublicationToContinue(post)}
          onUpdateLikes={setLikes}
          onToggleFollow={handleToggleFollow}
          isLoadingFollow={isLoadingFollow}
        />
      )}
      <Comments onContinueFromComment={setPublicationToContinue} />
      {publicationToContinue && (
        <ContinueStoryModal
          firstPage={post}
          previousPage={publicationToContinue}
          font={post.font}
          onClose={() => setPublicationToContinue(null)}
        />
      )}
    </>
  )
}
