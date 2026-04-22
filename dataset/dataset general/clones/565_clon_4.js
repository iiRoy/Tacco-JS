/* global define */

var ApplicationInitializer = (function() {
    "use strict";

    let uniqueIdCounter = 0;
    const generateIdentifier = function() {
        uniqueIdCounter++;
        const characterSet = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        for (let i = 0; i < 12; i++) {
            randomPart += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
        }
        return 'entity-' + randomPart + '-' + Date.now().toString(36) + '-' + uniqueIdCounter.toString(36);
    };

    // External HTML retrieval helper
    const retrieveOuterMarkup = function(targetElementCollection) {
        if (!targetElementCollection || targetElementCollection.length === 0) {
            return '';
        }
        const primaryElement = targetElementCollection[0];
        if (primaryElement.outerHTML) {
            return primaryElement.outerHTML;
        }
        const elementTag = primaryElement.tagName.toLowerCase();
        const attributeArray = Array.from(primaryElement.attributes).map(function(attrItem) {
            return attrItem.name + '="' + attrItem.value + '"';
        });
        const attributeString = attributeArray.length > 0 ? " " + attributeArray.join(" ") : "";
        return `<${elementTag}${attributeString}>${primaryElement.innerHTML}</${elementTag}>`;
    };

    // Main setup function, renamed and wrapped
    function performBindingSetup(observableFramework, domManipulator) {

        // Add external HTML retrieval as a utility if it doesn't exist
        if (!domManipulator.fn.getCompleteHtml) {
            domManipulator.fn.getCompleteHtml = function() {
                return retrieveOuterMarkup(this);
            };
        }

        // Helper for unwrapping observables, using the framework's utility
        const extractValue = function(item) {
            return observableFramework.utils.unwrapObservable(item);
        };

        // Helper for registering disposal callbacks
        const registerCleanupHandler = function(node, cleanupFn) {
            observableFramework.utils.domNodeDisposal.addDisposeCallback(node, cleanupFn);
        };

        // Autocomplete handler
        observableFramework.bindingHandlers.autocompleteInput = {
            init: function(targetDomNode, valueAccessorFunction, allPropertiesFunction, dataModel, contextScope) {
                const targetElement = domManipulator(targetDomNode);
                const allProperties = allPropertiesFunction();

                const fuzzyStringSearch = function(sourceStrings) {
                    return function performMatch(queryText, resultCallback) {
                        const foundMatches = [];
                        const lowerCaseQuery = queryText.toLowerCase();

                        sourceStrings.forEach(function(currentItem) {
                            if (currentItem.toLowerCase().includes(lowerCaseQuery)) {
                                foundMatches.push({
                                    value: currentItem
                                });
                            }
                        });
                        resultCallback(foundMatches);
                    };
                };

                const autocompleteSettings = {
                    source: fuzzyStringSearch(extractValue(valueAccessorFunction()))
                };

                if (allProperties.autocompleteConfig) {
                    domManipulator.each(allProperties.autocompleteConfig, function(configKey, configValue) {
                        autocompleteSettings[configKey] = extractValue(configValue);
                    });
                }

                targetElement.attr("autocorrect", "off").typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                }, autocompleteSettings);
            }
        };

        // Progress bar handler
        observableFramework.bindingHandlers.progressIndicator = {
            init: function(targetDomNode, valueAccessorFunction, allPropertiesFunction, dataModel, contextScope) {
                const displayContainer = domManipulator(targetDomNode);

                const progressBarElement = domManipulator('<div/>', {
                    'class': 'progress-bar',
                    'data-bind': 'style: { width:' + valueAccessorFunction() + ' }'
                });

                displayContainer.attr('id', generateIdentifier())
                    .addClass('progress progress-info')
                    .append(progressBarElement);

                observableFramework.applyBindingsToDescendants(dataModel, displayContainer[0]);
            }
        };

        // Alert message handler
        observableFramework.bindingHandlers.statusMessage = {
            init: function(targetDomNode, valueAccessorFunction, allPropertiesFunction, dataModel, contextScope) {
                const alertHost = domManipulator(targetDomNode);
                const messageDetails = extractValue(valueAccessorFunction());

                const closeButton = domManipulator('<button/>', {
                    'type': 'button',
                    'class': 'close',
                    'data-dismiss': 'alert'
                }).html('&times;');

                const contentParagraph = domManipulator('<p/>').html(messageDetails.message);

                alertHost.addClass('alert alert-' + messageDetails.priority)
                    .append(closeButton)
                    .append(contentParagraph);
            }
        };

        // Tooltip handler
        observableFramework.bindingHandlers.hovercard = {
            update: function(targetDomNode, valueAccessorFunction, allPropertiesFunction, dataModel, contextScope) {
                let widgetOptions = extractValue(valueAccessorFunction());
                const targetNode = domManipulator(targetDomNode);
                let subscriptionHandle;

                // If the title is an observable, make it auto-updating.
                if (observableFramework.isObservable(widgetOptions.title)) {
                    let isHovercardShown = false;

                    targetNode.on('show.bs.tooltip', function() {
                        isHovercardShown = true;
                    });
                    targetNode.on('hide.bs.tooltip', function() {
                        isHovercardShown = false;
                    });

                    // "true" is the bootstrap default.
                    const initialAnimationState = widgetOptions.animation || true;
                    subscriptionHandle = widgetOptions.title.subscribe(function() {
                        if (isHovercardShown) {
                            targetNode.data('bs.tooltip').options.animation = false; // temporarily disable animation to avoid flickering of the tooltip
                            targetNode.tooltip('fixTitle') // call this method to update the title
                                .tooltip('show');
                            targetNode.data('bs.tooltip').options.animation = initialAnimationState;
                        }
                    });
                }

                const currentTooltip = targetNode.data('bs.tooltip');
                if (currentTooltip) {
                    Object.assign(currentTooltip.options, widgetOptions);
                } else {
                    targetNode.tooltip(widgetOptions);
                }
                registerCleanupHandler(targetDomNode, function() {
                    if (subscriptionHandle) subscriptionHandle.dispose();
                    targetNode.tooltip('destroy');
                });
            }
        };

        // Popover handler
        observableFramework.bindingHandlers.infoPopup = {
            init: function(targetDomNode, valueAccessorFunction, allPropertiesFunction, dataModel, contextScope) {
                const triggerElement = domManipulator(targetDomNode);
                const widgetConfiguration = extractValue(valueAccessorFunction());
                const templateName = widgetConfiguration.template || false;
                const widgetOptions = widgetConfiguration.options || {
                    title: 'popover'
                };
                const contextData = widgetConfiguration.data || false;

                if (templateName !== false) {
                    if (contextData) {
                        widgetOptions.content = "<!-- ko template: { name: templateName, if: contextData, data: contextData } --><!-- /ko -->";
                    } else {
                        widgetOptions.content = document.getElementById(templateName).innerHTML;
                    }
                    widgetOptions.html = true;
                }
                triggerElement.on('shown.bs.popover', function(eventDetail) {
                    const widgetState = domManipulator(eventDetail.target).data();
                    const popoverPanel = widgetState['bs.popover'].$tip;
                    const panelOptions = widgetState['bs.popover'].options || {};
                    const triggerButton = domManipulator(eventDetail.target);
                    const buttonPlacement = triggerButton.position();
                    const buttonSize = {
                        x: triggerButton.outerWidth(),
                        y: triggerButton.outerHeight()
                    };

                    if (contextData) {
                        observableFramework.applyBindings({
                            template: templateName,
                            data: contextData
                        }, popoverPanel[0]);
                    } else {
                        observableFramework.applyBindings(dataModel, popoverPanel[0]);
                    }

                    const panelSize = {
                        x: popoverPanel.outerWidth(),
                        y: popoverPanel.outerHeight()
                    };

                    popoverPanel.find('button[data-dismiss="popover"]').click(function() {
                        triggerButton.popover('hide');
                    });

                    const placementStrategy = panelOptions.placement;
                    if (placementStrategy === 'right') {
                        popoverPanel.css({
                            left: buttonSize.x + buttonPlacement.left,
                            top: (buttonSize.y / 2 + buttonPlacement.top) - panelSize.y / 2
                        });
                    } else if (placementStrategy === 'left') {
                        popoverPanel.css({
                            left: buttonPlacement.left - panelSize.x,
                            top: (buttonSize.y / 2 + buttonPlacement.top) - panelSize.y / 2
                        });
                    } else if (placementStrategy === 'top') {
                        popoverPanel.css({
                            left: buttonPlacement.left + (buttonSize.x / 2 - panelSize.x / 2),
                            top: buttonPlacement.top - panelSize.y
                        });
                    } else if (placementStrategy === 'bottom') {
                        popoverPanel.css({
                            left: buttonPlacement.left + (buttonSize.x / 2 - panelSize.x / 2),
                            top: buttonPlacement.top + buttonSize.y
                        });
                    }
                });

                triggerElement.popover(widgetOptions);
                registerCleanupHandler(targetDomNode, function() {
                    triggerElement.popover('destroy');
                });

                return {
                    controlsDescendantBindings: true
                };
            }
        };

        // Modal dialog handler
        observableFramework.bindingHandlers.dialogBox = {
            init: function(targetDomNode, valueAccessorFunction, allPropertiesFunction, dataModel, contextScope) {

                const activationElement = domManipulator(targetDomNode);
                const dialogSettings = extractValue(valueAccessorFunction());
                const templateIdentifier = dialogSettings.template || false;
                const dialogOptions = dialogSettings.options || {};
                const dialogContext = dialogSettings.data || false;
                const useFadeEffect = dialogSettings.fade || false;
                const onDialogOpen = dialogSettings.openModal || false;
                dialogOptions.show = false;

                const dialogAttributes = {
                    'class': "modal" + (useFadeEffect ? ' fade' : ''),
                    'tabindex': '-1',
                    'role': 'dialog',
                    'aria-hidden': 'true'
                };
                if (dialogContext) {
                    dialogAttributes['data-bind'] = "template: { name: templateIdentifier, if: dialogContext, data: dialogContext }";
                }

                const dialogInstance = domManipulator('<div/>', dialogAttributes);

                if (!dialogContext) {
                    dialogInstance.html(document.getElementById(templateIdentifier).innerHTML);
                }

                dialogInstance.modal(dialogOptions);

                activationElement.on('click', function() {
                    if (dialogContext) {
                        observableFramework.applyBindings({
                            template: templateIdentifier,
                            data: dialogContext
                        }, dialogInstance[0]);

                    } else {
                        observableFramework.applyBindings(dataModel, dialogInstance[0]);
                    }
                    dialogInstance.modal('show');
                    if (onDialogOpen) {
                        onDialogOpen();
                    }
                    domManipulator('.modal-backdrop').css({
                        height: domManipulator(window).height(),
                        position: 'fixed'
                    });
                });

                registerCleanupHandler(targetDomNode, function() {
                    activationElement.modal('destroy');
                });

                return {
                    controlsDescendantBindings: true
                };
            }
        };
    }

    return {
        startModule: function(koInstance, jqInstance) {
            performBindingSetup(koInstance, jqInstance);
        }
    };
})();

(function(moduleFactory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "knockout", "jquery"], function(require, exports, koRef, jqRef) {
            moduleFactory.startModule(koRef, jqRef);
        });
    } else {
        moduleFactory.startModule(window.ko, jQuery);
    }
}(ApplicationInitializer));