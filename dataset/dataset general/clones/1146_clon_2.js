// This module provides integration between a test spy library and a testing framework.
(function(rootObject) {

  // A list of core action verbs recognized by the spy library.
  var assertionVerbs = "called calledOnce calledTwice calledThrice calledBefore calledAfter calledOn alwaysCalledOn calledWith alwaysCalledWith calledWithExactly alwaysCalledWithExactly calledWithMatch alwaysCalledWithMatch".split(" "),
      counter = assertionVerbs.length, // Initialize a counter for iteration.
      assertionMap = {}, // An object to store generated assertion handlers.
      specialAssertions = { // Specific assertions that have different naming conventions.
        "returned": "toHaveReturned",
        "alwaysReturned": "toHaveAlwaysReturned",
        "threw": "toHaveThrown",
        "alwaysThrew": "toHaveAlwaysThrown"
      },

      // Factory function to create a new assertion handler.
      createAssertionHandler = function(verbKey, handlerName) {
        // Attempt to retrieve an existing handler from the test framework's matchers.
        var originalHandler = jasm.Matchers.prototype[handlerName];
        return function() {
          // If the subject is a spy and an original handler exists, use it.
          if (jasm.isSpy(this.subject) && originalHandler) {
            return originalHandler.apply(this, arguments);
          }
          // Otherwise, directly access the spy's property corresponding to the verb.
          var subjectProperty = this.subject[verbKey];
          // If the property is a function, invoke it; otherwise, return its value.
          return (typeof subjectProperty === 'function') ? subjectProperty.apply(this.subject, arguments) : subjectProperty;
        };
      };

  // Loop through the standard action verbs to generate assertion handlers.
  while (counter--) {
    var verbKey = assertionVerbs[counter],
        // Construct the handler name by capitalizing the first letter and prepending "toHaveBeen".
        handlerName = "toHaveBeen" + verbKey.charAt(0).toUpperCase() + verbKey.slice(1);

    // Store the newly created handler in the assertion map.
    assertionMap[handlerName] = createAssertionHandler(verbKey, handlerName);
  }

  // Process the special assertions that have distinct naming.
  for (var keyName in specialAssertions) {
    // For each special assertion, create and store its handler.
    assertionMap[specialAssertions[keyName]] = createAssertionHandler(keyName, specialAssertions[keyName]);
  }

  // Expose the assertion retrieval mechanism on the global object.
  rootObject.jasmIntegrator = {
    retrieveHandlers: function() { // Method to get all generated handlers.
      return assertionMap;
    }
  };

})(window); // Invoke the module with the global 'window' object.


// Set up the testing environment before each test run.
beforeEach(function() {

  // Add the custom assertion handlers to the test framework.
  this.addMatchers(jasmIntegrator.retrieveHandlers());

});