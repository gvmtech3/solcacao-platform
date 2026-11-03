const STORAGE_KEY = 'solcacao_guest_session_id'

export function getGuestSessionId() {
  try {
    let id = window.localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      window.localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    // localStorage unavailable (private mode, etc.) - fall back to a per-load id.
    return 'no-storage-session'
  }
}
