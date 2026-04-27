import { React, Immutable, type UseDataSource, DataSourceTypes } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import type { IMConfig } from '../config'
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components'

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, unknown> {
  supportedTypes = Immutable([DataSourceTypes.WebMap])

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds
    })
  }

  render () {
    return (
      <div className="switch-controller-setting p-2">
        <div className="section-title" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Select Map Widget
        </div>
        <MapWidgetSelector
          useMapWidgetIds={this.props.useMapWidgetIds}
          onSelect={this.onMapWidgetSelected}
        />
      </div>
    )
  }
}
