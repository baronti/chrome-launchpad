import * as simpleIcons from 'simple-icons';

// Extract domain from URL
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.toLowerCase();
  }
};

// Get favicon URL using Google's service
export const getFaviconUrl = (domain: string): string => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

// Domain to brand icon mapping
const domainMapping: Record<string, string> = {
  'x.ai': 'grok',
  'grok.ai': 'grok',
  'github.com': 'github',
  'google.com': 'google',
  'gmail.com': 'gmail',
  'youtube.com': 'youtube',
  'facebook.com': 'facebook',
  'twitter.com': 'x',
  'x.com': 'x',
  'instagram.com': 'instagram',
  'linkedin.com': 'linkedin',
  'microsoft.com': 'microsoft',
  'apple.com': 'apple',
  'spotify.com': 'spotify',
  'netflix.com': 'netflix',
  'amazon.com': 'amazon',
  'reddit.com': 'reddit',
  'stackoverflow.com': 'stackoverflow',
  'discord.com': 'discord',
  'slack.com': 'slack',
  'figma.com': 'figma',
  'notion.so': 'notion',
  'trello.com': 'trello',
  'zoom.us': 'zoom',
  'whatsapp.com': 'whatsapp',
  'telegram.org': 'telegram',
  'dropbox.com': 'dropbox',
  'drive.google.com': 'googledrive'
};

// Application name to brand icon mapping
const appMapping: Record<string, string> = {
  'chrome': 'googlechrome',
  'firefox': 'firefox',
  'edge': 'microsoftedge',
  'safari': 'safari',
  'vscode': 'visualstudiocode',
  'visual studio code': 'visualstudiocode',
  'photoshop': 'adobephotoshop',
  'illustrator': 'adobeillustrator',
  'premiere': 'adobepremierepro',
  'after effects': 'adobeaftereffects',
  'discord': 'discord',
  'spotify': 'spotify',
  'steam': 'steam',
  'obs': 'obsstudio',
  'blender': 'blender',
  'unity': 'unity',
  'unreal': 'unrealengine',
  'docker': 'docker',
  'nodejs': 'nodedotjs',
  'npm': 'npm',
  'git': 'git',
  'postman': 'postman'
};

// Get brand icon from Simple Icons
export const getBrandIcon = (identifier: string): string | null => {
  const iconKey = domainMapping[identifier] || appMapping[identifier.toLowerCase()];
  
  if (iconKey && simpleIcons[iconKey as keyof typeof simpleIcons]) {
    const icon = simpleIcons[iconKey as keyof typeof simpleIcons] as any;
    return `data:image/svg+xml;base64,${btoa(icon.svg)}`;
  }
  
  return null;
};

// Main function to get automatic icon
export const getAutomaticIcon = (url: string, type: 'websites' | 'applications' | 'folders'): string => {
  if (type === 'websites') {
    const domain = extractDomain(url);
    const brandIcon = getBrandIcon(domain);
    
    if (brandIcon) {
      return brandIcon;
    }
    
    return getFaviconUrl(domain);
  }
  
  if (type === 'applications') {
    const brandIcon = getBrandIcon(url);
    
    if (brandIcon) {
      return brandIcon;
    }
  }
  
  // Return empty string for fallback to Lucide icons
  return '';
};