import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/react"
import * as React from "react"
import PropTypes from "prop-types"

export const Radio = React.forwardRef(function Radio(props, ref) {
    const { children, inputProps, rootRef, ...rest } = props
    return (
      <ChakraRadioGroup.Item ref={rootRef} {...rest}>
        <ChakraRadioGroup.ItemHiddenInput ref={ref} {...inputProps} />
        <ChakraRadioGroup.ItemIndicator />
        {children && (
          <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>
        )}
      </ChakraRadioGroup.Item>
    )
  })

Radio.propTypes = {
  rootRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  inputProps: PropTypes.object,
  children: PropTypes.node,
}

export const RadioGroup = ChakraRadioGroup.Root
