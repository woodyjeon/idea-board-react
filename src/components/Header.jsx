import { LayoutGrid, Map } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isLocalDataMode } from "../lib/dataMode";

/** @typedef {'board' | 'roadmap'} AppPage */

function Header({
  activePage,
  isHidden = false,
  onPageChange,
  onHomeClick,
  onHoverAreaEnter,
  onHoverAreaLeave,
}) {
  const { user, isLoggedIn, openLogin, logout } = useAuth();
  const isLocal = isLocalDataMode();

  return (
    <header
      id="app-header"
      className={`app-header ${isHidden ? "app-header--hidden" : ""}`}
      onMouseEnter={onHoverAreaEnter}
      onMouseLeave={onHoverAreaLeave}
    >
      <div className="app-topbar">
        <div className="app-topbar-left">
          <button
            type="button"
            className="app-brand"
            onClick={onHomeClick}
            aria-label="처음으로"
          >
            <img
              src="/wj_logo.svg"
              alt=""
              className="app-brand-logo"
              aria-hidden="true"
            />
            <span className="app-brand-name">아이디어 스파크보드</span>
          </button>
          {isLocal && (
            <span className="app-env-badge" title="localStorage 모드">
              LOCAL
            </span>
          )}
        </div>

        <div className="app-topbar-right">
          {isLoggedIn ? (
            <>
              <span className="app-user-chip">{user.name}</span>
              <button type="button" className="app-topbar-btn" onClick={logout}>
                로그아웃
              </button>
            </>
          ) : (
            <button
              type="button"
              className="app-topbar-btn app-topbar-btn--primary"
              onClick={openLogin}
            >
              로그인
            </button>
          )}
        </div>
      </div>

      <div className="app-project-bar">
        <div className="app-project-meta">
          <span className="app-project-key">IDEA</span>
          <span className="app-project-title">연구 아이디어 프로젝트</span>
        </div>

        <nav className="app-tabs" aria-label="프로젝트 보기">
          <button
            type="button"
            className={`app-tab ${activePage === "board" ? "app-tab--active" : ""}`}
            aria-current={activePage === "board" ? "page" : undefined}
            onClick={() => onPageChange("board")}
          >
            <LayoutGrid size={16} strokeWidth={2} aria-hidden="true" />
            보드
          </button>
          <button
            type="button"
            className={`app-tab ${activePage === "roadmap" ? "app-tab--active" : ""}`}
            aria-current={activePage === "roadmap" ? "page" : undefined}
            onClick={() => onPageChange("roadmap")}
          >
            <Map size={16} strokeWidth={2} aria-hidden="true" />
            로드맵
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
