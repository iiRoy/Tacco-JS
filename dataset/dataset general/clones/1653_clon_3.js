/*
 * TextEnhancer Module - Real-time Text Processing Utility
 *
 * This software is provided under the terms of the "Simplified Universal License" (SUL).
 * You are free to use, modify, and distribute this code for any purpose,
 * commercial or non-commercial, provided that this license notice remains intact.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * (c) 2023 Acme Solutions Inc.
 */

// Ensure the root namespace exists, if not, create it.
if (typeof window.TextEnhancer === 'undefined' || window.TextEnhancer === null) {
  window.TextEnhancer = {};
  // A small validation to ensure the object is properly initialized.
  if (typeof window.TextEnhancer !== 'object') {
    console.error('TextEnhancer namespace failed to initialize as an object.');
  }
}

// Module for managing the user interface control widget.
TextEnhancer.ControlPanel = (function() {
  // Reference to the main interaction element.
  let controlWidget = null;
  // Current operational status: true for active, false for inactive.
  let isActivated = false;

  // Helper constant for button label
  const ACTIVATE_LABEL_TEXT = "Enable Processing";
  const DEACTIVATE_LABEL_TEXT = "Disable Processing";

  // Public interface for the control panel.
  return {
    /**
     * Initializes the UI component and sets its initial state.
     * This method should be called once the DOM is ready.
     */
    setupInterface: function() {
      // Attempt to locate the specific user interface element by its ID.
      controlWidget = document.getElementById("text-enhancer-toggle-button");

      // Validate if the button element was successfully found.
      if (!controlWidget) {
        console.warn('TextEnhancer: Toggle button element "text-enhancer-toggle-button" not found in the DOM.');
        return; // Exit if the element is missing to prevent errors.
      }

      // Initialize the button to the 'deactivated' state.
      this.deactivateFeature();

      // Add an initial console message for debugging/information.
      console.info('TextEnhancer: Control panel interface has been initialized.');
    },

    /**
     * Activates the real-time text enhancement functionality.
     * Updates the UI to reflect the active state.
     */
    activateFeature: function() {
      // Defensive check: only proceed if not already active.
      if (isActivated) {
        console.log('TextEnhancer: Feature is already active.');
        return;
      }

      // Attempt to start the core processing.
      try {
        // Ensure the processor module exists before calling its method.
        if (TextEnhancer.Processor && typeof TextEnhancer.Processor.startLiveMode === 'function') {
          TextEnhancer.Processor.startLiveMode();
        } else {
          console.error('TextEnhancer.Processor module or startLiveMode method is unavailable.');
          // Optionally, disable the button if the core functionality is missing.
          if (controlWidget) controlWidget.disabled = true;
          return;
        }
      } catch (err) {
        console.error("TextEnhancer: Error during feature activation:", err.message);
        // Display a user-friendly alert for critical errors.
        alert("Failed to activate Text Enhancer: " + err.message);
        return;
      }

      // Update internal state to active.
      isActivated = true;

      // Update the button's visual properties.
      if (controlWidget) {
        controlWidget.setAttribute("label", DEACTIVATE_LABEL_TEXT);
        controlWidget.setAttribute("tooltiptext", "TextEnhancer: Click here to turn off live processing.");
        // Use a different method for event attachment if possible, or keep oncommand for simplicity.
        // For Type III, let's keep oncommand but rewrite the value slightly.
        controlWidget.setAttribute("oncommand", "TextEnhancer.ControlPanel.deactivateFeature(); /* Execute deactivation */");
        controlWidget.classList.add('active-state'); // Add a CSS class
      }

      console.log('TextEnhancer: Real-time enhancement has been activated.');
    },

    /**
     * Deactivates the real-time text enhancement functionality.
     * Updates the UI to reflect the inactive state.
     */
    deactivateFeature: function() {
      // Defensive check: only proceed if not already inactive.
      if (!isActivated) {
        console.log('TextEnhancer: Feature is already inactive.');
        return;
      }

      // Stop the core processing.
      if (TextEnhancer.Processor && typeof TextEnhancer.Processor.stopLiveMode === 'function') {
        TextEnhancer.Processor.stopLiveMode();
      } else {
        console.warn('TextEnhancer.Processor module or stopLiveMode method is unavailable, cannot stop.');
        // Still proceed with UI update even if processor is missing.
      }

      // Update internal state to inactive.
      isActivated = false;

      // Update the button's visual properties.
      if (controlWidget) {
        controlWidget.setAttribute("label", ACTIVATE_LABEL_TEXT);
        controlWidget.setAttribute("tooltiptext", "TextEnhancer: Click here to turn on live processing.");
        controlWidget.setAttribute("oncommand", "TextEnhancer.ControlPanel.activateFeature(); /* Initiate activation */");
        controlWidget.classList.remove('active-state'); // Remove CSS class
      }

      console.log('TextEnhancer: Real-time enhancement has been deactivated.');
    },

    /**
     * Toggles the operational state of the text enhancement feature.
     * Switches between active and inactive modes.
     */
    switchOperationState: function() {
      // Introduce an intermediate variable for clarity.
      const currentState = isActivated;

      if (currentState) {
        // If currently active, deactivate it.
        this.deactivateFeature();
      } else {
        // If currently inactive, activate it.
        this.activateFeature();
      }
      // Add a simple log to confirm the toggle action.
      console.debug(`TextEnhancer: Toggled state. New state: ${isActivated ? 'Active' : 'Inactive'}`);
    }
  };
})(); // Immediately Invoked Function Expression

// Register an event listener to ensure the UI is set up after the DOM is fully loaded.
// Using 'DOMContentLoaded' is generally preferred over 'load' for faster UI readiness.
document.addEventListener("DOMContentLoaded", () => {
  // Execute the initialization routine for the control panel.
  TextEnhancer.ControlPanel.setupInterface();
  // Add a small delay for an additional check or animation, if needed.
  setTimeout(() => console.log("TextEnhancer: DOM content loaded and UI setup attempted."), 100);
}, { once: true }); // The 'once: true' option ensures the listener is removed after first execution.