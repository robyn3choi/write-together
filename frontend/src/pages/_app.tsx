import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { AccountProvider } from 'context/AccountContext'
import { AuthProvider } from 'context/AuthContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AccountProvider>
      <AuthProvider>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: 'dark',
          }}
        >
          <Component {...pageProps} />
        </MantineProvider>
      </AuthProvider>
    </AccountProvider>
  )
}

export default MyApp
