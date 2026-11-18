import type { Lang } from './types'

/** Lowercase, strip accents, turn punctuation into spaces. Keeps + and # (c++, c#). */
export function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, ' ')
    .trim()
}

/** Alphanumerics only, used to compare technology names ("Next.js" == "next js" == "nextjs"). */
export function compact(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9+#]/g, '')
}

export function tokenize(s: string): string[] {
  const n = norm(s)
  return n ? n.split(' ') : []
}

const EN_STOP = `a an the is are was were be been am do does did of to in on at for with and or but if as by from
about into this that these those it its he his him she her they them you your i me my we our us can could would
should will shall may might please tell show give what whats which who whom whose when where why how any some there
here also just so than then too very more most much many other such only own same not no nor yes get got let lets
list like want need know has have had having ever done`.split(/\s+/)

const ID_STOP = `yang dan di ke dari untuk pada dengan atau itu ini apa siapa bagaimana berapa kapan dimana mana
adalah ialah saya aku kamu anda dia beliau mereka kami kita bisa dapat akan sudah telah sedang ada tidak bukan juga
saja aja lah kah nya tolong mohon boleh punya sebuah suatu para oleh serta agar supaya karena jika kalau lalu kemudian
sih dong kok ya dong sebutkan sebut lihat tampilkan kasih beri pernah`.split(/\s+/)

export const STOPWORDS = new Set<string>([...EN_STOP, ...ID_STOP])

/** Indonesian query words mapped to the English words the content is written in. */
const ID_TO_EN: Record<string, string> = {
  proyek: 'project',
  projek: 'project',
  aplikasi: 'application',
  pengalaman: 'experience',
  pekerjaan: 'work',
  kerja: 'work',
  bekerja: 'work',
  perusahaan: 'company',
  jabatan: 'role',
  posisi: 'role',
  pendidikan: 'education',
  kuliah: 'university',
  kampus: 'university',
  universitas: 'university',
  sekolah: 'education',
  sertifikat: 'certification',
  sertifikasi: 'certification',
  sertif: 'certification',
  keahlian: 'skill',
  kemampuan: 'skill',
  teknologi: 'technology',
  kontak: 'contact',
  hubungi: 'contact',
  lokasi: 'location',
  magang: 'internship',
  tentang: 'about',
  pemrograman: 'programming',
  bahasa: 'language',
  membuat: 'build',
  buat: 'build',
  bikin: 'build',
  dibuat: 'built',
  hutan: 'forest',
  kebakaran: 'fire',
  kehadiran: 'attendance',
  pegawai: 'employee',
  survei: 'survey',
  statistik: 'statistic',
  pengunjung: 'guest',
  keuangan: 'finance',
  antrian: 'queue',
  satelit: 'satellite',
  kecerdasan: 'intelligence',
  buatan: 'artificial',
  mobile: 'mobile',
  seluler: 'mobile',
}

const IRREGULAR: Record<string, string> = { built: 'build', made: 'make', wrote: 'write', has: 'have' }

export function stem(w: string): string {
  if (IRREGULAR[w]) return IRREGULAR[w]
  if (w.length <= 3) return w
  if (w.endsWith('nya') && w.length > 5) return w.slice(0, -3)
  if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3)
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2)
  if (/(x|z|ch|sh|ss)es$/.test(w) && w.length > 4) return w.slice(0, -2)
  if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) return w.slice(0, -1)
  return w
}

/** Terms used for retrieval: stopwords removed, Indonesian mapped to English, stemmed. */
export function terms(s: string): string[] {
  return tokenize(s)
    .filter((t) => !STOPWORDS.has(t))
    .map((t) => stem(ID_TO_EN[t] ?? t))
}

/** Edit distance with an early exit once it exceeds `max`. Returns max + 1 when too far. */
export function editDistance(a: string, b: string, max: number): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      cur.push(v)
      if (v < rowMin) rowMin = v
    }
    if (rowMin > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

const ID_MARKERS = new Set(
  `apa siapa yang dan di ke dari untuk bisa saya kamu anda dia beliau tolong berapa bagaimana kenapa mengapa apakah
  sertifikat sertifikasi proyek pengalaman pendidikan keahlian kemampuan hubungi kontak kerja bekerja dimana kapan
  terbaru punya ada tentang boleh dong sih nya halo hai terima kasih makasih selamat pagi siang sore malam sekarang
  kuliah lulusan magang aplikasi pakai menggunakan dibuat buatan tinggal mana lagi sebutkan jelaskan ceritakan
  tampilkan lihat teknologi`.split(/\s+/)
)
const EN_MARKERS = new Set(
  `what who which how where when why does do did is are can his her he she you your the and with for about
  project projects experience education skills contact certification certificates latest tell show hello hi
  thanks thank work works worked built made`.split(/\s+/)
)

export function detectLang(query: string, fallback: Lang = 'en'): Lang {
  const toks = tokenize(query)
  let id = 0
  let en = 0
  for (const t of toks) {
    if (ID_MARKERS.has(t)) id++
    if (EN_MARKERS.has(t)) en++
  }
  if (id === 0 && en === 0) return fallback
  return id > en ? 'id' : en > id ? 'en' : fallback
}

export function truncate(s: string, max: number): string {
  const clean = s.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\-\s]+$/, '')}...`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-11" -> "Nov 2026". */
export function formatYearMonth(ym: string): string {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  const month = Number(m)
  return month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ${y}` : y
}
