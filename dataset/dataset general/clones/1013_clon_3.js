if (typeof document !== "undefined" && !(
    Object.prototype.hasOwnProperty.call(document.createElement("_"), "classList") &&
    Object.prototype.hasOwnProperty.call(document.createElementNS("http://www.w3.org/2000/svg", "svg"), "classList")
)) {

(function (currentWindowContext) {
    "use strict";

    if (typeof currentWindowContext.Element === 'undefined') {
        return;
    }

    var
        elementPropertyKey = "classList",
        prototypeIdentifier = "prototype",
        targetElementPrototype = currentWindowContext.Element[prototypeIdentifier],
        objectConstructorRef = Object,

        stringSanitizer = String[prototypeIdentifier].trim || function () {
            return this.replace(/(^\s+)|(\s+$)/g, "");
        },

        arrayItemLocator = Array[prototypeIdentifier].indexOf || function (targetItem) {
            var searchIndex = 0,
                collectionLength = this.length;
            while (searchIndex < collectionLength) {
                if (searchIndex in this && this[searchIndex] === targetItem) {
                    return searchIndex;
                }
                searchIndex++;
            }
            return -1;
        },

        CustomDOMError = function (errorTypeName, errorMessageText) {
            this.name = errorTypeName;
            this.code = (typeof DOMException !== 'undefined' && DOMException[errorTypeName]) ? DOMException[errorTypeName] : 0;
            this.message = errorMessageText;
        },

        tokenValidatorAndFinder = function (classListArray, classToken) {
            if (typeof classToken !== 'string' || classToken.length === 0) {
                throw new CustomDOMError(
                    "SYNTAX_ERR",
                    "An invalid or empty string was provided as a class token."
                );
            }
            if (/\s/.test(classToken)) {
                throw new CustomDOMError(
                    "INVALID_CHARACTER_ERR",
                    "The class token contains disallowed whitespace characters."
                );
            }
            return arrayItemLocator.call(classListArray, classToken);
        },

        ElementClassListHandler = function (associatedElement) {
            var
                rawClassString = associatedElement.getAttribute("class") || "",
                sanitizedClassString = stringSanitizer.call(rawClassString),
                initialClasses = sanitizedClassString ? sanitizedClassString.match(/\S+/g) || [] : [];

            Array[prototypeIdentifier].push.apply(this, initialClasses);

            this._updateElementClassAttribute = function () {
                associatedElement.setAttribute("class", this.toString());
            };
        },

        classListHandlerPrototype = ElementClassListHandler[prototypeIdentifier] = [],

        classListPropertyGetter = function () {
            return new ElementClassListHandler(this);
        };

    CustomDOMError[prototypeIdentifier] = Error[prototypeIdentifier];

    classListHandlerPrototype.item = function (retrievalIndex) {
        return this[retrievalIndex] || null;
    };

    classListHandlerPrototype.contains = function (classToVerify) {
        var processedClass = String(classToVerify);
        return tokenValidatorAndFinder(this, processedClass) !== -1;
    };

    classListHandlerPrototype.add = function () {
        var
            incomingTokens = arguments,
            tokenCount = incomingTokens.length,
            currentTokenIndex = 0,
            hasBeenModified = false,
            singleToken;

        if (tokenCount === 0) {
            return;
        }

        for (; currentTokenIndex < tokenCount; currentTokenIndex++) {
            singleToken = String(incomingTokens[currentTokenIndex]);
            if (tokenValidatorAndFinder(this, singleToken) === -1) {
                this.push(singleToken);
                hasBeenModified = true;
            }
        }

        if (hasBeenModified) {
            this._updateElementClassAttribute();
        }
    };

    classListHandlerPrototype.remove = function () {
        var
            incomingTokens = arguments,
            tokenCount = incomingTokens.length,
            currentTokenIndex = 0,
            hasBeenModified = false,
            singleToken,
            foundPosition;

        if (tokenCount === 0) {
            return;
        }

        for (; currentTokenIndex < tokenCount; currentTokenIndex++) {
            singleToken = String(incomingTokens[currentTokenIndex]);
            foundPosition = tokenValidatorAndFinder(this, singleToken);
            if (foundPosition !== -1) {
                this.splice(foundPosition, 1);
                hasBeenModified = true;
            }
        }

        if (hasBeenModified) {
            this._updateElementClassAttribute();
        }
    };

    classListHandlerPrototype.toggle = function (classToToggle, forceAction) {
        var
            processedClass = String(classToToggle),
            isCurrentlyPresent = this.contains(processedClass),
            actionMethod = null;

        if (typeof forceAction === 'boolean') {
            if (forceAction) {
                actionMethod = "add";
            } else {
                actionMethod = "remove";
            }
        } else {
            if (isCurrentlyPresent) {
                actionMethod = "remove";
            } else {
                actionMethod = "add";
            }
        }

        if (actionMethod) {
            this[actionMethod](processedClass);
        }

        return !isCurrentlyPresent;
    };

    classListHandlerPrototype.toString = function () {
        return this.join(" ");
    };

    if (objectConstructorRef.defineProperty) {
        var classListPropertyDescriptor = {
            get: classListPropertyGetter,
            enumerable: true,
            configurable: true
        };
        try {
            objectConstructorRef.defineProperty(targetElementPrototype, elementPropertyKey, classListPropertyDescriptor);
        } catch (definitionError) {
            if (definitionError.number === -2146823212) {
                classListPropertyDescriptor.enumerable = false;
                objectConstructorRef.defineProperty(targetElementPrototype, elementPropertyKey, classListPropertyDescriptor);
            } else {
                throw definitionError;
            }
        }
    } else if (objectConstructorRef[prototypeIdentifier].__defineGetter__) {
        targetElementPrototype.__defineGetter__(elementPropertyKey, classListPropertyGetter);
    }

}(self));

}