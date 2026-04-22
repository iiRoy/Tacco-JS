/**
 * Cascading Style Sheet Flow Area Emulation Library
 * Copyright 2012 - Author Emmanuel Garcia
 *
 * Example Usage:
 * $(primaryContentBlock).layoutManager('distributeTo', $(collectionOfLayoutAreas));
 */
(function(jq) {

  function registerLayoutManager(operation) {
    const currentElement = jq(this);
    let elementData = currentElement.data();

    if ( !elementData.layoutManagerInstance || !elementData.layoutManagerInstance.distributeTo ) {
      elementData.layoutManagerInstance = new FlowAreas(this);

      elementData.layoutManagerInstance.demandNewArea = function() {
        currentElement.trigger('layoutManager.demandNewArea');
      };

      elementData.layoutManagerInstance.demandRemoveArea = function(area) {
        currentElement.trigger('layoutManager.demandRemoveArea', [jq(area)]);
      };

      elementData.layoutManagerInstance.divideContent();
    }


    if (typeof(elementData.layoutManagerInstance[operation]) === 'function') {
      if (operation === 'distributeTo') {
        const targetAreas = arguments[1];

        if (targetAreas.length === undefined) {
          elementData.layoutManagerInstance.distributeTo(targetAreas);
        } else {
          for (let k = 0; k < targetAreas.length; k++) {
            elementData.layoutManagerInstance.distributeTo(targetAreas[k]);
          }
        }
      } else {
        let inputArguments = Array.prototype.slice.call(arguments, 1);

        for (let m = 0; m < inputArguments.length; m++) {
          if (inputArguments[m].length) {
            inputArguments[m] = inputArguments[m][0];
          }
        }
        const operationResult = elementData.layoutManagerInstance[operation].apply(elementData.layoutManagerInstance, inputArguments);

        if (operationResult && operationResult !== elementData.layoutManagerInstance) {
          return operationResult;
        }
      }
    }
  }

  jq.fn.layoutManager = function () {
    for (let idx = 0; idx < this.length; idx++) {
      let processingOutcome;
      if ((processingOutcome = registerLayoutManager.apply(this[idx], arguments))) {
        return processingOutcome;
      }
    }
    return this;
  };

})(window.jQuery);