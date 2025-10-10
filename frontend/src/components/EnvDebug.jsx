/**
 * @fileoverview Environment variables debug component.
 * Displays loaded environment variables for troubleshooting configuration issues.
 * Shows API key status, validation, and troubleshooting steps.
 * 
 * @module components/EnvDebug
 * @requires @chakra-ui/react
 */

import { Box, Text, Code, VStack, HStack } from '@chakra-ui/react';

/**
 * Environment debug component for verifying environment variable configuration.
 * Displays the status of VITE_GOOGLE_MAPS_API_KEY and VITE_API_URL,
 * validates API key presence, and provides troubleshooting guidance.
 * 
 * @component
 * @returns {JSX.Element} Debug panel UI with environment variable status
 * 
 * @example
 * // Typically used temporarily during development
 * <EnvDebug />
 */
export const EnvDebug = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const apiUrl = import.meta.env.VITE_API_URL;
  const isKeyValid = apiKey && apiKey !== 'YOUR_API_KEY';
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mb={4} bg="white" boxShadow="sm">
      <VStack align="stretch" gap={3}>
        <Text fontWeight="bold" fontSize="lg">🔍 Environment Variables Debug</Text>
        
        <Box>
          <Text fontWeight="semibold">VITE_GOOGLE_MAPS_API_KEY:</Text>
          <Code p={2} display="block" whiteSpace="pre-wrap" wordBreak="break-all">
            {apiKey || '❌ NOT SET'}
          </Code>
          {apiKey && (
            <Text fontSize="sm" color="gray.600" mt={1}>
              Length: {apiKey.length} characters
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="semibold">VITE_API_URL:</Text>
          <Code p={2} display="block">
            {apiUrl || '❌ NOT SET'}
          </Code>
        </Box>

        <Box
          p={4}
          borderRadius="lg"
          bg={isKeyValid ? 'green.50' : 'red.50'}
          borderWidth="2px"
          borderColor={isKeyValid ? 'green.300' : 'red.300'}
          color={isKeyValid ? 'green.800' : 'red.800'}
        >
          <HStack gap={2} mb={2}>
            <Text fontSize="xl">
              {isKeyValid ? '✅' : '❌'}
            </Text>
            <Text fontWeight="bold">
              {isKeyValid ? 'API Key Loaded' : 'API Key Missing'}
            </Text>
          </HStack>
          <Text fontSize="sm">
            {isKeyValid 
              ? 'Environment variable is loaded. If maps still fail, check Google Cloud Console.'
              : 'Check your .env file and restart the dev server.'
            }
          </Text>
        </Box>

        <Box fontSize="sm" color="gray.600" mt={2}>
          <Text fontWeight="semibold">Troubleshooting steps:</Text>
          <Text>1. Verify .env file exists in /frontend directory</Text>
          <Text>2. Make sure it contains: VITE_GOOGLE_MAPS_API_KEY=your_actual_key</Text>
          <Text>3. Restart dev server (Ctrl+C then `bun run dev`)</Text>
          <Text>4. Enable Maps JavaScript API in Google Cloud Console</Text>
          <Text>5. Check if billing is enabled (required even for free tier)</Text>
        </Box>
      </VStack>
    </Box>
  );
};
