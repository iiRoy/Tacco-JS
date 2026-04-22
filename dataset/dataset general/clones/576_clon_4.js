const eventDispatcher = (() => {
    const ieHandlerWrappers = new WeakMap();

    const bindEventToElement = (domElement, eventName, eventCallback) => {
        if (domElement.addEventListener) {
            domElement.addEventListener(eventName, eventCallback, false);
        } else if (domElement.attachEvent) {
            if (!ieHandlerWrappers.has(domElement)) {
                ieHandlerWrappers.set(domElement, new Map());
            }
            const elementWrappers = ieHandlerWrappers.get(domElement);

            const wrapperFunction = function() {
                eventCallback.call(domElement, window.event);
            };
            elementWrappers.set(eventCallback, wrapperFunction);

            domElement.attachEvent('on' + eventName, wrapperFunction);
        } else {
            domElement['on' + eventName] = eventCallback;
        }
    };

    return {
        register: bindEventToElement
    };
})();

const breakpointController = (() => {
    let previouslyActiveBreakpoint = null;
    let breakpointHelperDiv = null;

    const injectBreakpointStyles = () => {
        const styleIdentifier = 'dynamic-breakpoint-styles';
        if (!document.getElementById(styleIdentifier)) {
            const styleElement = document.createElement('style');
            styleElement.id = styleIdentifier;
            styleElement.textContent = `
                #breakpoint-detector-element {
                    position: absolute; top: -9999px; left: -9999px; visibility: hidden;
                    --active-bp: 'unknown';
                }
                @media (max-width: 575px) { #breakpoint-detector-element { --active-bp: 'XS'; } }
                @media (min-width: 576px) and (max-width: 767px) { #breakpoint-detector-element { --active-bp: 'S'; } }
                @media (min-width: 768px) and (max-width: 991px) { #breakpoint-detector-element { --active-bp: 'M'; } }
                @media (min-width: 992px) { #breakpoint-detector-element { --active-bp: 'L'; } }
            `;
            if (!window.getComputedStyle) {
                styleElement.textContent += `
                    #breakpoint-detector-element { _font-family: 'unknown'; }
                    @media (max-width: 575px) { #breakpoint-detector-element { _font-family: 'XS'; } }
                    @media (min-width: 576px) and (max-width: 767px) { #breakpoint-detector-element { _font-family: 'S'; } }
                    @media (min-width: 768px) and (max-width: 991px) { #breakpoint-detector-element { _font-family: 'M'; } }
                    @media (min-width: 992px) { #breakpoint-detector-element { _font-family: 'L'; } }
                `;
            }
            document.head.appendChild(styleElement);
        }
    };

    const establishHelperDiv = () => {
        if (breakpointHelperDiv) return;

        breakpointHelperDiv = document.createElement('div');
        breakpointHelperDiv.id = 'breakpoint-detector-element';
        document.body.appendChild(breakpointHelperDiv);
        injectBreakpointStyles();
    };

    const retrieveCurrentBreakpoint = () => {
        if (!breakpointHelperDiv) {
            establishHelperDiv();
        }

        let identifiedBreakpoint = 'unknown';

        if (window.getComputedStyle) {
            const computedStyles = window.getComputedStyle(breakpointHelperDiv);
            identifiedBreakpoint = computedStyles.getPropertyValue('--active-bp');
            if (identifiedBreakpoint && identifiedBreakpoint !== 'unknown') {
                return identifiedBreakpoint.replace(/['"]/g, '').trim();
            }
            identifiedBreakpoint = computedStyles.getPropertyValue('content');
            if (identifiedBreakpoint) {
                 return identifiedBreakpoint.replace(/['"]/g, '').trim();
            }
        }

        if (breakpointHelperDiv.currentStyle) {
            const ieCurrentStyles = breakpointHelperDiv.currentStyle;
            if (ieCurrentStyles && ieCurrentStyles.fontFamily) {
                identifiedBreakpoint = ieCurrentStyles.fontFamily;
                return identifiedBreakpoint.replace(/['"]/g, '').trim();
            }
        }

        return 'unknown';
    };

    const breakpointActionMap = new Map([
        ['XS', (targetId) => {
            document.getElementById(targetId).innerHTML = `Current size: <br><strong>XS</strong>`;
            console.log('Breakpoint XS is now active.');
        }],
        ['S', (targetId) => {
            document.getElementById(targetId).innerHTML = `Current size: <br><strong>S</strong>`;
            console.log('Breakpoint S is now active.');
        }],
        ['M', (targetId) => {
            document.getElementById(targetId).innerHTML = `Current size: <br><strong>M</strong>`;
            console.log('Breakpoint M is now active.');
        }],
        ['L', (targetId) => {
            document.getElementById(targetId).innerHTML = `Current size: <br><strong>L</strong>`;
            console.log('Breakpoint L is now active.');
        }],
        ['unknown', (targetId) => {
             document.getElementById(targetId).innerHTML = `Current size: <br><strong>unknown</strong>`;
             console.log('Breakpoint unknown or unsupported is active.');
        }]
    ]);

    const updateBreakpointState = () => {
        const detectedBreakpoint = retrieveCurrentBreakpoint();

        if (detectedBreakpoint !== previouslyActiveBreakpoint) {
            previouslyActiveBreakpoint = detectedBreakpoint;
            const actionToPerform = breakpointActionMap.get(detectedBreakpoint);
            if (actionToPerform) {
                actionToPerform('msg');
            } else {
                breakpointActionMap.get('unknown')('msg');
            }
        }
    };

    const initialize = () => {
        if (document.readyState === 'loading') {
            eventDispatcher.register(document, 'DOMContentLoaded', () => {
                establishHelperDiv();
                updateBreakpointState();
                eventDispatcher.register(window, 'resize', updateBreakpointState);
            });
        } else {
            establishHelperDiv();
            updateBreakpointState();
            eventDispatcher.register(window, 'resize', updateBreakpointState);
        }
    };

    initialize();

    return {
        refresh: updateBreakpointState
    };
})();