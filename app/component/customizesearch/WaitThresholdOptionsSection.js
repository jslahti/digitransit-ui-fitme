import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';

import MinuteSettingsDropdown, {
  getFiveWaitOptionsNumerical,
  valueMinuteShape,
} from './MinuteSettingsDropdown';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { findNearestOption } from '../../util/planParamUtil';

// eslint-disable-next-line react/prefer-stateless-function
class WaitThresholdOptionsSection extends React.Component {
  render() {
    const { defaultSettings, waitThreshold, overrideStyle } = this.props;
    const { intl } = this.context;
    const options = getFiveWaitOptionsNumerical(this.props.waitThresholdOptions);
    const currentSelection =
      options.find(option => option.value === waitThreshold) ||
      options.find(
        option =>
          option.value ===
          findNearestOption(waitThreshold, this.props.waitThresholdOptions),
      );
    return (
      <React.Fragment>
        <MinuteSettingsDropdown
          name="wait-threshold-selector"
          currentSelection={currentSelection}
          defaultValue={defaultSettings.waitThreshold}
          onOptionSelected={value => {
            this.context.executeAction(saveRoutingSettings, {
              waitThreshold: value,
            });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeWaitThreshold',
              name: value,
            });
          }}
          options={options}
          formatOptions
          labelText={intl.formatMessage({ id: 'wait-threshold' })}
          translateLabels={false}
          overrideStyle={overrideStyle}
        />
      </React.Fragment>
    );
  }
}

WaitThresholdOptionsSection.propTypes = {
  waitThreshold: valueMinuteShape.isRequired,
  waitThresholdOptions: PropTypes.array.isRequired,
  overrideStyle: PropTypes.object,
  defaultSettings: PropTypes.shape({
    waitThreshold: PropTypes.number.isRequired,
  }).isRequired,
};

WaitThresholdOptionsSection.contextTypes = {
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default WaitThresholdOptionsSection;
