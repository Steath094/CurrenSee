import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  getApiErrorMessage,
  getAuthUserName,
  getProfile,
  getUsageLimit,
  saveAuthUserName,
  updateProfile,
} from '../../lib/api'
import type { UsageLimit, UserProfile } from '../../lib/api'
import Button from '../common/Button'
import Icon from '../common/Icon'

type ProfilePanel = 'menu' | 'update' | 'usage'

function getInitials(name?: string) {
  if (!name) {
    return 'CS'
  }

  const [first = '', second = ''] = name.split(/[.\s@_-]+/)
  const initials = `${first.charAt(0)}${second.charAt(0) || first.charAt(1)}`.toUpperCase()

  return initials || 'CS'
}

function formatDate(value?: string) {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function ProfileMenu() {
  const [activePanel, setActivePanel] = useState<ProfilePanel>('menu')
  const [displayName, setDisplayName] = useState(() => getAuthUserName() ?? '')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUsageLoading, setIsUsageLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile>()
  const [statusMessage, setStatusMessage] = useState<string>()
  const [usage, setUsage] = useState<UsageLimit>()

  const loadProfile = async () => {
    setIsLoadingProfile(true)
    setErrorMessage(undefined)

    try {
      const response = await getProfile()
      setProfile(response.user)
      saveAuthUserName(response.user.name)
      setDisplayName(response.user.name)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const loadUsage = async () => {
    setIsUsageLoading(true)
    setErrorMessage(undefined)

    try {
      const response = await getUsageLimit()
      setUsage(response.usage)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsUsageLoading(false)
    }
  }

  const handleToggle = () => {
    const nextIsOpen = !isOpen

    setIsOpen(nextIsOpen)
    setActivePanel('menu')
    setStatusMessage(undefined)
    setErrorMessage(undefined)

    if (nextIsOpen) {
      void loadProfile()
    }
  }

  const handleUsagePanel = () => {
    setActivePanel('usage')
    setStatusMessage(undefined)

    if (!usage) {
      void loadUsage()
    }
  }

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')

    setErrorMessage(undefined)
    setIsSaving(true)

    try {
      const response = await updateProfile({
        email: String(formData.get('email') ?? '').trim(),
        name: String(formData.get('name') ?? '').trim(),
        ...(password ? { password } : {}),
      })

      setProfile(response.user)
      saveAuthUserName(response.user.name)
      setDisplayName(response.user.name)
      setStatusMessage(response.message)
      setActivePanel('menu')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const usagePercentage =
    usage && usage.limit > 0
      ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
      : 0

  return (
    <div className="profile-menu">
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open user profile"
        className="avatar avatar--button"
        onClick={handleToggle}
        type="button"
      >
        {getInitials(profile?.name ?? displayName)}
      </button>

      {isOpen ? (
        <section className="profile-popover" role="dialog" aria-label="User profile">
          <div className="profile-popover__header">
            <div>
              <p className="eyebrow">Profile</p>
              <h3>{(profile?.name ?? displayName) || 'CurrenSee User'}</h3>
              <span>{profile?.email ?? 'Loading profile...'}</span>
            </div>
            <button aria-label="Close profile" onClick={() => setIsOpen(false)} type="button">
              <Icon name="close" size="sm" />
            </button>
          </div>

          {isLoadingProfile ? <p className="profile-message">Loading profile...</p> : null}
          {statusMessage ? <p className="profile-message profile-message--success">{statusMessage}</p> : null}
          {errorMessage ? (
            <p className="profile-message profile-message--error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {activePanel === 'menu' ? (
            <div className="profile-menu__body">
              {/* Future feature - temporarily hidden until plans are active. */}
              {/* <div className="profile-summary">
                <span>Plan</span>
                <strong>{profile?.plan ?? 'free'}</strong>
              </div> */}
              <div className="profile-actions-list">
                <button onClick={() => setActivePanel('update')} type="button">
                  <Icon name="manage_accounts" size="sm" />
                  <span>Update Profile</span>
                  <Icon name="chevron_right" size="sm" />
                </button>
                <button onClick={handleUsagePanel} type="button">
                  <Icon name="speed" size="sm" />
                  <span>Usage Limit</span>
                  <Icon name="chevron_right" size="sm" />
                </button>
              </div>
            </div>
          ) : null}

          {activePanel === 'update' ? (
            <form className="profile-form" onSubmit={handleUpdateProfile}>
              <button className="profile-back-button" onClick={() => setActivePanel('menu')} type="button">
                <Icon name="arrow_back" size="sm" />
                Update Profile
              </button>

              <label>
                <span>Name</span>
                <input defaultValue={profile?.name ?? ''} name="name" required type="text" />
              </label>

              <label>
                <span>Email</span>
                <input defaultValue={profile?.email ?? ''} name="email" required type="email" />
              </label>

              <label>
                <span>New Password</span>
                <input autoComplete="new-password" name="password" placeholder="Leave unchanged" type="password" />
              </label>

              {/* Future feature - temporarily hidden until the retraining pipeline is wired. */}
              {/* <label className="profile-checkbox">
                <input
                  defaultChecked={profile?.allowTrainingData ?? false}
                  name="allowTrainingData"
                  type="checkbox"
                />
                <span>Allow scans to improve model training</span>
              </label> */}

              <Button disabled={isSaving} fullWidth size="small" type="submit" variant="primary">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : null}

          {activePanel === 'usage' ? (
            <div className="usage-panel">
              <button className="profile-back-button" onClick={() => setActivePanel('menu')} type="button">
                <Icon name="arrow_back" size="sm" />
                Usage Limit
              </button>

              {isUsageLoading ? <p className="profile-message">Loading usage...</p> : null}

              {usage ? (
                <>
                  <div className="usage-meter" aria-label={`${usagePercentage}% usage`}>
                    <span style={{ width: `${usagePercentage}%` }} />
                  </div>
                  <div className="usage-stats">
                    <div>
                      <span>Used</span>
                      <strong>{usage.used}</strong>
                    </div>
                    <div>
                      <span>Limit</span>
                      <strong>{usage.limit}</strong>
                    </div>
                    <div>
                      <span>Remaining</span>
                      <strong>{usage.remaining}</strong>
                    </div>
                  </div>
                  <p className="profile-message">
                    Resets daily. Next reset reference: {formatDate(usage.resetAt)}.
                  </p>
                </>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

export default ProfileMenu
