const navItems = [
    { label: 'Overview', active: true },
    { label: 'Students' },
    { label: 'Courses' },
    { label: 'Assessments' },
    { label: 'Reports' },
    { label: 'Settings' },
]

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand-box">
                <div className="admin-brand-logo">N</div>
                <div>
                    <p className="admin-brand-name">NeoLit</p>
                    <span className="admin-brand-subtitle">Office</span>
                </div>
            </div>

            <nav className="admin-nav" aria-label="Admin navigation">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        className={`admin-nav-item ${item.active ? 'active' : ''}`}
                    >
                        <span className="admin-nav-dot" aria-hidden="true" />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="admin-mini-card">
                <span className="admin-mini-label">System health</span>
                <strong>98.4%</strong>
                <small>All core services are stable.</small>
            </div>
        </aside>
    )
}
