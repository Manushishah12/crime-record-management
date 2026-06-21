import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setResults(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const go = (path) => {
    navigate(path);
    setQuery("");
    setResults(null);
  };

  const hasResults =
    results &&
    (results.criminals?.length > 0 ||
      results.cases?.length > 0 ||
      results.officers?.length > 0);

  return (
    <div className="global-search" ref={ref}>
      <input
        className="form-control"
        placeholder="Search criminals, cases, officers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && results && (
        <div className="search-results">
          {loading && <div className="search-section">Searching...</div>}
          {!loading && !hasResults && (
            <div className="search-section">No results for &quot;{query}&quot;</div>
          )}
          {results.criminals?.length > 0 && (
            <div className="search-section">
              <h4>Criminals</h4>
              {results.criminals.map((c) => (
                <a
                  key={c._id}
                  className="search-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    go(`/criminals/${c._id}`);
                  }}
                >
                  {c.name} — {c.status}
                </a>
              ))}
            </div>
          )}
          {results.cases?.length > 0 && (
            <div className="search-section">
              <h4>Cases</h4>
              {results.cases.map((c) => (
                <a
                  key={c._id}
                  className="search-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    go(`/cases/${c._id}`);
                  }}
                >
                  {c.caseNumber} — {c.crimeType}
                </a>
              ))}
            </div>
          )}
          {results.officers?.length > 0 && (
            <div className="search-section">
              <h4>Officers</h4>
              {results.officers.map((o) => (
                <a
                  key={o._id}
                  className="search-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    go(`/officers/${o._id}`);
                  }}
                >
                  {o.name} — {o.badgeNumber}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
