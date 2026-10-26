import { useEffect, useState, useCallback } from 'react';
import {
  getFoodItems,
  addFoodItem,
  advanceFoodTime,
  deleteFoodItem,
} from '../services/api';

const FRUITS = [
  { name: 'Apple', emoji: '🍎', shelfLife: 72 },
  { name: 'Banana', emoji: '🍌', shelfLife: 72 },
  { name: 'Kiwi', emoji: '🥝', shelfLife: 120 },
  { name: 'Mango', emoji: '🥭', shelfLife: 120 },
  { name: 'Orange', emoji: '🍊', shelfLife: 168 },
  { name: 'Grapes', emoji: '🍇', shelfLife: 168 },
  { name: 'Strawberry', emoji: '🍓', shelfLife: 48 },
  { name: 'Pineapple', emoji: '🍍', shelfLife: 120 },
];

function FoodSimulation() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('Apple');

  const selectedFruit = FRUITS.find((fruit) => fruit.name === name);

  const freshCount = foods.filter(
    (food) => String(food.freshness_state).toLowerCase() === 'fresh'
  ).length;

  const agingCount = foods.filter(
    (food) => String(food.freshness_state).toLowerCase() === 'aging'
  ).length;

  const spoiledCount = foods.filter(
    (food) => String(food.freshness_state).toLowerCase() === 'spoiled'
  ).length;

  const loadFoods = useCallback(async () => {
    try {
      const data = await getFoodItems();
      const items = Array.isArray(data) ? data : data?.value || data?.data || [];
      setFoods(Array.isArray(items) ? items : []);
      setError('');
    } catch {
      setError('Could not load food inventory. Check that Flask is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
    const intervalId = setInterval(loadFoods, 10000);
    return () => clearInterval(intervalId);
  }, [loadFoods]);

  const handleAddFood = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await addFoodItem({
        name,
        food_type: 'Fruit',
      });
      await loadFoods();
      setName('Apple');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add food item.');
    } finally {
      setBusy(false);
    }
  };

  const handleAdvanceTime = async (hours) => {
    setBusy(true);
    setError('');

    try {
      await advanceFoodTime(hours);
      await loadFoods();
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not advance simulation time.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteFood = async (food) => {
    const confirmed = window.confirm(
      `Delete ${food.name} from storage? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusy(true);
    setError('');

    try {
      await deleteFoodItem(food.id);
      await loadFoods();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete food item.');
    } finally {
      setBusy(false);
    }
  };

  const getFruit = (foodName) =>
    FRUITS.find(
      (fruit) =>
        fruit.name.toLowerCase() === String(foodName).toLowerCase()
    );

  const getFoodMessage = (food) => {
    const state = String(food.freshness_state || '').toLowerCase();
    const age = Number(food.elapsed_hours);
    const shelfLife = Number(food.shelf_life_hours);

    if (state === 'spoiled') {
      return {
        label: 'SPOILED',
        text: 'Remove or inspect this food item.',
        color: '#b91c1c',
        background: '#fef2f2',
        border: '#fecaca',
        icon: '⚠️',
      };
    }

    if (shelfLife > 0 && age >= shelfLife * 0.75) {
      return {
        label: 'USE SOON',
        text: 'This item is approaching its configured shelf-life limit.',
        color: '#92400e',
        background: '#fffbeb',
        border: '#fde68a',
        icon: '🔔',
      };
    }

    if (state === 'aging') {
      return {
        label: 'AGING',
        text: 'Monitor this item as its estimated shelf life progresses.',
        color: '#92400e',
        background: '#fffbeb',
        border: '#fde68a',
        icon: '⌛',
      };
    }

    return {
      label: 'FRESH',
      text: 'Within the initial stage of the simulated shelf life.',
      color: '#166534',
      background: '#f0fdf4',
      border: '#bbf7d0',
      icon: '✓',
    };
  };

  return (
    <main className="app page-container">
      <header style={headerStyle}>
        <div style={headerTopStyle}>
          <div>
            <span style={eyebrowStyle}>INVENTORY MANAGEMENT</span>
            <h1 style={titleStyle}>Food Freshness Simulation</h1>
            <p className="subtitle">
              Track fruit age, monitor simulated freshness, and identify items
              that need attention.
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
            <strong>Inventory update issue</strong>
            <p style={{ margin: '4px 0 0' }}>{error}</p>
            <button
              type="button"
              style={retryButtonStyle}
              onClick={loadFoods}
              disabled={busy}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <section className="section">
        <div className="card" style={addPanelStyle}>
          <div style={panelHeadingStyle}>
            <div style={panelIconStyle}>🍎</div>
            <div>
              <span style={eyebrowStyle}>INVENTORY</span>
              <h2 style={panelTitleStyle}>Add Food Item</h2>
              <p style={panelDescriptionStyle}>
                Choose a fruit to add it to your simulated cold storage.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddFood} style={formStyle}>
            <label style={fieldStyle}>
              <span style={fieldLabelStyle}>Select fruit</span>
              <select
                style={inputStyle}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                disabled={busy}
              >
                {FRUITS.map((fruit) => (
                  <option key={fruit.name} value={fruit.name}>
                    {fruit.emoji} {fruit.name}
                  </option>
                ))}
              </select>
            </label>

            <div style={shelfLifePreviewStyle}>
              <span style={previewLabelStyle}>Configured shelf life</span>
              <strong style={previewValueStyle}>
                {selectedFruit?.shelfLife ?? '--'} hours
              </strong>
              <span style={previewFootStyle}>Assigned automatically</span>
            </div>

            <button
              style={{
                ...primaryButtonStyle,
                opacity: busy ? 0.65 : 1,
              }}
              disabled={busy}
              type="submit"
            >
              {busy ? 'Please wait…' : '+ Add Fruit'}
            </button>
          </form>

          <p style={hintStyle}>
            <span>ⓘ</span>
            Shelf life is assigned by the backend according to the selected fruit.
            Freshness is simulated using elapsed time and shelf-life rules.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="card" style={controlsPanelStyle}>
          <div style={panelHeadingStyle}>
            <div style={panelIconStyle}>⏱️</div>
            <div>
              <span style={eyebrowStyle}>TIME CONTROLS</span>
              <h2 style={panelTitleStyle}>Simulation Controls</h2>
              <p style={panelDescriptionStyle}>
                Automatic aging advances by one simulated hour every five real
                seconds.
              </p>
            </div>
          </div>

          <div style={controlsStyle}>
            <button
              style={primaryButtonStyle}
              disabled={busy}
              onClick={() => handleAdvanceTime(24)}
              type="button"
            >
              <span>⏩</span> +24 Hours
            </button>

            <button
              style={primaryButtonStyle}
              disabled={busy}
              onClick={() => handleAdvanceTime(48)}
              type="button"
            >
              <span>⏩</span> +48 Hours
            </button>

            <button
              style={secondaryButtonStyle}
              disabled={busy}
              onClick={loadFoods}
              type="button"
            >
              <span>↻</span> Refresh Inventory
            </button>

            {busy && (
              <span style={busyTextStyle}>Updating simulation…</span>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div style={sectionHeadingStyle}>
          <div>
            <span style={eyebrowStyle}>CURRENT STATUS</span>
            <h2 style={sectionTitleStyle}>Freshness Overview</h2>
            <p style={sectionDescriptionStyle}>
              A summary of the current inventory condition.
            </p>
          </div>
          <span style={inventoryCountStyle}>
            {foods.length} {foods.length === 1 ? 'item' : 'items'} tracked
          </span>
        </div>

        <div style={summaryGridStyle}>
          <SummaryCard
            title="Fresh"
            value={freshCount}
            icon="🍏"
            accent="#15803d"
            tone="#f0fdf4"
            description="Within the initial shelf-life stage"
          />
          <SummaryCard
            title="Aging"
            value={agingCount}
            icon="⌛"
            accent="#b45309"
            tone="#fffbeb"
            description="Monitor freshness progression"
          />
          <SummaryCard
            title="Spoiled"
            value={spoiledCount}
            icon="⚠️"
            accent="#b91c1c"
            tone="#fef2f2"
            description="Requires attention or removal"
          />
        </div>
      </section>

      <section className="section" style={{ marginBottom: 8 }}>
        <div style={sectionHeadingStyle}>
          <div>
            <span style={eyebrowStyle}>STORAGE INVENTORY</span>
            <h2 style={sectionTitleStyle}>Food Inventory</h2>
            <p style={sectionDescriptionStyle}>
              Inspect each fruit’s simulated age, shelf life, and freshness status.
            </p>
          </div>
          <span style={inventoryCountStyle}>{foods.length} total</span>
        </div>

        {loading ? (
          <div className="card" style={emptyStateStyle}>
            <span style={{ fontSize: 30 }}>📦</span>
            <strong>Loading food inventory…</strong>
          </div>
        ) : foods.length === 0 ? (
          <div className="card" style={emptyStateStyle}>
            <span style={{ fontSize: 42 }}>🧺</span>
            <h3 style={emptyTitleStyle}>Your storage is empty</h3>
            <p style={emptyDescriptionStyle}>
              Select a fruit above and choose <strong>Add Fruit</strong> to start
              the simulation.
            </p>
          </div>
        ) : (
          <div style={foodGridStyle}>
            {foods.map((food) => {
              const fruit = getFruit(food.name);
              const message = getFoodMessage(food);
              const state = String(food.freshness_state || 'Unknown');
              const normalizedState = state.toLowerCase();
              const statusColor =
                normalizedState === 'fresh'
                  ? '#15803d'
                  : normalizedState === 'aging'
                    ? '#b45309'
                    : '#b91c1c';
              const statusTone =
                normalizedState === 'fresh'
                  ? '#f0fdf4'
                  : normalizedState === 'aging'
                    ? '#fffbeb'
                    : '#fef2f2';

              const age = Number(food.elapsed_hours);
              const shelfLife = Number(food.shelf_life_hours);
              const progress =
                Number.isFinite(age) && shelfLife > 0
                  ? Math.max(0, Math.min(100, (age / shelfLife) * 100))
                  : 0;

              return (
                <article key={food.id} className="card" style={foodCardStyle}>
                  <div style={foodCardTopStyle}>
                    <div style={fruitIconStyle}>{fruit?.emoji || '🍎'}</div>
                    <span
                      style={{
                        ...statusBadgeStyle,
                        color: statusColor,
                        background: statusTone,
                        borderColor: statusColor + '35',
                      }}
                    >
                      <span
                        style={{
                          ...statusDotStyle,
                          background: statusColor,
                        }}
                      />
                      {state}
                    </span>
                  </div>

                  <h3 style={foodNameStyle}>{fruit?.name || food.name}</h3>
                  <p style={foodTypeStyle}>Fruit · Simulated storage item</p>

                  <div style={ageDetailsStyle}>
                    <div>
                      <span style={detailLabelStyle}>Simulated age</span>
                      <strong style={detailValueStyle}>
                        {Number.isFinite(age) ? age : '—'}
                        <span style={detailUnitStyle}> hours</span>
                      </strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={detailLabelStyle}>Shelf life</span>
                      <strong style={detailValueStyle}>
                        {Number.isFinite(shelfLife) ? shelfLife : '—'}
                        <span style={detailUnitStyle}> hours</span>
                      </strong>
                    </div>
                  </div>

                  <div style={progressHeaderStyle}>
                    <span style={detailLabelStyle}>Shelf-life elapsed</span>
                    <strong style={{ color: statusColor, fontSize: 12 }}>
                      {progress.toFixed(0)}%
                    </strong>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={`${food.name} shelf-life elapsed`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress)}
                    style={progressTrackStyle}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: statusColor,
                        transition: 'width 250ms ease',
                      }}
                    />
                  </div>

                  <div
                    role="status"
                    style={{
                      ...foodMessageStyle,
                      color: message.color,
                      background: message.background,
                      borderColor: message.border,
                    }}
                  >
                    <strong style={messageHeadingStyle}>
                      <span>{message.icon}</span> {message.label}
                    </strong>
                    <p style={messageTextStyle}>{message.text}</p>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDeleteFood(food)}
                    style={{
                      ...deleteButtonStyle,
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    <span>🗑️</span> Delete Item
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p style={disclaimerStyle}>
        <span>ⓘ</span> This feature demonstrates rule-based freshness simulation.
        It does not physically inspect fruit or detect spoilage using a camera.
      </p>
    </main>
  );
}

function SummaryCard({ title, value, icon, accent, tone, description }) {
  return (
    <article className="card" style={summaryCardStyle}>
      <div style={summaryCardTopStyle}>
        <span style={{ ...summaryIconStyle, background: tone }}>{icon}</span>
        <span style={{ ...summaryAccentStyle, background: accent }} />
      </div>
      <p style={summaryLabelStyle}>{title}</p>
      <h3 style={summaryNumberStyle}>{value}</h3>
      <p style={summaryDescriptionStyle}>{description}</p>
    </article>
  );
}

const headerStyle = {
  marginBottom: 28,
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
  margin: '0 0 10px',
  color: 'var(--text-h)',
  fontSize: 'clamp(1.8rem, 4vw, 2.35rem)',
  lineHeight: 1.2,
  letterSpacing: '-0.04em',
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

const addPanelStyle = {
  padding: 22,
};

const panelHeadingStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
  marginBottom: 22,
};

const panelIconStyle = {
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 48,
  height: 48,
  borderRadius: 15,
  background: 'var(--primary-light)',
  fontSize: 24,
};

const panelTitleStyle = {
  margin: 0,
  color: 'var(--text-h)',
  fontSize: 20,
  letterSpacing: '-0.025em',
};

const panelDescriptionStyle = {
  margin: '5px 0 0',
  color: 'var(--text)',
  fontSize: 13,
  lineHeight: 1.6,
};

const formStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'end',
  gap: 14,
};

const fieldStyle = {
  display: 'flex',
  flex: '1 1 230px',
  flexDirection: 'column',
  gap: 8,
  minWidth: 0,
};

const fieldLabelStyle = {
  color: 'var(--text-h)',
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle = {
  width: '100%',
  minHeight: 45,
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--surface)',
  color: 'var(--text-h)',
  fontSize: 14,
};

const shelfLifePreviewStyle = {
  display: 'flex',
  flex: '0 1 190px',
  flexDirection: 'column',
  gap: 4,
  minHeight: 45,
  justifyContent: 'center',
  padding: '8px 13px',
  border: '1px solid #bfdbfe',
  borderRadius: 'var(--radius-md)',
  background: '#eff6ff',
  color: '#1e40af',
};

const previewLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
};

const previewValueStyle = {
  fontSize: 17,
  lineHeight: 1.3,
};

const previewFootStyle = {
  fontSize: 10,
  color: '#1d4ed8',
};

const primaryButtonStyle = {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
  minHeight: 43,
  padding: '10px 16px',
  border: '1px solid var(--primary)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--primary)',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 750,
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-h)',
};

const hintStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  margin: '16px 0 0',
  color: 'var(--text)',
  fontSize: 12,
  lineHeight: 1.7,
};

const controlsPanelStyle = {
  padding: 22,
};

const controlsStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 10,
};

const busyTextStyle = {
  color: 'var(--text)',
  fontSize: 12,
};

const sectionHeadingStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 16,
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

const inventoryCountStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '7px 11px',
  border: '1px solid var(--border)',
  borderRadius: 999,
  background: 'var(--surface)',
  color: 'var(--text)',
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: 16,
};

const summaryCardStyle = {
  padding: 20,
  borderTop: '3px solid var(--border)',
  minWidth: 0,
};

const summaryCardTopStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 15,
};

const summaryIconStyle = {
  display: 'grid',
  placeItems: 'center',
  width: 43,
  height: 43,
  borderRadius: 14,
  fontSize: 22,
};

const summaryAccentStyle = {
  width: 27,
  height: 4,
  borderRadius: 999,
};

const summaryLabelStyle = {
  margin: '0 0 7px',
  color: 'var(--text)',
  fontSize: 13,
  fontWeight: 650,
};

const summaryNumberStyle = {
  margin: 0,
  color: 'var(--text-h)',
  fontSize: 31,
  lineHeight: 1.2,
  letterSpacing: '-0.04em',
};

const summaryDescriptionStyle = {
  margin: '8px 0 0',
  color: 'var(--text)',
  fontSize: 12,
  lineHeight: 1.5,
};

const foodGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 265px), 1fr))',
  gap: 17,
};

const foodCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  padding: 19,
};

const foodCardTopStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  marginBottom: 12,
};

const fruitIconStyle = {
  display: 'grid',
  placeItems: 'center',
  width: 58,
  height: 58,
  borderRadius: 18,
  background: 'var(--surface-soft)',
  fontSize: 34,
};

const statusBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 9px',
  border: '1px solid',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: 'nowrap',
};

const statusDotStyle = {
  width: 7,
  height: 7,
  borderRadius: '50%',
};

const foodNameStyle = {
  margin: '0 0 4px',
  color: 'var(--text-h)',
  fontSize: 19,
  letterSpacing: '-0.02em',
};

const foodTypeStyle = {
  margin: '0 0 17px',
  color: 'var(--text)',
  fontSize: 12,
};

const ageDetailsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
  padding: '13px 0',
  borderTop: '1px solid var(--border)',
  borderBottom: '1px solid var(--border)',
};

const detailLabelStyle = {
  display: 'block',
  marginBottom: 5,
  color: 'var(--text)',
  fontSize: 11,
  fontWeight: 600,
};

const detailValueStyle = {
  color: 'var(--text-h)',
  fontSize: 17,
  fontWeight: 800,
  overflowWrap: 'anywhere',
};

const detailUnitStyle = {
  color: 'var(--text)',
  fontSize: 11,
  fontWeight: 500,
};

const progressHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8,
  marginTop: 14,
  marginBottom: 7,
};

const progressTrackStyle = {
  width: '100%',
  height: 7,
  overflow: 'hidden',
  borderRadius: 999,
  background: 'var(--border)',
};

const foodMessageStyle = {
  margin: '17px 0 0',
  padding: '12px',
  border: '1px solid',
  borderRadius: 'var(--radius-md)',
};

const messageHeadingStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 11,
  letterSpacing: '0.04em',
};

const messageTextStyle = {
  margin: '5px 0 0',
  fontSize: 12,
  lineHeight: 1.6,
};

const deleteButtonStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  minHeight: 41,
  marginTop: 14,
  padding: '9px 12px',
  border: '1px solid #fecaca',
  borderRadius: 'var(--radius-md)',
  background: '#fff7f7',
  color: '#b91c1c',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 750,
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 9,
  padding: '38px 20px',
  textAlign: 'center',
};

const emptyTitleStyle = {
  margin: 0,
  color: 'var(--text-h)',
  fontSize: 18,
};

const emptyDescriptionStyle = {
  maxWidth: 430,
  margin: 0,
  color: 'var(--text)',
  fontSize: 13,
  lineHeight: 1.7,
};

const disclaimerStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  margin: '18px 0 0',
  color: 'var(--text)',
  fontSize: 11,
  lineHeight: 1.7,
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

export default FoodSimulation;