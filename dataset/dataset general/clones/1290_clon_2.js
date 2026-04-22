/**
 * JQ Web Framework Style Selector v2.0.0
 * https://github.com/dev/webStyleManager
 *
 * Copyright 2023, John Doe
 * Licensed under Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0)
 */
; ( function ($, winObj, docObj, notDefined) {

    "use strict";

    // Store a reference to the previous plugin definition
    var previousPlugin = $.fn.webStyleManager;

    // Core Component Initializer
    var WebStyleManager = function (targetElement, configSettings) {

        this.hostElement = $(targetElement);
        this.configuration = $.extend({}, $.fn.webStyleManager.defaultConfiguration, configSettings);
        this.styleOptions = [];
        this.fetchStyles();

        return this;
    };

    // Component Methods
    WebStyleManager.prototype = {

        // Empties the control's content
        reset: function () {
            console.log('webStyleManager.reset invoked');
            return this.hostElement.each(function () {
                $(this).empty();
            });
        },

        // Refreshes the list of available styles
        refresh: function () {
            console.log('webStyleManager.refresh triggered');
            this.fetchStyles();
        },

        // Activates a specified style
        activateStyle: function (styleName, stylePath) {
            console.log('webStyleManager.activateStyle: name: "' + styleName + '", path: "' + stylePath + '"');
            var currentInstance = $(this);
            var currentSettings = $.extend({}, $.fn.webStyleManager.defaultConfiguration, currentInstance.data('webStyleManager'));

            var styleSheetId = currentSettings.styleLinkIdentifier;

            if (stylePath === notDefined) {
                stylePath = this.configuration.fallbackStylePath;
            }
            if (styleName === notDefined) {
                styleName = stylePath;
            }

            // Remove any existing framework stylesheets that are not the active theme ones
            $('head link[href*="framework.min.css"][id!="' + styleSheetId + '"]').remove();

            // Update or add the style file
            var styleSelector = '#' + styleSheetId;
            var linkElement = $(styleSelector);
            if (linkElement.length === 0) {
                var linkMarkup = "<link rel='stylesheet' id='" + styleSheetId + "' href='" + stylePath + "' type='text/css' />";
                var initialLink = $('head link[rel="stylesheet"]:first');
                if (initialLink.length === 0) {
                    $('head').append(linkMarkup);
                } else {
                    initialLink.before(linkMarkup);
                }
                linkElement = $(styleSelector);
            }
            linkElement.attr('href', stylePath);

            // Check if persistence is enabled
            if (currentSettings.enablePersistence) {
                if ($.storage === notDefined) { // Using $.storage as a hypothetical cookie plugin
                    console.warn('webStyleManager: enablePersistence is true but $.storage is unavailable');
                    return;
                }
                $.storage(currentSettings.persistentNameKey, styleName, { expiry: currentSettings.persistenceExpiryDays, path: currentSettings.persistencePath });
                $.storage(currentSettings.persistentCssKey, stylePath, { expiry: currentSettings.persistenceExpiryDays, path: currentSettings.persistencePath });
            }
        },

        // Loads a style from storage if available
        retrieveStyleFromStorage: function (callOptions) {
            if ($.storage === notDefined) {
                console.warn('webStyleManager: retrieveStyleFromStorage called but $.storage not found');
                return;
            }
            var currentSettings = $.extend({}, $.fn.webStyleManager.defaultConfiguration, callOptions);
            var storedStyleName = $.storage(currentSettings.persistentNameKey);
            var storedStylePath = $.storage(currentSettings.persistentCssKey);
            this.activateStyle(storedStyleName, storedStylePath);
        },

        // Adds a new style option to the list
        addStyleOption: function (styleName, cdnUrl, startIndex, removeCount) {
            if (startIndex === notDefined) {
                startIndex = 0;
            }
            if (removeCount === notDefined) {
                removeCount = 0;
            }
            this.styleOptions.splice(startIndex, removeCount, { name: styleName, cdnUrl: cdnUrl });
            this.populateControl();
        },

        // Populates the UI control with available style options
        populateControl: function () {

            if (this.hostElement === notDefined) {
                console.error('webStyleSelector: populateControl: Host element is undefined');
                return;
            }

            if (this.styleOptions === notDefined) {
                console.error('webStyleSelector: populateControl: Style options list is undefined');
                return;
            }

            // Handle exclusions for external framework styles
            if (this.configuration.excludedExternalThemes) {
                // Split the exclusion string
                var excludedFrameworks = [];
                if (this.configuration.excludedExternalThemes.indexOf(",") !== -1) {
                    excludedFrameworks = this.configuration.excludedExternalThemes.split(',');
                } else {
                    excludedFrameworks.push(this.configuration.excludedExternalThemes);
                }

                var temporaryStyleList = this.styleOptions;
                $.each(temporaryStyleList, function (idx, styleItem) {
                    if (styleItem && styleItem.name) {
                        if (jQuery.inArray(styleItem.name, excludedFrameworks) !== -1) {
                            temporaryStyleList.splice(idx, 1);
                        }
                    }
                });
                this.styleOptions = temporaryStyleList;
            }

            var selfRef = this;

            if (this.hostElement.is('ul')) {

                console.log('webStyleSelector: Unordered list element detected');
                this.hostElement.empty();

                var currentClass;
                $.each(this.styleOptions, function (idx, styleItem) {
                    // Mark the currently active style
                    currentClass = null;
                    if (styleItem.name === $.storage('persistentNameKey')) {
                        currentClass = "current";
                    }
                    var listItem = $("<li />")
                        .attr("class", currentClass)
                        .append("<a href='#'>" + styleItem.name + "</a>")
                        .on('click', function () {
                            selfRef.activateStyle(styleItem.name, styleItem.cdnUrl);

                            // Update active state in the UI
                            $(this).parent().find("li").removeClass("current");
                            $(this).addClass("current");
                        });
                    selfRef.hostElement.append(listItem);
                });

            } else if (this.hostElement.is('select')) {
                console.log('webStyleSelector: Select dropdown element detected');
                this.hostElement.empty();

                var selectionIndicator;
                $.each(this.styleOptions, function (idx, styleItem) {
                    selectionIndicator = null;
                    if (styleItem.name === $.storage('persistentNameKey')) {
                        selectionIndicator = "selected";
                    }
                    selfRef.hostElement.append("<option " + selectionIndicator + " value='" + styleItem.cdnUrl + "'>" + styleItem.name + "</option>");
                });
                this.hostElement.on('change', function () {
                    var chosenOption = $("option:selected", this);
                    selfRef.activateStyle(chosenOption.text(), chosenOption.val());
                });

            } else {
                console.warn('webStyleSelector only supports ul or select elements');
            }
        },

        // Fetches the list of styles from a source
        fetchStyles: function () {

            var selfRef = this;

            if (this.configuration.localJsonFeed !== null && this.configuration.localJsonFeed !== '') {
                // Retrieve from a local JSON file

                $.ajax({
                    url: this.configuration.localJsonFeed,
                    async: false,
                    dataType: 'json',
                    success: function (responseData) {
                        selfRef.styleOptions = responseData.styles;
                        selfRef.populateControl();
                    },
                    error: function (ajaxRequest, statusInfo, errorDetails) {
                        console.error("Failed to retrieve local feed from '" + selfRef.configuration.localJsonFeed + "'");
                    }

                });
                return;
            }

            // Fallback to external API if no local feed
            $.ajax({
                url: this.configuration.externalApiUrl + "/" + this.configuration.externalApiVer,
                async: false,
                dataType: 'json',
                success: function (responseData) {
                    if (responseData.styles === notDefined) {
                        return null;
                    }
                    selfRef.styleOptions = responseData.styles;
                    // Add a default style option at the beginning
                    selfRef.styleOptions.splice(0, 0, { name: 'default', cdnUrl: selfRef.configuration.defaultStyleUrl });

                    selfRef.populateControl();
                }
            });
        },

        // Getter/Setter for the style collection
        styleCollection: function (updatedStyleList) {
            if (updatedStyleList === notDefined) {
                return this.styleOptions;
            }
            else {
                // Update the internal list and potentially the control
                this.styleOptions = updatedStyleList;
                // TODO: Re-render the associated control here if needed.
            }
        }
    };


    // jQuery Plugin Definition
    $.fn.webStyleManager = function (actionCommand) {
        var methodArguments = Array.prototype.slice.call(arguments, 1);
        var returnedValue;

        var currentElement = $(this);
        var instanceData = currentElement.data('webStyleManager');
        var configObject = typeof actionCommand === 'object' && actionCommand;

        if (!instanceData) {
            currentElement.data('webStyleManager', (instanceData = new WebStyleManager(this, configObject)));
        }
        if (typeof actionCommand === 'string') {
            returnedValue = instanceData[actionCommand].apply(instanceData, methodArguments);
        }
        return (returnedValue === notDefined) ? currentElement : returnedValue;
    };

    // Default configuration for the plugin
    $.fn.webStyleManager.defaultConfiguration = {
        styleLinkIdentifier: 'appStyle',
        enablePersistence: true,
        persistentNameKey: 'appStyle.name',
        persistentCssKey: 'appStyle.css',
        persistenceExpiryDays: 7,
        persistencePath: '/',
        defaultStyleUrl: '//cdn.jsdelivr.net/npm/bootstrap@3.2.0/dist/css/bootstrap.min.css',
        externalApiUrl: 'https://api.bootswatch.com',
        externalApiVer: '3',
        loadFromExternalSource: true,
        localJsonFeed: '',
        excludedExternalThemes: ''
    };

    // Expose the constructor
    $.fn.webStyleManager.Initializer = WebStyleManager;

    // No conflict mode for the plugin
    $.fn.webStyleManager.avoidCollisions = function () {
        $.fn.WebStyleManager = previousPlugin;
        return this;
    };

})(jQuery, window, document);