import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { learningApi } from '../services/learningApi'

const lessonContent = {
    en: {
        title: 'Everyday communication',
        questions: [
            { prompt: 'Which word means a friendly greeting?', options: ['Hello', 'Water', 'Book'], answer: 'Hello' },
            { prompt: 'Choose the correct sentence.', options: ['I am learning.', 'Learning am I.', 'Am I learning.'], answer: 'I am learning.' },
            { prompt: 'What do you say when you meet someone?', options: ['Nice to meet you', 'Good night forever', 'See you yesterday'], answer: 'Nice to meet you' },
        ],
    },
    hi: { title: 'रोज़मर्रा की बातचीत', questions: [{ prompt: '“नमस्ते” का अर्थ क्या है?', options: ['Hello', 'Thank you', 'Goodbye'], answer: 'Hello' }, { prompt: 'सही वाक्य चुनें।', options: ['मैं सीख रहा हूँ।', 'सीख रहा मैं।', 'हूँ मैं सीख।'], answer: 'मैं सीख रहा हूँ।' }, { prompt: 'धन्यवाद का अर्थ क्या है?', options: ['Thank you', 'Good morning', 'Welcome'], answer: 'Thank you' }] },
    kn: { title: 'ದೈನಂದಿನ ಸಂಭಾಷಣೆ', questions: [{ prompt: '“ನಮಸ್ಕಾರ” ಎಂದರೆ ಏನು?', options: ['Hello', 'Thank you', 'Goodbye'], answer: 'Hello' }, { prompt: 'ಸರಿಯಾದ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ.', options: ['ನಾನು ಕಲಿಯುತ್ತಿದ್ದೇನೆ.', 'ಕಲಿಯುತ್ತಿದ್ದೇನೆ ನಾನು.', 'ನಾನು ಕಲಿಯುತ್ತೇನೆನಾ.'], answer: 'ನಾನು ಕಲಿಯುತ್ತಿದ್ದೇನೆ.' }, { prompt: 'ಧನ್ಯವಾದಗಳು ಎಂದರೆ ಏನು?', options: ['Thank you', 'Good morning', 'Welcome'], answer: 'Thank you' }] },
    ta: { title: 'அன்றாட உரையாடல்', questions: [{ prompt: '“வணக்கம்” என்றால் என்ன?', options: ['Hello', 'Thank you', 'Goodbye'], answer: 'Hello' }, { prompt: 'சரியான வாக்கியத்தைத் தேர்ந்தெடுக்கவும்.', options: ['நான் கற்றுக்கொள்கிறேன்.', 'கற்றுக்கொள்கிறேன் நான்.', 'நான் கற்றுக்கொள்.'], answer: 'நான் கற்றுக்கொள்கிறேன்.' }, { prompt: 'நன்றி என்றால் என்ன?', options: ['Thank you', 'Good morning', 'Welcome'], answer: 'Thank you' }] },
    te: { title: 'రోజువారీ సంభాషణ', questions: [{ prompt: '“నమస్కారం” అంటే ఏమిటి?', options: ['Hello', 'Thank you', 'Goodbye'], answer: 'Hello' }, { prompt: 'సరైన వాక్యాన్ని ఎంచుకోండి.', options: ['నేను నేర్చుకుంటున్నాను.', 'నేర్చుకుంటున్నాను నేను.', 'నేను నేర్చుకో.'], answer: 'నేను నేర్చుకుంటున్నాను.' }, { prompt: 'ధన్యవాదాలు అంటే ఏమిటి?', options: ['Thank you', 'Good morning', 'Welcome'], answer: 'Thank you' }] },
}

const stageTitles = {
    en: ['Reading practice', 'Word forms', 'Comprehension and conversation'],
    hi: ['पठन अभ्यास', 'शब्द रूप', 'समझ और बातचीत'],
    kn: ['ಓದುವ ಅಭ್ಯಾಸ', 'ಪದ ರೂಪಗಳು', 'ಅರ್ಥಗ್ರಹಣ ಮತ್ತು ಸಂಭಾಷಣೆ'],
    ta: ['வாசிப்பு பயிற்சி', 'சொல் வடிவங்கள்', 'புரிதல் மற்றும் உரையாடல்'],
    te: ['చదవడం సాధన', 'పద రూపాలు', 'అవగాహన మరియు సంభాషణ'],
}

const sectionNames = {
    en: ['Reading', 'Word forms', 'Comprehension'],
    hi: ['पठन', 'शब्द रूप', 'समझ'],
    kn: ['ಓದುವಿಕೆ', 'ಪದ ರೂಪಗಳು', 'ಅರ್ಥಗ್ರಹಣ'],
    ta: ['வாசிப்பு', 'சொல் வடிவங்கள்', 'புரிதல்'],
    te: ['చదవడం', 'పద రూపాలు', 'అవగాహన'],
}

const getUnitDifficulty = (unitNumber) => {
    if (unitNumber <= 2) return 'Beginner'
    if (unitNumber <= 4) return 'Medium'
    return 'Hard'
}

const challengeQuestionsByLanguage = {
    en: [
        { type: 'arrange', prompt: 'Arrange the words to describe a past activity.', options: ['yesterday', 'I', 'studied'], answer: 'I studied yesterday' },
        { prompt: 'Which sentence gives a reason?', options: ['I stayed home because it rained.', 'I stayed home tomorrow.', 'I home stayed.'], answer: 'I stayed home because it rained.' },
    ],
    hi: [
        { type: 'arrange', prompt: 'बीते हुए काम का वर्णन करने के लिए शब्दों को लगाएँ।', options: ['कल', 'मैंने', 'पढ़ाई', 'की'], answer: 'मैंने कल पढ़ाई की' },
        { prompt: 'कारण बताने वाला वाक्य चुनें।', options: ['मैं घर पर रुका क्योंकि बारिश हुई।', 'मैं कल घर पर रुकूँगा।', 'मैं घर रुका।'], answer: 'मैं घर पर रुका क्योंकि बारिश हुई।' },
    ],
    kn: [
        { type: 'arrange', prompt: 'ಹಿಂದಿನ ಕೆಲಸವನ್ನು ವಿವರಿಸಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ.', options: ['ನಿನ್ನೆ', 'ನಾನು', 'ಓದಿದೆ'], answer: 'ನಾನು ನಿನ್ನೆ ಓದಿದೆ' },
        { prompt: 'ಕಾರಣವನ್ನು ಹೇಳುವ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ.', options: ['ಮಳೆ ಬಂದದ್ದರಿಂದ ನಾನು ಮನೆಯಲ್ಲೇ ಇದ್ದೆ.', 'ನಾನು ನಾಳೆ ಮನೆಯಲ್ಲಿರುತ್ತೇನೆ.', 'ನಾನು ಮನೆ ಇದ್ದೆ.'], answer: 'ಮಳೆ ಬಂದದ್ದರಿಂದ ನಾನು ಮನೆಯಲ್ಲೇ ಇದ್ದೆ.' },
    ],
    ta: [
        { type: 'arrange', prompt: 'கடந்த செயல்பாட்டை விவரிக்கும் சொற்களை அமைக்கவும்.', options: ['நேற்று', 'நான்', 'படித்தேன்'], answer: 'நான் நேற்று படித்தேன்' },
        { prompt: 'காரணத்தைக் கூறும் வாக்கியம் எது?', options: ['மழை பெய்ததால் நான் வீட்டில் இருந்தேன்.', 'நான் நாளை வீட்டில் இருப்பேன்.', 'நான் வீடு இருந்தேன்.'], answer: 'மழை பெய்ததால் நான் வீட்டில் இருந்தேன்.' },
    ],
    te: [
        { type: 'arrange', prompt: 'గత పనిని వివరించే పదాలను అమర్చండి.', options: ['నిన్న', 'నేను', 'చదివాను'], answer: 'నేను నిన్న చదివాను' },
        { prompt: 'కారణాన్ని తెలిపే వాక్యాన్ని ఎంచుకోండి.', options: ['వర్షం పడింది కాబట్టి నేను ఇంట్లో ఉన్నాను.', 'నేను రేపు ఇంట్లో ఉంటాను.', 'నేను ఇల్లు ఉన్నాను.'], answer: 'వర్షం పడింది కాబట్టి నేను ఇంట్లో ఉన్నాను.' },
    ],
}

const stageQuestions = [
    [
        { prompt: 'Which word means a friendly greeting?', options: ['Hello', 'Water', 'Book'], answer: 'Hello' },
        { type: 'write', prompt: 'Type the English word for a drink.', options: [], answer: 'Water' },
        { prompt: 'Which word is an object you can read?', options: ['Book', 'Happy', 'Walk'], answer: 'Book' },
    ],
    [
        { type: 'arrange', prompt: 'Arrange the words into a correct sentence.', options: ['am', 'I', 'learning'], answer: 'I am learning.' },
        { prompt: 'Complete: She ___ English every day.', options: ['learns', 'learning she', 'learn'], answer: 'learns' },
        { type: 'write', prompt: 'Type the sentence: We eat breakfast.', options: [], answer: 'We eat breakfast.' },
    ],
    [
        { prompt: 'What do you say when you meet someone?', options: ['Nice to meet you', 'Good night forever', 'See you yesterday'], answer: 'Nice to meet you' },
        { type: 'write', prompt: 'Type a polite reply to “Thank you”.', options: [], answer: 'You are welcome' },
        { prompt: 'How do you ask about someone’s day?', options: ['How was your day?', 'Where is your day?', 'Day you are?'], answer: 'How was your day?' },
    ],
]

const localizedStageQuestions = {
    hi: [
        [
            { prompt: 'दोस्ताना अभिवादन के लिए कौन-सा शब्द सही है?', options: ['नमस्ते', 'पानी', 'किताब'], answer: 'नमस्ते' },
            { type: 'write', prompt: 'पेय के लिए हिंदी शब्द लिखें।', options: [], answer: 'पानी' },
            { prompt: 'कौन-सी चीज़ पढ़ी जा सकती है?', options: ['किताब', 'खुश', 'चलना'], answer: 'किताब' },
        ],
        [
            { type: 'arrange', prompt: 'शब्दों को सही वाक्य में लगाएँ।', options: ['मैं', 'सीख', 'रहा', 'हूँ'], answer: 'मैं सीख रहा हूँ' },
            { prompt: 'सही वाक्य चुनें।', options: ['वह हर दिन सीखती है।', 'हर दिन वह सीखती।', 'सीखती हर दिन वह है।'], answer: 'वह हर दिन सीखती है।' },
            { type: 'write', prompt: 'यह वाक्य लिखें: हम नाश्ता करते हैं।', options: [], answer: 'हम नाश्ता करते हैं।' },
        ],
        [
            { prompt: 'किसी से पहली बार मिलने पर क्या कहेंगे?', options: ['आपसे मिलकर खुशी हुई', 'कल फिर मिलेंगे', 'शुभ रात्रि हमेशा'], answer: 'आपसे मिलकर खुशी हुई' },
            { type: 'write', prompt: '“धन्यवाद” का विनम्र उत्तर लिखें।', options: [], answer: 'आपका स्वागत है' },
            { prompt: 'किसी के दिन के बारे में कैसे पूछेंगे?', options: ['आपका दिन कैसा रहा?', 'आपका दिन कहाँ है?', 'दिन आप हैं?'], answer: 'आपका दिन कैसा रहा?' },
        ],
    ],
    kn: [
        [
            { prompt: 'ಸ್ನೇಹಪೂರ್ವಕ ಶುಭಾಶಯಕ್ಕೆ ಯಾವ ಪದ ಸರಿಯಾಗಿದೆ?', options: ['ನಮಸ್ಕಾರ', 'ನೀರು', 'ಪುಸ್ತಕ'], answer: 'ನಮಸ್ಕಾರ' },
            { type: 'write', prompt: 'ಪಾನೀಯಕ್ಕೆ ಕನ್ನಡ ಪದವನ್ನು ಬರೆಯಿರಿ.', options: [], answer: 'ನೀರು' },
            { prompt: 'ಓದಬಹುದಾದ ವಸ್ತು ಯಾವುದು?', options: ['ಪುಸ್ತಕ', 'ಸಂತೋಷ', 'ನಡೆಯಿರಿ'], answer: 'ಪುಸ್ತಕ' },
        ],
        [
            { type: 'arrange', prompt: 'ಪದಗಳನ್ನು ಸರಿಯಾದ ವಾಕ್ಯದಲ್ಲಿ ಜೋಡಿಸಿ.', options: ['ನಾನು', 'ಕಲಿಯುತ್ತಿದ್ದೇನೆ'], answer: 'ನಾನು ಕಲಿಯುತ್ತಿದ್ದೇನೆ' },
            { prompt: 'ಸರಿಯಾದ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ.', options: ['ಅವಳು ಪ್ರತಿದಿನ ಕಲಿಯುತ್ತಾಳೆ.', 'ಪ್ರತಿದಿನ ಅವಳು ಕಲಿಯುತ್ತಾಳೆ.', 'ಕಲಿಯುತ್ತಾಳೆ ಅವಳು ಪ್ರತಿದಿನ.'], answer: 'ಅವಳು ಪ್ರತಿದಿನ ಕಲಿಯುತ್ತಾಳೆ.' },
            { type: 'write', prompt: 'ಈ ವಾಕ್ಯವನ್ನು ಬರೆಯಿರಿ: ನಾವು ಉಪಾಹಾರ ತಿನ್ನುತ್ತೇವೆ.', options: [], answer: 'ನಾವು ಉಪಾಹಾರ ತಿನ್ನುತ್ತೇವೆ.' },
        ],
        [
            { prompt: 'ಮೊದಲ ಬಾರಿ ಭೇಟಿಯಾದಾಗ ಏನು ಹೇಳುತ್ತೀರಿ?', options: ['ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷವಾಯಿತು', 'ನಾಳೆ ಮತ್ತೆ ಸಿಗೋಣ', 'ಶುಭ ರಾತ್ರಿ ಎಂದೆಂದಿಗೂ'], answer: 'ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷವಾಯಿತು' },
            { type: 'write', prompt: '“ಧನ್ಯವಾದಗಳು” ಎಂಬುದಕ್ಕೆ ವಿನಯಪೂರ್ವಕ ಉತ್ತರ ಬರೆಯಿರಿ.', options: [], answer: 'ಸ್ವಾಗತ' },
            { prompt: 'ಯಾರಾದರೂ ದಿನದ ಬಗ್ಗೆ ಹೇಗೆ ಕೇಳುತ್ತೀರಿ?', options: ['ನಿಮ್ಮ ದಿನ ಹೇಗಿತ್ತು?', 'ನಿಮ್ಮ ದಿನ ಎಲ್ಲಿದೆ?', 'ದಿನ ನೀವು ಆಗಿದ್ದೀರಾ?'], answer: 'ನಿಮ್ಮ ದಿನ ಹೇಗಿತ್ತು?' },
        ],
    ],
    ta: [
        [
            { prompt: 'நட்பான வாழ்த்துக்கு சரியான சொல் எது?', options: ['வணக்கம்', 'தண்ணீர்', 'புத்தகம்'], answer: 'வணக்கம்' },
            { type: 'write', prompt: 'ஒரு பானத்திற்கான தமிழ் சொல்லை எழுதுங்கள்.', options: [], answer: 'தண்ணீர்' },
            { prompt: 'படிக்கக்கூடிய பொருள் எது?', options: ['புத்தகம்', 'மகிழ்ச்சி', 'நடக்கவும்'], answer: 'புத்தகம்' },
        ],
        [
            { type: 'arrange', prompt: 'சொற்களை சரியான வாக்கியமாக அமைக்கவும்.', options: ['நான்', 'கற்றுக்கொள்கிறேன்'], answer: 'நான் கற்றுக்கொள்கிறேன்' },
            { prompt: 'சரியான வாக்கியத்தைத் தேர்ந்தெடுக்கவும்.', options: ['அவள் தினமும் கற்றுக்கொள்கிறாள்.', 'தினமும் அவள் கற்றுக்கொள்.', 'கற்றுக்கொள்கிறாள் தினமும் அவள்.'], answer: 'அவள் தினமும் கற்றுக்கொள்கிறாள்.' },
            { type: 'write', prompt: 'இந்த வாக்கியத்தை எழுதுங்கள்: நாங்கள் காலை உணவு சாப்பிடுகிறோம்.', options: [], answer: 'நாங்கள் காலை உணவு சாப்பிடுகிறோம்.' },
        ],
        [
            { prompt: 'ஒருவரை முதன்முதலில் சந்திக்கும்போது என்ன சொல்வீர்கள்?', options: ['உங்களை சந்தித்ததில் மகிழ்ச்சி', 'நேற்று சந்திப்போம்', 'என்றும் இரவு வணக்கம்'], answer: 'உங்களை சந்தித்ததில் மகிழ்ச்சி' },
            { type: 'write', prompt: '“நன்றி” என்பதற்கு மரியாதையான பதிலை எழுதுங்கள்.', options: [], answer: 'பரவாயில்லை' },
            { prompt: 'ஒருவரின் நாளைப் பற்றி எப்படி கேட்பீர்கள்?', options: ['உங்கள் நாள் எப்படி இருந்தது?', 'உங்கள் நாள் எங்கே?', 'நாள் நீங்கள்?'], answer: 'உங்கள் நாள் எப்படி இருந்தது?' },
        ],
    ],
    te: [
        [
            { prompt: 'స్నేహపూర్వక అభివాదానికి సరైన పదం ఏది?', options: ['నమస్కారం', 'నీరు', 'పుస్తకం'], answer: 'నమస్కారం' },
            { type: 'write', prompt: 'పానీయానికి తెలుగు పదాన్ని రాయండి.', options: [], answer: 'నీరు' },
            { prompt: 'చదవగలిగే వస్తువు ఏది?', options: ['పుస్తకం', 'సంతోషం', 'నడవండి'], answer: 'పుస్తకం' },
        ],
        [
            { type: 'arrange', prompt: 'పదాలను సరైన వాక్యంగా అమర్చండి.', options: ['నేను', 'నేర్చుకుంటున్నాను'], answer: 'నేను నేర్చుకుంటున్నాను' },
            { prompt: 'సరైన వాక్యాన్ని ఎంచుకోండి.', options: ['ఆమె ప్రతిరోజూ నేర్చుకుంటుంది.', 'ప్రతిరోజూ ఆమె నేర్చుకుంటుంది.', 'నేర్చుకుంటుంది ప్రతిరోజూ ఆమె.'], answer: 'ఆమె ప్రతిరోజూ నేర్చుకుంటుంది.' },
            { type: 'write', prompt: 'ఈ వాక్యాన్ని రాయండి: మేము అల్పాహారం తింటాము.', options: [], answer: 'మేము అల్పాహారం తింటాము.' },
        ],
        [
            { prompt: 'ఎవరినైనా మొదటిసారి కలిసినప్పుడు ఏమి చెబుతారు?', options: ['మిమ్మల్ని కలవడం ఆనందంగా ఉంది', 'నిన్న కలుద్దాం', 'ఎప్పటికీ శుభ రాత్రి'], answer: 'మిమ్మల్ని కలవడం ఆనందంగా ఉంది' },
            { type: 'write', prompt: '“ధన్యవాదాలు”కు మర్యాదపూర్వక సమాధానం రాయండి.', options: [], answer: 'పర్వాలేదు' },
            { prompt: 'ఎవరైనా రోజు గురించి ఎలా అడుగుతారు?', options: ['మీ రోజు ఎలా గడిచింది?', 'మీ రోజు ఎక్కడ ఉంది?', 'రోజు మీరు?'], answer: 'మీ రోజు ఎలా గడిచింది?' },
        ],
    ],
}

const englishQuestionHints = {
    hi: [
        [
            ['Which word is a friendly greeting?', ['Hello', 'Water', 'Book']],
            ['Write the Hindi word for a drink.', []],
            ['Which thing can be read?', ['Book', 'Happy', 'Walk']],
        ],
        [
            ['Arrange the words into a correct sentence.', ['I', 'learn', 'am', ''],],
            ['Choose the correct sentence.', ['She learns every day.', 'Every day she learns.', 'She learns every day.']],
            ['Write this sentence: We eat breakfast.', []],
        ],
        [
            ['What do you say when meeting someone for the first time?', ['Nice to meet you', 'See you tomorrow', 'Good night forever']],
            ['Write a polite reply to “Thank you”.', []],
            ['How do you ask about someone’s day?', ['How was your day?', 'Where is your day?', 'Are you a day?']],
        ],
    ],
    kn: [
        [['Which word is a friendly greeting?', ['Hello', 'Water', 'Book']], ['Write the Kannada word for a drink.', []], ['Which thing can be read?', ['Book', 'Happy', 'Walk']]],
        [['Arrange the words into a correct sentence.', ['I', 'am learning']], ['Choose the correct sentence.', ['She learns every day.', 'Every day she learns.', 'She learns every day.']], ['Write this sentence: We eat breakfast.', []]],
        [['What do you say when meeting someone for the first time?', ['Nice to meet you', 'See you tomorrow', 'Good night forever']], ['Write a polite reply to “Thank you”.', []], ['How do you ask about someone’s day?', ['How was your day?', 'Where is your day?', 'Are you a day?']]],
    ],
    ta: [
        [['Which word is a friendly greeting?', ['Hello', 'Water', 'Book']], ['Write the Tamil word for a drink.', []], ['Which thing can be read?', ['Book', 'Happy', 'Walk']]],
        [['Arrange the words into a correct sentence.', ['I', 'am learning']], ['Choose the correct sentence.', ['She learns every day.', 'Every day she learns.', 'She learns every day.']], ['Write this sentence: We eat breakfast.', []]],
        [['What do you say when meeting someone for the first time?', ['Nice to meet you', 'See you tomorrow', 'Good night forever']], ['Write a polite reply to “Thank you”.', []], ['How do you ask about someone’s day?', ['How was your day?', 'Where is your day?', 'Are you a day?']]],
    ],
    te: [
        [['Which word is a friendly greeting?', ['Hello', 'Water', 'Book']], ['Write the Telugu word for a drink.', []], ['Which thing can be read?', ['Book', 'Happy', 'Walk']]],
        [['Arrange the words into a correct sentence.', ['I', 'am learning']], ['Choose the correct sentence.', ['She learns every day.', 'Every day she learns.', 'She learns every day.']], ['Write this sentence: We eat breakfast.', []]],
        [['What do you say when meeting someone for the first time?', ['Nice to meet you', 'See you tomorrow', 'Good night forever']], ['Write a polite reply to “Thank you”.', []], ['How do you ask about someone’s day?', ['How was your day?', 'Where is your day?', 'Are you a day?']]],
    ],
}

const additionalQuestionsByLanguage = {
    en: [
        { prompt: 'Which word describes a person who is glad?', options: ['Happy', 'Water', 'Walk'], answer: 'Happy' },
        { type: 'write', prompt: 'Type the English word for a place where you learn.', options: [], answer: 'School' },
        { type: 'arrange', prompt: 'Arrange the words into a greeting.', options: ['you', 'How', 'are'], answer: 'How are you' },
        { type: 'listen', prompt: 'Listen and choose what you hear.', spokenText: 'Can you help me?', options: ['Can you help me?', 'Help me now!', 'You help?'], answer: 'Can you help me?' },
        { type: 'speech', prompt: 'Say this sentence aloud: I am learning English.', options: [], answer: 'I am learning English.' },
        { type: 'write', prompt: 'Type one word you use every day.', options: [], answer: 'Hello' },
        { prompt: 'Which word means the opposite of goodbye?', options: ['Hello', 'Night', 'Book'], answer: 'Hello' },
    ],
    hi: [
        { prompt: 'खुश व्यक्ति के लिए सही शब्द कौन-सा है?', options: ['खुश', 'पानी', 'चलना'], answer: 'खुश' },
        { type: 'write', prompt: 'जहाँ आप सीखते हैं उस जगह का हिंदी शब्द लिखें।', options: [], answer: 'स्कूल' },
        { type: 'arrange', prompt: 'शब्दों को अभिवादन के रूप में लगाएँ।', options: ['आप', 'कैसे', 'हैं'], answer: 'आप कैसे हैं' },
        { type: 'listen', prompt: 'सुनकर सही वाक्य चुनें।', spokenText: 'क्या आप मेरी मदद कर सकते हैं?', options: ['क्या आप मेरी मदद कर सकते हैं?', 'अभी मेरी मदद करो!', 'आप मदद?'], answer: 'क्या आप मेरी मदद कर सकते हैं?' },
        { type: 'speech', prompt: 'यह वाक्य बोलें: मैं अंग्रेज़ी सीख रहा हूँ।', options: [], answer: 'मैं अंग्रेज़ी सीख रहा हूँ।' },
        { type: 'write', prompt: 'हर दिन उपयोग होने वाला एक शब्द लिखें।', options: [], answer: 'नमस्ते' },
        { prompt: 'अलविदा का विपरीत शब्द कौन-सा है?', options: ['नमस्ते', 'रात', 'किताब'], answer: 'नमस्ते' },
    ],
    kn: [
        { prompt: 'ಸಂತೋಷವಾಗಿರುವ ವ್ಯಕ್ತಿಗೆ ಸರಿಯಾದ ಪದ ಯಾವುದು?', options: ['ಸಂತೋಷ', 'ನೀರು', 'ನಡೆಯಿರಿ'], answer: 'ಸಂತೋಷ' },
        { type: 'write', prompt: 'ನೀವು ಕಲಿಯುವ ಸ್ಥಳದ ಕನ್ನಡ ಪದವನ್ನು ಬರೆಯಿರಿ.', options: [], answer: 'ಶಾಲೆ' },
        { type: 'arrange', prompt: 'ಪದಗಳನ್ನು ಶುಭಾಶಯವಾಗಿ ಜೋಡಿಸಿ.', options: ['ನೀವು', 'ಹೇಗಿದ್ದೀರಿ'], answer: 'ನೀವು ಹೇಗಿದ್ದೀರಿ' },
        { type: 'listen', prompt: 'ಕೇಳಿ ಮತ್ತು ಸರಿಯಾದ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ.', spokenText: 'ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?', options: ['ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?', 'ಈಗ ಸಹಾಯ ಮಾಡಿ!', 'ನೀವು ಸಹಾಯ?'], answer: 'ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?' },
        { type: 'speech', prompt: 'ಈ ವಾಕ್ಯವನ್ನು ಹೇಳಿ: ನಾನು ಇಂಗ್ಲಿಷ್ ಕಲಿಯುತ್ತಿದ್ದೇನೆ.', options: [], answer: 'ನಾನು ಇಂಗ್ಲಿಷ್ ಕಲಿಯುತ್ತಿದ್ದೇನೆ.' },
        { type: 'write', prompt: 'ಪ್ರತಿದಿನ ಬಳಸುವ ಒಂದು ಪದವನ್ನು ಬರೆಯಿರಿ.', options: [], answer: 'ನಮಸ್ಕಾರ' },
        { prompt: 'ವಿದಾಯದ ವಿರುದ್ಧ ಪದ ಯಾವುದು?', options: ['ನಮಸ್ಕಾರ', 'ರಾತ್ರಿ', 'ಪುಸ್ತಕ'], answer: 'ನಮಸ್ಕಾರ' },
    ],
    ta: [
        { prompt: 'மகிழ்ச்சியான நபருக்கான சரியான சொல் எது?', options: ['மகிழ்ச்சி', 'தண்ணீர்', 'நடக்கவும்'], answer: 'மகிழ்ச்சி' },
        { type: 'write', prompt: 'நீங்கள் கற்கும் இடத்திற்கான தமிழ் சொல்லை எழுதுங்கள்.', options: [], answer: 'பள்ளி' },
        { type: 'arrange', prompt: 'சொற்களை வாழ்த்தாக அமைக்கவும்.', options: ['நீங்கள்', 'எப்படி', 'இருக்கிறீர்கள்'], answer: 'நீங்கள் எப்படி இருக்கிறீர்கள்' },
        { type: 'listen', prompt: 'கேட்டு சரியான வாக்கியத்தைத் தேர்ந்தெடுக்கவும்.', spokenText: 'நீங்கள் எனக்கு உதவ முடியுமா?', options: ['நீங்கள் எனக்கு உதவ முடியுமா?', 'இப்போது உதவி செய்!', 'நீங்கள் உதவி?'], answer: 'நீங்கள் எனக்கு உதவ முடியுமா?' },
        { type: 'speech', prompt: 'இந்த வாக்கியத்தைச் சொல்லுங்கள்: நான் ஆங்கிலம் கற்கிறேன்.', options: [], answer: 'நான் ஆங்கிலம் கற்கிறேன்.' },
        { type: 'write', prompt: 'தினமும் பயன்படுத்தும் ஒரு சொல்லை எழுதுங்கள்.', options: [], answer: 'வணக்கம்' },
        { prompt: 'விடைபெறுதலுக்கு எதிர்ச்சொல் எது?', options: ['வணக்கம்', 'இரவு', 'புத்தகம்'], answer: 'வணக்கம்' },
    ],
    te: [
        { prompt: 'సంతోషంగా ఉన్న వ్యక్తికి సరైన పదం ఏది?', options: ['సంతోషం', 'నీరు', 'నడవండి'], answer: 'సంతోషం' },
        { type: 'write', prompt: 'మీరు నేర్చుకునే ప్రదేశానికి తెలుగు పదాన్ని రాయండి.', options: [], answer: 'పాఠశాల' },
        { type: 'arrange', prompt: 'పదాలను అభివాదంగా అమర్చండి.', options: ['మీరు', 'ఎలా', 'ఉన్నారు'], answer: 'మీరు ఎలా ఉన్నారు' },
        { type: 'listen', prompt: 'విని సరైన వాక్యాన్ని ఎంచుకోండి.', spokenText: 'మీరు నాకు సహాయం చేయగలరా?', options: ['మీరు నాకు సహాయం చేయగలరా?', 'ఇప్పుడు సహాయం చేయి!', 'మీరు సహాయం?'], answer: 'మీరు నాకు సహాయం చేయగలరా?' },
        { type: 'speech', prompt: 'ఈ వాక్యాన్ని చెప్పండి: నేను ఇంగ్లీష్ నేర్చుకుంటున్నాను.', options: [], answer: 'నేను ఇంగ్లీష్ నేర్చుకుంటున్నాను.' },
        { type: 'write', prompt: 'ప్రతిరోజూ ఉపయోగించే ఒక పదాన్ని రాయండి.', options: [], answer: 'నమస్కారం' },
        { prompt: 'వీడ్కోలుకు వ్యతిరేక పదం ఏది?', options: ['నమస్కారం', 'రాత్రి', 'పుస్తకం'], answer: 'నమస్కారం' },
    ],
}

const unitTopics = {
    en: ['Greetings', 'Family', 'Food', 'Daily routines', 'Travel', 'Shopping', 'Work and study', 'Plans'],
    hi: ['अभिवादन', 'परिवार', 'खाना', 'दैनिक दिनचर्या', 'यात्रा', 'खरीदारी', 'काम और पढ़ाई', 'योजनाएँ'],
    kn: ['ಶುಭಾಶಯಗಳು', 'ಕುಟುಂಬ', 'ಆಹಾರ', 'ದೈನಂದಿನ ದಿನಚರಿ', 'ಪ್ರಯಾಣ', 'ಖರೀದಿ', 'ಕೆಲಸ ಮತ್ತು ಅಧ್ಯಯನ', 'ಯೋಜನೆಗಳು'],
    ta: ['வாழ்த்துகள்', 'குடும்பம்', 'உணவு', 'அன்றாட பழக்கங்கள்', 'பயணம்', 'கடைக்குச் செல்வது', 'வேலை மற்றும் படிப்பு', 'திட்டங்கள்'],
    te: ['అభివాదాలు', 'కుటుంబం', 'ఆహారం', 'రోజువారీ పనులు', 'ప్రయాణం', 'కొనుగోలు', 'పని మరియు చదువు', 'ప్రణాళికలు'],
}

const englishTopicNames = ['Greetings', 'Family', 'Food', 'Daily routines', 'Travel', 'Shopping', 'Work and study', 'Plans']

const formatApiError = (error, fallback = 'Something went wrong.') => {
    const detail = error?.response?.data?.detail

    if (Array.isArray(detail)) {
        const items = detail.map((item) => {
            if (typeof item === 'string') return item
            if (typeof item === 'object' && item) {
                return item.msg || item.error || JSON.stringify(item)
            }
            return String(item)
        })
        return items.join(', ') || fallback
    }

    if (typeof detail === 'object' && detail) {
        if (detail.msg) return detail.msg
        if (detail.error) return detail.error
        return JSON.stringify(detail)
    }

    return detail || fallback
}

const shuffleWithSeed = (items, seed) => {
    const result = [...items]
    let value = seed
    for (let index = result.length - 1; index > 0; index -= 1) {
        value = (value * 9301 + 49297) % 233280
        const swapIndex = Math.floor((value / 233280) * (index + 1))
            ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
    }
    return result
}

const languageQuestionOffsets = { en: 0, hi: 2, kn: 4, ta: 6, te: 8 }
const QUESTIONS_PER_UNIT = 5

const rotateQuestions = (questions, languageCode) => {
    const offset = (languageQuestionOffsets[languageCode] || 0) % questions.length
    return [...questions.slice(offset), ...questions.slice(0, offset)]
}

const getUnitQuestionSet = (questions, lessonStep) => {
    if (!questions.length) return []
    const start = (lessonStep * 3) % questions.length
    return Array.from({ length: QUESTIONS_PER_UNIT }, (_, index) => questions[(start + index) % questions.length])
}

const shuffleQuestionOptions = (questions, seed) => questions.map((question, questionIndex) => ({
    ...question,
    options: question.options ? shuffleWithSeed(question.options, seed + questionIndex * 19) : question.options,
}))

const getUnitQuestions = (languageCode, lessonStep, unitNumber, learnerId) => {
    const numericUnit = Number(unitNumber)
    const difficulty = getUnitDifficulty(numericUnit)
    const languageQuestions = [
        ...(localizedStageQuestions[languageCode]?.[lessonStep] || stageQuestions[lessonStep]),
        ...(additionalQuestionsByLanguage[languageCode] || additionalQuestionsByLanguage.en),
    ]
    const questionsForUnit = getUnitQuestionSet(rotateQuestions(
        difficulty === 'Hard'
            ? [...languageQuestions, ...(challengeQuestionsByLanguage[languageCode] || challengeQuestionsByLanguage.en)]
            : languageQuestions,
        languageCode,
    ), lessonStep)
    const englishQuestions = shuffleQuestionOptions(getUnitQuestionSet(rotateQuestions([
        ...stageQuestions[lessonStep],
        ...additionalQuestionsByLanguage.en,
        ...(difficulty === 'Hard' ? challengeQuestionsByLanguage.en : []),
    ], languageCode), lessonStep), numericUnit * 97 + lessonStep * 31)
    const topic = (unitTopics[languageCode] || unitTopics.en)[(numericUnit - 1) % 8]
    const englishTopic = englishTopicNames[(numericUnit - 1) % 8]
    const uniqueQuestions = shuffleQuestionOptions(questionsForUnit, numericUnit * 97 + lessonStep * 31).map((question, index) => ({
        ...question,
        prompt: `${topic}: ${question.prompt}`,
        englishPrompt: `${englishTopic}: ${englishQuestions[index].prompt}`,
        englishOptions: englishQuestions[index].options || [],
        difficulty,
        section: lessonStep + 1,
    }))
    const storageKey = `neolit_lesson_question_order_${learnerId || 'guest'}_${languageCode}_${numericUnit}_${lessonStep}_${difficulty}`

    try {
        const savedPrompts = JSON.parse(localStorage.getItem(storageKey) || 'null')
        if (Array.isArray(savedPrompts) && savedPrompts.length === uniqueQuestions.length) {
            const savedQuestions = savedPrompts.map((prompt) => uniqueQuestions.find((item) => item.prompt === prompt)).filter(Boolean)
            if (savedQuestions.length === uniqueQuestions.length) return savedQuestions
        }
    } catch {
        // Use a deterministic order when saved lesson state is unavailable.
    }

    const shuffledQuestions = shuffleWithSeed(uniqueQuestions, numericUnit * 31 + lessonStep * 17)
    localStorage.setItem(storageKey, JSON.stringify(shuffledQuestions.map((question) => question.prompt)))
    return shuffledQuestions
}

export default function UnitLessonPage() {
    const { unit = '1' } = useParams()
    const [searchParams] = useSearchParams()
    const lessonStep = Math.min(2, Math.max(0, Number(searchParams.get('step') || 0)))
    const [languageCode, setLanguageCode] = useState('en')
    const [languageName, setLanguageName] = useState('English')
    const [learnerId, setLearnerId] = useState('')
    const [questionIndex, setQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [textAnswer, setTextAnswer] = useState('')
    const [selectedTokens, setSelectedTokens] = useState([])
    const [score, setScore] = useState(0)
    const [finished, setFinished] = useState(false)
    const [blocked, setBlocked] = useState(false)
    const [learningState, setLearningState] = useState(null)
    const [submitError, setSubmitError] = useState('')
    const [savingLesson, setSavingLesson] = useState(false)
    const [listening, setListening] = useState(false)
    const [speaking, setSpeaking] = useState(false)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const [profile, languages, state] = await Promise.all([learningApi.getProfile(), learningApi.getLanguages(), learningApi.getLearningState()])
                setLearningState(state)
                setLearnerId(String(profile.user_id || ''))
                const persistedCourseCode = localStorage.getItem('neolit_selected_language')
                const code = lessonContent[profile.learning_language]
                    ? profile.learning_language
                    : lessonContent[persistedCourseCode]
                        ? persistedCourseCode
                        : 'en'
                localStorage.setItem('neolit_selected_language', code)
                setLanguageCode(code)
                setLanguageName(languages.find((language) => language.code === code)?.name || 'English')
                if (Number(unit) > 1) {
                    const previousUnit = (state.completions || []).filter((completion) => completion.language_code === code && completion.unit_number === Number(unit) - 1)
                    setBlocked(previousUnit.length < 3)
                }
            } catch {
                setLanguageCode('en')
            }
        }
        loadProfile()
    }, [])

    const baseContent = lessonContent[languageCode]
    const content = {
        ...baseContent,
        title: stageTitles[languageCode]?.[lessonStep] || stageTitles.en[lessonStep],
        questions: getUnitQuestions(languageCode, lessonStep, unit, learnerId),
    }
    const question = content.questions[questionIndex]
    const chooseAnswer = (answer) => {
        if (selectedAnswer) return
        setSelectedAnswer(answer)
        if (answer === question.answer) setScore((current) => current + 1)
    }

    const submitAnswer = () => {
        if (selectedAnswer) return
        const answer = question.type === 'write' || question.type === 'speech' ? textAnswer.trim() : selectedTokens.join(' ')
        if (!answer) return
        chooseAnswer(answer)
    }

    const playQuestionAudio = () => {
        if (!question.spokenText || !('speechSynthesis' in window)) {
            setSubmitError('Audio playback is not supported in this browser.')
            return
        }
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(question.spokenText)
        utterance.lang = languageCode === 'en' ? 'en-US' : `${languageCode}-IN`
        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => {
            setSpeaking(false)
            setSubmitError('We could not play the audio. Please try again.')
        }
        window.speechSynthesis.speak(utterance)
    }

    const startSpeechAnswer = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setSubmitError('Speech input is not supported in this browser. Please type your answer.')
            return
        }
        const recognition = new SpeechRecognition()
        recognition.lang = languageCode === 'en' ? 'en-US' : `${languageCode}-IN`
        recognition.interimResults = false
        recognition.maxAlternatives = 1
        setListening(true)
        recognition.onresult = (event) => setTextAnswer(event.results[0][0].transcript)
        recognition.onerror = () => setSubmitError('We could not hear your answer. Please try again.')
        recognition.onend = () => setListening(false)
        recognition.start()
    }

    const nextQuestion = async () => {
        if (savingLesson) return

        if (questionIndex === content.questions.length - 1) {
            setSubmitError('')
            setSavingLesson(true)
            try {
                const completionScore = score > 0
                    ? Math.min(3, Math.max(1, Math.round((score / content.questions.length) * 3)))
                    : 0
                const state = await learningApi.completeLesson({
                    language_code: languageCode,
                    unit_number: Number(unit),
                    lesson_step: lessonStep,
                    score: completionScore,
                })
                setLearningState(state)
                setFinished(true)
            } catch (error) {
                setSubmitError(formatApiError(error, 'Unable to save lesson progress'))
            } finally {
                setSavingLesson(false)
            }
            return
        }
        setQuestionIndex((current) => current + 1)
        setSelectedAnswer(null)
        setTextAnswer('')
        setSelectedTokens([])
        setSpeaking(false)
    }

    return (
        <div className="duolingo-page-shell">
            <header className="duolingo-page-header">
                <div className="duolingo-page-brand">
                    <span className="duolingo-page-badge">N</span>
                    <strong>NeoLit</strong>
                </div>
                <nav className="duolingo-page-nav" aria-label="Lesson navigation">
                    <span className="duolingo-page-nav-item active">Learn</span>
                    <span className="duolingo-page-nav-item">Journey</span>
                </nav>
                <div className="duolingo-page-actions">
                    <span className="duolingo-page-action">♥ {learningState?.hearts ?? 5}</span>
                    <Link to="/dashboard" className="duolingo-page-close" aria-label="Exit lesson">×</Link>
                </div>
            </header>

            <div className="unit-lesson-page">
                <header className="unit-lesson-header">
                    <Link to="/dashboard" className="unit-lesson-close" aria-label="Exit lesson">×</Link>
                    <div className="unit-lesson-progress"><i style={{ width: `${((questionIndex + (selectedAnswer ? 1 : 0)) / content.questions.length) * 100}%` }} /></div>
                    <span className="unit-lesson-hearts">♥ {learningState?.hearts ?? 5}</span>
                </header>

                <main className="unit-lesson-main">
                    {blocked ? (
                        <section className="unit-complete-card">
                            <div className="unit-complete-icon">🔒</div>
                            <div className="unit-lesson-meta">UNIT {unit} LOCKED</div>
                            <h1>Finish the previous unit first</h1>
                            <p>Complete all three lessons in Unit {Number(unit) - 1} to unlock this unit.</p>
                            <Link to="/dashboard" className="unit-next-button">BACK TO LEARN</Link>
                        </section>
                    ) : !finished ? (
                        <>
                            <div className="unit-lesson-meta">SECTION {lessonStep + 1} • {sectionNames[languageCode]?.[lessonStep] || sectionNames.en[lessonStep]} • UNIT {unit} • {question.difficulty.toUpperCase()} • {languageName.toUpperCase()}</div>
                            <h1>{content.title}</h1>
                            <p className="unit-lesson-question-count">Question {questionIndex + 1} of {content.questions.length}</p>
                            <section className="unit-question-card">
                                <h2>{question.prompt}</h2>
                                {question.englishPrompt && languageCode !== 'en' && <p className="question-english-help">English: {question.englishPrompt}</p>}
                                {question.type === 'listen' ? (
                                    <div className="unit-listen-question">
                                        <button type="button" className="unit-audio-button" onClick={playQuestionAudio} disabled={speaking || Boolean(selectedAnswer)}>
                                            <span aria-hidden="true">{speaking ? '◼' : '▶'}</span>
                                            {speaking ? 'PLAYING...' : 'PLAY AUDIO'}
                                        </button>
                                        <p className="unit-listen-hint">Listen carefully, then choose the sentence you hear.</p>
                                        <div className="unit-answer-list">
                                            {question.options.map((option, optionIndex) => (
                                                <button key={option} type="button" className={selectedAnswer === option ? (option === question.answer ? 'correct' : 'wrong') : ''} onClick={() => chooseAnswer(option)}>
                                                    {option}
                                                    {languageCode !== 'en' && question.englishOptions[optionIndex] && <small className="option-english-help">English: {question.englishOptions[optionIndex]}</small>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : question.type === 'write' || question.type === 'speech' ? (
                                    <div className="unit-write-answer">
                                        <input value={textAnswer} onChange={(event) => setTextAnswer(event.target.value)} placeholder={question.type === 'speech' ? 'Speak or type your answer' : 'Type your answer'} disabled={Boolean(selectedAnswer)} onKeyDown={(event) => { if (event.key === 'Enter') submitAnswer() }} />
                                        {question.type === 'speech' && <button type="button" onClick={startSpeechAnswer} disabled={listening || Boolean(selectedAnswer)}>{listening ? 'LISTENING...' : '🎙 SPEAK'}</button>}
                                        <button type="button" onClick={submitAnswer} disabled={!textAnswer.trim() || Boolean(selectedAnswer)}>CHECK</button>
                                    </div>
                                ) : question.type === 'arrange' ? (
                                    <div className="unit-arrange-answer">
                                        <div className="unit-selected-tokens">{selectedTokens.length ? selectedTokens.join(' ') : 'Select the words below'}</div>
                                        <div className="unit-token-list">
                                            {question.options.map((option, optionIndex) => (
                                                <button key={option} type="button" disabled={selectedTokens.includes(option) || Boolean(selectedAnswer)} onClick={() => setSelectedTokens((tokens) => [...tokens, option])}>
                                                    {option}
                                                    {languageCode !== 'en' && question.englishOptions[optionIndex] && <small className="option-english-help">English: {question.englishOptions[optionIndex]}</small>}
                                                </button>
                                            ))}
                                        </div>
                                        <button type="button" className="unit-check-arrangement" onClick={submitAnswer} disabled={!selectedTokens.length || Boolean(selectedAnswer)}>CHECK ORDER</button>
                                    </div>
                                ) : (
                                    <div className="unit-answer-list">
                                        {question.options.map((option, optionIndex) => (
                                            <button key={option} type="button" className={selectedAnswer === option ? (option === question.answer ? 'correct' : 'wrong') : ''} onClick={() => chooseAnswer(option)}>
                                                {option}
                                                {languageCode !== 'en' && question.englishOptions[optionIndex] && <small className="option-english-help">English: {question.englishOptions[optionIndex]}</small>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedAnswer && <p className={selectedAnswer === question.answer ? 'unit-answer-feedback correct' : 'unit-answer-feedback wrong'}>{selectedAnswer === question.answer ? 'Correct! +10 XP' : `The answer is: ${question.answer}`}</p>}
                            </section>
                            {submitError && <p className="unit-answer-feedback wrong">{submitError}</p>}
                            <button type="button" className="unit-next-button" disabled={!selectedAnswer || savingLesson} onClick={nextQuestion}>{savingLesson ? 'SAVING...' : questionIndex === content.questions.length - 1 ? 'FINISH LESSON' : 'CONTINUE'}</button>
                        </>
                    ) : (
                        <section className="unit-complete-card">
                            <div className="unit-complete-icon">✓</div>
                            <div className="unit-lesson-meta">UNIT {unit} COMPLETE</div>
                            <h1>Great work!</h1>
                            <p>You scored {score} out of {content.questions.length} in {languageName}.</p>
                            <div className="unit-complete-stats"><strong>+{score * 10} XP</strong><span>♥ {learningState?.hearts ?? 5} hearts left</span></div>
                            <p style={{ margin: '0.5rem 0 1rem', color: '#b7d9cb' }}>Ready for the next step? Keep your streak going.</p>
                            {lessonStep < 2 ? <Link to={`/lesson/${unit}?step=${lessonStep + 1}`} className="unit-next-button">CONTINUE LESSON</Link> : <Link to="/dashboard" className="unit-next-button">BACK TO LEARN</Link>}
                        </section>
                    )}
                </main>
            </div>
        </div>
    )
}
