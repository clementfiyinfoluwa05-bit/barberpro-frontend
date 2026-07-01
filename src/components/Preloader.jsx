import "./Preloader.css";
export default function Preloader({ visible }) {
  if (!visible) return null;
  return (
    <div className="preloader-overlay">
      <div className="preloader-spinner" />
      <p className="preloader-text">TECH BARBER QUEEN</p>
    </div>
  );
}
