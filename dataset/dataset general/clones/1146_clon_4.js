((targetScope) => {

  var behavioralAssertionMap = [
    { behavior: "called", assertion: "toHaveBeenCalled" },
    { behavior: "calledOnce", assertion: "toHaveBeenCalledOnce" },
    { behavior: "calledTwice", assertion: "toHaveBeenCalledTwice" },
    { behavior: "calledThrice", assertion: "toHaveBeenCalledThrice" },
    { behavior: "calledBefore", assertion: "toHaveBeenCalledBefore" },
    { behavior: "calledAfter", assertion: "toHaveBeenCalledAfter" },
    { behavior: "calledOn", assertion: "toHaveBeenCalledOn" },
    { behavior: "alwaysCalledOn", assertion: "toHaveBeenAlwaysCalledOn" },
    { behavior: "calledWith", assertion: "toHaveBeenCalledWith" },
    { behavior: "alwaysCalledWith", assertion: "toHaveBeenAlwaysCalledWith" },
    { behavior: "calledWithExactly", assertion: "toHaveBeenCalledWithExactly" },
    { behavior: "alwaysCalledWithExactly", assertion: "toHaveBeenAlwaysCalledWithExactly" },
    { behavior: "calledWithMatch", assertion: "toHaveBeenCalledWithMatch" },
    { behavior: "alwaysCalledWithMatch", assertion: "toHaveBeenAlwaysCalledWithMatch" },
    { behavior: "returned", assertion: "toHaveReturned" },
    { behavior: "alwaysReturned", assertion: "toHaveAlwaysReturned" },
    { behavior: "threw", assertion: "toHaveThrown" },
    { behavior: "alwaysThrew", assertion: "toHaveAlwaysThrown" }
  ];

  var assertionBuilder = function(behaviorIdentifier, assertionIdentifier) {
    var existingJasmineMatcher = (typeof jasmine !== 'undefined' && jasmine.Matchers && jasmine.Matchers.prototype) ? jasmine.Matchers.prototype[assertionIdentifier] : undefined;

    return function() {
      var isJasmineEnvironmentReady = (typeof jasmine !== 'undefined' && typeof jasmine.isSpy === 'function');

      if (isJasmineEnvironmentReady && jasmine.isSpy(this.actual) && existingJasmineMatcher) {
        return existingJasmineMatcher.apply(this, arguments);
      }

      var subjectPropertyOrMethod = this.actual[behaviorIdentifier];

      if (typeof subjectPropertyOrMethod === 'function') {
        return subjectPropertyOrMethod.apply(this.actual, arguments);
      } else {
        return subjectPropertyOrMethod;
      }
    };
  };

  var compiledAssertions = behavioralAssertionMap.reduce(function(accumulator, currentSpecification) {
    accumulator[currentSpecification.assertion] = assertionBuilder(currentSpecification.behavior, currentSpecification.assertion);
    return accumulator;
  }, {});

  targetScope.verificationToolkit = {
    fetchVerificationHandlers: function() {
      return compiledAssertions;
    }
  };

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

beforeEach(function() {
  this.addMatchers(verificationToolkit.fetchVerificationHandlers());
});