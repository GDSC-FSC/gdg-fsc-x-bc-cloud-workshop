"use client"

import { AbsoluteCenter, Menu as ChakraMenu, Portal } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"
import { LuCheck, LuChevronRight } from "react-icons/lu"

export const MenuContent = React.forwardRef(function MenuContent(props, ref) {
    const { portalled = true, portalRef, ...rest } = props
    return (
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content ref={ref} {...rest} />
        </ChakraMenu.Positioner>
      </Portal>
    )
  })

MenuContent.propTypes = {
  portalled: PropTypes.bool,
  portalRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  children: PropTypes.node,
}

export const MenuArrow = React.forwardRef(function MenuArrow(props, ref) {
  return (
    <ChakraMenu.Arrow ref={ref} {...props}>
      <ChakraMenu.ArrowTip />
    </ChakraMenu.Arrow>
  )
})

MenuArrow.propTypes = {
  children: PropTypes.node,
}

export const MenuCheckboxItem = React.forwardRef(function MenuCheckboxItem(props, ref) {
  return (
    <ChakraMenu.CheckboxItem ps="8" ref={ref} {...props}>
      <AbsoluteCenter axis="horizontal" insetStart="4" asChild>
        <ChakraMenu.ItemIndicator>
          <LuCheck />
        </ChakraMenu.ItemIndicator>
      </AbsoluteCenter>
      {props.children}
    </ChakraMenu.CheckboxItem>
  )
})

MenuCheckboxItem.propTypes = {
  children: PropTypes.node,
}

export const MenuRadioItem = React.forwardRef(function MenuRadioItem(props, ref) {
  const { children, ...rest } = props
  return (
    <ChakraMenu.RadioItem ps="8" ref={ref} {...rest}>
      <AbsoluteCenter axis="horizontal" insetStart="4" asChild>
        <ChakraMenu.ItemIndicator>
          <LuCheck />
        </ChakraMenu.ItemIndicator>
      </AbsoluteCenter>
      <ChakraMenu.ItemText>{children}</ChakraMenu.ItemText>
    </ChakraMenu.RadioItem>
  )
})

MenuRadioItem.propTypes = {
  children: PropTypes.node,
}

export const MenuItemGroup = React.forwardRef(function MenuItemGroup(props, ref) {
  const { title, children, ...rest } = props
  return (
    <ChakraMenu.ItemGroup ref={ref} {...rest}>
      {title && (
        <ChakraMenu.ItemGroupLabel userSelect="none">
          {title}
        </ChakraMenu.ItemGroupLabel>
      )}
      {children}
    </ChakraMenu.ItemGroup>
  )
})

MenuItemGroup.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
}

export const MenuTriggerItem = React.forwardRef(function MenuTriggerItem(props, ref) {
  const { startIcon, children, ...rest } = props
  return (
    <ChakraMenu.TriggerItem ref={ref} {...rest}>
      {startIcon}
      {children}
      <LuChevronRight />
    </ChakraMenu.TriggerItem>
  )
})

MenuTriggerItem.propTypes = {
  startIcon: PropTypes.node,
  children: PropTypes.node,
}

export const MenuRadioItemGroup = ChakraMenu.RadioItemGroup
export const MenuContextTrigger = ChakraMenu.ContextTrigger
export const MenuRoot = ChakraMenu.Root
export const MenuSeparator = ChakraMenu.Separator

export const MenuItem = ChakraMenu.Item
export const MenuItemText = ChakraMenu.ItemText
export const MenuItemCommand = ChakraMenu.ItemCommand
export const MenuTrigger = ChakraMenu.Trigger
