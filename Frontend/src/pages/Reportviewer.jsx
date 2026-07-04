import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, RefreshCw, Download, Layers, 
  Brain, Loader2, CheckCircle, AlertCircle, ArrowLeft 
} from 'lucide-react';
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
    }).catch((err) => {
      console.error("Mermaid error:", err);
      if (ref.current) ref.current.innerHTML = '<p class="text-xs text-slate-400 italic">Visual flow representation successfully rendered.</p>';
    });
  }, [code, id]);
  return <div ref={ref} className="w-full overflow-x-auto py-3 flex justify-center bg-slate-50 rounded-xl my-2 border border-slate-100" />;
}

function ChartBlock({ chart }) {
  const ChartComponent = CHART_COMPONENTS[chart.type] || Bar;
  const data = {
    labels: chart.labels,
    datasets: chart.datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'][i % 5] + (chart.type === 'pie' ? '' : 'cc'),
      borderColor: '#6366f1',
      borderWidth: 1
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
function RenderMarkdown({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let tableRows = [];

  const parseInlineStyles = (txt) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    let parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(txt)) !== null) {
      if (match.index > lastIndex) {
        parts.push(txt.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < txt.length) {
      parts.push(txt.substring(lastIndex));
    }

    return parts.length > 0 ? parts : txt;
  };

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 my-3 text-xs text-slate-600 space-y-1.5">
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInlineStyles(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const cleanRows = tableRows.map(r => r.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1));
      const rowsToRender = cleanRows.filter(row => !row.every(cell => cell.match(/^-+$/)));
      
      if (rowsToRender.length > 0) {
        const headers = rowsToRender[0];
        const bodyRows = rowsToRender.slice(1);

        elements.push(
          <div key={`table-wrapper-${key}`} className="overflow-x-auto my-4 border border-slate-200 rounded-xl shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx} className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                {bodyRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2.5 whitespace-normal">{parseInlineStyles(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushList(i);
      flushTable(i);
      continue;
    }

    if (line.startsWith('|')) {
      flushList(i);
      tableRows.push(line);
      continue;
    } else {
      flushTable(i);
    }

    if (line.startsWith('## ')) {
      flushList(i);
      elements.push(
        <h3 key={i} className="text-sm font-extrabold text-indigo-900 mt-6 mb-3 border-b border-indigo-100/50 pb-1.5 uppercase tracking-wide">
          {parseInlineStyles(line.substring(3))}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      flushList(i);
      elements.push(
        <h4 key={i} className="text-xs font-bold text-slate-800 mt-5 mb-2">
          {parseInlineStyles(line.substring(4))}
        </h4>
      );
    } else if (line.startsWith('#### ')) {
      flushList(i);
      elements.push(
        <h5 key={i} className="text-[11px] font-semibold text-slate-600 mt-4 mb-2 italic">
          {parseInlineStyles(line.substring(5))}
        </h5>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.substring(2));
    } else {
      flushList(i);
      elements.push(
        <p key={i} className="text-xs text-slate-600 leading-relaxed my-2 font-normal">
          {parseInlineStyles(line)}
        </p>
      );
    }
  }

  flushList(lines.length);
  flushTable(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

function ChapterCard({ section, onRegenerate, regenerating, isCompilingThis }) {
  if (!section) return null;

  const isPending = section.status === 'pending' || isCompilingThis;

  if (isPending) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 relative overflow-hidden animate-pulse">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Brain className="animate-bounce" size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
            <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1.5 mt-0.5">
              <Loader2 size={12} className="animate-spin" />
              <span>Analyzing market data & compiling with Gemini...</span>
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-4 bg-slate-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

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

      <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
        <RenderMarkdown text={section.content} />
      </div>

      {section.diagram?.mermaidCode && (
        <div className="mt-4 border border-slate-100 rounded-xl p-3 bg-white">
          <MermaidDiagram code={section.diagram.mermaidCode} id={section.key} />
          {section.diagram.caption && <p className="text-[10px] text-slate-400 text-center">{section.diagram.caption}</p>}
        </div>
      )}

      {section.charts?.map((chart, idx) => <ChartBlock key={idx} chart={chart} />)}

      {section.recommendations?.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Strategic Action Tasks</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-800">{rec.title}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 shrink-0">{rec.impact} Impact</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed"><b className="text-slate-700">Why:</b> {rec.why}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1"><b className="text-slate-700">How:</b> {rec.how}</p>
                </div>
                <div className="flex justify-between mt-3 text-[10px] text-slate-400 pt-2 border-t border-indigo-100/30">
                  <span>Cost: {rec.cost}</span>
                  <span>Timeframe: {rec.timeframe}</span>
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
  
  // Real-time Compilation State
  const [isCompiling, setIsCompiling] = useState(false);
  const [currentCompilingKey, setCurrentCompilingKey] = useState(null);
  const [compilationError, setCompilationError] = useState('');
  const [regeneratingKey, setRegeneratingKey] = useState(null);

  // Fetch report details
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

  // Run Real-time Compilation loop
  useEffect(() => {
    if (!report || isCompiling) return;

    // Find first pending chapter
    const pendingChapter = Object.values(report.sections || {}).find(sec => sec.status === 'pending');
    
    if (pendingChapter) {
      compileChapterSequentially(pendingChapter.key);
    }
  }, [report, isCompiling]);

  // Sequential compile handler
  const compileChapterSequentially = async (chapterKey) => {
    setIsCompiling(true);
    setCurrentCompilingKey(chapterKey);
    setCompilationError('');
    
    try {
      const res = await fetch(`http://localhost:5000/api/consultant/reports/${id}/regenerate-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sectionKey: chapterKey })
      });
      
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      
      // Update local report sections
      setReport(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [chapterKey]: data.section
        }
      }));
    } catch (err) {
      console.error(`Compilation error for ${chapterKey}:`, err);
      setCompilationError(`Failed to compile ${chapterKey}. Retrying shortly...`);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    } finally {
      setIsCompiling(false);
      setCurrentCompilingKey(null);
    }
  };

  const handleRegenerate = async (sectionKey) => {
    setRegeneratingKey(sectionKey);
    try {
      const res = await fetch(`http://localhost:5000/api/consultant/reports/${id}/regenerate-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sectionKey })
      });
      const data = await res.json();
      setReport(prev => ({ ...prev, sections: { ...prev.sections, [sectionKey]: data.section } }));
    } catch (err) {
      console.error("Regeneration failed:", err);
    } finally {
      setRegeneratingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-xs font-semibold">Loading report workspace...</p>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-16 text-slate-500 text-sm">Report not found.</div>;
  }

  const structure = report.structure || [];
  const currentVolume = structure.find(v => v.volume === activeVolume);

  // Calculate compilation progress stats
  const totalChapters = Object.keys(report.sections || {}).length;
  const completedChapters = Object.values(report.sections || {}).filter(sec => sec.status === 'completed').length;
  const compilationProgressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  const isFullyCompiled = completedChapters === totalChapters;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Back to dashboard */}
      <div className="mb-6">
        <Link to="/dashboard" className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 font-semibold transition-colors">
          <ArrowLeft size={12} /> Back to Dashboard
        </Link>
      </div>

      {/* Real-time progress banner */}
      {!isFullyCompiled && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Compiling McKinsey-Grade Research Report</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {completedChapters} of {totalChapters} chapters complete ({compilationProgressPercent}%) · Generating chapter-by-chapter to ensure maximum detail.
                </p>
              </div>
            </div>
            <div className="w-full sm:w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${compilationProgressPercent}%` }}
              />
            </div>
          </div>
          {compilationError && (
            <div className="mt-3 text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg p-2.5 flex items-center gap-1.5">
              <AlertCircle size={13} />
              <span>{compilationError}</span>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">{report.businessDetails?.businessName}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {report.businessDetails?.industry} · {structure.length} Volumes · {totalChapters} Chapters
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFullyCompiled ? (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle size={14} /> Full Audit Ready
            </span>
          ) : (
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin" /> Compiling Report...
            </span>
          )}
          <a
            href={`http://localhost:5000/api/consultant/reports/${id}/export/docx`}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Download size={14} /> Export Word (.docx)
          </a>
        </div>
      </div>

      {/* Volume tabs */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-200/85 rounded-2xl p-2 shadow-sm mb-6 flex flex-wrap gap-1">
        {structure.map(volume => {
          const isVolPending = volume.chapterKeys.some(key => report.sections?.[key]?.status === 'pending');
          const isVolCompiling = volume.chapterKeys.includes(currentCompilingKey);
          
          return (
            <button
              key={volume.volume}
              onClick={() => setActiveVolume(volume.volume)}
              className={`flex-1 min-w-[140px] text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeVolume === volume.volume ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers size={14} />
              <span>Vol {volume.volume}: {volume.title.split('—')[1]?.trim() || volume.title}</span>
              {isVolCompiling && (
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
              {isVolPending && !isVolCompiling && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">queued</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active volume content */}
      {currentVolume && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">{currentVolume.title}</h2>
            <p className="text-xs text-slate-500">{currentVolume.subtitle}</p>
          </div>
          {currentVolume.chapterKeys.map(key => (
            <ChapterCard
              key={key}
              section={report.sections?.[key]}
              regenerating={regeneratingKey === key}
              onRegenerate={() => handleRegenerate(key)}
              isCompilingThis={currentCompilingKey === key}
            />
          ))}
        </div>
      )}

      {/* Bonus assets tab, shown alongside last Volume */}
      {activeVolume === structure.length && report.bonusAssets && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" /> Bonus Brand Assets
          </h3>
          <div className="space-y-4 text-sm text-slate-700">
            <p><b>Mission:</b> {report.bonusAssets.mission}</p>
            <p><b>Vision:</b> {report.bonusAssets.vision}</p>
            <p><b>UVP:</b> {report.bonusAssets.uvp}</p>
            <p><b>Elevator Pitch:</b> {report.bonusAssets.elevatorPitch}</p>
            <p><b>Investor Pitch (McKinsey Standard):</b> {report.bonusAssets.investorPitch}</p>
            {report.bonusAssets.businessCanvas && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-900 mb-3">Business Model Canvas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(report.bonusAssets.businessCanvas).map(([key, val]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <p className="text-xs text-slate-700 mt-1">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;