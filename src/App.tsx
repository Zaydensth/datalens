import { useState, useMemo } from 'react';
import './index.css';

/* ---- Data ---- */
const ranges = ['7D', '14D', '30D', '90D'] as const;
const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];

const dataByRange: Record<string, number[]> = {
  '7D':  [4200, 3800, 5100, 4700, 5600, 5200, 6100],
  '14D': [3100, 3400, 3800, 4200, 3900, 4500, 4100, 4800, 4400, 5100, 4700, 5600, 5200, 6100],
  '30D': [2800, 3100, 2900, 3400, 3800, 3600, 4200, 3900, 4500, 4100, 4800, 4400, 5100, 4700, 5600, 5200, 5800, 5400, 6100, 5700, 6400, 6000, 6800, 6300, 7100, 6700, 7400, 7000, 7800, 7300],
  '90D': Array.from({ length: 90 }, (_, i) => 2000 + Math.floor(Math.random() * 3000 + i * 50)),
};

const labels7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const channelData = [
  { label: 'Organic Search', value: 38, color: colors[0] },
  { label: 'Direct', value: 24, color: colors[1] },
  { label: 'Social Media', value: 18, color: colors[2] },
  { label: 'Referral', value: 12, color: colors[3] },
  { label: 'Email', value: 8, color: colors[4] },
];

const deviceData = [
  { label: 'Desktop', value: 52, color: colors[0] },
  { label: 'Mobile', value: 35, color: colors[3] },
  { label: 'Tablet', value: 13, color: colors[4] },
];

const topPages = [
  { page: '/home', views: 12847, bounce: '32%', trend: [40, 45, 42, 48, 52, 55, 60] },
  { page: '/pricing', views: 8432, bounce: '28%', trend: [30, 35, 38, 40, 42, 39, 45] },
  { page: '/docs', views: 6291, bounce: '45%', trend: [20, 22, 25, 28, 26, 30, 33] },
  { page: '/blog', views: 4103, bounce: '52%', trend: [15, 18, 16, 20, 22, 24, 28] },
  { page: '/about', views: 2856, bounce: '38%', trend: [10, 12, 11, 14, 16, 15, 18] },
];

const heatmapData = Array.from({ length: 28 }, () => Math.floor(Math.random() * 100));

function MiniSpark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 50},${18 - ((v - min) / (max - min || 1)) * 16}`).join(' ');
  return <svg viewBox="0 0 50 18"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

export default function App() {
  const [range, setRange] = useState<typeof ranges[number]>('7D');

  const chartData = useMemo(() => dataByRange[range], [range]);
  const maxVal = Math.max(...chartData);
  const total = chartData.reduce((a, b) => a + b, 0);

  // SVG line chart dimensions
  const W = 700, H = 200, PL = 40, PR = 10, PT = 10, PB = 25;
  const cw = W - PL - PR, ch = H - PT - PB;
  const points = chartData.map((v, i) => ({
    x: PL + (i / (chartData.length - 1)) * cw,
    y: PT + ch - (v / maxVal) * ch,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = linePath + ` L${points[points.length - 1].x},${H - PB} L${PL},${H - PB} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => PT + ch * (1 - pct));

  // Donut
  const donutR = 50, donutC = 2 * Math.PI * donutR;
  let donutOffset = 0;

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="logo-icon">📊</div>
          <div>
            <h1>DataLens</h1>
            <p>Analytics Overview</p>
          </div>
        </div>
        <div className="date-picker">
          {ranges.map(r => (
            <button key={r} className={`date-btn ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics">
        {[
          { icon: '👁️', label: 'Page Views', value: total.toLocaleString(), change: 12.5 },
          { icon: '👥', label: 'Unique Visitors', value: Math.floor(total * 0.62).toLocaleString(), change: 8.3 },
          { icon: '⏱️', label: 'Avg. Session', value: '3m 42s', change: -2.1 },
          { icon: '📈', label: 'Bounce Rate', value: '34.2%', change: -5.4 },
        ].map(m => (
          <div key={m.label} className="metric">
            <div className="metric-top">
              <span className="metric-icon">{m.icon}</span>
              <span className={`metric-change ${m.change >= 0 ? 'up' : 'down'}`}>
                {m.change >= 0 ? '↑' : '↓'} {Math.abs(m.change)}%
              </span>
            </div>
            <h3>{m.value}</h3>
            <p>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="charts-grid">
        {/* Line Chart */}
        <div className="chart-card">
          <div className="chart-head">
            <h3>Traffic Overview</h3>
            <span>Last {range}</span>
          </div>
          <div className="line-chart">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              {gridLines.map((y, i) => (
                <g key={i}>
                  <line x1={PL} y1={y} x2={W - PR} y2={y} className="chart-grid-line" />
                  <text x={PL - 6} y={y + 3} className="y-label" textAnchor="end">
                    {Math.round(maxVal * (i / 4) / 1000)}k
                  </text>
                </g>
              ))}
              {range === '7D' && points.map((p, i) => (
                <text key={i} x={p.x} y={H - 5} className="x-label">{labels7[i]}</text>
              ))}
              <path d={areaPath} className="chart-area" fill="url(#grad)" />
              <path d={linePath} className="chart-line" stroke="#6366f1" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} className="chart-dot" fill="#6366f1" stroke="#0f0f18" />
              ))}
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Channel breakdown */}
        <div className="chart-card">
          <div className="chart-head">
            <h3>Traffic Channels</h3>
            <span>By source</span>
          </div>
          <div className="hbar-chart">
            {channelData.map(c => (
              <div key={c.label} className="hbar-row">
                <span className="hbar-label">{c.label}</span>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${c.value}%`, background: c.color }} />
                </div>
                <span className="hbar-val" style={{ color: c.color }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="bottom-grid">
        {/* Top pages table */}
        <div className="table-card">
          <div className="table-head">Top Pages</div>
          <table>
            <thead>
              <tr><th>Page</th><th>Views</th><th>Bounce</th><th>Trend</th></tr>
            </thead>
            <tbody>
              {topPages.map(p => (
                <tr key={p.page}>
                  <td style={{ fontWeight: 600 }}>{p.page}</td>
                  <td>{p.views.toLocaleString()}</td>
                  <td>{p.bounce}</td>
                  <td><div className="spark"><MiniSpark data={p.trend} color="#6366f1" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Donut + Heatmap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Donut */}
          <div className="chart-card">
            <div className="chart-head"><h3>Device Breakdown</h3><span>This period</span></div>
            <div className="donut-wrap">
              <svg className="donut-svg" viewBox="0 0 120 120">
                {deviceData.map(d => {
                  const dash = (d.value / 100) * donutC;
                  const gap = donutC - dash;
                  const offset = donutOffset;
                  donutOffset += dash;
                  return (
                    <circle key={d.label} cx="60" cy="60" r={donutR} className="donut-ring"
                      stroke={d.color} strokeDasharray={`${dash} ${gap}`}
                      strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
                  );
                })}
                <text x="60" y="64" className="donut-center" textAnchor="middle">100%</text>
              </svg>
              <div className="donut-legend">
                {deviceData.map(d => (
                  <div key={d.label} className="legend-item">
                    <div className="legend-dot" style={{ background: d.color }} />
                    {d.label} — {d.value}%
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="chart-card">
            <div className="chart-head"><h3>Activity Heatmap</h3><span>Last 4 weeks</span></div>
            <div className="heat-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div className="heatmap-grid">
              {heatmapData.map((v, i) => (
                <div key={i} className="heat-cell" style={{
                  background: `rgba(99,102,241,${0.05 + (v / 100) * 0.8})`,
                }} title={`${v} sessions`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
