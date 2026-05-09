import Button from '../common/Button'
import Icon from '../common/Icon'
import { primaryNavigation } from './dashboardData'
import type { DashboardView } from './dashboardData'

type MobileNavProps = {
  activeView: DashboardView
  onNavigate: (view: DashboardView) => void
}

function MobileNav({ activeView, onNavigate }: MobileNavProps) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {primaryNavigation.map((item) => (
        <Button
          active={item.view === activeView}
          aria-label={item.label}
          key={item.label}
          onClick={item.view ? () => onNavigate(item.view!) : undefined}
          variant="icon"
        >
          <Icon name={item.icon} size="sm" />
        </Button>
      ))}
    </nav>
  )
}

export default MobileNav
