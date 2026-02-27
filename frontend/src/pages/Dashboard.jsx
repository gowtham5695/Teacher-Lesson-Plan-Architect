export default function Dashboard() {
  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name");
  const formatEmailName = (em) => {
    if (!em) return "";
    const local = em.split("@")[0] || em;
    // replace separators with spaces and capitalize words
    return local
      .replace(/[._\-]/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0]?.toUpperCase() + s.slice(1))
      .join(" ");
  };

  const displayName = name || formatEmailName(email);

  return (
    <div className="dashboard">
      <h1>Welcome, {displayName}</h1>
      <p>
        Generate structured AI-powered lesson plans aligned with
        curriculum and grade level.
      </p>
    </div>
  );
}