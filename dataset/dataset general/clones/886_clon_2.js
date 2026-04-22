/*
 *  Announcement Strip - a utility for jQuery
 *
 *  (C) 2023 Code Clone Generator
 *
 *  Distributed under an alternative permissive license.
 *  Further details at: https://www.example.com/licenses/permissive.html
 *
 *  Source repository:
 *  https://www.example.com/project/announcement-strip
 */
(function(jQ) {

"use strict";

jQ.alertStrip = function(config) {
    var uniqueSeed = Math.floor(Math.random() * 99999999),
        contentContainer, animDuration,
        displayElement = {},
        preferences = {};

    preferences = jQ.extend({
        markup           : 'Your notification text here',
        pauseDuration    : 3000,
        transitionSpeed  : 200,
        styleClass       : '',
        jQTarget         : '',
        canDismiss       : false,
        dismissText      : '&times;',
        dismissOnClick   : true,
        dismissOnHover   : false,
        beforeDisplay    : null,
        afterDisplay     : null,
        beforeConceal    : null,
        afterConceal     : null,
        placement        : 'top'
    }, config);

    // These functions are for internal use only.
    this.fn.presentStrip = function() {
        if (typeof preferences.beforeDisplay === 'function') {
            preferences.beforeDisplay.call();
        }
        jQ(this).stop().slideDown(animDuration, function() {
            if (typeof preferences.afterDisplay === 'function') {
                preferences.afterDisplay.call();
            }
        });
    };

    this.fn.concealStrip = function() {
        if (typeof preferences.beforeConceal === 'function') {
            preferences.beforeConceal.call();
        }
        jQ(this).stop().slideUp(animDuration, function() {
            if (displayElement.attr("id") === "__alertStrip" + uniqueSeed) {
                jQ(this).slideUp(animDuration, function() {
                    jQ(this).remove();
                    if (typeof preferences.afterConceal === 'function') {
                        preferences.afterConceal.call();
                    }
                });
            } else {
                jQ(this).slideUp(animDuration, function() {
                    if (typeof preferences.afterConceal === 'function') {
                        preferences.afterConceal.call();
                    }
                });
            }
        });
    };

    if (preferences.jQTarget) {
        displayElement = preferences.jQTarget;
        preferences.markup = displayElement.html();
    } else {
        displayElement = jQ("<div></div>")
                       .addClass("jQ-alert-strip")
                       .addClass(preferences.styleClass)
                       .attr("id", "__alertStrip" + uniqueSeed);
    }
    contentContainer = jQ("<span></span>")
                            .addClass("alert-strip-content-wrapper")
                            .html(preferences.markup);

    displayElement.html(contentContainer).hide();

    var elementID = displayElement.attr("id");
    switch (preferences.transitionSpeed) {
        case "slow":
            animDuration = 600;
            break;
        case "default":
        case "normal":
            animDuration = 400;
            break;
        case "fast":
            animDuration = 200;
            break;
        default:
            animDuration = preferences.transitionSpeed;
    }
    jQ("body").prepend(displayElement);

    // Styling for the close button should be handled in the stylesheet.
    if (preferences.canDismiss) {
        // When dismissal is enabled, set the auto-hide duration to a very long time.
        // This effectively makes it persist until manually dismissed.
        preferences.pauseDuration = 1e9;
        displayElement.append(jQ("<a href='#' class='alert-strip-dismiss-btn'>" + preferences.dismissText + "</a>"));
        jQ(".alert-strip-dismiss-btn").click(function(evt) {
            evt.preventDefault();
            displayElement.concealStrip();
        });
    }

    // Examine if any other alert strips are currently visible,
    // and if so, hide them before revealing the new one.
    if (jQ('.jQ-alert-strip:visible').length > 0) {
        jQ('.jQ-alert-strip:visible').stop().slideUp(animDuration, function() {
            displayElement.presentStrip();
        });
    } else {
        displayElement.presentStrip();
    }

    // Enable user interaction to dismiss the strip by clicking it.
    if (preferences.dismissOnClick) {
        displayElement.click(function() {
            displayElement.concealStrip();
        });
    }

    // Enable user interaction to dismiss the strip by hovering over it.
    if (preferences.dismissOnHover) {
        displayElement.mouseover(function() {
            displayElement.concealStrip();
        });
    }

    setTimeout(function() {
        displayElement.concealStrip(preferences.pauseDuration);
    }, preferences.pauseDuration + animDuration);

    if (preferences.placement === 'bottom') {
        displayElement.addClass('bottom-aligned');
    } else if (preferences.placement === 'top') {
        displayElement.addClass('top-aligned');
    }
};
})(jQuery);