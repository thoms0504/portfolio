import type { ChatContext, ChatLink, ChatReply, Kb, KbDoc, KbProject, Lang } from './types'
import {
  STOPWORDS,
  compact,
  detectLang,
  editDistance,
  formatYearMonth,
  norm,
  stem,
  terms,
  tokenize,
  truncate,
} from './text'

const tr = (lang: Lang, en: string, id: string) => (lang === 'id' ? id : en)
const pick = (lang: Lang, en?: string, id?: string) => (lang === 'id' ? id ?? en ?? '' : en ?? id ?? '')
const pickList = (lang: Lang, en?: string[], id?: string[]) => (lang === 'id' && id?.length ? id : en ?? [])

/* ------------------------------------------------------------------ */
/* Intent patterns (run on the normalised query, English + Indonesian) */
/* ------------------------------------------------------------------ */

const RE = {
  greet:
    /^(hi|hello|hey|halo|hai|hallo|hola|yo|assalamualaikum|salam|selamat (pagi|siang|sore|malam)|good (morning|afternoon|evening)|permisi|ping)( there| bot| thomson| kak| bro| min)?$/,
  howAreYou: /\b(how are you|how r u|apa kabar|gimana kabar|hows it going|how s it going)\b/,
  thanks: /\b(thanks?|thank you|thx|terima kasih|makasih|trims|tq|mantap|keren|nice|good job|great|oke|ok|okay)\b/,
  bye: /\b(bye|goodbye|see you|sampai jumpa|dadah|selamat tinggal)\b/,
  help: /\b(help|bantuan|menu|what can you (do|answer)|what (can|could) i ask|can i ask|bisa apa|apa saja yang bisa|bisa tanya apa|how (do|does) (this|you) work|cara pakai|capabilit\w*)\b/,
  botIdentity:
    /\b(who are you|siapa kamu|siapa anda|are you (a |an )?(bot|ai|robot|human|real|chatgpt|gpt|claude|gemini)|kamu (itu )?(bot|ai|robot|manusia)|apakah kamu (bot|ai|robot|manusia)|what are you|your name|nama kamu|namamu|who (made|built|created) you|siapa yang (membuat|buat|bikin) kamu)\b/,
  botTech:
    /\b(how (does|do) (this|the) (chat ?bot|assistant|bot) work|how (is|was) (this|the) (chat ?bot|assistant) (built|made)|chat ?bot (ini )?(pakai|menggunakan|memakai)|do you use (an )?(api|llm|gpt|ai)|pakai api|which (model|llm)|model apa)\b/,
  contact:
    /\b(contact|e ?mail|email address|alamat email|reach|\w*hubung\w*|\w*kontak\w*|mengontak\w*|whatsapp|wa|linkedin|github|instagram|ig|orcid|get in touch|social media|medsos|phone|telepon|telp|nomor (hp|telepon|telp|wa)|no hp|dm|message him)\b/,
  sensitive:
    /\b(age|how old|umur|usia|birthday|birth|lahir|salary|gaji|income|penghasilan|home address|alamat rumah|address|married|menikah|istri|wife|girlfriend|pacar|family|keluarga|religion|agama|ktp|nik|password)\b/,
  notCovered: /\b(speak|spoken|fluent|toefl|ielts|hobby|hobbies|hobi|favou?rite|marital|nationality|kewarganegaraan)\b/,
  offTopic:
    /\b(weather|cuaca|news|berita|stock|saham|bitcoin|crypto|kripto|football|sepak bola|soccer|movie|film|recipe|resep|horoscope|zodiak|politic|politik|president|presiden|election|pemilu|joke|lelucon|lawakan|song|lagu|lyrics|poem|puisi|essay|esai|homework|capital of|ibu kota|translate|terjemahkan|exchange rate|kurs|price of|harga|covid|anime|gaming)\b/,
  generic:
    /^(what is|what s|what are|what does|define|explain|jelaskan|apa itu|apa yang dimaksud|apa arti|arti|how (to|do i|can i|does|do)|bagaimana (cara|membuat)|cara (membuat|menggunakan|install|instal|belajar)|write|tulis|buatkan|generate|create (a|an|me)|solve|selesaikan|hitung|calculate|compare|bandingkan|difference between|perbedaan|why is|why does|kenapa|mengapa|when was|who (is|was|invented|founded|discovered|wrote)|siapa (itu|presiden|penemu)|recommend|rekomendasikan|best way|tips)\b/,
  ownerRef:
    /\b(thomson|sibuea|he|his|him|you|your|yours|kamu|anda|dia|beliau|portfolio|portofolio|website|site|situs|resume|cv|project|projects|proyek|certificate|certificates|certification|certifications|sertifikat|experience|pengalaman|skill|skills|this|ini|contact|hire|\w*hubung\w*|\w*kontak\w*|mengontak\w*|email|whatsapp|linkedin|github|instagram|reach)\b/,
  summary:
    /\b(who is|siapa thomson|about (him|thomson|you|yourself)|tell me about (him|thomson|yourself)|introduce|perkenalkan|ceritakan tentang|profile|profil|summary|ringkasan|bio|background|latar belakang|tentang thomson|tentang dia)\b/,
  location: /\b(where (does|is|do) (he|thomson|you) (live|based|located|from)|where (are|is) (you|he) based|location|lokasi|tinggal (di ?mana|dimana)|domisili|berasal|asal|based in|city|kota)\b/,
  availability:
    /\b(hire|hiring|available|availability|freelance|open to|collaborat\w*|kolaborasi|kerja sama|terbuka|lowongan|work with (him|you|thomson)|rekrut|sewa|tersedia|job offer|full ?time)\b/,
  currentJob:
    /\b(current(ly)?|now|present|sekarang|saat ini|kini|today)\b.*\b(job|work|works|role|position|employer|company|kerja|bekerja|jabatan|posisi|perusahaan)\b|\b(where (does|do) (he|you|thomson) work|kerja (di ?mana|dimana)|bekerja (di ?mana|dimana)|jabatan (nya|sekarang)|current (job|role|position)|what (do|does) (you|he|thomson) do|kerja apa|his job|profesi|pekerjaan(nya| dia)?\s*(apa)?$)\b/,
  experience:
    /\b(experience|pengalaman|work history|career|karir|karier|riwayat (kerja|pekerjaan)|jobs?|employment|employer|internship|magang|worked|bekerja|pekerjaan|work)\b/,
  education:
    /\b(education|study|studied|degree|university|college|pendidikan|kuliah|kampus|sekolah|lulus\w*|graduat\w*|gpa|ipk|thesis|skripsi|stis|its|major|jurusan|bachelor|sarjana|alma mater)\b/,
  certification:
    /\b(certif\w*|sertif\w*|credential\w*|licen[sc]e\w*|course|courses|kursus|badge|diploma|training|pelatihan)\b/,
  skills:
    /\b(skill|skills|tech stack|technolog\w*|keahlian|kemampuan|stack|tools?|languages?|bahasa pemrograman|programming|frameworks?|databases?|expertise|good at|menguasai|dikuasai|familiar|proficient|bisa coding|competenc\w*)\b/,
  techVerb:
    /\b(does|do|did|can|could|is|are|has|have|apakah|bisa|pernah|punya|menguasai)\b.*\b(know|use|uses|used|using|work with|worked with|experience (with|in)|familiar|proficient|code|program|pakai|memakai|menggunakan|paham|mengerti|bisa)\b/,
  projects:
    /\b(project|projects|proyek|projek|portfolio|portofolio|apps?|aplikasi|dashboard|karya|built|build|made|created|developed|dibuat|membuat|bikin|showcase|demo|repo|repos|repository|repositories)\b/,
  latest: /\b(latest|newest|recent|recently|terbaru\w*|terakhir\w*|paling baru|baru baru ini|last)\b/,
  featured: /\b(featured|best|top|favou?rite|highlight\w*|unggulan|terbaik|andalan|main|utama|notable|proud|impressive)\b/,
  count: /\b(how many|berapa|jumlah|count|total|number of)\b/,
  resume: /\b(resume|cv|curriculum vitae|download|unduh|print|cetak)\b/,
  articles: /\b(article|articles|blog|opinion|opinions|writing|writings|artikel|opini|tulisan|post|posts)\b/,
  site: /\b((this|the) (website|site|portfolio|web)|(situs|web|website) ini|portfolio ini|portofolio ini)\b/,
  followProject:
    /\b(it|its|that|this one|that one|itu|tersebut|nya|more|detail|details|lebih lanjut|lanjut|stack|demo|live|repo|source|code|kode|link|url|github|when|kapan|status|screenshots?|documentation|dokumentasi|features?|fitur)\b/,
}

const ORDINALS: Record<string, number> = {
  first: 0, '1st': 0, pertama: 0,
  second: 1, '2nd': 1, kedua: 1,
  third: 2, '3rd': 2, ketiga: 2,
  fourth: 3, '4th': 3, keempat: 3,
  fifth: 4, '5th': 4, kelima: 4,
}

const CATEGORY_RULES: { category: string; re: RegExp; words: string[] }[] = [
  { category: 'Web', re: /\b(web|website|websites|web app|web apps)\b/, words: ['web', 'website'] },
  { category: 'Backend', re: /\bbackend\b/, words: ['backend'] },
  {
    category: 'Data/AI',
    re: /\b(ai|ml|machine learning|deep learning|data science|data ai|geoai|artificial intelligence)\b/,
    words: ['ai', 'ml', 'machine', 'learn', 'deep', 'data', 'science', 'geoai', 'artificial', 'intelligence'],
  },
  { category: 'Automation', re: /\b(automation|otomasi)\b/, words: ['automation', 'otomasi'] },
]

/** Words that say "projects" but carry no topic of their own. */
const PROJECT_FILLER = new Set(
  ['project', 'build', 'application', 'work', 'portfolio', 'portofolio', 'app', 'show', 'latest', 'recent', 'newest',
    'make', 'create', 'develop', 'feature', 'best', 'top', 'main', 'demo', 'repo', 'repository', 'github', 'code',
    'terbaru', 'terakhir', 'proyek', 'projek', 'all', 'semua', 'other', 'another', 'lain', 'lainnya', 'use', 'using',
    'total', 'number', 'count', 'jumlah', 'thomson', 'sibuea', 'built', 'made', 'created'].map((w) => stem(w))
)

const RETRIEVAL_NOISE = new Set(
  ['experience', 'work', 'skill', 'project', 'portfolio', 'portofolio', 'thomson', 'sibuea', 'application', 'build', 'make', 'use', 'using', 'knowledge', 'ability', 'expert', 'good', 'tell', 'more', 'about'].map((w) => stem(w))
)

/** English names for words in Indonesian institution names, so "ministry of industry" finds Kementerian Perindustrian. */
const INSTITUTION_EN: Record<string, string> = {
  kementerian: 'ministry',
  perindustrian: 'industry',
  republik: 'republic',
  badan: 'agency',
  pusat: 'central',
  statistik: 'statistic',
  politeknik: 'polytechnic',
}

const GENERIC_NAME_WORDS = new Set(
  `dashboard system sistem tracker tracking personal app apps project survey activity early detection edition script
   pro evidence extraction portfolio mobile bps`.split(/\s+/)
)

const TECH_ALIASES: Record<string, string> = {
  js: 'JavaScript', ts: 'TypeScript', node: 'Node.js', nodejs: 'Node.js', postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL', sklearn: 'scikit-learn', scikit: 'scikit-learn', gee: 'Google Earth Engine',
  earthengine: 'Google Earth Engine', tf: 'TensorFlow', vue: 'Vue.js', vuejs: 'Vue.js', tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS', appsscript: 'Google Apps Script', reactjs: 'React', ci4: 'CodeIgniter',
  codeigniter4: 'CodeIgniter', gsheets: 'Google Sheets', sheets: 'Google Sheets', gemini: 'Gemini API',
  grok: 'Grok API', rn: 'React Native', socketio: 'Socket.IO', nextjs: 'Next.js', pytorch: 'PyTorch',
}

const ISSUER_ALIASES: Record<string, string> = { claude: 'anthropic', fcc: 'freecodecamp', free: '' }

/* ------------------------------------------------------------------ */
/* Index                                                               */
/* ------------------------------------------------------------------ */

interface NameVariant {
  project: KbProject
  tokens: string[]
}

interface Hit {
  doc: KbDoc
  score: number
  coverage: number
}

function addSuggestions(lang: Lang, ...keys: SuggestionKey[]): string[] {
  return keys.map((k) => SUGGESTIONS[k][lang])
}

type SuggestionKey =
  | 'projects' | 'latest' | 'work' | 'certs' | 'skills' | 'contact' | 'education' | 'about' | 'resume'
  | 'stack' | 'otherProjects' | 'hire' | 'articles' | 'help'

const SUGGESTIONS: Record<SuggestionKey, { en: string; id: string }> = {
  projects: { en: 'What projects has Thomson built?', id: 'Proyek apa saja yang pernah dibuat?' },
  latest: { en: 'What are the latest projects?', id: 'Apa proyek terbarunya?' },
  work: { en: 'Where does he work now?', id: 'Sekarang bekerja di mana?' },
  certs: { en: 'Which certifications does he have?', id: 'Sertifikat apa saja yang dimiliki?' },
  skills: { en: 'What are his main skills?', id: 'Apa saja keahlian utamanya?' },
  contact: { en: 'How can I contact him?', id: 'Bagaimana cara menghubunginya?' },
  education: { en: 'What is his education?', id: 'Apa latar belakang pendidikannya?' },
  about: { en: 'Tell me about Thomson', id: 'Ceritakan tentang Thomson' },
  resume: { en: 'Where can I see his resume?', id: 'Di mana saya bisa lihat CV-nya?' },
  stack: { en: 'What tech stack does it use?', id: 'Pakai teknologi apa?' },
  otherProjects: { en: 'Show other projects', id: 'Tampilkan proyek lainnya' },
  hire: { en: 'Is he open to work?', id: 'Apakah dia terbuka untuk kerja sama?' },
  articles: { en: 'Does he write articles?', id: 'Apakah ada artikel?' },
  help: { en: 'What can I ask you?', id: 'Apa saja yang bisa saya tanyakan?' },
}

export interface Engine {
  reply(query: string, context?: ChatContext): ChatReply
  starters(lang?: Lang): string[]
}

export function createEngine(kb: Kb): Engine {
  const firstName = kb.name.split(' ')[0]

  /* ---------- BM25 over the documents ---------- */
  const docTerms = kb.docs.map((d) => [...terms(d.title), ...terms(d.title), ...terms(d.title), ...terms(d.text)])
  const df = new Map<string, number>()
  for (const ts of docTerms) for (const t of new Set(ts)) df.set(t, (df.get(t) ?? 0) + 1)
  const avgLen = docTerms.reduce((n, ts) => n + ts.length, 0) / Math.max(1, docTerms.length)
  const tfs = docTerms.map((ts) => {
    const m = new Map<string, number>()
    for (const t of ts) m.set(t, (m.get(t) ?? 0) + 1)
    return m
  })
  const vocab = Array.from(df.keys())

  function fixTerm(t: string): string | null {
    if (df.has(t)) return t
    if (t.length < 4) return null
    const max = t.length >= 8 ? 2 : 1
    let best: string | null = null
    let bestD = max + 1
    for (const v of vocab) {
      const d = editDistance(t, v, max)
      if (d < bestD || (d === bestD && best !== null && (df.get(v) ?? 0) > (df.get(best) ?? 0))) {
        best = v
        bestD = d
      }
    }
    return bestD <= max ? best : null
  }

  function search(query: string, kinds?: KbDoc['kind'][]): Hit[] {
    const all = Array.from(new Set(terms(query)))
    // Words that appear everywhere in a portfolio say nothing about the topic.
    const informative = all.filter((t) => !RETRIEVAL_NOISE.has(t))
    const raw = informative.length ? informative : all
    if (raw.length === 0) return []
    const qs = raw.map(fixTerm).filter((t): t is string => t !== null)
    if (qs.length === 0) return []
    const N = kb.docs.length
    const k1 = 1.4
    const b = 0.75
    const hits: Hit[] = []
    kb.docs.forEach((doc, i) => {
      if (kinds && !kinds.includes(doc.kind)) return
      const tf = tfs[i]
      const len = docTerms[i].length
      let score = 0
      let matched = 0
      for (const q of qs) {
        const f = tf.get(q)
        if (!f) continue
        matched++
        const n = df.get(q) ?? 0
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5))
        score += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * len) / avgLen))
      }
      if (score > 0) hits.push({ doc, score, coverage: matched / raw.length })
    })
    return hits.sort((a, b2) => b2.score - a.score)
  }

  /* ---------- entities ---------- */
  const projectBySlug = new Map(kb.projects.map((p) => [p.slug, p]))

  const titleTokenCount = new Map<string, number>()
  for (const p of kb.projects)
    for (const t of new Set(tokenize(p.title))) titleTokenCount.set(t, (titleTokenCount.get(t) ?? 0) + 1)

  const variants: NameVariant[] = []
  for (const p of kb.projects) {
    const seen = new Set<string>()
    const push = (toks: string[]) => {
      const key = toks.join(' ')
      if (!toks.length || seen.has(key)) return
      if (toks.length === 1 && (toks[0] === 'portfolio' || STOPWORDS.has(toks[0]))) return
      seen.add(key)
      variants.push({ project: p, tokens: toks })
    }
    const titleParts = p.title.split(/[():]/).map((s) => tokenize(s)).filter((t) => t.length)
    push(tokenize(p.title))
    push(tokenize(p.title).filter((t) => t.length > 2))
    for (const part of titleParts) push(part.filter((t) => t.length > 2))
    if (p.slug !== 'portfolio') push(tokenize(p.slug.replace(/-/g, ' ')))
    for (const t of tokenize(p.title)) {
      if (t.length >= 3 && !GENERIC_NAME_WORDS.has(t) && titleTokenCount.get(t) === 1 && !/^\d+$/.test(t)) push([t])
    }
    if (p.slug === 'talita-mobile') push(['mobile'])
  }
  const entityWords = new Set<string>()
  for (const v of variants) for (const t of v.tokens) if (t.length >= 5) entityWords.add(t)

  const techByKey = new Map<string, string>()
  for (const t of kb.techs) techByKey.set(compact(t), t)
  for (const [alias, target] of Object.entries(TECH_ALIASES)) {
    const real = techByKey.get(compact(target))
    if (real) techByKey.set(alias, real)
  }
  for (const k of techByKey.keys()) if (k.length >= 5) entityWords.add(k)

  const issuerByKey = new Map<string, string>()
  for (const c of kb.certifications) {
    const first = compact(c.issuer.split(' ')[0])
    issuerByKey.set(first, c.issuer)
  }
  for (const [alias, target] of Object.entries(ISSUER_ALIASES)) {
    const real = target ? issuerByKey.get(target) : undefined
    if (real) issuerByKey.set(alias, real)
  }
  for (const k of issuerByKey.keys()) if (k.length >= 5) entityWords.add(k)

  /** Replace near-misses of a known entity word ("talitaa", "kagle") with the entity word. */
  function correctTokens(tokens: string[]): string[] {
    return tokens.map((t) => {
      if (t.length < 5 || STOPWORDS.has(t) || entityWords.has(t) || df.has(t)) return t
      const max = t.length >= 9 ? 2 : 1
      for (const w of entityWords) if (editDistance(t, w, max) <= max) return w
      return t
    })
  }

  function findProject(tokens: string[]): KbProject | undefined {
    const set = new Set(tokens)
    let best: NameVariant | undefined
    for (const v of variants) {
      if (!v.tokens.every((t) => set.has(t))) continue
      if (!best || v.tokens.length > best.tokens.length) best = v
    }
    return best?.project
  }

  function findTechs(tokens: string[], rawQuery: string): string[] {
    const found: string[] = []
    const used = new Array(tokens.length).fill(false)
    for (let n = 4; n >= 1; n--) {
      for (let i = 0; i + n <= tokens.length; i++) {
        if (used.slice(i, i + n).some(Boolean)) continue
        const key = tokens.slice(i, i + n).join('')
        if (key.length < 2) continue
        if (n === 1 && STOPWORDS.has(tokens[i])) continue
        const tech = techByKey.get(key)
        if (tech && !found.includes(tech)) {
          found.push(tech)
          for (let j = i; j < i + n; j++) used[j] = true
        }
      }
    }
    if (/\b(r programming|r language|bahasa r|language r)\b/i.test(rawQuery)) {
      const r = kb.techs.find((t) => t === 'R')
      if (r && !found.includes(r)) found.push(r)
    }
    return found
  }

  function findIssuers(tokens: string[]): string[] {
    const found: string[] = []
    for (const t of tokens) {
      const issuer = issuerByKey.get(t)
      if (issuer && !found.includes(issuer)) found.push(issuer)
    }
    return found
  }

  /* ---------- reply helpers ---------- */
  const starterKeys: SuggestionKey[] = ['projects', 'work', 'certs', 'skills', 'contact']

  function mk(
    lang: Lang,
    ctx: ChatContext,
    answer: string,
    o: Partial<Pick<ChatReply, 'links' | 'suggestions' | 'inScope'>> & { project?: string; list?: string[] } = {}
  ): ChatReply {
    return {
      answer,
      links: o.links ?? [],
      suggestions: o.suggestions ?? addSuggestions(lang, 'projects', 'certs', 'contact'),
      inScope: o.inScope ?? true,
      // The last project / list stay available for follow-ups until a new one replaces them.
      context: { lang, project: o.project ?? ctx.project, list: o.list ?? ctx.list },
    }
  }

  const periodOf = (p: KbProject) =>
    p.start ? `${formatYearMonth(p.start)} - ${p.end ? formatYearMonth(p.end) : 'present'}` : ''

  const projectLink = (p: KbProject): ChatLink => ({ label: `Open ${p.title}`, href: `/projects#${p.slug}` })

  function projectLinks(p: KbProject): ChatLink[] {
    const links: ChatLink[] = [projectLink(p)]
    if (p.repoUrl) links.push({ label: 'Source code', href: p.repoUrl, external: true })
    if (p.demoUrl) links.push({ label: 'Live demo', href: p.demoUrl, external: true })
    return links
  }

  function projectCard(lang: Lang, ctx: ChatContext, p: KbProject, full = false): ChatReply {
    const meta = [p.category, periodOf(p)].filter(Boolean).join(' · ')
    const paras = pick(lang, p.description, p.descriptionId).split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
    const lines = [`**${p.title}**${meta ? ` (${meta})` : ''}`, pick(lang, p.summary, p.summaryId)]
    if (full) {
      for (const para of paras) lines.push(truncate(para, 700))
    } else if (paras[1]) {
      lines.push(truncate(paras[1], 330))
    }
    if (p.stack.length) lines.push(`- ${tr(lang, 'Tech stack', 'Teknologi')}: ${p.stack.join(', ')}`)
    return mk(lang, ctx, lines.join('\n\n'), {
      links: projectLinks(p),
      project: p.slug,
      suggestions: addSuggestions(lang, 'otherProjects', 'latest', 'contact'),
    })
  }

  function projectList(lang: Lang, ctx: ChatContext, ps: KbProject[], intro: string, cap = 8): ChatReply {
    const shown = ps.slice(0, cap)
    const lines = shown.map((p) => {
      const per = periodOf(p)
      return `- **${p.title}** (${[p.category, per].filter(Boolean).join(', ')}): ${truncate(pick(lang, p.summary, p.summaryId), 110)}`
    })
    if (ps.length > cap)
      lines.push(tr(lang, `...and ${ps.length - cap} more on the Projects page.`, `...dan ${ps.length - cap} lainnya di halaman Projects.`))
    return mk(lang, ctx, `${intro}\n\n${lines.join('\n')}`, {
      links: [
        ...shown.slice(0, 2).map(projectLink),
        { label: tr(lang, 'All projects', 'Semua proyek'), href: '/projects' },
      ],
      list: shown.map((p) => p.slug),
      suggestions: [
        ...(shown[0] ? [tr(lang, `Tell me about ${shown[0].title}`, `Ceritakan tentang ${shown[0].title}`)] : []),
        ...(shown[1] ? [tr(lang, `Tell me about ${shown[1].title}`, `Ceritakan tentang ${shown[1].title}`)] : []),
        ...addSuggestions(lang, 'skills', 'contact'),
      ].slice(0, 3),
    })
  }

  function refuse(lang: Lang, ctx: ChatContext): ChatReply {
    return mk(
      lang,
      ctx,
      tr(
        lang,
        `I can only answer questions about ${kb.name}'s portfolio: his projects, work experience, education, certifications, skills and how to contact him. I can't help with that one, but feel free to ask about any of those.`,
        `Saya hanya bisa menjawab pertanyaan seputar portofolio ${kb.name}: proyek, pengalaman kerja, pendidikan, sertifikat, keahlian, dan cara menghubunginya. Pertanyaan itu di luar cakupan saya, tetapi silakan tanya seputar hal tersebut.`
      ),
      { inScope: false, suggestions: addSuggestions(lang, 'projects', 'work', 'certs', 'contact') }
    )
  }

  /* ---------- domain answers ---------- */
  function answerContact(lang: Lang, ctx: ChatContext, n: string): ChatReply {
    const channels: { key: string; label: string; show: string; href: string; external: boolean; re: RegExp }[] = [
      { key: 'email', label: 'Email', show: kb.email, href: `mailto:${kb.email}`, external: false, re: /\b(e ?mail|alamat email)\b/ },
      { key: 'whatsapp', label: 'WhatsApp', show: tr(lang, 'direct chat', 'chat langsung'), href: kb.links.whatsapp, external: true, re: /\b(whatsapp|wa|phone|telepon|telp|nomor|no hp|hp)\b/ },
      { key: 'linkedin', label: 'LinkedIn', show: kb.links.linkedin, href: kb.links.linkedin, external: true, re: /\blinkedin\b/ },
      { key: 'github', label: 'GitHub', show: kb.links.github, href: kb.links.github, external: true, re: /\bgithub\b/ },
      { key: 'instagram', label: 'Instagram', show: kb.links.instagram, href: kb.links.instagram, external: true, re: /\b(instagram|ig)\b/ },
      { key: 'orcid', label: 'ORCID', show: kb.links.orcid, href: kb.links.orcid, external: true, re: /\borcid\b/ },
    ].filter((c) => c.href)
    const asked = channels.filter((c) => c.re.test(n))
    const list = asked.length ? asked : channels
    const strip = (s: string) => s.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
    const intro = asked.length
      ? tr(lang, `Here is ${firstName}'s ${asked.map((c) => c.label).join(' and ')}:`, `Berikut ${asked.map((c) => c.label).join(' dan ')} milik ${firstName}:`)
      : tr(lang, `You can reach ${firstName} through any of these channels:`, `Anda bisa menghubungi ${firstName} lewat kanal berikut:`)
    const repoNote =
      asked.some((c) => c.key === 'github') && kb.githubRepos
        ? `\n- **${tr(lang, 'Public repositories', 'Repositori publik')}**: ${kb.githubRepos}`
        : ''
    return mk(lang, ctx, `${intro}\n\n${list.map((c) => `- **${c.label}**: ${c.key === 'email' || c.key === 'whatsapp' ? c.show : strip(c.show)}`).join('\n')}${repoNote}`, {
      links: [
        ...list.slice(0, 3).map((c) => ({ label: c.label, href: c.href, external: c.external })),
        { label: tr(lang, 'Contact page', 'Halaman kontak'), href: '/contact' },
      ],
      suggestions: addSuggestions(lang, 'hire', 'projects', 'resume'),
    })
  }

  function answerCurrentJob(lang: Lang, ctx: ChatContext): ChatReply {
    const cur = kb.experience.find((e) => /present/i.test(e.period)) ?? kb.experience[0]
    if (!cur) return refuse(lang, ctx)
    const meta = [cur.type, cur.period, cur.location].filter(Boolean).join(', ')
    const bullets = pickList(lang, cur.highlights, cur.highlightsId).slice(0, 4).map((h) => `- ${h}`)
    return mk(
      lang,
      ctx,
      `${tr(lang, `${firstName} currently works as`, `${firstName} saat ini bekerja sebagai`)} **${cur.role}** ${tr(lang, 'at', 'di')} ${cur.company} (${meta}).` +
        (bullets.length ? `\n\n${tr(lang, 'What he does there:', 'Yang dikerjakan:')}\n${bullets.join('\n')}` : ''),
      { links: [{ label: tr(lang, 'Full experience', 'Semua pengalaman'), href: '/about' }], suggestions: addSuggestions(lang, 'projects', 'education', 'certs') }
    )
  }

  /** Searchable words of a job, including English names for the Indonesian institutions. */
  function experienceTerms(e: (typeof kb.experience)[number]): Set<string> {
    const base = terms([e.company, e.role, e.type, e.location].filter(Boolean).join(' '))
    const extra = terms([e.company].join(' ')).map((t) => INSTITUTION_EN[t]).filter(Boolean)
    return new Set([...base, ...extra])
  }

  /** Returns null when the query names something that no job matches, so retrieval can take over. */
  function answerExperience(lang: Lang, ctx: ChatContext, tokens: string[]): ChatReply | null {
    const filterTerms = terms(tokens.join(' ')).filter(
      (t) => !['experience', 'work', 'job', 'career', 'history', 'karier', 'karir', 'employment', 'employer', 'riwayat', 'worked', 'internship', 'magang', 'role', 'position', 'jabatan', 'posisi', 'thomson', 'sibuea'].map(stem).includes(t)
    )
    let items = kb.experience
    const isIntern = /\b(intern|internship|magang)\b/.test(tokens.join(' '))
    if (isIntern) items = items.filter((e) => /intern/i.test(e.type ?? ''))
    if (filterTerms.length) {
      const m = items.filter((e) => {
        const hay = experienceTerms(e)
        return filterTerms.some((t) => hay.has(t))
      })
      if (!m.length) return null
      items = m
    }
    return experienceReply(lang, ctx, items.length ? items : kb.experience)
  }

  function experienceReply(lang: Lang, ctx: ChatContext, items: typeof kb.experience): ChatReply {
    const lines = items.map(
      (e) => `- **${e.role}** - ${e.company} (${[e.type, e.period].filter(Boolean).join(', ')})`
    )
    const one = items.length === 1 ? items[0] : undefined
    const oneHighlights = one ? pickList(lang, one.highlights, one.highlightsId) : []
    const extra = oneHighlights.length ? `\n\n${oneHighlights.slice(0, 4).map((h) => `- ${h}`).join('\n')}` : ''
    return mk(
      lang,
      ctx,
      `${tr(lang, `${firstName}'s work experience (newest first):`, `Pengalaman kerja ${firstName} (terbaru lebih dulu):`)}\n\n${lines.join('\n')}${extra}`,
      { links: [{ label: tr(lang, 'Experience on About page', 'Pengalaman di halaman About'), href: '/about' }], suggestions: addSuggestions(lang, 'education', 'projects', 'certs') }
    )
  }

  function answerEducation(lang: Lang, ctx: ChatContext): ChatReply {
    const lines = kb.education.map((e) => `- **${e.institution}** - ${e.degree} (${e.period})${pick(lang, e.description, e.descriptionId) ? `. ${pick(lang, e.description, e.descriptionId)}` : ''}`)
    return mk(lang, ctx, `${tr(lang, `${firstName}'s education:`, `Pendidikan ${firstName}:`)}\n\n${lines.join('\n')}`, {
      links: [{ label: tr(lang, 'About page', 'Halaman About'), href: '/about' }],
      suggestions: addSuggestions(lang, 'work', 'certs', 'projects'),
    })
  }

  const hasExpired = (date?: string) => {
    if (!date) return false
    const d = new Date(`1 ${date} UTC`)
    return !Number.isNaN(d.getTime()) && Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) <= Date.now()
  }

  function answerCerts(lang: Lang, ctx: ChatContext, tokens: string[], issuers: string[]): ChatReply {
    const topical = terms(tokens.join(' ')).filter(
      (t) => !['certification', 'certificate', 'credential', 'license', 'licence', 'course', 'badge', 'training', 'pelatihan', 'kursus', 'sertifikat', 'sertifikasi', 'valid', 'active', 'expired', 'have', 'earn', 'hold', 'own', 'owns', 'owned', 'dimiliki', 'memiliki', 'milik', 'diperoleh', 'didapat', 'all'].map(stem).includes(t)
    )
    let items = kb.certifications
    let note = ''
    if (issuers.length) {
      items = items.filter((c) => issuers.includes(c.issuer))
    } else if (topical.length) {
      const m = items.filter((c) => {
        const hay = new Set(terms(`${c.name} ${c.issuer}`))
        return topical.some((t) => hay.has(t))
      })
      if (m.length) items = m
      else note = tr(lang, `I found no certificate matching that topic, so here is the full list.\n\n`, `Tidak ada sertifikat yang cocok dengan topik itu, berikut daftar lengkapnya.\n\n`)
      if (!m.length) items = kb.certifications
    }
    const joined = tokens.join(' ')
    if (/\b(expired|expire|kedaluwarsa|kadaluarsa|habis)\b/.test(joined)) items = items.filter((c) => hasExpired(c.expires))
    else if (/\b(valid|active|aktif|berlaku)\b/.test(joined)) items = items.filter((c) => !hasExpired(c.expires))
    if (!items.length)
      return mk(lang, ctx, `${note}${tr(lang, 'No certification matches that.', 'Tidak ada sertifikat yang cocok.')}`, {
        links: [{ label: tr(lang, 'All certifications', 'Semua sertifikat'), href: '/certifications' }],
        suggestions: addSuggestions(lang, 'skills', 'projects', 'contact'),
      })
    const total = kb.certifications.length
    const issuerCount = new Set(kb.certifications.map((c) => c.issuer)).size
    const head =
      items.length === total
        ? tr(lang, `${firstName} holds ${total} licenses and certifications from ${issuerCount} providers.`, `${firstName} memiliki ${total} lisensi dan sertifikat dari ${issuerCount} penyelenggara.`)
        : tr(lang, `${items.length} of ${firstName}'s ${total} certifications match:`, `${items.length} dari ${total} sertifikat ${firstName} yang sesuai:`)
    const shown = items.slice(0, 8)
    const lines = shown.map((c) => {
      const status = c.expires ? (hasExpired(c.expires) ? `expired ${c.expires}` : `valid until ${c.expires}`) : ''
      return `- **${c.name}** - ${c.issuer} (${[`issued ${c.issued}`, status].filter(Boolean).join(', ')})`
    })
    if (items.length > shown.length) lines.push(tr(lang, `...and ${items.length - shown.length} more.`, `...dan ${items.length - shown.length} lainnya.`))
    const links: ChatLink[] = [{ label: tr(lang, 'All certifications', 'Semua sertifikat'), href: '/certifications' }]
    if (items.length === 1 && items[0].url) links.unshift({ label: tr(lang, 'Verify credential', 'Verifikasi sertifikat'), href: items[0].url, external: true })
    return mk(lang, ctx, `${note}${head}\n\n${lines.join('\n')}`, { links, suggestions: addSuggestions(lang, 'skills', 'projects', 'contact') })
  }

  function answerSkills(lang: Lang, ctx: ChatContext): ChatReply {
    const labels: Record<string, string> = { languages: 'Languages', frameworks: 'Frameworks', databases: 'Databases', ai: 'AI / ML', geospatial: 'Geospatial', tools: 'Tools' }
    const lines = Object.entries(kb.skills)
      .filter(([, v]) => v?.length)
      .map(([k, v]) => `- **${labels[k] ?? k}**: ${v!.slice(0, 8).join(', ')}${v!.length > 8 ? `, +${v!.length - 8} more` : ''}`)
    return mk(lang, ctx, `${tr(lang, `${firstName}'s skills across ${kb.techs.length} technologies used in his projects and work:`, `Keahlian ${firstName} dari ${kb.techs.length} teknologi yang dipakai di proyek dan pekerjaannya:`)}\n\n${lines.join('\n')}`, {
      links: [{ label: tr(lang, 'Tech stack on home page', 'Tech stack di beranda'), href: '/#skills-heading' }, { label: 'Resume', href: '/resume' }],
      suggestions: addSuggestions(lang, 'projects', 'certs', 'work'),
    })
  }

  function answerTech(lang: Lang, ctx: ChatContext, techs: string[]): ChatReply {
    const parts: string[] = []
    const links: ChatLink[] = []
    for (const tech of techs.slice(0, 3)) {
      const key = compact(tech)
      const group = Object.entries(kb.skills).find(([, v]) => v?.some((s) => compact(s) === key))
      const ps = kb.projects.filter((p) => p.stack.some((s) => compact(s) === key))
      const labels: Record<string, string> = { languages: 'languages', frameworks: 'frameworks', databases: 'databases', ai: 'AI / ML', geospatial: 'geospatial', tools: 'tools' }
      if (!group && !ps.length) {
        parts.push(tr(lang, `I couldn't find **${tech}** in ${firstName}'s skills or projects.`, `Saya tidak menemukan **${tech}** di keahlian maupun proyek ${firstName}.`))
        continue
      }
      const where = group ? tr(lang, `is listed in his ${labels[group[0]]} skills`, `tercantum di keahlian ${labels[group[0]]}`) : ''
      const used = ps.length
        ? tr(lang, `is used in ${ps.length} project${ps.length > 1 ? 's' : ''}: ${ps.slice(0, 6).map((p) => p.title).join(', ')}${ps.length > 6 ? ', and more' : ''}`, `dipakai di ${ps.length} proyek: ${ps.slice(0, 6).map((p) => p.title).join(', ')}${ps.length > 6 ? ', dan lainnya' : ''}`)
        : ''
      parts.push(`${tr(lang, 'Yes', 'Ya')}, **${tech}** ${[where, used].filter(Boolean).join(tr(lang, ' and ', ' dan '))}.`)
      ps.slice(0, 2).forEach((p) => links.push(projectLink(p)))
    }
    return mk(lang, ctx, parts.join('\n\n'), {
      links: links.slice(0, 3),
      suggestions: addSuggestions(lang, 'skills', 'projects', 'certs'),
      list: undefined,
    })
  }

  function answerProjects(lang: Lang, ctx: ChatContext, n: string, tokens: string[], techs: string[]): ChatReply {
    const all = kb.projects
    if (techs.length) {
      const keys = techs.map(compact)
      const ps = all.filter((p) => keys.every((k) => p.stack.some((s) => compact(s) === k)))
      if (ps.length)
        return projectList(lang, ctx, ps, tr(lang, `${ps.length} project${ps.length > 1 ? 's' : ''} use ${techs.join(' + ')}:`, `${ps.length} proyek memakai ${techs.join(' + ')}:`))
      return mk(lang, ctx, tr(lang, `None of ${firstName}'s projects list ${techs.join(' + ')} in their stack.`, `Tidak ada proyek ${firstName} yang memakai ${techs.join(' + ')}.`), { suggestions: addSuggestions(lang, 'projects', 'skills', 'contact') })
    }
    if (RE.count.test(n) && !RE.latest.test(n)) {
      const cats = new Map<string, number>()
      for (const p of all) cats.set(p.category, (cats.get(p.category) ?? 0) + 1)
      return mk(lang, ctx, `${tr(lang, `${firstName} has ${all.length} projects in this portfolio`, `${firstName} memiliki ${all.length} proyek di portofolio ini`)} (${Array.from(cats).map(([c, k]) => `${c}: ${k}`).join(', ')}).${kb.githubRepos ? ' ' + tr(lang, `His GitHub has ${kb.githubRepos} public repositories.`, `GitHub-nya memiliki ${kb.githubRepos} repositori publik.`) : ''}`, {
        links: [{ label: tr(lang, 'All projects', 'Semua proyek'), href: '/projects' }],
        suggestions: addSuggestions(lang, 'latest', 'skills', 'contact'),
      })
    }
    if (RE.latest.test(n)) {
      const ps = [...all].sort((a, b) => (b.start || '').localeCompare(a.start || '') || a.order - b.order).slice(0, 4)
      return projectList(lang, ctx, ps, tr(lang, 'The newest projects:', 'Proyek terbaru:'), 4)
    }
    if (/\b(demo|live|deployed|online|hosted|try)\b/.test(n)) {
      const ps = all.filter((p) => p.demoUrl)
      if (ps.length) return projectList(lang, ctx, ps, tr(lang, `${ps.length} projects have a live demo:`, `${ps.length} proyek memiliki demo langsung:`))
    }
    if (RE.featured.test(n)) {
      const ps = all.filter((p) => p.featured)
      if (ps.length) return projectList(lang, ctx, ps, tr(lang, 'Featured projects:', 'Proyek unggulan:'))
    }
    const catRule = CATEGORY_RULES.find((c) => c.re.test(n))
    const catWords = new Set((catRule?.words ?? []).map(stem))
    const topical = terms(tokens.join(' ')).filter((t) => !PROJECT_FILLER.has(t) && !catWords.has(t))
    if (topical.length) {
      const hits = search(topical.join(' '), ['project']).filter((h) => h.score >= 2 && h.coverage >= 0.5).slice(0, 5)
      if (hits.length) {
        const ps = hits.map((h) => projectBySlug.get(h.doc.ref ?? '')).filter((p): p is KbProject => Boolean(p))
        return projectList(lang, ctx, ps, tr(lang, 'Projects that match:', 'Proyek yang cocok:'))
      }
      if (!catRule) return refuseTopic(lang, ctx)
    }
    if (catRule) {
      const ps = all.filter((p) => p.category === catRule.category)
      if (ps.length) return projectList(lang, ctx, ps, tr(lang, `${ps.length} ${catRule.category} projects:`, `${ps.length} proyek ${catRule.category}:`))
    }
    return projectList(lang, ctx, all, tr(lang, `${firstName} has built ${all.length} projects, mostly data/AI systems and web platforms. Here are the main ones:`, `${firstName} telah membuat ${all.length} proyek, sebagian besar sistem data/AI dan platform web. Berikut yang utama:`), 8)
  }

  function refuseTopic(lang: Lang, ctx: ChatContext): ChatReply {
    return mk(lang, ctx, tr(lang, `I couldn't find a project about that in ${firstName}'s portfolio. Try asking about a technology, a category (Web, Data/AI) or a project name.`, `Saya tidak menemukan proyek tentang itu di portofolio ${firstName}. Coba tanyakan teknologi, kategori (Web, Data/AI), atau nama proyek.`), { suggestions: addSuggestions(lang, 'projects', 'skills', 'latest') })
  }

  function answerAbout(lang: Lang, ctx: ChatContext): ChatReply {
    const headline = pick(lang, kb.headline, kb.headlineId).split(/\.\s/)[0].replace(/\.$/, '')
    const para = pick(lang, kb.about, kb.aboutId).split(/\n{2,}/)[0]
    return mk(lang, ctx, `**${kb.name}**: ${headline}.\n\n${tr(lang, 'In his own words:', 'Menurut dirinya sendiri:')} "${truncate(para, 360)}"\n\n${tr(lang, `Based in ${kb.location}.`, `Berdomisili di ${kb.location}.`)}`, {
      links: [{ label: 'About', href: '/about' }, { label: 'Resume', href: '/resume' }],
      suggestions: addSuggestions(lang, 'projects', 'work', 'certs'),
    })
  }

  function fromDoc(lang: Lang, ctx: ChatContext, hit: Hit, others: Hit[]): ChatReply {
    const d = hit.doc
    // Topic words ("satellite", "queue") are best answered with the projects that mention them.
    const projectHits = [hit, ...others].filter((h) => h.doc.kind === 'project')
    const bestProject = projectHits[0]
    if (bestProject && (d.kind === 'project' || ((d.kind === 'about' || d.kind === 'skills') && bestProject.score >= hit.score * 0.5))) {
      const strong = projectHits
        .filter((h) => h.score >= bestProject.score * 0.75)
        .slice(0, 4)
        .map((h) => projectBySlug.get(h.doc.ref ?? ''))
        .filter((p): p is KbProject => Boolean(p))
      if (strong.length >= 2)
        return projectList(lang, ctx, strong, tr(lang, 'These projects are related:', 'Proyek berikut terkait:'))
      const p = projectBySlug.get(bestProject.doc.ref ?? '')
      if (p) return projectCard(lang, ctx, p)
    }
    if (d.kind === 'certification') return answerCerts(lang, ctx, tokenize(d.title), [])
    if (d.kind === 'experience') {
      const e = kb.experience[Number(d.ref)]
      if (e) return experienceReply(lang, ctx, [e])
    }
    if (d.kind === 'education') return answerEducation(lang, ctx)
    if (d.kind === 'skills') return answerSkills(lang, ctx)
    if (d.kind === 'contact') return answerContact(lang, ctx, '')
    const related = others
      .filter((h) => h.doc.kind === 'project' && h.score > hit.score * 0.6)
      .slice(0, 2)
      .map((h) => projectBySlug.get(h.doc.ref ?? ''))
      .filter((p): p is KbProject => Boolean(p))
    const lead = d.kind === 'about' ? tr(lang, "From Thomson's About page: ", 'Dari halaman About Thomson: ') : ''
    return mk(lang, ctx, `${lead}${truncate(pick(lang, d.text, d.textId), 420)}`, {
      links: [d.href ? { label: d.title, href: d.href } : { label: 'About', href: '/about' }, ...related.map(projectLink)],
    })
  }

  /* ---------- follow-ups about the last project ---------- */
  function followUp(lang: Lang, ctx: ChatContext, n: string, p: KbProject): ChatReply | null {
    if (/\b(stack|technolog\w*|teknologi|built with|dibuat dengan|pakai apa|uses?|tools?)\b/.test(n))
      return mk(lang, ctx, `**${p.title}** ${tr(lang, 'is built with', 'dibuat dengan')}: ${p.stack.join(', ')}.`, { links: [projectLink(p)], project: p.slug, suggestions: addSuggestions(lang, 'otherProjects', 'contact', 'skills') })
    if (/\b(repo|source|code|kode|github)\b/.test(n))
      return mk(lang, ctx, p.repoUrl ? tr(lang, `The source code of **${p.title}** is on GitHub.`, `Kode sumber **${p.title}** ada di GitHub.`) : tr(lang, `**${p.title}** has no public repository listed.`, `**${p.title}** tidak memiliki repositori publik yang tercantum.`), { links: p.repoUrl ? [{ label: 'Source code', href: p.repoUrl, external: true }, projectLink(p)] : [projectLink(p)], project: p.slug, suggestions: addSuggestions(lang, 'otherProjects', 'contact', 'skills') })
    if (/\b(demo|live|link|url|website|coba|try)\b/.test(n))
      return mk(lang, ctx, p.demoUrl ? tr(lang, `**${p.title}** has a live demo.`, `**${p.title}** memiliki demo langsung.`) : tr(lang, `**${p.title}** has no live demo listed. You can open its details here.`, `**${p.title}** tidak memiliki demo langsung. Detailnya bisa dibuka di sini.`), { links: p.demoUrl ? [{ label: 'Live demo', href: p.demoUrl, external: true }, projectLink(p)] : [projectLink(p)], project: p.slug, suggestions: addSuggestions(lang, 'otherProjects', 'contact', 'skills') })
    if (/\b(when|kapan|period|year|tahun|started|mulai|status)\b/.test(n))
      return mk(lang, ctx, periodOf(p) ? `**${p.title}**: ${periodOf(p)}.` : tr(lang, `No date is listed for **${p.title}**.`, `Tanggal **${p.title}** tidak tercantum.`), { links: [projectLink(p)], project: p.slug, suggestions: addSuggestions(lang, 'otherProjects', 'contact', 'skills') })
    if (/\b(more|detail|details|lebih lanjut|lanjut|features?|fitur|explain|jelaskan|ceritakan)\b/.test(n)) return projectCard(lang, ctx, p, true)
    return null
  }

  /* ---------- main entry ---------- */
  function reply(query: string, context: ChatContext = {}): ChatReply {
    const raw = query.trim().slice(0, 400)
    const lang = detectLang(raw, context.lang ?? 'en')
    const ctx: ChatContext = { lang, project: context.project, list: context.list }
    const n = norm(raw)
    const tokens = correctTokens(tokenize(raw))
    const nc = tokens.join(' ')

    if (!n) return mk(lang, ctx, tr(lang, 'Type a question about the portfolio and I will answer it.', 'Ketik pertanyaan tentang portofolio dan saya akan menjawabnya.'), { suggestions: addSuggestions(lang, ...starterKeys) })

    /* small talk */
    if (RE.greet.test(n))
      return mk(lang, ctx, tr(lang, `Hello! I'm the portfolio assistant for ${kb.name}. Ask me about his projects, experience, education, certifications, skills or how to contact him.`, `Halo! Saya asisten portofolio ${kb.name}. Tanyakan seputar proyek, pengalaman, pendidikan, sertifikat, keahlian, atau cara menghubunginya.`), { suggestions: addSuggestions(lang, ...starterKeys) })
    if (RE.howAreYou.test(n))
      return mk(lang, ctx, tr(lang, `I'm doing well, thanks. What would you like to know about ${firstName}'s portfolio?`, `Baik, terima kasih. Apa yang ingin Anda ketahui tentang portofolio ${firstName}?`), { suggestions: addSuggestions(lang, ...starterKeys) })
    if (tokens.length <= 5 && RE.thanks.test(n) && !RE.projects.test(n))
      return mk(lang, ctx, tr(lang, 'You are welcome! Anything else about the portfolio?', 'Sama-sama! Ada lagi yang ingin ditanyakan tentang portofolio?'), { suggestions: addSuggestions(lang, 'projects', 'certs', 'contact') })
    if (tokens.length <= 5 && RE.bye.test(n))
      return mk(lang, ctx, tr(lang, 'Goodbye! Thanks for visiting the portfolio.', 'Sampai jumpa! Terima kasih sudah berkunjung.'), { suggestions: addSuggestions(lang, 'contact', 'resume') })
    if (RE.botTech.test(n))
      return mk(lang, ctx, tr(lang, `I run entirely in your browser. I don't call any AI service or external API: I search the portfolio's own content (projects, experience, certifications, skills) with keyword matching and rules, so I only answer questions about it.`, `Saya berjalan sepenuhnya di browser Anda. Saya tidak memakai layanan AI atau API eksternal: saya mencari di konten portofolio (proyek, pengalaman, sertifikat, keahlian) dengan pencocokan kata kunci dan aturan, jadi saya hanya menjawab hal yang ada di sini.`), { suggestions: addSuggestions(lang, 'help', 'projects', 'contact') })
    if (RE.botIdentity.test(n))
      return mk(lang, ctx, tr(lang, `I'm a small assistant built into ${firstName}'s portfolio. I'm not a person and I don't use an external AI: I answer from the content of this website.`, `Saya asisten kecil yang tertanam di portofolio ${firstName}. Saya bukan manusia dan tidak memakai AI eksternal: saya menjawab dari isi website ini.`), { suggestions: addSuggestions(lang, 'help', 'projects', 'about') })
    if (RE.help.test(n))
      return mk(lang, ctx, tr(lang, `I can answer questions about ${firstName}'s portfolio:\n\n- Projects: what he built, the tech stack, links, newest ones\n- Work experience and current role\n- Education\n- Certifications\n- Skills and technologies\n- How to contact him\n\nQuestions outside the portfolio are not something I can answer.`, `Saya bisa menjawab pertanyaan tentang portofolio ${firstName}:\n\n- Proyek: yang pernah dibuat, teknologi, tautan, yang terbaru\n- Pengalaman kerja dan posisi saat ini\n- Pendidikan\n- Sertifikat\n- Keahlian dan teknologi\n- Cara menghubunginya\n\nPertanyaan di luar portofolio tidak bisa saya jawab.`), { suggestions: addSuggestions(lang, ...starterKeys) })

    const project = findProject(tokens)
    const techs = findTechs(tokens, raw)
    const issuers = findIssuers(tokens)
    const ownerRef = RE.ownerRef.test(n)

    /* in-scope but not shared */
    const wantsContact = RE.contact.test(n)
    if ((RE.sensitive.test(n) || RE.notCovered.test(n)) && !wantsContact && !project)
      return mk(lang, ctx, tr(lang, `That isn't covered in the portfolio. For anything professional, you can contact ${firstName} directly.`, `Hal itu tidak tercantum di portofolio. Untuk keperluan profesional, silakan hubungi ${firstName} langsung.`), { inScope: true, links: [{ label: tr(lang, 'Contact page', 'Halaman kontak'), href: '/contact' }], suggestions: addSuggestions(lang, 'contact', 'projects', 'work') })

    /* out of scope */
    if (RE.offTopic.test(n) && !project) return refuse(lang, ctx)

    /* follow-ups to the previous project / list */
    if (context.list?.length && !project) {
      const ord = tokens.map((t) => ORDINALS[t]).find((i) => i !== undefined)
      const num = /\b(?:number|no|nomor|nr)\s*(\d)\b/.exec(n)
      const idx = ord !== undefined ? ord : num ? Number(num[1]) - 1 : undefined
      if (idx !== undefined && context.list[idx]) {
        const p = projectBySlug.get(context.list[idx])
        if (p) return projectCard(lang, ctx, p)
      }
    }
    const contactOfProject = !wantsContact || /\b(it|its|link|repo|source|code|there|nya)\b/.test(n)
    if (context.project && !project && tokens.length <= 8 && RE.followProject.test(n) && !RE.certification.test(n) && !RE.education.test(n) && contactOfProject) {
      const p = projectBySlug.get(context.project)
      if (p) {
        const f = followUp(lang, ctx, n, p)
        if (f) return f
        if (/\b(it|its|that|itu|tersebut|nya)\b/.test(n)) return projectCard(lang, ctx, p, true)
      }
    }
    if (RE.generic.test(n) && !ownerRef && !project) return refuse(lang, ctx)

    /* explicit entities */
    if (RE.site.test(n)) {
      const p = projectBySlug.get('portfolio')
      if (p) return projectCard(lang, ctx, p)
    }
    if (project && !(RE.count.test(n) && RE.projects.test(n) && !RE.site.test(n) && !tokens.some((t) => entityWords.has(t)))) {
      const full = /\b(more|detail|details|features?|fitur|explain|jelaskan|ceritakan|tell me about)\b/.test(n)
      const f = /\b(stack|repo|source|demo|link|when|kapan)\b/.test(n) ? followUp(lang, ctx, n, project) : null
      return f ?? projectCard(lang, ctx, project, full)
    }

    if (wantsContact) return answerContact(lang, ctx, n)
    if (RE.availability.test(n) && !techs.length) {
      const base = answerContact(lang, ctx, '')
      return { ...base, answer: tr(lang, `${firstName} is open to collaboration, freelance projects and full-time roles. The best way to reach him:\n\n`, `${firstName} terbuka untuk kolaborasi, proyek freelance, dan peran full-time. Cara terbaik menghubunginya:\n\n`) + base.answer.split('\n\n').slice(1).join('\n\n') }
    }
    if (issuers.length || RE.certification.test(n)) return answerCerts(lang, ctx, tokens, issuers)
    if (RE.articles.test(n) && !RE.projects.test(n)) return mk(lang, ctx, tr(lang, `The Articles section (opinions and articles) is still in development and coming soon.`, `Bagian Articles (opini dan artikel) masih dalam pengembangan dan segera hadir.`), { links: [{ label: 'Articles', href: '/articles' }], suggestions: addSuggestions(lang, 'projects', 'about', 'contact') })
    if (RE.resume.test(n)) return mk(lang, ctx, tr(lang, `${firstName}'s resume has his summary, experience, education, certifications, projects and skills. You can print it or save it as PDF from that page.`, `CV ${firstName} berisi ringkasan, pengalaman, pendidikan, sertifikat, proyek, dan keahlian. Anda bisa mencetak atau menyimpannya sebagai PDF dari halaman tersebut.`), { links: [{ label: 'Resume', href: '/resume' }], suggestions: addSuggestions(lang, 'contact', 'work', 'projects') })
    if (RE.location.test(n) && !RE.projects.test(n)) return mk(lang, ctx, tr(lang, `${firstName} is based in ${kb.location}.`, `${firstName} berdomisili di ${kb.location}.`), { links: [{ label: 'Contact', href: '/contact' }], suggestions: addSuggestions(lang, 'work', 'contact', 'projects') })
    if (RE.currentJob.test(n)) return answerCurrentJob(lang, ctx)
    if (RE.education.test(n) && !RE.projects.test(n)) return answerEducation(lang, ctx)

    const companyWords = new Set(kb.experience.flatMap((e) => Array.from(experienceTerms(e))))
    const roleWords = new Set(['data', 'analyst', 'developer', 'web', 'specialist', 'technician', 'it', 'junior', 'scientist', 'full', 'time', 'contract', 'internship', 'indonesia', 'remote', 'hybrid', 'site', 'on'])
    const mentionsCompany = terms(nc).some((t) => companyWords.has(t) && !roleWords.has(t))
    if ((RE.experience.test(n) || mentionsCompany) && !RE.projects.test(n) && !techs.length) {
      const r = answerExperience(lang, ctx, tokens)
      if (r) return r
    }

    if (RE.projects.test(n) || (RE.latest.test(n) && !techs.length)) return answerProjects(lang, ctx, n, tokens, techs)
    if (techs.length) return answerTech(lang, ctx, techs)
    if (RE.techVerb.test(n) && ownerRef) {
      const skip = new Set(['know', 'use', 'uses', 'used', 'using', 'work', 'with', 'experience', 'familiar', 'proficient', 'code', 'program', 'pakai', 'paham', 'mengerti', 'thomson', 'sibuea', 'skill', 'skills', 'good', 'bisa', 'apakah', 'pernah', 'punya', 'menguasai'])
      const obj = nc.split(' ').filter((t) => t && !STOPWORDS.has(t) && !skip.has(t)).join(' ')
      if (obj) return mk(lang, ctx, tr(lang, `I don't see "${obj}" in ${firstName}'s skills or projects.`, `Saya tidak menemukan "${obj}" di keahlian atau proyek ${firstName}.`), { suggestions: addSuggestions(lang, 'skills', 'projects', 'contact') })
    }
    if (RE.skills.test(n)) return answerSkills(lang, ctx)
    if (RE.summary.test(n)) return answerAbout(lang, ctx)

    /* free-text retrieval */
    const hits = search(nc)
    const top = hits[0]
    if (top && top.score >= 2.4 && top.coverage >= 0.6) return fromDoc(lang, ctx, top, hits.slice(1))

    return refuse(lang, ctx)
  }

  return {
    reply,
    starters: (lang: Lang = 'en') => addSuggestions(lang, ...starterKeys),
  }
}
