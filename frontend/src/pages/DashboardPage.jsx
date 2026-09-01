import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { learningApi } from '../services/learningApi'

const skills = ['reading', 'writing', 'comprehension']

function ProgressBar({ value }) {
    return <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${value || 0}%` }} />
    </div>
}

function ScoreCard({ label, item, featured = false }) {
    return <article className={`rounded-2xl border p-5 ${featured ? 'border-slate-950 bg-slate-950 text-white shadow-xl' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-start justify-between gap-3">
            <p className={`text-sm capitalize ${featured ? 'text-emerald-300' : 'text-slate-500'}`}>{label}</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${featured ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>{item?.level || 'Beginner'}</span>
        </div>
        <p className="mt-4 text-4xl font-bold tracking-tight">{item?.score || 0}<span className="text-lg font-medium text-slate-400">%</span></p>
        <div className="mt-5"><ProgressBar value={item?.score} /></div>
    </article>
}

function AssessmentCard({ assessment, levelName, active, onSelect }) {
    return <button onClick={onSelect} className={`w-full rounded-xl border p-4 text-left transition ${active ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-sm'}`}>
        <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">{assessment.assessment_type}</span>
            <span className="text-xs font-bold text-emerald-700">{levelName(assessment.level_id)}</span>
        </div>
        <p className="mt-3 font-bold text-slate-950">{assessment.title}</p>
        <p className="mt-1 text-xs text-slate-500">{assessment.questions.length} questions • {assessment.total_marks} marks</p>
    </button>
}

export default function DashboardPage() {
    const { user, logout } = useAuth()
    const [languages, setLanguages] = useState([])
    const [levels, setLevels] = useState([])
    const [modules, setModules] = useState([])
    const [assessments, setAssessments] = useState([])
    const [profile, setProfile] = useState(null)
    const [progress, setProgress] = useState(null)
    const [selected, setSelected] = useState(null)
    const [answers, setAnswers] = useState({})
    const [expandedModule, setExpandedModule] = useState(null)
    const [result, setResult] = useState(null)
    const [nextAssessment, setNextAssessment] = useState(null)
    const [message, setMessage] = useState('')
    const [activeSkill, setActiveSkill] = useState('reading')

    useEffect(() => {
        const load = async () => {
            try {
                const [languageData, levelData, profileData, progressData, assessmentData] = await Promise.all([
                    learningApi.getLanguages(), learningApi.getLevels(), learningApi.getProfile(), learningApi.getProgress(), learningApi.getAssessments(),
                ])
                const language = languageData.find((item) => item.code === profileData.learning_language) || languageData[0]
                setLanguages(languageData)
                setLevels(levelData)
                setProfile(profileData)
                setProgress(progressData)
                setAssessments(assessmentData)
                setModules(await learningApi.getCurriculum({ language_id: language?.id, level_id: profileData.current_level_id || levelData[0]?.id }))
            } catch (error) {
                setMessage(error.response?.data?.detail || 'Unable to load your learning space')
            }
        }
        load()
    }, [])

    const visibleAssessments = useMemo(() => assessments.filter((assessment) => assessment.assessment_type === activeSkill), [assessments, activeSkill])
    const levelName = (levelId) => levels.find((level) => level.id === levelId)?.name || 'Beginner'
    const lessonCount = modules.reduce((total, module) => total + module.lessons.length, 0)

    const selectAssessment = (assessment) => {
        setSelected(assessment)
        setAnswers({})
        setResult(null)
        setNextAssessment(null)
    }

    const submit = async (event) => {
        event.preventDefault()
        try {
            const assessmentResult = await learningApi.submitAssessment(selected.id, answers)
            const harderAssessment = assessments.find((assessment) => assessment.assessment_type === selected.assessment_type && assessment.level_id > selected.level_id)
            setResult(assessmentResult)
            setNextAssessment(harderAssessment || null)
            setSelected(null)
            setAnswers({})
            setProgress(await learningApi.getProgress())
            setMessage(harderAssessment ? 'Saved. Review your result before continuing.' : 'Assessment saved to your progress.')
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Unable to submit assessment')
        }
    }

    return <div className="min-h-screen bg-[#f5f7f5] text-slate-900">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-8 sm:py-8">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">N</div><div><p className="text-sm font-bold">NeoLit</p><p className="text-xs text-slate-500">Literacy lab</p></div></div>
                <div className="flex items-center gap-2"><Link to="/profile" className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 transition hover:border-emerald-500"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">{user?.first_name?.[0] || 'L'}</span><span className="hidden text-sm font-semibold sm:block">Profile</span></Link><button onClick={logout} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Log out</button></div>
            </header>

            <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Your learning space</p><h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">Keep your momentum, {user?.first_name || 'learner'}.</h1><p className="mt-3 max-w-xl text-slate-600">Short practice sessions add up. Continue with {lessonCount || 'your'} lessons in {languages.find((item) => item.code === profile?.learning_language)?.name || 'your chosen language'}.</p></div><div className="rounded-2xl bg-emerald-600 p-5 text-white shadow-lg"><p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Current focus</p><p className="mt-2 text-2xl font-bold">{levelName(profile?.current_level_id)}</p><p className="mt-1 text-sm text-emerald-100">Keep practicing to reach your next benchmark.</p></div></section>
            {message && <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p>}
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ScoreCard label="overall" item={progress?.overall} featured />{skills.map((skill) => <ScoreCard key={skill} label={skill} item={progress?.[skill]} />)}</section>

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]"><main className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Learning path</p><h2 className="mt-1 text-2xl font-bold">Your lessons</h2><p className="mt-1 text-sm text-slate-500">Follow each module from first phrase to confident practice.</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{modules.length} modules</span></div><div className="mt-6 space-y-3">{modules.map((module) => <article key={module.id} className="overflow-hidden rounded-xl border border-slate-200"><button onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)} className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-50"><span><span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Module {String(module.order_number).padStart(2, '0')}</span><span className="mt-1 block font-bold text-slate-950">{module.title}</span><span className="mt-1 block text-sm text-slate-600">{module.description}</span></span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500" aria-hidden="true">{expandedModule === module.id ? '-' : '+'}</span></button>{expandedModule === module.id && <div className="border-t border-slate-200 bg-slate-50 p-4"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Lessons in this module</p><div className="grid gap-3 sm:grid-cols-3">{module.lessons.map((lesson) => <div key={lesson.id} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-emerald-700">Lesson {lesson.order_number}</p><h3 className="mt-1 font-bold text-slate-950">{lesson.title}</h3><p className="mt-2 text-sm leading-5 text-slate-600">{lesson.description}</p><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{lesson.activities.length} activities</span><span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">Ready</span></div></div>)}</div></div>}</article>)}</div></section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Skill check</p><h2 className="mt-1 text-2xl font-bold">Assessment center</h2><p className="mt-1 text-sm text-slate-600">Choose a skill, complete one set, then review your result.</p></div><div className="flex max-w-full overflow-x-auto rounded-lg bg-slate-100 p-1">{skills.map((skill) => <button key={skill} onClick={() => { setActiveSkill(skill); setSelected(null); setResult(null); setNextAssessment(null) }} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-bold capitalize ${activeSkill === skill ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>{skill}</button>)}</div></div><div className="mt-6 grid gap-3 md:grid-cols-2">{visibleAssessments.map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} levelName={levelName} active={selected?.id === assessment.id} onSelect={() => selectAssessment(assessment)} />)}</div>{selected && <form onSubmit={submit} className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5"><div className="mb-5 flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{levelName(selected.level_id)} challenge</span><h3 className="mt-1 text-xl font-bold text-slate-950">{selected.title}</h3></div><span className="text-sm font-bold text-slate-500">{selected.questions.length} questions</span></div><div className="space-y-5">{selected.questions.map((question, index) => <fieldset key={question.id}><legend className="text-sm font-semibold leading-6 text-slate-800">{index + 1}. {question.question_text}</legend>{question.options.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"><input type="radio" name={`question-${question.id}`} value={option.option_text} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })} required />{option.option_text}</label>)}</div> : <textarea className="mt-3 min-h-32 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm" placeholder="Write your response here..." required onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })} />}</fieldset>)}</div><button className="mt-6 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">Submit assessment</button></form>}{result && <div className="mt-6 rounded-xl bg-slate-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Assessment complete</p><p className="mt-2 text-3xl font-bold">{result.percentage}%</p><p className="mt-1 text-sm text-slate-300">Benchmark: {result.proficiency_level}</p>{nextAssessment && <button type="button" onClick={() => { setSelected(nextAssessment); setNextAssessment(null); setResult(null); setAnswers({}) }} className="mt-4 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-400">Next challenge</button>}</div>}</section>
            </main><aside className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Quick profile</p><div className="mt-4 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">{user?.first_name?.[0] || 'L'}</span><div><p className="font-bold">{profile?.first_name} {profile?.last_name}</p><p className="text-sm text-slate-500">{languages.find((item) => item.code === profile?.learning_language)?.name || 'Learning language'}</p></div></div><Link to="/profile" className="mt-5 block w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-emerald-500">Edit profile</Link></section><section className="rounded-2xl bg-[#dcefe4] p-6"><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">A small reminder</p><p className="mt-3 text-lg font-bold leading-7 text-slate-950">Consistency beats cramming.</p><p className="mt-2 text-sm leading-6 text-slate-700">Finish one lesson today and let your progress build from there.</p></section></aside></div>
        </div>
    </div>
}
