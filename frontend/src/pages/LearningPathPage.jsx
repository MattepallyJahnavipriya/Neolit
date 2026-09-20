import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { languages } from '../data/languages'
import { learningApi } from '../services/learningApi'

const knowledgeLevelsByLanguage = {
    en: [
        { id: 1, label: "I'm new to English" },
        { id: 2, label: 'I know some common words' },
        { id: 3, label: 'I can have basic conversations' },
        { id: 4, label: 'I can talk about various topics' },
        { id: 5, label: 'I can discuss most topics in detail' },
    ],
    hi: [
        { id: 1, label: "I'm new to Hindi" },
        { id: 2, label: 'I know some common words' },
        { id: 3, label: 'I can have basic conversations' },
        { id: 4, label: 'I can talk about various topics' },
        { id: 5, label: 'I can discuss most topics in detail' },
    ],
    kn: [
        { id: 1, label: "I'm new to Kannada" },
        { id: 2, label: 'I know some common words' },
        { id: 3, label: 'I can have basic conversations' },
        { id: 4, label: 'I can talk about various topics' },
        { id: 5, label: 'I can discuss most topics in detail' },
    ],
    ta: [
        { id: 1, label: "I'm new to Tamil" },
        { id: 2, label: 'I know some common words' },
        { id: 3, label: 'I can have basic conversations' },
        { id: 4, label: 'I can talk about various topics' },
        { id: 5, label: 'I can discuss most topics in detail' },
    ],
    te: [
        { id: 1, label: "I'm new to Telugu" },
        { id: 2, label: 'I know some common words' },
        { id: 3, label: 'I can have basic conversations' },
        { id: 4, label: 'I can talk about various topics' },
        { id: 5, label: 'I can discuss most topics in detail' },
    ],
}

const getRouteOptions = (languageName) => [
    {
        id: 'scratch',
        title: 'Start from scratch',
        description: `Take the easiest lesson of the ${languageName} course`,
        badge: '1',
        badgeColor: 'gold',
    },
    {
        id: 'level',
        title: 'Find my level',
        description: `Let ${languageName} lessons recommend where you should start learning`,
        badge: '2',
        badgeColor: 'blue',
    },
]

const lessonBankByLanguage = {
    hi: [
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Apple”?',
            options: [
                { id: 1, label: 'सेब', emoji: '🍎', accent: 'red' },
                { id: 2, label: 'केला', emoji: '🍌', accent: 'yellow' },
                { id: 3, label: 'किताब', emoji: '📘', accent: 'blue' },
                { id: 4, label: 'आँर', emoji: '🧑‍🌾', accent: 'amber' },
                { id: 5, label: 'साड़ी', emoji: '👗', accent: 'pink' },
            ],
            correctOption: 1,
            solution: 'सेब',
        },
        {

            extraChoiceQuestionsByLanguage: {
                en: [
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'Which one of these is “Coffee”?',
                        options: [
                            { id: 1, label: 'coffee', emoji: '☕', accent: 'brown' },
                            { id: 2, label: 'juice', emoji: '🧃', accent: 'orange' },
                            { id: 3, label: 'milk', emoji: '🥛', accent: 'blue' },
                            { id: 4, label: 'soup', emoji: '🍲', accent: 'amber' },
                            { id: 5, label: 'rice', emoji: '🍚', accent: 'green' },
                        ],
                        correctOption: 1,
                        solution: 'coffee',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'Which one of these is “Window”?',
                        options: [
                            { id: 1, label: 'wall', emoji: '🧱', accent: 'red' },
                            { id: 2, label: 'window', emoji: '🪟', accent: 'blue' },
                            { id: 3, label: 'floor', emoji: '🟫', accent: 'brown' },
                            { id: 4, label: 'roof', emoji: '🏠', accent: 'orange' },
                            { id: 5, label: 'gate', emoji: '🚪', accent: 'purple' },
                        ],
                        correctOption: 2,
                        solution: 'window',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'Which one of these is “Morning”?',
                        options: [
                            { id: 1, label: 'night', emoji: '🌙', accent: 'purple' },
                            { id: 2, label: 'evening', emoji: '🌆', accent: 'orange' },
                            { id: 3, label: 'morning', emoji: '🌅', accent: 'amber' },
                            { id: 4, label: 'winter', emoji: '❄️', accent: 'blue' },
                            { id: 5, label: 'weekend', emoji: '🎉', accent: 'pink' },
                        ],
                        correctOption: 3,
                        solution: 'morning',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'Which one of these is “Friend”?',
                        options: [
                            { id: 1, label: 'friend', emoji: '🧑‍🤝‍🧑', accent: 'green' },
                            { id: 2, label: 'teacher', emoji: '🧑‍🏫', accent: 'blue' },
                            { id: 3, label: 'doctor', emoji: '🧑‍⚕️', accent: 'red' },
                            { id: 4, label: 'pilot', emoji: '🧑‍✈️', accent: 'purple' },
                            { id: 5, label: 'artist', emoji: '🧑‍🎨', accent: 'orange' },
                        ],
                        correctOption: 1,
                        solution: 'friend',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'Which one of these is “Flower”?',
                        options: [
                            { id: 1, label: 'leaf', emoji: '🍃', accent: 'green' },
                            { id: 2, label: 'flower', emoji: '🌸', accent: 'pink' },
                            { id: 3, label: 'stone', emoji: '🪨', accent: 'gray' },
                            { id: 4, label: 'shell', emoji: '🐚', accent: 'amber' },
                            { id: 5, label: 'star', emoji: '⭐', accent: 'yellow' },
                        ],
                        correctOption: 2,
                        solution: 'flower',
                    },
                ],
                hi: [
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“दरवाज़ा” का अर्थ क्या है?',
                        options: [
                            { id: 1, label: 'खिड़की', emoji: '🪟', accent: 'blue' },
                            { id: 2, label: 'दरवाज़ा', emoji: '🚪', accent: 'brown' },
                            { id: 3, label: 'छत', emoji: '🏠', accent: 'orange' },
                            { id: 4, label: 'दीवार', emoji: '🧱', accent: 'red' },
                            { id: 5, label: 'फर्श', emoji: '🟫', accent: 'purple' },
                        ],
                        correctOption: 2,
                        solution: 'दरवाज़ा',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“दूध” कौन-सा पेय है?',
                        options: [
                            { id: 1, label: 'चाय', emoji: '🍵', accent: 'amber' },
                            { id: 2, label: 'रस', emoji: '🧃', accent: 'orange' },
                            { id: 3, label: 'दूध', emoji: '🥛', accent: 'blue' },
                            { id: 4, label: 'कॉफी', emoji: '☕', accent: 'brown' },
                            { id: 5, label: 'सूप', emoji: '🍲', accent: 'green' },
                        ],
                        correctOption: 3,
                        solution: 'दूध',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“सुबह” का सही अर्थ चुनें।',
                        options: [
                            { id: 1, label: 'रात', emoji: '🌙', accent: 'purple' },
                            { id: 2, label: 'शाम', emoji: '🌆', accent: 'orange' },
                            { id: 3, label: 'सुबह', emoji: '🌅', accent: 'amber' },
                            { id: 4, label: 'सर्दी', emoji: '❄️', accent: 'blue' },
                            { id: 5, label: 'छुट्टी', emoji: '🎉', accent: 'pink' },
                        ],
                        correctOption: 3,
                        solution: 'सुबह',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'दोस्त के लिए सही शब्द कौन-सा है?',
                        options: [
                            { id: 1, label: 'दोस्त', emoji: '🧑‍🤝‍🧑', accent: 'green' },
                            { id: 2, label: 'शिक्षक', emoji: '🧑‍🏫', accent: 'blue' },
                            { id: 3, label: 'डॉक्टर', emoji: '🧑‍⚕️', accent: 'red' },
                            { id: 4, label: 'कलाकार', emoji: '🧑‍🎨', accent: 'orange' },
                            { id: 5, label: 'पायलट', emoji: '🧑‍✈️', accent: 'purple' },
                        ],
                        correctOption: 1,
                        solution: 'दोस्त',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'फूल की तस्वीर कौन-सी है?',
                        options: [
                            { id: 1, label: 'पत्ता', emoji: '🍃', accent: 'green' },
                            { id: 2, label: 'फूल', emoji: '🌸', accent: 'pink' },
                            { id: 3, label: 'पत्थर', emoji: '🪨', accent: 'gray' },
                            { id: 4, label: 'सीप', emoji: '🐚', accent: 'amber' },
                            { id: 5, label: 'तारा', emoji: '⭐', accent: 'yellow' },
                        ],
                        correctOption: 2,
                        solution: 'फूल',
                    },
                ],
                kn: [
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“ಕಿಟಕಿ” ಎಂದರೆ ಏನು?',
                        options: [
                            { id: 1, label: 'ಕಿಟಕಿ', emoji: '🪟', accent: 'blue' },
                            { id: 2, label: 'ಬಾಗಿಲು', emoji: '🚪', accent: 'brown' },
                            { id: 3, label: 'ಗೋಡೆ', emoji: '🧱', accent: 'red' },
                            { id: 4, label: 'ಮೇಲುಕಟ್ಟು', emoji: '🏠', accent: 'orange' },
                            { id: 5, label: 'ನೆಲ', emoji: '🟫', accent: 'purple' },
                        ],
                        correctOption: 1,
                        solution: 'ಕಿಟಕಿ',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“ಹಾಲು” ಯಾವ ಪಾನೀಯ?',
                        options: [
                            { id: 1, label: 'ಚಹಾ', emoji: '🍵', accent: 'amber' },
                            { id: 2, label: 'ರಸ', emoji: '🧃', accent: 'orange' },
                            { id: 3, label: 'ಹಾಲು', emoji: '🥛', accent: 'blue' },
                            { id: 4, label: 'ಕಾಫಿ', emoji: '☕', accent: 'brown' },
                            { id: 5, label: 'ಸಾರು', emoji: '🍲', accent: 'green' },
                        ],
                        correctOption: 3,
                        solution: 'ಹಾಲು',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“ಬೆಳಗ್ಗೆ” ಎಂಬ ಪದದ ಅರ್ಥ ಯಾವುದು?',
                        options: [
                            { id: 1, label: 'ರಾತ್ರಿ', emoji: '🌙', accent: 'purple' },
                            { id: 2, label: 'ಸಂಜೆ', emoji: '🌆', accent: 'orange' },
                            { id: 3, label: 'ಬೆಳಗ್ಗೆ', emoji: '🌅', accent: 'amber' },
                            { id: 4, label: 'ಚಳಿಗಾಲ', emoji: '❄️', accent: 'blue' },
                            { id: 5, label: 'ರಜೆ', emoji: '🎉', accent: 'pink' },
                        ],
                        correctOption: 3,
                        solution: 'ಬೆಳಗ್ಗೆ',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'ಸ್ನೇಹಿತನಿಗೆ ಸರಿಯಾದ ಪದ ಯಾವುದು?',
                        options: [
                            { id: 1, label: 'ಸ್ನೇಹಿತ', emoji: '🧑‍🤝‍🧑', accent: 'green' },
                            { id: 2, label: 'ಶಿಕ್ಷಕ', emoji: '🧑‍🏫', accent: 'blue' },
                            { id: 3, label: 'ವೈದ್ಯ', emoji: '🧑‍⚕️', accent: 'red' },
                            { id: 4, label: 'ಕಲಾವಿದ', emoji: '🧑‍🎨', accent: 'orange' },
                            { id: 5, label: 'ಪೈಲಟ್', emoji: '🧑‍✈️', accent: 'purple' },
                        ],
                        correctOption: 1,
                        solution: 'ಸ್ನೇಹಿತ',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'ಹೂವಿನ ಚಿತ್ರ ಯಾವುದು?',
                        options: [
                            { id: 1, label: 'ಎಲೆ', emoji: '🍃', accent: 'green' },
                            { id: 2, label: 'ಹೂವು', emoji: '🌸', accent: 'pink' },
                            { id: 3, label: 'ಕಲ್ಲು', emoji: '🪨', accent: 'gray' },
                            { id: 4, label: 'ಚಿಪ್ಪು', emoji: '🐚', accent: 'amber' },
                            { id: 5, label: 'ನಕ್ಷತ್ರ', emoji: '⭐', accent: 'yellow' },
                        ],
                        correctOption: 2,
                        solution: 'ಹೂವು',
                    },
                ],
                ta: [
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“ஜன்னல்” என்றால் என்ன?',
                        options: [
                            { id: 1, label: 'ஜன்னல்', emoji: '🪟', accent: 'blue' },
                            { id: 2, label: 'கதவு', emoji: '🚪', accent: 'brown' },
                            { id: 3, label: 'சுவர்', emoji: '🧱', accent: 'red' },
                            { id: 4, label: 'கூரை', emoji: '🏠', accent: 'orange' },
                            { id: 5, label: 'தரை', emoji: '🟫', accent: 'purple' },
                        ],
                        correctOption: 1,
                        solution: 'ஜன்னல்',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“பால்” எந்த பானம்?',
                        options: [
                            { id: 1, label: 'தேநீர்', emoji: '🍵', accent: 'amber' },
                            { id: 2, label: 'சாறு', emoji: '🧃', accent: 'orange' },
                            { id: 3, label: 'பால்', emoji: '🥛', accent: 'blue' },
                            { id: 4, label: 'காபி', emoji: '☕', accent: 'brown' },
                            { id: 5, label: 'சூப்', emoji: '🍲', accent: 'green' },
                        ],
                        correctOption: 3,
                        solution: 'பால்',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“காலை” என்ற சொல்லின் பொருள் எது?',
                        options: [
                            { id: 1, label: 'இரவு', emoji: '🌙', accent: 'purple' },
                            { id: 2, label: 'மாலை', emoji: '🌆', accent: 'orange' },
                            { id: 3, label: 'காலை', emoji: '🌅', accent: 'amber' },
                            { id: 4, label: 'குளிர்காலம்', emoji: '❄️', accent: 'blue' },
                            { id: 5, label: 'விடுமுறை', emoji: '🎉', accent: 'pink' },
                        ],
                        correctOption: 3,
                        solution: 'காலை',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'நண்பருக்கான சரியான சொல் எது?',
                        options: [
                            { id: 1, label: 'நண்பர்', emoji: '🧑‍🤝‍🧑', accent: 'green' },
                            { id: 2, label: 'ஆசிரியர்', emoji: '🧑‍🏫', accent: 'blue' },
                            { id: 3, label: 'மருத்துவர்', emoji: '🧑‍⚕️', accent: 'red' },
                            { id: 4, label: 'கலைஞர்', emoji: '🧑‍🎨', accent: 'orange' },
                            { id: 5, label: 'விமானி', emoji: '🧑‍✈️', accent: 'purple' },
                        ],
                        correctOption: 1,
                        solution: 'நண்பர்',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'பூவின் படம் எது?',
                        options: [
                            { id: 1, label: 'இலை', emoji: '🍃', accent: 'green' },
                            { id: 2, label: 'பூ', emoji: '🌸', accent: 'pink' },
                            { id: 3, label: 'கல்', emoji: '🪨', accent: 'gray' },
                            { id: 4, label: 'சிப்பி', emoji: '🐚', accent: 'amber' },
                            { id: 5, label: 'நட்சத்திரம்', emoji: '⭐', accent: 'yellow' },
                        ],
                        correctOption: 2,
                        solution: 'பூ',
                    },
                ],
                te: [
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“కిటికీ” అంటే ఏమిటి?',
                        options: [
                            { id: 1, label: 'కిటికీ', emoji: '🪟', accent: 'blue' },
                            { id: 2, label: 'తలుపు', emoji: '🚪', accent: 'brown' },
                            { id: 3, label: 'గోడ', emoji: '🧱', accent: 'red' },
                            { id: 4, label: 'పైకప్పు', emoji: '🏠', accent: 'orange' },
                            { id: 5, label: 'నేల', emoji: '🟫', accent: 'purple' },
                        ],
                        correctOption: 1,
                        solution: 'కిటికీ',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“పాలు” ఏ పానీయం?',
                        options: [
                            { id: 1, label: 'టీ', emoji: '🍵', accent: 'amber' },
                            { id: 2, label: 'రసం', emoji: '🧃', accent: 'orange' },
                            { id: 3, label: 'పాలు', emoji: '🥛', accent: 'blue' },
                            { id: 4, label: 'కాఫీ', emoji: '☕', accent: 'brown' },
                            { id: 5, label: 'సూప్', emoji: '🍲', accent: 'green' },
                        ],
                        correctOption: 3,
                        solution: 'పాలు',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: '“ఉదయం” అనే పదం అర్థం ఏమిటి?',
                        options: [
                            { id: 1, label: 'రాత్రి', emoji: '🌙', accent: 'purple' },
                            { id: 2, label: 'సాయంత్రం', emoji: '🌆', accent: 'orange' },
                            { id: 3, label: 'ఉదయం', emoji: '🌅', accent: 'amber' },
                            { id: 4, label: 'చలికాలం', emoji: '❄️', accent: 'blue' },
                            { id: 5, label: 'సెలవు', emoji: '🎉', accent: 'pink' },
                        ],
                        correctOption: 3,
                        solution: 'ఉదయం',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'స్నేహితుడికి సరైన పదం ఏది?',
                        options: [
                            { id: 1, label: 'స్నేహితుడు', emoji: '🧑‍🤝‍🧑', accent: 'green' },
                            { id: 2, label: 'ఉపాధ్యాయుడు', emoji: '🧑‍🏫', accent: 'blue' },
                            { id: 3, label: 'వైద్యుడు', emoji: '🧑‍⚕️', accent: 'red' },
                            { id: 4, label: 'కళాకారుడు', emoji: '🧑‍🎨', accent: 'orange' },
                            { id: 5, label: 'పైలట్', emoji: '🧑‍✈️', accent: 'purple' },
                        ],
                        correctOption: 1,
                        solution: 'స్నేహితుడు',
                    },
                    {
                        type: 'choice',
                        label: 'NEW WORD',
                        prompt: 'పువ్వు చిత్రం ఏది?',
                        options: [
                            { id: 1, label: 'ఆకు', emoji: '🍃', accent: 'green' },
                            { id: 2, label: 'పువ్వు', emoji: '🌸', accent: 'pink' },
                            { id: 3, label: 'రాయి', emoji: '🪨', accent: 'gray' },
                            { id: 4, label: 'గవ్వ', emoji: '🐚', accent: 'amber' },
                            { id: 5, label: 'నక్షత్రం', emoji: '⭐', accent: 'yellow' },
                        ],
                        correctOption: 2,
                        solution: 'పువ్వు',
                    },
                ],
            },
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'एक सेब',
            correctText: 'an apple',
            options: ['apple', 'is', 'This', 'an'],
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'वह किताब',
            correctText: 'That book',
            options: ['book', 'boy', 'This', 'That'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Book”?',
            options: [
                { id: 1, label: 'बच्चा', emoji: '👶', accent: 'orange' },
                { id: 2, label: 'किताब', emoji: '📘', accent: 'blue' },
                { id: 3, label: 'पेड़', emoji: '🌳', accent: 'green' },
                { id: 4, label: 'कप', emoji: '☕', accent: 'brown' },
                { id: 5, label: 'मोबाइल', emoji: '📱', accent: 'purple' },
            ],
            correctOption: 2,
            solution: 'किताब',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'यह लड़का',
            correctText: 'This boy',
            options: ['boy', 'This', 'That', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Water”?',
            options: [
                { id: 1, label: 'पानी', emoji: '💧', accent: 'blue' },
                { id: 2, label: 'चाय', emoji: '🍵', accent: 'amber' },
                { id: 3, label: 'मछली', emoji: '🐟', accent: 'teal' },
                { id: 4, label: 'लाइट', emoji: '💡', accent: 'yellow' },
                { id: 5, label: 'रोशनी', emoji: '🌞', accent: 'orange' },
            ],
            correctOption: 1,
            solution: 'पानी',
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “House”?',
            options: [
                { id: 1, label: 'बगीचा', emoji: '🌿', accent: 'green' },
                { id: 2, label: 'घर', emoji: '🏡', accent: 'orange' },
                { id: 3, label: 'पेड़', emoji: '🌳', accent: 'teal' },
                { id: 4, label: 'गाड़ी', emoji: '🚗', accent: 'blue' },
                { id: 5, label: 'किला', emoji: '🏰', accent: 'red' },
            ],
            correctOption: 2,
            solution: 'घर',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'यह पानी है',
            correctText: 'This is water',
            options: ['This', 'water', 'is', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Tree”?',
            options: [
                { id: 1, label: 'पेड़', emoji: '🌳', accent: 'green' },
                { id: 2, label: 'सामान', emoji: '🎒', accent: 'purple' },
                { id: 3, label: 'सूरज', emoji: '☀️', accent: 'orange' },
                { id: 4, label: 'रोटी', emoji: '🍞', accent: 'amber' },
                { id: 5, label: 'दर्पण', emoji: '🪞', accent: 'blue' },
            ],
            correctOption: 1,
            solution: 'पेड़',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'यह घर है',
            correctText: 'This is a house',
            options: ['This', 'is', 'a', 'house'],
        },
    ],
    en: [
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Apple”?',
            options: [
                { id: 1, label: 'pear', emoji: '🍐', accent: 'amber' },
                { id: 2, label: 'apple', emoji: '🍎', accent: 'red' },
                { id: 3, label: 'book', emoji: '📘', accent: 'blue' },
                { id: 4, label: 'banana', emoji: '🍌', accent: 'yellow' },
                { id: 5, label: 'train', emoji: '🚆', accent: 'purple' },
            ],
            correctOption: 2,
            solution: 'apple',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'an apple',
            correctText: 'an apple',
            options: ['apple', 'is', 'This', 'an'],
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'that book',
            correctText: 'That book',
            options: ['book', 'boy', 'This', 'That'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Book”?',
            options: [
                { id: 1, label: 'child', emoji: '🧒', accent: 'orange' },
                { id: 2, label: 'book', emoji: '📘', accent: 'blue' },
                { id: 3, label: 'tree', emoji: '🌳', accent: 'green' },
                { id: 4, label: 'shoe', emoji: '👟', accent: 'pink' },
                { id: 5, label: 'door', emoji: '🚪', accent: 'brown' },
            ],
            correctOption: 2,
            solution: 'book',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'this boy',
            correctText: 'This boy',
            options: ['boy', 'This', 'That', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Water”?',
            options: [
                { id: 1, label: 'tea', emoji: '🍵', accent: 'amber' },
                { id: 2, label: 'water', emoji: '💧', accent: 'blue' },
                { id: 3, label: 'fish', emoji: '🐟', accent: 'teal' },
                { id: 4, label: 'light', emoji: '💡', accent: 'yellow' },
                { id: 5, label: 'sun', emoji: '☀️', accent: 'orange' },
            ],
            correctOption: 2,
            solution: 'water',
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “House”?',
            options: [
                { id: 1, label: 'garden', emoji: '🌿', accent: 'green' },
                { id: 2, label: 'house', emoji: '🏡', accent: 'orange' },
                { id: 3, label: 'tree', emoji: '🌳', accent: 'teal' },
                { id: 4, label: 'car', emoji: '🚗', accent: 'blue' },
                { id: 5, label: 'cloud', emoji: '☁️', accent: 'gray' },
            ],
            correctOption: 2,
            solution: 'house',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'this is water',
            correctText: 'This is water',
            options: ['This', 'water', 'is', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Tree”?',
            options: [
                { id: 1, label: 'tree', emoji: '🌳', accent: 'green' },
                { id: 2, label: 'bag', emoji: '🎒', accent: 'purple' },
                { id: 3, label: 'sun', emoji: '☀️', accent: 'orange' },
                { id: 4, label: 'bread', emoji: '🍞', accent: 'amber' },
                { id: 5, label: 'mirror', emoji: '🪞', accent: 'blue' },
            ],
            correctOption: 1,
            solution: 'tree',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'this is a house',
            correctText: 'This is a house',
            options: ['This', 'is', 'a', 'house'],
        },
    ],
    kn: [
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Apple”?',
            options: [
                { id: 1, label: 'ಸೇಬು', emoji: '🍎', accent: 'red' },
                { id: 2, label: 'ಬanana', emoji: '🍌', accent: 'yellow' },
                { id: 3, label: 'ಪುಸ್ತಕ', emoji: '📘', accent: 'blue' },
                { id: 4, label: 'ಮರ', emoji: '🌳', accent: 'green' },
                { id: 5, label: 'ಇಲ್ಕಾ', emoji: '📱', accent: 'purple' },
            ],
            correctOption: 1,
            solution: 'ಸೇಬು',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ಒಂದು ಸೇಬು',
            correctText: 'an apple',
            options: ['apple', 'this', 'that', 'is'],
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ಅದು ಪುಸ್ತಕ',
            correctText: 'That book',
            options: ['book', 'boy', 'This', 'That'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Book”?',
            options: [
                { id: 1, label: 'ಮಕ್ಕಳು', emoji: '🧒', accent: 'orange' },
                { id: 2, label: 'ಪುಸ್ತಕ', emoji: '📘', accent: 'blue' },
                { id: 3, label: 'ಮರ', emoji: '🌳', accent: 'green' },
                { id: 4, label: 'ಕಪ್', emoji: '☕', accent: 'brown' },
                { id: 5, label: 'ದೀಪ', emoji: '💡', accent: 'yellow' },
            ],
            correctOption: 2,
            solution: 'ಪುಸ್ತಕ',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ಈ ಹುಡುಗ',
            correctText: 'This boy',
            options: ['boy', 'This', 'That', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Water”?',
            options: [
                { id: 1, label: 'ನೀರು', emoji: '💧', accent: 'blue' },
                { id: 2, label: 'ಚಹಾ', emoji: '🍵', accent: 'amber' },
                { id: 3, label: 'ಮೀನು', emoji: '🐟', accent: 'teal' },
                { id: 4, label: 'ಬೆಳಕು', emoji: '💡', accent: 'yellow' },
                { id: 5, label: 'ಮಳೆ', emoji: '🌧️', accent: 'gray' },
            ],
            correctOption: 1,
            solution: 'ನೀರು',
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “House”?',
            options: [
                { id: 1, label: 'ತೋಟ', emoji: '🌿', accent: 'green' },
                { id: 2, label: 'ಮನೆ', emoji: '🏡', accent: 'orange' },
                { id: 3, label: 'ಮರ', emoji: '🌳', accent: 'teal' },
                { id: 4, label: 'ಕಾರು', emoji: '🚗', accent: 'blue' },
                { id: 5, label: 'ಗಡಿ', emoji: '🏰', accent: 'red' },
            ],
            correctOption: 2,
            solution: 'ಮನೆ',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ಇದು ನೀರು',
            correctText: 'This is water',
            options: ['This', 'water', 'is', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Tree”?',
            options: [
                { id: 1, label: 'ಮರ', emoji: '🌳', accent: 'green' },
                { id: 2, label: 'ಬ್ಯಾಗ್', emoji: '🎒', accent: 'purple' },
                { id: 3, label: 'ಸೂರ್ಯ', emoji: '☀️', accent: 'orange' },
                { id: 4, label: 'ಬ್ರೆಡ್', emoji: '🍞', accent: 'amber' },
                { id: 5, label: 'ಕನ್ನಡಕ', emoji: '🪞', accent: 'blue' },
            ],
            correctOption: 1,
            solution: 'ಮರ',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ಇದು ಒಂದು ಮನೆ',
            correctText: 'This is a house',
            options: ['This', 'is', 'a', 'house'],
        },
    ],
    ta: [
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Apple”?',
            options: [
                { id: 1, label: 'ஆப்பிள்', emoji: '🍏', accent: 'amber' },
                { id: 2, label: 'பழம்', emoji: '🍌', accent: 'yellow' },
                { id: 3, label: 'புத்தகம்', emoji: '📘', accent: 'blue' },
                { id: 4, label: 'மரம்', emoji: '🌳', accent: 'green' },
                { id: 5, label: 'கார்', emoji: '🚗', accent: 'purple' },
            ],
            correctOption: 1,
            solution: 'ஆப்பிள்',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ஒரு ஆப்பிள்',
            correctText: 'an apple',
            options: ['apple', 'is', 'that', 'this'],
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'அந்த புத்தகம்',
            correctText: 'That book',
            options: ['book', 'boy', 'This', 'That'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Book”?',
            options: [
                { id: 1, label: 'குழந்தை', emoji: '🧒', accent: 'orange' },
                { id: 2, label: 'புத்தகம்', emoji: '📘', accent: 'blue' },
                { id: 3, label: 'மரம்', emoji: '🌳', accent: 'green' },
                { id: 4, label: 'கோப்பை', emoji: '☕', accent: 'brown' },
                { id: 5, label: 'மீன்', emoji: '🐟', accent: 'teal' },
            ],
            correctOption: 2,
            solution: 'புத்தகம்',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'இந்த பையன்',
            correctText: 'This boy',
            options: ['boy', 'This', 'That', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Water”?',
            options: [
                { id: 1, label: 'நீர்', emoji: '💧', accent: 'blue' },
                { id: 2, label: 'தேநீர்', emoji: '🍵', accent: 'amber' },
                { id: 3, label: 'மீன்', emoji: '🐟', accent: 'teal' },
                { id: 4, label: 'விளக்கு', emoji: '💡', accent: 'yellow' },
                { id: 5, label: 'மழை', emoji: '🌧️', accent: 'gray' },
            ],
            correctOption: 1,
            solution: 'நீர்',
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “House”?',
            options: [
                { id: 1, label: 'தோட்டம்', emoji: '🌿', accent: 'green' },
                { id: 2, label: 'வீடு', emoji: '🏡', accent: 'orange' },
                { id: 3, label: 'மரம்', emoji: '🌳', accent: 'teal' },
                { id: 4, label: 'கார்', emoji: '🚗', accent: 'blue' },
                { id: 5, label: 'கோட்டை', emoji: '🏰', accent: 'red' },
            ],
            correctOption: 2,
            solution: 'வீடு',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'இது நீர்',
            correctText: 'This is water',
            options: ['This', 'water', 'is', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Tree”?',
            options: [
                { id: 1, label: 'மரம்', emoji: '🌳', accent: 'green' },
                { id: 2, label: 'பை', emoji: '🎒', accent: 'purple' },
                { id: 3, label: 'சூரியன்', emoji: '☀️', accent: 'orange' },
                { id: 4, label: 'ரொட்டி', emoji: '🍞', accent: 'amber' },
                { id: 5, label: 'கண்ணாடி', emoji: '🪞', accent: 'blue' },
            ],
            correctOption: 1,
            solution: 'மரம்',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'இது ஒரு வீடு',
            correctText: 'This is a house',
            options: ['This', 'is', 'a', 'house'],
        },
    ],
    te: [
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Apple”?',
            options: [
                { id: 1, label: 'సేబు', emoji: '🍎', accent: 'red' },
                { id: 2, label: 'పండు', emoji: '🍐', accent: 'amber' },
                { id: 3, label: 'పుస్తకం', emoji: '📘', accent: 'blue' },
                { id: 4, label: 'చెట్టు', emoji: '🌳', accent: 'green' },
                { id: 5, label: 'కారు', emoji: '🚗', accent: 'purple' },
            ],
            correctOption: 1,
            solution: 'సేబు',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ఒక సేబు',
            correctText: 'an apple',
            options: ['apple', 'this', 'that', 'is'],
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ఆ పుస్తకం',
            correctText: 'That book',
            options: ['book', 'boy', 'This', 'That'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Book”?',
            options: [
                { id: 1, label: 'పిల్లాడు', emoji: '🧒', accent: 'orange' },
                { id: 2, label: 'పుస్తకం', emoji: '📘', accent: 'blue' },
                { id: 3, label: 'చెట్టు', emoji: '🌳', accent: 'green' },
                { id: 4, label: 'కప్పు', emoji: '☕', accent: 'brown' },
                { id: 5, label: 'మీనుగు', emoji: '🐟', accent: 'teal' },
            ],
            correctOption: 2,
            solution: 'పుస్తకం',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ఈ అమ్మాయి',
            correctText: 'This girl',
            options: ['girl', 'This', 'That', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Water”?',
            options: [
                { id: 1, label: 'నీరు', emoji: '💧', accent: 'blue' },
                { id: 2, label: 'చా', emoji: '🍵', accent: 'amber' },
                { id: 3, label: 'చేప', emoji: '🐟', accent: 'teal' },
                { id: 4, label: 'కాంతి', emoji: '💡', accent: 'yellow' },
                { id: 5, label: 'వర్షం', emoji: '🌧️', accent: 'gray' },
            ],
            correctOption: 1,
            solution: 'నీరు',
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “House”?',
            options: [
                { id: 1, label: 'తోట', emoji: '🌿', accent: 'green' },
                { id: 2, label: 'ఇల్లు', emoji: '🏡', accent: 'orange' },
                { id: 3, label: 'చెట్టు', emoji: '🌳', accent: 'teal' },
                { id: 4, label: 'కారు', emoji: '🚗', accent: 'blue' },
                { id: 5, label: 'కోట', emoji: '🏰', accent: 'red' },
            ],
            correctOption: 2,
            solution: 'ఇల్లు',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ఇది నీరు',
            correctText: 'This is water',
            options: ['This', 'water', 'is', 'book'],
        },
        {
            type: 'choice',
            label: 'NEW WORD',
            prompt: 'Which one of these is “Tree”?',
            options: [
                { id: 1, label: 'చెట్టు', emoji: '🌳', accent: 'green' },
                { id: 2, label: 'బ్యాగ్', emoji: '🎒', accent: 'purple' },
                { id: 3, label: 'సూర్యుడు', emoji: '☀️', accent: 'orange' },
                { id: 4, label: 'బ్రెడ్', emoji: '🍞', accent: 'amber' },
                { id: 5, label: 'అద్దం', emoji: '🪞', accent: 'blue' },
            ],
            correctOption: 1,
            solution: 'చెట్టు',
        },
        {
            type: 'write',
            label: 'WRITE THIS IN ENGLISH',
            prompt: 'Write this in English',
            instructions: 'ఇది ఒక ఇల్లు',
            correctText: 'This is a house',
            options: ['This', 'is', 'a', 'house'],
        },
    ],
}

const flags = {
    en: '🇺🇸',
    hi: '🇮🇳',
    kn: '🇮🇳',
    ta: '🇮🇳',
    te: '🇮🇳',
}

const languageTheme = {
    en: { flagBackground: '#69d6ff', cardBorder: 'rgba(96, 165, 250, 0.8)', cardGlow: 'rgba(96, 165, 250, 0.2)' },
    hi: { flagBackground: '#62d39c', cardBorder: 'rgba(34, 197, 94, 0.8)', cardGlow: 'rgba(34, 197, 94, 0.2)' },
    kn: { flagBackground: '#f5c56d', cardBorder: 'rgba(234, 179, 8, 0.8)', cardGlow: 'rgba(234, 179, 8, 0.22)' },
    ta: { flagBackground: '#f6a0a0', cardBorder: 'rgba(244, 114, 182, 0.8)', cardGlow: 'rgba(244, 114, 182, 0.2)' },
    te: { flagBackground: '#8ac7ff', cardBorder: 'rgba(59, 130, 246, 0.8)', cardGlow: 'rgba(59, 130, 246, 0.2)' },
}

const extraChoiceQuestionsByLanguage = lessonBankByLanguage.hi.find((item) => item.extraChoiceQuestionsByLanguage)?.extraChoiceQuestionsByLanguage || {}

const shuffleItems = (items) => [...items].sort(() => Math.random() - 0.5)

const createDynamicLessonBank = (languageCode) => {
    const languageQuestions = lessonBankByLanguage[languageCode] || lessonBankByLanguage.hi
    const questions = [
        ...languageQuestions,
        ...(extraChoiceQuestionsByLanguage[languageCode] || []),
    ].filter((item) => item.type === 'choice')
    const uniqueQuestions = [...new Map(questions.map((question) => [question.prompt, question])).values()]

    return shuffleItems(uniqueQuestions).map((question) => {
        const options = shuffleItems(question.options).map((option, index) => ({
            ...option,
            id: index + 1,
        }))
        const correctOption = options.find((option) => option.label === question.solution)?.id

        return { ...question, options, correctOption }
    })
}

export default function LearningPathPage() {
    const [selectedLanguage, setSelectedLanguage] = useState(null)
    const [selectedKnowledge, setSelectedKnowledge] = useState(1)
    const [selectedPath, setSelectedPath] = useState('scratch')
    const [step, setStep] = useState('language')
    const [lessonIndex, setLessonIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState(null)
    const [selectedSequence, setSelectedSequence] = useState([])
    const [reviewState, setReviewState] = useState(null)
    const [showReview, setShowReview] = useState(false)
    const [showQuitModal, setShowQuitModal] = useState(false)
    const [savingLanguage, setSavingLanguage] = useState(false)
    const [scoresByLanguage, setScoresByLanguage] = useState({ en: 5, hi: 5, kn: 5, ta: 5, te: 5 })

    const currentLanguage = selectedLanguage || languages[0]
    const lessonBank = useMemo(() => createDynamicLessonBank(currentLanguage.code), [currentLanguage.code])
    const knowledgeLevels = knowledgeLevelsByLanguage[currentLanguage.code] || knowledgeLevelsByLanguage.en
    const currentScore = scoresByLanguage[currentLanguage.code] ?? 5
    const currentLesson = lessonBank[lessonIndex % lessonBank.length]
    const progress = ((lessonIndex + 1) / lessonBank.length) * 100
    const routeOptions = getRouteOptions(currentLanguage.name)

    const canContinue = reviewState !== null
    const activeTheme = languageTheme[currentLanguage.code] || languageTheme.en

    const persistSelectedCourse = (languageCode) => {
        if (languageCode) {
            localStorage.setItem('neolit_selected_language', languageCode)
        }
    }

    const selectLanguage = async (language) => {
        if (savingLanguage || selectedLanguage?.code === language.code) return

        setSelectedLanguage(language)
        persistSelectedCourse(language.code)
        setStep('knowledge')
        setSavingLanguage(true)
        try {
            await learningApi.updateLearningLanguage(language.code)
        } catch {
            setSelectedLanguage(null)
            setStep('language')
        } finally {
            setSavingLanguage(false)
        }
    }

    const nextStep = () => {
        if (step === 'language') {
            setStep('knowledge')
            return
        }

        if (step === 'knowledge') {
            setStep('path')
            return
        }

        if (step === 'path') {
            setStep('lesson')
            setReviewState(null)
            setSelectedOption(null)
            setSelectedSequence([])
            return
        }
    }

    const resetLessonState = () => {
        setReviewState(null)
        setSelectedOption(null)
        setSelectedSequence([])
    }

    const handleCheck = () => {
        if (currentLesson.type !== 'choice') {
            return
        }

        if (selectedOption === null) return
        const isCorrect = selectedOption === currentLesson.correctOption
        setReviewState(isCorrect ? 'correct' : 'wrong')
        setScoresByLanguage((prev) => ({
            ...prev,
            [currentLanguage.code]: Math.max(0, (prev[currentLanguage.code] ?? 5) + (isCorrect ? 2 : -1)),
        }))
        setShowReview(true)
    }

    const handleSkip = () => {
        setReviewState('skip')
        setShowReview(true)
    }

    const handleQuit = () => {
        setShowQuitModal(true)
    }

    const handleKeepLearning = () => {
        setShowQuitModal(false)
    }

    const handleEndSession = () => {
        const courseCode = selectedLanguage?.code || currentLanguage?.code || 'en'
        persistSelectedCourse(courseCode)

        setShowQuitModal(false)
        setStep('language')
        setLessonIndex(0)
        setSelectedLanguage(null)
        setSelectedKnowledge(1)
        setSelectedPath('scratch')
        setSelectedOption(null)
        setSelectedSequence([])
        setReviewState(null)
        setShowReview(false)
        window.location.href = '/dashboard'
    }

    const handleContinue = () => {
        if (lessonIndex >= lessonBank.length - 1) {
            const courseCode = selectedLanguage?.code || currentLanguage?.code || 'en'
            persistSelectedCourse(courseCode)
            window.location.href = '/dashboard'
            return
        }

        setLessonIndex((prev) => prev + 1)
        resetLessonState()
        setShowReview(false)
    }

    const handleTokenClick = (token) => {
        if (showReview) return
        setSelectedSequence((prev) => {
            if (prev.includes(token)) {
                return prev.filter((item) => item !== token)
            }
            return [...prev, token]
        })
    }

    const renderLanguageSelection = () => (
        <div className="duolingo-selection-page">
            <div className="duolingo-selection-grid">
                {languages.map((language) => {
                    const theme = languageTheme[language.code] || languageTheme.en
                    const isSelected = selectedLanguage?.code === language.code

                    return (
                        <button
                            key={language.code}
                            type="button"
                            className={`duolingo-language-card ${isSelected ? 'selected' : ''}`}
                            style={
                                isSelected
                                    ? {
                                        borderColor: theme.cardBorder,
                                        boxShadow: `0 0 0 2px ${theme.cardGlow}`,
                                    }
                                    : undefined
                            }
                            onClick={() => selectLanguage(language)}
                            disabled={savingLanguage}
                        >
                            <div className="duolingo-flag" style={{ background: theme.flagBackground }}>
                                {flags[language.code] || '🌍'}
                            </div>
                            <div className="duolingo-language-name">{language.name}</div>
                            <div className="duolingo-language-count">{language.code === 'hi' ? '13.8M learners' : `${Math.round(Math.random() * 15 + 10)}.M learners`}</div>
                        </button>
                    )
                })}
            </div>
        </div>
    )

    const renderKnowledgeStep = () => (
        <div className="duolingo-flow-page">
            <div className="duolingo-chat-bubble">How much {currentLanguage.name} do you know?</div>
            <div className="duolingo-choice-stack duolingo-knowledge-stack">
                {knowledgeLevels.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        className={`duolingo-choice-button ${selectedKnowledge === option.id ? 'active' : ''}`}
                        onClick={() => setSelectedKnowledge(option.id)}
                    >
                        <span className="duolingo-signal" aria-hidden="true">
                            <i />
                            <i />
                            <i />
                        </span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>
            <div className="duolingo-action-row">
                <button type="button" className="duolingo-ghost-button" onClick={() => setStep('language')}>
                    Back
                </button>
                <button type="button" className="duolingo-primary-button" onClick={nextStep}>
                    CONTINUE
                </button>
            </div>
        </div>
    )

    const renderPathStep = () => (
        <div className="duolingo-flow-page">
            <div className="duolingo-chat-bubble">Now let’s find the best place to start in {currentLanguage.name}!</div>
            <div className="duolingo-choice-stack path-stack duolingo-knowledge-stack">
                {routeOptions.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        className={`duolingo-route-card ${selectedPath === option.id ? 'active' : ''}`}
                        onClick={() => setSelectedPath(option.id)}
                    >
                        <div className={`duolingo-route-badge ${option.badgeColor}`}>{option.badge}</div>
                        <div className="duolingo-route-copy">
                            <h3>{option.title}</h3>
                            <p>{option.description}</p>
                        </div>
                    </button>
                ))}
            </div>
            <div className="duolingo-action-row">
                <button type="button" className="duolingo-ghost-button" onClick={() => setStep('knowledge')}>
                    Back
                </button>
                <button type="button" className="duolingo-primary-button" onClick={nextStep}>
                    CONTINUE
                </button>
            </div>
        </div>
    )

    const renderLessonStep = () => {
        const isChoice = currentLesson.type === 'choice'
        const answerPreview = selectedSequence.join(' ')

        return (
            <div className="duolingo-lesson-page">
                <div className="duolingo-topbar">
                    <button type="button" className="duolingo-close-button" aria-label="Close" onClick={handleQuit}>
                        ×
                    </button>
                    <div className="duolingo-progress-track">
                        <div className="duolingo-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="duolingo-heart-badge" style={{ color: activeTheme.cardBorder }}>❤ <span>{currentScore}</span></div>
                </div>

                {!showReview ? (
                    <>
                        <div className="duolingo-lesson-card">
                            <div className="duolingo-lesson-tag">{currentLesson.label} • {currentLanguage.name}</div>
                            <h2>{isChoice ? currentLesson.prompt : currentLesson.prompt}</h2>

                            {isChoice ? (
                                <div className="duolingo-answer-grid">
                                    {currentLesson.options.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            className={`duolingo-answer-option ${selectedOption === option.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedOption(option.id)}
                                        >
                                            <div className={`duolingo-answer-art ${option.accent}`}>{option.emoji}</div>
                                            <span>{option.label}</span>
                                            <small>{option.id}</small>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="duolingo-typing-card">
                                    <div className="duolingo-character" aria-hidden="true">🙂</div>
                                    <div className="duolingo-audio-bubble">▶ {currentLesson.instructions}</div>

                                    <div className="duolingo-multi-line">
                                        <div className="duolingo-solution-box">{answerPreview || ' '}</div>
                                    </div>

                                    <div className="duolingo-word-row">
                                        {currentLesson.options.map((token) => (
                                            <button
                                                key={token}
                                                type="button"
                                                className={`duolingo-token ${selectedSequence.includes(token) ? 'selected' : ''}`}
                                                onClick={() => handleTokenClick(token)}
                                            >
                                                {token}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="duolingo-bottom-row">
                            <button type="button" className="duolingo-skip-button" onClick={handleSkip}>SKIP</button>
                            <button type="button" className="duolingo-check-button" onClick={handleCheck}>CHECK</button>
                        </div>
                    </>
                ) : (
                    <div className={`duolingo-result-panel ${reviewState === 'correct' ? 'success' : 'danger'}`}>
                        <div className="duolingo-result-header">
                            <div className={`duolingo-result-icon ${reviewState === 'correct' ? 'success' : 'danger'}`}>
                                {reviewState === 'correct' ? '✓' : '×'}
                            </div>
                            <div className="duolingo-result-copy">
                                {reviewState === 'correct' ? (
                                    <div className="duolingo-result-title">Amazing!</div>
                                ) : (
                                    <>
                                        <div className="duolingo-result-title">Wrong answer</div>
                                        <div className="duolingo-result-solve">{currentLesson.type === 'choice' ? currentLesson.solution : currentLesson.correctText}</div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="duolingo-result-actions">
                            <button type="button" className={`duolingo-continue-button ${reviewState === 'correct' ? 'success' : 'danger'}`} onClick={handleContinue}>
                                CONTINUE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const memorizeMode = useMemo(() => step === 'lesson' && showReview && reviewState === 'wrong', [showReview, reviewState, step])

    return (
        <div className="duolingo-page-shell">
            {step !== 'language' && (
                <div className="duolingo-page-header">
                    <Link to="/dashboard" className="duolingo-back-link">←</Link>
                    <div className="duolingo-top-tabs">
                        <button type="button" className="duolingo-tab active">Learn</button>
                        <button type="button" className="duolingo-tab">Courses</button>
                    </div>
                </div>
            )}

            {step === 'language' && renderLanguageSelection()}
            {step === 'knowledge' && renderKnowledgeStep()}
            {step === 'path' && renderPathStep()}
            {step === 'lesson' && renderLessonStep()}

            {showQuitModal && (
                <div className="duolingo-quit-overlay">
                    <div className="duolingo-quit-modal" role="dialog" aria-modal="true" aria-labelledby="quit-session-title">
                        <div className="duolingo-quit-avatar" aria-hidden="true">
                            <span>✦</span>
                        </div>
                        <div className="duolingo-quit-eyebrow">SESSION PAUSED</div>
                        <h2 id="quit-session-title" className="duolingo-quit-message">Keep your learning streak alive?</h2>
                        <p className="duolingo-quit-detail">Your progress is saved. You can return to this lesson whenever you are ready.</p>
                        <button type="button" className="duolingo-keep-button" onClick={handleKeepLearning}>
                            Continue learning <span aria-hidden="true">→</span>
                        </button>
                        <button type="button" className="duolingo-end-button" onClick={handleEndSession}>
                            End session
                        </button>
                    </div>
                </div>
            )}

            {memorizeMode && <div className="duolingo-review-banner">Let’s review the exercises you missed!</div>}
        </div>
    )
}
