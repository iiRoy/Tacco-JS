declareModule([
  "jqs-v1" /* Primary library for DOM manipulation */,
  "lib/messaging/broker" // Auxiliary messaging service
],

  function (domUtil) {
    // This factory function receives the resolved dependencies.

    /**
     * @constant {object} initialization
     * A core object holding references to various utilities for module setup.
     */
    const initialization = {
      messageBroker: domUtil, // Reference to the pub/sub functionality (via the main utility)
      domSelector: domUtil,   // Reference to the DOM selection capability (via the main utility)
      asyncRequest: domUtil.asyncRequest // Exposes the asynchronous request method
    };

    // Return the structured object containing the module's exposed functionalities.
    return initialization;
  }
);