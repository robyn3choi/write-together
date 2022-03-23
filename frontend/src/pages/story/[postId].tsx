import { useEffect, useState } from 'react'
import { Button, Loader, Title, Paper } from '@mantine/core'
import { useRouter } from 'next/router'
import { useProfile } from 'context/ProfileContext'
import { getPublication } from 'utils/getPublication'
import ProfileImageAndHandle from 'components/ProfileImageAndHandle'
import ContinueStoryModal from 'components/ContinueStoryModal'
import { sanitize, getTraitFromMetadata } from 'utils/helpers'
import Comments from 'components/Comments'

export default function Story() {
  const router = useRouter()
  const { postId } = router.query
  const { activeProfile } = useProfile()
  const [post, setPost] = useState<any>()
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const [publicationToContinue, setPublicationToContinue] = useState(null)

  useEffect(() => {
    async function getPost() {
      setIsLoadingPost(true)
      const postRes = await getPublication(postId)
      const p = postRes.publication
      const processed = {
        createdAt: p.createdAt,
        id: p.id,
        name: p.metadata.name,
        profile: p.profile,
        content: p.metadata.content,
        font: getTraitFromMetadata(p.metadata, 'Font'),
        page: 1,
        partOfStory: 'Beginning',
      }
      setPost(processed)
      setIsLoadingPost(false)
    }
    if (!post && !isLoadingPost && postId) {
      getPost()
    }
  })

  return (
    <>
      {!post ? (
        <Loader />
      ) : (
        <div>
          <ProfileImageAndHandle profile={post.profile} />
          <Title order={1} align="center">
            {post.name}
          </Title>
          <Paper />
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize(post.content),
            }}
            style={{ fontFamily: post.font }}
          />
          <Button disabled={!activeProfile} onClick={() => setPublicationToContinue(post)}>
            {activeProfile ? 'Continue Story' : 'Log In to Continue Story'}
          </Button>
        </div>
      )}
      <Comments onContinueFromComment={setPublicationToContinue} />
      {publicationToContinue && (
        // TODO: make previous page not always first page
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
