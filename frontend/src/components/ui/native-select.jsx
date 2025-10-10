/**
 * @fileoverview Simple native HTML select component with Chakra UI styling.
 * Provides a reliable dropdown select that works consistently across all browsers.
 * 
 * @module components/ui/native-select
 * @requires react
 * @requires prop-types
 */

import * as React from "react";
import PropTypes from "prop-types";

/**
 * Native HTML select component with consistent Chakra UI styling.
 * Uses standard HTML select element for maximum compatibility.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.value] - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.disabled] - Disabled state
 * @param {React.ReactNode} props.children - Option elements
 * @param {string} [props.placeholder] - Placeholder text for empty option
 * @param {React.Ref} ref - Forwarded ref to select element
 * @returns {JSX.Element} Styled native select element
 * 
 * @example
 * <NativeSelect value={value} onChange={handleChange}>
 *   <option value="">Select an option</option>
 *   <option value="1">Option 1</option>
 * </NativeSelect>
 */
export const NativeSelect = React.forwardRef(function NativeSelect(props, ref) {
  const { value, onChange, disabled, children, placeholder, ...rest } = props;

  const baseStyles = {
    width: '100%',
    padding: '0.5rem 2rem 0.5rem 0.75rem',
    fontSize: '1rem',
    lineHeight: '1.5',
    color: disabled ? '#a0aec0' : '#1a202c',
    backgroundColor: disabled ? '#f7fafc' : '#fff',
    borderRadius: '0.375rem',
    transition: 'all 0.15s ease-in-out',
    cursor: disabled ? 'not-allowed' : 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.5em 1.5em',
    outline: 'none',
  };

  const [isFocused, setIsFocused] = React.useState(false);

  const combinedStyles = {
    ...baseStyles,
    // Use complete border specification to avoid mixing shorthand with individual properties
    border: isFocused ? '1px solid #3182ce' : '1px solid #e2e8f0',
    boxShadow: isFocused ? '0 0 0 1px #3182ce' : 'none',
  };

  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={combinedStyles}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
});

NativeSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  placeholder: PropTypes.string,
};

NativeSelect.defaultProps = {
  disabled: false,
};
