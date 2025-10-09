import { Skeleton as ChakraSkeleton } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

export const Skeleton = React.forwardRef(function Skeleton(props, ref) {
  const { children, className, ...rest } = props
  
  return (
    <ChakraSkeleton 
      ref={ref} 
      className={className}
      {...rest}
    >
      {children}
    </ChakraSkeleton>
  )
})

Skeleton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}
