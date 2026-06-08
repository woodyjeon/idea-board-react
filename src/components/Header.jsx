import sparkLogo from "../assets/spark-board-logo.svg";

function Header() {
  return (
    <header className="board-header">
      <div className="board-header-brand">
        <img
          src={sparkLogo}
          alt=""
          className="board-header-logo"
          aria-hidden="true"
        />
        <h1>아이디어 스파크보드</h1>
      </div>
      <p>떠오른 연구 아이디어를 기록하고, 분야별로 탐색해 보세요</p>
    </header>
  );
}

export default Header;
