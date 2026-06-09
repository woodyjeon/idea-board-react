import sparkLogo from "../assets/spark-board-logo.svg";
import { useAuth } from "../context/AuthContext";
import { isLocalDataMode } from "../lib/dataMode";

function Header() {
  const { user, isLoggedIn, openLogin, logout } = useAuth();
  const isLocal = isLocalDataMode();

  return (
    <header className="board-header">
      <div className="board-header-row">
        <div className="board-header-brand">
          <img
            src={sparkLogo}
            alt=""
            className="board-header-logo"
            aria-hidden="true"
          />
          <h1>아이디어 스파크보드</h1>
          {isLocal && (
            <span className="data-mode-badge" title="localStorage 모드">
              로컬
            </span>
          )}
        </div>
        <div className="board-header-auth">
          {isLoggedIn ? (
            <>
              <span className="auth-user-name">{user.name}님</span>
              <button type="button" className="auth-btn" onClick={logout}>
                로그아웃
              </button>
            </>
          ) : (
            <button type="button" className="auth-btn auth-btn--primary" onClick={openLogin}>
              로그인
            </button>
          )}
        </div>
      </div>
      <p>떠오른 연구 아이디어를 기록하고, 분야별로 탐색해 보세요</p>
    </header>
  );
}

export default Header;
