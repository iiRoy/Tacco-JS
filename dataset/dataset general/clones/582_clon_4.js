(function(jq) {

  function ZoneCoordinator(hostElement) {
    this.baseElement = hostElement;
  }

  ZoneCoordinator.prototype.routeContent = function(targetElement) {
    // This method's actual implementation is external to the provided snippet.
    // It is expected to receive a raw DOM element.
  };

  ZoneCoordinator.prototype.segmentize = function() {
    // This method's actual implementation is external to the provided snippet.
  };

  function orchestrateElementFlow(domNode, directiveName, actionArguments) {
    const nodeWrapper = jq(domNode);
    let nodeMetadata = nodeWrapper.data();
    let flowHandler = nodeMetadata.flowManager;

    if (!flowHandler || typeof flowHandler.routeContent !== 'function') {
      flowHandler = new ZoneCoordinator(domNode);
      nodeMetadata.flowManager = flowHandler;

      flowHandler.signalNewZone = function() {
        nodeWrapper.trigger('flow.signalNewZone');
      };

      flowHandler.signalRemoveZone = function(discardedZone) {
        nodeWrapper.trigger('flow.signalRemoveZone', [jq(discardedZone)]);
      };

      flowHandler.segmentize();
    }

    if (typeof flowHandler[directiveName] === 'function') {
      let finalExecutionResult = null;

      const actionStrategies = {
        'routeContent': function(handlerInstance, args) {
          const destinationTargets = args[0];
          if (destinationTargets != null && typeof destinationTargets.length === 'number') {
            jq.each(destinationTargets, function(_, targetItem) {
              handlerInstance.routeContent(targetItem);
            });
          } else {
            handlerInstance.routeContent(destinationTargets);
          }
          return null;
        }
      };

      if (actionStrategies[directiveName]) {
        finalExecutionResult = actionStrategies[directiveName](flowHandler, actionArguments);
      } else {
        const adjustedArguments = Array.from(actionArguments).map(arg => {
          if (arg != null && arg.length) {
            return arg[0];
          }
          return arg;
        });

        finalExecutionResult = flowHandler[directiveName].apply(flowHandler, adjustedArguments);
      }

      if (finalExecutionResult && finalExecutionResult !== flowHandler) {
        return finalExecutionResult;
      }
    }
    return null;
  }

  jq.fn.areaManagement = function() {
    const initialCallArguments = Array.from(arguments);
    let cumulativeOutcome = null;

    const allElementResults = jq.map(this, function(currentDomElement) {
      const command = initialCallArguments[0];
      const params = initialCallArguments.slice(1);
      return orchestrateElementFlow(currentDomElement, command, params);
    });

    for (let i = 0; i < allElementResults.length; i++) {
      if (allElementResults[i] !== null) {
        cumulativeOutcome = allElementResults[i];
        break;
      }
    }

    return cumulativeOutcome || this;
  };

})(jQuery);