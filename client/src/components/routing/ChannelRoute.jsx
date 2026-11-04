import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Guards a D2C-retail or B2B-wholesale route. Guests (not logged in) can see
 * either channel, matching the dual-channel design (guest checkout, public
 * B2B info before signing up). An authenticated user is confined to their
 * own channel and is redirected to the other channel's home if they try to
 * reach a route that isn't theirs.
 */
export default function ChannelRoute({ channel, children }) {
  const { user, authLoading } = useAuth()

  if (authLoading) return null

  if (user && user.accountType !== channel) {
    return <Navigate to={channel === 'retail' ? '/b2b' : '/shop'} replace />
  }

  return children
}
