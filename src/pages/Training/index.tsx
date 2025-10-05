import { useState, useEffect } from 'react';
import { GraduationCap, Play, Square, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function Training() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState({
    model: 'lstm',
    epochs: 50,
    batch_size: 32,
    learning_rate: 0.001,
  });

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(async () => {
        try {
          const status = await api.get('/api/train/status');
          setTrainingStatus(status);
          if (status.logs) {
            setLogs(status.logs);
          }
          if (status.state === 'completed' || status.state === 'failed') {
            setIsTraining(false);
          }
        } catch (error) {
          console.error('Failed to get training status:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const handleStartTraining = async () => {
    try {
      setIsTraining(true);
      await api.post('/api/train/start', config);
      setLogs(['Training started...']);
    } catch (error) {
      console.error('Failed to start training:', error);
      setIsTraining(false);
    }
  };

  const handleStopTraining = async () => {
    try {
      await api.post('/api/train/stop');
      setIsTraining(false);
    } catch (error) {
      console.error('Failed to stop training:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Model Training</h1>
              <p className="text-sm text-slate-400">Train and optimize ML models</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isTraining ? (
              <button
                onClick={handleStartTraining}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-medium transition-all"
              >
                <Play className="w-4 h-4" />
                Start Training
              </button>
            ) : (
              <button
                onClick={handleStopTraining}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl text-white font-medium transition-all"
              >
                <Square className="w-4 h-4" />
                Stop Training
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Model Type</label>
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                disabled={isTraining}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              >
                <option value="lstm">LSTM</option>
                <option value="gru">GRU</option>
                <option value="transformer">Transformer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Epochs</label>
              <input
                type="number"
                value={config.epochs}
                onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) })}
                disabled={isTraining}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Batch Size</label>
              <input
                type="number"
                value={config.batch_size}
                onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) })}
                disabled={isTraining}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Learning Rate</label>
              <input
                type="number"
                step="0.0001"
                value={config.learning_rate}
                onChange={(e) => setConfig({ ...config, learning_rate: parseFloat(e.target.value) })}
                disabled={isTraining}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Status & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Status</span>
                {isTraining ? (
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : trainingStatus?.state === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="text-2xl font-bold text-white capitalize">
                {isTraining ? 'Training' : trainingStatus?.state || 'Idle'}
              </div>
            </div>

            <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Epoch</span>
              </div>
              <div className="text-2xl font-bold text-white ltr-numbers">
                {trainingStatus?.current_epoch || 0} / {config.epochs}
              </div>
            </div>

            <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Loss</span>
              </div>
              <div className="text-2xl font-bold text-white ltr-numbers">
                {trainingStatus?.current_loss?.toFixed(4) || 'N/A'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {isTraining && (
            <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Training Progress</span>
                <span className="text-sm text-white ltr-numbers">
                  {trainingStatus?.current_epoch ? Math.round((trainingStatus.current_epoch / config.epochs) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${trainingStatus?.current_epoch ? (trainingStatus.current_epoch / config.epochs) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
            <h2 className="text-lg font-semibold text-white mb-4">Training Logs</h2>
            <div className="bg-slate-900/50 rounded-lg p-4 h-64 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              <div className="font-mono text-sm text-slate-300 space-y-1">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div key={idx} className="ltr-numbers">{log}</div>
                  ))
                ) : (
                  <div className="text-slate-500">No logs yet. Start training to see progress.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
