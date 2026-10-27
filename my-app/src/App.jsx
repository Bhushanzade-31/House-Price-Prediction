import { useState } from "react";
//import env from "./.env";
const API_URL = import.meta.env.VITE_API_URL; // add dackend 
console.log("API_URL:", API_URL);
const FIELDS = [
  { key: "MedInc", label: "Median income", hint: "In $10,000s (e.g. 3.9 = $39,000)", def: 3.87 },
  { key: "HouseAge", label: "House age", hint: "Median age in years", def: 28 },
  { key: "AveRooms", label: "Average rooms", hint: "Rooms per household", def: 5.4 },
  { key: "AveBedrms", label: "Average bedrooms", hint: "Bedrooms per household", def: 1.1 },
  { key: "Population", label: "Population", hint: "People in the block group", def: 1425 },
  { key: "AveOccup", label: "Average occupancy", hint: "People per household", def: 3.1 },
  { key: "Latitude", label: "Latitude", hint: "California: about 32.5 to 42", def: 34.2 },
  { key: "Longitude", label: "Longitude", hint: "California: about -124.3 to -114.3", def: -118.5 },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&display=swap');
.hp { --bg:#e9f0f1; --panel:#ffffff; --ink:#13262b; --muted:#5b7076; --line:#c9d6d9; --accent:#1d6a85; --sun:#e5a93d; --err:#b3361f;
  font-family:'Bricolage Grotesque',system-ui,sans-serif; background:var(--bg); color:var(--ink); min-height:100vh; padding:32px 16px; box-sizing:border-box; }
.hp *, .hp *::before, .hp *::after { box-sizing:border-box; }
.hp-wrap { max-width:880px; margin:0 auto; }
.hp h1 { font-size:clamp(28px,5vw,44px); font-weight:800; margin:0 0 6px; letter-spacing:-0.02em; }
.hp-sub { color:var(--muted); margin:0 0 24px; max-width:56ch; }
.hp-tabs { display:flex; gap:4px; margin-bottom:16px; }
.hp-tab { font:inherit; font-weight:600; padding:10px 18px; border:1px solid var(--line); background:transparent; color:var(--muted); cursor:pointer; border-radius:8px 8px 0 0; }
.hp-tab[aria-selected="true"] { background:var(--panel); color:var(--ink); border-bottom-color:var(--panel); }
.hp-panel { background:var(--panel); border:1px solid var(--line); border-radius:0 10px 10px 10px; padding:24px; }
.hp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; }
.hp label { display:block; font-weight:600; font-size:14px; margin-bottom:4px; }
.hp input[type=number] { width:100%; font:inherit; padding:9px 10px; border:1px solid var(--line); border-radius:6px; background:#fbfdfd; color:var(--ink); }
.hp input:focus-visible, .hp button:focus-visible { outline:3px solid var(--sun); outline-offset:1px; }
.hp-hint { font-size:12px; color:var(--muted); margin-top:3px; }
.hp-btn { font:inherit; font-weight:600; background:var(--accent); color:#fff; border:0; border-radius:8px; padding:11px 22px; cursor:pointer; margin-top:20px; }
.hp-btn:disabled { opacity:.55; cursor:not-allowed; }
.hp-result { margin-top:24px; padding:20px; border-left:6px solid var(--sun); background:#f6f9f9; border-radius:0 8px 8px 0; }
.hp-price { font-size:clamp(34px,7vw,56px); font-weight:800; letter-spacing:-0.02em; line-height:1.1; }
.hp-range { color:var(--muted); margin-top:6px; }
.hp-err { margin-top:16px; color:var(--err); font-weight:600; }
.hp-drop { border:2px dashed var(--line); border-radius:10px; padding:28px; text-align:center; color:var(--muted); }
.hp-code { background:#f1f6f7; padding:2px 6px; border-radius:4px; font-size:13px; word-break:break-word; }
.hp-ok { margin-top:16px; font-weight:600; color:var(--accent); }
`;

function SinglePredict() {
  const [values, setValues] = useState(
    Object.fromEntries(FIELDS.map((f) => [f.key, String(f.def)]))
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const body = {};
    for (const f of FIELDS) {
      const n = parseFloat(values[f.key]);
      if (Number.isNaN(n)) {
        setError(`Enter a number for "${f.label}".`);
        return;
      }
      body[f.key] = n;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Prediction failed.");
      setResult(data);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? `Can't reach the API at ${API_URL}. Is the FastAPI server running?`
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="hp-grid">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key}>{f.label}</label>
            <input
              id={f.key}
              type="number"
              step="any"
              required
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
            <div className="hp-hint">{f.hint}</div>
          </div>
        ))}
      </div>
      <button className="hp-btn" type="submit" disabled={loading}>
        {loading ? "Predicting…" : "Predict price"}
      </button>
      {error && <div className="hp-err" role="alert">{error}</div>}
      {result && (
        <div className="hp-result" aria-live="polite">
          <div className="hp-price">{result.predicted_price}</div>
          <div className="hp-range">Likely range: {result.fidance_range}</div>
        </div>
      )}
    </form>
  );
}

function CsvPredict() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setDone(false);
    if (!file) return setError("Choose a CSV file first.");

    const form = new FormData();
    form.append("file", file);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/predict_csv`, { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Upload failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "predictions.csv";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? `Can't reach the API at ${API_URL}. Is the FastAPI server running?`
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="hp-drop">
        <p style={{ marginTop: 0 }}>
          Your CSV needs these columns:{" "}
          <span className="hp-code">{FIELDS.map((f) => f.key).join(", ")}</span>
        </p>
        <input
          type="file"
          accept=".csv"
          aria-label="CSV file"
          onChange={(e) => {
            setFile(e.target.files[0] || null);
            setDone(false);
            setError("");
          }}
        />
      </div>
      <button className="hp-btn" type="submit" disabled={loading || !file}>
        {loading ? "Predicting…" : "Upload and download predictions"}
      </button>
      {error && <div className="hp-err" role="alert">{error}</div>}
      {done && <div className="hp-ok">Done. predictions.csv has been downloaded.</div>}
    </form>
  );
}

export default function App() {
  const [tab, setTab] = useState("single");

  return (
    <div className="hp">
      <style>{css}</style>
      <div className="hp-wrap">
        <h1>California house prices</h1>
        <p className="hp-sub">
          Estimate the median house value for a block group, one at a time or from a whole CSV.
        </p>

        <div className="hp-tabs" role="tablist">
          <button className="hp-tab" role="tab" aria-selected={tab === "single"} onClick={() => setTab("single")}>
            Single prediction
          </button>
          <button className="hp-tab" role="tab" aria-selected={tab === "csv"} onClick={() => setTab("csv")}>
            CSV upload
          </button>
        </div>

        <div className="hp-panel" role="tabpanel">
          {tab === "single" ? <SinglePredict /> : <CsvPredict />}
        </div>
      </div>
    </div>
  );
}