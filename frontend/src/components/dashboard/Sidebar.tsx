import Button from '../common/Button'
import Icon from '../common/Icon'
import { primaryNavigation, utilityNavigation } from './dashboardData'
import type { DashboardView } from './dashboardData'

type SidebarProps = {
  activeView: DashboardView
  onNavigate: (view: DashboardView) => void
  onSignOut: () => void
}

function Sidebar({ activeView, onNavigate, onSignOut }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="MintAI sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">
          <Icon filled name="neurology" size="lg" />
        </div>
        <h1>MintAI</h1>
        <p>Currency Intelligence</p>
      </div>

      <nav className="sidebar__nav" aria-label="Primary navigation">
        {primaryNavigation.map((item) => (
          <Button
            active={item.view === activeView}
            aria-current={item.view === activeView ? 'page' : undefined}
            key={item.label}
            onClick={item.view ? () => onNavigate(item.view!) : undefined}
            variant="nav"
          >
            <Icon name={item.icon} size="sm" />
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <Button fullWidth variant="outline">
          Upgrade Model
        </Button>

        <nav className="sidebar__nav" aria-label="Utility navigation">
          {utilityNavigation.map((item) => {
            const isSignOut = item.label === 'Sign Out'

            return (
              <Button
                key={item.label}
                onClick={isSignOut ? onSignOut : undefined}
                variant="nav"
              >
                <Icon name={item.icon} size="sm" />
                <span>{item.label}</span>
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
