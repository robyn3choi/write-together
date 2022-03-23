import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AppShell, Navbar, Header } from '@mantine/core'
import { MantineProvider } from '@mantine/core'
import { AccountProvider } from 'context/AccountContext'
import { AuthProvider } from 'context/AuthContext'
import HeaderContent from 'components/HeaderContent'
import { ProfileProvider } from 'context/ProfileContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AccountProvider>
      <AuthProvider>
        <ProfileProvider>
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme: 'dark',
            }}
          >
            <AppShell
              padding="md"
              header={
                <Header height={60} p="xs">
                  <HeaderContent />
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
        </ProfileProvider>
      </AuthProvider>
    </AccountProvider>
  )
}

export default MyApp
