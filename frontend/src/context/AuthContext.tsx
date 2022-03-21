import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import jwt from 'jsonwebtoken'
import { useTimeout } from 'usehooks-ts'
import { useAccount } from './AccountContext'
import { generateChallenge, authenticate, refreshAuth } from 'utils/login'

declare let window: any

const AuthContext = createContext<any>(undefined)
type Props = { children: ReactNode }

export function AuthProvider({ children }: Props) {
  const { address, provider } = useAccount()
  const [accessToken, setAccessToken] = useState<string>()
  const [refreshToken, setRefreshToken] = useState<string>()
  const [timeoutDelay, setTimeoutDelay] = useState<number | null>(null)

  useTimeout(refresh, timeoutDelay)

  async function login() {
    if (accessToken) {
      console.log('login: already logged in')
      return
    }
    console.log('login: address', address)
    const challengeResponse = await generateChallenge(address!)
    const signature = await provider!.getSigner().signMessage(challengeResponse.data.challenge.text)
    const accessTokens = await authenticate(address!, signature)

    console.log('login: result', accessTokens.data)
    setRefreshTimeout(accessTokens.data.authenticate.accessToken)

    setAccessToken(accessTokens.data.authenticate.accessToken)
    setRefreshToken(accessTokens.data.authenticate.refreshToken)
    return accessTokens.data
  }

  function setRefreshTimeout(token) {
    const decoded = jwt.decode(token)
    const timeToTokenExpiry = 1000 * decoded.exp - Date.now()
    setTimeoutDelay(timeToTokenExpiry - 120000) // subtract 2 min
  }

  async function refresh() {
    console.log('refreshing')
    const newTokens = await refreshAuth(refreshToken)
    setRefreshTimeout(newTokens.data.refresh.accessToken)
    setAccessToken(newTokens.data.refresh.accessToken)
    setRefreshToken(newTokens.data.refresh.refreshToken)
  }

  return <AuthContext.Provider value={{ login }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}
