import { Badge as ChakraBadge } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

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
