function initializeFocusIndicator(targetElementsSource, optionsConfiguration) {

    const defaultConfiguration = {
        shade: "orange",
        transitionDurationMs: 400,
        alphaLevel: 1,
        fadeDelayMs: 200,
        spacing: 2,
        layerOrder: -1,
        enclosingContext: null
    };

    const currentSetup = Object.assign({}, defaultConfiguration, optionsConfiguration);

    currentSetup.horizontalSpacing = optionsConfiguration && optionsConfiguration.margin_horizontal != null ? optionsConfiguration.margin_horizontal : currentSetup.spacing;
    currentSetup.verticalSpacing = optionsConfiguration && optionsConfiguration.margin_vertical != null ? optionsConfiguration.margin_vertical : currentSetup.spacing;

    const dynamicHighlightBox = document.createElement('div');
    dynamicHighlightBox.style.position = 'absolute';
    dynamicHighlightBox.style.backgroundColor = currentSetup.shade;
    dynamicHighlightBox.style.opacity = '0';
    dynamicHighlightBox.style.zIndex = currentSetup.layerOrder;
    dynamicHighlightBox.style.borderRadius = '6px';

    dynamicHighlightBox.style.transitionTimingFunction = 'ease-in-out';
    dynamicHighlightBox.style.transitionProperty = 'top, left, width, height, opacity, border-radius, -webkit-border-radius, -moz-border-radius';
    dynamicHighlightBox.style.transitionDuration = `${currentSetup.transitionDurationMs}ms`;

    document.body.appendChild(dynamicHighlightBox);

    let elementsToTrack;
    if (typeof targetElementsSource === 'string') {
        elementsToTrack = document.querySelectorAll(targetElementsSource);
    } else if (Array.isArray(targetElementsSource)) {
        elementsToTrack = targetElementsSource;
    } else {
        console.error("Invalid targetElementsSource provided. Must be a string selector or an array of elements.");
        return;
    }

    elementsToTrack.forEach(element => {
        const handleMouseEnter = () => {
            let cornerCurvatureValue;
            if (optionsConfiguration == null || optionsConfiguration.border_radius == null) {
                const computedStyle = window.getComputedStyle(element);
                const elementBorderRadius = parseInt(computedStyle.borderRadius, 10);
                cornerCurvatureValue = elementBorderRadius !== 0 ? elementBorderRadius + currentSetup.verticalSpacing : 0;
            } else {
                cornerCurvatureValue = optionsConfiguration.border_radius;
            }

            const elementRect = element.getBoundingClientRect();
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            dynamicHighlightBox.style.transitionDuration = `${currentSetup.transitionDurationMs}ms`;
            dynamicHighlightBox.style.transitionProperty = 'top, left, width, height, opacity, border-radius, -webkit-border-radius, -moz-border-radius';

            dynamicHighlightBox.style.top = `${elementRect.top + scrollY - currentSetup.verticalSpacing}px`;
            dynamicHighlightBox.style.left = `${elementRect.left + scrollX - currentSetup.horizontalSpacing}px`;
            dynamicHighlightBox.style.width = `${elementRect.width + currentSetup.horizontalSpacing * 2}px`;
            dynamicHighlightBox.style.height = `${elementRect.height + currentSetup.verticalSpacing * 2}px`;
            dynamicHighlightBox.style.opacity = currentSetup.alphaLevel;

            const radiusPx = `${cornerCurvatureValue}px`;
            dynamicHighlightBox.style.borderRadius = radiusPx;
            dynamicHighlightBox.style.webkitBorderTopLeftRadius = radiusPx;
            dynamicHighlightBox.style.webkitBorderTopRightRadius = radiusPx;
            dynamicHighlightBox.style.webkitBorderBottomLeftRadius = radiusPx;
            dynamicHighlightBox.style.webkitBorderBottomRightRadius = radiusPx;
            dynamicHighlightBox.style.mozBorderRadius = radiusPx;
        };

        const handleMouseLeave = () => {
            dynamicHighlightBox.style.transitionDuration = `${currentSetup.fadeDelayMs}ms`;
            dynamicHighlightBox.style.transitionProperty = 'opacity';
            dynamicHighlightBox.style.opacity = '0';

            const resetTransition = (event) => {
                if (event.propertyName === 'opacity') {
                    dynamicHighlightBox.style.transitionProperty = 'top, left, width, height, opacity, border-radius, -webkit-border-radius, -moz-border-radius';
                    dynamicHighlightBox.style.transitionDuration = `${currentSetup.transitionDurationMs}ms`;
                    dynamicHighlightBox.removeEventListener('transitionend', resetTransition);
                }
            };
            if (currentSetup.fadeDelayMs > 0) {
                 dynamicHighlightBox.addEventListener('transitionend', resetTransition);
            }
        };

        element.addEventListener('mouseenter', handleMouseEnter);

        const configuredLeaveTarget = currentSetup.enclosingContext;
        let actualLeaveElement;

        if (configuredLeaveTarget == null) {
            console.log("No enclosing context specified for focus indicator.");
            actualLeaveElement = element;
        } else {
            actualLeaveElement = document.querySelector(configuredLeaveTarget);
        }

        if (actualLeaveElement) {
            actualLeaveElement.addEventListener('mouseleave', handleMouseLeave);
        }
    });
}