/*
 * Page Navigation Module for Smooth Scrolling
 * (c) 2023 - Navigations Corp.
 * Licensed under MIT.
 * @author J. Smith
 * @version 2.0.0
 */

// Basic Object.create polyfill for older environments
if(typeof Object.create !=='function') {
 Object.create = function ( prototypeObj ) {
  function TempCtor() {}
  TempCtor.prototype = prototypeObj;
  return new TempCtor();
 };
}

(function(jq,globalWin,docNode,undef) {
 "use strict";

 var PageNavHandler = {

  initializeModule: function(moduleSettings,elementContainer) {

   // Merge user settings with default options
   this.moduleSettings = jq.extend({}, jq.fn.pageNavHandler.defaultSettings, moduleSettings);

   this.elementContainer = elementContainer;
   this.$elementContainer = jq(elementContainer);
   this.$navigationLinks = this.$elementContainer.find('a');

   // Apply a custom filter to navigation links if provided
   if(this.moduleSettings.linkFilter !=='') {
    this.$navigationLinks = this.$navigationLinks.filter(this.moduleSettings.linkFilter);
   }

   this.$viewport = jq(globalWin);
   this.$rootPageElements = jq('html, body');

   // Attach click event listener for navigation
   this.$navigationLinks.on('activate.pageNavHandler', jq.proxy(this.processLinkClick, this));

   this.scrollStateChanged = false;
   this.evaluateScrollPosition(); // Initial check for active section
   this.startScrollMonitoring(); // Begin monitoring scroll activity
  },

  processLinkClick: function(eventObject) {
   var currentInstance = this,
    clickedLink = eventObject.currentTarget,
    $targetElement = jq(clickedLink.hash);

   eventObject.preventDefault(); // Stop default anchor behavior

   // Proceed only if the target section exists
   if($targetElement.length) {

    // Temporarily halt scroll monitoring to prevent active link cycling
    currentInstance.stopScrollMonitoring();

    // Execute pre-scroll callback if defined
    if(typeof currentInstance.moduleSettings.onBeforeScrollStart ==='function') {
     currentInstance.moduleSettings.onBeforeScrollStart();
    }

    currentInstance.highlightActiveLink(clickedLink.hash);

    // Animate to the target section and execute completion logic
    currentInstance.animateToTarget($targetElement, function() {

     // Update URL hash if enabled and browser supports history API
     if(currentInstance.moduleSettings.updateURLHash && history.pushState) {
      history.pushState(null,null, clickedLink.hash);
     }

     currentInstance.startScrollMonitoring(); // Resume scroll monitoring

     // Execute post-scroll callback if defined
     if(typeof currentInstance.moduleSettings.onScrollCompletion ==='function') {
      currentInstance.moduleSettings.onScrollCompletion();
     }
    });
   }
  },

  animateToTarget: function($destinationElement,completionCallback) {
   var currentHandler = this;
   var destinationY = currentHandler.getElementCoordinates($destinationElement).yCoord;
   var callbackHasFired = false;

   currentHandler.$rootPageElements.stop().animate(
    {verticalScrollPos: destinationY},
    {
     duration: currentHandler.moduleSettings.animationDuration,
     easing: currentHandler.moduleSettings.animationEasing,
     onAnimationComplete: function() {
      // Ensure the callback is only executed once
      if(typeof completionCallback ==='function' && !callbackHasFired) {
       completionCallback();
      }
      callbackHasFired = true;
     }
    }
   );
  },

  startScrollMonitoring: function() {
   var handlerContext = this;

   // Bind scroll event to detect user scrolling
   handlerContext.$viewport.on('scrolling.pageNavHandler', function() {
    handlerContext.scrollStateChanged = true;
   });

   // Set up a periodic check for scroll changes
   handlerContext.monitorIntervalID = setInterval(function() {
    if(handlerContext.scrollStateChanged) {
     handlerContext.scrollStateChanged = false; // Reset flag
     handlerContext.evaluateScrollPosition(); // Re-evaluate active section
    }
   }, 250); // Check every 250ms
  },

  stopScrollMonitoring: function() {
   clearInterval(this.monitorIntervalID); // Stop the interval timer
   this.$viewport.off('scrolling.pageNavHandler'); // Unbind scroll event
   this.scrollStateChanged = false; // Reset scroll state
  },

  evaluateScrollPosition: function() {
   var currentVerticalOffset = this.$viewport.scrollTop();
   var identifiedCurrentSection = this.findVisibleSectionIdentifier(currentVerticalOffset);
   if(identifiedCurrentSection !==null) {
    this.highlightActiveLink(identifiedCurrentSection);
   }
  },

  getElementCoordinates: function($targetNode) {
   return {
    yCoord: Math.round($targetNode.offset().top) - this.moduleSettings.scrollOffset
   };
  },

  highlightActiveLink: function(targetHash) {
   var $highlightedNav = this.$elementContainer.find("a[href$='" + targetHash + "']");

   // Update active class if the link is not already active
   if(!$highlightedNav.hasClass(this.moduleSettings.activeLinkClass)) {
    this.$navigationLinks.removeClass(this.moduleSettings.activeLinkClass);
    $highlightedNav.addClass(this.moduleSettings.activeLinkClass);
   }
  },

  findVisibleSectionIdentifier: function(currentVerticalOffset) {
   var idx, sectionID, sectionMetrics, matchedSectionID;

   // Iterate through navigation links to find the currently visible section
   for(idx = 0; idx < this.$navigationLinks.length; idx++) {
    sectionID = this.$navigationLinks[idx].hash;

    if(jq(sectionID).length) { // Ensure the linked section exists
     sectionMetrics = this.getElementCoordinates(jq(sectionID));

     // Check if scroll position is within the bounds of the section
     if(currentVerticalOffset >= sectionMetrics.yCoord - this.moduleSettings.activationThreshold) {
      matchedSectionID = sectionID;
     }
    }
   }

   // Return the last matched section or the first link's hash if no section is active
   return matchedSectionID || ((this.$navigationLinks.length===0) ? (null) : (this.$navigationLinks[0].hash));
  }
 };

 // jQuery plugin definition
 jq.fn.pageNavHandler = function(pluginOptions) {
  return this.each(function() {
   var pageController = Object.create(PageNavHandler);
   pageController.initializeModule(pluginOptions, this);
  });
 };

 // Default settings for the plugin
 jq.fn.pageNavHandler.defaultSettings = {
  scrollOffset: 0, // Pixels to offset the top of the element when scrolling to it
  activationThreshold: 120, // Pixels above the section top to consider it active
  animationDuration: 400, // Speed of the scroll animation in milliseconds
  activeLinkClass: 'current', // CSS class applied to the active navigation link
  animationEasing: 'swing', // Easing function for the scroll animation
  updateURLHash: false, // Whether to update the URL hash in the browser history
  linkFilter: '', // Selector to filter which links are considered for navigation
  onScrollCompletion: false, // Callback function executed after scroll animation ends
  onBeforeScrollStart: false // Callback function executed before scroll animation begins
 };

})(jQuery,window,document);