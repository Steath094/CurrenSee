export type DashboardView = 'history' | 'scan'

export type NavigationItem = {
  active?: boolean
  icon: string
  label: string
  view?: DashboardView
}

export const primaryNavigation: NavigationItem[] = [
  { icon: 'monetization_on', label: 'Detect', view: 'scan' },
  { icon: 'history', label: 'History', view: 'history' },
  // Future feature - temporarily hidden until valuation APIs are wired.
  // { icon: 'query_stats', label: 'Valuation' },
  // Future feature - temporarily hidden until analytics/insights APIs are wired.
  // { icon: 'auto_awesome', label: 'Insights' },
]

export const utilityNavigation: NavigationItem[] = [
  // Future feature - temporarily hidden until help/support content is wired.
  // { icon: 'help_outline', label: 'Help' },
  { icon: 'logout', label: 'Sign Out' },
]
