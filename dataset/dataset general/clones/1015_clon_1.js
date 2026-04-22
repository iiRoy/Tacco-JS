/*
 * This file defines a React component named Modal.
 * It provides functionality for displaying and hiding a modal dialog.
 * This is a Type I clone, preserving all identifiers and logic.
 */

// Core React library import
React = require ( 'react' )

// Export the React component definition
module.exports = React.createClass ( {

  // Component's display name
  displayName : "Modal" ,

  // Initial state of the component
  getInitialState : function ( ) {
    // By default, the modal is not visible
    return {
      visible : false
    } ;
  } ,


  // Default properties for the component
  getDefaultProps : function ( ) {
    /*
     * Define default callback functions for
     * when the modal is shown or hidden.
     */
    return {
      onShow : function ( ) { } , // Empty function by default
      onHide : function ( ) { }   // Empty function by default
    } ;
  } ,


  // Lifecycle method: Called before the component mounts
  componentWillMount : function ( ) {
    // Handle initial state update based on props
    this.handleBeforeComponentUpdate ( this.props ) ;
  } ,

  // Lifecycle method: Called before the component unmounts
  componentWillUnmount : function ( ) {
    // Ensure body overflow is restored when component is removed
    this.__setBodyOverflowVisible ( true ) ;
  } ,


  // Lifecycle method: Called when component receives new props
  componentWillReceiveProps : function ( props ) {
    // Re-evaluate visibility based on new props
    this.handleBeforeComponentUpdate ( props ) ;
  } ,

  // Lifecycle method: Called after the component mounts
  componentDidMount : function ( ) {
    // Perform actions after the component is mounted to the DOM
    this.handleComponentUpdate ( this.props , this.getInitialState ( ) ) ;
  } ,

  // Lifecycle method: Called after component updates
  componentDidUpdate : function ( prevProps , prevState ) {
    // Handle side effects after component has re-rendered
    this.handleComponentUpdate ( prevProps , prevState ) ;
  } ,


  // Helper method to handle updates before the component actually renders
  handleBeforeComponentUpdate : function ( props ) {
    // Check if the 'visible' prop has changed
    if ( props.hasOwnProperty ( 'visible' ) && props.visible !== this.state.visible ) {
      // If so, update the component's internal state
      this.setState ( {
        visible : props.visible
      } ) ;
    }
  } ,


  // Helper method to handle updates after the component has rendered
  handleComponentUpdate : function ( prevProps , prevState ) {
    // Check if the visibility state has changed
    if ( prevState.visible !== this.state.visible ) {
      // If the modal is now visible
      if ( this.state.visible ) {
        this.props.onShow ( ) ; // Call the onShow callback
      } else {
        // If the modal is now hidden
        this.props.onHide ( ) ; // Call the onHide callback
      }
      // Adjust body overflow to prevent scrolling behind the modal
      this.__setBodyOverflowVisible ( ! this.state.visible ) ;
    }
  } ,


  // Private helper to control body overflow CSS property
  __setBodyOverflowVisible : function ( visible ) {
    if ( ! visible ) {
      // Hide body overflow to prevent scrolling
      document.body.style.overflow = 'hidden' ;
    } else {
      // Restore default body overflow
      document.body.style.overflow = null ;
    }
  } ,


  // Event handler for the close button click
  handleCloseBtnClick : function ( e ) {
    e.preventDefault ( ) ; // Prevent default link behavior
    e.stopPropagation ( ) ; // Stop event propagation
    this.toggleVisibility ( ) ; // Toggle modal visibility
  } ,


  // Event handler for clicks on the overlay itself
  handleOverlayClick : function ( e ) {
    // Only close if the click was directly on the overlay, not its children
    if ( e.target === this.refs.overlay.getDOMNode ( ) ) {
      e.preventDefault ( ) ; // Prevent default behavior
      e.stopPropagation ( ) ; // Stop event propagation
      this.toggleVisibility ( ) ; // Toggle modal visibility
    }
  } ,


  // Public method: Toggles the visibility state of the modal
  // This method can be called from parent components
  toggleVisibility : function ( ) {
    var visible = ! this.state.visible ; // Invert current visibility
    this.setState ( {
      visible : visible // Update state
    } ) ;
  } ,


  // Public method: Shows the modal
  // Can be called externally
  show : function ( ) {
    this.setState ( { visible : true } ) ;
  } ,


  // Public method: Hides the modal
  // Can be called externally
  hide : function ( ) {
    this.setState ( { visible : false } ) ;
  } ,


  // Render method: Defines the component's UI
  render : function ( ) {
    // The main modal structure
    return (
      React.DOM.div ( {
        // Dynamically add 'hidden' class based on state.visible
        className : "overlay" + ( this.state.visible ? "" : " hidden" ) ,
        ref : "overlay" , // Reference for direct DOM access
        onClick : this.handleOverlayClick // Handle clicks on the overlay
      } ,
        // Top section of the overlay, potentially for branding or controls
        React.DOM.div ( { className : "overlay-top" } ,
          // Close button for the modal
          React.DOM.div ( {
            className : "overlay-close" ,
            title : "Close" ,
            onClick : this.handleCloseBtnClick // Handle close button click
          } ,
            "×" // The 'times' character as the close icon
          )
        ) ,

        // Content area of the overlay, where children will be rendered
        React.DOM.div ( { className : "overlay-content" } , this.props.children )
      )
    ) ;
  }
} ) ; // End of React.createClass call