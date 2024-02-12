/* eslint-disable jsx-a11y/label-has-as	sociated-control */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';

import cx from 'classnames';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import Toggle from './Toggle';
import Icon from '../Icon';
import {
  getAvailablePOISources,
  getSources,
  togglePOISource,
} from '../../util/poiSourceUtils';

/*
svg symbols:
icon-icon_mapMarker-poi-source-openstreetmap
icon-icon_mapMarker-poi-source-datahub
*/
const POISourceSection = (
  { config },
  { executeAction },
  poiSources = getAvailablePOISources(config),
  sources = getSources(config),
) => {
  const { iconColors } = config.colors;
  const alternativeNames = []; //config.useAlternativeNameForModes || [];
  console.log(['poiSources=',poiSources]);
  console.log(['sources=',sources]);
  return (
    <fieldset>
      <legend className="transport-mode-subheader settings-header">
        <FormattedMessage
          id="pick-source"
          defaultMessage="POI Sources"
        />
      </legend>
      <div className="transport-modes-container">
        {poiSources
          .map(source => (
            <div
              className="mode-option-container"
              key={`source-option-${source.toLowerCase()}`}
            >
              <label
                htmlFor={`settings-toggle-${source}`}
                className={cx(
                  [`mode-option-block`, 'toggle-label'],
                  source.toLowerCase(),
                  {
                    disabled: !sources.includes(source),
                  },
                )}
              >
                <div className="mode-icon">
                  <Icon
                    className={`${source}-icon`}
                    img={`icon-icon_mapMarker-poi-source-${source.toLowerCase()}`}
                    color={
                      iconColors[
                        source.toLowerCase() === 'subway'
                          ? 'source-metro'
                          : `source-${source.toLowerCase()}`
                      ]
                    }
                  />
                </div>
                <div className="mode-name">
                  <FormattedMessage
                    id={
                      alternativeNames.includes(source.toLowerCase())
                        ? `settings-alternative-name-${source.toLowerCase()}`
                        : source.toLowerCase()
                    }
                    defaultMessage={source.toLowerCase()}
                  />
                </div>
                <Toggle
                  id={`settings-toggle-${source}`}
                  toggled={sources.filter(o2 => o2 === source).length > 0}
                  onToggle={() => {
                    executeAction(saveRoutingSettings, {
                      sources: togglePOISource(source, config),
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

POISourceSection.propTypes = {
  config: PropTypes.object.isRequired,
};

POISourceSection.contextTypes = {
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default POISourceSection;
