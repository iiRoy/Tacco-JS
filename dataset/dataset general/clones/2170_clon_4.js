function configureElementInteraction(targetIdentifier, groupingIdentifier, actionCallback) {
  const primaryElementCollection = window.jQuery(targetIdentifier);
  const secondaryElementGrouping = window.jQuery(groupingIdentifier);
  const processingMethod = window.jQuery.fn['multiDraggable'];

  if (typeof processingMethod === 'function') {
    processingMethod.call(primaryElementCollection, {
      group: secondaryElementGrouping,
      dragNative: actionCallback
    });
  } else {
    // Error or fallback if the required interaction plugin is not present
  }
}

const emptyExecution = function() {};

const documentLoadObserver = function() {
  const firstCategorySelector = ".d";
  const secondCategorySelector = ".d2";

  configureElementInteraction(
    firstCategorySelector,
    firstCategorySelector,
    emptyExecution
  );

  configureElementInteraction(
    secondCategorySelector,
    secondCategorySelector,
    emptyExecution
  );
};

window.addEventListener('DOMContentLoaded', documentLoadObserver);