import { useState } from "react";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
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
          ? `Can't reach the API at ${API_URL}. The server may be waking up, so wait a minute and try again.`
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
          <div className="hp-range">Likely range: {result.confidence_range}</div>
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
          ? `Can't reach the API at ${API_URL}. The server may be waking up, so wait a minute and try again.`
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