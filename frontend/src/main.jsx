/**
 * @fileoverview Main entry point for the NYC Restaurants Inspector application.
 * Initializes React with StrictMode and Chakra UI provider.
 * 
 * @module main
 * @requires react
 * @requires react-dom/client
 * @requires @chakra-ui/react
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

import './tailwind.css'
import App from './App.jsx'

/**
 * Renders the root React application with providers.
 * Uses React 18's createRoot API for concurrent features.
 * Wraps the app with StrictMode for development warnings and Chakra UI provider for styling.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </StrictMode>,
)
