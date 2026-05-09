import Button from '../common/Button'
import Icon from '../common/Icon'
import ProfileMenu from './ProfileMenu'

type TopBarProps = {
  onSignOut: () => void
}

function TopBar({ onSignOut }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__mobile-brand">
        <Icon className="top-bar__brand-icon" filled name="neurology" size="lg" />
        <span>MintAI</span>
      </div>

      <div className="top-bar__title">
        <h2>Dashboard</h2>
      </div>

      <div className="top-bar__actions">
        <label className="search-field" aria-label="Search">
          <Icon name="search" size="sm" />
          <input type="search" placeholder="Search" />
        </label>

        <Button aria-label="Notifications" variant="icon">
          <Icon name="notifications" size="sm" />
        </Button>
        <Button aria-label="Settings" variant="icon">
          <Icon name="settings" size="sm" />
        </Button>
        <Button className="top-bar__pro" size="small" variant="chip">
          Go Pro
        </Button>
        <ProfileMenu onSignOut={onSignOut} />
        <Button aria-label="Sign out" onClick={onSignOut} title="Sign out" variant="icon">
          <Icon name="logout" size="sm" />
        </Button>
      </div>
    </header>
  )
}

export default TopBar
