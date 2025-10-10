/**
 * @fileoverview Enhanced Chakra UI Field component for form inputs.
 * Provides consistent form field layout with labels, helper text, and error messages.
 * 
 * @module components/ui/field
 * @requires @chakra-ui/react
 */

import { Field as ChakraField } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

/**
 * Form field wrapper component with label, helper text, and error display.
 * Wraps form inputs with consistent styling and accessibility features.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.label] - Field label text
 * @param {React.ReactNode} [props.helperText] - Helper text shown below input
 * @param {React.ReactNode} [props.errorText] - Error message (overrides helper text)
 * @param {React.ReactNode} [props.optionalText] - Text shown for optional fields
 * @param {React.ReactNode} props.children - Form input element (Input, Select, etc.)
 * @param {React.Ref} ref - Forwarded ref to root element
 * @returns {JSX.Element} Wrapped form field with label and helper/error text
 * 
 * @example
 * <Field label="Email" helperText="We'll never share your email" errorText={errors.email}>
 *   <Input type="email" />
 * </Field>
 */
export const Field = React.forwardRef(function Field(props, ref) {
    const { label, children, helperText, errorText, optionalText, ...rest } =
      props
    return (
      <ChakraField.Root ref={ref} {...rest}>
        {label && (
          <ChakraField.Label>
            {label}
            <ChakraField.RequiredIndicator fallback={optionalText} />
          </ChakraField.Label>
        )}
        {children}
        {helperText && (
          <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
        )}
        {errorText && (
          <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>
        )}
      </ChakraField.Root>
    )
  })

Field.propTypes = {
  label: PropTypes.node,
  helperText: PropTypes.node,
  errorText: PropTypes.node,
  optionalText: PropTypes.node,
  children: PropTypes.node,
}
