// This module serves to define a React component proxy configuration.
// It allows for dynamic loading and rendering of target components.
module.exports = function(CoreReactLib, proxyConfiguration) {

    // Assign a descriptive alias to aid in debugging and identification within React DevTools.
    proxyConfiguration.componentNameAlias = "DynamicReactProxyInstance";

    // Defines the primary rendering method for this proxy component.
    // It's responsible for displaying the actual loaded component or a fallback.
    proxyConfiguration.renderComponentHost = function() {
        // Retrieve the currently active component reference from the component's state.
        const currentActiveComponent = this.state.activeComponentRef;

        // Proceed with rendering if a target component has been successfully loaded and is available.
        if (currentActiveComponent) {
            // Ensure a unique reference key is set on the props for internal tracking,
            // if one hasn't been explicitly provided already.
            if (!this.props.instanceReferenceKey) {
                 this.props.instanceReferenceKey = "proxyInstanceHandle";
            }

            // Construct and return the actual React element using the core React library's creation function.
            // All properties and nested children from this proxy are passed down to the target component.
            return CoreReactLib.createVirtualElement(currentActiveComponent, this.props, this.props.nestedElements);
        }
        else {
            // If no component is loaded, check if a custom fallback rendering method is defined.
            if (typeof this.fallbackRenderMethod === 'function') {
                // If a fallback is present, invoke it to render alternative content (e.g., a loading spinner).
                return this.fallbackRenderMethod();
            }
            else {
                // As a last resort, if no component and no fallback are available, render nothing.
                // Returning null explicitly signals to React that this component renders no UI output.
                return null;
            }
        }
    };

    // This method initializes the component's internal state before it is mounted.
    // It attempts to synchronously load the component for initial rendering.
    proxyConfiguration.initializeComponentState = function() {
        // Attempt to retrieve the component module immediately.
        // This assumes retrieveComponentModule might return a component synchronously in some cases,
        // or a promise/placeholder that will be resolved later.
        const initialComponentLoad = this.retrieveComponentModule();

        // Return the initial state object with the component reference.
        return {
            activeComponentRef: initialComponentLoad // The reference to the actual component.
        };
    };

    // Lifecycle method: executed immediately after the component is mounted into the DOM.
    // This is typically used for asynchronous data fetching or subscriptions.
    proxyConfiguration.onComponentMountLifecycle = function() {
        // Check if the component was not loaded during the initial state setup phase.
        // This implies an asynchronous load is required.
        if (!this.state.activeComponentRef) {
            // Initiate the asynchronous retrieval of the component module.
            // A callback is provided to handle the component once it's loaded.
            this.retrieveComponentModule(function(loadedModule) {
                // Before updating the state, perform a basic validation to ensure
                // that a valid module was actually returned.
                if (loadedModule) {
                    // If a valid module is received, update the component's state
                    // to reflect the newly loaded component, triggering a re-render.
                    this.updateInternalState({ activeComponentRef: loadedModule });
                } else {
                    // Log a warning if the dynamic component failed to load,
                    // which might indicate a configuration error or network issue.
                    console.warn("Dynamic component retrieval failed after mounting.");
                }
            }.bind(this)); // Ensure the 'this' context inside the callback refers to the component instance.
        }
    };

    // A utility method to bind the context of any function to the current component instance.
    // This can be useful for passing methods as callbacks while preserving 'this'.
    proxyConfiguration.bindMethodContext = function(methodToBind) {
        if (typeof methodToBind === 'function') {
            return methodToBind.bind(this);
        }
        return methodToBind; // Return original if not a function
    };
};