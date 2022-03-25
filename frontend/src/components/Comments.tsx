import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Loader, Box } from '@mantine/core'
import { useRouter } from 'next/router'
import { Carousel } from 'react-responsive-carousel'
import { useProfile } from 'context/ProfileContext'
import { getTraitFromMetadata } from 'utils/helpers'
import { getCommentsOnPost } from 'utils/getPublications'
import Page from 'types/Page'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import PageView from './PageView'
import { useAccount } from 'context/AccountContext'

type Props = {
  onContinueFromComment: (comment: any) => void
}

export default function Comments({ onContinueFromComment }: Props) {
  const router = useRouter()
  const { postId } = router.query
  const { activeProfile } = useProfile()
  const { contract } = useAccount()

  const [allCommentsByPage, setAllCommentsByPage] = useState<any[][]>() // an array that holds arrays of comments grouped by page number
  const [viewableCommentsByPage, setViewableCommentsByPage] = useState<any[][]>() // same as above but only viewable comments
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentsToLikes, setCommentsToLikes] = useState<any>() //

  useEffect(() => {
    async function getComments() {
      setIsLoadingComments(true)
      const commentsRes = await getCommentsOnPost(postId)

      const allCommentsAscending: Page[] = commentsRes.publications.items
        .filter((c) => c.appId === process.env.NEXT_PUBLIC_APP_ID)
        .map((c) => ({
          createdAt: c.createdAt,
          id: c.id,
          name: c.metadata.name,
          profile: c.profile,
          content: c.metadata.content,
          font: getTraitFromMetadata(c.metadata, 'Font'),
          page: parseInt(getTraitFromMetadata(c.metadata, 'Page')),
          partOfStory: getTraitFromMetadata(c.metadata, 'Part of Story'),
          continuedFrom: getTraitFromMetadata(c.metadata, 'Continued from') || postId, // some early page 2 comments don't have this attribute
        }))
      // sort in ascending order of page number
      allCommentsAscending.sort((a, b) => a.page - b.page)
      const _allCommentsByPage: any[][] = []

      allCommentsAscending.forEach((c) => {
        const index = c.page - 2 // the first comments start on page 2 of a story
        if (_allCommentsByPage[index]) {
          _allCommentsByPage[index].push(c)
        } else {
          _allCommentsByPage.push([c])
        }
      })

      const _viewableCommentsByPage: any[][] = [..._allCommentsByPage]
      console.log(_viewableCommentsByPage)
      const _commentsToLikes = {}
      // we don't need to filter page 2 comments (which are in the first element of _viewableCommentsByPage)
      for (let i = 0; i < _viewableCommentsByPage.length; i++) {
        if (i > 0) {
          // only viewing comments continued from the first comment in the previous page
          _viewableCommentsByPage[i] = _viewableCommentsByPage[i].filter(
            (c) => c.continuedFrom === _viewableCommentsByPage[i - 1][0].id
          )
        }
        // for each viewable comment on this page, get its likes
        for (let comment of _viewableCommentsByPage[i]) {
          const likes = await contract!.getPageLikes(comment.id)
          _commentsToLikes[comment.id] = likes.toNumber()
        }
        _viewableCommentsByPage[i].sort((a, b) => _commentsToLikes[b.id] - _commentsToLikes[a.id])
      }
      setAllCommentsByPage(_allCommentsByPage)
      setViewableCommentsByPage(_viewableCommentsByPage)
      setCommentsToLikes(_commentsToLikes)
      setIsLoadingComments(false)
    }
    if (!allCommentsByPage && !isLoadingComments && postId) {
      getComments()
    }
  })

  async function handleCarouselChange(commentIndex: number, commentsByPageIndex: number) {
    if (!viewableCommentsByPage || !allCommentsByPage) return // to appease typescript

    const newlyViewingCommentId = viewableCommentsByPage[commentsByPageIndex][commentIndex].id
    const newViewableCommentsByPage = [...viewableCommentsByPage] // TODO: figure out if we need a deep copy
    const newCommentsToLikes = { ...commentsToLikes }
    // start looping on the next page because only the viewable comments on the next pages change
    for (let i = commentsByPageIndex + 1; i < viewableCommentsByPage.length; i++) {
      newViewableCommentsByPage[i] = allCommentsByPage[i].filter((c) => c.continuedFrom === newlyViewingCommentId)
      // for each viewable comment on this page, get its likes
      for (let comment of newViewableCommentsByPage[i]) {
        if (newCommentsToLikes[comment.id] === undefined) {
          const likes = await contract!.getPageLikes(comment.id)
          newCommentsToLikes[comment.id] = likes.toNumber()
        }
      }
      newViewableCommentsByPage[i].sort((a, b) => newCommentsToLikes[b.id] - newCommentsToLikes[a.id])
    }
    setCommentsToLikes(newCommentsToLikes)
    setViewableCommentsByPage(newViewableCommentsByPage)
  }

  function getCarouselKey(page: any[]) {
    let key = ''
    for (let comment of page) {
      key += comment.id
    }
    return key
  }

  return (
    <>
      {!viewableCommentsByPage || !commentsToLikes ? (
        <Loader />
      ) : (
        <Box>
          {viewableCommentsByPage.map((page, i) => (
            <Carousel
              key={getCarouselKey(page)}
              autoPlay={false}
              showThumbs={false}
              onChange={(commentIndex) => handleCarouselChange(commentIndex, i)}
            >
              {viewableCommentsByPage[i].map((comment) => (
                <PageView
                  key={comment.id}
                  page={comment}
                  likes={commentsToLikes[comment.id]}
                  onUpdateLikes={(likes) => setCommentsToLikes((prevState) => ({ ...prevState, [comment.id]: likes }))}
                  onContinue={() => onContinueFromComment(comment)}
                />
              ))}
            </Carousel>
          ))}
        </Box>
      )}
    </>
  )
}
