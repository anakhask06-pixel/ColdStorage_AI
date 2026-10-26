import { useCallback, useEffect, useState } from 'react';
import { getSensorData, getFoodItems } from '../services/api';

function Reports() {
  const [readings, setReadings] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    try {
      const [sensorResponse, foodResponse] = await Promise.all([
        getSensorData(),
        getFoodItems(),
      ]);

      const sensors = Array.isArray(sensorResponse)
        ? sensorResponse
        : sensorResponse?.value || sensorResponse?.data || [];

      const foods = Array.isArray(foodResponse)
        ? foodResponse
        : foodResponse?.value || foodResponse?.data || [];

      setReadings(Array.isArray(sensors) ? sensors : []);
      setFoodItems(Array.isArray(foods) ? foods : []);
      setError('');
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(
        err.response?.data?.error ||
        'Could not load report data. Check that Flask is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
    const intervalId = setInterval(loadReports, 10000);
    return () => clearInterval(intervalId);
  }, [loadReports]);

  const formatDate = (value) => {
    if (!value) return 'Unavailable';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  };

  const temperatures = readings
    .map((item) => Number(item.temperature))
    .filter(Number.isFinite);

  const humidities = readings
    .map((item) => Number(item.humidity))
    .filter(Number.isFinite);

  const average = (values) =>
    values.length
      ? (
          values.reduce((sum, value) => sum + value, 0) /
          values.length
        ).toFixed(2)
      : '—';

  const countFood = (state) =>
    foodItems.filter(
      (food) =>
        String(food.freshness_state || food.status || '').toLowerCase() === state
    ).length;

  const freshCount = countFood('fresh');
  const agingCount = countFood('aging');
  const spoiledCount = countFood('spoiled');

  const summaryCards = [
    {
      title: 'Total Sensor Readings',
      value: readings.length.toLocaleString(),
      icon: '📊',
      description: 'Measurements returned by the API',
      accent: '#2563eb',
      tone: '#eff6ff',
    },
    {
      title: 'Average Temperature',
      value: `${average(temperatures)}${temperatures.length ? ' °C' : ''}`,
      icon: '🌡️',
      description: 'Across available readings',
      accent: '#0284c7',
      tone: '#f0f9ff',
    },
    {
      title: 'Average Humidity',
      value: `${average(humidities)}${humidities.length ? ' %' : ''}`,
      icon: '💧',
      description: 'Across available readings',
      accent: '#0891b2',
      tone: '#ecfeff',
    },
    {
      title: 'Tracked Food Items',
      value: foodItems.length,
      icon: '🍎',
      description: 'Items currently in inventory',
      accent: '#7c3aed',
      tone: '#f5f3ff',
    },
  ];

  if (loading) {
    return (
      <main className="app page-container">
        <div style={headerStyle}>
          <span style={eyebrowStyle}>DATA OVERVIEW</span>
          <h1 style={titleStyle}>Reports &amp; Analytics</h1>
          <p className="subtitle">
            Review environmental measurements and simulated food freshness.
          </p>
        </div>
        <div className="card" style={{ color: 'var(--text)' }}>
          <span className="loadingDot" /> Preparing your reports…
        </div>
      </main>
    );
  }

  return (
    <main className="app page-container">
      <header style={headerStyle}>
        <div style={headerTopStyle}>
          <div>
            <span style={eyebrowStyle}>DATA OVERVIEW</span>
            <h1 style={titleStyle}>Reports &amp; Analytics</h1>
            <p className="subtitle">
              Review environmental measurements, temperature ranges, and simulated
              food freshness in one place.
            </p>
          </div>

          <div style={refreshPillStyle}>
            <span style={liveDotStyle} />
            Auto-refresh · 10 sec
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" style={errorStyle}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <strong>Unable to refresh report data</strong>
            <p style={{ margin: '4px 0 0' }}>{error}</p>
            <button
              type="button"
              onClick={loadReports}
              style={retryButtonStyle}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <section className="section">
        <SectionHeading
          eyebrow="AT A GLANCE"
          title="Environmental Summary"
          description="Key statistics from the sensor data currently returned by the API."
        />

        <div style={summaryGridStyle}>
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="TEMPERATURE ANALYSIS"
          title="Temperature Range"
          description="Lowest and highest recorded temperatures in the available readings."
        />

        <div style={rangeGridStyle}>
          <RangeCard
            title="Minimum Temperature"
            value={
              temperatures.length
                ? `${Math.min(...temperatures).toFixed(2)} °C`
                : '—'
            }
            icon="❄️"
            accent="#0891b2"
            tone="#ecfeff"
            detail="Lowest available reading"
          />
          <RangeCard
            title="Maximum Temperature"
            value={
              temperatures.length
                ? `${Math.max(...temperatures).toFixed(2)} °C`
                : '—'
            }
            icon="🔥"
            accent="#ea580c"
            tone="#fff7ed"
            detail="Highest available reading"
          />
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="INVENTORY HEALTH"
          title="Food Freshness Summary"
          description="Current freshness states calculated by the shelf-life simulation."
        />

        <div style={freshnessGridStyle}>
          <FreshnessCard
            title="Fresh"
            value={freshCount}
            icon="🍏"
            accent="#15803d"
            tone="#f0fdf4"
            description="Within the fresh stage"
          />
          <FreshnessCard
            title="Aging"
            value={agingCount}
            icon="⌛"
            accent="#b45309"
            tone="#fffbeb"
            description="Check freshness soon"
          />
          <FreshnessCard
            title="Spoiled"
            value={spoiledCount}
            icon="⚠️"
            accent="#b91c1c"
            tone="#fef2f2"
            description="Remove from storage"
          />
        </div>

        <p style={noteStyle}>
          <span>ⓘ</span>
          Food freshness is simulated using item age and shelf-life rules. It is
          not a camera-based spoilage detection.
        </p>
      </section>

      <section className="section" style={{ marginBottom: 8 }}>
        <div style={tablePanelStyle}>
          <div style={tableHeaderStyle}>
            <div>
              <span style={eyebrowStyle}>RECORDED MEASUREMENTS</span>
              <h2 style={tableTitleStyle}>Sensor Reading History</h2>
              <p style={tableSubtitleStyle}>
                Temperature and humidity measurements returned by the backend.
              </p>
            </div>
            <div style={recordCountStyle}>
              {readings.length.toLocaleString()} readings
            </div>
          </div>

          {readings.length === 0 ? (
            <div style={emptyStateStyle}>
              <span style={{ fontSize: 32 }}>📡</span>
              <strong>No sensor readings yet</strong>
              <p>
                Start the backend sensor simulator or add a reading to populate
                this report.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Reading</th>
                    <th style={thStyle}>Temperature</th>
                    <th style={thStyle}>Humidity</th>
                    <th style={thStyle}>Recorded At</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading, index) => (
                    <tr
                      key={reading.id ?? index}
                      style={{
                        background: index % 2 === 0
                          ? 'var(--surface)'
                          : 'var(--surface-soft)',
                      }}
                    >
                      <td style={tdStyle}>
                        <span style={readingIdStyle}>
                          #{reading.id ?? '—'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={temperatureValueStyle}>
                          {Number.isFinite(Number(reading.temperature))
                            ? Number(reading.temperature).toFixed(2)
                            : '—'}
                          <span style={unitStyle}> °C</span>
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {Number.isFinite(Number(reading.humidity))
                          ? Number(reading.humidity).toFixed(2)
                          : '—'}
                        <span style={unitStyle}> %</span>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text)' }}>
                        {formatDate(reading.recorded_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {readings.length > 0 && (
            <div style={tableFooterStyle}>
              Statistics above use the readings currently returned by the API.
              This page does not independently calculate AI predictions.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={eyebrowStyle}>{eyebrow}</span>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <p style={sectionDescriptionStyle}>{description}</p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  description,
  accent,
  tone,
}) {
  return (
    <article className="card" style={metricCardStyle}>
      <div style={metricTopStyle}>
        <span style={{ ...metricIconStyle, background: tone }}>{icon}</span>
        <span style={{ ...accentBarStyle, background: accent }} />
      </div>
      <p style={metricLabelStyle}>{title}</p>
      <h3 style={metricValueStyle}>{value}</h3>
      <p style={metricDescriptionStyle}>{description}</p>
    </article>
  );
}

function RangeCard({ title, value, icon, accent, tone, detail }) {
  return (
    <article className="card" style={rangeCardStyle}>
      <div style={{ ...rangeIconStyle, background: tone }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={metricLabelStyle}>{title}</p>
        <h3 style={{ ...rangeValueStyle, color: accent }}>{value}</h3>
        <p style={metricDescriptionStyle}>{detail}</p>
      </div>
    </article>
  );
}

function FreshnessCard({
  title,
  value,
  icon,
  accent,
  tone,
  description,
}) {
  return (
    <article className="card" style={freshnessCardStyle}>
      <div style={{ ...freshnessIconStyle, background: tone }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={metricLabelStyle}>{title}</p>
        <h3 style={{ ...freshnessValueStyle, color: accent }}>{value}</h3>
        <p style={metricDescriptionStyle}>{description}</p>
      </div>
    </article>
  );
}

const headerStyle = {
  marginBottom: 30,
};

const headerTopStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 18,
};

const eyebrowStyle = {
  display: 'block',
  color: 'var(--primary)',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.13em',
  marginBottom: 8,
};

const titleStyle = {
  color: 'var(--text-h)',
  fontSize: 'clamp(1.8rem, 4vw, 2.35rem)',
  lineHeight: 1.2,
  letterSpacing: '-0.04em',
  margin: '0 0 10px',
};

const refreshPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
  padding: '9px 13px',
  border: '1px solid var(--border)',
  borderRadius: 999,
  background: 'var(--surface)',
  color: 'var(--text)',
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const liveDotStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#16a34a',
  boxShadow: '0 0 0 3px #dcfce7',
};

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: 16,
};

const rangeGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: 16,
};

const freshnessGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: 16,
};

const metricCardStyle = {
  padding: 20,
  minWidth: 0,
  borderTop: '3px solid var(--border)',
};

const metricTopStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
};

const metricIconStyle = {
  display: 'grid',
  placeItems: 'center',
  width: 42,
  height: 42,
  borderRadius: 13,
  fontSize: 21,
};

const accentBarStyle = {
  width: 28,
  height: 4,
  borderRadius: 999,
};

const metricLabelStyle = {
  margin: '0 0 8px',
  color: 'var(--text)',
  fontSize: 13,
  fontWeight: 600,
};

const metricValueStyle = {
  margin: 0,
  color: 'var(--text-h)',
  fontSize: 'clamp(1.5rem, 3vw, 1.9rem)',
  fontWeight: 800,
  letterSpacing: '-0.04em',
  overflowWrap: 'anywhere',
};

const metricDescriptionStyle = {
  margin: '9px 0 0',
  color: 'var(--text)',
  fontSize: 12,
  lineHeight: 1.5,
};

const rangeCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 17,
  padding: 22,
};

const rangeIconStyle = {
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 54,
  height: 54,
  borderRadius: 16,
  fontSize: 25,
};

const rangeValueStyle = {
  margin: 0,
  fontSize: 'clamp(1.6rem, 3vw, 2rem)',
  letterSpacing: '-0.04em',
  overflowWrap: 'anywhere',
};

const freshnessCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 15,
  padding: 20,
};

const freshnessIconStyle = {
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 48,
  height: 48,
  borderRadius: 15,
  fontSize: 23,
};

const freshnessValueStyle = {
  margin: 0,
  fontSize: 27,
  lineHeight: 1.15,
  fontWeight: 800,
};

const sectionTitleStyle = {
  margin: 0,
  color: 'var(--text-h)',
  fontSize: 21,
  letterSpacing: '-0.025em',
};

const sectionDescriptionStyle = {
  margin: '6px 0 0',
  color: 'var(--text)',
  fontSize: 13,
  lineHeight: 1.6,
};

const noteStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 9,
  margin: '15px 0 0',
  color: 'var(--text)',
  fontSize: 12,
  lineHeight: 1.6,
};

const errorStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: 16,
  marginBottom: 24,
  border: '1px solid var(--danger-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--danger-bg)',
  color: 'var(--danger)',
};

const retryButtonStyle = {
  marginTop: 10,
  padding: '7px 11px',
  border: '1px solid currentColor',
  borderRadius: 8,
  background: 'transparent',
  color: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
};

const tablePanelStyle = {
  overflow: 'hidden',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
};

const tableHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 14,
  padding: '22px 22px 20px',
  borderBottom: '1px solid var(--border)',
};

const tableTitleStyle = {
  margin: 0,
  color: 'var(--text-h)',
  fontSize: 20,
  letterSpacing: '-0.025em',
};

const tableSubtitleStyle = {
  margin: '6px 0 0',
  color: 'var(--text)',
  fontSize: 13,
};

const recordCountStyle = {
  padding: '7px 11px',
  borderRadius: 999,
  background: 'var(--surface-soft)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  minWidth: 640,
};

const thStyle = {
  padding: '13px 18px',
  background: 'var(--surface-soft)',
  borderBottom: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '15px 18px',
  borderBottom: '1px solid var(--border)',
  color: 'var(--text-h)',
  fontSize: 13,
  whiteSpace: 'nowrap',
};

const readingIdStyle = {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: 7,
  background: 'var(--surface-soft)',
  color: 'var(--text)',
  fontSize: 12,
  fontWeight: 700,
};

const temperatureValueStyle = {
  color: 'var(--text-h)',
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
};

const unitStyle = {
  color: 'var(--text)',
  fontWeight: 500,
};

const tableFooterStyle = {
  padding: '12px 18px',
  background: 'var(--surface-soft)',
  borderTop: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 11,
  lineHeight: 1.6,
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: '42px 20px',
  textAlign: 'center',
  color: 'var(--text)',
};

export default Reports;