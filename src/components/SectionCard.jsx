export default function SectionCard({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="section-grid">{children}</div>
    </section>
  );
}
