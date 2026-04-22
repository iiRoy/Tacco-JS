var mediaQueryEvaluationFacade = (function() {
    var absenceWarning = 'affinity-script: Browser lacks matchMedia support. Media queries will be ignored. Polyfill to enable.';
    if (window.console && console.warn && !window.matchMedia) {
        console.warn(absenceWarning);
    }

    return window.matchMedia || function() {
        return {
            matches: true
        };
    };
}());

function createAdherenceManager(targetElement, configuration) {
    let managedElement = targetElement;
    let currentAdherenceState = false;
    let priorPositionCoordinate = 0;
    let engagementThreshold = 0;
    let capturedElementStyling = {};
    let accompanyingSpacer = null;

    const constraintExpression = configuration.constraintExpression || null;
    const affixedCssClass = configuration.affixedCssClass || '';
    const documentBodyCssClass = configuration.documentBodyCssClass || '';
    const employSpacerElement = configuration.employSpacerElement === true;
    const originalStyleAttributeValue = managedElement.getAttribute('style');

    const placementOffset = typeof configuration.placementOffset === 'string' ?
        parseInt(configuration.placementOffset.replace(/px;?/, '')) :
        0;

    let attachmentPoint = typeof configuration.attachmentPoint === 'string' ?
        configuration.attachmentPoint.toLowerCase().trim() : 'top';

    if (!['top', 'bottom'].includes(attachmentPoint)) {
        console.log('Invalid attachment point '+attachmentPoint+', defaulting to top');
        attachmentPoint = 'top';
    }

    capturedElementStyling = {
        top: managedElement.style.top,
        width: managedElement.style.width,
        position: managedElement.style.position,
        marginTop: managedElement.style.marginTop,
        left: managedElement.style.left
    };

    function obtainDocumentTopCoord(node) {
        return node.getBoundingClientRect().top + window.pageYOffset;
    }

    function obtainDocumentBottomCoord(node) {
        return node.getBoundingClientRect().bottom + window.pageYOffset;
    }

    const handleWindowScroll = () => {
        evaluateAdherenceCondition();
    };

    const handleWindowResize = () => {
        if (currentAdherenceState) {
            releaseFromAdherence();
        }
        recomputeEngagementThreshold();
        evaluateAdherenceCondition();
        
        if (currentAdherenceState) {
            const parentComputedStyle = window.getComputedStyle(managedElement.parentElement, null);
            const effectiveParentWidth = managedElement.parentElement.offsetWidth -
                parseFloat(parentComputedStyle.getPropertyValue('padding-right')) -
                parseFloat(parentComputedStyle.getPropertyValue('padding-left'));
            managedElement.style.width = effectiveParentWidth + 'px';
        }
    };

    const removeAllEventHandlers = () => {
        window.removeEventListener('scroll', handleWindowScroll);
        window.removeEventListener('resize', handleWindowResize);

        if (documentBodyCssClass) {
            document.body.classList.remove(documentBodyCssClass);
        }
        if (accompanyingSpacer) {
            accompanyingSpacer.remove();
        }
    };

    function recomputeEngagementThreshold() {
        if (currentAdherenceState) return;

        priorPositionCoordinate = (attachmentPoint === 'top') ?
            obtainDocumentTopCoord(managedElement) :
            obtainDocumentBottomCoord(managedElement);

        engagementThreshold = priorPositionCoordinate - placementOffset;
    }

    function evaluateAdherenceCondition() {
        let currentViewportScroll;
        let shouldBecomeAdherent;

        if (constraintExpression && !mediaQueryEvaluationFacade(constraintExpression).matches) {
            return;
        }

        if (attachmentPoint === 'top') {
            currentViewportScroll = window.pageYOffset || document.documentElement.scrollTop;
            shouldBecomeAdherent = currentViewportScroll >= engagementThreshold;
        } else {
            currentViewportScroll = window.pageYOffset + window.innerHeight;
            shouldBecomeAdherent = currentViewportScroll <= engagementThreshold;
        }

        if (shouldBecomeAdherent && !currentAdherenceState) {
            applyAdherence();
        } else if (!shouldBecomeAdherent && currentAdherenceState) {
            releaseFromAdherence();
        }
    }

    function applyAdherence() {
        const currentBoundingBox = managedElement.getBoundingClientRect();
        const absoluteHorizontalPosition = currentBoundingBox.left;

        currentAdherenceState = true;

        if (documentBodyCssClass) {
            document.body.classList.add(documentBodyCssClass);
        }

        if (affixedCssClass) {
            managedElement.classList.add(affixedCssClass);
        }

        managedElement.style.width = managedElement.offsetWidth + 'px';
        managedElement.style.position = 'fixed';
        managedElement.style[attachmentPoint] = placementOffset + 'px';
        managedElement.style.left = absoluteHorizontalPosition + 'px';
        managedElement.style.marginTop = '0';

        if (attachmentPoint === 'bottom') {
            managedElement.style.marginBottom = '0';
        }

        if (employSpacerElement) {
            accompanyingSpacer = document.createElement('div');
            accompanyingSpacer.style.height = managedElement.offsetHeight + 'px';
            managedElement.after(accompanyingSpacer);
        }
    }

    function releaseFromAdherence() {
        managedElement.setAttribute('style', originalStyleAttributeValue || '');

        managedElement.style.width = '';
        managedElement.style.top = '';
        managedElement.style.position = '';
        managedElement.style.left = '';
        managedElement.style.marginTop = '';
        if (attachmentPoint === 'bottom') {
            managedElement.style.marginBottom = '';
        }

        currentAdherenceState = false;

        if (documentBodyCssClass) {
            document.body.classList.remove(documentBodyCssClass);
        }

        if (affixedCssClass) {
            managedElement.classList.remove(affixedCssClass);
        }

        if (accompanyingSpacer) {
            accompanyingSpacer.remove();
            accompanyingSpacer = null;
        }
    }

    const controlInterface = {
        boot: () => {
            recomputeEngagementThreshold();
            evaluateAdherenceCondition();

            window.addEventListener('scroll', handleWindowScroll);
            window.addEventListener('resize', handleWindowResize);
        },
        destroy: () => {
            removeAllEventHandlers();
            if (currentAdherenceState) {
                releaseFromAdherence();
            }
        },
        updateState: () => {
            if (!currentAdherenceState) {
                recomputeEngagementThreshold();
            }
            evaluateAdherenceCondition();
        }
    };

    return controlInterface;
}

(function() {
    'use strict';

    if (!window.AffixUtility) {
        window.AffixUtility = {};
    }

    window.AffixUtility.instantiateAffix = (domElement, customOptions) => {
        const derivedConfig = {
            constraintExpression: domElement.dataset.mediaQuery,
            affixedCssClass: domElement.dataset.stickyClass,
            documentBodyCssClass: domElement.dataset.bodyClass,
            placementOffset: domElement.dataset.offset,
            attachmentPoint: domElement.dataset.anchor,
            employSpacerElement: domElement.dataset.useplaceholder !== undefined
        };

        const finalConfig = Object.assign({}, derivedConfig, customOptions);

        const activeManager = createAdherenceManager(domElement, finalConfig);
        activeManager.boot();

        return activeManager.destroy;
    };

    document.addEventListener('DOMContentLoaded', () => {
        const elementsForAffixing = document.querySelectorAll('[data-affinity-bond]');
        elementsForAffixing.forEach(element => {
            window.AffixUtility.instantiateAffix(element);
        });
    });

}());