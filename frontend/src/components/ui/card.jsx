import { Card as ChakraCard } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

export const Card = React.forwardRef(function Card(props, ref) {
  const { children, className, ...rest } = props
  
  return (
    <ChakraCard 
      ref={ref} 
      className={className}
      {...rest}
    >
      {children}
    </ChakraCard>
  )
})

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

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
