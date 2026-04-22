/*
 * This module exports a function that takes React and a descriptor object.
 * It's designed to create a React component proxy.
 *
 * This file serves as a proxy for a dynamically loaded React component,
 * ensuring that the component can be loaded asynchronously and rendered
 * once available. It handles the initial state and component loading logic.
 */

module.exports = function ( React, desc ) {

  // Assign a display name for the component, useful for debugging in React DevTools.
  desc.displayName = "ReactProxy";


  // Define the render method for this React component.
  // This method is responsible for rendering the actual component once it's loaded.
  desc.render = function ( ) {

    // Retrieve the actual component from the component's state.
    var Component = this.state.component;

    // Check if the component has been successfully loaded into the state.
    if ( Component ) {

      // If the component exists, set a ref on its instance for potential external access.
      this.props.ref = "componentProxy";

      // Return the React element for the loaded component, passing along
      // all original props and children.
      return React.createElement( Component, this.props, this.props.children );

    } // End of rendering the loaded Component.
    else if ( this.renderUnavailable ) {

      // If the component is not yet available, and a 'renderUnavailable' method
      // is provided, execute it to display a fallback UI.
      return this.renderUnavailable( );

    } else {

      // If no component is loaded and no 'renderUnavailable' method is provided,
      // render nothing (null) to prevent any UI from appearing.
      return null;

    } // End of rendering fallback or null.

  }; // End of desc.render method definition.


  // Define the getInitialState method for the component.
  // This method sets up the initial state before the component mounts.
  desc.getInitialState = function ( ) {

    // The initial state includes a 'component' property, which is populated
    // by calling the 'loadComponent' method.
    return { component: this.loadComponent( ) };

  }; // End of desc.getInitialState method definition.


  // Define the componentDidMount lifecycle method.
  // This method is invoked immediately after the component is mounted.
  desc.componentDidMount = function ( ) {

    // Check if the component has not been loaded yet (i.e., it's null or undefined).
    if ( !this.state.component ) {

      // If the component is missing, initiate the asynchronous loading process.
      // A callback function is provided to handle the component once it's loaded.
      this.loadComponent( function ( component ) {

        // Upon successful loading, update the component's state with the new component.
        // This will trigger a re-render of the component.
        this.setState( { component: component } );

      }.bind( this ) ); // Ensure the 'this' context inside the callback refers to the component instance.

    } // End of component loading check.

  }; // End of desc.componentDidMount method definition.

}; // End of module.exports function.