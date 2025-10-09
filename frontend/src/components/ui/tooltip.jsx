import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

export const Tooltip = React.forwardRef(function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props

    if (disabled) return children

    return (
      <ChakraTooltip.Root {...rest}>
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content ref={ref} {...contentProps}>
              {showArrow && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip />
                </ChakraTooltip.Arrow>
              )}
              {content}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    )
  })

Tooltip.propTypes = {
  showArrow: PropTypes.bool,
  portalled: PropTypes.bool,
  portalRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  content: PropTypes.node.isRequired,
  contentProps: PropTypes.object,
  disabled: PropTypes.bool,
  children: PropTypes.node,
}
