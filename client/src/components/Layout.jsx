import Sidebar from "./Sidebar";
import GlobalSearch from "./GlobalSearch";

function Layout({ children, showSearch = true }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {showSearch && <GlobalSearch />}
        {children}
      </main>
    </div>
  );
}

export default Layout;
