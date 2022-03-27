import { useEffect, useState } from 'react'
import { ActionIcon, Button, Group, Text } from '@mantine/core'
import { SunIcon, MoonIcon } from '@heroicons/react/solid'
import { useAccount } from 'context/AccountContext'
import { useAuth } from 'context/AuthContext'
import NewStory from 'components/NewStory'
import CreateProfileModal from './CreateProfileModal'
import { useProfile } from 'context/ProfileContext'
import ProfileImageAndHandle from './ProfileImageAndHandle'
import ProfileDropdown from './ProfileDropdown'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'

// type Props = {
//   colorScheme: string
//   toggleColorScheme: () => void
// }

export default function HeaderContent() {
  const router = useRouter()

  const { address, connectWallet } = useAccount()
  const { login, isLoggedIn } = useAuth()
  const { activeProfile } = useProfile()

  function getAddressOrConnectButton() {
    if (address) {
      return address.substring(0, 6) + '...' + address.substring(address.length - 6, address.length)
    }
    return <Button onClick={connectWallet}>Connect Wallet</Button>
  }

  return (
    <>
      <Group className="h-full">
        <Group>
          <Link href="/story/new" passHref>
            <Button component="a" className={clsx(router.asPath === '/story/new' && 'font-bold')} color="blue">
              Start New Story
            </Button>
          </Link>
          <Link href="/" passHref>
            <Text variant="link" component="a" className={clsx('text-gray-800', router.asPath === '/' && 'font-bold')}>
              Explore
            </Text>
          </Link>
          <Link href="/feed" passHref>
            <Text
              variant="link"
              component="a"
              className={clsx(
                router.asPath.includes('feed') && 'font-bold',
                activeProfile ? 'text-gray-800' : 'text-gray-400 pointer-events-none'
              )}
            >
              My Feed
            </Text>
          </Link>
          <Link href={`/profile/${activeProfile?.id}`} passHref>
            <Text
              variant="link"
              component="a"
              className={clsx(
                router.asPath.includes(`profile/${activeProfile?.id}`) && 'font-bold',
                activeProfile ? 'text-gray-800' : 'text-gray-400 pointer-events-none'
              )}
            >
              My Profile
            </Text>
          </Link>
        </Group>
        <Group ml="auto" position="right" direction="row">
          {!isLoggedIn && address && (
            <Button variant="outline" onClick={login}>
              Log In
            </Button>
          )}
          {isLoggedIn && <ProfileDropdown />}
          {getAddressOrConnectButton()}
          {/* <ActionIcon onClick={toggleColorScheme} className="w-2">
            {colorScheme === 'dark' ? <SunIcon className="h-8 w-8" /> : <MoonIcon className="h-8 w-8" />}
          </ActionIcon> */}
        </Group>
      </Group>
    </>
  )
}
