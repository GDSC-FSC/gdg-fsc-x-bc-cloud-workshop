/**
 * @fileoverview Badge component wrapping Chakra UI Badge.
 * Used for displaying status indicators, labels, and tags.
 * 
 * @module components/ui/badge
 * @requires @chakra-ui/react
 */

import { Badge as ChakraBadge } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

/**
 * Badge component for status indicators and labels.
 * Wraps Chakra UI Badge with forwarded ref support.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content/text
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.colorScheme] - Color scheme (e.g., 'green', 'red', 'blue')
 * @param {string} [props.variant='solid'] - Badge variant ('solid', 'subtle', 'outline')
 * @param {string} [props.size='md'] - Badge size ('sm', 'md', 'lg')
 * @param {React.Ref} ref - Forwarded ref to badge element
 * @returns {JSX.Element} Styled badge
 * 
 * @example
 * <Badge colorScheme="green" variant="solid">Active</Badge>
 * <Badge colorScheme="red" size="sm">Critical</Badge>
 */
export const Badge = React.forwardRef(function Badge(props, ref) {
  const { children, className, ...rest } = props
  
  return (
    <ChakraBadge 
      ref={ref} 
      className={className}
      {...rest}
    >
      {children}
    </ChakraBadge>
  )
})

Badge.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}
