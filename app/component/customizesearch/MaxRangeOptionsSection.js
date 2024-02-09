import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';

import RangeSettingsDropdown, {
  getFiveRangeOptionsNumerical,
  valueRangeShape,
} from './RangeSettingsDropdown';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { findNearestOption } from '../../util/planParamUtil';

// eslint-disable-next-line react/prefer-stateless-function
class MaxRangeOptionsSection extends React.Component {
  render() {
    const { defaultSettings, maxRange, overrideStyle } = this.props;
    const { intl } = this.context;
    const options = getFiveRangeOptionsNumerical(this.props.maxRangeOptions);
    const currentSelection =
      options.find(option => option.value === maxRange) ||
      options.find(
        option =>
          option.value ===
          findNearestOption(maxRange, this.props.maxRangeOptions),
      );
    return (
      <React.Fragment>
        <RangeSettingsDropdown
          name="max-range-selector"
          currentSelection={currentSelection}
          defaultValue={defaultSettings.maxRange}
          onOptionSelected={value => {
            this.context.executeAction(saveRoutingSettings, {
              maxRange: value,
            });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangemaxRange',
              name: value,
            });
          }}
          options={options}
          formatOptions
          labelText={intl.formatMessage({ id: 'max-range' })}
          translateLabels={false}
          overrideStyle={overrideStyle}
        />
      </React.Fragment>
    );
  }
}

MaxRangeOptionsSection.propTypes = {
  maxRange: valueRangeShape.isRequired,
  maxRangeOptions: PropTypes.array.isRequired,
  overrideStyle: PropTypes.object,
  defaultSettings: PropTypes.shape({
    maxRange: PropTypes.number.isRequired,
  }).isRequired,
};

MaxRangeOptionsSection.contextTypes = {
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default MaxRangeOptionsSection;
