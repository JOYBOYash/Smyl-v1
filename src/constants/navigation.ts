export interface NavItem {
  label: string;
  description: string;
  href: string;
  iconName?: string;
}

export const TOOLS_ITEMS: NavItem[] = [
  {
    label: "Link Shortener",
    description: "Shorten URLs and track clicks",
    href: "/tools/link-shortener",
    iconName: "Link2"
  },
  {
    label: "QR Code Generator",
    description: "High quality custom vectors",
    href: "/tools/qr-generator",
    iconName: "QrCode"
  },
  {
    label: "Link Preview",
    description: "Generate dynamic card previews",
    href: "/tools/social-previewer",
    iconName: "Eye"
  },
  {
    label: "Open Graph Debugger",
    description: "Validate web tag headers",
    href: "/tools/og-debugger",
    iconName: "Bug"
  },
  {
    label: "UTM Builder",
    description: "Generate custom UTM URLs",
    href: "/tools/utm-builder",
    iconName: "FileSpreadsheet"
  },
  {
    label: "Link Hub",
    description: "Personalized analytics profile",
    href: "/tools/link-hub",
    iconName: "Compass"
  },
  {
    label: "Screenshot Generator",
    description: "Capture URL views instantly",
    href: "/tools/screenshot-generator",
    iconName: "Camera"
  }
];

export const SOLUTIONS_ITEMS: NavItem[] = [
  {
    label: "Creators",
    description: "Turn original content into assets",
    href: "/for/creators",
    iconName: "User"
  },
  {
    label: "Founders",
    description: "Build your personal brand fast",
    href: "/for/founders",
    iconName: "Sparkles"
  },
  {
    label: "Marketers",
    description: "Shorten, track, and convert",
    href: "/for/marketers",
    iconName: "TrendingUp"
  },
  {
    label: "Teams",
    description: "Collaborative assets & styling",
    href: "/for/teams",
    iconName: "Users"
  }
];

export const RESOURCES_ITEMS: NavItem[] = [
  {
    label: "How It Works",
    description: "See the step-by-step process",
    href: "/how-it-works",
    iconName: "HelpCircle"
  },
  {
    label: "Examples",
    description: "Explore premium templates",
    href: "/examples",
    iconName: "BookOpen"
  },
  {
    label: "Help",
    description: "Answers to common questions",
    href: "/help",
    iconName: "HelpCircle"
  },
  {
    label: "Blog",
    description: "Guides, tutorials & updates",
    href: "/blog",
    iconName: "Rss"
  }
];
