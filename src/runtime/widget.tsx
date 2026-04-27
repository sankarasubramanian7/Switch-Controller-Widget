/** @jsx jsx */
import { React, jsx, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import type { IMConfig } from '../config'

const { useState, useCallback, useRef, useEffect } = React

/* ═══════════════════ STYLES ═══════════════════ */
const COLORS = {
  bg: '#0a0f14',
  panel: '#121921',
  accent: '#00d4ff',
  success: '#00e676',
  danger: '#ff5252',
  text: '#e0e8f0',
  textDim: '#8899aa',
  border: '#2a3a4a'
}

const STYLES: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column',
    backgroundColor: COLORS.bg, color: COLORS.text, fontFamily: 'system-ui, sans-serif', overflow: 'auto'
  },
  card: {
    backgroundColor: COLORS.panel, borderRadius: '12px', padding: '20px', border: `1px solid ${COLORS.border}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '16px'
  },
  header: { fontSize: '18px', fontWeight: 700, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '12px', color: COLORS.accent },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
  label: { color: COLORS.textDim, fontWeight: 500 },
  value: { fontWeight: 600 },
  btnGroup: { display: 'flex', gap: '12px', marginTop: '10px' },
  btn: {
    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: '13px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
  },
  btnOpen: { backgroundColor: COLORS.success, color: '#000' },
  btnClose: { backgroundColor: COLORS.danger, color: '#fff' },
  toast: {
    padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
    marginTop: '16px', textAlign: 'center', animation: 'fadeIn 0.3s ease'
  },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.textDim, textAlign: 'center' }
}

export default function SwitchControllerWidget (props: AllWidgetProps<IMConfig>) {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null)
  const [selectedFeature, setSelectedFeature] = useState<__esri.Graphic | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const clickHandler = useRef<__esri.WatchHandle | null>(null)

  const onActiveViewChange = (jmv: JimuMapView) => {
    setJimuMapView(jmv)
  }

  // Handle map clicks
  useEffect(() => {
    if (!jimuMapView) return

    const view = jimuMapView.view
    clickHandler.current = view.on('click', async (event: (MouseEvent | __esri.MapViewScreenPoint) & (__esri.SceneViewScreenPoint | MouseEvent)) => {
      const response = await view.hitTest(event)
      const results = response.results.filter(r => r.type === 'graphic' && r.graphic.layer.type === 'feature') as __esri.GraphicHit[]

      if (results.length > 0) {
        setSelectedFeature(results[0].graphic)
        setMessage(null)
      } else {
        setSelectedFeature(null)
      }
    })

    return () => {
      if (clickHandler.current) {
        clickHandler.current.remove()
        clickHandler.current = null
      }
    }
  }, [jimuMapView])

  const updateSwitchStatus = useCallback(async (newStatus: string) => {
    if (!selectedFeature || !selectedFeature.layer) return

    setLoading(true)
    const layer = selectedFeature.layer as __esri.FeatureLayer

    try {
      // Simulate status field name if not configured
      const statusField = props.config.statusField || 'status'

      const updateFeature = selectedFeature.clone()
      updateFeature.attributes[statusField] = newStatus

      const result = await layer.applyEdits({
        updateFeatures: [updateFeature]
      })

      if (result.updateFeatureResults.length > 0 && !result.updateFeatureResults[0].error) {
        setMessage({ text: `Switch status updated to ${newStatus}`, type: 'success' })
        console.log(`[SwitchController] Subnetwork update simulated for feature ID: ${selectedFeature.attributes[layer.objectIdField]}`)
        // Refresh the layer and update local state
        // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
        await layer.refresh()
        setSelectedFeature(updateFeature)
      } else {
        throw new Error('Failed to update feature')
      }
    } catch (error) {
      console.error(error)
      setMessage({ text: 'Error updating switch status', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [selectedFeature, props.config.statusField])

  const renderDetails = () => {
    if (!selectedFeature)
      // eslint-disable-next-line curly
      return (
      <div style={STYLES.empty}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🖱️</div>
        <div>Select a switch on the map to interact</div>
      </div>
    )

    const attrs = selectedFeature.attributes
    const statusField = props.config.statusField || 'status'
    const status = attrs[statusField] || 'Unknown'

    return (
      <div style={STYLES.card}>
        <div style={STYLES.header}>Switch Details</div>

        <div style={STYLES.row}>
          <span style={STYLES.label}>Name:</span>
          <span style={STYLES.value}>{attrs.name || attrs.NAME || 'N/A'}</span>
        </div>

        <div style={STYLES.row}>
          <span style={STYLES.label}>ID:</span>
          <span style={STYLES.value}>{attrs.id || attrs.ID || attrs.objectid || attrs.OBJECTID}</span>
        </div>

        <div style={STYLES.row}>
          <span style={STYLES.label}>Status:</span>
          <span style={{ ...STYLES.value, color: status.toLowerCase() === 'open' ? COLORS.success : COLORS.danger }}>
            {status.toUpperCase()}
          </span>
        </div>

        <div style={STYLES.btnGroup}>
          <button
            style={{ ...STYLES.btn, ...STYLES.btnOpen, opacity: loading ? 0.6 : 1 }}
            onClick={() => updateSwitchStatus('Open')}
            disabled={loading}
          >
            {loading ? '...' : '🔓 Open Switch'}
          </button>
          <button
            style={{ ...STYLES.btn, ...STYLES.btnClose, opacity: loading ? 0.6 : 1 }}
            onClick={() => updateSwitchStatus('Closed')}
            disabled={loading}
          >
            {loading ? '...' : '🔒 Close Switch'}
          </button>
        </div>

        {message && (
          <div style={{
            ...STYLES.toast,
            backgroundColor: message.type === 'success' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)',
            color: message.type === 'success' ? COLORS.success : COLORS.danger,
            border: `1px solid ${message.type === 'success' ? COLORS.success : COLORS.danger}`
          }}>
            {message.text}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={STYLES.container} className="switch-controller-widget">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .switch-controller-widget button:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .switch-controller-widget button:active { transform: translateY(0); }
      `}</style>

      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={onActiveViewChange}
      />

      {!props.useMapWidgetIds?.length ? (
        <div style={STYLES.empty}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
          <div>Please select a Map widget in the settings</div>
        </div>
      ) : renderDetails()}
    </div>
  )
}
