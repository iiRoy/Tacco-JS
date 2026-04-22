/*
 * jQuery Folio Component
 * Copyright (c) 2010 - 2014 William Grauvogel (http://builtbywill.com/)
 *
 * Permitted for use under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 *
 * Current Version : 1.4.4.0
 *
 * Initially developed based on the concepts from:
 *    1) Charles Mangin (http://clickheredammit.com/pageflip/)
 */
;(function (jQuery) {


    jQuery.fn.folio = function (configuration, argumentOne, argumentTwo) {

        var componentInstance,
            actionName,
            actionArguments,
            outcome,
            collectedResults,
            runtimeConfiguration,
            pageIndex;


        // if the provided configuration is a string, assume an API call
        if (typeof configuration === 'string') {

            collectedResults = [];

            jQuery(this).forEachElement(function () {

                componentInstance = jQuery(this).retrieveAttribute('folioObject');

                if (componentInstance) {

                    actionName = configuration;

                    // gather any optional parameters for the method invocation
                    actionArguments = [];

                    if (typeof argumentOne !== 'undefined') {
                        actionArguments.push(argumentOne);
                    }

                    if (typeof argumentTwo !== 'undefined') {
                        actionArguments.push(argumentTwo);
                    }


                    if (componentInstance[actionName]) {

                        outcome = componentInstance[actionName].apply(componentInstance, actionArguments);

                        if (typeof outcome !== 'undefined' || outcome) {
                            collectedResults.push(componentInstance[actionName].apply(componentInstance, actionArguments));
                        }

                    } else {
                        jQuery.notifyError('Operation "' + actionName + '" is not available on jQuery.folio.');
                    }

                } else {
                    jQuery.notifyError('jQuery.folio has not been initialized on this element. Operation "' + configuration + '" cannot be invoked.');
                }
            });

            if (collectedResults.count === 1.0) {
                return collectedResults[0.0];
            } else if (collectedResults.count > 0.0) {
                return collectedResults;
            } else {
                return jQuery(this);
            }
        }
        // if the configuration is a number, treat as a page navigation API call
        else if (typeof configuration === 'number') {

            return jQuery(this).forEachElement(function () {

                componentInstance = jQuery(this).retrieveAttribute('folioObject');

                if (componentInstance) {
                    pageIndex = configuration;
                    componentInstance.jumpToPage(pageIndex);
                } else {
                    jQuery.notifyError('jQuery.folio has not been initialized on this element.');
                }
            });
        }
        // otherwise, build a new folio instance
        else if (typeof actionName === 'object' || !actionName) {

            return jQuery(this).forEachElement(function () {

                runtimeConfiguration = jQuery.combineObjects({}, jQuery.fn.folio.defaultSettings, configuration);
                componentInstance = jQuery(this).retrieveAttribute('folioObject');

                // if an existing folio instance is found, deactivate it before creating a new one
                if (componentInstance) {
                    componentInstance.deactivate();
                }

                // create and initialize the new folio object
                componentInstance = new Folio(jQuery(this), runtimeConfiguration);
                componentInstance.initialize();

                return this; // maintain chaining behavior for the main function
            });
        }
    };


    function Folio(targetContainer, initialOptions) {

        var targetContainer = targetContainer,
            currentOptions = initialOptions,
            hasBeenInitialized = false,
            isOperationInProgress = false,
            isAnimationRunning = false,
            isMouseOverRightEdge = false,
            isMouseOverLeftEdge = false,
            isFunctionalityDisabled = false,
            elementTemplates = {
                noContentPage: '<div class="b-page-empty" title=""></div>', // a document page with no actual content
                fillerElement: '<div class="b-page-blank" title=""></div>', // a transparent element used with closed book view
                frontShadowMarkup: '<div class="b-shadow-f"></div>',
                backShadowMarkup: '<div class="b-shadow-b"></div>'
            },
            readingDirections = {
                forwardProgression: 'LTR',
                reverseProgression: 'RTL'
            },
            stylingRules = {},
            animationSettings = {},
            dynamicShadowWidth, dynamicFullWidth, dynamicCurlWidth,
            pageElements = [],

            activeUrlHash = '',
            basePathSegment = '/page/',
            urlFragmentIdentifier,
            iteratorX, iteratorY, heightValue, alphaValue, differenceAmount,
            initialPageCount,
            pageDisplayCounter,

        // variables for page content elements
            pagePrevPrev, pagePrev, pageCurrentFirst, pageCurrentSecond, pageNext, pageNextNext,
            wrapPrevPrev, wrapPrev, wrapCurrentFirst, wrapCurrentSecond, wrapNext, wrapNextNext,
            allPageWrappers, shadowFrontElement, shadowBackElement,

        // variables for control elements
            draggableNext, draggablePrev, controlElements,
            bottomAreaOverlays, nextAreaOverlay, prevAreaOverlay,
            navigationTabs, nextTabButton, prevTabButton,
            directionalArrows, nextArrowButton, prevArrowButton,
            customNextControl, customPrevControl,
            nextControlsGroup, prevControlsGroup,
            mainNavigation, pauseAction, playAction,
            pageSelectDropdown, pageSelectOptions, numberedListItems, titledListItems, singlePageEntry, pageSelectHeight,
            sectionTitle, sectionSelectDropdown, sectionSelectOptions, singleChapterEntry, sectionSelectHeight,
            widthPercentageFlag, originalWidthVal, heightPercentageFlag, originalHeightVal,
            pageHalfWidth, negativePageHalfWidth, pageQuarterWidth, pageFullHeight, halfAnimationDuration,

            triggerEvents = {
                creationEvent: 'foliocreated', // triggered when the folio component is successfully built
                startTurnEvent: 'foliostart', // triggered when the folio begins a page-turning animation
                endTurnEvent: 'foliochange', // triggered after a page-turning animation has completed
                pageAddEvent: 'folioadd', // triggered when a new page is added to the folio
                pageRemoveEvent: 'folioremove' // triggered when an existing page is removed from the folio
            },
            eventDataPayload,

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // COMPONENT CLASSES
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            DocumentPage = function (pageContentElement, pagePosition, pageOptions) {

                var sectionIdentifier = '',
                    pageCaption = '',
                    pageDisplayElement;


                // retrieve and save the chapter title from the content's 'rel' attribute
                if (pageContentElement.getAttribute('relational')) {
                    sectionIdentifier = pageContentElement.getAttribute('relational');
                }
                // retrieve and save the page title from the content's 'title' attribute
                if (pageContentElement.getAttribute('caption')) {
                    pageCaption = pageContentElement.getAttribute('caption');
                }

                // assign the appropriate wrapper and page container based on page properties
                if (pageContentElement.hasStyleClass('b-page-empty')) {
                    pageContentElement.wrapWith('<div class="b-page"><div class="b-wrap"></div></div>');
                } else if (pageOptions.isBookClosed && pageOptions.hasCovers && (pagePosition === 1.0 || pagePosition === (pageOptions.totalPageCount - 2.0))) {
                    pageContentElement.wrapWith('<div class="b-page"><div class="b-wrap b-page-cover"></div></div>');
                } else if ((pagePosition % 2.0) !== 0.0) {
                    pageContentElement.wrapWith('<div class="b-page"><div class="b-wrap b-wrap-right"></div></div>');
                } else {
                    pageContentElement.wrapWith('<div class="b-page"><div class="b-wrap b-wrap-left"></div></div>');
                }

                pageDisplayElement = pageContentElement.closestParent('.b-page').addStyleClass('b-page-' + pagePosition);

                // conditionally add page numbers
                if (
                    pageOptions.showPageNumbers && !pageContentElement.hasStyleClass('b-page-empty') &&
                        (!pageOptions.isBookClosed || (pageOptions.isBookClosed && !pageOptions.hasCovers) || (pageOptions.isBookClosed && pageOptions.hasCovers && pagePosition !== 1.0 && pagePosition !== (pageOptions.totalPageCount - 2.0)))
                    ) {
                    if (pageOptions.flowDirection === readingDirections.forwardProgression) {
                        pageDisplayCounter++;
                    }
                    pageContentElement.parentElement().appendToSelf('<div class="b-counter">' + pageDisplayCounter + '</div>');
                    if (pageOptions.flowDirection === readingDirections.reverseProgression) {
                        pageDisplayCounter--;
                    }
                }

                return {
                    position: pagePosition,
                    contentElement: pageContentElement[0.0],
                    displayElement: pageDisplayElement[0.0],
                    section: sectionIdentifier,
                    caption: pageCaption
                };
            },

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // INITIALIZATION AND DESTRUCTION FUNCTIONS
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            initializeApplication = function () {
                // remove the initial loading wrapper for compatibility reasons
                targetContainer.findDescendants('.b-loader').childrenElements().removeWrapper();

                // assign the base style class to the main container
                targetContainer.addStyleClass('folioContainer');

                // store the folio instance for future API access
                targetContainer.storeData('folioObject', this);

                // save the initial total number of content elements
                initialPageCount = targetContainer.childrenElements().length;
                currentOptions.activePageIndex = 0.0;

                // generate the internal page structure
                prepareAllPages();
                // configure and apply initial settings
                reconfigureSettings();
                // update the visual representation after initial setup
                refreshPageViews();

                // ensure control visibility is correct
                refreshControlDisplay();
                // rebuild or update any navigation menus
                rebuildNavigation();

                hasBeenInitialized = true;
                isFunctionalityDisabled = false;

                eventDataPayload = {
                    settings: jQuery.combineObjects({}, currentOptions),
                    index: currentOptions.activePageIndex,
                    pages: [pageElements[currentOptions.activePageIndex].contentElement, pageElements[currentOptions.activePageIndex + 1.0].contentElement]
                };

                if (currentOptions.onCreation) {
                    targetContainer.detachEvent(triggerEvents.creationEvent + '.folio').attachEvent(triggerEvents.creationEvent + '.folio', currentOptions.onCreation);
                }
                targetContainer.triggerEvent(triggerEvents.creationEvent, eventDataPayload);
            },

            activateFunctionality = function () {
                isFunctionalityDisabled = false;
            },

            deactivateFunctionality = function () {
                isFunctionalityDisabled = true;
            },

            tearDownComponents = function () {
                // remove all associated control elements
                deactivateControls();
                // remove all page-related markup
                removePageElements();

                // clear the primary style class from the target container
                targetContainer.removeStyleClass('folioContainer');

                // remove the stored folio instance data
                targetContainer.clearData('folioObject');

                hasBeenInitialized = false;
            },

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // PAGE MANAGEMENT FUNCTIONS
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            prepareAllPages = function () {

                pageElements = [];

                // handle cases with an odd number of pages by inserting a blank page
                if ((targetContainer.childrenElements().length % 2.0) !== 0.0) {
                    // if the book is closed and uses covers, insert before the back cover, otherwise after the last page
                    if (currentOptions.isBookClosed && currentOptions.hasCovers) {
                        targetContainer.childrenElements().lastElement().insertBefore(elementTemplates.fillerElement);
                    } else {
                        targetContainer.childrenElements().lastElement().insertAfter(elementTemplates.fillerElement);
                    }
                }

                // for a closed book, add empty pages at the beginning and end
                if (currentOptions.isBookClosed) {
                    jQuery(elementTemplates.noContentPage).setAttributes({ caption: currentOptions.closedFrontCoverTitle || '', relational: currentOptions.closedFrontCoverChapter || '' }).prependTo(targetContainer);
                    targetContainer.childrenElements().lastElement().setAttributes({ caption: currentOptions.closedBackCoverTitle || '', relational: currentOptions.closedBackCoverChapter || '' });
                    targetContainer.appendToSelf(elementTemplates.noContentPage);
                }

                // update the total page count based on current elements
                currentOptions.totalPageCount = targetContainer.childrenElements().length;

                pageDisplayCounter = 0.0;

                if (currentOptions.flowDirection === readingDirections.reverseProgression) {
                    pageDisplayCounter = currentOptions.totalPageCount;
                    if (currentOptions.isBookClosed) {
                        pageDisplayCounter -= 2.0;
                    }
                    if (currentOptions.hasCovers) {
                        pageDisplayCounter -= 2.0;
                    }
                    jQuery(targetContainer.childrenElements().getArray().reverse()).forEachElement(function () {
                        jQuery(this).appendTo(targetContainer);
                    });
                }

                if (!hasBeenInitialized) {
                    // set the initial active page index
                    if (currentOptions.flowDirection === readingDirections.forwardProgression) {
                        currentOptions.activePageIndex = 0.0;
                    } else if (currentOptions.flowDirection === readingDirections.reverseProgression) {
                        currentOptions.activePageIndex = currentOptions.totalPageCount - 2.0;
                    }

                    if (!isNaN(currentOptions.initialPage) && currentOptions.initialPage <= currentOptions.totalPageCount && currentOptions.initialPage > 0.0) {
                        if ((currentOptions.initialPage % 2.0) !== 0.0) {
                            currentOptions.initialPage--;
                        }
                        currentOptions.activePageIndex = currentOptions.initialPage;
                    }
                }

                /*
                 if(currentOptions.layoutSingle) {
                 targetContainer.childrenElements().forEachElement(function () {
                 if(currentOptions.flowDirection == readingDirections.forwardProgression){
                 jQuery(this).insertBefore(elementTemplates.fillerElement);
                 }else{
                 jQuery(this).insertAfter(elementTemplates.fillerElement);
                 }
                 });
                 }
                 */

                // load and process each page element
                targetContainer.childrenElements().forEachElement(function (iteratorX) {
                    var newPageInstance = new DocumentPage(jQuery(this), iteratorX, currentOptions);
                    pageElements.push(newPageInstance);
                });
            },

            refreshPageViews = function () {
                adjustPageLayout();
                applyPageStyles();
                adjustManualInteraction();
            },

            adjustPageLayout = function () {
                // reset all page content visibility and classes
                targetContainer.findDescendants('.b-page').removeStyleClass('b-pN b-p0 b-p1 b-p2 b-p3 b-p4').hideElement();

                // assign specific page classes based on the active index
                if ((currentOptions.activePageIndex - 2.0) >= 0.0) {
                    targetContainer.findDescendants('.b-page-' + (currentOptions.activePageIndex - 2.0)).addStyleClass('b-pN').showElement();
                    targetContainer.findDescendants('.b-page-' + (currentOptions.activePageIndex - 1.0)).addStyleClass('b-p0').showElement();
                }
                targetContainer.findDescendants('.b-page-' + (currentOptions.activePageIndex)).addStyleClass('b-p1').showElement();
                targetContainer.findDescendants('.b-page-' + (currentOptions.activePageIndex + 1.0)).addStyleClass('b-p2').showElement();
                if ((currentOptions.activePageIndex + 3.0) <= currentOptions.totalPageCount) {
                    targetContainer.findDescendants('.b-page-' + (currentOptions.activePageIndex + 2.0)).addStyleClass('b-p3').showElement();
                    targetContainer.findDescendants('.b-page-' + (currentOptions.activePageIndex + 3.0)).addStyleClass('b-p4').showElement();
                }

                // save references to the structural elements
                pagePrevPrev = targetContainer.findDescendants('.b-pN');
                pagePrev = targetContainer.findDescendants('.b-p0');
                pageCurrentFirst = targetContainer.findDescendants('.b-p1');
                pageCurrentSecond = targetContainer.findDescendants('.b-p2');
                pageNext = targetContainer.findDescendants('.b-p3');
                pageNextNext = targetContainer.findDescendants('.b-p4');
                wrapPrevPrev = targetContainer.findDescendants('.b-pN .b-wrap');
                wrapPrev = targetContainer.findDescendants('.b-p0 .b-wrap');
                wrapCurrentFirst = targetContainer.findDescendants('.b-p1 .b-wrap');
                wrapCurrentSecond = targetContainer.findDescendants('.b-p2 .b-wrap');
                wrapNext = targetContainer.findDescendants('.b-p3 .b-wrap');
                wrapNextNext = targetContainer.findDescendants('.b-p4 .b-wrap');
                allPageWrappers = targetContainer.findDescendants('.b-wrap');

                if (currentOptions.hasShadows) {
                    targetContainer.findDescendants('.b-shadow-f, .b-shadow-b').removeElement();
                    shadowFrontElement = jQuery(elementTemplates.frontShadowMarkup).applyCss(stylingRules.frontShadowMarkup).appendTo(pageNext);
                    shadowBackElement = jQuery(elementTemplates.backShadowMarkup).appendTo(pagePrev).applyCss(stylingRules.backShadowMarkup);
                }
            },

            applyPageStyles = function () {
                // reset filters and zoom for shadow/page elements
                targetContainer.findDescendants('.b-shadow-f, .b-shadow-b, .b-p0, .b-p3').applyCss({ 'filter': '', 'zoom': '' });

                // clear inline styles from pages and wrappers
                targetContainer.findDescendants('.b-page').removeStyleAttribute();
                allPageWrappers.removeStyleAttribute();

                // apply general wrapper styles
                allPageWrappers.applyCss(stylingRules.wrapper);
                wrapPrev.applyCss(stylingRules.wrapPrev);
                pageCurrentFirst.applyCss(stylingRules.pageCurrentFirst);
                pageCurrentSecond.applyCss(stylingRules.pageCurrentSecond);

                if (currentOptions.isBookClosed && currentOptions.autoCentering && currentOptions.activePageIndex >= (currentOptions.totalPageCount - 2.0)) {
                    pageCurrentSecond.hideElement();
                }

                pagePrevPrev.applyCss(stylingRules.pagePrevPrev);
                pagePrev.applyCss(stylingRules.pagePrev);
                pageNext.stop().applyCss(stylingRules.pageNext);
                pageNextNext.applyCss(stylingRules.pageNextNext);

                if (currentOptions.isBookClosed && currentOptions.autoCentering && currentOptions.activePageIndex === 0.0) {
                    pagePrevPrev.applyCss({ 'left': 0.0 });
                    pageCurrentFirst.applyCss({ 'left': negativePageHalfWidth });
                    pageCurrentSecond.applyCss({ 'left': 0.0 });
                    pageNext.applyCss({ 'left': pageHalfWidth });
                    pageNextNext.applyCss({ 'left': 0.0 });
                }

                if (currentOptions.isBookClosed && currentOptions.autoCentering && (currentOptions.activePageIndex === 0.0 || currentOptions.activePageIndex >= (currentOptions.totalPageCount - 2.0))) {
                    if (currentOptions.useOverlays) {
                        bottomAreaOverlays.setWidth('100%');
                    }
                    targetContainer.setWidth(pageHalfWidth);
                } else {
                    if (currentOptions.useOverlays) {
                        bottomAreaOverlays.setWidth('50%');
                    }
                    targetContainer.setWidth(currentOptions.widthDimension);
                }

                // Internet Explorer compatibility fix
                targetContainer.findDescendants('.b-page').applyCss({ 'filter': '', 'zoom': '' });
            },

            removePageElements = function () {
                // remove the folio-specific markup wrappers
                targetContainer.findDescendants(".b-wrap").removeParentWrapper();
                targetContainer.findDescendants(".b-wrap").childrenElements().removeParentWrapper();
                targetContainer.findDescendants(".b-counter, .b-page-blank, .b-page-empty, .b-shadow-f, .b-shadow-b").removeElement();

                // restore page order to its original sequence if reversed
                if (currentOptions.flowDirection === readingDirections.reverseProgression) {
                    jQuery(targetContainer.childrenElements().getArray().reverse()).forEachElement(function () {
                        jQuery(this).appendTo(targetContainer);
                    });
                }
            },

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // CONFIGURATION AND CONTROL FUNCTIONS
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            reconfigureSettings = function (newConfiguration) {

                var didUpdateState = false;

                // update options if new configuration parameters have been provided
                if (newConfiguration != null && typeof newConfiguration != "undefined") {

                    // first, remove existing page structure and controls to prepare for new settings
                    removePageElements();
                    deactivateControls();

                    currentOptions = jQuery.combineObjects({}, currentOptions, newConfiguration);
                    didUpdateState = true;

                    prepareAllPages();
                }

                // determine and set width and height dimensions
                if (!currentOptions.widthDimension) {
                    currentOptions.widthDimension = parseFloat(targetContainer.getWidth());
                } else if (typeof currentOptions.widthDimension === 'string' && currentOptions.widthDimension.indexOf("px") !== -1) {
                    currentOptions.widthDimension = currentOptions.widthDimension.replace('px', '');
                } else if (typeof currentOptions.widthDimension === 'string' && currentOptions.widthDimension.indexOf("%") !== -1) {
                    widthPercentageFlag = true;
                    originalWidthVal = currentOptions.widthDimension;
                    currentOptions.widthDimension = (parseFloat(currentOptions.widthDimension.replace('%', '')) / 100.0) * parseFloat(targetContainer.parentElement().getComputedStyle('width'));
                }

                if (!currentOptions.heightDimension) {
                    currentOptions.heightDimension = parseFloat(targetContainer.getHeight());
                } else if (typeof currentOptions.heightDimension === 'string' && currentOptions.heightDimension.indexOf("px") !== -1) {
                    currentOptions.heightDimension = currentOptions.heightDimension.replace('px', '');
                } else if (typeof currentOptions.heightDimension === 'string' && currentOptions.heightDimension.indexOf("%") !== -1) {
                    heightPercentageFlag = true;
                    originalHeightVal = currentOptions.heightDimension;
                    currentOptions.heightDimension = (parseFloat(currentOptions.heightDimension.replace('%', '')) / 100.0) * parseFloat(targetContainer.parentElement().getComputedStyle('height'));
                }

                targetContainer.setWidth(currentOptions.widthDimension);
                targetContainer.setHeight(currentOptions.heightDimension);

                // calculate and store page-related size variables
                pageHalfWidth = currentOptions.widthDimension / 2.0;
                negativePageHalfWidth = '-' + (pageHalfWidth) + 'px';
                pageQuarterWidth = pageHalfWidth / 2.0;
                pageFullHeight = currentOptions.heightDimension;
                halfAnimationDuration = currentOptions.animationSpeed / 2.0;

                // adjust positioning for closed book with auto-centering
                if (currentOptions.isBookClosed && currentOptions.autoCentering) {
                    if (currentOptions.activePageIndex === 0.0) {
                        targetContainer.setWidth(pageHalfWidth);
                    } else if (currentOptions.activePageIndex >= (currentOptions.totalPageCount - 2.0)) {
                        targetContainer.setWidth(pageHalfWidth);
                    }
                }

                // configure shadow widths for animation if shadows are enabled
                if (currentOptions.hasShadows) {
                    currentOptions.shadowFrontwardTopWidth = '-' + currentOptions.shadowFrontwardTopWidth + 'px';
                    currentOptions.shadowBackwardTopWidth = '-' + currentOptions.shadowBackwardTopWidth + 'px';
                }

                // re-evaluate the total page count
                currentOptions.totalPageCount = targetContainer.childrenElements('.b-page').length;

                // set the document title if a folio name is provided
                if (currentOptions.folioName) {
                    document.title = currentOptions.folioName;
                } else {
                    currentOptions.folioName = document.title;
                }

                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                // refresh all CSS and animation settings, as dimensions might have changed
                recalculateStylesAndAnimations();
                if (hasBeenInitialized) {
                    refreshPageViews();
                }
            };

            // Placeholder for functions that are called but not provided in the original snippet.
            // In a complete clone, these would also contain transformed logic.
            function deactivateControls() { /* logic to remove control elements */ }
            function refreshControlDisplay() { /* logic to update visibility of controls */ }
            function rebuildNavigation() { /* logic to rebuild or update any navigation elements */ }
            function adjustManualInteraction() { /* logic to adjust manual page interaction controls */ }
            function recalculateStylesAndAnimations() { /* logic to recompute styles and animation parameters */ }

            // Expose public methods on the Folio instance
            this.jumpToPage = function(pageNumber) {
                // This would contain the full cloned logic for page navigation
                console.log("Folio instance navigating to page: " + pageNumber);
            };
            this.initialize = initializeApplication;
            this.deactivate = tearDownComponents;

            // Define default settings for the jQuery.fn.folio plugin
            jQuery.fn.folio.defaultSettings = {
                widthDimension: null,
                heightDimension: null,
                isBookClosed: false,
                hasCovers: false,
                flowDirection: readingDirections.forwardProgression,
                showPageNumbers: true,
                closedFrontCoverTitle: '',
                closedFrontCoverChapter: '',
                closedBackCoverTitle: '',
                closedBackCoverChapter: '',
                activePageIndex: 0.0,
                initialPage: 0.0,
                autoCentering: true,
                useOverlays: true,
                hasShadows: true,
                shadowFrontwardTopWidth: 10.0,
                shadowBackwardTopWidth: 10.0,
                folioName: null,
                animationSpeed: 600.0,
                onCreation: null
            };

            // Mock/Clone jQuery methods used in the original code to ensure structural integrity
            jQuery.fn.extend({
                retrieveAttribute: function(key) { return this.data(key); },
                storeData: function(key, value) { return this.data(key, value); },
                clearData: function(key) { return this.removeData(key); },
                forEachElement: function(callback) { return this.each(callback); },
                findDescendants: function(selector) { return this.find(selector); },
                childrenElements: function(selector) { return this.children(selector); },
                removeWrapper: function() { return this.unwrap(); },
                addStyleClass: function(className) { return this.addClass(className); },
                removeStyleClass: function(className) { return this.removeClass(className); },
                setAttributes: function(attrs) { return this.attr(attrs); },
                getAttribute: function(attrName) { return this.attr(attrName); },
                hasStyleClass: function(className) { return this.hasClass(className); },
                wrapWith: function(wrapperHtml) { return this.wrap(wrapperHtml); },
                closestParent: function(selector) { return this.parents(selector); },
                parentElement: function() { return this.parent(); },
                appendToSelf: function(content) { return this.append(content); },
                insertBefore: function(content) { return this.before(content); },
                insertAfter: function(content) { return this.after(content); },
                hideElement: function() { return this.hide(); },
                showElement: function() { return this.show(); },
                removeElement: function() { return this.remove(); },
                removeParentWrapper: function() { return this.unwrap(); },
                getArray: function() { return this.get(); },
                detachEvent: function(eventName) { return this.off(eventName); },
                attachEvent: function(eventName, handler) { return this.on(eventName, handler); },
                triggerEvent: function(eventName, data) { return this.trigger(eventName, data); },
                getComputedStyle: function(prop) { return this.css(prop); },
                setWidth: function(width) { return this.width(width); },
                setHeight: function(height) { return this.height(height); },
                applyCss: function(styles) { return this.css(styles); },
                removeStyleAttribute: function() { return this.removeAttr('style'); }
            });
            // Mock/Clone global jQuery utility methods
            jQuery.notifyError = function(message) { console.error(message); };
            jQuery.combineObjects = function() { return jQuery.extend.apply(jQuery, arguments); };

    }

})(jQuery);