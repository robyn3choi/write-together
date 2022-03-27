import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Divider, Button, Text, Group, Paper, ActionIcon, Modal, SimpleGrid, Loader, Title } from '@mantine/core'
import { HeartIcon as HeartSolid } from '@heroicons/react/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/outline'
import Page from 'types/Page'
import ProfileImageAndHandle from 'components/ProfileImageAndHandle'
import { sanitize } from 'utils/helpers'
import { useProfile } from 'context/ProfileContext'
import { useAccount } from 'context/AccountContext'
import { collect } from 'utils/collect'
import { pollUntilIndexed } from 'utils/pollUntilIndexed'

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
  const [isCollecting, setIsCollecting] = useState(false)
  const [hasCollected, setHasCollected] = useState(false)

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

  function getBackgroundColor(theme) {
    if (page.partOfStory === 'Beginning') {
      return theme.colors.blue[0]
    }
    if (page.partOfStory === 'End') {
      return theme.colors.green[0]
    }
    return theme.colors.white
  }

  async function onCollect() {
    setIsCollecting(true)
    const tx = await collect(page.id, provider!.getSigner())
    await pollUntilIndexed(tx.hash)
    setIsCollecting(false)
    setHasCollected(true)
  }

  return (
    <>
      <Paper
        key={page.id}
        shadow="lg"
        withBorder
        p="md"
        mb="sm"
        sx={(theme) => ({
          backgroundColor: getBackgroundColor(theme),
        })}
      >
        <SimpleGrid cols={page.partOfStory === 'Beginning' ? 3 : 2}>
          <ProfileImageAndHandle profile={page.profile} />
          {page.partOfStory === 'Beginning' && getFollowUi()}
          <Text mt="6px" ml="auto" size="sm" color="dimmed">
            {new Date(page.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
          </Text>
        </SimpleGrid>
        <Divider mt="sm" />
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(page.content),
          }}
          style={{ fontFamily: page.font, padding: '28px 18px' }}
        />
        <Group grow>
          <Group spacing="xs">
            {isLoadingLikes ? (
              <Loader size="sm" />
            ) : (
              <>
                <ActionIcon color="red" onClick={toggleLike} disabled={isCheckingIfActiveProfileLikesPage}>
                  {doesActiveProfileLikePage ? <HeartSolid /> : <HeartOutline />}
                </ActionIcon>
                <Text>{likes}</Text>
              </>
            )}
          </Group>
          <div>
            {page.partOfStory === 'End' ? (
              <Button
                size="xs"
                color="green"
                onClick={onCollect}
                disabled={!activeProfile || hasCollected}
                loading={isCollecting}
                className="m-auto block"
              >
                {hasCollected ? 'Collected' : activeProfile ? 'Collect' : 'Log In to Collect'}
              </Button>
            ) : (
              <Button
                size="xs"
                variant="outline"
                onClick={onContinue}
                disabled={!activeProfile}
                className="m-auto block"
              >
                {activeProfile ? 'Continue' : 'Log In to Continue Story'}
              </Button>
            )}
          </div>
          <Text align="right">{page.page}</Text>
        </Group>
      </Paper>
      {page.partOfStory === 'End' && (
        <Title order={3} className="text-center">
          The End
        </Title>
      )}
      {showCantLikeModal && (
        <Modal centered opened title="Log in to like story pages" onClose={() => setShowCantLikeModal(false)}>
          <Button onClick={() => setShowCantLikeModal(false)}>Ok</Button>
        </Modal>
      )}
    </>
  )
}
