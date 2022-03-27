import { useEffect, useState } from 'react'
import { Group, SimpleGrid } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useAccount } from 'context/AccountContext'
import { explore } from 'utils/explorePublications'
import { getTraitFromMetadata } from 'utils/helpers'
import FeedPublication from 'components/FeedPublication'
import Loader from 'components/Loader'

export default function Home() {
  const [publications, setPublications] = useState<any>()
  const [isLoading, setIsLoading] = useState(false)

  const isLargeScreen = useMediaQuery('(min-width: 1400px)')
  const isMediumScreen = useMediaQuery('(min-width: 1000px)')

  useEffect(() => {
    async function getPublications() {
      setIsLoading(true)
      const res = await explore()
      const formatted = res.explorePublications.items
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

      setPublications(formatted)
      setIsLoading(false)
    }
    if (!publications && !isLoading) {
      getPublications()
    }
  }, [publications, isLoading])

  if (!publications) {
    return <Loader />
  }

  function getColumns(numColumns) {
    const columns: any = []
    for (let i = 0; i < numColumns; i++) {
      columns.push([])
    }

    let columnIndex = 0
    for (let i = 0; i < publications.length; i++) {
      columns[columnIndex].push(publications[i])
      columnIndex = columnIndex === numColumns - 1 ? 0 : columnIndex + 1
    }

    return (
      <SimpleGrid cols={numColumns}>
        {columns.map((column, i) => (
          <Group key={i} direction="column" grow spacing="xs">
            {column.map((p) => (
              <FeedPublication key={p.id} publication={p} />
            ))}
          </Group>
        ))}
      </SimpleGrid>
    )
  }

  if (isLargeScreen) {
    return getColumns(3)
  }

  if (isMediumScreen) {
    return getColumns(2)
  }

  return (
    <div>
      {publications.map((p) => (
        <FeedPublication key={p.id} publication={p} />
      ))}
    </div>
  )
}
