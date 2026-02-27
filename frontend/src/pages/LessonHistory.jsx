import { useEffect, useState } from "react";
import API from "../api";

export default function LessonHistory() {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const email = localStorage.getItem("email");

  const formatPlan = (plan) => {
    if (!plan) return "";
    if (typeof plan === "string") return plan;
    try {
      // simple human readable formatting similar to generator
      const parts = [];
      if (plan.title) parts.push(plan.title);
      if (plan.topic) parts.push(`Topic: ${plan.topic}`);
      if (plan.grade) parts.push(`Grade: ${plan.grade}`);
      if (plan.objectives && plan.objectives.length) {
        parts.push('\nObjectives:');
        plan.objectives.forEach((o, i) => parts.push(`${i + 1}. ${o}`));
      }
      if (plan.segments && plan.segments.length) {
        parts.push('\nLesson segments:');
        plan.segments.forEach((s) => parts.push(`- ${s.name} (${s.minutes} min): ${s.purpose}`));
      }
      return parts.join('\n');
    } catch (e) {
      return JSON.stringify(plan, null, 2);
    }
  };

  useEffect(() => {
    if (!email) {
      setError("Not logged in");
      return;
    }

    const fetchLessons = async () => {
      try {
        const res = await API.get(`/lessons/${email}`);
        setLessons(res.data || []);
      } catch (e) {
        setError(e?.response?.data?.detail || e.message || "Failed to load lessons");
      }
    };

    fetchLessons();
  }, [email]);

  if (error) {
    return (
      <div className="history">
        <h2>Your Lesson History</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="history">
      <h2>Your Lesson History</h2>

      {lessons.length === 0 && <p>No lessons yet.</p>}

      {lessons.map((lesson, index) => (
        <div key={index} className="lesson-card">
          <h3>{lesson.topic} (Grade {lesson.grade})</h3>
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{formatPlan(lesson.lesson)}</pre>
        </div>
      ))}
    </div>
  );
}