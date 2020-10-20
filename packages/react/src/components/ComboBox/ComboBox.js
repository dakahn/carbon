/**
 * Copyright IBM Corp. 2016, 2018, 2020
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import { useCombobox } from 'downshift';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { settings } from 'carbon-components';
import { Checkmark16, WarningFilled16 } from '@carbon/icons-react';
import ListBox, { PropTypes as ListBoxPropTypes } from '../ListBox';
import { match, keys } from '../../internal/keyboard';
import setupGetInstanceId from '../../tools/setupGetInstanceId';
// import { mapDownshiftProps } from '../../tools/createPropAdapter';

const { prefix } = settings;
const getInstanceId = setupGetInstanceId();
const defaultShouldFilterItem = () => true;
const textInput = React.createRef();

const defaultItemToString = (item) => {
  if (typeof item === 'string') {
    return item;
  }

  return item && item.label;
};

const onToggleClick = (isOpen) => (event) => {
  if (onToggleClick) {
    onToggleClick(event);
  }

  if (event.target === textInput.current && isOpen) {
    event.preventDownshiftDefault = true;
    event.persist();
  }
};

const handleSelectionClear = () => {
  if (textInput?.current) {
    textInput.current.focus();
  }
};

const ComboBox = React.forwardRef(
  (
    {
      className: containerClassName,
      disabled,
      id,
      items,
      itemToString,
      itemToElement,
      titleText,
      helperText,
      placeholder,
      initialSelectedItem,
      selectedItem,
      ariaLabel,
      translateWithId,
      invalid,
      invalidText,
      light,
      type, // eslint-disable-line no-unused-vars
      size,
      shouldFilterItem, // eslint-disable-line no-unused-vars
      onChange, // eslint-disable-line no-unused-vars
      onInputChange, // eslint-disable-line no-unused-vars
      onToggleClick, // eslint-disable-line no-unused-vars
      // downshiftProps,
      direction,
    },
    textInput,
    ...rest
  ) => {
    const [inputItems, setInputItems] = useState(items);
    const {
      isOpen,
      getLabelProps,
      getMenuProps,
      getInputProps,
      getComboboxProps,
      highlightedIndex,
      getItemProps,
      inputValue,
      clearSelection,
      toggleMenu,
      getToggleButtonProps,
    } = useCombobox({
      inputId: id,
      items: inputItems,
      initialSelectedItem,
      onInputValueChange: ({ inputValue }) => {
        setInputItems(
          items.filter((item) =>
            itemToString(item)
              .toLowerCase()
              .startsWith(inputValue.toLowerCase())
          )
        );
      },
    });

    // needs to be Capitalized for react to render it correctly
    const ItemToElement = itemToElement;
    const comboBoxInstanceId = getInstanceId();
    const wrapperClasses = cx(`${prefix}--list-box__wrapper`);
    const labelClasses = cx(`${prefix}--label`, {
      [`${prefix}--label--disabled`]: disabled,
    });
    const inputClasses = cx(`${prefix}--text-input`, {
      [`${prefix}--text-input--empty`]: !inputValue,
    });
    const listBoxClasses = cx(`${prefix}--combo-box`, containerClassName, {
      [`${prefix}--list-box--up`]: direction === 'top',
    });
    const helperClasses = cx(`${prefix}--form__helper-text`, {
      [`${prefix}--form__helper-text--disabled`]: disabled,
    });
    const comboBoxHelperId = !helperText
      ? undefined
      : `combobox-helper-text-${comboBoxInstanceId}`;

    const filterItems = (items, itemToString, inputValue) =>
      items.filter((item) =>
        shouldFilterItem({
          item,
          itemToString,
          inputValue,
        })
      );

    const handleOnChange = (selectedItem) => {
      if (onChange) {
        onChange({ selectedItem });
      }
    };

    return (
      <div className={wrapperClasses}>
        {titleText && (
          <label className={labelClasses} {...getLabelProps()}>
            {titleText}
          </label>
        )}
        <ListBox
          {...getComboboxProps()}
          id={id}
          onChange={handleOnChange()}
          className={listBoxClasses}
          disabled={disabled}
          invalid={invalid}
          aria-label={ariaLabel}
          invalidText={invalidText}
          isOpen={isOpen}
          light={light}
          size={size}>
          <ListBox.Field {...getToggleButtonProps()}>
            <input
              disabled={disabled}
              className={inputClasses}
              type="text"
              tabIndex="0"
              aria-autocomplete="list"
              ref={textInput}
              {...rest}
              {...getInputProps({
                disabled,
                placeholder,
                onKeyDown: (event) => {
                  if (match(event, keys.Space)) {
                    event.stopPropagation();
                  }

                  if (match(event, keys.Enter)) {
                    toggleMenu();
                  }
                },
              })}
            />
            {invalid && (
              <WarningFilled16
                className={`${prefix}--list-box__invalid-icon`}
              />
            )}
            {inputValue && (
              <ListBox.Selection
                // clearSelection={clearSelection()}
                translateWithId={translateWithId}
                disabled={disabled}
                onClearSelection={handleSelectionClear}
              />
            )}
            <ListBox.MenuIcon
              isOpen={isOpen}
              translateWithId={translateWithId}
            />
          </ListBox.Field>
          <ListBox.Menu {...getMenuProps()}>
            {isOpen &&
              filterItems(items, itemToString, inputValue).map(
                (item, index) => {
                  const itemProps = getItemProps({ item, index });
                  return (
                    <ListBox.MenuItem
                      key={itemProps.id}
                      isActive={selectedItem === item}
                      tabIndex="-1"
                      isHighlighted={
                        highlightedIndex === index ||
                        (selectedItem && selectedItem.id === item.id) ||
                        false
                      }
                      title={itemToElement ? item.text : itemToString(item)}
                      {...itemProps}>
                      {itemToElement ? (
                        <ItemToElement key={itemProps.id} {...item} />
                      ) : (
                        itemToString(item)
                      )}
                      {selectedItem === item && (
                        <Checkmark16
                          className={`${prefix}--list-box__menu-item__selected-icon`}
                        />
                      )}
                    </ListBox.MenuItem>
                  );
                }
              )}
          </ListBox.Menu>
        </ListBox>
        {helperText && !invalid && (
          <div id={comboBoxHelperId} className={helperClasses}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

ComboBox.propTypes = {
  /**
   * 'aria-label' of the ListBox component.
   */
  ariaLabel: PropTypes.string,

  /**
   * An optional className to add to the container node
   */
  className: PropTypes.string,

  /**
   * Specify the direction of the combobox dropdown. Can be either top or bottom.
   */
  direction: PropTypes.oneOf(['top', 'bottom']),

  /**
   * Specify if the control should be disabled, or not
   */
  disabled: PropTypes.bool,

  /**
   * Additional props passed to Downshift
   */
  // downshiftProps: PropTypes.shape(Downshift.propTypes),

  /**
   * Provide helper text that is used alongside the control label for
   * additional help
   */
  helperText: PropTypes.string,

  /**
   * Specify a custom `id` for the input
   */
  id: PropTypes.string.isRequired,

  /**
   * Allow users to pass in an arbitrary item or a string (in case their items are an array of strings)
   * from their collection that are pre-selected
   */
  initialSelectedItem: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),

  /**
   * Specify if the currently selected value is invalid.
   */
  invalid: PropTypes.bool,

  /**
   * Message which is displayed if the value is invalid.
   */
  invalidText: PropTypes.string,

  /**
   * Optional function to render items as custom components instead of strings.
   * Defaults to null and is overriden by a getter
   */
  itemToElement: PropTypes.func,

  /**
   * Helper function passed to downshift that allows the library to render a
   * given item to a string label. By default, it extracts the `label` field
   * from a given item to serve as the item label in the list
   */
  itemToString: PropTypes.func,

  /**
   * We try to stay as generic as possible here to allow individuals to pass
   * in a collection of whatever kind of data structure they prefer
   */
  items: PropTypes.array.isRequired,

  /**
   * should use "light theme" (white background)?
   */
  light: PropTypes.bool,

  /**
   * `onChange` is a utility for this controlled component to communicate to a
   * consuming component when a specific dropdown item is selected.
   * @param {{ selectedItem }}
   */
  onChange: PropTypes.func.isRequired,

  /**
   * Callback function to notify consumer when the text input changes.
   * This provides support to change available items based on the text.
   * @param {string} inputText
   */
  onInputChange: PropTypes.func,

  /**
   * Callback function that fires when the combobox menu toggle is clicked
   * @param {MouseEvent} event
   */
  onToggleClick: PropTypes.func,

  /**
   * Used to provide a placeholder text node before a user enters any input.
   * This is only present if the control has no items selected
   */
  placeholder: PropTypes.string.isRequired,

  /**
   * For full control of the selection
   */
  selectedItem: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),

  /**
   * Specify your own filtering logic by passing in a `shouldFilterItem`
   * function that takes in the current input and an item and passes back
   * whether or not the item should be filtered.
   */
  shouldFilterItem: PropTypes.func,

  /**
   * Specify the size of the ListBox. Currently supports either `sm`, `lg` or `xl` as an option.
   */
  size: ListBoxPropTypes.ListBoxSize,

  /**
   * Provide text to be used in a `<label>` element that is tied to the
   * combobox via ARIA attributes.
   */
  titleText: PropTypes.string,

  /**
   * Specify a custom translation function that takes in a message identifier
   * and returns the localized string for the message
   */
  translateWithId: PropTypes.func,

  /**
   * Currently supports either the default type, or an inline variant
   */
  type: ListBoxPropTypes.ListBoxType,
};

ComboBox.defaultProps = {
  disabled: false,
  itemToString: defaultItemToString,
  itemToElement: null,
  shouldFilterItem: defaultShouldFilterItem,
  type: 'default',
  ariaLabel: 'Choose an item',
  light: false,
  direction: 'bottom',
};

export default ComboBox;
