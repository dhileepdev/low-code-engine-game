import React, { useState } from 'react';
import { Check, Code2, Plus, Trash2, X, Zap } from 'lucide-react';
import { ActionType, ConditionType, GridEntity, LogicRule, PuzzleLevel, TriggerType } from '../../types/puzzle';

interface RuleBuilderModalProps {
  level: PuzzleLevel;
  onSaveRules: (rules: LogicRule[]) => void;
  onClose: () => void;
}

export const RuleBuilderModal: React.FC<RuleBuilderModalProps> = ({
  level,
  onSaveRules,
  onClose,
}) => {
  const [rules, setRules] = useState<LogicRule[]>([...level.rules]);
  const [activeRuleId, setActiveRuleId] = useState<string | null>(rules[0]?.id || null);

  const activeRule = rules.find((r) => r.id === activeRuleId);

  const triggerTargets = level.entities.filter((e) =>
    ['pressure_plate', 'laser_target', 'color_switch', 'gem'].includes(e.type)
  );

  const actionTargets = level.entities.filter((e) =>
    ['door', 'forcefield', 'laser_emitter', 'mirror'].includes(e.type)
  );

  const handleAddRule = () => {
    const newRule: LogicRule = {
      id: `rule_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: `Logic Rule ${rules.length + 1}`,
      enabled: true,
      trigger: {
        type: 'on_step',
        targetId: triggerTargets[0]?.id || '',
      },
      conditions: [],
      actions: [
        {
          type: 'open_door',
          targetId: actionTargets[0]?.id || '',
          message: 'Low-Code Rule Executed!',
        },
      ],
    };

    setRules([...rules, newRule]);
    setActiveRuleId(newRule.id);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    if (activeRuleId === id) {
      setActiveRuleId(updated[0]?.id || null);
    }
  };

  const updateActiveRule = (updater: (prev: LogicRule) => LogicRule) => {
    if (!activeRuleId) return;
    setRules(rules.map((r) => (r.id === activeRuleId ? updater(r) : r)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Low-Code Visual Logic Engine</h2>
              <p className="text-xs text-slate-400">Wire visual IF-TRIGGER ➔ AND-CONDITION ➔ THEN-ACTION rules for your puzzle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 flex-1 overflow-hidden min-h-[360px]">
          {/* Left Column: Rule List Sidebar */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Rules List ({rules.length})</span>
              <button
                onClick={handleAddRule}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </button>
            </div>

            {rules.map((rule) => (
              <div
                key={rule.id}
                onClick={() => setActiveRuleId(rule.id)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                  activeRuleId === rule.id
                    ? 'bg-purple-950/60 border-purple-500/80 text-purple-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Zap className={`w-4 h-4 shrink-0 ${rule.enabled ? 'text-amber-400' : 'text-slate-600'}`} />
                  <span className="text-xs font-semibold truncate">{rule.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRule(rule.id);
                  }}
                  className="p-1 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Right Column: Rule Configurator */}
          {activeRule ? (
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-4 overflow-y-auto">
              {/* Rule Name & Toggle */}
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={activeRule.name}
                  onChange={(e) =>
                    updateActiveRule((r) => ({ ...r, name: e.target.value }))
                  }
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                  placeholder="Rule Name"
                />
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={activeRule.enabled}
                    onChange={(e) =>
                      updateActiveRule((r) => ({ ...r, enabled: e.target.checked }))
                    }
                    className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Rule Enabled</span>
                </label>
              </div>

              {/* Block 1: IF TRIGGER */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide mb-2">
                  <Zap className="w-4 h-4" /> 1. IF TRIGGER EVENT
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={activeRule.trigger.type}
                    onChange={(e) =>
                      updateActiveRule((r) => ({
                        ...r,
                        trigger: { ...r.trigger, type: e.target.value as TriggerType },
                      }))
                    }
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="on_step">On Stepped / Compressed</option>
                    <option value="on_laser_hit">On Laser Hit Target</option>
                    <option value="on_gem_collect">On Gem Collected</option>
                    <option value="on_switch_toggle">On Color Switch Toggled</option>
                  </select>

                  <select
                    value={activeRule.trigger.targetId || ''}
                    onChange={(e) =>
                      updateActiveRule((r) => ({
                        ...r,
                        trigger: { ...r.trigger, targetId: e.target.value },
                      }))
                    }
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="">Any Target Prop</option>
                    {triggerTargets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.customName || `${t.type} at (${t.x}, ${t.z})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Block 2: THEN ACTION */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">
                  <Code2 className="w-4 h-4" /> 2. THEN EXECUTE ACTION
                </div>

                {activeRule.actions.map((act, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <select
                      value={act.type}
                      onChange={(e) =>
                        updateActiveRule((r) => {
                          const actions = [...r.actions];
                          actions[idx].type = e.target.value as ActionType;
                          return { ...r, actions };
                        })
                      }
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    >
                      <option value="open_door">Open Door / Lower Gate</option>
                      <option value="toggle_forcefield">Disable Forcefield</option>
                      <option value="win_level">Trigger Win Level</option>
                    </select>

                    <select
                      value={act.targetId || ''}
                      onChange={(e) =>
                        updateActiveRule((r) => {
                          const actions = [...r.actions];
                          actions[idx].targetId = e.target.value;
                          return { ...r, actions };
                        })
                      }
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    >
                      <option value="">Target Object</option>
                      {actionTargets.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.customName || `${t.type} at (${t.x}, ${t.z})`}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={act.message || ''}
                      onChange={(e) =>
                        updateActiveRule((r) => {
                          const actions = [...r.actions];
                          actions[idx].message = e.target.value;
                          return { ...r, actions };
                        })
                      }
                      placeholder="Toast Message on Trigger"
                      className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 flex items-center justify-center text-slate-500 text-xs">
              No rule selected. Click "Add Rule" to create custom logic!
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveRules(rules);
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
          >
            <Check className="w-4 h-4" />
            Apply Low-Code Logic
          </button>
        </div>
      </div>
    </div>
  );
};
