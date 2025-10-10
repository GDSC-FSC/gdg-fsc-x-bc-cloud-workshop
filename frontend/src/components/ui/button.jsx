/**
 * @fileoverview Enhanced Chakra UI Button component with loading states.
 * Extends Chakra Button with loading spinner support and text display.
 * 
 * @module components/ui/button
 * @requires @chakra-ui/react
 */

import {
  AbsoluteCenter,
  Button as ChakraButton,
  Span,
  Spinner,
} from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

/**
 * Enhanced button component with loading state support.
 * Displays a spinner overlay during loading state, maintaining button dimensions.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.loading=false] - Loading state (shows spinner)
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.loadingText] - Text to display alongside spinner when loading
 * @param {React.ReactNode} props.children - Button content
 * @param {React.Ref} ref - Forwarded ref to button element
 * @returns {JSX.Element} Button with optional loading spinner
 * 
 * @example
 * <Button loading={isLoading} loadingText="Saving...">
 *   Save Changes
 * </Button>
 */
export const Button = React.forwardRef(function Button(props, ref) {
    const { loading, disabled, loadingText, children, ...rest } = props
    return (
      <ChakraButton disabled={loading || disabled} ref={ref} {...rest}>
        {loading && !loadingText ? (
          <>
            <AbsoluteCenter display="inline-flex">
              <Spinner size="inherit" color="inherit" />
            </AbsoluteCenter>
            <Span opacity={0}>{children}</Span>
          </>
        ) : loading && loadingText ? (
          <>
            <Spinner size="inherit" color="inherit" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </ChakraButton>
    )
  })

Button.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  loadingText: PropTypes.node,
  children: PropTypes.node,
}
