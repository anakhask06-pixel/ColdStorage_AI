import { useState } from 'react';
import { analyzeEnvironment } from '../services/api';

function Predictions() {
  const [temperature, setTemperature] = useState('5.0');
  const [humidity, setHumidity] = useState('70.0');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    const temp = Number(temperature);
    const hum = Number(humidity);

    if (
      temperature.trim() === '' ||
      humidity.trim() === '' ||
      !Number.isFinite(temp) ||
      !Number.isFinite(hum) ||
      hum < 0 ||
      hum > 100
    ) {
      setError('Enter a valid temperature and humidity between 0 and 100%.');
      return;
    }

    setLoading(true);

    try {
      const data = await analyzeEnvironment(temp, hum);
      setResult(data);
    } catch (err) {
      console.error('AI analysis failed:', err);
      setError(
        err.response?.data?.error ||
          'Could not analyze this reading. Check that Flask is running and the AI models are available.'
      );
    } finally {
      setLoading(false);
    }
  };

  const overallStatus = String(result?.overall_status || 'Unavailable');
  const statusIsWarning =
    ['WARNING', 'ANOMALY', 'CRITICAL', 'DANGER'].includes(
      overallStatus.toUpperCase()
    ) || result?.anomaly === true;

  const statusColor = statusIsWarning ? 'var(--danger)' : 'var(--success)';
  const statusBackground = statusIsWarning
    ? 'var(--danger-bg)'
    : 'var(--success-bg)';

  const panelStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(18px, 3vw, 26px)',
    boxShadow: 'var(--shadow-sm)',
    minWidth: 0,
  };

  const inputStyle = {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    padding: '12px 14px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface)',
    color: 'var(--text-h)',
    fontSize: '15px',
  };

  return (
    <main className="app page-container">
      <header style={{ marginBottom: 28 }}>
        <p style={eyebrowStyle}>Intelligent Analysis</p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <h1 style={{ color: 'var(--text-h)', margin: 0 }}>
            AI Predictions &amp; Anomaly Detection
          </h1>

          <span style={infoPillStyle}>🧠 AI-powered analysis</span>
        </div>

        <p className="subtitle">
          Analyze environmental readings using the trained AI models and
          backend storage-condition rules.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 16,
          }}
        >
          <FeaturePill icon="🌡️" label="Temperature prediction" />
          <FeaturePill icon="🛡️" label="Anomaly detection" />
          <FeaturePill icon="❄️" label="Storage status" />
        </div>
      </header>

      <section style={panelStyle}>
        <div style={{ marginBottom: 24 }}>
          <p style={eyebrowStyle}>Input Parameters</p>
          <h2 style={sectionHeading}>Analyze a Storage Reading</h2>
          <p style={descriptionStyle}>
            Enter a temperature and humidity reading to estimate the next
            dataset temperature and check for unusual environmental conditions.
          </p>
        </div>

        <form onSubmit={handleAnalyze}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: 22,
            }}
          >
            <label style={labelStyle}>
              <span>🌡️ Temperature (°C)</span>
              <input
                type="number"
                step="any"
                value={temperature}
                onChange={(event) => setTemperature(event.target.value)}
                required
                disabled={loading}
                placeholder="Example: 5.0"
                style={inputStyle}
              />
              <span style={helperStyle}>
                Enter the current storage temperature.
              </span>
            </label>

            <label style={labelStyle}>
              <span>💧 Humidity (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={humidity}
                onChange={(event) => setHumidity(event.target.value)}
                required
                disabled={loading}
                placeholder="Example: 70.0"
                style={inputStyle}
              />
              <span style={helperStyle}>
                Enter relative humidity between 0% and 100%.
              </span>
            </label>
          </div>

          {error && (
            <div role="alert" style={errorStyle}>
              <strong>Analysis could not be completed</strong>
              <p style={{ margin: '6px 0 0', lineHeight: 1.6 }}>{error}</p>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 24,
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? '⏳ Analyzing Reading...' : '🔍 Analyze Reading'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setTemperature('5.0');
                setHumidity('70.0');
                setResult(null);
                setError('');
              }}
              style={resetButtonStyle}
            >
              Reset Values
            </button>
          </div>
        </form>
      </section>

      {loading && (
        <section
          role="status"
          style={{ ...panelStyle, marginTop: 22 }}
        >
          <p style={{ margin: 0, color: 'var(--text)' }}>
            The AI models are analyzing your reading. Please wait...
          </p>
        </section>
      )}

      {result && !loading && (
        <section aria-live="polite" style={{ marginTop: 30 }}>
          <div style={{ marginBottom: 18 }}>
            <p style={eyebrowStyle}>Analysis Summary</p>
            <h2 style={{ color: 'var(--text-h)', margin: '0 0 6px' }}>
              Analysis Results
            </h2>
            <p style={descriptionStyle}>
              Results for the environmental values you submitted.
            </p>
          </div>

          <div
            style={{
              background: statusBackground,
              border: '1px solid var(--border)',
              borderLeft: `5px solid ${statusColor}`,
              borderRadius: 'var(--radius-lg)',
              padding: '22px 24px',
              marginBottom: 20,
            }}
          >
            <p
              style={{
                color: statusColor,
                fontSize: 12,
                fontWeight: 800,
                margin: '0 0 8px',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
              }}
            >
              Overall Storage Status
            </p>

            <h3
              style={{
                color: statusColor,
                fontSize: 28,
                margin: '0 0 8px',
                overflowWrap: 'anywhere',
              }}
            >
              {overallStatus}
            </h3>

            <p style={{ color: statusColor, margin: 0, lineHeight: 1.6 }}>
              {statusIsWarning
                ? 'The analysis has flagged a potential environmental issue. Review the readings and storage conditions.'
                : 'Review the individual results below alongside this overall status.'}
            </p>
          </div>

          <div style={resultGridStyle}>
            <ResultCard
              title="Current Temperature"
              value={`${result.current_temperature ?? temperature} °C`}
              icon="🌡️"
              accent="#0284c7"
            />

            <ResultCard
              title="Current Humidity"
              value={`${result.current_humidity ?? humidity} %`}
              icon="💧"
              accent="#0f766e"
            />

            <ResultCard
              title="Predicted Temperature"
              value={
                result.predicted_temperature != null
                  ? `${result.predicted_temperature} °C`
                  : 'Unavailable'
              }
              icon="🔮"
              accent="#7c3aed"
            />

            <ResultCard
              title="Anomaly Detection"
              value={
                result.anomaly === true
                  ? 'Anomaly Detected'
                  : result.anomaly === false
                    ? 'Normal'
                    : 'Unavailable'
              }
              icon={result.anomaly === true ? '⚠️' : '🛡️'}
              accent={result.anomaly === true ? '#dc2626' : '#16a34a'}
            />

            <ResultCard
              title="Storage Temperature"
              value={result.storage_status ?? 'Unavailable'}
              icon="❄️"
              accent="#0284c7"
            />

            <ResultCard
              title="Anomaly Decision Score"
              value={result.anomaly_score ?? 'Unavailable'}
              icon="📈"
              accent="#64748b"
            />
          </div>

          <section
            style={{
              ...panelStyle,
              marginTop: 20,
              background: 'var(--surface-soft)',
            }}
          >
            <h3
              style={{
                color: 'var(--text-h)',
                margin: '0 0 12px',
                fontSize: 17,
              }}
            >
              📘 How to Interpret These Results
            </h3>

            <ul
              style={{
                color: 'var(--text)',
                paddingLeft: 22,
                margin: 0,
                lineHeight: 1.9,
              }}
            >
              <li>
                <strong>Predicted temperature:</strong> corresponds to the
                next dataset row, not necessarily one hour into the future.
              </li>
              <li>
                <strong>Anomaly decision score:</strong> is model-specific; it
                is not a probability of an anomaly.
              </li>
              <li>
                <strong>Storage status:</strong> is calculated using the
                backend&apos;s temperature classification logic.
              </li>
              <li>
                <strong>Food freshness:</strong> is evaluated separately by
                the shelf-life simulation.
              </li>
            </ul>
          </section>
        </section>
      )}

      {!result && !loading && !error && (
        <section
          style={{
            ...panelStyle,
            marginTop: 22,
            textAlign: 'center',
            padding: '34px 24px',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <h2
            style={{
              color: 'var(--text-h)',
              margin: '0 0 8px',
              fontSize: 21,
            }}
          >
            Ready to Analyze
          </h2>
          <p
            style={{
              color: 'var(--text)',
              margin: '0 auto',
              lineHeight: 1.7,
              maxWidth: 520,
            }}
          >
            Submit a reading to see the predicted temperature, anomaly
            detection result, and storage status here.
          </p>
        </section>
      )}
    </main>
  );
}

const eyebrowStyle = {
  color: 'var(--primary)',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '1.4px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
};

const infoPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '7px 11px',
  borderRadius: 999,
  background: 'var(--primary-light)',
  color: 'var(--primary)',
  fontSize: 12,
  fontWeight: 700,
};

const sectionHeading = {
  color: 'var(--text-h)',
  fontSize: 21,
  margin: 0,
};

const descriptionStyle = {
  color: 'var(--text)',
  margin: '7px 0 0',
  lineHeight: 1.7,
};

const labelStyle = {
  display: 'grid',
  gap: 9,
  color: 'var(--text-h)',
  fontSize: 14,
  fontWeight: 650,
  minWidth: 0,
};

const helperStyle = {
  color: 'var(--text)',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 1.5,
};

const buttonStyle = {
  padding: '12px 19px',
  border: '1px solid var(--primary)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--primary)',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 750,
};

const resetButtonStyle = {
  padding: '12px 18px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--surface)',
  color: 'var(--text-h)',
  fontSize: 14,
  fontWeight: 650,
  cursor: 'pointer',
};

const errorStyle = {
  background: 'var(--danger-bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: 15,
  marginTop: 20,
  color: 'var(--danger)',
};

const resultGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: 16,
};

function FeaturePill({ icon, label }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 10px',
        border: '1px solid var(--border)',
        borderRadius: 999,
        background: 'var(--surface)',
        color: 'var(--text)',
        fontSize: 12,
      }}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

function ResultCard({ title, value, icon, accent }) {
  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderTop: `4px solid ${accent}`,
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        minWidth: 0,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <p
          style={{
            color: 'var(--text)',
            fontSize: 13,
            fontWeight: 650,
            margin: 0,
          }}
        >
          {title}
        </p>

        <span aria-hidden="true" style={{ fontSize: 22 }}>
          {icon}
        </span>
      </div>

      <h3
        style={{
          color: 'var(--text-h)',
          fontSize: 23,
          lineHeight: 1.4,
          overflowWrap: 'anywhere',
          margin: 0,
        }}
      >
        {value}
      </h3>
    </article>
  );
}

export default Predictions;
