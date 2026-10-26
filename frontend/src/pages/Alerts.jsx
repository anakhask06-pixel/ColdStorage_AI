import { useCallback, useEffect, useState } from 'react';
import {
  getFoodItems,
  getSensorData,
  analyzeEnvironment,
} from '../services/api';

function Alerts() {
  const [foodItems, setFoodItems] = useState([]);
  const [environment, setEnvironment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [environmentError, setEnvironmentError] = useState('');

  const loadAlerts = useCallback(async () => {
    try {
      const response = await getFoodItems();
      const items = Array.isArray(response)
        ? response
        : response?.data;

      if (!Array.isArray(items)) {
        throw new Error('Unexpected inventory response.');
      }

      setFoodItems(items);
      setError('');
    } catch (err) {
      console.error('Failed to load food alerts:', err);
      setError('Could not load food alerts. Check that Flask is running.');
    }

    try {
      const sensorResponse = await getSensorData();
      const readings = Array.isArray(sensorResponse)
        ? sensorResponse
        : sensorResponse?.data;

      if (!Array.isArray(readings) || readings.length === 0) {
        setEnvironment(null);
        setEnvironmentError('No sensor readings are available yet.');
        return;
      }

      // Find the newest reading regardless of the API's sort order.
      const latestReading = readings.reduce((latest, reading) => {
        const latestTime = new Date(
          latest.recorded_at || latest.created_at || 0
        ).getTime();
        const readingTime = new Date(
          reading.recorded_at || reading.created_at || 0
        ).getTime();

        return readingTime > latestTime ? reading : latest;
      });

      const temperature = Number(latestReading.temperature);
      const humidity = Number(latestReading.humidity);

      if (!Number.isFinite(temperature) || !Number.isFinite(humidity)) {
        throw new Error('The latest sensor reading is invalid.');
      }

      const result = await analyzeEnvironment(temperature, humidity);

      setEnvironment({
        ...result,
        temperature,
        humidity,
        recordedAt:
          latestReading.recorded_at || latestReading.created_at,
      });
      setEnvironmentError('');
    } catch (err) {
      console.error('Failed to load environmental analysis:', err);
      setEnvironmentError(
        'Could not load environmental analysis. Check the AI API and sensor data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();

    const timer = setInterval(loadAlerts, 10000);
    return () => clearInterval(timer);
  }, [loadAlerts]);

  const spoiled = foodItems.filter(
    (item) => item.freshness_state?.toLowerCase() === 'spoiled'
  );

  const aging = foodItems.filter(
    (item) => item.freshness_state?.toLowerCase() === 'aging'
  );

  const fresh = foodItems.filter(
    (item) => item.freshness_state?.toLowerCase() === 'fresh'
  );

  const storageStatus = environment?.storage_status;
  const overallStatus = environment?.overall_status;

  const isEnvironmentalWarning =
    (overallStatus && overallStatus.toUpperCase() !== 'NORMAL') ||
    (storageStatus && storageStatus.toUpperCase() !== 'NORMAL') ||
    environment?.is_anomaly === true ||
    environment?.anomaly === true ||
    environment?.anomaly_label === -1;

  const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(16px, 2.5vw, 22px)',
    boxShadow: 'var(--shadow-sm)',
    minWidth: 0,
  };

  const formatDate = (value) => {
    if (!value) return 'Time unavailable';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  };

  return (
    <main className="app page-container">
      <header style={{ marginBottom: 28 }}>
        <p style={eyebrowStyle}>System Health Center</p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <h1 style={{ margin: 0, color: 'var(--text-h)' }}>
            System Alerts
          </h1>

          <span style={refreshPillStyle}>
            <span aria-hidden="true">●</span>
            Auto-refresh · 10 seconds
          </span>
        </div>

        <p className="subtitle" style={{ marginTop: 10 }}>
          Monitor environmental warnings and food-spoilage risks to help
          maintain cold-storage conditions.
        </p>
      </header>

      {loading && (
        <section role="status" style={{ ...cardStyle, marginBottom: 22 }}>
          <p style={{ margin: 0, color: 'var(--text)' }}>
            Loading environmental and food alerts...
          </p>
        </section>
      )}

      {error && (
        <div role="alert" style={errorStyle}>
          <strong>Food alerts unavailable</strong>
          <p style={{ margin: '6px 0 0' }}>{error}</p>
        </div>
      )}

      {!loading && (
        <section
          style={{
            ...cardStyle,
            marginBottom: 28,
            borderLeft: `5px solid ${
              environmentError
                ? 'var(--border)'
                : isEnvironmentalWarning
                  ? 'var(--danger)'
                  : 'var(--success)'
            }`,
            background: environmentError
              ? 'var(--surface)'
              : isEnvironmentalWarning
                ? 'var(--danger-bg)'
                : 'var(--success-bg)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div style={iconTileStyle}>
              {environmentError
                ? '📡'
                : isEnvironmentalWarning
                  ? '⚠️'
                  : '🌡️'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={eyebrowStyle}>Environmental Monitoring</p>

              <h2
                style={{
                  color: 'var(--text-h)',
                  fontSize: 21,
                  margin: '0 0 7px',
                }}
              >
                {environmentError
                  ? 'Analysis Unavailable'
                  : isEnvironmentalWarning
                    ? 'Environmental Warning'
                    : 'Environmental Status'}
              </h2>

              <p
                style={{
                  color: 'var(--text)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {environmentError
                  ? 'The latest environmental status could not be confirmed.'
                  : isEnvironmentalWarning
                    ? 'The current analysis has flagged a potential storage issue. Review the readings below.'
                    : 'No environmental warning is reported by the current AI analysis.'}
              </p>
            </div>

            {!environmentError && environment && (
              <span
                style={{
                  ...statusPillStyle,
                  color: isEnvironmentalWarning
                    ? 'var(--danger)'
                    : 'var(--success)',
                  background: 'var(--surface)',
                }}
              >
                {overallStatus || storageStatus || 'Analyzed'}
              </span>
            )}
          </div>

          {environmentError ? (
            <div role="alert" style={inlineErrorStyle}>
              {environmentError}
            </div>
          ) : environment ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                  gap: 14,
                }}
              >
                <EnvironmentMetric
                  label="Temperature"
                  value={`${environment.temperature} °C`}
                  icon="🌡️"
                />

                <EnvironmentMetric
                  label="Humidity"
                  value={`${environment.humidity} %`}
                  icon="💧"
                />

                <EnvironmentMetric
                  label="Storage Status"
                  value={environment.storage_status || 'Not provided'}
                  icon="❄️"
                />

                <EnvironmentMetric
                  label="Anomaly Detection"
                  value={
                    environment.anomaly_status ||
                    (environment.is_anomaly === true ||
                    environment.anomaly === true ||
                    environment.anomaly_label === -1
                      ? 'Anomaly detected'
                      : environment.anomaly_label === 1
                        ? 'Normal'
                        : 'See AI analysis')
                  }
                  icon="🛡️"
                />
              </div>

              {isEnvironmentalWarning && (
                <p
                  style={{
                    margin: '18px 0 0',
                    color: 'var(--danger)',
                    fontWeight: 650,
                    lineHeight: 1.6,
                  }}
                >
                  Action recommended: check the storage conditions and
                  investigate the environmental warning.
                </p>
              )}

              {environment.recordedAt && (
                <p
                  style={{
                    color: 'var(--text)',
                    fontSize: 12,
                    margin: '16px 0 0',
                  }}
                >
                  Based on sensor reading: {formatDate(environment.recordedAt)}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--text)', margin: 0 }}>
              No environmental analysis is available.
            </p>
          )}
        </section>
      )}

      {!loading && !error && (
        <section>
          <div style={{ marginBottom: 18 }}>
            <p style={eyebrowStyle}>Inventory Condition</p>
            <h2
              style={{
                color: 'var(--text-h)',
                fontSize: 23,
                margin: '0 0 6px',
              }}
            >
              Food Spoilage Alerts
            </h2>
            <p className="subtitle">
              Review fruit freshness states and identify items that need
              attention.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
              gap: 16,
              margin: '20px 0 28px',
            }}
          >
            <SummaryCard
              label="Spoiled"
              count={spoiled.length}
              description="Remove from storage"
              icon="🔴"
              color="#dc2626"
              background="var(--danger-bg)"
            />

            <SummaryCard
              label="Aging"
              count={aging.length}
              description="Check freshness soon"
              icon="🟠"
              color="#c2410c"
              background="var(--warning-bg)"
            />

            <SummaryCard
              label="Fresh"
              count={fresh.length}
              description="No immediate action"
              icon="🟢"
              color="#15803d"
              background="var(--success-bg)"
            />
          </div>

          <AlertGroup
            title="Immediate Action"
            subtitle="Spoiled items"
            items={spoiled}
            color="#dc2626"
            background="var(--danger-bg)"
            icon="🔴"
            message="Spoiled — remove from storage."
            formatDate={formatDate}
          />

          <AlertGroup
            title="Attention Needed"
            subtitle="Items approaching their shelf-life limit"
            items={aging}
            color="#c2410c"
            background="var(--warning-bg)"
            icon="🟠"
            message="Aging — check freshness soon."
            formatDate={formatDate}
          />

          <AlertGroup
            title="Healthy Inventory"
            subtitle="Fresh items"
            items={fresh}
            color="#15803d"
            background="var(--success-bg)"
            icon="🟢"
            message="Fresh — no immediate action needed."
            formatDate={formatDate}
          />
        </section>
      )}
    </main>
  );
}

function EnvironmentMetric({ label, value, icon }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '15px',
        minWidth: 0,
      }}
    >
      <p
        style={{
          color: 'var(--text)',
          fontSize: 12,
          fontWeight: 600,
          margin: '0 0 10px',
        }}
      >
        {icon} {label}
      </p>

      <p
        style={{
          color: 'var(--text-h)',
          fontSize: 18,
          fontWeight: 750,
          lineHeight: 1.4,
          overflowWrap: 'anywhere',
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryCard({ label, count, description, icon, color, background }) {
  return (
    <article
      style={{
        background,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ color, fontSize: 14, fontWeight: 700 }}>
          {label}
        </span>
        <span aria-hidden="true" style={{ fontSize: 20 }}>
          {icon}
        </span>
      </div>

      <p
        style={{
          color,
          fontSize: 32,
          fontWeight: 800,
          lineHeight: 1.2,
          margin: '12px 0 8px',
        }}
      >
        {count}
      </p>

      <p
        style={{
          color: 'var(--text)',
          fontSize: 12,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {description}
      </p>
    </article>
  );
}

function AlertGroup({
  title,
  subtitle,
  items,
  color,
  background,
  icon,
  message,
}) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 20px',
          background,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 20 }}>
          {icon}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              color: 'var(--text-h)',
              fontSize: 16,
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: 'var(--text)',
              fontSize: 12,
              margin: '4px 0 0',
            }}
          >
            {subtitle}
          </p>
        </div>

        <span
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            color,
            padding: '5px 10px',
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            padding: '22px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span aria-hidden="true">✓</span>
          <p style={{ color: 'var(--text)', margin: 0, fontSize: 14 }}>
            No fruits in this category.
          </p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                padding: '17px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: color,
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />

              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    color: 'var(--text-h)',
                    fontWeight: 750,
                    margin: '0 0 5px',
                  }}
                >
                  {item.name}
                </p>

                <p
                  style={{
                    color,
                    fontSize: 13,
                    lineHeight: 1.5,
                    margin: '0 0 8px',
                  }}
                >
                  {message}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '7px 16px',
                    color: 'var(--text)',
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  <span>Age: {item.elapsed_hours} hours</span>
                  <span>Shelf life: {item.shelf_life_hours} hours</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const eyebrowStyle = {
  color: 'var(--primary)',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '1.3px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
};

const refreshPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 12px',
  borderRadius: 999,
  background: 'var(--primary-light)',
  color: 'var(--primary)',
  fontSize: 12,
  fontWeight: 700,
};

const iconTileStyle = {
  display: 'grid',
  placeItems: 'center',
  width: 46,
  height: 46,
  flexShrink: 0,
  borderRadius: 'var(--radius-md)',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  fontSize: 22,
};

const statusPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
  border: '1px solid var(--border)',
  flexShrink: 0,
};

const errorStyle = {
  background: 'var(--danger-bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: 16,
  marginBottom: 22,
  color: 'var(--danger)',
};

const inlineErrorStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: 14,
  color: 'var(--danger)',
  lineHeight: 1.6,
  fontSize: 13,
};

export default Alerts;
