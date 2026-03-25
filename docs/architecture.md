# Architecture

Technical decisions for Civiti-Mobile. See `PRD.md` for product context.

## Folder Structure

```
app/
  _layout.tsx                 # Root: QueryClientProvider → AuthProvider → ThemeProvider → Stack
  (auth)/                     # Modal stack (login, register, register-profile, forgot/reset-password)
  (tabs)/
    _layout.tsx               # 4 tabs: Probleme, Creează, Ale mele, Profil
    index.tsx                 # Tab 1: Issues list (card + map toggle)
    create/                   # Tab 2: 5-step wizard (index, photos, details, authorities, review)
    my-issues.tsx             # Tab 3: User's issues
    profile.tsx               # Tab 4: Profile + gamification
  issues/[id].tsx             # Issue detail
  issues/[id]/edit.tsx        # Edit issue
  onboarding.tsx              # First-launch slides
  badges.tsx | achievements.tsx | leaderboard.tsx | settings.tsx | edit-profile.tsx

components/
  ui/                         # Primitives (button, text-input, status-badge, category-badge,
                              #   urgency-badge, chip-selector, progress-bar, avatar, bottom-sheet)
  themed-text.tsx | themed-view.tsx
  issue-card.tsx | issue-mini-card.tsx | comment-card.tsx | activity-item.tsx
  vote-button.tsx | photo-gallery.tsx | photo-grid.tsx | authority-card.tsx
  stat-card.tsx | badge-card.tsx | achievement-card.tsx | leaderboard-entry.tsx
  empty-state.tsx | error-state.tsx | loading-skeleton.tsx
  email-prompt.tsx | filter-sheet.tsx

constants/
  theme.ts                    # Colors (light/dark), Fonts
  spacing.ts                  # Spacing, BorderRadius, Shadows
  api.ts                      # API_BASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
  enums.ts                    # IssueStatus, IssueCategory, UrgencyLevel value maps
  localization.ts             # Romanian labels

hooks/                        # One hook per data concern
  use-auth.ts                 # AuthContext consumer (session, login, logout, requireAuth)
  use-issues.ts               # useInfiniteQuery: paginated issues
  use-issue-detail.ts         # useQuery: single issue
  use-my-issues.ts            # useQuery: user's issues
  use-comments.ts             # useInfiniteQuery + mutations
  use-vote.ts                 # useMutation: optimistic vote toggle
  use-email-tracking.ts       # useMutation: track email
  use-user-profile.ts         # useQuery: profile
  use-gamification.ts         # useQuery: points, badges, achievements
  use-leaderboard.ts          # useQuery: leaderboard
  use-categories.ts           # useQuery: categories
  use-authorities.ts          # useQuery: filtered authorities
  use-create-issue.ts         # Wizard state + submit mutation
  use-enhance-text.ts         # useMutation: AI text enhancement

services/
  api-client.ts               # Fetch wrapper (base URL, auth headers, error mapping)
  auth.ts                     # Supabase Auth (signIn, signUp, signOut, getSession, onAuthStateChange)
  issues.ts | comments.ts | user.ts | activity.ts | authorities.ts | categories.ts | gamification.ts
  errors.ts                   # ApiError, AuthError, NetworkError

types/
  api.ts                      # PagedResult<T>, ApiErrorResponse
  issues.ts | comments.ts | user.ts | auth.ts | gamification.ts
  enums.ts                    # Union types: IssueStatus, IssueCategory, UrgencyLevel, ActivityType

store/
  auth-context.tsx            # AuthProvider + useAuth
  query-client.tsx            # QueryClient config + provider
  wizard-store.ts             # Issue creation wizard state (zustand or context)
```

## Navigation

```
Root Stack
├── onboarding                      # First launch only (AsyncStorage flag)
├── (tabs)                          # Always accessible (progressive auth)
│   ├── index (Probleme)            # Public
│   ├── create/ Stack (Creează)     # Auth required
│   ├── my-issues (Ale mele)        # Auth required
│   └── profile (Profil)            # Auth required
├── issues/[id] | issues/[id]/edit
├── leaderboard | badges | achievements | settings | edit-profile
└── (auth) Modal Stack              # login, register, register-profile, forgot/reset-password
```

**Progressive auth**: Browse without login. Protected actions → `(auth)/login` modal → dismiss on success → resume action.

## State Management

| Data | Solution |
|---|---|
| Auth session | React Context (`AuthProvider`) |
| Server data | TanStack Query (`staleTime: 30s`, `gcTime: 5min`, `retry: 2`) |
| Wizard state | Zustand or Context + AsyncStorage draft persistence |
| Form state | Local `useState` |
| Theme | `useColorScheme` hook |
| Onboarding flag | AsyncStorage boolean |

**Provider stack** (root layout): `QueryClientProvider → AuthProvider → ThemeProvider → Stack`

## API Layer

```
Screen → TanStack Query hook → Service function → apiClient → Backend (.NET)
```

**apiClient** (`services/api-client.ts`):
- Wraps `fetch()` with base URL, JSON headers, query param serialization
- `authenticated` option (default `true`) — reads JWT from Supabase session
- Throws `ApiError(status, message, requestId)` on non-2xx
- Throws `AuthError` when no session and `authenticated: true`
- Returns `undefined` on 204

**Service pattern**: Each service file exports functions that call `apiClient<ResponseType>(path, options)`. Public endpoints pass `authenticated: false`.

## Auth Flow

1. App launch → Supabase checks session in SecureStore
2. No session → tabs accessible for browsing, auth modal on protected actions
3. Login: Google OAuth | Apple Sign-In (iOS, required by App Store) | Email+Password
4. New user → register (account) → register-profile (`POST /api/user/profile`)
5. Session in `expo-secure-store`, auto-refreshed by Supabase client
6. API calls read token from Supabase session
7. 401 → clear session, present login modal
8. Logout → Supabase signOut, clear SecureStore, invalidate all queries

## Types Strategy

- Manual types in `types/` derived from `docs/openapi.json` — never hardcode response shapes
- `PagedResult<T>` generic for all paginated responses
- Enums as union types (not TS enums): `type IssueStatus = 'Draft' | 'Submitted' | ...`
- `type` keyword (not `interface`) everywhere

## Error Handling

Three error classes in `services/errors.ts`:
- `ApiError(status, message, requestId?)` — non-2xx API responses
- `AuthError(message)` — missing/expired session
- `NetworkError()` — no connectivity

| HTTP | UI |
|---|---|
| Offline | Banner: "Fără conexiune la internet" |
| 401 | Auth modal |
| 403 | "Nu ai permisiunea necesară" |
| 404 | Empty state: "Nu a fost găsit" |
| 400 | Inline field errors |
| 429 | Toast: "Prea multe cereri. Încearcă mai târziu." |
| 500 | Error state with retry + requestId |

## Image Handling

1. `expo-image-picker` → camera or gallery (max 5 photos)
2. `expo-image-manipulator` → resize max 1920px, JPEG 80%
3. Upload to Supabase Storage → get public URLs
4. Display: `expo-image` with caching. Cards: 180px cover. Detail: 250px carousel.

## Deep Linking

```
civitimobile://                    → Tab 1
civitimobile://issues/{id}         → Issue detail
civitimobile://create              → Tab 2
civitimobile://my-issues           → Tab 3
civitimobile://profile             → Tab 4
civitimobile://leaderboard         → Leaderboard
civitimobile://auth/callback       → Supabase OAuth
civitimobile://auth/reset-password → Reset password
```

## Environment

```
EXPO_PUBLIC_API_URL=https://civiti-server-production.up.railway.app/api
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

`.env.local` (gitignored). Defaults in `constants/api.ts`.

## Dependencies

```
@supabase/supabase-js    @tanstack/react-query    expo-secure-store
react-native-url-polyfill react-native-maps        expo-image-picker
expo-image-manipulator    expo-notifications       @gorhom/bottom-sheet
expo-font                expo-image
```

## Screen → Endpoint Map

| Screen | Route | Endpoints | Auth? |
|---|---|---|---|
| Issues List | `/(tabs)/` | `GetIssues`, `GetCategories` | No |
| Issue Detail | `/issues/[id]` | `GetIssueById`, `GetIssueComments` | No (view) / Yes (actions) |
| Create Steps | `/(tabs)/create/*` | `GetCategories`, `GetAuthorities`, `EnhanceText`, `CreateIssue` | Yes |
| My Issues | `/(tabs)/my-issues` | `GetUserIssues` | Yes |
| Edit Issue | `/issues/[id]/edit` | `UpdateUserIssue`, `UpdateUserIssueStatus` | Yes |
| Profile | `/(tabs)/profile` | `GetUserProfile`, `GetUserGamification` | Yes |
| Leaderboard | `/leaderboard` | `GetGamificationLeaderboard` | Yes |
| Badges/Achievements | `/badges`, `/achievements` | `GetUserBadges`, `GetUserAchievements` | Yes |
| Settings | `/settings` | `UpdateUserProfile`, `DeleteUserAccount` | Yes |
| Login/Register | `/(auth)/*` | Supabase Auth, `CreateUserProfile` | No |
