import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, RefreshCw, Download, Layers } from 'lucide-react';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
import {
  Chart,
  BarElement, LineElement, PointElement, ArcElement,
  RadialLinearScale, CategoryScale, LinearScale,
  Tooltip, Legend, Filler
} from 'chart.js';
import mermaid from 'mermaid';

Chart.register(BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, CategoryScale, LinearScale, Tooltip, Legend, Filler);

mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

const CHART_COMPONENTS = { bar: Bar, line: Line, pie: Pie, radar: Radar };

function MermaidDiagram({ code, id }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!code || !ref.current) return;
    mermaid.render(`mermaid-${id}`, code).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(() => {
      if (ref.current) ref.current.innerHTML = '<p class="text-xs text-red-500">Diagram could not be rendered.</p>';
    });
  }, [code, id]);
  return <div ref={ref} className="w-full overflow-x-auto py-3" />;
}

function ChartBlock({ chart, idx }) {
  const ChartComponent = CHART_COMPONENTS[chart.type] || Bar;
  const data = {
    labels: chart.labels,
    datasets: chart.datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'][i % 5] + (chart.type === 'pie' ? '' : 'cc'),
      borderColor: '#6366f1'
    }))
  };
  return (
    <div className="bg-slate-50/60 border border-slate-200/70 rounded-xl p-4 my-4">
      <h5 className="text-xs font-bold text-slate-700 mb-3">{chart.title}</h5>
      <div className="max-w-xl mx-auto">
        <ChartComponent data={data} options={{ responsive: true, plugins: { legend: { labels: { font: { size: 10 } } } } }} />
      </div>
    </div>
  );
}

function ChapterCard({ section, onRegenerate, regenerating }) {
  if (!section) return null;
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} /> Regenerate
        </button>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
        {section.content}
      </div>

      {section.diagram?.mermaidCode && (
        <div className="mt-4 border border-slate-100 rounded-xl p-3 bg-white">
          <MermaidDiagram code={section.diagram.mermaidCode} id={section.key} />
          {section.diagram.caption && <p className="text-[10px] text-slate-400 text-center">{section.diagram.caption}</p>}
        </div>
      )}

      {section.charts?.map((chart, idx) => <ChartBlock key={idx} chart={chart} idx={idx} />)}

      {section.recommendations?.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Strategic Action Tasks</h4>
          <div className="space-y-2">
            {section.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-lg">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-slate-800">{rec.title}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 shrink-0">{rec.impact} Impact</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">{rec.how}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                  <span>Cost: {rec.cost}</span><span>·</span><span>Timeframe: {rec.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ReportViewer = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVolume, setActiveVolume] = useState(1);
  const [regeneratingKey, setRegeneratingKey] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/consultant/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setReport(data);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReport();
  }, [id, token]);

  const handleRegenerate = async (sectionKey) => {
    setRegeneratingKey(sectionKey);
    try {
      const res = await fetch(`http://localhost:5000/api/consultant/reports/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sectionKey })
      });
      const data = await res.json();
      setReport(prev => ({ ...prev, sections: { ...prev.sections, [sectionKey]: data.section } }));
    } finally {
      setRegeneratingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-xs font-semibold">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-16 text-slate-500 text-sm">Report not found.</div>;
  }

  const structure = report.structure || [];
  const currentVolume = structure.find(v => v.volume === activeVolume);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">{report.businessDetails?.businessName}</h1>
          <p className="text-slate-500 text-sm mt-1">{report.businessDetails?.industry} · {structure.length} Volumes · {structure.reduce((n, v) => n + (v.chapterKeys?.length || 0), 0)} Chapters</p>
        </div>
        <a
          href={`http://localhost:5000/api/consultant/reports/${id}/export/docx`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <Download size={14} /> Export Full Report (.docx)
        </a>
      </div>

      {/* Volume tabs */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-200/85 rounded-2xl p-2 shadow-sm mb-6 flex flex-wrap gap-1">
        {structure.map(volume => (
          <button
            key={volume.volume}
            onClick={() => setActiveVolume(volume.volume)}
            className={`flex-1 min-w-[140px] text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeVolume === volume.volume ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers size={14} />
            <span>Vol {volume.volume}: {volume.title}</span>
            {report.volumeStatus?.[volume.key] === 'fallback' && (
              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">fallback</span>
            )}
          </button>
        ))}
      </div>

      {/* Active volume content */}
      {currentVolume && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Volume {currentVolume.volume} — {currentVolume.title}</h2>
            <p className="text-xs text-slate-500">{currentVolume.subtitle}</p>
          </div>
          {currentVolume.chapterKeys.map(key => (
            <ChapterCard
              key={key}
              section={report.sections?.[key]}
              regenerating={regeneratingKey === key}
              onRegenerate={() => handleRegenerate(key)}
            />
          ))}
        </div>
      )}

      {/* Bonus assets tab, shown alongside Volume 5 */}
      {activeVolume === 5 && report.bonusAssets && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={16} className="text-indigo-600" /> Bonus Brand Assets</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <p><b>Mission:</b> {report.bonusAssets.mission}</p>
            <p><b>Vision:</b> {report.bonusAssets.vision}</p>
            <p><b>UVP:</b> {report.bonusAssets.uvp}</p>
            <p><b>Elevator Pitch:</b> {report.bonusAssets.elevatorPitch}</p>
            <p><b>Investor Pitch:</b> {report.bonusAssets.investorPitch}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;.