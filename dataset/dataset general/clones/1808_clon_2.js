/*
 * This file defines a utility that generates a React component definition.
 * It acts as a proxy, asynchronously loading another component.
 */
module.exports = function( ViewLibrary_framework,  component_definition_object ) {

    // Assign a distinct name to this component for easier debugging in development tools.
    component_definition_object.display_label = "VisualElementProxy";

    // Implement the core rendering logic for the component.
    component_definition_object.perform_render = function() {
        let  currently_active_element  =  this.state.managed_component; // Retrieve the target component from the instance's state.

        if ( currently_active_element ) {
            // If the target component is available, prepare its props and render it.
            this.component_props.internal_ref = "managedElementRef"; // Set a specific reference for internal access.
            return ViewLibrary_framework.create_element_instance(
                currently_active_element,
                this.component_props,
                this.component_props.child_nodes
            );
        }
        else if ( this.handle_missing_render ) {
            // If the component isn't ready and a fallback renderer is provided, use it.
            return this.handle_missing_render();
        }
        else {
            // Default case: nothing to show if no component and no fallback.
            return null;
        }
    };

    // Define the initial state of the component when it's first created.
    component_definition_object.get_initial_data_state = function() {
        // The initial state holds a placeholder for the component, which will be loaded.
        return { managed_component: this.initiate_component_load() };
    };

    // Lifecycle method: executed right after the component is inserted into the DOM.
    component_definition_object.on_mount_completion = function() {
        // Check if the component has already been loaded (e.g., during server-side rendering).
        if ( !this.state.managed_component ) {
            // If not, trigger the asynchronous loading process.
            this.initiate_component_load( function( loaded_component_instance ) {
                // Once loaded, update the component's state to reflect the new component.
                this.set_component_state( { managed_component: loaded_component_instance } );
            }.bind( this ) ); // Bind 'this' to ensure correct context within the callback.
        }
    };
};