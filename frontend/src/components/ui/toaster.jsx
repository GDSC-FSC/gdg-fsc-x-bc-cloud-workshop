/**
 * Toast/Toaster component for notifications
 */

import { Toaster as ChakraToaster, createToaster } from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
});

export const Toaster = () => {
  return <ChakraToaster toaster={toaster} />;
};
