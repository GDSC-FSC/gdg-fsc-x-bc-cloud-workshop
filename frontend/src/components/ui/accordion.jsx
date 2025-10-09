import { Accordion, HStack } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"
import { LuChevronDown } from "react-icons/lu"

export const AccordionItemTrigger = React.forwardRef(function AccordionItemTrigger(props, ref) {
  const { children, indicatorPlacement = "end", ...rest } = props
  return (
    <Accordion.ItemTrigger {...rest} ref={ref}>
      {indicatorPlacement === "start" && (
        <Accordion.ItemIndicator rotate={{ base: "-90deg", _open: "0deg" }}>
          <LuChevronDown />
        </Accordion.ItemIndicator>
      )}
      <HStack gap="4" flex="1" textAlign="start" width="full">
        {children}
      </HStack>
      {indicatorPlacement === "end" && (
        <Accordion.ItemIndicator>
          <LuChevronDown />
        </Accordion.ItemIndicator>
      )}
    </Accordion.ItemTrigger>
  )
})

AccordionItemTrigger.propTypes = {
  children: PropTypes.node,
  indicatorPlacement: PropTypes.oneOf(["start", "end"]),
}

export const AccordionItemContent = React.forwardRef(function AccordionItemContent(props, ref) {
  return (
    <Accordion.ItemContent>
      <Accordion.ItemBody {...props} ref={ref} />
    </Accordion.ItemContent>
  )
})

AccordionItemContent.propTypes = {
  children: PropTypes.node,
}

export const AccordionRoot = Accordion.Root
export const AccordionItem = Accordion.Item
