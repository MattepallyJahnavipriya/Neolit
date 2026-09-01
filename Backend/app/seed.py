from sqlalchemy.orm import Session

from app.models.learning import Activity, Assessment, Content, Language, Lesson, Level, Module, Question, QuestionOption


LANGUAGE_DATA = [
    ("English", "en"),
    ("Hindi", "hi"),
    ("Telugu", "te"),
    ("Tamil", "ta"),
    ("Kannada", "kn"),
]


def ensure_languages(db: Session) -> list[Language]:
    existing_codes = {language.code for language in db.query(Language).all()}
    missing = [Language(name=name, code=code) for name, code in LANGUAGE_DATA if code not in existing_codes]
    if missing:
        db.add_all(missing)
        db.flush()
    return db.query(Language).order_by(Language.id).all()


def add_extra_questions(db: Session) -> None:
    question_sets = {
        "Reading: A Morning Routine": [
            ("When does Ravi go to school?", "Every morning", ["Every morning", "At night", "On weekends"]),
            ("What does Ravi enjoy reading?", "Books", ["Books", "Maps", "Menus"]),
            ("Which sentence best describes Ravi?", "He is a student who enjoys reading", ["He is a student who enjoys reading", "He is a shopkeeper", "He is a doctor"]),
        ],
        "Writing: My Family": [
            ("Write one sentence about a person in your family.", "", []),
            ("Write one sentence about something your family does together.", "", []),
        ],
        "Comprehension: The Helpful Neighbor": [
            ("Who receives the vegetables?", "Her neighbor", ["Her neighbor", "Her teacher", "Her cousin"]),
            ("What kind of person is Maya?", "Helpful", ["Helpful", "Careless", "Quiet"]),
            ("What is the main idea of the passage?", "Helping neighbors builds community", ["Helping neighbors builds community", "Gardening is difficult", "Libraries need quiet rooms"]),
        ],
        "Reading Challenge: City Garden": [
            ("How many families receive the harvest?", "Three families", ["Three families", "One family", "Ten families"]),
            ("What does Lena measure?", "The garden beds", ["The garden beds", "The rainfall", "The library"]),
        ],
        "Writing Challenge: A Helpful Idea": [
            ("Describe one benefit of your neighborhood idea.", "", []),
            ("Explain one step needed to make your idea happen.", "", []),
        ],
        "Comprehension Challenge: A New Library": [
            ("What other event does the library offer?", "A weekly story circle", ["A weekly story circle", "A sports match", "A cooking class"]),
            ("What is the library's new space designed for?", "Quiet study", ["Quiet study", "Sleeping", "Shopping"]),
        ],
    }
    for assessment in db.query(Assessment).all():
        existing_questions = {question.question_text for question in assessment.questions}
        for question_text, answer, choices in question_sets.get(assessment.title, []):
            if question_text in existing_questions:
                continue
            assessment.questions.append(Question(
                question_text=question_text,
                question_type="long_text" if not choices else "multiple_choice",
                marks=1,
                correct_answer=answer,
                options=[QuestionOption(option_text=choice, is_correct=choice == answer) for choice in choices],
            ))
        assessment.total_marks = sum(question.marks for question in assessment.questions)
        assessment.passing_marks = max(1, (assessment.total_marks + 1) // 2)


def seed_learning_content(db: Session) -> None:
    has_languages = db.query(Language).first() is not None
    languages = ensure_languages(db) if has_languages else []
    if has_languages and db.query(Assessment).count() >= 6:
        add_extra_questions(db)
        db.commit()
        return
    if has_languages:
        levels = db.query(Level).order_by(Level.minimum_score).all()
        advanced_level = levels[2]
        existing_types = {item.assessment_type for item in db.query(Assessment).filter(Assessment.level_id == advanced_level.id).all()}
        challenge_data = {
            "reading": ("Reading Challenge: City Garden", "Lena measures the garden beds, records the rainfall, and shares the harvest with three families. What does Lena record?", "The rainfall", ["The rainfall", "The bus schedule", "The family names"]),
            "writing": ("Writing Challenge: A Helpful Idea", "Write eight connected sentences explaining one idea that could improve your neighborhood.", "", []),
            "comprehension": ("Comprehension Challenge: A New Library", "The library opened a quiet study room and a weekly story circle. Why did the library create the study room?", "For quiet study", ["For quiet study", "For sports", "For cooking"]),
        }
        for assessment_type, (title, question_text, answer, choices) in challenge_data.items():
            if assessment_type not in existing_types:
                assessment = Assessment(title=title, description="A more challenging practice set. Read carefully before answering.", assessment_type=assessment_type, language=languages[0], level=advanced_level, total_marks=1, passing_marks=1)
                assessment.questions = [Question(question_text=question_text, question_type="long_text" if assessment_type == "writing" else "multiple_choice", marks=1, correct_answer=answer, options=[QuestionOption(option_text=choice, is_correct=choice == answer) for choice in choices])]
                db.add(assessment)
        db.commit()
        return
    languages = [Language(name=name, code=code) for name, code in LANGUAGE_DATA]
    levels = [
        Level(name="Beginner", description="Build confidence with everyday words and sentences.", minimum_score=0, maximum_score=39),
        Level(name="Elementary", description="Understand familiar topics and short texts.", minimum_score=40, maximum_score=59),
        Level(name="Intermediate", description="Communicate clearly about common experiences.", minimum_score=60, maximum_score=74),
        Level(name="Upper Intermediate", description="Follow detailed texts and express ideas naturally.", minimum_score=75, maximum_score=89),
        Level(name="Advanced", description="Work independently with nuanced language.", minimum_score=90, maximum_score=100),
    ]
    db.add_all(languages + levels)
    db.flush()
    beginner = levels[0]
    for language in languages:
        for module_number in range(1, 3):
            module = Module(language=language, level=beginner, title=f"{language.name} Foundations {module_number}", description="Practical language for daily reading and conversation.", order_number=module_number)
            for lesson_number in range(1, 4):
                lesson = Lesson(module=module, title=f"Lesson {lesson_number}: Everyday communication", description="Read, notice, and use useful phrases.", order_number=lesson_number, lesson_type="mixed")
                lesson.activities = [
                    Activity(title="Read the phrase", activity_type="reading", content="Read the example aloud twice.", order_number=1),
                    Activity(title="Notice the words", activity_type="vocabulary", content="Underline one new word and explain it.", order_number=2),
                    Activity(title="Write your answer", activity_type="writing", content="Write one sentence about your day.", order_number=3),
                ]
                greeting = {"en": "Hello, how are you?", "hi": "आप कैसे हैं?", "te": "మీరు ఎలా ఉన్నారు?"}.get(language.code, "Hello, how are you?")
                lesson.contents = [Content(title="A useful greeting", content_type="lesson", content=greeting, language=language)]
                module.lessons.append(lesson)
            db.add(module)
    reading = Assessment(title="Reading: A Morning Routine", description="Read the passage and answer each question.", assessment_type="reading", language=languages[0], level=beginner, total_marks=2, passing_marks=1)
    reading.questions = [Question(question_text="Ravi goes to school every morning. Where does Ravi go?", question_type="multiple_choice", marks=1, correct_answer="School", options=[QuestionOption(option_text=choice, is_correct=choice == "School") for choice in ["Park", "School", "Market", "Office"]]), Question(question_text="Ravi enjoys reading books. What does he enjoy?", question_type="multiple_choice", marks=1, correct_answer="Reading books", options=[QuestionOption(option_text=choice, is_correct=choice == "Reading books") for choice in ["Playing football", "Reading books"]])]
    writing = Assessment(title="Writing: My Family", description="Write five sentences about your family. Your response is saved for future evaluation.", assessment_type="writing", language=languages[0], level=beginner, total_marks=1, passing_marks=1)
    writing.questions = [Question(question_text="Write five sentences about your family.", question_type="long_text", marks=1, correct_answer="", options=[])]
    comprehension = Assessment(title="Comprehension: The Helpful Neighbor", description="Read a short passage and check your understanding.", assessment_type="comprehension", language=languages[0], level=beginner, total_marks=2, passing_marks=1)
    comprehension.questions = [Question(question_text="Maya shares vegetables with her neighbor. What does Maya share?", question_type="multiple_choice", marks=1, correct_answer="Vegetables", options=[QuestionOption(option_text=choice, is_correct=choice == "Vegetables") for choice in ["Books", "Vegetables", "Shoes"]]), Question(question_text="Why does Maya visit her neighbor?", question_type="multiple_choice", marks=1, correct_answer="To help", options=[QuestionOption(option_text=choice, is_correct=choice == "To help") for choice in ["To help", "To play a game"]])]
    db.add_all([reading, writing, comprehension])
    db.flush()
    add_extra_questions(db)
    db.commit()
