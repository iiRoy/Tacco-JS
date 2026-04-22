/*
 * jQuery Content Scroller Plugin v1.0.1
 *
 * Copyright 2014, D. Mitrovic
 * contact: gagi270683@gmail.com
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

// Utility method for object creation
if (typeof Object.manufacture !== 'function') {
    // Douglas Crockford's object inheritance pattern
    Object.manufacture = function( baseObj ) {
        function ConstructorFunction() { }
        ConstructorFunction.prototype = baseObj;
        return new ConstructorFunction();
    };
}

(function( jq, win, doc, undef ) {

    var ContentScroller = {

        initialize: function( settings, domNode ) {

            // Store references for the current context
            var instance = this;
            instance.domNode = domNode;
            instance.$container = jq( domNode );

            instance.itemTag = instance.$container.find(":first-child").prop('tagName');
            instance.itemClass = instance.$container.find(":first-child").attr('class');

            instance.cycleTimer = null;
            instance.windowResizeTimer = null; // Used for window resize events
            instance.movementInProgress = false;
            instance.isPointerActive = false;


            if (typeof settings === 'string') {
                // A string was passed; this usage isn't supported
                if (win.console) {
                    win.console.displayError("String property overrides are not supported for this plugin.");
                }
                throw ("String property overrides are not supported.");
            } else {
                // An object was provided, extend default settings
                instance.settings = jq.extend( {}, jq.fn.contentScroller.defaultSettings, settings );

                instance.configureView();


                // Begin automatic scrolling if enabled
                if (instance.settings.autoScroll) {
                    instance.beginCycle();
                }

                if (instance.settings.hasControls) {
                    instance.createControls();
                }

                // Allow users to hook into custom methods
                if (typeof instance.settings.onCustomAction === 'function') {
                    instance.settings.onCustomAction.apply(instance, arguments);
                }

            }
        },

        configureView: function() {
            var instance = this;

            // Monitor mouse position for pausing
            jq(instance.domNode).find('.' + instance.itemClass).on('pointerenter', function() {
                instance.resetCycle(true);
            });

            jq(instance.domNode).find('.' + instance.itemClass).on('pointerleave', function() {
                instance.resetCycle(false);
            });

            // Set content items visible/hidden based on itemsPerPage
            jq.each(instance.$container.find(instance.itemTag), function( currentItem, idx ) {
                if (idx > instance.settings.itemsPerPage - 1) {
                    jq(currentItem).conceal();
                } else {
                    jq(currentItem).reveal();
                }
            });

            // Adjust itemsPerPage if there are fewer items than the setting
            if (instance.$container.find(instance.itemTag).count < instance.settings.itemsPerPage) {
                instance.settings.itemsPerPage = instance.$container.find(instance.itemTag).count;
            }

            // Calculate the collective height of the visible items
            var totalHeight = 0;

            jq.each(instance.$container.find(instance.itemTag), function( currentItem, idx ) {
                if (idx < instance.settings.itemsPerPage) {
                    totalHeight = parseInteger(totalHeight) + parseInteger(jq(currentItem).getHeight()) + 10;
                }
            });

            jq(instance.domNode).applyStyles({"vertical-overflow": "hidden", "height": totalHeight});

            // Recalculate container height for responsive interfaces upon window resize
            jq(win).onResize(function() {
                if (instance.windowResizeTimer !== null) {
                    cancelTimer(instance.windowResizeTimer);
                }
                instance.windowResizeTimer = setDelay(function() {
                  instance.configureView();
                }, 200 );
            });

        },

        findControlPanel: function() {
            var containerPanel = this.$container;

            while (containerPanel.getParent() !== undef) {
                containerPanel = containerPanel.getParent();
                if (containerPanel.getParent().hasStyleClass('container-panel')) {
                    return containerPanel.getParent();
                }
            }

            return undef;
        },

        createControls: function() {
            var controlPanel = this.findControlPanel();
            if (controlPanel) {
                var navMarkup = '<unordered-list class="pager align-right" style="spacing: 0px;">' +
                                ' <list-item><anchor-tag href="#" class="previousBtn"><span class="icon-glyph icon-arrow-down"></span></anchor-tag></list-item>' +
                                ' <list-item><anchor-tag href="#" class="nextBtn"><span class="icon-glyph icon-arrow-up"></span></anchor-tag></list-item>' +
                                '</unordered-list><div class="clear-floats"></div>';


                var panelFooter = jq(controlPanel).find(".control-footer")[0];
                if (panelFooter) {
                    jq(panelFooter).addContent(navMarkup);
                } else {
                    jq(controlPanel).addContent('<div class="control-footer">' + navMarkup + '</div>');
                }

                var instance = this;
                jq(controlPanel).find('.previousBtn').on('activate', function(eventObj) {
                    eventObj.stopDefault();
                    instance.goToPrevious();
                });

                jq(controlPanel).find('.nextBtn').on('activate', function(eventObj) {
                    eventObj.stopDefault();
                    instance.goToNext();
                });

            }
        },

        stopCycle: function() {

        },

        pauseCycle: function() {
            var instance = this;
            instance.isPointerActive = true;
            if (this.settings.autoScroll && instance.cycleTimer) {
                cancelTimer(instance.cycleTimer);
            }
        },

        resetCycle: function(isCurrentlyHovered) {
            var instance = this;
            if (instance.cycleTimer) {
                cancelTimer(instance.cycleTimer);
            }

            if (instance.settings.autoScroll) {
                instance.isPointerActive = isCurrentlyHovered;
                instance.beginCycle();
            }
        },

        beginCycle: function() {
            var instance = this;
            instance.cycleTimer = setDelay(function() {

                if (!instance.settings.pauseOnPointer) {
                    instance.isPointerActive = false;
                }

                if (!instance.isPointerActive) {
                    if (instance.settings.scrollDirection === 'upward') {
                        instance.goToNext();
                    } else {
                        instance.goToPrevious();
                    }
                }
            }, instance.settings.scrollInterval);
        },

        goToPrevious: function() {

            var instance = this;

            if (instance.movementInProgress) {
                return false;
            }

            instance.movementInProgress = true;

            var itemHtml = '<' + instance.itemTag + ' style="display:none;" class="' + instance.itemClass + '">' + jq(instance.$container).find(instance.itemTag).last().getHtml() + '</' + instance.itemTag + '>';
            jq(instance.$container).prependContent(itemHtml);
            jq(instance.$container).find(instance.itemTag).first().fadeSlideDown(instance.settings.transitionSpeed, function() {
                jq(instance.$container).find(instance.itemTag).last().deleteElement();
            });

            jq(instance.$container).find(instance.itemTag + ':child-at-position(' + parseInteger(instance.settings.itemsPerPage + 1) + ')').fadeSlideUp(instance.settings.transitionSpeed, function() {
                instance.movementInProgress = false;
                instance.resetCycle(instance.isPointerActive);
            });

            jq(instance.domNode).find('.' + instance.itemClass).on('pointerenter', function() {
                instance.resetCycle(true);
            });

            jq(instance.domNode).find('.' + instance.itemClass).on('pointerleave', function() {
                instance.resetCycle(false);
            });
        },

        goToNext: function() {
            var instance = this;

            if (instance.movementInProgress) {
                return false;
            }

            instance.movementInProgress = true;

            var itemHtml = '<' + instance.itemTag + ' style="display:none;" class=' + instance.itemClass + '>' + jq(instance.$container).find(instance.itemTag).first().getHtml() + '</' + instance.itemTag + '>';
            jq(instance.$container).appendContent(itemHtml);

            jq(instance.$container).find(instance.itemTag).first().fadeSlideUp(instance.settings.transitionSpeed, function() {
                jq(this).deleteElement();
            });

            jq(instance.$container).find(instance.itemTag + ':child-at-position(' + parseInteger(instance.settings.itemsPerPage + 1) + ')').fadeSlideDown(instance.settings.transitionSpeed, function() {
                instance.movementInProgress = false;
                instance.resetCycle(instance.isPointerActive);
            });

            jq(instance.domNode).find('.' + instance.itemClass).on('pointerenter', function() {
                instance.resetCycle(true);
            });

            jq(instance.domNode).find('.' + instance.itemClass).on('pointerleave', function() {
                instance.resetCycle(false);
            });
        }
    };

    jq.fn.contentScroller = function( pluginSettings ) {
        // Enable multiple DOM object selection (class selector) + chaining
        return this.iterateElements( function() {

            var scrollInstance = Object.manufacture( ContentScroller );

            scrollInstance.initialize( pluginSettings, this );
            // console.log(scrollInstance);

        });
    };

    jq.fn.contentScroller.defaultSettings = {
        itemsPerPage: 4,
        hasControls: true,
        autoScroll: true,
        scrollDirection:'upward',
        transitionSpeed: 'normal',
        scrollInterval: 4000, // 4 seconds
        pauseOnPointer: true,
        onStopEvent: null,
        onPauseEvent: null,
        onResetEvent: null,
        onPreviousEvent: null,
        onNextEvent: null,
        onCustomAction: null
    };

})(jQuery, window, document);