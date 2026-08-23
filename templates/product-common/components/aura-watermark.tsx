export function AuraWatermark() {
  return (
    <a
      className="aura-mark"
      href="https://aura.tl"
      target="_blank"
      rel="noreferrer"
      aria-label="Built with Aura — visit aura.tl"
    >
      <span className="aura-mark__orb" aria-hidden="true">
        <i />
        <i />
        <i />a
      </span>
      <span>
        <small>built with</small>
        <strong>aura</strong>
      </span>
      <b aria-hidden="true">↗</b>
    </a>
  );
}
