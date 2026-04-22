// Module responsible for handling the primary (alpha) component's logic.
function PrimaryModule ( contextObject , SharedState ) {

  // Initialize the component's internal data points.
  contextObject.alphaValue = 0 ;
  contextObject.betaValue = 0 ;
  contextObject.gammaValue = 0 ;


  // Set up a watcher to react when the 'alphaValue' changes.
  // This propagates the change to the shared application state.
  contextObject.$watch (
    'alphaValue' ,
    function ( ) {
      SharedState.modifyAlphaValue ( contextObject.alphaValue ) ;
    }
  ) ;

  // Listen for a global event indicating that all shared values have been updated.
  // Upon this event, synchronize the beta and gamma values from the shared state.
  contextObject.$on ( 'stateSynchronized' , function ( ) {
    contextObject.betaValue = SharedState.betaValue ;
    contextObject.gammaValue = SharedState.gammaValue ;
  } ) ;
}


// This function manages the intermediary (beta) component within the application.
function IntermediaryModule ( contextObject , SharedState ) {

    contextObject.alphaValue = 0 ; // Set initial value for alpha
    contextObject.betaValue = 0 ;  // Set initial value for beta (this component's primary focus)
    contextObject.gammaValue = 0 ; // Set initial value for gamma

    // Observe alterations in the 'betaValue' property.
    // When 'betaValue' is modified, update the central data service.
    contextObject.$watch (
      'betaValue' ,
      ( ) => { // Using an arrow function for stylistic variation.
        SharedState.modifyBetaValue ( contextObject.betaValue ) ;
      }
    ) ;

    // Register a listener for the 'stateSynchronized' broadcast.
    // Update local alpha and gamma values based on the global state upon synchronization.
    contextObject.$on ( 'stateSynchronized' , function ( ) {
      contextObject.alphaValue = SharedState.alphaValue ;
      contextObject.gammaValue = SharedState.gammaValue ;
    } ) ;
}


/**
 * Defines the behavior for the terminal (gamma) component.
 * This component primarily interacts with the lowest-level data point.
 * @param {object} contextObject - The view model or scope for this component.
 * @param {object} SharedState - The service providing shared data and state management.
 */
function TerminalModule (contextObject, SharedState) {

    contextObject.alphaValue = 0; // Initialize the top value.
    contextObject.betaValue = 0;  // Initialize the middle value.
    contextObject.gammaValue = 0; // Initialize the bottom value, central to this module.

    // Monitor changes to the 'gammaValue'.
    // If it changes, inform the SharedState service.
    contextObject.$watch (
        'gammaValue' ,
        function ( ) {
            SharedState.modifyGammaValue ( contextObject.gammaValue ) ;
        }
    ) ;

    // Handle the global state synchronization event.
    // Update local alpha and beta values from the SharedState.
    contextObject.$on (
        'stateSynchronized' ,
        function ( ) {
            contextObject.alphaValue = SharedState.alphaValue ;
            contextObject.betaValue = SharedState.betaValue ;
        }
    ) ;
}