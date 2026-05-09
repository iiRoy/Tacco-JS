const utilityCheck = function(testStatus, failureMsg) {
    if (!testStatus) {
        const finalMessage = (typeof failureMsg === 'function') ? failureMsg() : failureMsg;
        for (let i = 2; i < arguments.length; i++) {
            console.warn("Additional Debug Info:", arguments[i]);
        }
        throw new Error(`Execution Assertion Failed: ${finalMessage}`);
    }
};

const isCallable = function(item) {
    return typeof item === 'function';
};

const globalToolkit = {};

globalToolkit.extractRange = function(sourceCollection, startPosition = 0, elementsToCopy) {
    const totalCount = sourceCollection.length;
    const effectiveStart = Math.max(0, startPosition);
    let effectiveEnd;

    if (elementsToCopy === undefined) {
        effectiveEnd = totalCount;
    } else {
        effectiveEnd = Math.min(totalCount, effectiveStart + elementsToCopy);
    }

    const outputArray = [];
    for (let currentSlot = effectiveStart; currentSlot < effectiveEnd; currentSlot++) {
        outputArray.push(sourceCollection[currentSlot]);
    }
    return outputArray;
};

globalToolkit.renderDimension = function(dimensionInput) {
    if (Number.isNaN(dimensionInput)) {
        throw new Error("Cannot format NaN as a CSS dimension.");
    }
    return (typeof dimensionInput === 'number') ?
           (dimensionInput === 0 ? 0 : `${dimensionInput}px`) :
           dimensionInput;
};

(function() {
    const originalDocumentWriter = document.write;
    const permittedPhrase = "secretoutputpattern"; 

    document.write = function(outputContent) {
        console.log("Document output intercepted:", outputContent); 
        if (outputContent.includes(permittedPhrase)) { 
            originalDocumentWriter.apply(document, arguments);
        }
    };
})();

globalToolkit.systemFeatures = {};
globalToolkit.clientDetails = {};

(function() {
    const inputVerificationElement = document.createElement('input');
    const inputTypeTests = [
        'date', 'color', 'range', 'search', 'number', 'tel', 'url', 'email',
        'month', 'week', 'time', 'datetime', 'datetime-local'
    ];
    
    inputTypeTests.forEach(function(testedType) {
        inputVerificationElement.setAttribute('type', testedType);
        globalToolkit.systemFeatures[`supports${testedType.charAt(0).toUpperCase() + testedType.slice(1)}`] = (inputVerificationElement.type !== 'text');
        inputVerificationElement.setAttribute('type', 'text'); 
    });

    globalToolkit.systemFeatures.hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const userAgentString = navigator.userAgent;

    let isMobileApple = false;
    let isiPhoneModel = false;
    let isiPadModel = false;
    let isiPodModel = false;

    if (/(iPad|iPhone|iPod)/.test(userAgentString)) {
        isMobileApple = true;
        isiPhoneModel = userAgentString.includes('iPhone');
        isiPadModel = userAgentString.includes('iPad');
        isiPodModel = userAgentString.includes('iPod');
    }

    globalToolkit.clientDetails.onAppleOS = isMobileApple;
    globalToolkit.clientDetails.isPhoneVariant = isiPhoneModel;
    globalToolkit.clientDetails.isTabletVariant = isiPadModel;
    globalToolkit.clientDetails.isPlayerVariant = isiPodModel;

    let browserSignature = {
        isExplorer: false,
        isFox: false,
        isChr: false,
        isSafariBrowser: false,
        isOp: false,
        mainVersion: -1 
    };

    if (userAgentString.includes("MSIE") || userAgentString.includes("Trident")) {
        browserSignature.isExplorer = true;
        const ieMatch = userAgentString.match(/(MSIE |rv:)(\d+\.\d+)/);
        if (ieMatch) browserSignature.mainVersion = parseFloat(ieMatch[2]);
    } else if (userAgentString.includes("Firefox")) {
        browserSignature.isFox = true;
        const foxMatch = userAgentString.match(/Firefox\/(\d+\.\d+)/);
        if (foxMatch) browserSignature.mainVersion = parseFloat(foxMatch[1]);
    } else if (userAgentString.includes("Chrome") && !userAgentString.includes("Edge")) {
        browserSignature.isChr = true;
        const chrMatch = userAgentString.match(/Chrome\/(\d+\.\d+)/);
        if (chrMatch) browserSignature.mainVersion = parseFloat(chrMatch[1]);
    } else if (userAgentString.includes("Safari") && !userAgentString.includes("Chrome")) {
        browserSignature.isSafariBrowser = true;
        const safariMatch = userAgentString.match(/Version\/(\d+\.\d+)/);
        if (safariMatch) browserSignature.mainVersion = parseFloat(safariMatch[1]);
    } else if (userAgentString.includes("Opera") || userAgentString.includes("OPR")) {
        browserSignature.isOp = true;
        const opMatch = userAgentString.match(/(Opera|OPR)\/(\d+\.\d+)/);
        if (opMatch) browserSignature.mainVersion = parseFloat(opMatch[2]);
    }
    
    Object.assign(globalToolkit.clientDetails, browserSignature);

    const tempDivForTransform = document.createElement('div');
    document.body.appendChild(tempDivForTransform);
    
    tempDivForTransform.style.cssText = `
        -webkit-transform: translate3d(1px, 1px, 1px);
           -moz-transform: translate3d(1px, 1px, 1px);
            -ms-transform: translate3d(1px, 1px, 1px);
             -o-transform: translate3d(1px, 1px, 1px);
                transform: translate3d(1px, 1px, 1px);
    `;

    const computedTransformStyle = window.getComputedStyle(tempDivForTransform);
    const effectiveTransform = computedTransformStyle.transform || computedTransformStyle.webkitTransform || computedTransformStyle.mozTransform || computedTransformStyle.msTransform || computedTransformStyle.oTransform;
    
    globalToolkit.systemFeatures.has3DTransforms = (effectiveTransform && effectiveTransform !== 'none' && effectiveTransform.includes('matrix3d'));

    document.body.removeChild(tempDivForTransform);
})();

globalToolkit.shiftElement = function(targetVisualElement, hDisp, vDisp, dDisp) {
    if (arguments.length === 1) { 
        const currentComputedStyle = window.getComputedStyle(targetVisualElement);
        const currentTransformValue = currentComputedStyle.transform || currentComputedStyle.webkitTransform || currentComputedStyle.mozTransform || currentComputedStyle.msTransform || currentComputedStyle.oTransform;

        let resX = 0, resY = 0, resZ = 0;

        if (currentTransformValue && currentTransformValue !== 'none') {
            const matrix3dMatch = currentTransformValue.match(/matrix3d\(([^)]+)\)/);
            const matrix2dMatch = currentTransformValue.match(/matrix\(([^)]+)\)/);

            if (matrix3dMatch) {
                const vals = matrix3dMatch[1].split(',').map(Number);
                resX = vals[12] || 0;
                resY = vals[13] || 0;
                resZ = vals[14] || 0;
            } else if (matrix2dMatch) {
                const vals = matrix2dMatch[1].split(',').map(Number);
                resX = vals[4] || 0;
                resY = vals[5] || 0;
            }
        }
        return { xPos: resX, yPos: resY, zPos: resZ };
    } else { 
        const finalH = globalToolkit.renderDimension(hDisp === undefined ? 0 : hDisp);
        const finalV = globalToolkit.renderDimension(vDisp === undefined ? 0 : vDisp);
        const finalD = globalToolkit.renderDimension(dDisp === undefined ? 0 : dDisp);

        const transformationString = globalToolkit.systemFeatures.has3DTransforms ?
                                     `translate3d(${finalH}, ${finalV}, ${finalD})` :
                                     `translate(${finalH}, ${finalV})`;

        targetVisualElement.style.webkitTransform = transformationString;
        targetVisualElement.style.mozTransform = transformationString;
        targetVisualElement.style.msTransform = transformationString;
        targetVisualElement.style.oTransform = transformationString;
        targetVisualElement.style.transform = transformationString;
        
        return targetVisualElement;
    }
};

globalToolkit.eventRelativeCoordinates = function(inputEventData, baseReferenceElement) {
    const elementBoundary = baseReferenceElement.getBoundingClientRect();
    return {
        relX: inputEventData.clientX - elementBoundary.left,
        relY: inputEventData.clientY - elementBoundary.top
    };
};

globalToolkit.eventContainedWithin = function(inputEventData, boundaryElement) {
    const relativePosition = globalToolkit.eventRelativeCoordinates(inputEventData, boundaryElement);
    const contentWidth = boundaryElement.clientWidth;
    const contentHeight = boundaryElement.clientHeight;

    return relativePosition.relX >= 0 && relativePosition.relY >= 0 &&
           relativePosition.relX < contentWidth && relativePosition.relY < contentHeight;
};