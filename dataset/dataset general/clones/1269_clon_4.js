(function() {
    let featureCache = null;
    const activeVisuals = new WeakMap(); 

    function checkNativeSupport() {
        if (featureCache !== null) return featureCache;
        const testInput = document.createElement('input');
        testInput.type = 'text';
        featureCache = 'placeholder' in testInput;
        return featureCache;
    }

    const defaultSettings = {
        visualTint: '#888',
        overlayClass: 'visual-input-assist',
        elementSelector: 'input[placeholder], textarea[placeholder]',
        textAlignment: 'left'
    };

    function updateOverlayDisplay(targetInput) {
        const visualData = activeVisuals.get(targetInput);
        if (!visualData) return;
        const overlayElement = visualData.overlay;
        
        // Hide if input has value or is currently focused
        if (targetInput.value.length > 0 || targetInput === document.activeElement) {
            overlayElement.style.display = 'none';
        } else {
            overlayElement.style.display = 'inline-block';
        }
    }

    function applyVisualStyles(targetInput, overlayElement, currentSettings) {
        const computedInputStyles = window.getComputedStyle(targetInput);

        overlayElement.style.cssText = ''; // Reset styles for update

        // Base positioning and display
        overlayElement.style.position = 'absolute';
        overlayElement.style.display = 'inline-block';
        overlayElement.style.pointerEvents = 'none'; // Allow clicks to pass through to the wrapper/input
        overlayElement.style.float = 'none'; // Prevent float interference
        overlayElement.style.overflow = 'hidden';
        overlayElement.style.textOverflow = 'ellipsis'; // Truncate long text

        // Match input's padding for precise text alignment
        overlayElement.style.paddingTop = computedInputStyles.paddingTop;
        overlayElement.style.paddingRight = computedInputStyles.paddingRight;
        overlayElement.style.paddingBottom = computedInputStyles.paddingBottom;
        overlayElement.style.paddingLeft = computedInputStyles.paddingLeft;

        // Match input's font characteristics
        overlayElement.style.fontSize = computedInputStyles.fontSize;
        overlayElement.style.fontFamily = computedInputStyles.fontFamily;
        overlayElement.style.fontWeight = computedInputStyles.fontWeight;
        overlayElement.style.fontStyle = computedInputStyles.fontStyle;
        overlayElement.style.textTransform = computedInputStyles.textTransform;

        // Overlay specific visual properties
        overlayElement.style.color = currentSettings.visualTint;
        overlayElement.style.textAlign = currentSettings.textAlignment;
        overlayElement.style.backgroundColor = 'transparent';
        overlayElement.style.zIndex = '99'; // Ensure it's above the input

        // Position within the relative wrapper
        overlayElement.style.top = '0';
        overlayElement.style.left = '0';
        // Set overlay width/height to match the input's content box
        overlayElement.style.width = targetInput.clientWidth + 'px';
        overlayElement.style.height = targetInput.clientHeight + 'px';

        // Special handling for line-height on single-line inputs
        if (targetInput.tagName !== 'TEXTAREA') {
            if (computedInputStyles.height !== 'auto') {
                overlayElement.style.lineHeight = computedInputStyles.height;
            }
            overlayElement.style.whiteSpace = 'nowrap';
        } else {
            overlayElement.style.lineHeight = computedInputStyles.lineHeight; // Textareas use their own line-height
            overlayElement.style.whiteSpace = 'pre-wrap';
        }

        const wrapperElement = activeVisuals.get(targetInput).wrapper;
        wrapperElement.style.cursor = 'text'; // Indicate clickable area
        
        // Remove existing listener to prevent duplicates on re-application
        const oldFocusHandler = wrapperElement.dataset.focusHandler;
        if (oldFocusHandler) {
            wrapperElement.removeEventListener('click', eval(oldFocusHandler)); // Eval for anonymous function reference
        }
        
        const focusTarget = function(e) {
            // Only focus if click is on the wrapper or overlay, not already on the input
            if (e.target === wrapperElement || e.target === overlayElement) {
                targetInput.focus();
            }
        };
        wrapperElement.addEventListener('click', focusTarget);
        wrapperElement.dataset.focusHandler = focusTarget.toString(); // Store for removal
    }

    function processSingleElement(element, currentSettings) {
        if (!element.hasAttribute('placeholder') || activeVisuals.has(element)) {
            return; 
        }

        const hintText = element.getAttribute('placeholder');
        if (!hintText) {
            return; 
        }

        const computedInputStyles = window.getComputedStyle(element);
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'visual-input-wrapper'; 
        wrapperDiv.style.position = 'relative';
        wrapperDiv.style.display = (computedInputStyles.display === 'inline' || computedInputStyles.display === 'inline-block') ? 'inline-block' : 'block';
        wrapperDiv.style.verticalAlign = computedInputStyles.verticalAlign; 

        const overlaySpan = document.createElement('span');
        overlaySpan.textContent = hintText;
        overlaySpan.className = currentSettings.overlayClass;
        overlaySpan.id = 'visual-assist-overlay-' + Math.random().toString(36).substring(2, 9); 

        element.parentNode.insertBefore(wrapperDiv, element);
        wrapperDiv.appendChild(element);
        wrapperDiv.appendChild(overlaySpan);

        activeVisuals.set(element, { wrapper: wrapperDiv, overlay: overlaySpan });

        applyVisualStyles(element, overlaySpan, currentSettings);

        element.addEventListener('input', () => updateOverlayDisplay(element));
        element.addEventListener('focus', () => updateOverlayDisplay(element));
        element.addEventListener('blur', () => updateOverlayDisplay(element));

        // Set initial state
        updateOverlayDisplay(element);
    }

    function initializeVisualSystem(options) {
        if (checkNativeSupport()) {
            return; 
        }

        const currentSettings = { ...defaultSettings, ...options };

        function refreshAllVisuals() {
            document.querySelectorAll(currentSettings.elementSelector).forEach(el => {
                if (activeVisuals.has(el)) {
                    const visualData = activeVisuals.get(el);
                    applyVisualStyles(el, visualData.overlay, currentSettings);
                    updateOverlayDisplay(el);
                } else {
                    processSingleElement(el, currentSettings);
                }
            });
        }

        refreshAllVisuals();

        window.addEventListener('resize', refreshAllVisuals);

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { 
                            if (node.matches(currentSettings.elementSelector)) {
                                processSingleElement(node, currentSettings);
                            }
                            node.querySelectorAll(currentSettings.elementSelector).forEach(childEl => {
                                processSingleElement(childEl, currentSettings);
                            });
                        }
                    });
                } else if (mutation.type === 'attributes' && mutation.attributeName === 'placeholder') {
                    if (mutation.target.matches(currentSettings.elementSelector)) {
                        const target = mutation.target;
                        const visualData = activeVisuals.get(target);
                        if (visualData) {
                            visualData.overlay.textContent = target.getAttribute('placeholder') || '';
                            applyVisualStyles(target, visualData.overlay, currentSettings);
                            updateOverlayDisplay(target);
                        } else {
                            processSingleElement(target, currentSettings);
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['placeholder']
        });
    }

    window.textHintAssistant = {
        activate: initializeVisualSystem,
        isSupported: checkNativeSupport
    };

    function setupOnLoad() {
        if (!checkNativeSupport()) {
            window.textHintAssistant.activate();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupOnLoad);
    } else {
        setupOnLoad();
    }
    window.addEventListener('load', setupOnLoad);
})();