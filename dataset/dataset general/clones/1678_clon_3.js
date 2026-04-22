(function (libraryDefinition) {
    const globalReference = typeof window !== 'undefined' ? window : global;

    if (typeof exports === 'object' && typeof module === 'object') {
        currentModule.exports = libraryDefinition();
    }
    else if (typeof define === 'function' && define.amd) {
        amdDefine(libraryDefinition);
    }
    else if (typeof secureEcmaScript !== 'undefined') {
        if (!secureEcmaScript.ok()) {
            console.warn("SES environment not ready, skipping flippant initialization.");
            return;
        }
        secureEcmaScript.makeFlippant = libraryDefinition();
    }
    else if (typeof initBootstrap === 'function') {
        initBootstrap("flippant", libraryDefinition);
    }
    else {
        globalReference.flippant = libraryDefinition();
    }
})(function () {
    var amdDefine, secureEcmaScript, initBootstrap, currentModule, moduleExports;

    return (function (moduleDefinitions, moduleCache, entryPoints) {
        function retrieveModule(moduleIdentifier, parentModulePath) {
            if (moduleCache[moduleIdentifier]) {
                return moduleCache[moduleIdentifier].exports;
            }

            if (!moduleDefinitions[moduleIdentifier]) {
                const commonJsResolver = typeof localRequire === "function" && localRequire;
                if (!parentModulePath && commonJsResolver) {
                    return commonJsResolver(moduleIdentifier, true);
                }
                const nodeJsResolver = typeof nodeRequire === "function" && nodeRequire;
                if (nodeJsResolver) {
                    return nodeJsResolver(moduleIdentifier, true);
                }
                throw new Error("Module '" + moduleIdentifier + "' could not be located.");
            }

            const moduleWrapper = moduleCache[moduleIdentifier] = { exports: {} };
            moduleDefinitions[moduleIdentifier][0].call(
                moduleWrapper.exports,
                function (dependencyPath) {
                    const resolvedPath = moduleDefinitions[moduleIdentifier][1][dependencyPath];
                    return retrieveModule(resolvedPath ? resolvedPath : dependencyPath);
                },
                moduleWrapper,
                moduleWrapper.exports
            );

            return moduleWrapper.exports;
        }

        const nodeRequire = typeof require === "function" && require;

        for (let i = 0; i < entryPoints.length; i++) {
            retrieveModule(entryPoints[i]);
        }

        return retrieveModule(entryPoints[0]);

    })({
        1: [function (localRequire, currentMod, modExports) {
            modExports.initiateFlip = initiateFlip;

            function initiateFlip(originElement, newContentMarkup, displayVariant, customClassName, animationDurationMs) {
                if (!(originElement instanceof HTMLElement)) {
                    console.error("Flippant Error: 'originElement' must be a valid HTML element.");
                    return null;
                }
                if (typeof newContentMarkup !== 'string' || newContentMarkup.trim() === '') {
                    console.warn("Flippant Warning: 'newContentMarkup' is empty or not a string. The back face might be blank.");
                }

                const defaultDuration = 400;
                const defaultVariant = "card";
                const defaultLightClass = "flippant-card-theme-light";
                const defaultDarkClass = "flippant-modal-theme-dark";

                let positioningStrategy;
                let rearFacet;
                let styleApplicationFunc;

                animationDurationMs = animationDurationMs || defaultDuration;
                displayVariant = displayVariant || defaultVariant;

                const variantConfigurations = {
                    "modal": {
                        className: customClassName || defaultDarkClass,
                        position: "fixed",
                        styleHandler: clearExistingStyles
                    },
                    "card": {
                        className: customClassName || defaultLightClass,
                        position: "absolute",
                        styleHandler: adjustForCardLayout
                    }
                };

                const activeConfiguration = variantConfigurations[displayVariant] || variantConfigurations[defaultVariant];

                customClassName = activeConfiguration.className;
                positioningStrategy = activeConfiguration.position;
styleApplicationFunc = activeConfiguration.styleHandler;

                rearFacet = document.createElement('div');
                rearFacet.setAttribute('data-flippant-role', 'back-face');
                document.body.appendChild(rearFacet);

                applyInitialPositioning(rearFacet, originElement, positioningStrategy);
                rearFacet.innerHTML = newContentMarkup;

                originElement.classList.add('flippant-active-front');
                rearFacet.classList.add('flippant-back-face');
                rearFacet.classList.add(customClassName);

                window.setTimeout(() => {
                    styleApplicationFunc(rearFacet);
                }, 0);

                const FLIP_START_DELAY_MS = 10;
                window.setTimeout(() => {
                    rearFacet.classList.add('flipper-element');
                    rearFacet.classList.add('flipped-state');
                    originElement.classList.add('flipped-state');
                }, FLIP_START_DELAY_MS);

                rearFacet.addEventListener('flippant:close', handleFlipClosure);
                rearFacet.requestClose = handleFlipClosure;

                function handleFlipClosure() {
                    if (!document.body.contains(rearFacet)) {
                        console.warn("Flippant: Attempted to close an element not in the DOM.");
                        return;
                    }

                    applyInitialPositioning(rearFacet, originElement, positioningStrategy);
                    rearFacet.classList.remove('flipped-state');
                    originElement.classList.remove('flipped-state');

                    window.setTimeout(() => {
                        rearFacet.classList.remove(customClassName);
                        rearFacet.classList.remove('flippant-back-face');
                        originElement.classList.remove('flippant-active-front');
                        if (document.body.contains(rearFacet)) {
                            document.body.removeChild(rearFacet);
                        }
                    }, animationDurationMs);
                }

                return rearFacet;
            }

            function applyInitialPositioning(targetEl, sourceEl, positioningType) {
                if (!targetEl || !sourceEl || !sourceEl.offsetParent) {
                    console.warn("Flippant Style: Invalid elements or no offset parent for positioning.");
                    if (targetEl && positioningType) targetEl.style.position = positioningType;
                    return;
                }

                const sourceRect = sourceEl.getBoundingClientRect();

                targetEl.style.position = positioningType;
                targetEl.style.top = (sourceRect.top + (positioningType === "absolute" ? window.pageYOffset : 0)) + "px";
                targetEl.style.left = (sourceRect.left + (positioningType === "absolute" ? window.pageXOffset : 0)) + "px";
                targetEl.style.minHeight = sourceEl.offsetHeight + "px";
                targetEl.style.width = sourceEl.offsetWidth + "px";
                targetEl.style.boxSizing = "border-box";
                targetEl.style.zIndex = 9999;
            }

            function clearExistingStyles(elementToClear) {
                if (!elementToClear) return;
                elementToClear.style.top = "";
                elementToClear.style.left = "";
                elementToClear.style.height = "";
                elementToClear.style.width = "";
            }

            function adjustForCardLayout(cardElement) {
                if (!cardElement) return;
                cardElement.style.height = 'auto';
            }
        }, {}]}, {}, [1])(1)
    );
});