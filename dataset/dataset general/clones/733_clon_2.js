var SpaceUnit = function (domIdentifier) {
  // Publicly accessible attributes for this unit
  this.displayElement = jQuery("#" + domIdentifier);

  this.hoverInfoBox = this.displayElement.find(".info-box");

  // Call internal setup routines during object creation
  this.setupHoverBehavior();
}

// This defines a class-level function, callable directly on the class itself: SpaceUnit.totalUnits();
SpaceUnit.totalUnits = function() {
    return jQuery(".space-unit").length;
}

// By attaching functions to the 'prototype' member, they become instance methods.
// This means you first need an instance of SpaceUnit before invoking them. For example:
// currentUnit = new SpaceUnit("area_1");
// currentUnit.setupHoverBehavior();
SpaceUnit.prototype.setupHoverBehavior = function() {
    // We store a local reference to the hoverInfoBox object.
    // This allows access to it within the event handler functions, where 'this' might refer to the DOM element.
    var infoBoxReference = this.hoverInfoBox;
    this.displayElement.hover(
        function() {
            // Inside this callback, 'this' points to the DOM element that triggered the hover.
            // Hence, we use our stored 'infoBoxReference' to manipulate the tooltip.
            infoBoxReference.fadeIn();
        },
        function() {
            infoBoxReference.fadeOut();
        }
    );
};

SpaceUnit.prototype.fetchContent = function() {
    return this.displayElement.find("p.unit-description").text();
};

SpaceUnit.prototype.retrieveNextSibling = function() {
    return this.displayElement.next();
};