/*  CSS-Enhancer.js – A utility for extending CSS capabilities

This JavaScript module acts as an interpreter, enabling scripts to read custom CSS declarations
and execute corresponding functions based on the assigned selector and property value.

*/

var propProcessor = {

    declarationRegistry: {},

    callbackCollection: {},

    bootStrap: function (initialSettings) {

        this.callbackCollection = initialSettings;

        this.retrieveStyleContent(initialSettings);

    },

    countObjectProperties: function (targetObject) {

        var propertyCounter = 0;
        var currentKey;

        for (currentKey in targetObject) {
            if (targetObject.hasOwnProperty(currentKey)) propertyCounter++;
        }

        return propertyCounter;

    },

    ensureArraySlice: function () { // Provides Array.prototype.slice functionality for older IE browsers

        'use strict';
        var nativeSliceMethod = Array.prototype.slice;

        try {
            nativeSliceMethod.call(document.documentElement);
        }
        catch (errorObj) { // Fails in Internet Explorer prior to version 9

            Array.prototype.slice = function (startIdx, endIdx) {

                var idx, sourceLength = this.length, temporaryArray = [];

                if (this.charAt) {

                    for (idx = 0; idx < sourceLength; idx++) {
                        temporaryArray.push(this.charAt(idx));
                    }

                }
                else {

                    for (idx = 0; idx < this.length; idx++) {
                        temporaryArray.push(this[idx]);
                    }

                }

                return nativeSliceMethod.call(temporaryArray, startIdx, endIdx || temporaryArray.length);

            };

        }

    },

    obtainExternalFile: function (configData, fileUrl, sourceIndex) {

        var xhrRequest;

        if (window.XMLHttpRequest) xhrRequest = new XMLHttpRequest();
        else xhrRequest = new ActiveXObject("Microsoft.XMLHTTP");

        xhrRequest.open("GET", fileUrl, true);

        xhrRequest.onreadystatechange = function () {

            if (this.readyState === 4 && this.status === 200) propProcessor.parseStyleRules(configData, this.responseText, sourceIndex);

        };

        xhrRequest.send(null);

    },

    retrieveStyleContent: function (configData) {

        var styleTextBuffer = []; // This variable is not used in the original logic, kept for structural fidelity.
        var cssSourceElements = Array.prototype.slice.call(document.getElementsByTagName('link')); // Collect external stylesheet links

        cssSourceElements.push(Array.prototype.slice.call(document.getElementsByTagName('style'))[0]); // Include inline <style> block

        cssSourceElements.reverse();

        var remainingSources = this.countObjectProperties(cssSourceElements);

        while (remainingSources-- > 0) {

            var currentSourceElement = cssSourceElements[remainingSources];

            if (currentSourceElement.innerHTML) this.parseStyleRules(configData, currentSourceElement.innerHTML, remainingSources);
            else if (currentSourceElement.href && currentSourceElement.href.match(document.domain)) this.obtainExternalFile(configData, currentSourceElement.href, remainingSources);

        }

    },

    evaluatePropertySupport: function (cssPropertyName) {

        var camelCaseName = cssPropertyName.replace(/(^|-)([a-z])/g, function (fullMatchText, separatorChar, initialLetter) { return initialLetter.toUpperCase(); });

        if (('Webkit' + camelCaseName) in document.body.style
            || ('Moz' + camelCaseName) in document.body.style
            || ('O' + camelCaseName) in document.body.style
            || cssPropertyName in document.body.style) return true;

        else return false;

    },

    parseStyleRules: function (configData, styleBlockContent, sourceIndex) {

        if (styleBlockContent) {

            var handlerCount = this.countObjectProperties(configData);

            for (var handlerKey in configData) {

                var ruleExtractionRegex = new RegExp('([^}{]+){([^}]+)?' + handlerKey.replace('-', '\\-') + '[\\s\\t]*:[\\s\\t]*([^;]+)', 'gi'),
                    ruleMatchResult;

                var propertySupportStatus = propProcessor.evaluatePropertySupport(handlerKey);

                while (ruleMatchResult = ruleExtractionRegex.exec(styleBlockContent)) {

                    var selectorListString = ruleMatchResult[1].replace(/^([\s\n\r\t]+|\/\*.*?\*\/)+/, '').replace(/[\s\n\r\t]+$/, '');
                    var declarationValue = ruleMatchResult[3];

                    selectorListString = selectorListString.split(',');

                    for (var selectorIndex in selectorListString) {

                        var individualSelector = selectorListString[selectorIndex];

                        if (!propProcessor.declarationRegistry[individualSelector]) propProcessor.declarationRegistry[individualSelector] = {};
                        propProcessor.declarationRegistry[individualSelector][handlerKey] = {
                            'isSupported': propertySupportStatus,
                            'propValue': declarationValue
                        };

                    }

                }

            }

            if (sourceIndex === 1) this.executeCallbacks();

        }

    },

    executeCallbacks: function () {

        var registeredDeclarations = propProcessor.declarationRegistry;
        var registeredCallbacks = propProcessor.callbackCollection;

        for (var selectorIdentifier in registeredDeclarations) {

            var declarationSet = registeredDeclarations[selectorIdentifier];

            for (var declarationKey in declarationSet) {

                var currentDeclaration = declarationSet[declarationKey];
                var associatedCallback = registeredCallbacks[declarationKey];

                var formattedDeclaration = {

                    isSupported: currentDeclaration['isSupported'],
                    targetSelector: selectorIdentifier,
                    propName: declarationKey,
                    propValue: currentDeclaration['propValue']

                };

                associatedCallback(formattedDeclaration);

            }

        }

    },

    attachEventHandler: function (domElement, eventTypes, callbackFunction) {

        var eventTypeArray = eventTypes.split(',');
        var eventTypeCounter = eventTypeArray.length;

        while (eventTypeCounter-- > 0) {

            if (domElement.attachEvent) domElement.attachEvent('on' + eventTypeArray[eventTypeCounter].trim(), callbackFunction);
            else domElement.addEventListener(eventTypeArray[eventTypeCounter].trim(), callbackFunction, false);

        }

    }

};