import { Suspense, lazy } from 'react';
import { Brain } from 'lucide-react';
import Loading from '../../components/Loading';

const PredictiveAnalyticsDashboard = lazy(() => import('../../components/PredictiveAnalyticsDashboard'));

export default function AIPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Analytics & Predictions</h1>
            <p className="text-sm text-slate-400">Advanced machine learning insights and market predictions</p>
          </div>
        </div>
      </div>

      {/* Predictive Analytics Dashboard */}
      <Suspense fallback={<Loading message="Loading AI analytics..." />}>
        <PredictiveAnalyticsDashboard />
      </Suspense>
    </div>
  );
}
