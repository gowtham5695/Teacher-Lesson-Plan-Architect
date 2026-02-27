import json
import sys
from models import generate_lesson_plan


def main():
    # Optional: pass a source file path as the first argument
    src = sys.argv[1] if len(sys.argv) > 1 else None
    topic = "Photosynthesis: How plants make energy"
    if src:
        plan = generate_lesson_plan(topic=topic, grade=7, source_file_path=src, duration_minutes=40)
    else:
        plan = generate_lesson_plan(topic=topic, grade=7, duration_minutes=40)
    print(json.dumps(plan, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
