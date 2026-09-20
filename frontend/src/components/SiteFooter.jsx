import { Link } from 'react-router-dom'

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer-brand">
                <strong>NeoLit</strong>
                <span>Learn languages through practice and play.</span>
            </div>
            <nav className="site-footer-links" aria-label="Footer navigation">
                <Link to="/learning-path">Learn</Link>
                <Link to="/games">Games</Link>
                <Link to="/profile">Profile</Link>
            </nav>
            <small>© 2026 NeoLit</small>
        </footer>
    )
}
