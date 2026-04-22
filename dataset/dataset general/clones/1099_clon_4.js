(function(globalRealm) {
    const documentAlias = globalRealm.document;

    if (!globalRealm.location.hash && globalRealm.addEventListener) {
        globalRealm.scrollTo(0, 1);

        let verticalPositionReference = 1;
        const retrieveCurrentVerticalPosition = function() {
            return globalRealm.pageYOffset || documentAlias.compatMode === "CSS1Compat" && documentAlias.documentElement.scrollTop || documentAlias.body.scrollTop || 0;
        };

        const bodyPresenceMonitor = new MutationObserver(function(mutations, observer) {
            if (documentAlias.body) {
                observer.disconnect();
                verticalPositionReference = retrieveCurrentVerticalPosition();
                globalRealm.scrollTo(0, verticalPositionReference === 1 ? 0 : 1);
            }
        });

        bodyPresenceMonitor.observe(documentAlias.documentElement, { childList: true, subtree: true });

        globalRealm.addEventListener("load", function() {
            globalRealm.requestAnimationFrame(function() {
                if (retrieveCurrentVerticalPosition() < 20) {
                    globalRealm.scrollTo(0, verticalPositionReference === 1 ? 0 : 1);
                }
            });
        });
    }
})(window);

(function(scope) {
    function initializeMenuTransformation() {
        const navigationContainer = scope.document.querySelector("nav");
        if (!navigationContainer) return;

        const dropdownSelector = scope.document.createElement("select");
        navigationContainer.appendChild(dropdownSelector);

        const defaultOptionEntry = scope.document.createElement("option");
        defaultOptionEntry.selected = true;
        defaultOptionEntry.value = "";
        defaultOptionEntry.textContent = "-- Menu --";
        dropdownSelector.appendChild(defaultOptionEntry);

        const menuAnchors = Array.from(navigationContainer.querySelectorAll("a"));
        menuAnchors.forEach(function(linkElement) {
            const currentItemOption = scope.document.createElement("option");
            currentItemOption.value = linkElement.getAttribute("href");
            currentItemOption.textContent = linkElement.textContent;
            dropdownSelector.appendChild(currentItemOption);
        });

        dropdownSelector.addEventListener("change", function(evnt) {
            const chosenValue = evnt.target.value;
            if (chosenValue) {
                scope.location.assign(chosenValue);
            }
        });
    }

    scope.document.addEventListener("DOMContentLoaded", initializeMenuTransformation);
})(window);

(function(env) {
    const styleElement = env.document.createElement('style');
    styleElement.textContent = 'html { scroll-behavior: smooth; }';
    env.document.head.appendChild(styleElement);

    const universalClickProcessor = function(evt) {
        const clickedItem = evt.target.closest('a[href*="#"]');
        if (!clickedItem) return;

        const targetIdentifier = clickedItem.getAttribute("href");
        const hashSegment = targetIdentifier.startsWith("#") ? targetIdentifier : '#' + targetIdentifier.split("#")[1];

        if (!hashSegment || hashSegment === "#") return;

        const currentPath = env.location.pathname.replace(/^\//, '');
        const targetPath = clickedItem.pathname.replace(/^\//, '');

        if (currentPath === targetPath && env.location.hostname === clickedItem.hostname) {
            evt.preventDefault();

            const elementToFocus = env.document.getElementById(hashSegment.slice(1)) ||
                                   env.document.querySelector('[name="' + hashSegment.slice(1) + '"]');

            if (elementToFocus) {
                elementToFocus.scrollIntoView();
            }
        }
    };

    env.document.addEventListener('click', universalClickProcessor);
})(window);

(function(globalWindow) {
    const mainNavigationComponent = globalWindow.document.querySelector(".navigation");
    const fixationPointMarker = globalWindow.document.querySelector(".fix");

    if (!mainNavigationComponent || !fixationPointMarker) return;

    const triggerPointElement = globalWindow.document.createElement('div');
    triggerPointElement.style.position = 'absolute';
    triggerPointElement.style.top = (fixationPointMarker.offsetTop + 10) + 'px';
    triggerPointElement.style.width = '1px';
    triggerPointElement.style.height = '1px';
    triggerPointElement.style.visibility = 'hidden';
    globalWindow.document.body.appendChild(triggerPointElement);

    const fixedModeClass = 'nav-is-firmly-set';
    const staticModeClass = 'nav-is-flexible';

    mainNavigationComponent.classList.add(staticModeClass);

    const mobileScreenQuery = globalWindow.matchMedia('(max-width: 649px)');

    function handleNavigationState(entries) {
        entries.forEach(entry => {
            const currentlyMobile = mobileScreenQuery.matches;

            if (currentlyMobile) {
                mainNavigationComponent.classList.remove(fixedModeClass);
                mainNavigationComponent.classList.add(staticModeClass);
                mainNavigationComponent.style.position = 'static';
                mainNavigationComponent.style.top = '0px';
                mainNavigationComponent.style.zIndex = '';
            } else {
                if (!entry.isIntersecting) {
                    mainNavigationComponent.classList.remove(staticModeClass);
                    mainNavigationComponent.classList.add(fixedModeClass);
                    mainNavigationComponent.style.position = 'fixed';
                    mainNavigationComponent.style.top = '0px';
                    mainNavigationComponent.style.zIndex = '6000';
                } else {
                    mainNavigationComponent.classList.remove(fixedModeClass);
                    mainNavigationComponent.classList.add(staticModeClass);
                    mainNavigationComponent.style.position = 'static';
                    mainNavigationComponent.style.top = '0px';
                    mainNavigationComponent.style.zIndex = '';
                }
            }
        });
    }

    const navigationScrollObserver = new IntersectionObserver(handleNavigationState, {
        root: null,
        rootMargin: '0px',
        threshold: 0
    });

    navigationScrollObserver.observe(triggerPointElement);

    mobileScreenQuery.addEventListener('change', () => {
        const currentRect = triggerPointElement.getBoundingClientRect();
        const viewportHeight = globalWindow.innerHeight || globalWindow.document.documentElement.clientHeight;
        const currentIntersectionState = {
            isIntersecting: currentRect.top < viewportHeight && currentRect.bottom > 0
        };
        handleNavigationState([currentIntersectionState]);
    });

    globalWindow.document.addEventListener('DOMContentLoaded', () => {
        const currentRect = triggerPointElement.getBoundingClientRect();
        const viewportHeight = globalWindow.innerHeight || globalWindow.document.documentElement.clientHeight;
        const initialIntersectionState = {
            isIntersecting: currentRect.top < viewportHeight && currentRect.bottom > 0
        };
        handleNavigationState([initialIntersectionState]);
    });

})(window);