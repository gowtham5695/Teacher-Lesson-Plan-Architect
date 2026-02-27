import { useState } from "react";
import API from "../api";

export default function LessonGenerator() {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [lesson, setLesson] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState("text"); // 'text' or 'file'
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(40);
  const email = localStorage.getItem("email");

  const formatPlan = (plan) => {
    if (!plan) return "";
    // If already a string, return as-is
    if (typeof plan === "string") return plan;

    const lines = [];
    if (plan.title) lines.push(plan.title);
    if (plan.topic) lines.push(`Topic: ${plan.topic}`);
    if (plan.grade) lines.push(`Grade: ${plan.grade}`);
    if (plan.teaching_style) lines.push(`Teaching style: ${plan.teaching_style}`);
    if (plan.objectives && plan.objectives.length) {
      lines.push("\nObjectives:");
      plan.objectives.forEach((o, i) => lines.push(`${i + 1}. ${o}`));
    }

    if (plan.segments && plan.segments.length) {
      lines.push("\nLesson segments:");
      plan.segments.forEach((s) => lines.push(`- ${s.name} (${s.minutes} min): ${s.purpose}`));
    }

    if (plan.activities && plan.activities.length) {
      lines.push("\nActivities:");
      plan.activities.forEach((a, i) => {
        lines.push(`\n${i + 1}. ${a.title} — ${a.duration} min`);
        if (a.description) lines.push(`   ${a.description}`);
        if (a.materials) lines.push(`   Materials: ${a.materials.join(", ")}`);
      });
    }

    if (plan.quiz && plan.quiz.length) {
      lines.push("\nQuiz:");
      plan.quiz.forEach((q, i) => {
        lines.push(`\nQ${i + 1}: ${q.question}`);
        if (q.options) q.options.forEach((opt, j) => lines.push(`   ${String.fromCharCode(65 + j)}. ${opt}`));
        if (q.explanation) lines.push(`   Explanation: ${q.explanation}`);
      });
    }

    if (plan.differentiation) {
      lines.push("\nDifferentiation:");
      if (plan.differentiation.support) lines.push(` - Support: ${plan.differentiation.support}`);
      if (plan.differentiation.extension) lines.push(` - Extension: ${plan.differentiation.extension}`);
    }

    return lines.join("\n");
  };

  const generateLesson = async () => {
    setError("");
    setLesson("");

    if (inputMode === "text") {
      if (!topic.trim()) {
        setError("Please enter a topic.");
        return;
      }
    } else {
      if (!file) {
        setError("Please choose a file to upload.");
        return;
      }
    }

    if (!grade) {
      setError("Please select a grade.");
      return;
    }

    if (!duration || isNaN(Number(duration)) || Number(duration) < 5) {
      setError("Please enter a valid duration in minutes (min 5).");
      return;
    }

    if (!email) {
      setError("You must be logged in to generate lessons.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (inputMode === "text") {
        res = await API.post("/generate", {
          topic: topic.trim(),
          grade,
          email,
          duration_minutes: Number(duration),
        });
      } else {
        const form = new FormData();
        form.append("file", file);
        form.append("grade", grade);
        form.append("email", email);
        form.append("duration_minutes", Number(duration));
        // optional: pass topic field too (will be used as fallback)
        if (topic.trim()) form.append("topic", topic.trim());

        // Let axios set Content-Type (including boundary)
        res = await API.post("/generate", form);
      }

      const raw = res?.data?.lesson ?? res?.data ?? res;
      // If backend returned a JSON string, try to parse it
      let parsed = raw;
      if (typeof raw === "string") {
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          parsed = raw;
        }
      }

      const formatted = typeof parsed === "string" ? parsed : formatPlan(parsed);
      setLesson(formatted);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to generate lesson";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator">
      <div className="generator-box">
        <h2>Generate Lesson Plan</h2>

        {error && <p className="error">{error}</p>}

        <div style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center', fontSize: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input style={{ width: 14, height: 14 }} type="radio" name="inputMode" value="text" checked={inputMode === "text"} onChange={() => setInputMode("text")} />
            <span>Text</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input style={{ width: 14, height: 14 }} type="radio" name="inputMode" value="file" checked={inputMode === "file"} onChange={() => setInputMode("file")} />
            <span>File</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            placeholder="Enter Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={inputMode === "file"}
            style={{ flex: 1 }}
          />

          {inputMode === "file" && (
            <input style={{ width: 220 }} type="file" accept=".pdf,.docx,.pptx,.txt,.md,.html,.json,.csv,.py" onChange={(e) => setFile(e.target.files[0] || null)} />
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">Select Grade</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
          </select>

          <input
            type="number"
            min={5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{ width: 120 }}
            aria-label="Duration in minutes"
          />
        </div>

        <button type="button" onClick={generateLesson} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>

        {lesson && (
          <div className="lesson-box">
            <h3>Generated Lesson Plan</h3>
            <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{lesson}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
