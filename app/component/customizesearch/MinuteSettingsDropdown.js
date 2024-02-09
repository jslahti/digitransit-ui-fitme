/* eslint-disable jsx-a11y/click-events-have-key-events, no-sequences */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Icon from '../Icon';
/*
const roundToOneDecimal = number => {
  const rounded = Math.round(number * 10) / 10;
  return rounded.toFixed(1).replace('.', ',');
};
*/
/**
 * Builds an array of options: least, less, default, more, most with preset
 * multipliers or given values for each option. Note: a higher value (relative to
 * the given value) means less/worse.
 *
 * @param {*} options The options to select from.
 */
export const getFiveWaitOptions = options => [
  {
    title: 'option-least',
    value: options.least || options[0],
    minuteValue: `${options[0]} minutes`,
  },
  {
    title: 'option-less',
    value: options.less || options[1],
    minuteValue: `${options[1]} minutes`,
  },
  {
    title: 'option-default',
    value: options[2],
    minuteValue: `${options[2]} minutes`,
  },
  {
    title: 'option-more',
    value: options.more || options[3],
    minuteValue: `${options[3]} minutes`,
  },
  {
    title: 'option-most',
    value: options.most || options[4],
    minuteValue: `${options[4]} minutes`,
  },
];

export const getFiveWaitOptionsNumerical = options => {
  const numericalOptions = [];
  options.forEach(item => {
    numericalOptions.push({
      title: `${item} minutes`,
      value: item,
    });
  });
  return numericalOptions;
};

/**
 * Represents the types of acceptable values.
 */
export const valueMinutesShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

class MinuteSettingsDropdown extends React.Component {
  static propTypes = {
    labelText: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    displayValueFormatter: PropTypes.func,
    currentSelection: PropTypes.object.isRequired,
    highlightDefaultValue: PropTypes.bool,
    defaultValue: valueMinutesShape,
    displayPattern: PropTypes.string,
    onOptionSelected: PropTypes.func.isRequired,
    formatOptions: PropTypes.bool,
    name: PropTypes.string.isRequired,
    translateLabels: PropTypes.bool,
    overrideStyle: PropTypes.object,
  };

  static defaultProps = {
    displayValueFormatter: undefined,
    highlightDefaultValue: false,
    displayPattern: undefined,
    defaultValue: undefined,
    formatOptions: false,
    translateLabels: true,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { showDropdown: false };
    this.labelRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.state.showDropdown) {
      this.labelRef.current.scrollIntoView({ block: 'nearest' });
    }
  }

  toggleDropdown = prevState => {
    this.setState({
      showDropdown: !prevState,
    });
  };

  handleDropdownClick = prevState => {
    this.toggleDropdown(prevState);
  };

  handleChangeOnly = value => {
    this.props.onOptionSelected(value);
  };

  getOptionTags = (dropdownOptions, prevState) => {
    return dropdownOptions.map(option => (
      <li key={option.displayName + option.value}>
        <label
          className={`settings-dropdown-choice ${
            option.value === this.props.currentSelection.value ? 'selected' : ''
          }`}
          htmlFor={`dropdown-${this.props.name}-${option.value}`}
        >
          <span>
            {option.displayNameObject
              ? option.displayNameObject
              : option.displayName}
          </span>
          <span className="right-side">
            <span className="kmh-value">{option.minuteValue}</span>
            <span className="checkmark">
              &nbsp;
              {option.value === this.props.currentSelection.value && (
                <Icon
                  className="selected-checkmark"
                  img="icon-icon_check"
                  viewBox="0 0 15 11"
                />
              )}
            </span>
            <input
              id={`dropdown-${this.props.name}-${option.value}`}
              type="radio"
              name={this.props.name}
              checked={option.value === this.props.currentSelection.value}
              value={option.value}
              onChange={e => {
                this.handleChangeOnly(option.value);
                // try to detect if event is from an actual click or keyboard navigation
                if (e.nativeEvent.clientX || e.nativeEvent.clientY) {
                  this.handleDropdownClick(prevState);
                }
              }}
            />
          </span>
        </label>
      </li>
    ));
  };

  render() {
    const {
      labelText,
      currentSelection,
      options,
      displayValueFormatter,
      highlightDefaultValue,
      defaultValue,
      formatOptions,
      translateLabels,
      overrideStyle,
    } = this.props;
    const { intl } = this.context;
    const { showDropdown } = this.state || {};

    function applyDefaultValueIdentifier(value, str) {
      return highlightDefaultValue && value === defaultValue
        ? `${intl.formatMessage({
            id: 'option-default',
          })} (${str})`
        : str;
    }

    function getFormattedValue(value) {
      return displayValueFormatter ? displayValueFormatter(value) : value;
    }
    const selectOptions = formatOptions
      ? options.map(o =>
          o.title && o.value
            ? {
                displayName: `${o.title}_${o.value}`,
                displayNameObject: applyDefaultValueIdentifier(
                  o.value,
                  translateLabels
                    ? this.context.intl.formatMessage(
                        { id: o.title },
                        {
                          title: o.title,
                        },
                      )
                    : o.title,
                ),
                value: o.value,
                minuteValue: o.minuteValue || undefined,
              }
            : {
                displayName: `${this.props.displayPattern}_${o}`,
                displayNameObject: applyDefaultValueIdentifier(
                  o,
                  // eslint-disable-next-line no-nested-ternary
                  this.props.displayPattern
                    ? translateLabels
                      ? this.context.intl.formatMessage(
                          { id: this.props.displayPattern },
                          {
                            number: getFormattedValue(o),
                          },
                        )
                      : ({ id: this.props.displayPattern },
                        { number: getFormattedValue(o) })
                    : getFormattedValue(o),
                ),
                value: o,
                minuteValue: o.minuteValue || undefined,
              },
        )
      : options;

    return (
      <div
        className="settings-dropdown-wrapper walk-option-inner"
        ref={this.labelRef}
      >
        <button
          type="button"
          className="settings-dropdown-label"
          style={overrideStyle}
          onClick={() => this.toggleDropdown(this.state.showDropdown)}
        >
          <p className="settings-dropdown-label-text">{labelText}</p>
          <span className="settings-dropdown-text-container">
            <p className="settings-dropdown-label-value">
              {/* eslint-disable-next-line no-nested-ternary */}
              {displayValueFormatter
                ? displayValueFormatter(currentSelection.title)
                : translateLabels
                ? `${intl.formatMessage({
                    id: currentSelection.title,
                  })}`
                : currentSelection.title}
            </p>
            <span className="sr-only">
              {intl.formatMessage({
                id: showDropdown
                  ? 'settings-dropdown-close-label'
                  : 'settings-dropdown-open-label',
              })}
            </span>
            <Icon
              className={
                this.state.showDropdown
                  ? 'fake-select-arrow inverted'
                  : 'fake-select-arrow'
              }
              img="icon-icon_arrow-dropdown"
            />
          </span>
        </button>
        {showDropdown && (
          <ul role="radiogroup" className="settings-dropdown">
            {this.getOptionTags(selectOptions, this.state.showDropdown)}
          </ul>
        )}
      </div>
    );
  }
}

export default MinuteSettingsDropdown;
