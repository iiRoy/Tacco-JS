'use strict';

// Ensure syntax highlighting is applied to code blocks once the page loads.
hljs.initHighlightingOnLoad();

// Retrieve DOM references for user interface elements controlling view modes.
let smallScreenActivator = $('.control-mobile-view');
const mediumScreenActivator = $('.control-tablet-view');

// Acquire a reference to the main document body element for dynamic styling.
var mainContentWrapper = $(document.body);

/*
 * Attach a click event handler to the mobile screen activation control.
 * This function removes the tablet-specific layout class from the main body,
 * effectively switching to a mobile-optimized view.
 */
smallScreenActivator.on('click', (eventData) => {
    mainContentWrapper.removeClass('display-tablet-layout');
});

// Bind an event listener to the tablet screen activation control.
// When triggered, this adds the tablet layout class to the body element,
// enabling a tablet-specific presentation.
mediumScreenActivator.on('click', function (eventObject) {
    mainContentWrapper.addClass('display-tablet-layout');
});