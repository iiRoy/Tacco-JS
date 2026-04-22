/*
 *  Module:     spotlight - A jQuery content presentation module
 *  Creator:    E.K. Dev.
 *  Revision:   0.1.2b
 *  Web:        http://example.com/spotlight-js
 *  Permit:     Licensed under MIT and GNU GPL.
 *
 *  spotlight Configuration Parameters
 *
 *  animateHaltText :     Should 'Stop' text animate when pausing? [boolean, default true]
 *  startAutomatically :  Initiate playback immediately? [boolean, default true]
 *  transitionDuration :  Time for element transition [integer, milliseconds, default 600]
 *  showNavigationButtons : Display control buttons (Play/Stop, Back, Forward) [boolean, default true]
 *  buttonLabels :        Custom text for control buttons [object, 'start', 'stop', 'back', 'forward' properties]
 *  extraClassName :      Additional CSS class for the .spotlight-display container [string]
 *  displayEffect :       Transition style [string: 'fade', 'slideLeft', 'noEffect', default 'fade']
 *  pauseOnHover :        Temporarily halt on mouseover? [boolean, default true]
 *  showItemLinks :       Generate & show numbered links to each item? [boolean, default true]
 *  displayInterval :     Duration each item is shown [integer, milliseconds, default 3000]
 *
 */

(function(jQ) {


    jQ.fn.spotlight = function(params) {

        // Establish base configuration settings
        var opts = {
            animateHaltText : true,
            startAutomatically : true,
            transitionDuration : 600,
            showNavigationButtons : true,
            buttonLabels : {
                start :       'Start',
                stop :        'Stop',
                forward :     'Forward',
                backward :    'Backward'
            },
            displayEffect : 'fade',
            pauseOnHover : true,
            showItemLinks : true,
            displayInterval : 3000
        };

        // Overlay custom parameters onto the base options, deeply merging
        if (params) jQ.extend(true, opts, params);

        // Validate timing: ensure display duration is sufficiently longer than transition
        if (opts.displayInterval < (opts.transitionDuration + 20)) {
            alert('spotlight: The displayInterval should be at least 20ms longer than transitionDuration for proper animation synchronization.');
            return this;
        };

        // Process each selected element to create a spotlight instance
        this.each(function(idx) {

            // Declare local variables for the current instance
            var $container = jQ(this);
            var mediaItems = jQ(this).children().remove();
            var intervalID = '';
            var currentPos = 0;
            var cachedImages = [];
            var instanceCount = jQ('.spotlight-display').length + 1;
            var uniqueIdentifier = 'spotlight-instance-' + instanceCount;
            var customClass = opts.extraClassName !== undefined ? opts.extraClassName : '';


            // Configure and wrap the main content area
            $container.css('position', 'relative').wrap('<div class="spotlight-display ' + uniqueIdentifier + '" />');
            var $wrapper = jQ('.' + uniqueIdentifier);
            $wrapper.css('position', 'relative').addClass(customClass);

            // Append the first media item to the wrapper for initial display
            jQ(mediaItems[0]).clone().appendTo($container);

            // Initiate preloading of images for smoother transitions
            cacheVisuals();

            // Conditionally add navigation controls
            if (opts.showNavigationButtons) {
                createNavigation();
                if (opts.startAutomatically === false) {
                    jQ('.' + uniqueIdentifier + '-start-btn').addClass(uniqueIdentifier + '-stopped spotlight-stopped').text(opts.buttonLabels.start);
                };
            };

            // Conditionally add links to individual media items
            if (opts.showItemLinks) {
                createItemLinks();
                jQ('.' + uniqueIdentifier + '-links a').eq(0).addClass(uniqueIdentifier + '-current spotlight-current');
            };

            // Implement pause functionality on mouse hover
            if (opts.pauseOnHover) {
                $container.hover(
                    function() {
                        if (isActivelyRunning()) haltRotation('hover');
                    },
                    function() {
                        if (isActivelyRunning()) beginRotation('hover');
                    }
                );
            };

            // Initialize automatic rotation if enabled and multiple items exist
            if (opts.startAutomatically && mediaItems.length > 1) {
                intervalID = setInterval(function() {
                    beginRotation();
                }, opts.displayInterval);
            };

            // Display a message if no child elements are found
            if (mediaItems.length < 1) {
                jQ('.' + uniqueIdentifier).append('<p>To function correctly, the spotlight container must contain child elements.</p>');
            };


            // Core function for transitioning between media items
            function shiftToDisplay(itemsCollection, targetIndex) {

                var prevPos = currentPos;
                if ((currentPos >= itemsCollection.length) || (targetIndex >= itemsCollection.length)) {
                    currentPos = 0;
                    var endToBeginning = true;
                } else if ((currentPos < 0) || (targetIndex < 0)) {
                    currentPos = itemsCollection.length - 1;
                    var beginningToEnd = true;
                } else {
                    currentPos = targetIndex;
                }


                if (opts.displayEffect === 'slideLeft') {
                    var newPanelDirection, oldPanelDirection;

                    // Determine slide direction based on current and target positions
                    function determinePanelDirection(directionHint) {
                        newPanelDirection = directionHint === 'right' ? 'left' : 'right';
                        oldPanelDirection = directionHint === 'left' ? 'left' : 'right';
                    };


                    currentPos >= prevPos ? determinePanelDirection('left') : determinePanelDirection('right');

                    jQ(itemsCollection[currentPos]).clone().appendTo($container).glideElement({
                        direction: newPanelDirection,
                        changeSpeed: opts.transitionDuration
                    });
                    if ($container.children().length > 1) {
                        $container.children().eq(0).css('position', 'absolute').glideElement({
                            direction: oldPanelDirection,
                            showHide: 'hide',
                            changeSpeed: opts.transitionDuration
                        }, function() {
                            jQ(this).remove();
                        });
                    };
                } else if (opts.displayEffect === 'fade') {
                    jQ(itemsCollection[currentPos]).clone().appendTo($container).hide().fadeIn(opts.transitionDuration, function() {
                        if (jQ.browser.msie) this.style.removeAttribute('filter');
                    });
                    if ($container.children().length > 1) {
                        $container.children().eq(0).css('position', 'absolute').fadeOut(opts.transitionDuration, function() {
                            jQ(this).remove();
                        });
                    };
                } else if (opts.displayEffect === 'noEffect') {
                    jQ(itemsCollection[currentPos]).clone().appendTo($container);
                    if ($container.children().length > 1) {
                        $container.children().eq(0).css('position', 'absolute').remove();
                    };
                };

                // Update the active state for item links
                if (opts.showItemLinks) {
                    jQ('.' + uniqueIdentifier + '-current').removeClass(uniqueIdentifier + '-current spotlight-current');
                    jQ('.' + uniqueIdentifier + '-links a').eq(currentPos).addClass(uniqueIdentifier + '-current spotlight-current');
                };
            };

            // Checks if the rotator is currently in 'play' mode
            function isActivelyRunning() {
                return jQ('.' + uniqueIdentifier + '-start-btn').hasClass('spotlight-stopped') ? false : true;
            };

            // Resumes or starts the automatic item rotation
            function beginRotation(sourceTrigger) {
                if (!isTransitioning()) {
                    currentPos++;
                    shiftToDisplay(mediaItems, currentPos);
                    if (sourceTrigger === 'hover' || !isActivelyRunning()) {
                        intervalID = setInterval(function() {
                            beginRotation();
                        }, opts.displayInterval);
                    }
                    if (!isActivelyRunning()) {
                        jQ('.' + uniqueIdentifier + '-start-btn').text(opts.buttonLabels.stop).removeClass('spotlight-stopped ' + uniqueIdentifier + '-stopped');
                    }
                };
            };

            // Halts the automatic item rotation
            function haltRotation(sourceTrigger) {
                clearInterval(intervalID);
                if (!sourceTrigger || sourceTrigger === 'startBtn') jQ('.' + uniqueIdentifier + '-start-btn').text(opts.buttonLabels.start).addClass('spotlight-stopped ' + uniqueIdentifier + '-stopped');
                if (opts.animateHaltText && sourceTrigger === 'startBtn') {
                    jQ('<p class="' + uniqueIdentifier + '-halt-text spotlight-halt-text">' + opts.buttonLabels.stop + '</p>').css({
                        fontSize: '62%',
                        textAlign: 'center',
                        position: 'absolute',
                        top: '40%',
                        lineHeight: '100%',
                        width: '100%'
                    }).appendTo($wrapper).addClass(uniqueIdentifier + 'haltText').animate({
                        fontSize: '600%',
                        top: '30%',
                        opacity: 0
                    }, {
                        duration: 500,
                        complete: function() {
                            jQ(this).remove();
                        }
                    });
                }
            };

            // Navigates to the subsequent item in the sequence
            function advanceItem() {
                jumpToItemAndHalt(currentPos + 1);
            };

            // Navigates to the preceding item in the sequence
            function recedeItem() {
                jumpToItemAndHalt(currentPos - 1);
            };

            // Determines if an item transition is currently in progress
            function isTransitioning() {
                return $container.children().length > 1 ? true : false;
            };

            // Jumps to a specific item and pauses rotation
            function jumpToItemAndHalt(targetIndex) {
                $container.children().stop(true, true);
                if ((currentPos !== targetIndex) || ((currentPos === targetIndex) && isTransitioning())) {
                    if (isTransitioning()) $container.children().eq(0).remove();
                    shiftToDisplay(mediaItems, targetIndex);
                    haltRotation();
                };
            };

            // Loads images into memory to prevent flickering
            function cacheVisuals() {
                jQ(mediaItems).each(function(idx) {
                    jQ(this).find('img').each(function(imgIdx) {
                        cachedImages[imgIdx] = jQ('<img>').attr('src', jQ(this).attr('src'));
                    });
                });
            };

            // Generates and appends navigation controls (play/pause, prev, next)
            function createNavigation() {
                $wrapper.append('<p class="spotlight-controls ' + uniqueIdentifier + '-controls"><a class="spotlight-start-btn ' + uniqueIdentifier + '-start-btn" href="#void">' + opts.buttonLabels.stop + '</a> <a class="spotlight-prev-btn ' + uniqueIdentifier + '-prev-btn" href="#void">' + opts.buttonLabels.backward + '</a> <a class="spotlight-next-btn ' + uniqueIdentifier + '-next-btn" href="#void">' + opts.buttonLabels.forward + '</a></p>');
                jQ('.' + uniqueIdentifier + '-controls a').each(function() {
                    if (jQ(this).hasClass('spotlight-start-btn')) jQ(this).click(function() {
                        isActivelyRunning() ? haltRotation('startBtn') : beginRotation();
                        return false;
                    });
                    if (jQ(this).hasClass('spotlight-prev-btn')) jQ(this).click(function() {
                        recedeItem();
                        return false;
                    });
                    if (jQ(this).hasClass('spotlight-next-btn')) jQ(this).click(function() {
                        advanceItem();
                        return false;
                    });

                });
            };

            // Generates and appends numeric links to each slide
            function createItemLinks() {
                $wrapper.append('<p class="spotlight-links ' + uniqueIdentifier + '-links"></p>');
                jQ.each(mediaItems, function(idx, itemValue) {
                    var anchorText = jQ(this).attr('title') || idx + 1;
                    jQ('<a class="spotlight-link-' + idx + ' ' + uniqueIdentifier + '-link-' + idx + '" href="#void">' + anchorText + '</a>').bind('click', {
                        index: idx
                    }, function(eventObj) {
                        jumpToItemAndHalt(eventObj.data.index);
                        return false;
                    }).appendTo('.' + uniqueIdentifier + '-links');
                });
            };


            // End of .each iteration for spotlight instances
        });

        // Return the jQuery object for chaining
        return this;

        // End of spotlight plugin definition
    };

    // End of main plugin closure
})(jQuery);




(function(jQ) {

    jQ.fn.glideElement = function(params, callbackFunction) {

        // Default settings for the glide effect
        var opts = {
            direction : 'left',
            showHide : 'show',
            transitionDuration : 600
        };

        // Merge provided parameters with default settings
        if (params) jQ.extend(opts, params);

        // Iterate over each selected element
        this.each(function(idx) {
            jQ(this).css({
                left: 'auto',
                right: 'auto',
                top: 'auto',
                bottom: 'auto'
            });
            var dimension = (opts.direction === 'left') || (opts.direction === 'right') ? jQ(this).outerWidth() : jQ(this).outerHeight();
            var initialStyle = {};
            initialStyle['position'] = jQ(this).css('position') === 'static' ? 'relative' : jQ(this).css('position');
            initialStyle[opts.direction] = (opts.showHide === 'show') ? '-' + dimension + 'px' : 0;
            var finalStyle = {};
            finalStyle[opts.direction] = opts.showHide === 'show' ? 0 : '-' + dimension + 'px';
            jQ(this).css(initialStyle).animate(finalStyle, opts.transitionDuration, callbackFunction);
            // End of .each for glideElement
        });

        // Allow for jQuery method chaining
        return this;

        // End of glideElement plugin
    };

    // End of secondary plugin closure
})(jQuery);