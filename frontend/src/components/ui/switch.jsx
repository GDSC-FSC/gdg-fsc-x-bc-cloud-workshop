import { Switch as ChakraSwitch } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

export const Switch = React.forwardRef(function Switch(props, ref) {
    const { inputProps, children, rootRef, trackLabel, thumbLabel, ...rest } =
      props

    return (
      <ChakraSwitch.Root ref={rootRef} {...rest}>
        <ChakraSwitch.HiddenInput ref={ref} {...inputProps} />
        <ChakraSwitch.Control>
          <ChakraSwitch.Thumb>
            {thumbLabel && (
              <ChakraSwitch.ThumbIndicator fallback={thumbLabel?.off}>
                {thumbLabel?.on}
              </ChakraSwitch.ThumbIndicator>
            )}
          </ChakraSwitch.Thumb>
          {trackLabel && (
            <ChakraSwitch.Indicator fallback={trackLabel.off}>
              {trackLabel.on}
            </ChakraSwitch.Indicator>
          )}
        </ChakraSwitch.Control>
        {children != null && (
          <ChakraSwitch.Label>{children}</ChakraSwitch.Label>
        )}
      </ChakraSwitch.Root>
    )
  })

Switch.propTypes = {
  inputProps: PropTypes.object,
  rootRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  trackLabel: PropTypes.shape({
    on: PropTypes.node,
    off: PropTypes.node,
  }),
  thumbLabel: PropTypes.shape({
    on: PropTypes.node,
    off: PropTypes.node,
  }),
  children: PropTypes.node,
}
