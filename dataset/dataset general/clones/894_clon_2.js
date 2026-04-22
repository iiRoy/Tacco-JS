/*
 Module: panel-manager.js

 Description:
  This module handles the dynamic management of UI panels
  within the AppAssembler framework. It provides functionalities
  for switching views, loading content, and managing segmented controls.

 Version: 0.2 alpha

 Project: AppAssembler Framework

 Dependencies:
  - <appassembler.js>
  - <fastscroller.js>

*/

/*
 Class: AppAssembler
  Scoped to the global AppAssembler namespace.
*/
var AppAssembler = window.AppAssembler || {};

/*
 Namespace: AppAssembler.Interface
  Local namespace for user interface components.
*/
AppAssembler.Interface = AppAssembler.Interface || {};

/*
 Namespace: AppAssembler.Interface.PaneManager
  Manages UI panes and their interactions.
*/
AppAssembler.Interface.PaneManager = (function (inputElement, configOptions) {

    // Store a reference to the main application namespace.
    var rootApp = AppAssembler;

    // Self-reference for the current module.
    var selfModule = AppAssembler.Interface.PaneManager;

    /*
     Namespace: AppAssembler.Interface.PaneManager.moduleData
      Container for shared module variables.
    */
    selfModule.moduleData = {};

    /*
     Namespace: AppAssembler.Interface.PaneManager.helpers
      Collection of utility functions for panel management.
    */
    selfModule.helpers = {
        /*
         Function: adjustLayout
          Recalculates and sets the height of the main visual area
          based on window height and optional bottom bar presence.

         Parameters:
          visualArea - The main content visual area element.
          bottomBar - The optional bottom navigation bar element.
        */
        adjustLayout: function (visualArea, bottomBar) {
            var verticalShift = window.innerHeight - (bottomBar ? bottomBar.offsetHeight : 0);

            visualArea.style.height = verticalShift - visualArea.offsetTop + "px";

            if (bottomBar) {
                bottomBar.style.top = verticalShift + "px";
            }
        },

        /*
         Function: refreshTitle
          Updates the displayed title bar based on the active content pane.

         Parameters:
          currentTitle - The currently active title bar element.
          updatedTitle - The new title bar element to display, or null if to find existing.
          itemIndex - The index associated with the content pane.
        */
        refreshTitle: function (currentTitle, updatedTitle, itemIndex) {
            if (updatedTitle) {
                updatedTitle.setAttribute("data-associated-pane", itemIndex);
                currentTitle.parentNode.appendChild(updatedTitle);
            } else {
                updatedTitle = currentTitle.parentNode.querySelector("title-bar[data-associated-pane='" + itemIndex + "']");
            }

            var allTitles = currentTitle.parentNode.querySelectorAll("title-bar");
            for (var i = 0, j = allTitles.length; i < j; i++) {
                rootApp.helpers.appendClass(allTitles[i], rootApp.helpers.parseCssClass("concealed"));
            }

            rootApp.helpers.stripClass(updatedTitle, rootApp.helpers.parseCssClass("concealed"));
        },

        /*
         Function: retrieveContent
          Loads content into a target element, either from a local DOM fragment
          or via an XMLHttpRequest.

         Parameters:
          sourceRef - The source identifier (e.g., "#myId" or "url/to/content").
          currentTitle - The current title bar element.
          destinationElement - The element where content will be loaded.
          itemIndex - The index of the content item.
        */
        retrieveContent: function (sourceRef, currentTitle, destinationElement, itemIndex) {
            // Abort any pending requests to prevent race conditions.
            if (selfModule.moduleData.requestObject) {
                selfModule.moduleData.requestObject.abort();
            }

            // Check if the source is a local DOM ID.
            if (sourceRef.charAt(0) === "#") {
                var currentSelection = destinationElement.querySelector(sourceRef),
                    childElements, updatedTitle;

                if (currentSelection) {
                    updatedTitle = currentSelection.querySelector("title-bar");
                    selfModule.helpers.refreshTitle(currentTitle, updatedTitle, itemIndex);

                    childElements = currentSelection.parentNode.querySelectorAll(rootApp.helpers.parseCssClass(".", "pane-display-content"));

                    for (var i = 0, j = childElements.length; i < j; i++) {
                        rootApp.helpers.appendClass(childElements[i], rootApp.helpers.parseCssClass("pane-concealed"));
                    }

                    rootApp.helpers.stripClass(currentSelection, rootApp.helpers.parseCssClass("pane-concealed"));
                }

                rootApp.helpers.FastScroller.helpers.verifyScroll(null, "0", null, destinationElement);
                rootApp.helpers.FastScroller.helpers.activateScroller();
            } else {
                // Load content asynchronously via XHR.
                selfModule.moduleData.requestObject = new XMLHttpRequest();
                var requestObject = selfModule.moduleData.requestObject;

                requestObject.onreadystatechange = function () {
                    if (requestObject.readyState === 4) {
                        if (requestObject.status === 200 || requestObject.status === 304) {

                            // Clear existing content.
                            while (destinationElement.firstChild) {
                                destinationElement.removeChild(destinationElement.firstChild);
                            }

                            var documentFragment = document.createDocumentFragment();
                            var tempContainer = document.createElement("div");
                            tempContainer.innerHTML = requestObject.responseText;

                            var updatedTitle = tempContainer.querySelector("title-bar");
                            selfModule.helpers.refreshTitle(currentTitle, updatedTitle, itemIndex);

                            for (var i = 0, j = tempContainer.childNodes.length; i < j; i++) {
                                var currentNode = tempContainer.childNodes[i];

                                if (currentNode) {
                                    documentFragment.appendChild(tempContainer.childNodes[i]);
                                }
                            }

                            destinationElement.appendChild(documentFragment);

                            rootApp.helpers.FastScroller.helpers.verifyScroll(null, "0", null, destinationElement);

                        } else {
                            console.log("XHR Error: " + requestObject.status);
                        }

                        rootApp.helpers.FastScroller.helpers.activateScroller();
                        delete selfModule.moduleData.requestObject;
                    }
                };
                requestObject.open("GET", sourceRef, true);
                requestObject.send();

            }
        },

        /*
         Function: displaySegment
          Shows a specific segment within a segmented control.

         Parameters:
          destinationElement - The container element holding the segmented content.
          sourceRef - The selector for the segment to be displayed.
        */
        displaySegment: function (destinationElement, sourceRef) {
            var currentSelection = destinationElement.querySelector(sourceRef),
                childElements;

            if (currentSelection) {
                childElements = currentSelection.parentNode.querySelectorAll(rootApp.helpers.parseCssClass(".", "segmented-panel-content"));

                for (var i = 0, j = childElements.length; i < j; i++) {
                    rootApp.helpers.appendClass(childElements[i], rootApp.helpers.parseCssClass("concealed"));
                }

                rootApp.helpers.stripClass(currentSelection, rootApp.helpers.parseCssClass("concealed"));
            }

            rootApp.helpers.FastScroller.helpers.verifyScroll(null, "0", null, destinationElement);
            rootApp.helpers.FastScroller.helpers.activateScroller();
        },

        /*
         Function: segmentControlHandler
          Sets up event listeners for a segmented control.

         Parameters:
          displayArea - The main content display area.
          currentTitle - The current title bar element.
        */
        segmentControlHandler: function (displayArea, currentTitle) {
            var segmentController, destinationElement, anchorLink, currentSelection;
            segmentController = currentTitle.parentNode.querySelector(rootApp.helpers.parseCssClass(".", "segmented-panel"));
            currentSelection = segmentController.querySelector(rootApp.helpers.parseCssClass(".", "segmented-panel-active a"));

            currentTitle.parentNode.addEventListener("pointerUp", function (eventData) {
                eventData.stopPropagation();

                segmentController = currentTitle.parentNode.querySelector(rootApp.helpers.parseCssClass(".", "segmented-panel"));

                if (segmentController) {
                    destinationElement = eventData.target;

                    while (destinationElement && destinationElement !== segmentController) {
                        if (destinationElement.nodeName.toLowerCase() === "a") {
                            anchorLink = destinationElement;
                        }

                        destinationElement = destinationElement.parentNode;
                    }

                    if (destinationElement) {
                        var controlItems = segmentController.querySelectorAll("li"),
                            styleClass = rootApp.helpers.parseCssClass("segmented-panel-active");

                        for (var i = 0, j = controlItems.length; i < j; i++) {
                            rootApp.helpers.stripClass(controlItems[i], styleClass);
                        }

                        rootApp.helpers.appendClass(anchorLink.parentNode, styleClass);
                        selfModule.helpers.displaySegment(displayArea, anchorLink.getAttribute("target-ref"));
                    }
                }
            }, false);

            if (currentSelection) {
                selfModule.helpers.displaySegment(displayArea, currentSelection.getAttribute("target-ref"));
            }
        }
    };

    /*
     Function: prepareContainers
      Initializes FastScroller for all view elements within the given object.

     Parameters:
      inputElement - The root element containing the view containers.
    */
    selfModule.prepareContainers = function (inputElement) {
        var containerElement = inputElement,
            viewElements = containerElement.querySelectorAll("content-area");

        for (var i = 0, j = viewElements.length; i < j; i++) {
            new AppAssembler.helpers.FastScroller({
                target: viewElements[i]
            });
        }
    };

    /*
     Function: attachInteractions
      Sets up all necessary event listeners for tab navigation and layout adjustments.

     Parameters:
      inputElement - The root element containing the UI components.
    */
    selfModule.attachInteractions = function (inputElement) {
        var containerElement = inputElement,
            visualArea = containerElement.querySelector("content-area > content-section"),
            displayArea = visualArea.querySelector(".ui-app-scroll-wrap"),
            currentTitle = containerElement.querySelector("content-area > display-region title-bar"),
            bottomBar = containerElement.querySelector("bottom-menu"),
            tabLinks = bottomBar.querySelectorAll("li a"),
            currentSelection = bottomBar.querySelector("list-item.ui-app-pane-active a"),
            sourceRef = currentSelection.getAttribute("target-ref");

        for (var i = 0, j = tabLinks.length; i < j; i++) {
            var currentTab = tabLinks[i], parentOfLink,
                styleClass = rootApp.helpers.parseCssClass("pane-active");

            currentTab.addEventListener("pointerUp", function (eventData) {
                parentOfLink = this.parentNode;
                currentTitle = containerElement.querySelector("content-area > display-region title-bar");
                sourceRef = this.getAttribute("target-ref");

                if (!rootApp.helpers.hasCssClass(parentOfLink, styleClass)) {
                    for (var k = 0, l = tabLinks.length; k < l; k++) {
                        rootApp.helpers.stripClass(tabLinks[k].parentNode, styleClass);
                    }

                    rootApp.helpers.FastScroller.helpers.deactivateScroller();

                    rootApp.helpers.appendClass(parentOfLink, styleClass);
                    selfModule.helpers.retrieveContent(sourceRef, currentTitle, displayArea, this.getAttribute("data-item-idx"));
                }
            }, false);

            currentTab.setAttribute("data-item-idx", i);
        }

        if (currentSelection) {
            selfModule.helpers.retrieveContent(sourceRef, currentTitle, displayArea, currentSelection.getAttribute("data-item-idx"));
        }

        window.addEventListener("deviceOrientationChange", function () {
            selfModule.helpers.adjustLayout(visualArea, bottomBar);
        }, false);

        selfModule.helpers.adjustLayout(visualArea, bottomBar);
        selfModule.helpers.segmentControlHandler(displayArea, currentTitle);
    };

    /*
     Function: initializeModule
      Entry point for the module, setting up views and event listeners.
    */
    selfModule.initializeModule = function () {
        selfModule.prepareContainers(inputElement);
        selfModule.attachInteractions(inputElement);

        if (configOptions) {
            rootApp.helpers.manageProperties(inputElement, configOptions);
        }
    }();
});