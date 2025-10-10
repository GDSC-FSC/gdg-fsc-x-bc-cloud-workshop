/**
 * @fileoverview Card components wrapping Chakra UI Card primitives.
 * Provides styled card containers with consistent design patterns.
 * 
 * @module components/ui/card
 * @requires @chakra-ui/react
 */

import { Card as ChakraCard, Box } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

/**
 * Card root component for creating styled containers.
 * Wraps Chakra UI Card.Root with forwarded ref support.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref to root element
 * @returns {JSX.Element} Card container
 * 
 * @example
 * <Card size="sm" variant="outline">
 *   <CardContent>Card content here</CardContent>
 * </Card>
 */
export const Card = React.forwardRef(function Card(props, ref) {
  const { children, className, ...rest } = props
  
  return (
    <ChakraCard.Root 
      ref={ref} 
      className={className}
      {...rest}
    >
      {children}
    </ChakraCard.Root>
  )
})

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

/**
 * Card content/body component for card inner content.
 * Wraps Chakra UI Card.Body with consistent padding and styling.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display in card body
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref to body element
 * @returns {JSX.Element} Card body container
 * 
 * @example
 * <CardContent p={5}>
 *   <Text>Card body content</Text>
 * </CardContent>
 */
export const CardContent = React.forwardRef(function CardContent(props, ref) {
  const { children, className, ...rest } = props
  
  return (
    <ChakraCard.Body 
      ref={ref} 
      className={className}
      {...rest}
    >
      {children}
    </ChakraCard.Body>
  )
})

CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}
