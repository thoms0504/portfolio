import { SIMPLE_ICONS } from './tech-icons'

export type TechCategory = 'language' | 'frontend' | 'backend' | 'database' | 'ai' | 'geo' | 'tools'

export const TECH_CATEGORIES: { key: TechCategory; label: string }[] = [
  { key: 'language', label: 'Languages' },
  { key: 'frontend', label: 'Frontend & UI' },
  { key: 'backend', label: 'Backend' },
  { key: 'database', label: 'Database' },
  { key: 'ai', label: 'AI / ML' },
  { key: 'geo', label: 'Geospatial' },
  { key: 'tools', label: 'DevOps & Tools' },
]

export interface TechDef {
  name: string
  category: TechCategory
  /** Key into SIMPLE_ICONS. When absent a monogram tile is rendered. */
  icon?: string
  /** Brand colour (hex without #). Falls back to the icon's own colour. */
  color?: string
  /** Text shown in the monogram tile when there is no logo. */
  mono?: string
}

interface Entry extends Omit<TechDef, 'name'> {
  aliases?: string[]
}

// Brands that simple-icons does not ship (or no longer ships) use a monogram tile
// with the brand colour instead of a hand-drawn imitation of their logo.
const REGISTRY: Record<string, Entry> = {
  // Languages
  Python: { category: 'language', icon: 'python' },
  TypeScript: { category: 'language', icon: 'typescript' },
  JavaScript: { category: 'language', icon: 'javascript' },
  PHP: { category: 'language', icon: 'php' },
  R: { category: 'language', icon: 'r' },
  SQL: { category: 'language', mono: 'SQL', color: 'F29111' },
  HTML: { category: 'language', icon: 'html' },
  CSS: { category: 'language', icon: 'css' },

  // Frontend
  React: { category: 'frontend', icon: 'react' },
  'Next.js': { category: 'frontend', icon: 'nextjs' },
  'Vue.js': { category: 'frontend', icon: 'vue', aliases: ['Vue'] },
  'Inertia.js': { category: 'frontend', icon: 'inertia' },
  'Tailwind CSS': { category: 'frontend', icon: 'tailwind', aliases: ['Tailwind'] },
  Bootstrap: { category: 'frontend', icon: 'bootstrap' },
  jQuery: { category: 'frontend', icon: 'jquery' },
  'Chart.js': { category: 'frontend', icon: 'chartjs' },
  Plotly: { category: 'frontend', icon: 'plotly' },
  Recharts: { category: 'frontend', mono: 'Rc', color: '22B5BF' },
  ApexCharts: { category: 'frontend', mono: 'Ap', color: '008FFB' },
  'Radix UI': { category: 'frontend', icon: 'radixui', color: 'A1A1AA' },
  Lucide: { category: 'frontend', icon: 'lucide' },
  Vite: { category: 'frontend', icon: 'vite' },
  Sass: { category: 'frontend', icon: 'sass' },

  // Backend
  FastAPI: { category: 'backend', icon: 'fastapi' },
  Flask: { category: 'backend', icon: 'flask' },
  Django: { category: 'backend', icon: 'django' },
  Laravel: { category: 'backend', icon: 'laravel' },
  CodeIgniter: { category: 'backend', icon: 'codeigniter' },
  Streamlit: { category: 'backend', icon: 'streamlit' },
  'Socket.IO': { category: 'backend', icon: 'socketio' },
  'NextAuth.js': { category: 'backend', mono: 'Na', color: 'A78BFA' },
  Prisma: { category: 'backend', icon: 'prisma' },
  'Node.js': { category: 'backend', icon: 'nodejs' },
  'Express.js': { category: 'backend', icon: 'express', aliases: ['Express'] },
  'Google Apps Script': { category: 'backend', icon: 'appsscript' },

  // Database
  PostgreSQL: { category: 'database', icon: 'postgresql' },
  MySQL: { category: 'database', icon: 'mysql' },
  SQLite: { category: 'database', icon: 'sqlite' },
  Supabase: { category: 'database', icon: 'supabase' },
  MongoDB: { category: 'database', icon: 'mongodb' },
  Redis: { category: 'database', icon: 'redis' },
  'Google Sheets': { category: 'database', icon: 'sheets' },
  ChromaDB: { category: 'database', mono: 'Cr', color: 'FF6446' },
  Pinecone: { category: 'database', mono: 'Pc', color: '1FB6A4' },

  // AI / ML
  TensorFlow: { category: 'ai', icon: 'tensorflow' },
  'scikit-learn': { category: 'ai', icon: 'sklearn' },
  Pandas: { category: 'ai', icon: 'pandas', color: '8B7CF6' },
  NumPy: { category: 'ai', icon: 'numpy', color: '4DABCF' },
  LangChain: { category: 'ai', icon: 'langchain' },
  'Gemini API': { category: 'ai', icon: 'gemini', aliases: ['Gemini'] },
  'Grok API': { category: 'ai', mono: 'xAI', color: '9AA1AC', aliases: ['xAI Grok API', 'Grok'] },
  'Hugging Face': { category: 'ai', icon: 'huggingface', aliases: ['HuggingFace'] },
  'sentence-transformers': { category: 'ai', mono: 'ST', color: '5B8DEF' },
  IndoBERT: { category: 'ai', icon: 'huggingface' },
  Keras: { category: 'ai', icon: 'keras' },
  Jupyter: { category: 'ai', icon: 'jupyter' },
  PyTorch: { category: 'ai', icon: 'pytorch' },
  OpenCV: { category: 'ai', icon: 'opencv' },
  Folium: { category: 'geo', icon: 'folium' },
  GeoPandas: { category: 'geo', icon: 'geopandas' },
  'Google Earth Engine': { category: 'geo', icon: 'earthengine' },
  QGIS: { category: 'geo', icon: 'qgis' },
  ArcGIS: { category: 'geo', icon: 'arcgis' },
  Leaflet: { category: 'geo', icon: 'leaflet' },
  Rasterio: { category: 'geo', mono: 'Rs', color: '3F7D3B' },
  GDAL: { category: 'geo', mono: 'GD', color: '5CAE58' },
  PostGIS: { category: 'database', icon: 'postgresql', color: '336791' },
  Firebase: { category: 'database', icon: 'firebase' },
  Matplotlib: { category: 'ai', mono: 'Mp', color: '11557C' },
  PyMuPDF: { category: 'ai', mono: 'Py', color: 'E5484D' },
  openpyxl: { category: 'tools', mono: 'xl', color: '1D9B5E' },

  // DevOps & tools
  Docker: { category: 'tools', icon: 'docker' },
  Git: { category: 'tools', icon: 'git' },
  GitHub: { category: 'tools', icon: 'github' },
  Vercel: { category: 'tools', icon: 'vercel' },
  Nginx: { category: 'tools', icon: 'nginx' },
  Linux: { category: 'tools', icon: 'linux' },
  Figma: { category: 'tools', icon: 'figma' },
  XAMPP: { category: 'tools', icon: 'xampp' },
  Selenium: { category: 'tools', icon: 'selenium' },
  'Google Cloud': { category: 'tools', icon: 'gcp', aliases: ['GCP'] },
  Postman: { category: 'tools', icon: 'postman' },
  'VS Code': { category: 'tools', mono: 'VS', color: '007ACC' },
  TCPDF: { category: 'tools', mono: 'PDF', color: 'E5484D' },
  xhtml2pdf: { category: 'tools', mono: 'PDF', color: 'F59E0B' },
  'Web Speech API': { category: 'tools', mono: 'TTS', color: '34A853' },
  'Google Maps': { category: 'tools', icon: 'googlemaps' },
}

const LOOKUP = new Map<string, TechDef>()
for (const [name, entry] of Object.entries(REGISTRY)) {
  const def: TechDef = { name, ...entry }
  LOOKUP.set(name.toLowerCase(), def)
  for (const alias of entry.aliases ?? []) LOOKUP.set(alias.toLowerCase(), def)
}

/** Resolve a stack entry from MDX frontmatter to its registry definition. */
export function getTech(name: string): TechDef {
  return (
    LOOKUP.get(name.trim().toLowerCase()) ?? {
      name,
      category: 'tools',
      mono: name.slice(0, 2),
      color: '9AA1AC',
    }
  )
}

export interface TechVisual {
  def: TechDef
  /** Brand colour as #rrggbb. */
  color: string
  /** SVG path (24x24 viewBox) when a real logo exists. */
  path?: string
  /** True when the brand colour is too dark to read on a dark surface. */
  isDark: boolean
  /** True when the brand colour is too light for white text/logo. */
  isLight: boolean
}

function luminance(hex: string): number {
  const n = parseInt(hex, 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getTechVisual(name: string): TechVisual {
  const def = getTech(name)
  const icon = def.icon ? SIMPLE_ICONS[def.icon] : undefined
  const hex = (def.color ?? icon?.hex ?? '9AA1AC').replace('#', '')
  const lum = luminance(hex)
  return {
    def,
    color: `#${hex}`,
    path: icon?.path,
    isDark: lum < 0.06,
    isLight: lum > 0.55,
  }
}
