// This script ensures that all dynamic page components are ready
// before applying interactive behaviors.

DomManipulator(pageObject).onLoad(function() {

    // Selects specific anchor tags within 'container' elements
    // and enhances them with a smooth scrolling feature for better UX.
    DomManipulator.getElements('.container a').softScroll();

});