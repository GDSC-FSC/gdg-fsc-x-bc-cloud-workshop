/**
 * @fileoverview Drawer/side panel components wrapping Chakra UI Drawer.
 * Provides slide-out panel interfaces for modals, detail views, and navigation.
 * 
 * @module components/ui/drawer
 * @requires @chakra-ui/react
 */

import { Drawer as ChakraDrawer, Portal } from "@chakra-ui/react"
import { CloseButton } from "./close-button"
import * as React from "react"
import PropTypes from "prop-types"

/**
 * Drawer content container with portal and positioning support.
 * Wraps the main content of a drawer panel.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Drawer content
 * @param {boolean} [props.portalled=true] - Whether to render in a portal
 * @param {React.RefObject} [props.portalRef] - Portal container ref
 * @param {string|number|Object} [props.offset] - Padding offset for positioning
 * @param {React.Ref} ref - Forwarded ref to content element
 * @returns {JSX.Element} Drawer content container
 */
export const DrawerContent = React.forwardRef(function DrawerContent(props, ref) {
  const { children, portalled = true, portalRef, offset, ...rest } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraDrawer.Positioner padding={offset}>
        <ChakraDrawer.Content ref={ref} {...rest} asChild={false}>
          {children}
        </ChakraDrawer.Content>
      </ChakraDrawer.Positioner>
    </Portal>
  )
})

DrawerContent.propTypes = {
  children: PropTypes.node,
  portalled: PropTypes.bool,
  portalRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  offset: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
}

/**
 * Drawer close button trigger with absolute positioning.
 * Displays an X button in the top-right corner of the drawer.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.Ref} ref - Forwarded ref to button element
 * @returns {JSX.Element} Close button
 */
export const DrawerCloseTrigger = React.forwardRef(function DrawerCloseTrigger(props, ref) {
  return (
    <ChakraDrawer.CloseTrigger
      position="absolute"
      top="2"
      insetEnd="2"
      {...props}
      asChild
    >
      <CloseButton size="sm" ref={ref} />
    </ChakraDrawer.CloseTrigger>
  )
})

DrawerCloseTrigger.propTypes = {
  children: PropTypes.node,
}

/**
 * Drawer trigger button component.
 * Opens the drawer when clicked.
 * @type {React.Component}
 */
export const DrawerTrigger = ChakraDrawer.Trigger

/**
 * Drawer root container component.
 * Manages drawer state and positioning.
 * @type {React.Component}
 */
export const DrawerRoot = ChakraDrawer.Root

/**
 * Drawer footer component.
 * Typically contains action buttons.
 * @type {React.Component}
 */
export const DrawerFooter = ChakraDrawer.Footer

/**
 * Drawer header component.
 * Contains title and close button.
 * @type {React.Component}
 */
export const DrawerHeader = ChakraDrawer.Header

/**
 * Drawer body/content component.
 * Contains main drawer content with scrolling.
 * @type {React.Component}
 */
export const DrawerBody = ChakraDrawer.Body

/**
 * Drawer backdrop/overlay component.
 * Semi-transparent overlay behind drawer.
 * @type {React.Component}
 */
export const DrawerBackdrop = ChakraDrawer.Backdrop

/**
 * Drawer description component.
 * Provides accessible description text.
 * @type {React.Component}
 */
export const DrawerDescription = ChakraDrawer.Description

/**
 * Drawer title component.
 * Main heading text for drawer.
 * @type {React.Component}
 */
export const DrawerTitle = ChakraDrawer.Title

/**
 * Drawer action trigger component.
 * Buttons that trigger drawer actions.
 * @type {React.Component}
 */
export const DrawerActionTrigger = ChakraDrawer.ActionTrigger
