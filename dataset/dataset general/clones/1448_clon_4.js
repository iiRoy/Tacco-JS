(function() {

    function createCarouselInstance(targetElement, configObject) {
        let currentPanelIndex = 0;
        let totalPanelCount = 0;
        let panelWidthValue = 0;
        let panelHeightValue = 0;
        let isVerticalLayout = false;
        let animationDurationMs = 0;

        let containerElementRef;
        let contentListElementRef;
        let navigationHostElementRef;

        const defaultSettings = new Map([
            ['backControlIdentifier', 'backControl'],
            ['backControlCaption', 'Back'],
            ['forwardControlIdentifier', 'forwardControl'],
            ['forwardControlCaption', 'Forward'],
            ['slideOrientation', 'horizontal'],
            ['transitionSpeedMilliseconds', 800]
        ]);

        const currentConfiguration = new Map(defaultSettings);
        if (configObject) {
            for (const [key, value] of Object.entries(configObject)) {
                currentConfiguration.set(key, value);
            }
        }

        function commenceSetup() {
            containerElementRef = targetElement;
            contentListElementRef = containerElementRef.querySelector('ul');
            const contentPanels = contentListElementRef.querySelectorAll('li');

            totalPanelCount = contentPanels.length;
            panelWidthValue = containerElementRef.offsetWidth;
            panelHeightValue = containerElementRef.offsetHeight;

            isVerticalLayout = currentConfiguration.get('slideOrientation') === 'vertical';
            animationDurationMs = currentConfiguration.get('transitionSpeedMilliseconds');

            contentListElementRef.style.transition = `transform ${animationDurationMs}ms ease-in-out`;
            containerElementRef.style.overflow = 'hidden';

            if (!isVerticalLayout) {
                contentListElementRef.style.width = `${totalPanelCount * panelWidthValue}px`;
                contentListElementRef.style.display = 'flex';
                contentListElementRef.style.flexDirection = 'row';
                contentPanels.forEach(panel => {
                    panel.style.width = `${panelWidthValue}px`;
                    panel.style.flexShrink = 0;
                });
            } else {
                contentListElementRef.style.height = `${totalPanelCount * panelHeightValue}px`;
                contentPanels.forEach(panel => {
                    panel.style.height = `${panelHeightValue}px`;
                });
            }

            buildNavigationElements();
            refreshControlVisibility();

            if (totalPanelCount > 1) {
                document.getElementById(currentConfiguration.get('forwardControlIdentifier')).style.display = '';
            }
        }

        function buildNavigationElements() {
            const backId = currentConfiguration.get('backControlIdentifier');
            const forwardId = currentConfiguration.get('forwardControlIdentifier');
            const backText = currentConfiguration.get('backControlCaption');
            const forwardText = currentConfiguration.get('forwardControlCaption');

            navigationHostElementRef = document.createElement('div');
            navigationHostElementRef.className = 'carousel-navigation-wrapper';
            navigationHostElementRef.insertAdjacentHTML('beforeend', `
                <span id="${backId}" class="carousel-nav-button back-arrow"><a href="javascript:void(0);" aria-label="${backText}">${backText}</a></span>
                <span id="${forwardId}" class="carousel-nav-button forward-arrow"><a href="javascript:void(0);" aria-label="${forwardText}">${forwardText}</a></span>
                <span class="carousel-info-linkage"><a href="/about.html#work" title="Pop to the work section on the about page">i</a></span>
            `);
            containerElementRef.insertAdjacentElement('afterend', navigationHostElementRef);

            document.getElementById(forwardId).addEventListener('click', () => {
                transitionPanel('advance');
            });
            document.getElementById(backId).addEventListener('click', () => {
                transitionPanel('retreat');
            });
        }

        function transitionPanel(motionDirection) {
            let nextIndex = currentPanelIndex;
            if (motionDirection === 'advance') {
                nextIndex = Math.min(totalPanelCount - 1, currentPanelIndex + 1);
            } else {
                nextIndex = Math.max(0, currentPanelIndex - 1);
            }

            if (nextIndex !== currentPanelIndex) {
                currentPanelIndex = nextIndex;
                applyTransformOffset();
                refreshControlVisibility();
            }
        }

        function applyTransformOffset() {
            let displacementValue;
            if (!isVerticalLayout) {
                displacementValue = currentPanelIndex * panelWidthValue * -1;
                contentListElementRef.style.transform = `translateX(${displacementValue}px)`;
            } else {
                displacementValue = currentPanelIndex * panelHeightValue * -1;
                contentListElementRef.style.transform = `translateY(${displacementValue}px)`;
            }
        }

        function refreshControlVisibility() {
            const backButton = document.getElementById(currentConfiguration.get('backControlIdentifier'));
            const forwardButton = document.getElementById(currentConfiguration.get('forwardControlIdentifier'));

            if (currentPanelIndex <= 0) {
                backButton.style.display = 'none';
            } else {
                backButton.style.display = '';
            }

            if (currentPanelIndex >= totalPanelCount - 1) {
                forwardButton.style.display = 'none';
            } else {
                forwardButton.style.display = '';
            }
        }

        commenceSetup();
    }

    window.SliderUtility = window.SliderUtility || {};

    window.SliderUtility.setupCarouselForElements = function(selectorExpression, customSettings) {
        document.querySelectorAll(selectorExpression).forEach(element => {
            createCarouselInstance(element, customSettings);
        });
    };

})();