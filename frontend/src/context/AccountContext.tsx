import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import { setSigner } from 'utils/lensHub'

declare let window: any

const AccountContext = createContext<ProviderValue | undefined>(undefined)
type Props = { children: ReactNode }

type ProviderValue = {
  address: string | null
  connectWallet: () => void
  provider: ethers.providers.Web3Provider | null
}

export function AccountProvider({ children }: Props) {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined' && !provider) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)
      setSigner(provider.getSigner())
    }
  })

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload()
      })
    }
  })

  useEffect(() => {
    async function checkIfWalletIsConnected() {
      try {
        const { ethereum } = window
        if (!ethereum) {
          console.log('Make sure you have metamask!')
          return
        } else {
          console.log('We have the ethereum object', ethereum)
        }
        const accounts = await ethereum.request({ method: 'eth_accounts' })

        if (accounts.length !== 0) {
          const account = accounts[0]
          console.log('Found an authorized account:', account)
          setAddress(account)
        } else {
          console.log('No authorized account found')
        }
      } catch (error) {
        console.log(error)
      }
    }
    checkIfWalletIsConnected()
  }, [])

  async function connectWallet() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAddress(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  return <AccountContext.Provider value={{ address, connectWallet, provider }}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount must be used within a AccountProvider')
  }
  return context
}
