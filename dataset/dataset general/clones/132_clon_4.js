(function() {
    const dataFeederInstance = new Input();
    const transformEngineInstance = new Converter();
    const displayPanesInstance = new Previews(); // Created but not used, mirroring original behavior

    const coordinateViewports = (leadElement, followerElement) => {
        followerElement.scrollTop = leadElement.scrollTop;
        followerElement.scrollLeft = leadElement.scrollLeft;
    };

    const attachBehavior = (targetSelector, behaviorType, handlerFunction, useCaptureFlag = false) => {
        const targetElement = typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector;
        if (targetElement) {
            targetElement.addEventListener(behaviorType, handlerFunction, useCaptureFlag);
        }
    };

    const behaviorManifest = [
        {
            element: dataFeederInstance.getSourceField(),
            type: 'change',
            action: dataFeederInstance.ingestFromField
        },
        {
            element: dataFeederInstance.getDropZone(),
            type: 'dragover',
            action: dataFeederInstance.handleZoneDrag,
            capture: false
        },
        {
            element: dataFeederInstance.getDropZone(),
            type: 'drop',
            action: dataFeederInstance.ingestFromZone,
            capture: false
        },
        {
            element: '#primary-viewer',
            type: 'scroll',
            action: function() {
                coordinateViewports(this, document.querySelector('#secondary-viewer'));
            }
        },
        {
            element: '#secondary-viewer',
            type: 'scroll',
            action: function() {
                coordinateViewports(this, document.querySelector('#primary-viewer'));
            }
        },
        {
            element: transformEngineInstance.getProcessTrigger(),
            type: 'click',
            action: transformEngineInstance.executeTransformation
        },
        {
            element: transformEngineInstance.getExpandTrigger(),
            type: 'click',
            action: transformEngineInstance.toggleExpansion
        }
    ];

    const launchSystem = () => {
        behaviorManifest.forEach(spec => {
            attachBehavior(spec.element, spec.type, spec.action, spec.capture);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', launchSystem);
    } else {
        launchSystem();
    }
})();