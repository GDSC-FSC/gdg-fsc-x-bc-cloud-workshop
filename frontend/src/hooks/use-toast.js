/**
 * Toast notification system inspired by react-hot-toast library
 * @module toast
 */

import * as React from 'react';
import PropTypes from 'prop-types';

/** Maximum number of toasts that can be shown at once */
const TOAST_LIMIT = 1;

/** Delay in milliseconds before removing a toast from the DOM */
const TOAST_REMOVE_DELAY = 1000000;

/**
 * PropTypes for Toast properties
 */
export const ToastPropTypes = {
  id: PropTypes.string,
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.element,
  variant: PropTypes.oneOf(['default', 'destructive']),
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
};

/**
 * Available action types for toast state management
 * @constant
 */
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
};

let count = 0;

/**
 * Generates a unique numeric ID string
 * @returns {string} Unique ID
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

/** Map to store timeout IDs for toast removal */
const toastTimeouts = new Map();

/**
 * Adds a toast to the removal queue
 * @param {string} toastId - ID of toast to queue for removal
 */
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Reducer function for toast state management
 * @param {Object} state - Current state
 * @param {Object} action - Action to perform
 * @returns {Object} New state
 */
export const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

/** Array of state change listeners */
const listeners = [];

/** In-memory state store */
let memoryState = { toasts: [] };

/**
 * Dispatches an action to update state
 * @param {Object} action - Action to dispatch
 */
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * Creates and displays a new toast notification
 * @param {Object} props - Toast properties
 * @returns {Object} Toast control methods
 */
function toast({ ...props }) {
  const id = genId();

  const update = (props) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * Hook for accessing toast functionality
 * @returns {Object} Toast state and control methods
 */
function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };
