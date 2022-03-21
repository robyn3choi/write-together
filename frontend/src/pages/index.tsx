import { useEffect, useState } from 'react'
import { explorePublications } from 'utils/apollo'
import { useAccount } from 'context/AccountContext'
import { useAuth } from 'context/AuthContext'
import NewStory from 'components/NewStory'

export default function Home() {
  useEffect(() => {
    async function blah() {
      const res = await explorePublications({ limit: 50, sortCriteria: 'TOP_COMMENTED' })
      console.log(res)
    }
    //blah()
  }, [])
  return (
    <div>
      <NewStory></NewStory>
    </div>
  )
}
