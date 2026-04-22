var UIActivator = (function(win, doc) {
    var isTouchCapable = (typeof Touch === 'object');

    // Utility functions for native DOM manipulation, replacing jQuery
    var queryAll = function(selector, context) {
        return Array.prototype.slice.call((context || doc).querySelectorAll(selector));
    };

    var getElById = function(id) {
        return doc.getElementById(id);
    };

    var addEvtListener = function(element, type, handler, options) {
        if (element) element.addEventListener(type, handler, options);
    };

    var checkClass = function(element, className) {
        return element && element.classList.contains(className);
    };

    var addClassToElement = function(element, className) {
        if (element) element.classList.add(className);
    };

    var removeClassFromElement = function(element, className) {
        if (element) element.classList.remove(className);
    };

    var toggleClassOnElement = function(element, className) {
        if (element) element.classList.toggle(className);
    };

    var revealElement = function(element) {
        if (element) element.style.display = ''; // Revert to default display
    };

    var concealElement = function(element) {
        if (element) element.style.display = 'none';
    };

    var traverseToParent = function(element, tagName) {
        tagName = tagName.toUpperCase();
        while (element && element.tagName !== tagName) {
            element = element.parentNode;
        }
        return element;
    };

    // Collection of page enhancement routines
    var enhancementRoutines = {
        // Routine to wrap specific input elements for styling
        adjustInputWraps: function() {
            var targetInputs = queryAll('textarea, .input_full');
            if (targetInputs.length === 0) {
                return;
            }
            targetInputs.forEach(function(inputElement) {
                var newWrapper = doc.createElement('span');
                addClassToElement(newWrapper, 'input_full_wrap');
                inputElement.parentNode.insertBefore(newWrapper, inputElement);
                newWrapper.appendChild(inputElement);
            });
        },

        // Routine to polyfill placeholder functionality for older browsers
        polyfillPlaceholders: function() {
            var inputTestElement = doc.createElement('input');
            var nativePlaceholderSupported = (inputTestElement.placeholder !== undefined);

            var placeholderElements = queryAll('[data-alt-ph]');
            if (placeholderElements.length === 0 || nativePlaceholderSupported) {
                return;
            }

            placeholderElements.forEach(function(element) {
                var storedText = element.getAttribute('data-alt-ph');
                if (!element.value) {
                    element.value = storedText;
                }

                addEvtListener(element, 'focus', function() {
                    if (element.value === storedText) {
                        element.value = '';
                    }
                });
                addEvtListener(element, 'blur', function() {
                    if (!element.value) {
                        element.value = storedText;
                    }
                });
            });
        },

        // Routine to manage layout based on device orientation and window size
        manageOrientation: function() {
            var updateLayout = function() {
                var currentDeviceAngle = win.orientation;
                var mainPageBody = doc.body;
                var currentBodyWidth = mainPageBody.offsetWidth;
                var sideNavigationPanel = getElById('sidebar');
                var navigationToggleBtn = getElById('button_navigation');

                if (currentDeviceAngle === 0 || currentDeviceAngle === 180 || currentBodyWidth < 1024) {
                    addClassToElement(mainPageBody, 'is_portrait');
                    if (navigationToggleBtn) removeClassFromElement(navigationToggleBtn, 'button_active');
                    if (sideNavigationPanel) concealElement(sideNavigationPanel);
                } else {
                    removeClassFromElement(mainPageBody, 'is_portrait');
                    if (sideNavigationPanel) revealElement(sideNavigationPanel);
                }
            };

            updateLayout();
            addEvtListener(win, 'resize', updateLayout);
            addEvtListener(win, 'orientationchange', updateLayout);
        },

        // Routine to control sidebar visibility via a button
        toggleSidebarVisibility: function() {
            var navigationActivator = getElById('button_navigation');
            if (!navigationActivator) {
                return;
            }

            var sidePane = getElById('sidebar');

            addEvtListener(navigationActivator, 'click', function(evt) {
                toggleClassOnElement(this, 'button_active');
                if (sidePane) {
                    if (sidePane.style.display === 'none') {
                        revealElement(sidePane);
                    } else {
                        concealElement(sidePane);
                    }
                }
                this.blur();
                evt.preventDefault();
            });
        },

        // Routine to handle an expandable menu structure
        handleExpandableMenu: function() {
            var menuContainerElement = getElById('sidebar_menu');
            if (!menuContainerElement) {
                return;
            }

            var activationEvent = isTouchCapable ? 'click' : 'mousedown';

            queryAll('li', menuContainerElement).forEach(function(menuListItem) {
                var potentialChildUl = queryAll('ul', menuListItem)[0];
                if (potentialChildUl) {
                    var menuLink = queryAll('a', menuListItem)[0];
                    if (menuLink) {
                        var expandIndicator = doc.createElement('span');
                        addClassToElement(expandIndicator, 'abs');
                        addClassToElement(expandIndicator, 'toggle_arrow');
                        menuLink.insertBefore(expandIndicator, menuLink.firstChild);
                    }
                }
            });

            // Using event delegation for menu item clicks
            addEvtListener(menuContainerElement, activationEvent, function(evt) {
                var clickedElement = evt.target;
                var relevantAnchor = traverseToParent(clickedElement, 'A');

                if (!relevantAnchor || !menuContainerElement.contains(relevantAnchor)) {
                    return; // Ensure click is on an anchor within our menu
                }

                var parentListItem = traverseToParent(relevantAnchor, 'LI');
                var childSubList = queryAll('ul', parentListItem)[0];

                if (relevantAnchor.getAttribute('href') === '#') {
                    relevantAnchor.removeAttribute('href');
                }

                if (childSubList) {
                    if (childSubList.style.display === 'none') { // Currently hidden, so expand
                        addClassToElement(parentListItem, 'expanded-branch');
                        queryAll('li', menuContainerElement).forEach(function(otherListItem) {
                            // Hide top-level siblings, except the 'home' item
                            if (otherListItem !== parentListItem && otherListItem.id !== 'sidebar_menu_home') {
                                concealElement(otherListItem);
                            }
                        });
                        revealElement(childSubList);
                    } else { // Currently visible, so collapse
                        concealElement(childSubList);
                        removeClassFromElement(parentListItem, 'expanded-branch');

                        // Show all top-level siblings when collapsing a branch
                        queryAll('li', menuContainerElement).forEach(function(otherListItem) {
                            revealElement(otherListItem);
                        });

                        // Recursively collapse any expanded children within this branch
                        queryAll('.expanded-branch', parentListItem).forEach(function(nestedExpandedItem) {
                            removeClassFromElement(nestedExpandedItem, 'expanded-branch');
                            var nestedUlToHide = queryAll('ul', nestedExpandedItem)[0];
                            if (nestedUlToHide) {
                                concealElement(nestedUlToHide);
                            }
                        });
                    }
                    relevantAnchor.blur();
                    evt.preventDefault();
                }
            }, true); // Use capture phase for delegation
        },

        // Routine to dynamically size content areas based on header/footer presence
        positionContentSections: function() {
            var contentSections = queryAll('#main_content, #sidebar_content');
            if (contentSections.length === 0) {
                return;
            }

            contentSections.forEach(function(sectionElement) {
                var prevSibling = sectionElement.previousElementSibling;
                var nextSibling = sectionElement.nextElementSibling;

                var headerAbove = null;
                var subHeaderAbove = null;
                if (prevSibling && checkClass(prevSibling, 'header_upper')) {
                    headerAbove = prevSibling;
                    var potentialSubHeader = headerAbove.nextElementSibling;
                    if (potentialSubHeader && checkClass(potentialSubHeader, 'header_lower')) {
                        subHeaderAbove = potentialSubHeader;
                    }
                }

                var footerBelow = null;
                var subFooterBelow = null;
                if (nextSibling && checkClass(nextSibling, 'footer_lower')) {
                    footerBelow = nextSibling;
                    var potentialSubFooter = footerBelow.previousElementSibling;
                    if (potentialSubFooter && checkClass(potentialSubFooter, 'footer_upper')) {
                        subFooterBelow = potentialSubFooter;
                    }
                }

                // Calculate and set top offset
                if (headerAbove) {
                    sectionElement.style.top = subHeaderAbove ? '92px' : '46px';
                } else {
                    sectionElement.style.top = '0';
                }

                // Calculate and set bottom offset
                if (footerBelow) {
                    sectionElement.style.bottom = subFooterBelow ? '92px' : '46px';
                } else {
                    sectionElement.style.bottom = '0';
                }
            });
        },

        // Routine to enable touch scrolling and prevent default document scrolling
        enableTouchScrolling: function() {
            var scrollableInnerAreas = queryAll('#main_content_inner, #sidebar_content_inner');
            if (scrollableInnerAreas.length === 0) {
                return;
            }

            addEvtListener(doc, 'touchmove', function(evt) {
                evt.preventDefault();
            }, { passive: false }); // Prevent default document scrolling

            if (typeof iScroll !== 'undefined') {
                new iScroll('main_content_inner');
                new iScroll('sidebar_content_inner');
            }
        }
    };

    // Public API for the UI activator
    return {
        // Method to initiate all registered enhancement routines
        activateFeatures: function() {
            Object.keys(enhancementRoutines).forEach(function(routineKey) {
                if (typeof enhancementRoutines[routineKey] === 'function') {
                    enhancementRoutines[routineKey]();
                }
            });
        }
    };

})(window, document);

// Execute enhancement routines once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    UIActivator.activateFeatures();
});