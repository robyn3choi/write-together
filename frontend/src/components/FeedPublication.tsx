import { Button, Title, Text, Group, Paper, ActionIcon, Modal, SimpleGrid, Divider } from '@mantine/core'
import { useAccount } from 'context/AccountContext'
import { useEffect, useState } from 'react'
import { sanitize } from 'utils/helpers'
import { useProfile } from 'context/ProfileContext'
import { HeartIcon as HeartSolid } from '@heroicons/react/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/outline'
import Link from 'next/link'
import Loader from 'components/Loader'

export default function FeedPublication({ publication }) {
  const { contract } = useAccount()
  const { activeProfile } = useProfile()

  const [likes, setLikes] = useState<number | null>(null)
  const [isLoadingLikes, setIsLoadingLikes] = useState(false)
  const [doesActiveProfileLikePage, setDoesActiveProfileLikePage] = useState<boolean | null>(null)
  const [showCantLikeModal, setShowCantLikeModal] = useState<boolean>(false)
  const [isCheckingIfActiveProfileLikesPage, setIsCheckingIfActiveProfileLikesPage] = useState<boolean>(false)

  useEffect(() => {
    async function getLikes() {
      setIsLoadingLikes(true)
      const _likes = await contract!.getPageLikes(publication.id)
      setLikes(_likes.toNumber())
      setIsLoadingLikes(false)
    }
    if (likes === null && !isLoadingLikes && contract) {
      getLikes()
    }
  }, [contract, publication.id, isLoadingLikes, likes])

  async function toggleLike() {
    if (activeProfile) {
      if (doesActiveProfileLikePage) {
        const txn = await contract!.unlikePage(activeProfile.id, publication.id)
        setIsLoadingLikes(true)

        console.log('unliking', txn)
        await txn.wait()
        console.log('unliked', txn)

        setLikes((prevState) => prevState! - 1)
        setDoesActiveProfileLikePage(false)
      } else {
        const txn = await contract!.likePage(activeProfile.id, publication.id)
        setIsLoadingLikes(true)

        console.log('liking', txn)
        await txn.wait()
        console.log('liked', txn)

        setLikes((prevState) => prevState! + 1)
        setDoesActiveProfileLikePage(true)
      }
      setIsLoadingLikes(false)
    } else {
      setShowCantLikeModal(true)
    }
  }

  function getStoryLink() {
    return publication.page > 1 ? publication.mainPost : publication.id
  }

  function getBackgroundColor(theme) {
    if (publication.partOfStory === 'Beginning') {
      return theme.colors.blue[0]
    }
    if (publication.partOfStory === 'End') {
      return theme.colors.green[0]
    }
    return theme.colors.white
  }

  function getTitleColor(theme) {
    if (publication.partOfStory === 'Beginning') {
      return theme.colors.blue[7]
    }
    if (publication.partOfStory === 'End') {
      return theme.colors.green[8]
    }
    return theme.colors.dark[4]
  }

  return (
    <Paper
      key={publication.id}
      shadow="lg"
      withBorder
      p="md"
      mb="sm"
      sx={(theme) => ({
        backgroundColor: getBackgroundColor(theme),
      })}
    >
      <Group noWrap>
        <Link href={`/story/${getStoryLink()}`} passHref>
          <Text
            variant="link"
            className="truncate font-bold cursor-pointer"
            sx={(theme) => ({
              color: getTitleColor(theme),
            })}
          >
            {publication.name}
          </Text>
        </Link>
        <Text ml="auto" size="sm" color="dimmed">
          {new Date(publication.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
        </Text>
      </Group>
      <Divider mt="sm" />
      <div
        dangerouslySetInnerHTML={{
          __html: sanitize(publication.content),
        }}
        style={{ fontFamily: publication.font, padding: '18px' }}
      />
      <Group>
        {isLoadingLikes ? (
          <Loader size="sm" />
        ) : (
          <Group spacing="xs">
            <ActionIcon color="red" onClick={toggleLike} disabled={isCheckingIfActiveProfileLikesPage}>
              {doesActiveProfileLikePage ? <HeartSolid /> : <HeartOutline />}
            </ActionIcon>
            {likes === null ? (
              <Text size="sm" color="dimmed">
                Connect wallet to see likes
              </Text>
            ) : (
              <Text>{likes}</Text>
            )}
          </Group>
        )}
        <Text ml="auto" color="dimmed">
          {publication.page}
        </Text>
      </Group>
    </Paper>
  )
}
