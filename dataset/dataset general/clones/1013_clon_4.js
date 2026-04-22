if (self.document && !(document.createElement("temp").classList && document.createElementNS("http://www.w3.org/2000/svg", "s").classList)) {

(function (contextWindow) {

"use strict";

if (!('Element' in contextWindow)) return;

var
      styleGroupIdentifier = "classList"
    , baseObjectPrototype = "prototype"
    , domElementBase = contextWindow.Element[baseObjectPrototype]
    , objectCore = Object
    , cleanString = String[baseObjectPrototype].trim || function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    }
    , locateItem = Array[baseObjectPrototype].indexOf || function (targetItem) {
        var
              iterator = 0
            , quantity = this.length
        ;
        for (; iterator < quantity; iterator++) {
            if (iterator in this && this[iterator] === targetItem) {
                return iterator;
            }
        }
        return -1;
    }
    , ErrorComposer = function (errKind, errMessage) {
        this.name = errKind;
        this.code = DOMException[errKind];
        this.message = errMessage;
    }
    , validateAndFindStyle = function (styleCollectionRef, styleTerm) {
        if (styleTerm === "") {
            throw new ErrorComposer(
                  "SYNTAX_ERR"
                , "An empty or invalid string was provided"
            );
        }
        if (/\s/.test(styleTerm)) {
            throw new ErrorComposer(
                  "INVALID_CHARACTER_ERR"
                , "String argument contains an inappropriate character"
            );
        }
        return locateItem.call(styleCollectionRef._entries, styleTerm);
    }
    , StyleCollection = function (domElement) {
        var
              rawClassAttribute = domElement.getAttribute("class") || ""
            , processedClasses = cleanString.call(rawClassAttribute)
            , individualClasses = processedClasses ? processedClasses.split(/\s+/) : []
            , counter = 0
            , totalCount = individualClasses.length
        ;
        this._entries = [];
        for (; counter < totalCount; counter++) {
            this._entries.push(individualClasses[counter]);
        }
        this._associatedElement = domElement;
    }
    , styleCollectionPrototype = StyleCollection[baseObjectPrototype]
    , retrieveStyleCollection = function () {
        return new StyleCollection(this);
    }
;

ErrorComposer[baseObjectPrototype] = Error[baseObjectPrototype];

objectCore.defineProperty(styleCollectionPrototype, 'length', {
    get: function() { return this._entries.length; },
    enumerable: true,
    configurable: true
});

styleCollectionPrototype.syncStyleAttribute = function () {
    this._associatedElement.setAttribute("class", this.toString());
};

styleCollectionPrototype.item = function (idx) {
    return this._entries[idx] || null;
};

styleCollectionPrototype.contains = function (term) {
    term += "";
    return validateAndFindStyle(this, term) !== -1;
};

styleCollectionPrototype.add = function () {
    var
          inputTerms = arguments
        , currentIdx = 0
        , numTerms = inputTerms.length
        , currentTerm
        , modifiedStatus = false
    ;
    for (; currentIdx < numTerms; currentIdx++) {
        currentTerm = inputTerms[currentIdx] + "";
        if (validateAndFindStyle(this, currentTerm) === -1) {
            this._entries.push(currentTerm);
            modifiedStatus = true;
        }
    }

    if (modifiedStatus) {
        this.syncStyleAttribute();
    }
};

styleCollectionPrototype.remove = function () {
    var
          inputTerms = arguments
        , currentIdx = 0
        , numTerms = inputTerms.length
        , currentTerm
        , modifiedStatus = false
    ;
    for (; currentIdx < numTerms; currentIdx++) {
        currentTerm = inputTerms[currentIdx] + "";
        var foundPosition = validateAndFindStyle(this, currentTerm);
        if (foundPosition !== -1) {
            this._entries.splice(foundPosition, 1);
            modifiedStatus = true;
        }
    }

    if (modifiedStatus) {
        this.syncStyleAttribute();
    }
};

styleCollectionPrototype.toggle = function (term, forceState) {
    term += "";

    var
          isCurrentlyPresent = this.contains(term)
        , actionToPerform = isCurrentlyPresent ?
            forceState !== true && "remove"
        :
            forceState !== false && "add"
    ;

    if (actionToPerform) {
        this[actionToPerform](term);
    }

    return !isCurrentlyPresent;
};

styleCollectionPrototype.toString = function () {
    return this._entries.join(" ");
};

if (objectCore.defineProperty) {
    var stylePropertyDescriptor = {
          get: retrieveStyleCollection
        , enumerable: true
        , configurable: true
    };
    try {
        objectCore.defineProperty(domElementBase, styleGroupIdentifier, stylePropertyDescriptor);
        if ('SVGElement' in contextWindow && contextWindow.SVGElement[baseObjectPrototype] !== domElementBase) {
            objectCore.defineProperty(contextWindow.SVGElement[baseObjectPrototype], styleGroupIdentifier, stylePropertyDescriptor);
        }
    } catch (exceptionDetails) {
        if (exceptionDetails.number === -0x7FF5EC54) {
            stylePropertyDescriptor.enumerable = false;
            objectCore.defineProperty(domElementBase, styleGroupIdentifier, stylePropertyDescriptor);
            if ('SVGElement' in contextWindow && contextWindow.SVGElement[baseObjectPrototype] !== domElementBase) {
                objectCore.defineProperty(contextWindow.SVGElement[baseObjectPrototype], styleGroupIdentifier, stylePropertyDescriptor);
            }
        }
    }
} else if (objectCore[baseObjectPrototype].__defineGetter__) {
    domElementBase.__defineGetter__(styleGroupIdentifier, retrieveStyleCollection);
    if ('SVGElement' in contextWindow && contextWindow.SVGElement[baseObjectPrototype] !== domElementBase) {
        contextWindow.SVGElement[baseObjectPrototype].__defineGetter__(styleGroupIdentifier, retrieveStyleCollection);
    }
}

}(self));

}