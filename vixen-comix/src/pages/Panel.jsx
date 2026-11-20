import { Link } from "react-router-dom";

// A simple message box used for loading, error and not-found states.
// links: [{ to, label }]
export default function Panel({ title, children, links = [] }) {
  return (
    <div className="hub-panel" role="status">
      {title && <h2 className="hub-panel-title">{title}</h2>}
      {children && <p>{children}</p>}
      {links.length > 0 && (
        <p className="hub-panel-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="hub-btn">
              {link.label}
            </Link>
          ))}
        </p>
      )}
    </div>
  );
}
