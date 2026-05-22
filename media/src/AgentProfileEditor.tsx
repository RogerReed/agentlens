import {
  AGENT_ORDER,
  AGENT_PROFILE_FIELD_META,
  type AgentProfileMetric,
  type AgentSource,
  type AgentThresholdProfiles,
} from './agentProfiles'

interface AgentProfileEditorProps {
  title: string
  description: string
  profiles: AgentThresholdProfiles
  fields: AgentProfileMetric[]
  onChange: (profiles: AgentThresholdProfiles) => void
}

function fieldValueLabel(metric: AgentProfileMetric, value: number): string {
  if (metric === 'contextWindowTokens') return value.toLocaleString()
  return String(value)
}

export function AgentProfileEditor({ title, description, profiles, fields, onChange }: AgentProfileEditorProps) {
  function updateProfile(source: AgentSource, metric: AgentProfileMetric, value: number) {
    const meta = AGENT_PROFILE_FIELD_META[metric]
    if (!Number.isFinite(value) || value < meta.min || value > meta.max) return
    onChange({
      ...profiles,
      [source]: {
        ...profiles[source],
        [metric]: value,
      },
    })
  }

  return (
    <div style="padding:12px 14px;margin:0 0 14px;border:1px solid var(--border);border-radius:6px;background:var(--panel-bg)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px">
        <div>
          <div class="section-label" style="margin-bottom:4px">{title}</div>
          <div style="font-size:12px;color:var(--muted);line-height:1.45">{description}</div>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:620px">
          <thead>
            <tr style="color:var(--muted);text-transform:uppercase;font-size:10px;letter-spacing:.4px">
              <th style="text-align:left;padding:0 8px 6px 0;font-weight:700">Agent</th>
              {fields.map(metric => (
                <th key={metric} style="text-align:left;padding:0 8px 6px;font-weight:700">{AGENT_PROFILE_FIELD_META[metric].label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENT_ORDER.map(source => {
              const profile = profiles[source]
              return (
                <tr key={source} style="border-top:1px solid var(--border)">
                  <td style="padding:8px 8px 8px 0;white-space:nowrap">
                    <span style={'display:inline-block;width:8px;height:8px;border-radius:50%;background:' + profile.color + ';margin-right:6px;vertical-align:middle'} />
                    <strong>{profile.label}</strong>
                  </td>
                  {fields.map(metric => {
                    const meta = AGENT_PROFILE_FIELD_META[metric]
                    return (
                      <td key={metric} style="padding:8px">
                        <div style="display:flex;align-items:center;gap:6px">
                          <input
                            type="number"
                            value={profiles[source][metric]}
                            min={meta.min}
                            max={meta.max}
                            step={meta.step}
                            aria-label={profile.label + ' ' + meta.label}
                            onChange={e => {
                              const next = parseFloat((e.target as HTMLInputElement).value)
                              updateProfile(source, metric, next)
                            }}
                            style="width:82px;background:var(--bg);color:var(--fg,inherit);border:1px solid var(--border);border-radius:3px;padding:2px 7px;font-size:12px"
                          />
                          <span class="muted" title={fieldValueLabel(metric, profiles[source][metric]) + ' ' + meta.unit}>{meta.unit}</span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

