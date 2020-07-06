import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { isKeyboardSelectionEvent } from '../util/browser';

const getDescription = (mode, distance, duration) => {
  if (mode === 'BICYCLE_WALK') {
    return (
      <FormattedMessage
        id="cyclewalk-distance-duration"
        values={{ distance, duration }}
        defaultMessage="Walk your bike {distance} ({duration})"
      />
    );
  }

  if (mode === 'BICYCLE') {
    return (
      <FormattedMessage
        id="cycle-distance-duration"
        values={{ distance, duration }}
        defaultMessage="Cycle {distance} ({duration})"
      />
    );
  }

  return (
    <FormattedMessage
      id="walk-distance-duration"
      values={{ distance, duration }}
      defaultMessage="Walk {distance} ({duration})"
    />
  );
};

function ViaLeg(props, context) {
  const distance = displayDistance(
    parseInt(props.leg.distance, 10),
    context.config,
  );
  const [address, place] = props.leg.from.name.split(/, (.+)/);
  const duration = durationToString(props.leg.duration * 1000);
  const stayDuration = props.leg.startTime - props.arrivalTime;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={props.index} className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.via-leg"
          defaultMessage="{arrivalTime} saavu välipisteeseen {viaPoint}. {leaveAction}"
          values={{
            arrivalTime: moment(props.arrivalTime).format('HH:mm'),
            viaPoint: <>{props.leg.from.name}</>,
            leaveAction: (
              <FormattedMessage
                id={
                  props.leg.mode === 'BICYCLE'
                    ? 'itinerary-details.biking-leg'
                    : 'itinerary-details.walk-leg'
                }
                values={{
                  time: moment(props.leg.startTime).format('HH:mm'),
                  distance,
                  origin: props.leg.from ? props.leg.from.name : '',
                  destination: props.leg.to ? props.leg.to.name : '',
                  duration,
                }}
              />
            ),
          }}
        />
      </span>
      <div
        className="small-2 columns itinerary-time-column via-time-column"
        aria-hidden="true"
      >
        <div className="itinerary-time-column-time via-arrival-time">
          {moment(props.arrivalTime).format('HH:mm')}
        </div>
        <div className="itinerary-time-column-time via-divider">
          <div className="via-divider-line" />
        </div>
        <div className="itinerary-time-column-time via-departure-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
      </div>
      <ItineraryCircleLineWithIcon
        isVia
        index={props.index}
        modeClassName={props.leg.mode.toLowerCase()}
      />
      <div className="small-9 columns itinerary-instruction-column via">
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: props.leg.from.name || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row via" aria-hidden="true">
          <div>
            <div className="address-container">
              <div className="address">{address}</div>
              <div className="place">{place}</div>
            </div>
            {stayDuration > 0 && (
              <div className="itinerary-via-leg-duration">
                <FormattedMessage
                  id="via-leg-stop-duration"
                  values={{ stayDuration: durationToString(stayDuration) }}
                  defaultMessage="At via point {stayDuration}"
                />
              </div>
            )}
            {props.children}
          </div>
          <div
            className="itinerary-map-action"
            onClick={props.focusAction}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) && props.focusAction(e)
            }
            role="button"
            tabIndex="0"
          >
            <Icon
              img="icon-icon_show-on-map"
              className="itinerary-search-icon"
            />
          </div>
        </div>
        <div className="itinerary-leg-action" aria-hidden="true">
          <div className="itinerary-leg-action-content">
            {getDescription(props.leg.mode, distance, duration)}
            <div
              className="itinerary-map-action"
              onClick={props.setMapZoomToLeg}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) && props.setMapZoomToLeg(e)
              }
              role="button"
              tabIndex="0"
            >
              <Icon
                img="icon-icon_show-on-map"
                className="itinerary-search-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const exampleLeg = t1 => ({
  duration: 438,
  arrivalTime: t1,
  startTime: t1 + 900000,
  distance: 483.846,
  mode: 'WALK',
  from: { name: 'Messukeskus', stop: { code: '0613' } },
});

ViaLeg.description = () => {
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>
        Displays an itinerary via leg. Note that the times are supposed to go on
        top of the previous leg.
      </p>
      <ComponentUsageExample>
        <ViaLeg
          arrivalTime={today}
          leg={exampleLeg(today)}
          index={1}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
    </div>
  );
};

ViaLeg.propTypes = {
  arrivalTime: PropTypes.number.isRequired,
  leg: PropTypes.shape({
    duration: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    distance: PropTypes.number.isRequired,
    mode: PropTypes.string.isRequired,
    from: PropTypes.shape({
      name: PropTypes.string.isRequired,
      stop: PropTypes.shape({
        code: PropTypes.string,
      }),
    }).isRequired,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  }).isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  setMapZoomToLeg: PropTypes.func.isRequired,
  children: PropTypes.node,
};

ViaLeg.contextTypes = { config: PropTypes.object.isRequired };

export default ViaLeg;
