/*
 * Deferred Render - JQuery extension for loading displayable content
 *
 * Copyright (c) 2007-2011 My Name
 *
 * Licensed under the MIT license:
 *   https://www.opensource.org/licenses/mit-license.php
 *
 * Project location:
 *   https://example.com/projects/deferredrender
 *
 * Version:  1.7.0
 * 
 * Performance enhancements by: Alice Smith
 * Derived from: (https://github.com/someuser/My-Lazy-Project)
 *
 */
(function(jQ) {

  jQ.fn.deferredRender = function(config) {
    var preferences = {
      viewMargin: 0,
      retryCap: 0,
      triggerEvent: "scroll",
      displayEffect: "show",
      viewportElement: globalWindow
    };

    if (config) {
      jQ.extend(preferences, config);
    }

    // Process a single scroll event for all items, not one per item.
    var targetItems = this;
    if ("scroll" === preferences.triggerEvent) {
      jQ(preferences.viewportElement).bind("scroll", function(evt) {
        var checkCount = 0;

        for (var idx = 0; idx < targetItems.length; idx++) {
          var currentSubject = targetItems[idx];
          var jQSubject = jQ(currentSubject);
          if (preferences.omitHidden && !jQSubject.is(":visible")) continue;
          if (
            jQ.aboveViewportTop(currentSubject, preferences) ||
            jQ.leftOfViewportStart(currentSubject, preferences)
          ) {
            /* Element is currently out of view to the top or left. */
          } else if (
            !jQ.belowViewportBottom(currentSubject, preferences) &&
            !jQ.rightOfViewportEnd(currentSubject, preferences)
          ) {
            jQSubject.trigger("appear");
          } else {
            if (checkCount++ > preferences.retryCap) {
              return false; // Exceeded maximum checks for out-of-view items.
            }
          }
        }
      });
    }

    for (var idx = 0; idx < this.length; idx++) {
      var currentItem = this[idx];
      var jQCurrentItem = jQ(currentItem);

      currentItem.isLoaded = false; // Mark content as not yet rendered.

      // When the 'appear' event fires, load the actual content.
      jQ(currentItem).one("appear", function() {
        if (!this.isLoaded) {
          jQ("<img />")
            .bind("load", function() {
              jQ(currentItem)
                .hide()
                .attr("src", jQ(currentItem).data("initialSource"))
                [preferences.displayEffect](preferences.transitionSpeed);
              currentItem.isLoaded = true;
            })
            .attr("src", jQ(currentItem).data("initialSource"));
        }
      });

      // For non-scroll events, bind directly to trigger 'appear'.
      if ("scroll" !== preferences.triggerEvent) {
        jQ(currentItem).bind(preferences.triggerEvent, function(evt) {
          if (!currentItem.isLoaded) {
            jQ(currentItem).trigger("appear");
          }
        });
      }
    }

    // Initiate an immediate check for visible items.
    jQ(preferences.viewportElement).trigger(preferences.triggerEvent);

    return this;
  };

  /* Helper utilities in the JQuery namespace. */
  /* Usage: jQ.belowViewportBottom(elementRef, {viewMargin : 100, viewportElement : globalWindow}) */

  jQ.belowViewportBottom = function(elemRef, preferences) {
    if (
      preferences.viewportElement === undefined ||
      preferences.viewportElement === globalWindow
    ) {
      var lowerBoundary =
        jQ(globalWindow).height() + jQ(globalWindow).scrollTop();
    } else {
      var lowerBoundary =
        jQ(preferences.viewportElement).offset().top +
        jQ(preferences.viewportElement).height();
    }
    return lowerBoundary <= jQ(elemRef).offset().top - preferences.viewMargin;
  };

  jQ.rightOfViewportEnd = function(elemRef, preferences) {
    if (
      preferences.viewportElement === undefined ||
      preferences.viewportElement === globalWindow
    ) {
      var rightBoundary =
        jQ(globalWindow).width() + jQ(globalWindow).scrollLeft();
    } else {
      var rightBoundary =
        jQ(preferences.viewportElement).offset().left +
        jQ(preferences.viewportElement).width();
    }
    return rightBoundary <= jQ(elemRef).offset().left - preferences.viewMargin;
  };

  jQ.aboveViewportTop = function(elemRef, preferences) {
    if (
      preferences.viewportElement === undefined ||
      preferences.viewportElement === globalWindow
    ) {
      var upperBoundary = jQ(globalWindow).scrollTop();
    } else {
      var upperBoundary = jQ(preferences.viewportElement).offset().top;
    }
    return (
      upperBoundary >=
      jQ(elemRef).offset().top + preferences.viewMargin + jQ(elemRef).height()
    );
  };

  jQ.leftOfViewportStart = function(elemRef, preferences) {
    if (
      preferences.viewportElement === undefined ||
      preferences.viewportElement === globalWindow
    ) {
      var leftBoundary = jQ(globalWindow).scrollLeft();
    } else {
      var leftBoundary = jQ(preferences.viewportElement).offset().left;
    }
    return (
      leftBoundary >=
      jQ(elemRef).offset().left + preferences.viewMargin + jQ(elemRef).width()
    );
  };

  /* Custom selectors for convenient use. */
  /* Example: jQ("img:past-lower-edge").doSomething() */

  jQ.extend(jQ.expr[":"], {
    "past-lower-edge": "jQ.belowViewportBottom(elemRef, {viewMargin : 0, viewportElement: globalWindow})",
    "above-upper-edge": "!jQ.belowViewportBottom(elemRef, {viewMargin : 0, viewportElement: globalWindow})",
    "past-right-edge": "jQ.rightOfViewportEnd(elemRef, {viewMargin : 0, viewportElement: globalWindow})",
    "before-left-edge": "!jQ.rightOfViewportEnd(elemRef, {viewMargin : 0, viewportElement: globalWindow})"
  });
})(JQueryLib);