import { createContext, ReactNode, useState, useEffect } from 'react';
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { api } from '../services/api';

WebBrowser.maybeCompleteAuthSession()

interface AuthContextProviderProps {
  children: ReactNode
}

interface UserProps {
  name: string;
  avatarUrl: string;
}

export interface AuthContextProps {
  user: UserProps
  isUserLoading: boolean
  signIn: () => Promise<void>
}

export const AuthContext = createContext({} as AuthContextProps)

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserProps>()
  const [isUserLoading, setIsUserLoading] = useState(false)

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email']
  })

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      signInWitGoogle(response.authentication.accessToken)
    }
  }, [response])

  async function signIn() {
    try {
      setIsUserLoading(true)
      await promptAsync()
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  async function signInWitGoogle(access_token: string) {
    try {
      setIsUserLoading(true)

      const response = await api.post('users', { access_token })
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

      const userResponse = await api.get('me')
      setUser(userResponse.data.user)
    } catch (error) {
      console.log(error);
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      signIn,
      user,
      isUserLoading
    }}>
      { children }
    </AuthContext.Provider>
  )
}