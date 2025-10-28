import { useEffect, useState } from "react";

export default function App() {
  // string för stabil caret + tillåta tom input
  const [amountStr, setAmountStr] = useState("1");
  const [fromCur, setFromCur] = useState("EUR");
  const [toCur, setToCur] = useState("USD");
  const [converted, setConverted] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setErr("");
        setIsLoading(true);

        // tomt belopp → visa inget
        if (amountStr.trim() === "") {
          setConverted("");
          return;
        }

        const normalized = amountStr.replace(",", ".");
        const amount = Number(normalized);
        if (!Number.isFinite(amount)) {
          setConverted("");
          setErr("Ogiltigt belopp.");
          return;
        }

        // samma valuta → ingen fetch
        if (fromCur === toCur) {
          setConverted(amount.toString());
          return;
        }

        const res = await fetch(
          `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCur}&to=${toCur}`
        );
        if (!res.ok) throw new Error("Nätverksfel");
        const data = await res.json();
        setConverted(String(data.rates[toCur]));
      } catch (e) {
        setConverted("");
        setErr(e?.message || "Något gick fel.");
      } finally {
        setIsLoading(false);
      }
    }, 500); // Vänta 500ms efter senaste knapptryckningen

    return () => clearTimeout(timeoutId); // Rensa timeout om ny input kommer
  }, [amountStr, fromCur, toCur]);

  function handleClear() {
    setAmountStr("");
    setConverted("");
    setErr("");
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Currency Converter</h1>

        <div className="row">
          <div className="amountGroup">
            <input
              type="text"
              inputMode="decimal"
              className="input"
              placeholder="Amount"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              aria-label="Amount"
            />
            <button
              className="btn ghost"
              onClick={handleClear}
              disabled={isLoading || amountStr === ""}
              title="Clear"
            >
              ×
            </button>
          </div>

          <select
            className="select"
            value={fromCur}
            onChange={(e) => setFromCur(e.target.value)}
            disabled={isLoading}
            aria-label="From currency"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
            <option value="INR">INR</option>
            <option value="SEK">SEK</option>
          </select>

          <span className="arrow">→</span>

          <select
            className="select"
            value={toCur}
            onChange={(e) => setToCur(e.target.value)}
            disabled={isLoading}
            aria-label="To currency"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
            <option value="INR">INR</option>
            <option value="SEK">SEK</option>
          </select>
        </div>

        <div className="output">
          {isLoading ? (
            <span className="muted">Converting…</span>
          ) : err ? (
            <span className="error">⛔ {err}</span>
          ) : converted !== "" ? (
            <span className="result">
              {amountStr || "0"} {fromCur} ={" "}
              <strong>
                {Number.isFinite(Number(converted))
                  ? Number(converted).toFixed(2)
                  : converted}
              </strong>{" "}
              {toCur}
            </span>
          ) : (
            <span className="muted">Ange ett belopp för att börja</span>
          )}
        </div>
      </div>

      {/* Centrering + lila bakgrund + stilren UI */}
      <style>{`
        :root {
          --bg1: #3a0ca3;
          --bg2: #7209b7;
          --bg3: #560bad;
          --card: rgba(255, 255, 255, 0.08);
          --text: #f3e8ff;
          --muted: #d0b9ff;
          --accent: #b794f4;
          --error: #ff7b7b;
          --border: rgba(255, 255, 255, 0.1);
        }

        html, body, #root { height: 100%; margin: 0; }

        .page{
          min-height: 100dvh;                 /* fyll viewporten */
          display: grid;
          place-items: center;                /* mitten, X + Y */
          background: linear-gradient(135deg, var(--bg1), var(--bg2), var(--bg3));
        }

        .card {
          width: min(92vw, 520px);
          background: var(--card);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
          border: 1px solid var(--border);
          text-align: center;
        }

        h1 {
          margin: 0 0 22px 0;
          font-weight: 700;
          font-size: 1.8rem;
          background: linear-gradient(90deg, #e8d4ff, #ffffff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          gap: 12px;
          align-items: center;
          justify-content: center;
        }

        .amountGroup {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input,
        .select {
          padding: 10px 14px;
          font-size: 1rem;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.12);
          color: var(--text);
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
        }

        .input:focus,
        .select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px rgba(183, 148, 244, 0.3);
        }

        .btn {
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s ease;
          background: rgba(255, 255, 255, 0.12);
          color: var(--text);
          padding: 8px 12px;
        }

        .btn:hover { background: rgba(255, 255, 255, 0.2); }

        .btn.ghost {
          font-size: 1.25rem;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arrow { color: var(--muted); font-size: 1.4rem; }

        .output {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.12);
        }

        .muted { color: var(--muted); }
        .error { color: var(--error); font-weight: 600; }
        .result { color: #ffffff; font-weight: 700; }
        strong { color: var(--accent); }
      `}</style>
    </div>
  );
}
