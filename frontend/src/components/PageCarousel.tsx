import { useEffect, useState, useRef } from 'react'
import { Button, Loader, Title, Paper } from '@mantine/core'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { sanitize, getTraitFromMetadata } from 'utils/helpers'

export default function PageCarousel({ firstPageId, previousPagePublicationId, allCommentsWithThisPage, font }) {
  // the first couple comments I created didnt have the "Continued from" trait so we're going to behave as if they continued from the first page
  const commentsContinuingFromPreviousId = allCommentsWithThisPage.filter(
    (c) => (getTraitFromMetadata(c.metadata, 'Continued from') || firstPageId) === previousPagePublicationId
  )
  return (
    <Carousel autoPlay={false} showThumbs={false}>
      {allCommentsWithThisPage.filter()}
      {commentsContinuingFromPreviousId.map((comment) => (
        <Paper>
          <div
            key={comment.id}
            dangerouslySetInnerHTML={{
              __html: sanitize(comment.metadata.content),
            }}
            style={{ fontFamily: font }}
          />
          <Button onClick={}>Continue the story from here</Button>
        </Paper>
      ))}
    </Carousel>
  )
}
