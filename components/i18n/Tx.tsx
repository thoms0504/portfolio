interface TxProps {
  en: string
  id?: string
}

/**
 * Renders the English and Indonesian variants of a string. CSS shows only the
 * variant matching <html data-lang>, so the correct text is visible before any
 * JavaScript runs.
 */
export function Tx({ en, id }: TxProps) {
  if (!id || id === en) return <>{en}</>
  return (
    <>
      <span className="i18n-en">{en}</span>
      <span className="i18n-id">{id}</span>
    </>
  )
}
