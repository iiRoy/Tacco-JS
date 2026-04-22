(function(globalReference, documentReference, targetElement) {
    const styleDesignation = "widget-styling";

    let processInitiated = false;

    const applyDesignatedStyle = (elementToStyle, styleText) => {
        if (typeof globalReference.$ !== "undefined") {
            globalReference.$(elementToStyle).addClass(styleText);
        } else if (elementToStyle.classList) {
            elementToStyle.classList.add(styleText);
        } else {
            elementToStyle.className += styleText;
        }
    };

    const executeStyleApplication = () => {
        applyDesignatedStyle(targetElement, styleDesignation);
    };

    const handleScrollEvent = () => {
        if (!processInitiated && globalReference.pageYOffset > 2) {
            processInitiated = true;
            globalReference.removeEventListener("scroll", handleScrollEvent, false);
            executeStyleApplication();
        }
    };

    const initializeStylingModule = () => {
        if (globalReference.addEventListener) {
            globalReference.addEventListener("scroll", handleScrollEvent, false);
        } else {
            executeStyleApplication();
        }
    };

    const publicInterface = () => {
        initializeStylingModule();
    };

    if (typeof define !== "undefined") {
        define([], function() {
            return publicInterface;
        });
    } else {
        globalReference.BodyModifier = publicInterface;
    }

})(window, document, document.body);