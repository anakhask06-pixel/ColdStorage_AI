
import { useEffect, useState, useCallback } from 'react';
import {
  getSensorData,
  analyzeEnvironment,
  getFoodItems,
} from '../services/api';

const colors = {
  navy: '#122238',
  muted: '#64748b',
  border: '#e2e8f0',
  teal: '#0f766e',
  blue: '#0284c7',
  purple: '#7c3aed',
  green: '#15803d',
  amber: '#b45309',
  red: '#b91c1c',
};

const panelStyle = {
  background: '#ffffff',
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 3px 12px rgba(15,23,42,0.04)',
  minWidth: 0,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
  gap: 16,
};

function Home() {
  const [sensor, setSensor] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      const readings = await getSensorData();
      const items = await getFoodItems();

      const latest = Array.isArray(readings)
        ? readings[0]
        : readings?.value?.[0];

      setFoodItems(Array.isArray(items) ? items : items?.value || []);

      if (!latest) {
        setSensor(null);
        setAiResult(null);
        setError('');
        return;
      }

      setSensor(latest);

      const result = await analyzeEnvironment(
        latest.temperature,
        latest.humidity
      );

      setAiResult(result);
      setError('');
    } catch (err) {
      console.error('Dashboard loading failed:', err);
      setError(
        err.response?.data?.error ||
          'Could not load dashboard data. Check that Flask is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const intervalId = setInterval(loadDashboard, 10000);

    return () => clearInterval(intervalId);
  }, [loadDashboard]);

  const warning =
    aiResult &&
    (aiResult.overall_status === 'WARNING' ||
      aiResult.overall_status === 'ANOMALY' ||
      aiResult.anomaly === true);

  const spoiledCount = foodItems.filter(
    (food) =>
      String(food.freshness_state || food.status).toLowerCase() === 'spoiled'
  ).length;

  const agingCount = foodItems.filter(
    (food) =>
      String(food.freshness_state || food.status).toLowerCase() === 'aging'
  ).length;

  const freshCount = foodItems.filter(
    (food) =>
      String(food.freshness_state || food.status).toLowerCase() === 'fresh'
  ).length;

  const formatDate = (value) => {
    if (!value) return 'Timestamp unavailable';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  };

  if (loading) {
    return (
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
        <p style={{ color: colors.muted }}>Loading sensor and AI data...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 0 32px' }}>
      {/* Page heading */}
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            color: colors.teal,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Monitoring overview
        </p>

        <h1 style={{ color: colors.navy, marginBottom: 10 }}>
          Cold Storage Dashboard
        </h1>

        <p style={{ color: colors.muted, marginBottom: 14, lineHeight: 1.7 }}>
          Monitor environmental conditions, AI predictions, and food freshness
          from one place.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            background: '#ecfdf5',
            color: '#166534',
            border: '1px solid #bbf7d0',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#16a34a',
            }}
          />
          Automatic refresh every 10 seconds
        </div>
      </header>

      {/* Loading errors */}
      {error && (
        <section
          role="alert"
          style={{
            padding: 18,
            marginBottom: 24,
            border: '1px solid #fecaca',
            borderLeft: '4px solid #dc2626',
            borderRadius: 12,
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >
          <strong>Unable to refresh dashboard</strong>
          <p style={{ margin: '6px 0 0' }}>{error}</p>
        </section>
      )}

      {/* Environmental warning */}
      {warning && (
        <section
          role="alert"
          style={{
            padding: 20,
            marginBottom: 24,
            border: '1px solid #fecaca',
            borderLeft: '5px solid #dc2626',
            borderRadius: 14,
            background: '#fff7f7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }} aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h2 style={{ color: colors.red, margin: '0 0 6px' }}>
                Storage Warning
              </h2>
              <p style={{ color: '#7f1d1d', margin: 0, lineHeight: 1.6 }}>
                Overall status:{' '}
                <strong>{aiResult.overall_status}</strong>. Check the storage
                conditions.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Latest sensor readings */}
      <section style={{ ...panelStyle, marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 22,
          }}
        >
          <div>
            <h2 style={{ color: colors.navy, margin: '0 0 6px' }}>
              Latest Sensor Reading
            </h2>
            <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>
              Current recorded environmental conditions
            </p>
          </div>

          <span
            style={{
              padding: '6px 11px',
              background: '#ccfbf1',
              color: '#115e59',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.6px',
            }}
          >
            LATEST DATA
          </span>
        </div>

        {sensor ? (
          <>
            <div style={gridStyle}>
              <MetricCard
                title="Temperature"
                value={`${Number(sensor.temperature).toFixed(2)} °C`}
                icon="🌡️"
                accent={colors.blue}
                description="Recorded storage temperature"
              />

              <MetricCard
                title="Humidity"
                value={`${Number(sensor.humidity).toFixed(2)} %`}
                icon="💧"
                accent="#0891b2"
                description="Recorded relative humidity"
              />
            </div>

            <p
              style={{
                margin: '20px 0 0',
                paddingTop: 16,
                borderTop: `1px solid ${colors.border}`,
                color: colors.muted,
                fontSize: 12,
              }}
            >
              <strong style={{ color: '#475569' }}>Recorded at:</strong>{' '}
              {formatDate(sensor.recorded_at)}
            </p>
          </>
        ) : (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              borderRadius: 12,
              background: '#f8fafc',
            }}
          >
            <span style={{ fontSize: 30 }} aria-hidden="true">
              📡
            </span>
            <h3 style={{ color: colors.navy, margin: '10px 0 6px' }}>
              No Sensor Readings
            </h3>
            <p style={{ color: colors.muted, margin: 0 }}>
              Add a sensor reading to begin monitoring and AI analysis.
            </p>
          </div>
        )}
      </section>

      {/* AI analysis */}
      <section style={{ marginBottom: 30 }}>
        <div style={{ marginBottom: 18 }}>
          <p
            style={{
              color: colors.teal,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: 7,
            }}
          >
            Intelligent analysis
          </p>

          <h2 style={{ color: colors.navy, marginBottom: 7 }}>
            AI Environmental Analysis
          </h2>

          <p style={{ color: colors.muted, margin: 0, fontSize: 14 }}>
            Model results based on the latest stored sensor reading.
          </p>
        </div>

        {aiResult ? (
          <>
            <div style={gridStyle}>
              <MetricCard
                title="Predicted Temperature"
                value={
                  aiResult.predicted_temperature != null
                    ? `${aiResult.predicted_temperature} °C`
                    : 'Unavailable'
                }
                icon="🔮"
                accent={colors.purple}
                description="Model temperature prediction"
              />

              <MetricCard
                title="Anomaly Detection"
                value={aiResult.anomaly ? 'Anomaly Detected' : 'Normal'}
                icon={aiResult.anomaly ? '⚠️' : '🛡️'}
                accent={aiResult.anomaly ? '#dc2626' : colors.green}
                description="Isolation Forest result"
              />

              <MetricCard
                title="Storage Temperature"
                value={aiResult.storage_status || 'Unavailable'}
                icon="❄️"
                accent={colors.blue}
                description="Rule-based temperature status"
              />

              <MetricCard
                title="Overall Status"
                value={aiResult.overall_status || 'Unavailable'}
                icon={warning ? '⚠️' : '✅'}
                accent={warning ? '#dc2626' : colors.green}
                description="Combined system assessment"
              />
            </div>

            <div
              style={{
                marginTop: 16,
                padding: '13px 16px',
                background: '#f8fafc',
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
              }}
            >
              <p
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                <strong style={{ color: '#475569' }}>Model note:</strong> The
                prediction corresponds to the next dataset row, not necessarily
                one hour. The anomaly score is not a probability.
              </p>
            </div>
          </>
        ) : (
          <section style={panelStyle}>
            <p style={{ color: colors.muted, margin: 0 }}>
              AI results will appear when a sensor reading is available and
              analysis succeeds.
            </p>
          </section>
        )}
      </section>

      {/* Food freshness overview */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <p
              style={{
                color: colors.teal,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Inventory health
            </p>

            <h2 style={{ color: colors.navy, marginBottom: 7 }}>
              Food Freshness Overview
            </h2>

            <p style={{ color: colors.muted, margin: 0, fontSize: 14 }}>
              Rule-based freshness states from the food simulation.
            </p>
          </div>

          <span
            style={{
              background: '#e2e8f0',
              color: '#334155',
              padding: '8px 12px',
              borderRadius: 9,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {foodItems.length} tracked items
          </span>
        </div>

        <div style={gridStyle}>
          <MetricCard
            title="Fresh"
            value={freshCount}
            icon="🍏"
            accent={colors.green}
            description="Within the fresh stage"
          />

          <MetricCard
            title="Aging"
            value={agingCount}
            icon="⌛"
            accent="#d97706"
            description="Check freshness soon"
          />

          <MetricCard
            title="Spoiled"
            value={spoiledCount}
            icon="⚠️"
            accent="#dc2626"
            description="Requires removal"
          />
        </div>

        <section style={{ ...panelStyle, marginTop: 18 }}>
          <h3
            style={{
              color: colors.navy,
              marginBottom: 16,
            }}
          >
            Tracked Food Items
          </h3>

          {foodItems.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>
              No food items have been added yet. Open Food Simulation to add
              fruit.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                gap: 12,
              }}
            >
              {foodItems.map((food) => {
                const state = String(
                  food.freshness_state || food.status || 'Unknown'
                );
                const normalized = state.toLowerCase();

                const stateColors =
                  normalized === 'spoiled'
                    ? { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' }
                    : normalized === 'aging'
                      ? { bg: '#fef3c7', text: '#92400e', dot: '#d97706' }
                      : normalized === 'fresh'
                        ? { bg: '#dcfce7', text: '#166534', dot: '#16a34a' }
                        : { bg: '#e2e8f0', text: '#334155', dot: '#64748b' };

                return (
                  <div
                    key={food.id}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      minWidth: 0,
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          color: colors.navy,
                          display: 'block',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {food.name}
                      </strong>

                      <p
                        style={{
                          color: colors.muted,
                          margin: '5px 0 0',
                          fontSize: 12,
                        }}
                      >
                        {food.food_type || 'Food item'}
                      </p>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: stateColors.bg,
                        color: stateColors.text,
                        borderRadius: 8,
                        padding: '7px 9px',
                        fontSize: 11,
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: stateColors.dot,
                        }}
                      />
                      {state}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function MetricCard({ title, value, icon, accent, description }) {
  return (
    <section
      style={{
        background: '#ffffff',
        border: `1px solid ${colors.border}`,
        borderTop: `4px solid ${accent}`,
        borderRadius: 14,
        padding: 20,
        minWidth: 0,
        boxShadow: '0 3px 12px rgba(15,23,42,0.035)',
        transition: 'box-shadow 160ms ease',
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
            color: colors.muted,
            fontSize: 13,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {title}
        </p>

        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            background: '#f1f5f9',
            borderRadius: 11,
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>

      <h3
        style={{
          color: colors.navy,
          fontSize: 23,
          lineHeight: 1.4,
          overflowWrap: 'anywhere',
          margin: '0 0 7px',
        }}
      >
        {value}
      </h3>

      {description && (
        <p
          style={{
            color: colors.muted,
            fontSize: 11,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}
    </section>
  );
}

export default Home;
