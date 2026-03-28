import {
  Zap,
  Clock,
  CalendarCheck,
  FlaskConical,
  FileEdit,
  Filter,
  Blocks,
  Workflow,
  LayoutTemplate,
  Megaphone,
  Users,
  BarChart3,
  Shuffle,
  RefreshCw,
  Route,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Clock,
  CalendarCheck,
  FlaskConical,
  FileEdit,
  Filter,
  Blocks,
  Workflow,
  LayoutTemplate,
  Megaphone,
  Users,
  BarChart3,
  Shuffle,
  RefreshCw,
  Route,
};

/**
 * Resolves an icon name string to a Lucide React icon component.
 * Returns HelpCircle as fallback if icon name is not found.
 */
export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] || HelpCircle;
}

