import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AppShell, Navbar, Header } from '@mantine/core'
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { AccountProvider } from 'context/AccountContext'
import { AuthProvider } from 'context/AuthContext'
import HeaderContent from 'components/HeaderContent'
import { ProfileProvider } from 'context/ProfileContext'

function MyApp({ Component, pageProps }: AppProps) {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
  })

  function toggleColorScheme() {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
  }
  console.log(colorScheme)
  return (
    <AccountProvider>
      <AuthProvider>
        <ProfileProvider>
          <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
              <AppShell
                padding="md"
                header={
                  <Header height={60} p="xs">
                    <HeaderContent colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />
                  </Header>
                }
                styles={(theme) => ({
                  main: {
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                    maxWidth: '1024px',
                    margin: 'auto',
                  },
                })}
              >
                <Component {...pageProps} />
              </AppShell>
            </MantineProvider>
          </ColorSchemeProvider>
        </ProfileProvider>
      </AuthProvider>
    </AccountProvider>
  )
}

export default MyApp
