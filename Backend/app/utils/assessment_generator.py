from app.models.learning import Assessment, Question, QuestionOption


QUESTION_TEMPLATES = {
    "en": [
        ("Which word means a warm drink?", "coffee", ["coffee", "window", "garden"]),
        ("Which word describes a place where books are kept?", "library", ["library", "kitchen", "station"]),
        ("Choose the correct word for a person who teaches.", "teacher", ["teacher", "driver", "farmer"]),
        ("Which word means the opposite of empty?", "full", ["full", "quiet", "early"]),
        ("Choose the word for a journey by airplane.", "flight", ["flight", "letter", "garden"]),
    ],
    "hi": [
        ("गर्म पेय के लिए सही शब्द कौन-सा है?", "कॉफी", ["कॉफी", "खिड़की", "बगीचा"]),
        ("किताबें रखने की जगह कौन-सी है?", "पुस्तकालय", ["पुस्तकालय", "रसोई", "स्टेशन"]),
        ("पढ़ाने वाले व्यक्ति के लिए सही शब्द चुनें।", "शिक्षक", ["शिक्षक", "चालक", "किसान"]),
        ("खाली का विपरीत शब्द कौन-सा है?", "भरा हुआ", ["भरा हुआ", "शांत", "जल्दी"]),
        ("हवाई जहाज़ की यात्रा के लिए सही शब्द चुनें।", "उड़ान", ["उड़ान", "पत्र", "बगीचा"]),
    ],
    "kn": [
        ("ಬಿಸಿ ಪಾನೀಯಕ್ಕೆ ಸರಿಯಾದ ಪದ ಯಾವುದು?", "ಕಾಫಿ", ["ಕಾಫಿ", "ಕಿಟಕಿ", "ತೋಟ"]),
        ("ಪುಸ್ತಕಗಳನ್ನು ಇಡುವ ಸ್ಥಳ ಯಾವುದು?", "ಗ್ರಂಥಾಲಯ", ["ಗ್ರಂಥಾಲಯ", "ಅಡುಗೆಮನೆ", "ನಿಲ್ದಾಣ"]),
        ("ಕಲಿಸುವ ವ್ಯಕ್ತಿಗೆ ಸರಿಯಾದ ಪದವನ್ನು ಆರಿಸಿ.", "ಶಿಕ್ಷಕ", ["ಶಿಕ್ಷಕ", "ಚಾಲಕ", "ರೈತ"]),
        ("ಖಾಲಿ ಎಂಬುದಕ್ಕೆ ವಿರುದ್ಧ ಪದ ಯಾವುದು?", "ತುಂಬಿದ", ["ತುಂಬಿದ", "ಶಾಂತ", "ಬೇಗ"]),
        ("ವಿಮಾನ ಪ್ರಯಾಣಕ್ಕೆ ಸರಿಯಾದ ಪದ ಯಾವುದು?", "ವಿಮಾನಯಾನ", ["ವಿಮಾನಯಾನ", "ಪತ್ರ", "ತೋಟ"]),
    ],
    "ta": [
        ("சூடான பானத்திற்கான சரியான சொல் எது?", "காபி", ["காபி", "ஜன்னல்", "தோட்டம்"]),
        ("புத்தகங்கள் வைக்கப்படும் இடம் எது?", "நூலகம்", ["நூலகம்", "சமையலறை", "நிலையம்"]),
        ("கற்பிக்கும் நபருக்கான சரியான சொல்லைத் தேர்ந்தெடுக்கவும்.", "ஆசிரியர்", ["ஆசிரியர்", "ஓட்டுநர்", "விவசாயி"]),
        ("காலி என்பதற்கு எதிர்ச்சொல் எது?", "நிறைந்த", ["நிறைந்த", "அமைதியான", "விரைவான"]),
        ("விமானப் பயணத்திற்கான சரியான சொல் எது?", "விமானப் பயணம்", ["விமானப் பயணம்", "கடிதம்", "தோட்டம்"]),
    ],
    "te": [
        ("వేడి పానీయానికి సరైన పదం ఏది?", "కాఫీ", ["కాఫీ", "కిటికీ", "తోట"]),
        ("పుస్తకాలు ఉంచే ప్రదేశం ఏది?", "గ్రంథాలయం", ["గ్రంథాలయం", "వంటగది", "స్టేషన్"]),
        ("బోధించే వ్యక్తికి సరైన పదాన్ని ఎంచుకోండి.", "ఉపాధ్యాయుడు", ["ఉపాధ్యాయుడు", "డ్రైవర్", "రైతు"]),
        ("ఖాళీకి వ్యతిరేక పదం ఏది?", "నిండిన", ["నిండిన", "నిశ్శబ్దం", "త్వరగా"]),
        ("విమాన ప్రయాణానికి సరైన పదం ఏది?", "విమాన ప్రయాణం", ["విమాన ప్రయాణం", "లేఖ", "తోట"]),
    ],
}

TARGET_QUESTION_COUNT = 15


def ensure_generated_questions(assessment: Assessment) -> bool:
    language_code = assessment.language.code if assessment.language else "en"
    templates = QUESTION_TEMPLATES.get(language_code, QUESTION_TEMPLATES["en"])
    existing_prompts = {question.question_text for question in assessment.questions}
    available = [template for template in templates if template[0] not in existing_prompts]
    needed = max(0, TARGET_QUESTION_COUNT - len(assessment.questions))

    for question_text, answer, choices in available[:needed]:
        assessment.questions.append(Question(
            question_text=question_text,
            question_type="multiple_choice",
            marks=1,
            correct_answer=answer,
            options=[QuestionOption(option_text=choice, is_correct=choice == answer) for choice in choices],
        ))

    changed = len(assessment.questions) > len(existing_prompts)
    if changed:
        assessment.total_marks = sum(question.marks for question in assessment.questions)
        assessment.passing_marks = max(1, (assessment.total_marks + 1) // 2)
    return changed
