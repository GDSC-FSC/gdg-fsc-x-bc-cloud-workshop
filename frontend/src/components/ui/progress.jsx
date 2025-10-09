import { Progress as ChakraProgress } from "@chakra-ui/react"
import { InfoTip } from "./toggle-tip"
import * as React from "react"
import PropTypes from "prop-types"

export const ProgressBar = React.forwardRef(function ProgressBar(props, ref) {
  return (
    <ChakraProgress.Track {...props} ref={ref}>
      <ChakraProgress.Range />
    </ChakraProgress.Track>
  )
})

ProgressBar.propTypes = {
  children: PropTypes.node,
}

export const ProgressLabel = React.forwardRef(function ProgressLabel(props, ref) {
  const { children, info, ...rest } = props
  return (
    <ChakraProgress.Label {...rest} ref={ref}>
      {children}
      {info && <InfoTip>{info}</InfoTip>}
    </ChakraProgress.Label>
  )
})

ProgressLabel.propTypes = {
  children: PropTypes.node,
  info: PropTypes.node,
}

export const ProgressRoot = ChakraProgress.Root
export const ProgressValueText = ChakraProgress.ValueText
