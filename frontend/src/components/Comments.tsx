import { useEffect, useState, useRef } from 'react'
import { Button, Loader, Title, Paper } from '@mantine/core'
import { useRouter } from 'next/router'
import { Carousel } from 'react-responsive-carousel'
import { useProfile } from 'context/ProfileContext'
import { getPublication } from 'utils/getPublication'
import ProfileImageAndHandle from 'components/ProfileImageAndHandle'
import ContinueStoryModal from 'components/ContinueStoryModal'
import { sanitize, getTraitFromMetadata } from 'utils/helpers'
import { getCommentsOnPost } from 'utils/getPublications'
import 'react-responsive-carousel/lib/styles/carousel.min.css' // requires a loader

type Props = {
  onContinueFromComment: (comment: any) => void
}

export default function Comments({ onContinueFromComment }: Props) {
  const router = useRouter()
  const { postId } = router.query
  const { activeProfile } = useProfile()
  const [allCommentsByPage, setAllCommentsByPage] = useState<any[][]>() // an array that holds arrays of comments grouped by page
  const [viewableCommentsByPage, setViewableCommentsByPage] = useState<any[][]>() // same as above but only viewable comments
  //const [pageToCurrentCommentId, setPageToCurrentCommentId] = useState<any>() // TODO: do we need this?
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  useEffect(() => {
    async function getComments() {
      setIsLoadingComments(true)

      const commentsRes = await getCommentsOnPost(postId)

      const allCommentsAscending = commentsRes.publications.items
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
      console.log(allCommentsAscending)
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
      const _pageToCurrentCommentId: any = { 2: _viewableCommentsByPage[0][0].id }
      // we don't need to filter page 2 comments (which are in the first element of _viewableCommentsByPage)
      for (let i = 1; i < _viewableCommentsByPage.length; i++) {
        // filter based on the first comment in the previous page
        _viewableCommentsByPage[i] = _viewableCommentsByPage[i].filter(
          (c) => c.continuedFrom === _viewableCommentsByPage[i - 1][0].id
        )
        //_pageToCurrentCommentId[i + 2] = _viewableCommentsByPage[i][0].id
      }
      // TODO: sort by likes ^
      console.log(_viewableCommentsByPage)
      setAllCommentsByPage(_allCommentsByPage)
      setViewableCommentsByPage(_viewableCommentsByPage)
      //setPageToCurrentCommentId(_pageToCurrentCommentId)
      setIsLoadingComments(false)
    }
    if (!allCommentsByPage && !isLoadingComments && postId) {
      getComments()
    }
  })

  function handleCarouselChange(commentIndex: number, commentsByPageIndex: number) {
    if (!viewableCommentsByPage || !allCommentsByPage) return // to appease typescript

    const newlyViewingCommentId = viewableCommentsByPage[commentsByPageIndex][commentIndex].id
    const newViewableCommentsByPage = [...viewableCommentsByPage] // TODO: figure out if we need a deep copy
    //const newPageToCurrentCommentId = { ...pageToCurrentCommentId }
    // start looping on the next page because only the viewable comments on the next pages change
    for (let i = commentsByPageIndex + 1; i < viewableCommentsByPage.length; i++) {
      newViewableCommentsByPage[i] = allCommentsByPage[i].filter((c) => c.continuedFrom === newlyViewingCommentId)
      console.log(viewableCommentsByPage)
      //newPageToCurrentCommentId[i + 2] = viewableCommentsByPage[i][0].id // TODO: sort by likes before this
    }
    setViewableCommentsByPage(newViewableCommentsByPage)
    //setPageToCurrentCommentId(newPageToCurrentCommentId)
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
      {!viewableCommentsByPage ? (
        <Loader />
      ) : (
        <div>
          {viewableCommentsByPage.map((page, i) => (
            <Carousel
              key={getCarouselKey(page)}
              autoPlay={false}
              showThumbs={false}
              onChange={(commentIndex) => handleCarouselChange(commentIndex, i)}
            >
              {viewableCommentsByPage[i].map((comment) => (
                <Paper key={comment.id}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitize(comment.content),
                    }}
                    style={{ fontFamily: comment.font }}
                  />
                  <Button onClick={() => onContinueFromComment(comment)} disabled={!activeProfile}>
                    {activeProfile ? 'Continue Story from Here' : 'Log In to Continue Story'}
                  </Button>
                </Paper>
              ))}
            </Carousel>
          ))}
        </div>
      )}
    </>
  )
}
