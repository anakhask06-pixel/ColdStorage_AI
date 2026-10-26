import { useEffect, useState } from 'react';
import { getSensorData } from '../services/api';

function LiveMonitoring() {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const data = await getSensorData();

        if (active) {
          setSensorData(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        console.error('Failed to fetch sensor data:', err);

        if (active) {
          setError('Could not load sensor data. Check that Flask is running.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const latest = sensorData[0];

  const formatDate = (value) => {
    if (!value) return 'Time unavailable';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  };

  const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '22px',
    boxShadow: 'var(--shadow-sm)',
    minWidth: 0,
  };

  const tableHeadings = [
    'Reading',
    'Temperature',
    'Humidity',
    'Recorded At',
  ];

  return (
    <div className="app page-container">
      <header style={{ marginBottom: '28px' }}>
        <p
          style={{
            margin: '0 0 8px',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}
        >
          Environmental Monitoring
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <h1 style={{ margin: 0, color: 'var(--text-h)' }}>
            Live Monitoring
          </h1>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 12px',
              borderRadius: '999px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid var(--border)',
            }}
          >
            <span aria-hidden="true">●</span>
            Auto-refresh · 10 seconds
          </span>
        </div>

        <p className="subtitle" style={{ marginTop: '10px' }}>
          Monitor cold-storage temperature, humidity, and historical
          sensor measurements in one place.
        </p>
      </header>

      {loading ? (
        <div style={cardStyle} role="status">
          <p style={{ margin: 0 }}>Loading sensor readings...</p>
        </div>
      ) : error ? (
        <div
          role="alert"
          style={{
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            border: '1px solid var(--border)',
          }}
        >
          <strong>Unable to load readings</strong>
          <p style={{ margin: '6px 0 0' }}>{error}</p>
        </div>
      ) : (
        <>
          <section
            aria-label="Latest sensor summary"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '18px',
              marginBottom: '28px',
            }}
          >
            <MetricCard
              label="Latest Temperature"
              value={latest ? `${Number(latest.temperature).toFixed(2)} °C` : '--'}
              description="Most recent stored measurement"
              accent="#0284c7"
              icon="🌡️"
            />

            <MetricCard
              label="Latest Humidity"
              value={latest ? `${Number(latest.humidity).toFixed(2)} %` : '--'}
              description="Relative humidity reading"
              accent="#0f766e"
              icon="💧"
            />

            <MetricCard
              label="Stored Readings"
              value={sensorData.length.toLocaleString()}
              description="Measurements returned by the API"
              accent="#7c3aed"
              icon="📊"
            />
          </section>

          <section
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                padding: '22px 24px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <p
                style={{
                  margin: '0 0 5px',
                  color: 'var(--primary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1.3px',
                  textTransform: 'uppercase',
                }}
              >
                Measurement History
              </p>

              <h2
                style={{
                  margin: 0,
                  color: 'var(--text-h)',
                  fontSize: '20px',
                }}
              >
                Recent Sensor Readings
              </h2>

              <p
                style={{
                  margin: '6px 0 0',
                  color: 'var(--text)',
                  fontSize: '14px',
                }}
              >
                Historical measurements stored in the database.
              </p>
            </div>

            {sensorData.length === 0 ? (
              <div style={{ padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                  📡
                </div>
                <h3 style={{ margin: '0 0 6px', color: 'var(--text-h)' }}>
                  No readings yet
                </h3>
                <p style={{ margin: 0, color: 'var(--text)' }}>
                  Sensor measurements will appear here when data is available.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '14px',
                  }}
                >
                  <thead>
                    <tr style={{ background: 'var(--surface-soft)' }}>
                      {tableHeadings.map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          style={{
                            padding: '15px 18px',
                            color: 'var(--text-h)',
                            fontSize: '12px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sensorData.map((sensor, index) => (
                      <tr
                        key={sensor.id ?? `${sensor.recorded_at}-${index}`}
                        style={{
                          background:
                            index % 2 === 0
                              ? 'var(--surface)'
                              : 'var(--surface-soft)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <td
                          style={{
                            padding: '15px 18px',
                            fontWeight: 700,
                            color: 'var(--text-h)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          #{sensor.id ?? '—'}
                          {index === 0 && (
                            <span
                              style={{
                                display: 'inline-block',
                                marginLeft: '9px',
                                padding: '3px 7px',
                                borderRadius: '999px',
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                fontSize: '10px',
                                fontWeight: 700,
                              }}
                            >
                              LATEST
                            </span>
                          )}
                        </td>

                        <td
                          style={{
                            padding: '15px 18px',
                            color: 'var(--text-h)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {Number(sensor.temperature).toFixed(2)} °C
                        </td>

                        <td
                          style={{
                            padding: '15px 18px',
                            color: 'var(--text-h)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {Number(sensor.humidity).toFixed(2)} %
                        </td>

                        <td
                          style={{
                            padding: '15px 18px',
                            color: 'var(--text)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(sensor.recorded_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div
              style={{
                padding: '12px 20px',
                borderTop: sensorData.length === 0 ? '1px solid var(--border)' : 'none',
                background: 'var(--surface-soft)',
                color: 'var(--text)',
                fontSize: '12px',
              }}
            >
              Displaying {sensorData.length.toLocaleString()} readings returned by the API.
              The list refreshes automatically every 10 seconds.
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, description, accent, icon }) {
  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${accent}`,
        borderRadius: 'var(--radius-lg)',
        padding: '22px',
        boxShadow: 'var(--shadow-sm)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '15px',
        }}
      >
        <p
          style={{
            margin: 0,
            color: 'var(--text)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {label}
        </p>

        <span
          aria-hidden="true"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '38px',
            height: '38px',
            flexShrink: 0,
            borderRadius: '11px',
            background: 'var(--surface-soft)',
            fontSize: '19px',
          }}
        >
          {icon}
        </span>
      </div>

      <p
        style={{
          margin: '0 0 7px',
          color: accent,
          fontSize: 'clamp(25px, 3vw, 32px)',
          fontWeight: 750,
          lineHeight: 1.2,
          letterSpacing: '-0.8px',
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </p>

      <p
        style={{
          margin: 0,
          color: 'var(--text)',
          fontSize: '12px',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </article>
  );
}

export default LiveMonitoring;
