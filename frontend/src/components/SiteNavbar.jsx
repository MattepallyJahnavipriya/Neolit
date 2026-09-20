import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { learningApi } from '../services/learningApi'

const navigation = [
    { label: 'Home', to: '/learning-path' },
    { label: 'Learn', to: '/dashboard?section=learn' },
    { label: 'Letters', to: '/dashboard?section=letters' },
    { label: 'Leaderboard', to: '/dashboard?section=leaderboard' },
    { label: 'Quests', to: '/dashboard?section=quests' },
    { label: 'Games', to: '/games' },
    { label: 'Profile', to: '/profile' },
]

const supportedLanguageCodes = ['en', 'hi', 'kn', 'ta', 'te']
const nativeLanguageCodes = { English: 'en', Hindi: 'hi', Kannada: 'kn', Tamil: 'ta', Telugu: 'te' }
const navbarUiCopy = {
    en: { home: 'Home', learn: 'Learn', letters: 'Letters', leaderboard: 'Leaderboard', quests: 'Quests', games: 'Games', progress: 'Progress', profile: 'Profile', native: 'NATIVE', learning: 'LEARNING', myCourses: 'MY COURSES', logout: 'Logout' },
    hi: { home: 'होम', learn: 'सीखें', letters: 'अक्षर', leaderboard: 'लीडरबोर्ड', quests: 'अभियान', games: 'गेम्स', progress: 'प्रगति', profile: 'प्रोफ़ाइल', native: 'मातृभाषा', learning: 'सीखने की भाषा', myCourses: 'मेरे कोर्स', logout: 'लॉग आउट' },
    kn: { home: 'ಮುಖಪುಟ', learn: 'ಕಲಿಯಿರಿ', letters: 'ಅಕ್ಷರಗಳು', leaderboard: 'ಮುನ್ನಡೆ ಪಟ್ಟಿ', quests: 'ಗುರಿಗಳು', games: 'ಆಟಗಳು', progress: 'ಪ್ರಗತಿ', profile: 'ಪ್ರೊಫೈಲ್', native: 'ಮಾತೃಭಾಷೆ', learning: 'ಕಲಿಯುವ ಭಾಷೆ', myCourses: 'ನನ್ನ ಕೋರ್ಸ್‌ಗಳು', logout: 'ಲಾಗ್ ಔಟ್' },
    ta: { home: 'முகப்பு', learn: 'கற்க', letters: 'எழுத்துகள்', leaderboard: 'முன்னணி பட்டியல்', quests: 'சவால்கள்', games: 'விளையாட்டுகள்', progress: 'முன்னேற்றம்', profile: 'சுயவிவரம்', native: 'தாய்மொழி', learning: 'கற்கும் மொழி', myCourses: 'என் பாடநெறிகள்', logout: 'வெளியேறு' },
    te: { home: 'హోమ్', learn: 'నేర్చుకోండి', letters: 'అక్షరాలు', leaderboard: 'లీడర్‌బోర్డ్', quests: 'లక్ష్యాలు', games: 'గేమ్స్', progress: 'పురోగతి', profile: 'ప్రొఫైల్', native: 'మాతృభాష', learning: 'నేర్చుకునే భాష', myCourses: 'నా కోర్సులు', logout: 'లాగ్ అవుట్' },
}

export default function SiteNavbar() {
    const { user, logout, setUser } = useAuth()
    const location = useLocation()
    const [languages, setLanguages] = useState([])
    const [profile, setProfile] = useState(null)
    const [selectedLanguageCode, setSelectedLanguageCode] = useState(localStorage.getItem('neolit_selected_language') || user?.learning_language || 'en')
    const [courseMenuOpen, setCourseMenuOpen] = useState(false)
    const [nativeMenuOpen, setNativeMenuOpen] = useState(false)
    const [changingCourse, setChangingCourse] = useState(false)
    const [changingNative, setChangingNative] = useState(false)

    useEffect(() => {
        learningApi.getLanguages()
            .then((items) => setLanguages(items.filter((language) => supportedLanguageCodes.includes(language.code))))
            .catch(() => setLanguages([]))

        learningApi.getProfile()
            .then(setProfile)
            .catch(() => setProfile(null))
    }, [])

    useEffect(() => {
        const syncSelectedCourse = () => {
            const storedCourse = localStorage.getItem('neolit_selected_language')
            if (storedCourse && supportedLanguageCodes.includes(storedCourse)) setSelectedLanguageCode(storedCourse)
        }

        window.addEventListener('neolit-course-changed', syncSelectedCourse)
        window.addEventListener('storage', syncSelectedCourse)
        return () => {
            window.removeEventListener('neolit-course-changed', syncSelectedCourse)
            window.removeEventListener('storage', syncSelectedCourse)
        }
    }, [user?.learning_language])

    const nativeLanguage = localStorage.getItem('neolit_native_language') || profile?.native_language || user?.native_language || 'English'
    const uiCopy = navbarUiCopy[nativeLanguageCodes[nativeLanguage] || 'en'] || navbarUiCopy.en
    const selectedLanguageName = languages.find((language) => language.code === selectedLanguageCode)?.name || (selectedLanguageCode === 'en' ? 'English' : selectedLanguageCode.toUpperCase())
    const changeCourse = async (languageCode) => {
        if (languageCode === selectedLanguageCode) {
            setCourseMenuOpen(false)
            return
        }

        setChangingCourse(true)
        try {
            const updatedProfile = await learningApi.updateLearningLanguage(languageCode)

            setProfile(updatedProfile)
            setUser((currentUser) => ({
                ...(currentUser || {}),
                ...updatedProfile,
                learning_language: updatedProfile.learning_language,
            }))
            localStorage.setItem('neolit_selected_language', languageCode)
            setSelectedLanguageCode(languageCode)
            window.dispatchEvent(new Event('neolit-course-changed'))
            setCourseMenuOpen(false)
        } finally {
            setChangingCourse(false)
        }
    }

    const changeNativeLanguage = async (languageName) => {
        if (languageName === nativeLanguage || !profile) {
            setNativeMenuOpen(false)
            return
        }

        setChangingNative(true)
        try {
            const updatedProfile = await learningApi.updateProfile({
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                age: profile.age,
                native_language: languageName,
                learning_language: selectedLanguageCode,
                gender: profile.gender || '',
                current_level_id: profile.current_level_id,
            })
            setProfile(updatedProfile)
            setUser((currentUser) => ({ ...(currentUser || {}), ...updatedProfile }))
            localStorage.setItem('neolit_native_language', languageName)
            setNativeMenuOpen(false)
        } finally {
            setChangingNative(false)
        }
    }

    const localizedNavigation = navigation.map((item) => ({ ...item, label: uiCopy[item.to.includes('learning-path') ? 'home' : item.to.includes('section=learn') ? 'learn' : item.to.includes('section=letters') ? 'letters' : item.to.includes('section=leaderboard') ? 'leaderboard' : item.to.includes('section=quests') ? 'quests' : item.to.includes('/games') ? 'games' : 'profile'] }))

    return (
        <header className="site-navbar">
            <Link to="/learning-path" className="site-navbar-brand">NeoLit</Link>
            <nav className="site-navbar-links" aria-label="Main navigation">
                {localizedNavigation.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`site-navbar-link ${location.pathname + location.search === item.to ? 'active' : ''}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="site-navbar-actions">
                <div className="site-language-pair">
                    <div className="site-native-switcher">
                        <button type="button" className="site-language-card" onClick={() => setNativeMenuOpen((open) => !open)} aria-expanded={nativeMenuOpen}>
                            <small>{uiCopy.native}</small>
                            <strong>{nativeLanguage}</strong>
                            <span className="site-native-chevron">⌄</span>
                        </button>
                        {nativeMenuOpen && (
                            <div className="site-course-menu site-native-menu">
                                <strong>{uiCopy.native}</strong>
                                {languages.map((language) => (
                                    <button key={language.code} type="button" disabled={changingNative} className={language.name === nativeLanguage ? 'selected' : ''} onClick={() => changeNativeLanguage(language.name)}>
                                        {language.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="site-course-switcher">
                        <button type="button" className="site-course-button" onClick={() => setCourseMenuOpen((open) => !open)} aria-expanded={courseMenuOpen}>
                            <span className="site-course-icon">🌐</span>
                            <span><small>{uiCopy.learning}</small><strong>{selectedLanguageName}</strong></span>
                            <span className="site-course-chevron">⌄</span>
                        </button>
                        {courseMenuOpen && (
                            <div className="site-course-menu">
                                <strong>{uiCopy.myCourses}</strong>
                                {languages.map((language) => (
                                    <button key={language.code} type="button" disabled={changingCourse} className={language.code === selectedLanguageCode ? 'selected' : ''} onClick={() => changeCourse(language.code)}>
                                        {language.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button type="button" className="site-navbar-logout" onClick={logout}>{uiCopy.logout}</button>
            </div>
        </header>
    )
}
