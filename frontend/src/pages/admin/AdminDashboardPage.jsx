import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { learningApi } from '../../services/learningApi'
import AdminCreateAccount from '../../components/AdminCreateAccount'
import AdminUserDialog from '../../components/AdminUserDialog'

const sidebarItems = [
    { label: 'Dashboard', target: 'admin-overview' },
    { label: 'Users', target: 'admin-users' },
    { label: 'Courses', target: 'admin-section-content' },
    { label: 'Lessons', target: 'admin-section-content' },
    { label: 'Games', target: 'admin-section-content' },
    { label: 'Rewards', target: 'admin-section-content' },
    { label: 'Analytics', target: 'admin-section-content' },
    { label: 'Settings', target: 'admin-section-content' },
]

const defaultUsers = []
const USERS_PER_PAGE = 6
const CURRICULUM_PER_PAGE = 7

function statusStyle(status) {
    if (status === 'Active') return 'admin-status active'
    if (status === 'Blocked') return 'admin-status blocked'
    return 'admin-status inactive'
}

export default function AdminDashboardPage() {
    const { user, logout } = useAuth()
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [users, setUsers] = useState(defaultUsers)
    const [overview, setOverview] = useState(null)
    const [overviewError, setOverviewError] = useState('')
    const [activeSection, setActiveSection] = useState('Dashboard')
    const [showCreateAccount, setShowCreateAccount] = useState(false)
    const [deletingUserId, setDeletingUserId] = useState(null)
    const [userDialog, setUserDialog] = useState(null)
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [loadingOverview, setLoadingOverview] = useState(true)
    const [curriculum, setCurriculum] = useState([])
    const [selectedCourseId, setSelectedCourseId] = useState(null)
    const [coursePage, setCoursePage] = useState(1)
    const [lessonPage, setLessonPage] = useState(1)
    const [loadingCurriculum, setLoadingCurriculum] = useState(true)
    const userName = user?.first_name || user?.name || 'Admin'

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await learningApi.getAdminUsers()
                setUsers(data)
            } catch (error) {
                setUsers([])
            } finally {
                setLoadingUsers(false)
            }
        }

        loadUsers()
    }, [])

    const reloadCurriculum = async () => {
        try {
            setCurriculum(await learningApi.getCurriculum())
        } catch (error) {
            setCurriculum([])
        }
    }

    const promptCoursePayload = async (course = null) => {
        const title = window.prompt('Course title:', course?.title || '')
        if (!title?.trim()) return null
        const description = window.prompt('Course description:', course?.description || '') ?? ''
        const languages = await learningApi.getLanguages()
        const levels = await learningApi.getLevels()
        return {
            title: title.trim(),
            description,
            language_id: course?.language_id || languages[0]?.id,
            level_id: course?.level_id || levels[0]?.id,
        }
    }

    const handleCreateCourse = async () => {
        try {
            const payload = await promptCoursePayload()
            if (payload) {
                await learningApi.createAdminCourse(payload)
                await reloadCurriculum()
            }
        } catch (error) {
            window.alert(error.response?.data?.detail || 'Could not create course.')
        }
    }

    const handleEditCourse = async (course) => {
        try {
            const payload = await promptCoursePayload(course)
            if (payload) {
                await learningApi.updateAdminCourse(course.id, payload)
                await reloadCurriculum()
            }
        } catch (error) {
            window.alert(error.response?.data?.detail || 'Could not update course.')
        }
    }

    const handleDeleteCourse = async (course) => {
        if (!window.confirm(`Delete ${course.title} and all its lessons?`)) return
        try {
            await learningApi.deleteAdminCourse(course.id)
            setSelectedCourseId(null)
            await reloadCurriculum()
        } catch (error) {
            window.alert(error.response?.data?.detail || 'Could not delete course.')
        }
    }

    const handleCreateLesson = async (course) => {
        const title = window.prompt('Lesson title:')
        if (!title?.trim()) return
        const description = window.prompt('Lesson description:') ?? ''
        const lesson_type = window.prompt('Lesson type:', 'mixed') || 'mixed'
        try {
            await learningApi.createAdminLesson(course.id, { title: title.trim(), description, lesson_type })
            await reloadCurriculum()
        } catch (error) {
            window.alert(error.response?.data?.detail || 'Could not create lesson.')
        }
    }

    const handleEditLesson = async (lesson) => {
        const title = window.prompt('Lesson title:', lesson.title)
        if (!title?.trim()) return
        const description = window.prompt('Lesson description:', lesson.description || '') ?? ''
        const lesson_type = window.prompt('Lesson type:', lesson.lesson_type || 'mixed') || 'mixed'
        try {
            await learningApi.updateAdminLesson(lesson.id, { title: title.trim(), description, lesson_type })
            await reloadCurriculum()
        } catch (error) {
            window.alert(error.response?.data?.detail || 'Could not update lesson.')
        }
    }

    const handleDeleteLesson = async (lesson) => {
        if (!window.confirm(`Delete ${lesson.title}?`)) return
        try {
            await learningApi.deleteAdminLesson(lesson.id)
            await reloadCurriculum()
        } catch (error) {
            window.alert(error.response?.data?.detail || 'Could not delete lesson.')
        }
    }

    useEffect(() => {
        const loadCurriculum = async () => {
            try {
                setCurriculum(await learningApi.getCurriculum())
            } catch (error) {
                setCurriculum([])
            } finally {
                setLoadingCurriculum(false)
            }
        }

        loadCurriculum()
    }, [])

    useEffect(() => {
        const loadOverview = async () => {
            try {
                setOverviewError('')
                setOverview(await learningApi.getAdminOverview())
            } catch (error) {
                setOverview(null)
                setOverviewError(error.response?.data?.detail || 'Could not load platform overview.')
            } finally {
                setLoadingOverview(false)
            }
        }

        loadOverview()
    }, [])

    const filteredUsers = useMemo(() => {
        const term = search.toLowerCase().trim()
        if (!term) return users
        return users.filter((person) => person.name.toLowerCase().includes(term) || person.email.toLowerCase().includes(term))
    }, [search, users])

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE))
    const visibleUsers = useMemo(() => {
        const start = (currentPage - 1) * USERS_PER_PAGE
        return filteredUsers.slice(start, start + USERS_PER_PAGE)
    }, [currentPage, filteredUsers])

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages))
    }, [totalPages])

    const statCards = [
        { label: 'New users today', value: overview?.new_users_today, tone: 'cyan' },
        { label: 'Active users', value: overview?.active_users, tone: 'green' },
        { label: 'Study time', value: overview ? `${Math.round(overview.study_time_seconds / 60)} min` : null, tone: 'purple', raw: true },
        { label: 'Lessons completed', value: overview?.lessons_completed, tone: 'gold' },
        { label: 'XP earned', value: overview?.xp_earned, tone: 'cyan' },
        { label: 'Game activity', value: overview?.game_activity, tone: 'green' },
    ]

    const activeLearners = users.filter((person) => person.status === 'Active').slice(0, 10)
    const topXpLearners = [...users].sort((first, second) => second.xp - first.xp).slice(0, 10)
    const languageStats = overview?.language_stats || []
    const featuredLanguages = ['en', 'te'].map((code) => languageStats.find((item) => item.code === code) || {
        code,
        name: code === 'en' ? 'English' : 'Telugu',
        learners: 0,
    })
    const otherLanguages = languageStats.filter((item) => !['en', 'te'].includes(item.code))
    const totalLessons = curriculum.reduce((total, course) => total + course.lessons.length, 0)
    const topCourse = [...curriculum].sort((first, second) => second.lessons.length - first.lessons.length)[0]
    const topLearningLanguage = languageStats[0]

    const handleDeleteUser = async (name, id) => {
        const confirmed = window.confirm(`Delete ${name}? This action cannot be undone.`)
        if (!confirmed) return

        setDeletingUserId(id)
        try {
            await learningApi.deleteAdminUser(id)
            setUsers((current) => current.filter((person) => person.id !== id))
        } catch (error) {
            window.alert(error.response?.data?.detail || 'The user could not be deleted.')
        } finally {
            setDeletingUserId(null)
        }
    }

    const handleSidebarNavigation = (item) => {
        setActiveSection(item.label)
        window.setTimeout(() => document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
    }

    const allLessons = curriculum.flatMap((course) => course.lessons.map((lesson) => ({
        ...lesson,
        courseTitle: course.title,
    })))

    const selectedCourse = curriculum.find((course) => course.id === selectedCourseId)
    const lessonsToManage = selectedCourse ? selectedCourse.lessons : allLessons
    const coursePageCount = Math.max(1, Math.ceil(curriculum.length / CURRICULUM_PER_PAGE))
    const lessonPageCount = Math.max(1, Math.ceil(lessonsToManage.length / CURRICULUM_PER_PAGE))
    const visibleCourses = curriculum.slice((coursePage - 1) * CURRICULUM_PER_PAGE, coursePage * CURRICULUM_PER_PAGE)
    const visibleLessons = lessonsToManage.slice((lessonPage - 1) * CURRICULUM_PER_PAGE, lessonPage * CURRICULUM_PER_PAGE)

    useEffect(() => {
        setCoursePage(1)
        setLessonPage(1)
    }, [activeSection, selectedCourseId])

    const renderAdminSection = () => {
        if (activeSection === 'Dashboard' || activeSection === 'Users') return null

        if (activeSection === 'Courses') {
            return (
                <div className="admin-section-list">
                    <div className="admin-course-overview-grid">
                        <article><span>Courses</span><strong>{curriculum.length}</strong><small>Total courses in curriculum</small></article>
                        <article><span>Lessons</span><strong>{totalLessons}</strong><small>Lessons across all courses</small></article>
                        <article><span>Top language</span><strong>{topLearningLanguage?.name || 'No data'}</strong><small>{topLearningLanguage ? `${topLearningLanguage.learners} learners` : 'No learners yet'}</small></article>
                        <article><span>Largest course</span><strong>{topCourse?.title || 'No data'}</strong><small>{topCourse ? `${topCourse.lessons.length} lessons` : 'No courses yet'}</small></article>
                    </div>
                    <section className="admin-language-panel">
                        <div className="admin-panel-header"><div><p className="admin-kicker">Learner distribution</p><h2>Learning languages</h2></div><span className="admin-section-badge">Live data</span></div>
                        <div className="admin-language-featured">
                            {featuredLanguages.map((language) => <article key={language.code} className="admin-language-card"><span>{language.code.toUpperCase()}</span><strong>{language.learners}</strong><small>{language.name} learners</small></article>)}
                        </div>
                        <div className="admin-language-list">
                            {otherLanguages.map((language) => <div key={language.code}><span>{language.name}</span><strong>{language.learners}</strong></div>)}
                            {!languageStats.length && <p className="admin-section-empty">No learner language data available.</p>}
                        </div>
                    </section>
                    <div className="admin-section-toolbar"><div><strong>Curriculum library</strong><span>Manage courses and their lessons.</span></div><div className="admin-section-toolbar-actions"><button type="button" className="admin-create-cancel" onClick={() => setActiveSection('Dashboard')}>Dashboard</button><button type="button" className="admin-create-submit" onClick={handleCreateCourse}>+ Add course</button></div></div>
                    {loadingCurriculum ? <p className="admin-section-empty">Loading courses...</p> : visibleCourses.map((course, index) => (
                        <article key={course.id} className="admin-curriculum-card">
                            <div className="admin-curriculum-card-head">
                                <span className="admin-course-mark">{String((coursePage - 1) * CURRICULUM_PER_PAGE + index + 1).padStart(2, '0')}</span>
                                <div className="admin-curriculum-card-copy"><strong>{course.title}</strong><small>{course.description || 'No description provided'}</small></div>
                                <span className="admin-course-count">{course.lessons.length} lessons</span>
                            </div>
                            <div className="admin-curriculum-card-footer">
                                <span>Course #{course.id}</span>
                                <div className="admin-section-actions"><button type="button" className="admin-action-link" onClick={() => { setSelectedCourseId(course.id); setActiveSection('Lessons') }}>Manage lessons</button><button type="button" className="admin-action-link" onClick={() => handleEditCourse(course)}>Edit</button><button type="button" className="admin-action-danger" onClick={() => handleDeleteCourse(course)}>Delete</button></div>
                            </div>
                        </article>
                    ))}
                    {!loadingCurriculum && curriculum.length === 0 && <p className="admin-section-empty">No courses found in the database.</p>}
                    {!loadingCurriculum && curriculum.length > 0 && <div className="admin-curriculum-pagination"><span>{(coursePage - 1) * CURRICULUM_PER_PAGE + 1}-{Math.min(coursePage * CURRICULUM_PER_PAGE, curriculum.length)} of {curriculum.length}</span><button type="button" disabled={coursePage === 1} onClick={() => setCoursePage((page) => page - 1)}>Previous</button>{Array.from({ length: coursePageCount }, (_, index) => index + 1).map((page) => <button type="button" key={page} className={coursePage === page ? 'active' : ''} onClick={() => setCoursePage(page)}>{page}</button>)}<button type="button" disabled={coursePage === coursePageCount} onClick={() => setCoursePage((page) => page + 1)}>Next</button></div>}
                </div>
            )
        }

        if (activeSection === 'Lessons') {
            const lessonsToShow = lessonsToManage
            return (
                <div className="admin-section-list">
                    <div className="admin-section-toolbar"><div><strong>{selectedCourse ? selectedCourse.title : 'All lessons'}</strong><span>{selectedCourse ? 'Lesson sequence for this course.' : 'Select a course to manage its lesson sequence.'}</span></div><div className="admin-section-toolbar-actions"><button type="button" className="admin-create-cancel" onClick={() => setActiveSection('Dashboard')}>Dashboard</button>{selectedCourse && <button type="button" className="admin-create-submit" onClick={() => handleCreateLesson(selectedCourse)}>+ Add lesson</button>}</div></div>
                    {loadingCurriculum ? <p className="admin-section-empty">Loading lessons...</p> : visibleLessons.map((lesson) => (
                        <article key={lesson.id} className="admin-lesson-row">
                            <span className="admin-lesson-number">{lesson.order_number}</span><div className="admin-lesson-copy"><strong>{lesson.title}</strong><small>{lesson.courseTitle || selectedCourse?.title}</small></div><span className="admin-lesson-type">{lesson.lesson_type}</span><div className="admin-section-actions"><button type="button" className="admin-action-link" onClick={() => handleEditLesson(lesson)}>Edit</button><button type="button" className="admin-action-danger" onClick={() => handleDeleteLesson(lesson)}>Delete</button></div>
                        </article>
                    ))}
                    {!loadingCurriculum && lessonsToShow.length === 0 && <p className="admin-section-empty">No lessons found in the database.</p>}
                    {!loadingCurriculum && lessonsToShow.length > 0 && <div className="admin-curriculum-pagination"><span>{(lessonPage - 1) * CURRICULUM_PER_PAGE + 1}-{Math.min(lessonPage * CURRICULUM_PER_PAGE, lessonsToShow.length)} of {lessonsToShow.length}</span><button type="button" disabled={lessonPage === 1} onClick={() => setLessonPage((page) => page - 1)}>Previous</button>{Array.from({ length: lessonPageCount }, (_, index) => index + 1).map((page) => <button type="button" key={page} className={lessonPage === page ? 'active' : ''} onClick={() => setLessonPage(page)}>{page}</button>)}<button type="button" disabled={lessonPage === lessonPageCount} onClick={() => setLessonPage((page) => page + 1)}>Next</button></div>}
                </div>
            )
        }

        if (activeSection === 'Games') {
            return <div className="admin-section-metrics"><strong>{overview?.game_activity || 0}</strong><span>Total game activity recorded from learners</span><strong>{overview?.game_activity_today || 0}</strong><span>Game activities today</span></div>
        }

        if (activeSection === 'Rewards') {
            return <div className="admin-section-metrics"><strong>{overview?.xp_earned || 0}</strong><span>Total XP earned by learners</span><strong>{users.reduce((total, person) => total + Number(person.xp || 0), 0)}</strong><span>Current learner XP</span></div>
        }

        if (activeSection === 'Analytics') {
            return <div className="admin-section-metrics"><strong>{overview?.active_users || 0}</strong><span>Active users today</span><strong>{overview?.average_completion || 0}%</strong><span>Average lesson completion</span><strong>{overview?.study_time_seconds ? `${Math.round(overview.study_time_seconds / 60)} min` : '0 min'}</strong><span>Validated study time</span></div>
        }

        return <div className="admin-section-settings"><strong>Admin account</strong><span>{user?.email}</span><strong>Access</strong><span>Administrator-only dashboard</span></div>
    }

    const handleAccountCreated = (createdUser) => {
        setUsers((current) => [
            {
                id: createdUser.id,
                name: `${createdUser.first_name} ${createdUser.last_name}`.trim(),
                email: createdUser.email,
                role: createdUser.role,
                is_active: true,
                xp: 0,
                status: 'Inactive',
            },
            ...current,
        ])
    }

    const handleUserSaved = (updatedUser) => {
        setUsers((current) => current.map((person) => person.id === updatedUser.id
            ? { ...person, name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(), email: updatedUser.email, role: updatedUser.role }
            : person))
    }

    const handleToggleUser = async (person) => {
        try {
            const result = await learningApi.updateAdminUserStatus(person.id)
            setUsers((current) => current.map((item) => item.id === person.id
                ? { ...item, is_active: result.is_active, status: result.is_active ? item.status : 'Inactive' }
                : item))
        } catch (error) {
            window.alert(error.response?.data?.detail || 'Could not update account status.')
        }
    }

    const handleResetPassword = async (person) => {
        const password = window.prompt(`Enter a new password for ${person.name} (minimum 8 characters):`)
        if (password === null) return
        if (password.length < 8) {
            window.alert('Password must be at least 8 characters long.')
            return
        }
        try {
            await learningApi.resetAdminUserPassword(person.id, password)
            window.alert('Password reset successfully.')
        } catch (error) {
            window.alert(error.response?.data?.detail || 'Could not reset password.')
        }
    }

    return (
        <div className="admin-dashboard-page">
            <aside className="admin-sidebar-shell">
                <div className="admin-sidebar-brand">
                    <div className="admin-logo-box">N</div>
                    <div>
                        <strong>NeoLit</strong>
                        <small>Admin panel</small>
                    </div>
                </div>

                <nav className="admin-sidebar-nav" aria-label="Admin navigation">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            className={`admin-side-item ${activeSection === item.label ? 'selected' : ''}`}
                            aria-current={activeSection === item.label ? 'page' : undefined}
                            onClick={() => handleSidebarNavigation(item)}
                        >
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="admin-main-shell">
                <header className="admin-top-header">
                    <div>
                        <p className="admin-kicker">Admin</p>
                        <h1>{activeSection === 'Dashboard' ? 'Platform Overview' : activeSection}</h1>
                    </div>
                    <div className="admin-header-user">
                        <span className="admin-header-pill">Admin ▼</span>
                        <span className="admin-user-name">{userName}</span>
                        <button type="button" className="admin-create-account-button" onClick={() => setShowCreateAccount(true)}>+ Create account</button>
                        <button type="button" className="admin-logout-button" onClick={logout}>Log out</button>
                    </div>
                </header>

                {activeSection !== 'Dashboard' && activeSection !== 'Users' && (
                    <section id="admin-section-content" className="admin-section-panel">
                        <div className="admin-panel-header"><h2>{activeSection}</h2><span className="admin-section-badge">Live data</span></div>
                        {renderAdminSection()}
                    </section>
                )}

                {activeSection === 'Dashboard' && <>
                    <section id="admin-overview" className="admin-summary-grid">
                        {overviewError && <p className="admin-section-empty admin-overview-error">{overviewError}</p>}
                        {statCards.map((card) => (
                            <article key={card.label} className={`admin-summary-card ${card.tone}`}>
                                <strong>{loadingOverview ? '...' : card.raw ? card.value : Number(card.value || 0).toLocaleString()}</strong>
                                <span>{card.label}</span>
                            </article>
                        ))}
                    </section>

                    <section className="admin-activity-panel admin-activity-leaderboard">
                        <div className="admin-panel-header">
                            <div><p className="admin-kicker">Live learner data</p><h2>User Activity</h2></div>
                            <span className="admin-section-badge">Top 10</span>
                        </div>

                        <div className="admin-activity-columns">
                            <div className="admin-activity-column">
                                <h3>Active learners</h3>
                                {activeLearners.length ? activeLearners.map((person, index) => (
                                    <div key={person.id} className="admin-activity-learner">
                                        <strong className="admin-rank-number">{index + 1}</strong>
                                        <span className="admin-learner-avatar">{person.name.charAt(0).toUpperCase()}</span>
                                        <span className="admin-activity-learner-name">{person.name}</span>
                                        <span className="admin-activity-learner-score">🔥 {person.streak_days || 0}</span>
                                    </div>
                                )) : <p className="admin-section-empty">No learners active today.</p>}
                            </div>
                            <div className="admin-activity-column">
                                <h3>Top XP learners</h3>
                                {topXpLearners.length ? topXpLearners.map((person, index) => (
                                    <div key={person.id} className="admin-activity-learner">
                                        <strong className="admin-rank-number">{index + 1}</strong>
                                        <span className="admin-learner-avatar">{person.name.charAt(0).toUpperCase()}</span>
                                        <span className="admin-activity-learner-name">{person.name}</span>
                                        <span className="admin-activity-learner-score">{person.xp} XP</span>
                                    </div>
                                )) : <p className="admin-section-empty">No learner data available.</p>}
                            </div>
                        </div>
                    </section>

                </>}

                {activeSection === 'Users' && <section id="admin-users" className="admin-user-table-panel">
                    <div className="admin-table-head">
                        <h2>Recent Users</h2>
                        <div className="admin-search-box">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search"
                                aria-label="Search users"
                            />
                        </div>
                    </div>

                    <div className="admin-user-table-wrap">
                        <table className="admin-user-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Learner</th>
                                    <th>XP</th>
                                    <th>Streak</th>
                                    <th>Study time</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingUsers ? (
                                    <tr>
                                        <td colSpan="8" className="admin-empty-row">Loading users...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="admin-empty-row">No users found.</td>
                                    </tr>
                                ) : visibleUsers.map((person, index) => (
                                    <tr key={person.id}>
                                        <td><strong className="admin-rank-number">{((currentPage - 1) * USERS_PER_PAGE) + index + 1}</strong></td>
                                        <td>
                                            <div className="admin-learner-cell">
                                                <span className="admin-learner-avatar">{person.name.charAt(0).toUpperCase()}</span>
                                                <span>
                                                    <strong>{person.name}</strong>
                                                    <small>{person.email}</small>
                                                </span>
                                            </div>
                                        </td>
                                        <td>{person.xp}</td>
                                        <td><span className="admin-streak-value">🔥 {person.streak_days || 0}</span></td>
                                        <td>{Math.round((person.study_time_seconds || 0) / 60)} min</td>
                                        <td>{person.role || 'user'}</td>
                                        <td><span className={statusStyle(person.status)}>{person.status}</span></td>
                                        <td>
                                            <div className="admin-row-actions">
                                                <button type="button" className="admin-action-link" onClick={() => setUserDialog({ user: person, mode: 'view' })}>View</button>
                                                <button type="button" className="admin-action-link" onClick={() => setUserDialog({ user: person, mode: 'edit' })}>Edit</button>
                                                <button type="button" className="admin-action-link" onClick={() => handleToggleUser(person)}>{person.is_active ? 'Disable' : 'Enable'}</button>
                                                <button type="button" className="admin-action-link" onClick={() => handleResetPassword(person)}>Reset password</button>
                                                <button type="button" className="admin-action-link" onClick={() => setUserDialog({ user: person, mode: 'progress' })}>Progress</button>
                                                <button type="button" className="admin-action-link" onClick={() => setUserDialog({ user: person, mode: 'history' })}>History</button>
                                                <button type="button" className="admin-action-link" onClick={() => setUserDialog({ user: person, mode: 'games' })}>Games</button>
                                                <button type="button" className="admin-action-danger" disabled={deletingUserId === person.id} onClick={() => handleDeleteUser(person.name, person.id)}>
                                                    {deletingUserId === person.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!loadingUsers && filteredUsers.length > 0 && (
                        <div className="admin-pagination" aria-label="User pages">
                            <span className="admin-pagination-range">
                                {(currentPage - 1) * USERS_PER_PAGE + 1}-{Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                            </span>
                            <button
                                type="button"
                                className="admin-page-button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    className={`admin-page-button ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="admin-page-button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>}
            </main>
            {showCreateAccount && (
                <AdminCreateAccount
                    onClose={() => setShowCreateAccount(false)}
                    onCreated={handleAccountCreated}
                />
            )}
            {userDialog && (
                <AdminUserDialog
                    user={userDialog.user}
                    mode={userDialog.mode}
                    onClose={() => setUserDialog(null)}
                    onSaved={handleUserSaved}
                />
            )}
        </div>
    )
}
