import Panel from "./Panel.jsx";

export default function NotFound({ title = "Page not found", message, links }) {
  return (
    <Panel
      title={title}
      links={links ?? [{ to: "/comics", label: "Back to Comics" }]}
    >
      {message ?? "We couldn't find what you were looking for."}
    </Panel>
  );
}
