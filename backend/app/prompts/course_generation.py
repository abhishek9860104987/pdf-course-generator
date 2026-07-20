COURSE_GENERATION_PROMPT = """
You are an expert instructional designer and course creator. Your task is to analyze the provided PDF content and create a comprehensive, structured course.

Based on the following PDF content, generate a course structure in JSON format:

{content}

Return a JSON object with the following structure:
{{
    "title": "Course title",
    "description": "Brief description of what the course covers",
    "objectives": ["Learning objective 1", "Learning objective 2", ...],
    "difficulty": "beginner|intermediate|advanced",
    "estimated_time": total_minutes,
    "prerequisites": ["Prerequisite 1", "Prerequisite 2", ...],
    "chapters": [
        {{
            "title": "Chapter title",
            "description": "Chapter description",
            "order": 1,
            "lessons": [
                {{
                    "title": "Lesson title",
                    "content": "Full lesson content in markdown format",
                    "explanation": "Detailed explanation of the concept",
                    "example": "Practical example or code snippet",
                    "key_takeaways": ["Key point 1", "Key point 2", ...],
                    "important_notes": ["Important note 1", "Important note 2", ...],
                    "summary": "Lesson summary",
                    "order": 1,
                    "estimated_time": minutes,
                    "topics": [
                        {{
                            "title": "Topic title",
                            "description": "Short topic description",
                            "order": 1,
                            "subtopics": [
                                {{
                                    "title": "Subtopic title",
                                    "content": "Detailed subtopic content",
                                    "order": 1
                                }}
                            ]
                        }}
                    ]
                }}
            ]
        }}
    ]
}}

Guidelines:
1. Create 3-8 chapters depending on content length
2. Each chapter should have 2-5 lessons
3. Content should be educational and well-structured
4. Use markdown formatting for content
5. Include practical examples when applicable
6. Estimate time realistically (5-15 minutes per lesson)
7. Ensure logical flow from basics to advanced topics
8. Extract actual content from the PDF, don't make things up
"""

LESSON_GENERATION_PROMPT = """
You are an expert educator. Expand the following topic into a comprehensive lesson.

Topic: {topic}
Context: {context}

Generate a detailed lesson in JSON format:
{{
    "content": "Full lesson content in markdown format with headings, paragraphs, and code blocks if applicable",
    "explanation": "Detailed explanation of the core concepts",
    "example": "Practical example or code snippet demonstrating the concept",
    "key_takeaways": ["Key point 1", "Key point 2", ...],
    "important_notes": ["Important note 1", "Important note 2", ...],
    "summary": "Concise summary of the lesson"
}}

Guidelines:
1. Content should be comprehensive yet accessible
2. Use clear headings and subheadings
3. Include code examples for technical topics
4. Highlight key concepts in bold
5. Provide real-world examples
6. Keep explanations clear and concise
"""

QUIZ_GENERATION_PROMPT = """
You are an expert educator. Create a quiz based on the following course content.

Course Content:
{content}

Generate a quiz in JSON format:
{{
    "title": "Quiz title",
    "questions": [
        {{
            "id": "unique_id",
            "question": "Question text",
            "type": "mcq|true_false|short_answer",
            "options": ["Option A", "Option B", "Option C", "Option D"],  // for mcq only
            "correct_answer": "Correct answer",
            "explanation": "Explanation of why this is correct"
        }}
    ]
}}

Guidelines:
1. Create 5-10 questions
2. Mix of question types (mcq, true_false, short_answer)
3. Questions should test understanding, not just memorization
4. Provide clear explanations for answers
5. Make questions progressively challenging
6. Base questions strictly on the provided content
"""

SUMMARY_GENERATION_PROMPT = """
You are an expert educator. Create a comprehensive summary of the following content.

Content:
{content}

Generate a summary in JSON format:
{{
    "summary": "Comprehensive summary covering all key points",
    "key_points": ["Key point 1", "Key point 2", ...],
    "main_concepts": ["Concept 1", "Concept 2", ...]
}}

Guidelines:
1. Capture all important information
2. Be concise but comprehensive
3. Highlight the most important concepts
4. Structure logically
"""

FLASHCARD_GENERATION_PROMPT = """
You are an expert educator. Create flashcards based on the following content.

Content:
{content}

Generate flashcards in JSON format:
{{
    "flashcards": [
        {{
            "front": "Question or term",
            "back": "Answer or definition",
            "category": "Optional category"
        }}
    ]
}}

Guidelines:
1. Create 10-20 flashcards
2. Focus on key concepts and definitions
3. Make questions clear and specific
4. Answers should be concise
5. Group related concepts
"""
