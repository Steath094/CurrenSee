import Icon from '../common/Icon'
import ProfileMenu from './ProfileMenu'

function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar__mobile-brand">
        <Icon className="top-bar__brand-icon" filled name="neurology" size="lg" />
        <span>CurrenSee</span>
      </div>

      <div className="top-bar__title">
        <h2>Dashboard</h2>
      </div>

      <div className="top-bar__actions">
        {/* Future feature - temporarily hidden until global search is wired. */}
        {/* <label className="search-field" aria-label="Search">
          <Icon name="search" size="sm" />
          <input type="search" placeholder="Search" />
        </label> */}

        {/* Future feature - temporarily hidden until notifications are wired. */}
        {/* <Button aria-label="Notifications" variant="icon">
          <Icon name="notifications" size="sm" />
        </Button> */}
        {/* Future feature - temporarily hidden until settings are wired. */}
        {/* <Button aria-label="Settings" variant="icon">
          <Icon name="settings" size="sm" />
        </Button> */}
        {/* Future feature - temporarily hidden until premium plans are wired. */}
        {/* <Button className="top-bar__pro" size="small" variant="chip">
          Go Pro
        </Button> */}
        <ProfileMenu />
      </div>
    </header>
  )
}

export default TopBar
