import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types'; // Assuming prop-types is installed

// Helper function to check if an element is contained within another
function isElementContainedWithin(targetElement, containerElement) {
  let current = targetElement;
  while (current) {
    if (current === containerElement) {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

// A custom shallow comparison utility
function arePropsStatesDifferent(currentProps, prevProps, currentState, prevState) {
  for (const key in currentProps) {
    if (currentProps[key] !== prevProps[key]) return true;
  }
  for (const key in prevProps) {
    if (!(key in currentProps)) return true;
  }
  for (const key in currentState) {
    if (currentState[key] !== prevState[key]) return true;
  }
  for (const key in prevState) {
    if (!(key in currentState)) return true;
  }
  return false;
}

// The external boundary overlay component, managing its own DOM root
class BoundaryOverlay extends Component {
  // Initial state for the overlay's activity
  state = {
    isCurrentlyActive: false,
  };

  // Reference to the DOM element that will host the portal content
  hostElement = null;
  // Reference to the React root for the portal content
  reactPortalRoot = null;

  // Lifecycle method: Component mounted into the DOM
  componentDidMount() {
    console.log('BoundaryOverlay: Component mounted. Setting up global listeners.');

    // Add event listener for escape key to close the overlay
    if (this.props.dismissOnEscape) {
      document.addEventListener('keydown', this.handleEscapeKey);
    }
    // Add event listener for clicks outside the overlay to close it
    if (this.props.dismissOnClickOutside) {
      document.addEventListener('mousedown', this.handleExternalClick);
    }

    // If the overlay should be open initially, activate it
    if (this.props.isInitiallyOpen) {
      this.activateOverlay();
    }
  }

  // Lifecycle method: Component updated (props or state changed)
  componentDidUpdate(prevProps, prevState) {
    const isCurrentlyOpenPropDefined = typeof this.props.isInitiallyOpen === 'boolean';
    const wasOpenPropDefined = typeof prevProps.isInitiallyOpen === 'boolean';

    // Scenario 1: Overlay state is controlled by `isInitiallyOpen` prop
    if (isCurrentlyOpenPropDefined) {
      // Prop changed from false to true: Open the overlay
      if (this.props.isInitiallyOpen && !prevProps.isInitiallyOpen) {
        this.activateOverlay();
      }
      // Prop changed from true to false: Close the overlay
      else if (!this.props.isInitiallyOpen && prevProps.isInitiallyOpen) {
        this.deactivateOverlay();
      }
      // If prop is true and children/relevant props for content changed, re-render content
      else if (this.props.isInitiallyOpen && prevProps.isInitiallyOpen &&
               (prevProps.children !== this.props.children ||
                prevProps.dismissOverlay !== this.props.dismissOverlay)) {
        this.updateOverlayContent(this.props);
      }
    }
    // Scenario 2: Overlay state is NOT controlled by `isInitiallyOpen` prop
    // (It's typically controlled by internal state, e.g., a click trigger)
    else {
      // Internal state just became active: Set up and render content
      if (this.state.isCurrentlyActive && !prevState.isCurrentlyActive) {
        this.setupAndRenderOverlayContent(this.props);
      }
      // Internal state just became inactive: Clear content
      else if (!this.state.isCurrentlyActive && prevState.isCurrentlyActive) {
        this.clearOverlayContent();
      }
      // If active and children/relevant props for content changed, re-render content
      else if (this.state.isCurrentlyActive && prevState.isCurrentlyActive &&
               (prevProps.children !== this.props.children ||
                prevProps.dismissOverlay !== this.props.dismissOverlay)) {
        this.updateOverlayContent(this.props);
      }
    }
  }

  // Lifecycle method: Component is about to be removed from the DOM
  componentWillUnmount() {
    console.log('BoundaryOverlay: Component unmounting. Removing global listeners.');
    // Clean up event listeners to prevent memory leaks
    if (this.props.dismissOnEscape) {
      document.removeEventListener('keydown', this.handleEscapeKey);
    }
    if (this.props.dismissOnClickOutside) {
      document.removeEventListener('mousedown', this.handleExternalClick);
    }
    // Ensure the external portal content is also unmounted and removed
    this.deactivateOverlay();
  }

  // Optimize re-renders by performing a shallow comparison
  shouldComponentUpdate(nextProps, nextState) {
    return arePropsStatesDifferent(this.props, nextProps, this.state, nextState);
  }

  // Method to create the host DOM element and render the portal content
  setupAndRenderOverlayContent = (props) => {
    // Guard clause: If already setup, just update
    if (this.hostElement && this.reactPortalRoot) {
      this.updateOverlayContent(props);
      return;
    }

    // Create a new div element for the portal content
    this.hostElement = document.createElement('div');
    // Add a data attribute for easier identification and styling
    this.hostElement.setAttribute('data-boundary-overlay-root', 'true');
    // Append the host element to the document body
    document.body.appendChild(this.hostElement);
    // Create a new React root for the portal content
    this.reactPortalRoot = createRoot(this.hostElement);

    // Render the children into the new React root, passing the dismiss function
    const contentToRender = React.cloneElement(props.children, {
      dismissOverlay: this.deactivateOverlay,
    });
    this.reactPortalRoot.render(contentToRender);
  };

  // Method to update the content of an already-rendered portal
  updateOverlayContent = (props) => {
    if (this.reactPortalRoot && this.hostElement) {
      const contentToRender = React.cloneElement(props.children, {
        dismissOverlay: this.deactivateOverlay,
      });
      this.reactPortalRoot.render(contentToRender);
    }
  };

  // Method to unmount and remove the portal content from the DOM
  clearOverlayContent = () => {
    if (this.reactPortalRoot) {
      this.reactPortalRoot.unmount(); // Unmount the React component tree
      if (this.hostElement && this.hostElement.parentNode) {
        this.hostElement.parentNode.removeChild(this.hostElement); // Remove the DOM element
      }
      this.hostElement = null; // Clear references
      this.reactPortalRoot = null;
    }
  };

  // Handler to activate the overlay, typically called by a trigger component
  activateOverlay = (evt) => {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    // Guard: If the overlay is already active, do nothing
    if (this.state.isCurrentlyActive) {
      console.warn('BoundaryOverlay: Attempted to activate an already active overlay. Skipping.');
      return;
    }
    this.setState({ isCurrentlyActive: true });
  };

  // Handler to deactivate the overlay
  deactivateOverlay = () => {
    // Guard: If the overlay is already inactive, do nothing
    if (!this.state.isCurrentlyActive) {
      console.warn('BoundaryOverlay: Attempted to deactivate an already inactive overlay. Skipping.');
      return;
    }
    this.setState({ isCurrentlyActive: false });
  };

  // Handler for clicks outside the overlay content
  handleExternalClick = (evt) => {
    // Only proceed if the overlay is active and its host element exists
    if (!this.state.isCurrentlyActive || !this.hostElement) {
      return;
    }

    // If the click happened inside the overlay's content, do not close
    if (isElementContainedWithin(evt.target, this.hostElement)) {
      return;
    }

    // Stop event propagation to prevent other listeners from reacting to this click
    evt.stopPropagation();
    this.deactivateOverlay(); // Close the overlay
  };

  // Handler for the Escape key press
  handleEscapeKey = (evt) => {
    // Check if the overlay is active and the pressed key is 'Escape'
    if (this.state.isCurrentlyActive && evt.key === 'Escape') {
      evt.preventDefault(); // Prevent default browser actions (e.g., exiting full screen)
      this.deactivateOverlay(); // Close the overlay
    }
  };

  render() {
    // If a trigger component is provided, render it with an onClick handler
    if (this.props.triggerComponent) {
      const triggerContainerProps = {
        onClick: this.activateOverlay,
        className: 'overlay-trigger-wrapper',
        role: 'button', // Indicate it's an interactive element
        tabIndex: 0,    // Make it keyboard-focusable
      };
      return React.createElement('div', triggerContainerProps, this.props.triggerComponent);
    } else {
      // If no trigger component, this component itself renders nothing into the main DOM tree.
      // The overlay content is managed entirely by the `setupAndRenderOverlayContent` method
      // when `isInitiallyOpen` is true or `activateOverlay` is called programmatically.
      return null;
    }
  }
}

// Define prop types for validation
BoundaryOverlay.propTypes = {
  children: PropTypes.element.isRequired, // The content to be displayed in the overlay
  triggerComponent: PropTypes.element,    // An optional element that, when clicked, opens the overlay
  dismissOnEscape: PropTypes.bool,        // If true, pressing ESC closes the overlay
  dismissOnClickOutside: PropTypes.bool,  // If true, clicking outside the overlay closes it
  isInitiallyOpen: PropTypes.bool,        // If true, the overlay is open when the component mounts
};

// Set default values for props
BoundaryOverlay.defaultProps = {
  dismissOnEscape: false,
  dismissOnClickOutside: false,
  isInitiallyOpen: false,
};

// Export the BoundaryOverlay component
// export default BoundaryOverlay; // If using module system

// --- Main Application Components (Equivalent to index.js) ---

// Basic modal-like content component
class TemporaryDialog extends Component {
  render() {
    // Default styling for the modal content
    const modalStyle = {
      border: '2px solid navy',
      padding: '15px',
      margin: '15px',
      backgroundColor: 'white',
      borderRadius: '5px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      maxWidth: '500px',
      position: 'relative',
    };

    return React.createElement(
      'div',
      { style: modalStyle },
      this.props.children, // Render content passed to this component
      React.createElement(
        'p',
        null,
        React.createElement(
          'button',
          { onClick: this.props.dismissOverlay, style: { marginTop: '10px', padding: '8px 15px' } },
          'Close this message'
        )
      )
    );
  }
}

// A simple progress indicator component
class ProgressIndicator extends Component {
  render() {
    const indicatorStyle = {
      border: '2px dashed limegreen',
      padding: '15px',
      margin: '15px',
      backgroundColor: '#f0fff0',
      borderRadius: '5px',
    };

    return React.createElement(
      'div',
      { style: indicatorStyle },
      React.createElement(
        'p',
        null,
        'This could be a dynamic loading bar or a progress update...'
      ),
      React.createElement(
        'p',
        null,
        'This overlay is ',
        React.createElement(
          'strong',
          null,
          'controlled by a property'
        ),
        ' ',
        React.createElement(
          'i',
          null,
          'isInitiallyOpen'
        ),
        '.'
      ),
      React.createElement(
        'p',
        null,
        '... useful when a click trigger is not suitable or needed.'
      ),
      React.createElement(
        'p',
        null,
        'Note: By default, you cannot close this using ESC key or an outside click.'
      )
    );
  }
}

// Main application component
class MainApplication extends Component {
  // Initialize state using class properties
  state = {
    isSecondOverlayVisible: false, // Renamed from isPortalOpened
    appBooted: false, // Added new fragment: a simple flag
  };

  // Lifecycle method: After component has mounted
  componentDidMount() {
    console.log('MainApplication: Component has finished booting.');
    this.setState({ appBooted: true }); // Update the new fragment state
  }

  // Handler to toggle the visibility of the second overlay
  handleToggleSecondOverlay = (evt) => { // Renamed from toggleLoadingBar
    // Added a simple validation/log
    if (evt) {
      console.log('Toggle event initiated by:', evt.target.tagName);
    }
    this.setState(prev => ({ isSecondOverlayVisible: !prev.isSecondOverlayVisible }));
  };

  render() {
    // Generate trigger elements for the overlays
    const firstOverlayTrigger = React.createElement(
      'button',
      null,
      'Launch pseudo modal dialog'
    );
    const thirdOverlayTrigger = React.createElement(
      'button',
      null,
      'Another distinct overlay'
    );

    // Conditional text for the toggle button
    const toggleButtonText = this.state.isSecondOverlayVisible
      ? 'Hide the second overlay'
      : 'Show the second overlay';

    return React.createElement(
      'div',
      { className: 'main-app-container' }, // Added a class name
      React.createElement(
        'h1',
        null,
        'Advanced React Overlay Demonstrations'
      ),
      React.createElement(
        'p',
        null,
        this.state.appBooted ? 'Application is fully loaded!' : 'Loading application...' // Using the new fragment state
      ),
      React.createElement(
        'a',
        { href: 'https://github.com/tajo/react-portal', target: '_blank', rel: 'noopener noreferrer' }, // Added target and rel
        'Original Project Source: github.com/tajo/react-portal'
      ),
      React.createElement(
        'p',
        null,
        ' '
      ), // Empty paragraph for spacing

      // First BoundaryOverlay instance (pseudo modal)
      React.createElement(
        BoundaryOverlay,
        { triggerComponent: firstOverlayTrigger, dismissOnEscape: true },
        React.createElement(
          TemporaryDialog,
          null,
          React.createElement(
            'h2',
            null,
            'Temporary Information Dialog'
          ),
          React.createElement(
            'p',
            null,
            'This React component is dynamically appended to the document body.'
          ),
          React.createElement(
            'p',
            null,
            'This functionality is ',
            React.createElement(
              'strong',
              null,
              'excellent for modals, lightboxes, notifications, etc.'
            ),
            '.'
          ),
          React.createElement(
            'p',
            null,
            'You can close this by pressing the ',
            React.createElement(
              'strong',
              null,
              'ESC'
            ),
            ' key.'
          ),
          React.createElement(
            'p',
            null,
            React.createElement(
              'strong',
              null,
              'Why "Temporary"?'
            ),
            ' Because styling and full modal behavior are left to your implementation. :-)'
          )
        )
      ),

      // Button to control the second overlay
      React.createElement(
        'button',
        { onClick: this.handleToggleSecondOverlay, style: { margin: '20px 0' } },
        toggleButtonText
      ),

      // Second BoundaryOverlay instance (loading bar, controlled by state)
      React.createElement(
        BoundaryOverlay,
        { isInitiallyOpen: this.state.isSecondOverlayVisible }, // Using the renamed prop
        React.createElement(ProgressIndicator, null)
      ),

      // Third BoundaryOverlay instance (closes on outside click)
      React.createElement(
        BoundaryOverlay,
        { triggerComponent: thirdOverlayTrigger, dismissOnClickOutside: true },
        React.createElement(
          'div',
          { style: { border: '2px solid purple', margin: 15, padding: 15, backgroundColor: '#f8f0ff' } }, // Updated styling
          React.createElement(
            'p',
            null,
            'Click anywhere outside of this specific overlay area to dismiss it.'
          )
        )
      )
    );
  }
}

// Render the main application component into the DOM
const appRootElement = document.getElementById('primary-app-mount'); // Renamed mount point
if (appRootElement) { // Added a guard clause
  const root = createRoot(appRootElement);
  root.render(React.createElement(MainApplication));
} else {
  console.error('Failed to find the primary application mount point: #primary-app-mount');
}