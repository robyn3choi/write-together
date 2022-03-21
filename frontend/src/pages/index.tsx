import { useEffect, useState } from 'react'
import { explorePublications } from 'utils/apollo'
import { useAccount } from 'context/AccountContext'
import { useAuth } from 'context/AuthContext'
import NewStory from 'components/NewStory'

export default function Home() {
  const { address, connectWallet } = useAccount()
  const { login } = useAuth()

  useEffect(() => {
    async function logInToLens() {
      const res = await login(address)
      console.log(res)
    }
  }, [address])

  useEffect(() => {
    async function blah() {
      const res = await explorePublications({ limit: 50, sortCriteria: 'TOP_COMMENTED' })
      console.log(res)
    }
    //blah()
  }, [])

  return (
    <div>
      {address || <button onClick={connectWallet}>connect wallet</button>}
      <button onClick={login}>login</button>
      <NewStory></NewStory>
    </div>
  )
}
