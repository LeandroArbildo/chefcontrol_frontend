export default function Section({ title, children, compact = false }) {
  return (
    <section className={compact ? 'section section--compact' : 'section'}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
