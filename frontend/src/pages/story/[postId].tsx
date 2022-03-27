import { useCallback, useEffect, useState } from 'react'
import { Title } from '@mantine/core'
import { useRouter } from 'next/router'
import { useProfile } from 'context/ProfileContext'
import { getPublication } from 'utils/getPublication'
import ContinueStoryModal from 'components/ContinueStoryModal'
import { getTraitFromMetadata } from 'utils/helpers'
import Comments from 'components/Comments'
import Page from 'types/Page'
import PageView from 'components/PageView'
import { useAccount } from 'context/AccountContext'
import Loader from 'components/Loader'

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
  const [allPublicationsInStory, setAllPublicationsInStory] = useState<any[]>([])

  const getPost = useCallback(async () => {
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
      mainPost: null,
    }
    setPost(processed)
    setLikes(_likes.toNumber())
    setAllPublicationsInStory((prevState) => [processed, ...prevState])
    setIsLoadingPost(false)
  }, [contract, postId])

  useEffect(() => {
    if (!post && !isLoadingPost && postId && contract) {
      getPost()
    }
  }, [contract, isLoadingPost, post, postId, getPost])

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

  function handleCommentsLoaded(comments) {
    setAllPublicationsInStory((prevState) => [...prevState, ...comments])
  }

  return (
    <div className="px-6">
      <Title order={2} className="text-center mb-4">
        {post ? post.name : null}
      </Title>
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
      <Comments onContinueFromComment={setPublicationToContinue} onCommentsLoaded={handleCommentsLoaded} />
      {publicationToContinue && (
        <ContinueStoryModal
          firstPage={post}
          previousPage={publicationToContinue}
          font={post.font}
          allPublicationsInStory={allPublicationsInStory}
          onClose={() => setPublicationToContinue(null)}
          onFinishSubmit={getPost}
        />
      )}
    </div>
  )
}
