export type DashboardView = 'history' | 'scan'

export type NavigationItem = {
  active?: boolean
  icon: string
  label: string
  view?: DashboardView
}

export const primaryNavigation: NavigationItem[] = [
  { icon: 'monetization_on', label: 'Scan', view: 'scan' },
  { icon: 'history', label: 'History', view: 'history' },
  { icon: 'query_stats', label: 'Valuation' },
  { icon: 'auto_awesome', label: 'Insights' },
]

export const utilityNavigation: NavigationItem[] = [
  { icon: 'help_outline', label: 'Help' },
  { icon: 'logout', label: 'Sign Out' },
]
