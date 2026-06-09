import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LOCAL_USERS, SUPABASE_DEMO_USERS } from "../data/users.js";
import { isLocalDataMode } from "../lib/dataMode";

function LoginModal({ isOpen, onClose }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setMode("login");
      setEmail("");
      setPassword("");
      setName("");
      setError("");
    }
  }, [isOpen]);

  const demoUsers = isLocalDataMode() ? LOCAL_USERS : SUPABASE_DEMO_USERS;

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const message =
        mode === "login"
          ? await login(email, password)
          : await signup({ email, password, name });

      if (message) setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="confirm-dialog auth-dialog"
        role="dialog"
        aria-labelledby="auth-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="auth-dialog-title" className="confirm-dialog-title">
          {mode === "login" ? "로그인" : "회원가입"}
        </h3>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            로그인
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "signup" ? "auth-tab--active" : ""}`}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            회원가입
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <label htmlFor="auth-name">이름</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                autoComplete="name"
              />
            </>
          )}

          <label htmlFor="auth-email">이메일</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
          />

          <label htmlFor="auth-password">비밀번호</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "4자 이상" : "비밀번호"}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
          />

          {error && <p className="auth-error">{error}</p>}

          {mode === "login" && (
            <p className="auth-hint">
              {demoUsers.map((user) => (
                <span key={user.id}>
                  {user.name}: {user.email} / {user.password}
                  <br />
                </span>
              ))}
            </p>
          )}

          <div className="confirm-dialog-actions confirm-dialog-actions--single">
            <button type="submit" className="confirm-btn-ok" disabled={isSubmitting}>
              {isSubmitting
                ? "처리 중..."
                : mode === "login"
                  ? "로그인"
                  : "가입하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
