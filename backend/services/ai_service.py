import os
import json
import logging
from typing import List, Dict, Any
from datetime import datetime
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("smartstudy.ai")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class AIService:
    def generate_study_plan(
        self,
        subjects: List[Dict[str, str]],
        available_hours_per_day: float,
        exam_date: str,
        past_performance: float = 75.0,
        focus_areas: str = ""
    ) -> Dict[str, Any]:
        """
        Generates a structured personalized study plan.
        Returns a dict with 'tasks' (List of Dict) and 'ai_overall_strategy' (str).
        """
        # Calculate days remaining until exam
        days_remaining = 14
        try:
            target_dt = datetime.strptime(exam_date, "%Y-%m-%d")
            delta = (target_dt - datetime.now()).days
            days_remaining = max(1, delta)
        except Exception:
            pass

        # 1. Try Gemini / OpenAI API if available
        if GEMINI_API_KEY:
            llm_plan = self._call_gemini_api(subjects, available_hours_per_day, days_remaining, past_performance, focus_areas)
            if llm_plan:
                return llm_plan

        # 2. Fallback to Dynamic Intelligent Planner
        return self._generate_intelligent_fallback_plan(
            subjects, available_hours_per_day, days_remaining, past_performance, focus_areas
        )

    def _call_gemini_api(
        self,
        subjects: List[Dict[str, str]],
        hours_per_day: float,
        days_remaining: int,
        past_performance: float,
        focus_areas: str
    ) -> Dict[str, Any]:
        try:
            prompt = f"""
You are an expert AI Study Planner. Create a structured, highly personalized study plan for a student with the following profile:
- Subjects & Skill Levels: {json.dumps(subjects)}
- Available Daily Study Hours: {hours_per_day} hours/day
- Days Remaining Until Exam: {days_remaining} days
- Previous Test Performance: {past_performance}%
- Specific Focus Areas/Notes: {focus_areas}

Return strictly a valid JSON object with the following structure:
{{
  "ai_overall_strategy": "A clear 2-3 sentence strategic advice summarizing how to tackle these subjects.",
  "tasks": [
    {{
      "subject": "Subject Name",
      "topic": "Specific Topic or Chapter Name",
      "duration_minutes": 60,
      "priority": "High",
      "recommendation": "Specific actionable learning advice for this topic"
    }}
  ]
}}
Do not include markdown backticks like ```json ... ``` around the response. Return raw JSON.
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}]
            }).encode("utf-8")

            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                text = text.replace("```json", "").replace("```", "").strip()
                data = json.loads(text)
                if "tasks" in data and len(data["tasks"]) > 0:
                    logger.info("Successfully generated study plan using Gemini API.")
                    return data
        except Exception as e:
            logger.warning(f"Gemini API call failed or timed out: {e}. Falling back to rule-based engine.")
        return None

    def _generate_intelligent_fallback_plan(
        self,
        subjects: List[Dict[str, str]],
        hours_per_day: float,
        days_remaining: int,
        past_performance: float,
        focus_areas: str
    ) -> Dict[str, Any]:
        """
        Creates realistic, tailored tasks based on subject skill levels, exam proximity, and custom focus areas.
        """
        topic_templates = {
            "Mathematics": [
                ("Foundational Calculus & Derivatives", 60, "Beginner", "Focus on core derivative rules and step-by-step problem set solutions."),
                ("Integral Calculus & Integration by Parts", 90, "Intermediate", "Practice 5 solved integration problems and verify with standard formulas."),
                ("Linear Algebra & Matrix Operations", 75, "Intermediate", "Review matrix multiplication, determinants, and eigenvalues."),
                ("Differential Equations & Real World Modeling", 90, "Advanced", "Solve application problems with differential equations.")
            ],
            "Physics": [
                ("Newtonian Mechanics & Laws of Motion", 60, "Beginner", "Draw free-body diagrams and write down equation of motion for each vector."),
                ("Work, Power & Energy Conservation", 75, "Intermediate", "Solve energy conservation balance problems."),
                ("Electromagnetism & Circuits", 90, "Intermediate", "Practice Kirchhoff's circuit laws and magnetic flux calculations."),
                ("Quantum Physics & Photoelectric Effect", 60, "Advanced", "Review energy levels and photon emission conceptual questions.")
            ],
            "Computer Science": [
                ("Data Structures: Arrays, Linked Lists & Trees", 75, "Beginner", "Implement binary tree traversals and time complexity analysis."),
                ("Algorithms: Sorting, Searching & Dynamic Programming", 90, "Intermediate", "Solve 3 dynamic programming memoization problems."),
                ("Database Systems & SQL Queries", 60, "Intermediate", "Practice writing JOIN queries, indexing, and normalization rules."),
                ("System Design & API Architecture", 90, "Advanced", "Diagram scalable microservices architecture and caching layers.")
            ],
            "Chemistry": [
                ("Atomic Structure & Periodic Trends", 45, "Beginner", "Summarize periodic trends: electronegativity, ionization energy, atomic radius."),
                ("Chemical Bonding & Molecular Geometry", 60, "Intermediate", "Practice VSEPR model geometries and hybridization states."),
                ("Thermodynamics & Reaction Kinetics", 90, "Intermediate", "Calculate reaction enthalpy, entropy, and Gibbs free energy."),
                ("Organic Chemistry Reactions & Mechanisms", 90, "Advanced", "Draw reaction mechanisms for nucleophilic substitution and elimination.")
            ],
            "Biology": [
                ("Cell Biology & Organelle Functions", 45, "Beginner", "Create visual diagrams of cell structure and mitochondrial respiration."),
                ("Genetics & DNA Replication", 60, "Intermediate", "Review Punnett squares, transcription, and translation steps."),
                ("Human Physiology & Organ Systems", 75, "Intermediate", "Map out the circulatory and nervous system feedback loops."),
                ("Molecular Biology & Biotechnology", 90, "Advanced", "Study PCR, gene editing, and gel electrophoresis principles.")
            ]
        }

        default_topics = [
            ("Core Fundamentals & Concept Mapping", 60, "Beginner", "Read key chapter summaries and create flashcards for quick revision."),
            ("Practical Problem Solving & Exercises", 75, "Intermediate", "Work through standard textbook exercise problems under timed conditions."),
            ("Mock Test & Active Recall Quiz", 90, "Advanced", "Test yourself without references to identify remaining weak spots.")
        ]

        tasks = []
        if not subjects:
            subjects = [{"subject": "General Study", "level": "Intermediate"}]

        # 1. Handle custom focus areas if provided by user!
        if focus_areas and focus_areas.strip():
            clean_focus = focus_areas.strip()
            # Split focus areas into distinct topics if comma separated or user line
            custom_topics = [f.strip() for f in clean_focus.replace("\n", ",").split(",") if f.strip()]
            for custom_top in custom_topics:
                # Determine best matching subject
                matched_subj = subjects[0].get("subject", "General Study")
                for s in subjects:
                    if s.get("subject", "").lower() in custom_top.lower():
                        matched_subj = s.get("subject")
                        break

                tasks.append({
                    "subject": matched_subj,
                    "topic": f"Target Focus: {custom_top}",
                    "duration_minutes": min(90, int(hours_per_day * 60)),
                    "priority": "High",
                    "recommendation": f"Dedicated priority review session requested for {custom_top}. Focus on core concepts & practice problems."
                })

        # 2. Add standard subject topics
        for subj_item in subjects:
            subj_name = subj_item.get("subject", "General Study")
            level = subj_item.get("level", "Intermediate")
            
            available_topics = topic_templates.get(subj_name, default_topics)
            
            for topic, dur, target_level, rec in available_topics:
                # Priority logic
                if level.lower() == "beginner":
                    priority = "High" if target_level.lower() in ["beginner", "intermediate"] else "Medium"
                elif days_remaining <= 7:
                    priority = "High"
                else:
                    priority = "High" if target_level.lower() == level.lower() else "Medium"

                tasks.append({
                    "subject": subj_name,
                    "topic": topic,
                    "duration_minutes": min(dur, int(hours_per_day * 60)),
                    "priority": priority,
                    "recommendation": rec
                })

        # Generate strategy text incorporating focus_areas
        if focus_areas and focus_areas.strip():
            strategy = f"Targeted AI Revision Blueprint focusing on: '{focus_areas.strip()}'. With {days_remaining} days until exam, prioritize the High-Priority focus modules first ({hours_per_day} hours daily)."
        elif days_remaining <= 5:
            strategy = f"Exam is only {days_remaining} days away! Focus heavily on High Priority weak topics, active recall practice, and timed mock tests. Allocate {hours_per_day} hours daily without multitasking."
        else:
            strategy = f"With {days_remaining} days remaining, maintain a balanced study routine of {hours_per_day} hours/day. Focus on mastering Beginner/Intermediate concepts first, then reinforce with problem sets."

        return {
            "ai_overall_strategy": strategy,
            "tasks": tasks
        }


ai_service = AIService()
