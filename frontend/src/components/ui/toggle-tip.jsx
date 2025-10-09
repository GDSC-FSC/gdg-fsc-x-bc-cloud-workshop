import {
  Popover as ChakraPopover,
  IconButton,
  Portal,
} from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"
import { HiOutlineInformationCircle } from "react-icons/hi"

export const ToggleTip = React.forwardRef(function ToggleTip(props, ref) {
    const {
      showArrow,
      children,
      portalled = true,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props

    return (
      <ChakraPopover.Root
        {...rest}
        positioning={{ ...rest.positioning, gutter: 4 }}
      >
        <ChakraPopover.Trigger asChild>{children}</ChakraPopover.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraPopover.Positioner>
            <ChakraPopover.Content
              width="auto"
              px="2"
              py="1"
              textStyle="xs"
              rounded="sm"
              ref={ref}
              {...contentProps}
            >
              {showArrow && (
                <ChakraPopover.Arrow>
                  <ChakraPopover.ArrowTip />
                </ChakraPopover.Arrow>
              )}
              {content}
            </ChakraPopover.Content>
          </ChakraPopover.Positioner>
        </Portal>
      </ChakraPopover.Root>
    )
  })

ToggleTip.propTypes = {
  showArrow: PropTypes.bool,
  portalled: PropTypes.bool,
  portalRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  content: PropTypes.node,
  contentProps: PropTypes.object,
  children: PropTypes.node,
}

export const InfoTip = React.forwardRef(function InfoTip(props, ref) {
  const { children, buttonProps, ...rest } = props
  return (
    <ToggleTip content={children} {...rest} ref={ref}>
      <IconButton
        variant="ghost"
        aria-label="info"
        size="2xs"
        colorPalette="gray"
        {...buttonProps}
      >
        <HiOutlineInformationCircle />
      </IconButton>
    </ToggleTip>
  )
})

InfoTip.propTypes = {
  children: PropTypes.node,
  buttonProps: PropTypes.object,
}
