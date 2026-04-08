# Topbar — Dynamic Session Data + Logout Button

## Root Cause / Causa Raiz

**EN:** The `Topbar` component currently uses a hardcoded string `"Patrícia Gonçalves"` and has no authentication awareness. There is no logout mechanism, making it impossible to end a session from the UI.

**PT:** O componente `Topbar` exibe o nome `"Patrícia Gonçalves"` fixo no código e não tem consciência da sessão autenticada. Não existe mecanismo de logout, impossibilitando o encerramento de sessão pela interface.

---

## Proposed Changes / Mudanças Propostas

### `components/dashboard/topbar.tsx`

| # | EN — Technical Change | PT — Functional Explanation |
|---|---|---|
| 1 | Add `useEffect` + `useState` to call `supabase.auth.getUser()` on mount | Buscar o usuário autenticado ao montar o componente |
| 2 | Replace hardcoded `"Patrícia Gonçalves"` with `user?.user_metadata?.full_name \|\| user?.email` | Exibir o nome real (se houver nos metadados) ou o e-mail do usuário logado |
| 3 | Derive initials dynamically from the display name for the `AvatarFallback` | Iniciais do avatar calculadas a partir do nome/e-mail real |
| 4 | Add `useRouter` from `next/navigation` | Preparar o redirecionamento pós-logout |
| 5 | Add a **Logout button** (`LogOut` icon from lucide-react) inside the avatar section — `variant="ghost"` / `size="icon"` — that calls `supabase.auth.signOut()` then `router.push("/login")` | Botão de sair (ícone de porta) ao lado do avatar; ao clicar, encerra a sessão e redireciona para `/login` |

> [!IMPORTANT]
> **No layout changes.** The logout button will be placed **inside the existing right-side `<div>`**, right after the Avatar block, using the same `Button variant="ghost" size="icon"` pattern already used in the notifications button. Visual parity is preserved.

> [!NOTE]
> `user_metadata.full_name` is populated automatically by Supabase for OAuth (Google/GitHub) sign-ins. For email/password accounts it may be empty, so we fall back to `user.email`.

---

## Files Touched / Arquivos Afetados

#### [MODIFY] [topbar.tsx](file:///c:/projetos/Next.js/espaco-somente-web/components/dashboard/topbar.tsx)

- **Lines 1–7** — add imports: `useState`, `useEffect`, `useRouter`, `createClient`, `LogOut` icon
- **Lines 8–52** — add state/effect for session fetch; replace static name; add logout button

No other files need to be changed.

---

## Verification Plan / Plano de Verificação

| Step | Action | PT |
|---|---|---|
| 1 | `npm run dev` is already running — open `http://localhost:3000` | Abrir o app no navegador |
| 2 | Log in and verify the topbar shows the real user e-mail/name | Verificar nome/e-mail real na topbar |
| 3 | Click the logout button and confirm redirect to `/login` | Clicar no botão de sair e confirmar redirecinamento |
| 4 | Confirm Supabase session is cleared (unauthenticated navigation is blocked by middleware) | Sessão encerrada; middleware bloqueia acesso não autenticado |
