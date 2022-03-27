import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AppShell, Navbar, Header } from '@mantine/core'
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { AccountProvider } from 'context/AccountContext'
import { AuthProvider } from 'context/AuthContext'
import HeaderContent from 'components/HeaderContent'
import { ProfileProvider } from 'context/ProfileContext'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
  //   key: 'mantine-color-scheme',
  //   defaultValue: 'light',
  // })

  // function toggleColorScheme() {
  //   setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
  // }

  return (
    <AccountProvider>
      <AuthProvider>
        <ProfileProvider>
          {/* <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}> */}
          <MantineProvider withGlobalStyles withNormalizeCSS theme={{ spacing: { xs: 4 } }}>
            <AppShell
              padding="md"
              fixed
              header={
                <Header height={68} px="lg" className="shadow">
                  <HeaderContent />
                </Header>
              }
              styles={(theme) => ({
                main: {
                  //backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                  maxWidth: router.pathname === '/' ? 'none' : '1024px',
                  margin: 'auto',
                  background: 'transparent',
                  // backgroundImage: 'url(bg.jpeg)',
                  // backgroundSize: 'cover',
                },
              })}
            >
              <Component {...pageProps} />
            </AppShell>
          </MantineProvider>
          {/* </ColorSchemeProvider> */}
        </ProfileProvider>
      </AuthProvider>
    </AccountProvider>
  )
}

export default MyApp
