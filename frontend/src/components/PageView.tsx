import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Button, Text, Group, Paper, ActionIcon, Modal, Loader, SimpleGrid } from '@mantine/core'
import { HeartIcon as HeartSolid } from '@heroicons/react/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/outline'
import Page from 'types/Page'
import ProfileImageAndHandle from 'components/ProfileImageAndHandle'
import { sanitize } from 'utils/helpers'
import { useProfile } from 'context/ProfileContext'
import { useAccount } from 'context/AccountContext'

type Props = {
  page: Page
  likes: number
  isFollowedByActiveProfile?: boolean | null
  isLoadingFollow?: boolean
  onToggleFollow?: () => void
  onUpdateLikes: (likes: number) => void
  onContinue: () => void
}

export default function PageView({
  page,
  likes,
  isFollowedByActiveProfile,
  isLoadingFollow,
  onContinue,
  onUpdateLikes,
  onToggleFollow,
}: Props) {
  const { activeProfile } = useProfile()
  const { provider, contract } = useAccount()

  const [doesActiveProfileLikePage, setDoesActiveProfileLikePage] = useState<boolean | null>(null)
  const [showCantLikeModal, setShowCantLikeModal] = useState<boolean>(false)
  const [isLoadingLikes, setIsLoadingLikes] = useState<boolean>(false)
  const [isCheckingIfActiveProfileLikesPage, setIsCheckingIfActiveProfileLikesPage] = useState<boolean>(false)

  useEffect(() => {
    async function checkIfActiveProfileLikesPage() {
      setIsCheckingIfActiveProfileLikesPage(true)
      const _doesActiveProfileLikePage = await contract!.doesProfileLikePage(activeProfile.id, page.id)
      setDoesActiveProfileLikePage(_doesActiveProfileLikePage)
      setIsCheckingIfActiveProfileLikesPage(false)
    }

    if (doesActiveProfileLikePage === null && !isCheckingIfActiveProfileLikesPage && activeProfile && provider) {
      checkIfActiveProfileLikesPage()
    }
  }, [provider, activeProfile, page.id, doesActiveProfileLikePage, isCheckingIfActiveProfileLikesPage, contract])

  async function toggleLike() {
    if (activeProfile) {
      if (doesActiveProfileLikePage) {
        const txn = await contract!.unlikePage(activeProfile.id, page.id)
        setIsLoadingLikes(true)

        console.log('unliking', txn)
        await txn.wait()
        console.log('unliked', txn)

        onUpdateLikes(likes - 1)
        setDoesActiveProfileLikePage(false)
      } else {
        const txn = await contract!.likePage(activeProfile.id, page.id)
        setIsLoadingLikes(true)

        console.log('liking', txn)
        await txn.wait()
        console.log('liked', txn)

        onUpdateLikes(likes + 1)
        setDoesActiveProfileLikePage(true)
      }
      setIsLoadingLikes(false)
    } else {
      setShowCantLikeModal(true)
    }
  }

  function getFollowUi() {
    return (
      <div>
        {activeProfile ? (
          <Button
            variant="subtle"
            style={{ display: 'block' }}
            m="auto"
            onClick={onToggleFollow}
            loading={isLoadingFollow}
          >
            {isFollowedByActiveProfile ? 'Unfollow Story' : 'Follow Story'}
          </Button>
        ) : (
          <Button variant="subtle" style={{ display: 'block', background: 'transparent' }} m="auto" disabled>
            Log in to follow story
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <Paper key={page.id} shadow="xs" p="md" mb="sm">
        <SimpleGrid cols={page.partOfStory === 'Beginning' ? 3 : 2}>
          <ProfileImageAndHandle profile={page.profile} />
          {page.partOfStory === 'Beginning' && getFollowUi()}
          <Text align="right">{new Date(page.createdAt).toLocaleString()}</Text>
        </SimpleGrid>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(page.content),
          }}
          style={{ fontFamily: page.font, padding: '28px 18px' }}
        />
        <Group grow>
          {isLoadingLikes ? (
            <Loader size="sm" />
          ) : (
            <Group spacing="xs">
              <ActionIcon color="red" onClick={toggleLike} disabled={isCheckingIfActiveProfileLikesPage}>
                {doesActiveProfileLikePage ? <HeartSolid /> : <HeartOutline />}
              </ActionIcon>
              <Text>{likes}</Text>
            </Group>
          )}
          <Button onClick={onContinue} disabled={!activeProfile}>
            {activeProfile ? 'Continue Story from Here' : 'Log In to Continue Story'}
          </Button>
          <Text align="right">{page.page}</Text>
        </Group>
      </Paper>
      {showCantLikeModal && (
        <Modal centered opened title="Log in to like story pages" onClose={() => setShowCantLikeModal(false)}>
          <Button onClick={() => setShowCantLikeModal(false)}>Ok</Button>
        </Modal>
      )}
    </>
  )
}
