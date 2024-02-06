/* eslint-disable jsx-a11y/label-has-as	sociated-control */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';

import cx from 'classnames';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import Toggle from './Toggle';
import Icon from '../Icon';
import {
  getAvailablePOITypes,
  getTypes,
  togglePOIType,
} from '../../util/poiTypeUtils';

const POITypesSection = (
  { config },
  { executeAction },
  poiTypes = getAvailablePOITypes(config),
  types = getTypes(config),
) => {
  const { iconColors } = config.colors;
  const alternativeNames = []; //config.useAlternativeNameForModes || [];
  console.log(['poiTypes=',poiTypes]);
  return (
    <fieldset>
      <legend className="poi-type-subheader settings-header">
        <FormattedMessage
          id="pick-type"
          defaultMessage="POI types"
        />
      </legend>
      <div className="poi-types-container">
        {poiTypes
          //.filter(type => type !== 'CITYBIKE')
          .map(type => (
            <div
              className="type-option-container"
              key={`type-option-${type.toLowerCase()}`}
            >
              <label
                htmlFor={`settings-toggle-${type}`}
                className={cx(
                  [`type-option-block`, 'toggle-label'],
                  type.toLowerCase(),
                  {
                    disabled: !types.includes(type),
                  },
                )}
              >
                <div className="type-icon">
                  <Icon
                    className={`${type}-icon`}
                    img={`icon-icon_${type.toLowerCase()}`}
                    color={
                      iconColors[
                        type.toLowerCase() === 'subway'
                          ? 'type-metro'
                          : `type-${type.toLowerCase()}`
                      ]
                    }
                  />
                </div>
                <div className="type-name">
                  <FormattedMessage
                    id={
                      alternativeNames.includes(type.toLowerCase())
                        ? `settings-alternative-name-${type.toLowerCase()}`
                        : type.toLowerCase()
                    }
                    defaultMessage={type.toLowerCase()}
                  />
                </div>
                <Toggle
                  id={`settings-toggle-${type}`}
                  toggled={types.filter(o2 => o2 === type).length > 0}
                  onToggle={() => {
                    console.log(['TOGGLE!']);
                    executeAction(saveRoutingSettings, {
                      poiTypes: togglePOIType(type, config),
                    })
                    }
                  }
                />
              </label>
            </div>
          ))}
      </div>
    </fieldset>
  );
};

POITypesSection.propTypes = {
  config: PropTypes.object.isRequired,
};

POITypesSection.contextTypes = {
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default POITypesSection;
