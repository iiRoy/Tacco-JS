(function(J$) {
    var ContentGlider = function(mainDisplay, navSection, configurationOptions) {
        var NAVIGATE_LEFT_KEY = 'leftward';
        var NAVIGATE_RIGHT_KEY = 'rightward';
        var NAV_POSITION_KEY = 'homebase';
        var REVERT_MOVEMENT_KEY = 'undo';

        var gliderInstance = this;
        var mainContainer = J$(mainDisplay);
        var navigationArea = J$(navSection);

        var baseOptions = {
            motionDuration: 150,
            motionCurve: 'ease-out',
            minimumDragLength: 20,
            rightButtonSelector: '#stepRight',
            leftButtonSelector: '#stepLeft',
        };

        gliderInstance.instanceSettings = {};

        var currentGliderState = {
            activeTouchCount: 0,
            initialTouchX: 0,
            initialTouchY: 0,
            horizontalDisplacement: 0,
            containerStartOffset: 0,
            lastTouchX: 0,
            lastTouchY: 0,
            isVerticalAxisScroll: undefined,
            panelCollection: []
        };

        var initiateDisplay = function() {
            gliderInstance.instanceSettings = J$.extend({}, baseOptions, configurationOptions || {});
            
            Object.assign(currentGliderState, {
                activeTouchCount: 0,
                initialTouchX: 0,
                initialTouchY: 0,
                horizontalDisplacement: 0,
                containerStartOffset: 0,
                lastTouchX: 0,
                lastTouchY: 0,
                isVerticalAxisScroll: undefined
            });

            if (window.innerWidth > 480) {
                configureMultiSections();
            } else {
                configureSingleSection();
            }
        };

        var configureMultiSections = function() {
            var SECTION_CLASS_NAME = "content-section";
            var sectionWidth = Math.min(800, window.innerWidth);
            var totalWidth = 0;
            var linkActionMap = {};
            
            var navigationLinks = navigationArea.find("ul a");
            var sectionCreationPromises = [];

            navigationLinks.each(function(idx) {
                var linkReference = J$(this);
                var sectionIdentifier = SECTION_CLASS_NAME + idx;
                var currentSectionElement = J$("<div class='" + SECTION_CLASS_NAME + "' id='" + sectionIdentifier + "'></div>")
                    .appendTo(mainContainer)
                    .css({
                        "width": sectionWidth,
                        "left": totalWidth
                    });
                
                currentGliderState.panelCollection.push({
                    element: currentSectionElement,
                    width: currentSectionElement.outerWidth(),
                    positionLeft: totalWidth,
                    id: '#' + sectionIdentifier
                });

                totalWidth += currentSectionElement.outerWidth();
                var pageUrl = linkReference.attr('href');

                var fetchPromise = fetch(pageUrl)
                    .then(response => response.text())
                    .then(htmlContent => {
                        var parsedHtml = J$(htmlContent);
                        currentSectionElement.html(parsedHtml);
                        reassignLinkActions(parsedHtml, linkActionMap);
                    })
                    .catch(error => console.error('Failed to load content:', error));
                
                sectionCreationPromises.push(fetchPromise);

                var clickAct = function(eventObject) {
                    eventObject.preventDefault();
                    adjustDisplay('#' + sectionIdentifier);
                };
                linkReference.on({ 'click': clickAct });
                linkActionMap[pageUrl] = clickAct;
            });
            
            linkActionMap["index.html"] = function(eventObject) {
                eventObject.preventDefault();
                adjustDisplay(NAV_POSITION_KEY);
            };

            mainContainer.css("width", totalWidth);
            
            Promise.all(sectionCreationPromises).finally(() => {
                adjustDisplay(NAV_POSITION_KEY);
                bindInteractionHandlers(mainContainer);
            });
        };

        var configureSingleSection = function() {
            var SECTION_CLASS_NAME = "content-section-single";
            var totalWidth = 0;
            var linkActionMap = {};
            var singleSectionElement;

            singleSectionElement = J$("<div class='" + SECTION_CLASS_NAME + "' id='" + SECTION_CLASS_NAME + "'>")
                .appendTo(mainContainer)
                .css({
                    "width": J$(document).width(),
                    "left": 0,
                    "height": J$(document).height()
                });
            totalWidth += singleSectionElement.outerWidth();

            currentGliderState.panelCollection.push({
                element: singleSectionElement,
                width: singleSectionElement.outerWidth(),
                positionLeft: 0,
                id: '#' + SECTION_CLASS_NAME
            });

            var navigationLinks = navigationArea.find("ul a");
            navigationLinks.each(function(idx) {
                var linkReference = J$(this);
                var pageUrl = linkReference.attr('href');

                linkActionMap["index.html"] = function(eventObject) {
                    eventObject.preventDefault();
                    adjustDisplay(NAV_POSITION_KEY);
                };

                var clickAct = function(eventObject) {
                    eventObject.preventDefault();
                    singleSectionElement.html("<p>Loading...</p>");
                    fetch(pageUrl)
                        .then(response => response.text())
                        .then(htmlContent => {
                            singleSectionElement.scrollTop(0);
                            var parsedHtml = J$(htmlContent);
                            singleSectionElement.html(parsedHtml);
                            reassignLinkActions(parsedHtml, linkActionMap);
                            if (navigator.userAgent.match(/Android/i)) {
                                window.scrollTo(0, 1);
                            }
                        })
                        .catch(error => console.error('Failed to load content:', error));
                    adjustDisplay('#' + SECTION_CLASS_NAME);
                };
                linkReference.on({ 'click': clickAct });
                linkActionMap[pageUrl] = clickAct;
            });

            mainContainer.css("width", totalWidth);
            adjustDisplay(NAV_POSITION_KEY);
            bindInteractionHandlers(mainContainer);

            var firstLinkHref = J$(navigationLinks[0]).attr('href');
            fetch(firstLinkHref)
                .then(response => response.text())
                .then(htmlContent => {
                    var parsedHtml = J$(htmlContent);
                    singleSectionElement.html(parsedHtml);
                    reassignLinkActions(parsedHtml, linkActionMap);
                    adjustDisplay('#' + SECTION_CLASS_NAME);
                    if (navigator.userAgent.match(/Android/i)) {
                        window.scrollTo(0, 1);
                    }
                })
                .catch(error => console.error('Failed to load initial content:', error));
        };

        var bindInteractionHandlers = function(targetElement) {
            var touchEvents = {
                'touchstart': function(evt) { handleTouchBegin(evt.originalEvent); },
                'touchmove': function(evt) { handleTouchDrag(evt.originalEvent); },
                'touchcancel': function(evt) { handleTouchInterruption(evt.originalEvent); },
                'touchend': function(evt) { handleTouchRelease(evt.originalEvent); }
            };

            var msPointerEvents = {
                'MSPointerCancel': function(evt) { handleTouchInterruption(evt.originalEvent); },
                'MSPointerDown': function(evt) { handleTouchBegin(evt.originalEvent); },
                'MSPointerMove': function(evt) { handleTouchDrag(evt.originalEvent); },
                'MSPointerOut': function(evt) { handleTouchInterruption(evt.originalEvent); },
                'MSPointerUp': function(evt) { handleTouchRelease(evt.originalEvent); }
            };

            targetElement.on(touchEvents);
            if (window.navigator.msPointerEnabled) {
                targetElement.on(msPointerEvents);
            }
        };

        var handleTouchBegin = function(interactionEvent) {
            currentGliderState.activeTouchCount = interactionEvent.touches.length;

            if (currentGliderState.activeTouchCount === 1) {
                currentGliderState.isVerticalAxisScroll = undefined;
                currentGliderState.horizontalDisplacement = 0;
                currentGliderState.initialTouchX = interactionEvent.touches[0].pageX;
                currentGliderState.initialTouchY = interactionEvent.touches[0].pageY;
                currentGliderState.containerStartOffset = parseFloat(mainContainer.css('transform').split(',')[4] || 0);
            } else {
                handleTouchInterruption(interactionEvent);
            }
        };

        var handleTouchDrag = function(interactionEvent) {
            if (currentGliderState.activeTouchCount === 1) {
                currentGliderState.lastTouchX = interactionEvent.touches[0].pageX;
                currentGliderState.lastTouchY = interactionEvent.touches[0].pageY;

                currentGliderState.horizontalDisplacement = currentGliderState.lastTouchX - currentGliderState.initialTouchX;
                var verticalDisplacement = currentGliderState.lastTouchY - currentGliderState.initialTouchY;

                if (typeof currentGliderState.isVerticalAxisScroll === 'undefined') {
                    currentGliderState.isVerticalAxisScroll = !!(currentGliderState.isVerticalAxisScroll || Math.abs(currentGliderState.horizontalDisplacement) < Math.abs(verticalDisplacement));
                }

                if (!currentGliderState.isVerticalAxisScroll) {
                    interactionEvent.preventDefault();
                    var newXOffset = currentGliderState.containerStartOffset + currentGliderState.horizontalDisplacement;
                    mainContainer.css('transform', 'translateX(' + newXOffset + 'px)');
                    mainContainer.css('transition', 'none');
                }
            } else {
                handleTouchInterruption(interactionEvent);
            }
        };

        var handleTouchRelease = function(interactionEvent) {
            if (!currentGliderState.isVerticalAxisScroll && currentGliderState.horizontalDisplacement !== 0 && currentGliderState.activeTouchCount === 1 && currentGliderState.lastTouchX !== 0) {
                if (Math.abs(currentGliderState.horizontalDisplacement) > gliderInstance.instanceSettings.minimumDragLength) {
                    if (currentGliderState.horizontalDisplacement > 0) {
                        adjustDisplay(NAVIGATE_LEFT_KEY);
                    } else {
                        adjustDisplay(NAVIGATE_RIGHT_KEY);
                    }
                } else {
                    adjustDisplay(REVERT_MOVEMENT_KEY);
                }
            } else {
                handleTouchInterruption(interactionEvent);
            }
        };

        var handleTouchInterruption = function(interactionEvent) {
            var currentTransformX = parseFloat(mainContainer.css('transform').split(',')[4] || 0);

            if (currentGliderState.containerStartOffset !== currentTransformX) {
                adjustDisplay(REVERT_MOVEMENT_KEY);
            }

            currentGliderState.lastTouchX = 0;
            currentGliderState.lastTouchY = 0;
            currentGliderState.activeTouchCount = 0;
        };

        var adjustDisplay = function(actionDirective) {
            var targetOffset = 0;
            var currentPanels = currentGliderState.panelCollection;

            var currentLeftOffset = parseFloat(mainContainer.css('transform').split(',')[4] || 0);

            var getClosestPanel = (offset, panels) => {
                return panels.reduce((closest, panel, index) => {
                    var distanceToViewportLeft = Math.abs(panel.positionLeft + offset);
                    if (distanceToViewportLeft < closest.distance) {
                        return { panel: panel, index: index, distance: distanceToViewportLeft };
                    }
                    return closest;
                }, { panel: panels[0], index: 0, distance: Infinity });
            };

            var closestPanelInfo = getClosestPanel(currentLeftOffset, currentPanels);
            var currentPanelIndex = closestPanelInfo.index;
            var currentPanel = currentPanels[currentPanelIndex];
            var nextPanel = currentPanels[currentPanelIndex + 1];
            var previousPanel = currentPanels[currentPanelIndex - 1];

            switch (actionDirective) {
                case NAVIGATE_LEFT_KEY:
                    if (previousPanel) {
                        targetOffset = -previousPanel.positionLeft;
                    } else {
                        targetOffset = navigationArea.outerWidth() + navigationArea.position().left;
                    }
                    break;
                case NAVIGATE_RIGHT_KEY:
                    if (nextPanel) {
                        targetOffset = -nextPanel.positionLeft;
                    } else {
                        targetOffset = -currentPanel.positionLeft;
                    }
                    break;
                case NAV_POSITION_KEY:
                    targetOffset = navigationArea.outerWidth() + navigationArea.position().left;
                    break;
                case REVERT_MOVEMENT_KEY:
                    targetOffset = currentGliderState.containerStartOffset;
                    break;
                default:
                    var specificPanel = currentPanels.find(p => p.id === actionDirective);
                    if (specificPanel) {
                        targetOffset = -specificPanel.positionLeft;
                    }
                    break;
            }
            applyOffsetAnimation(mainContainer, targetOffset);
        };

        var applyOffsetAnimation = function(layerElement, finalOffset) {
            layerElement.css({
                'transition': 'transform ' + gliderInstance.instanceSettings.motionDuration + 'ms ' + gliderInstance.instanceSettings.motionCurve,
                'transform': 'translateX(' + finalOffset + 'px)'
            });

            var transitionEndHandler = function() {
                layerElement.css('transition', 'none');
                currentGliderState.containerStartOffset = finalOffset;
                layerElement.off('transitionend', transitionEndHandler);
            };
            layerElement.on('transitionend', transitionEndHandler);
        };

        var reassignLinkActions = function(domFragment, actionMap) {
            Object.keys(actionMap).forEach(function(linkUrl) {
                var matchingLinks = J$(domFragment).find('a[href="' + linkUrl + '"]');
                if (matchingLinks.length) {
                    matchingLinks.each(function() {
                        J$(this).on({ 'click': actionMap[linkUrl] });
                    });
                }
            });
        };

        initiateDisplay();
    };

    J$.fn.gliderControl = function(fixedNav, customOptions) {
        return this.each(function() {
            var targetElement = J$(this);

            if (targetElement.data('gliderControl')) return;

            var activeGlider = new ContentGlider(this, fixedNav, customOptions);
            targetElement.data('gliderControl', activeGlider);
        });
    };
})(jQuery);