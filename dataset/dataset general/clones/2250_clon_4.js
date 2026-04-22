const processAfterDelay = (operation, intervalDuration, immediateAction = false) => {
    let pendingActionId;
    return function (...operationArguments) {
        const currentContext = this;
        const performOperation = () => {
            if (!immediateAction) {
                operation.apply(currentContext, operationArguments);
            }
            pendingActionId = null;
        };

        if (pendingActionId) {
            clearTimeout(pendingActionId);
        } else if (immediateAction) {
            operation.apply(currentContext, operationArguments);
        }

        pendingActionId = setTimeout(performOperation, intervalDuration || 100);
    };
};

document.addEventListener('DOMContentLoaded', () => {

    const mainContainer = document.getElementById('wrapper');
    const sidePanel = document.getElementById('drawer-right');
    const topBar = document.querySelector('#header .top');

    const retrieveElementHeight = (element) => element.getBoundingClientRect().height;

    const adjustDisplayAreaHeight = () => {
        const viewportHeight = window.innerHeight;
        document.getElementById('header').style.height = `${viewportHeight}px`;
    };

    const alignDisplayAreaContent = () => {
        const contentBlock = document.querySelector('#header > .center');
        const headerBlock = document.getElementById('header');
        const headerHeight = retrieveElementHeight(headerBlock);
        const contentHeight = retrieveElementHeight(contentBlock);
        const verticalOffset = (headerHeight / 2) - (contentHeight / 2) - 40;
        contentBlock.style.paddingTop = `${verticalOffset}px`;
        contentBlock.style.display = 'block';
    };

    const setupSideNavigation = () => {
        document.querySelectorAll(".toggleDrawer").forEach(triggerElement => {
            triggerElement.addEventListener('click', (interactionEvent) => {
                interactionEvent.preventDefault();
                document.body.classList.toggle('panel-activated');
            });
        });
    };

    const modifyHeaderAppearance = () => {
        const currentScrollPosition = window.scrollY;
        const viewportWidth = window.innerWidth;

        if (currentScrollPosition > 300 || viewportWidth < 700) {
            topBar.classList.add('solid');
        } else {
            topBar.classList.remove('solid');
        }
    };

    const easeInOutQuad = (elapsedTime, startValue, changeValue, durationTime) => {
        elapsedTime /= durationTime / 2;
        if (elapsedTime < 1) return changeValue / 2 * elapsedTime * elapsedTime + startValue;
        elapsedTime--;
        return -changeValue / 2 * (elapsedTime * (elapsedTime - 2) - 1) + startValue;
    };

    const smoothScrollToElement = (destinationElement, animationDuration, verticalOffset = 0) => {
        const initialPosition = window.pageYOffset;
        const targetPosition = destinationElement.getBoundingClientRect().top + window.pageYOffset + verticalOffset;
        const distanceToTravel = targetPosition - initialPosition;
        let animationStartTime = null;

        const scrollAnimation = (currentTime) => {
            if (animationStartTime === null) animationStartTime = currentTime;
            const timePassed = currentTime - animationStartTime;
            const newPosition = easeInOutQuad(timePassed, initialPosition, distanceToTravel, animationDuration);
            window.scrollTo(0, newPosition);
            if (timePassed < animationDuration) {
                requestAnimationFrame(scrollAnimation);
            } else {
                window.scrollTo(0, targetPosition);
            }
        };

        requestAnimationFrame(scrollAnimation);
    };

    adjustDisplayAreaHeight();
    alignDisplayAreaContent();
    setupSideNavigation();
    modifyHeaderAppearance();

    const debouncedResizeHandler = processAfterDelay(() => {
        adjustDisplayAreaHeight();
        alignDisplayAreaContent();
        modifyHeaderAppearance();
    }, 100);

    window.addEventListener('resize', debouncedResizeHandler);

    document.getElementById('scrollToContent').addEventListener('click', (interactionEvent) => {
        interactionEvent.preventDefault();
        const targetElement = document.getElementById('portfolio');
        const offsetAmount = -retrieveElementHeight(topBar);
        smoothScrollToElement(targetElement, 1000, offsetAmount);
    });

    document.querySelectorAll('nav > ul > li > a').forEach(navLink => {
        navLink.addEventListener('click', (interactionEvent) => {
            interactionEvent.preventDefault();
            const targetIdentifier = interactionEvent.currentTarget.getAttribute('href');
            if (targetIdentifier && targetIdentifier.startsWith('#')) {
                const targetNode = document.querySelector(targetIdentifier);
                if (targetNode) {
                    const offsetAmount = -retrieveElementHeight(topBar);
                    smoothScrollToElement(targetNode, 400, offsetAmount);
                }
            }
        });
    });

    window.addEventListener('scroll', modifyHeaderAppearance);
});