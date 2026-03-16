import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, Wallet } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  wallet: Wallet | null
  isLoading: boolean
  isInitialized: boolean

  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setWallet: (wallet: Wallet | null) => void
  setLoading: (loading: boolean) => void

  // 初始化：从 Supabase 恢复 session
  initialize: () => Promise<void>
  // 加载用户完整资料
  loadUserData: (userId: string) => Promise<void>
  // 登出
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      wallet: null,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setWallet: (wallet) => set({ wallet }),
      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        set({ isLoading: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            set({ session, user: session.user })
            await get().loadUserData(session.user.id)
          }
          // 监听 auth 状态变化
          supabase.auth.onAuthStateChange(async (_event, session) => {
            set({ session, user: session?.user ?? null })
            if (session?.user) {
              await get().loadUserData(session.user.id)
            } else {
              set({ profile: null, wallet: null })
            }
          })
        } finally {
          set({ isLoading: false, isInitialized: true })
        }
      },

      loadUserData: async (userId: string) => {
        const [profileRes, walletRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('wallets').select('*').eq('user_id', userId).single(),
        ])
        if (profileRes.data) set({ profile: profileRes.data as unknown as Profile })
        if (walletRes.data) set({ wallet: walletRes.data as unknown as Wallet })
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, profile: null, wallet: null })
      },
    }),
    {
      name: 'maoyan-auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
)
