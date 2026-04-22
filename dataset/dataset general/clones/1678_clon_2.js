(function (modExports) {
    if ("function" === typeof bootstrapModule) {
        bootstrapModule("content-revealer", modExports);
    } else if ("object" === typeof moduleExports) {
        moduleExports.exports = modExports();
    } else if ("function" === typeof defineModule && defineModule.amd) {
        defineModule(modExports);
    } else if ("undefined" !== typeof sesGlobal) {
        if (!sesGlobal.ok()) return;
        sesGlobal.makeContentRevealer = modExports;
    } else if ("undefined" !== typeof globalWindow) {
        globalWindow.contentRevealer = modExports();
    } else {
        globalThis.contentRevealer = modExports();
    }
})(function () {
    var defModule, sesGlobal, bootstrapModule, moduleExports, exportObject;

    return (function (moduleRegistry, moduleCache, entryModules) {
        function getModule(moduleId, isOptional) {
            if (!moduleCache[moduleId]) {
                if (!moduleRegistry[moduleId]) {
                    var reqFunction = typeof require === "function" && require;
                    if (!isOptional && reqFunction) return reqFunction(moduleId, true);
                    if (globalReqFunction) return globalReqFunction(moduleId, true);
                    throw new Error("Cannot locate module '" + moduleId + "'");
                }
                var moduleDef = moduleCache[moduleId] = { exports: {} };
                moduleRegistry[moduleId][0].call(moduleDef.exports, function (depIdentifier) {
                    var resolvedDep = moduleRegistry[moduleId][1][depIdentifier];
                    return getModule(resolvedDep ? resolvedDep : depIdentifier);
                }, moduleDef, moduleDef.exports);
            }
            return moduleCache[moduleId].exports;
        }
        var globalReqFunction = typeof require === "function" && require;
        for (var idx = 0; idx < entryModules.length; idx++) {
            getModule(entryModules[idx]);
        }
        return getModule(entryModules[0]);
    })({
        1: [function (reqDep, modInst, expObj) {
            expObj.reveal = revealContent;

            function revealContent(sourceNode, displayHtml, viewMode, cssClass, animDuration) {
                var displayPosition, backPanel, styleSetter;

                animDuration = animDuration || 500;
                viewMode = viewMode || "card";

                if (viewMode === "modal") {
                    cssClass = cssClass || "revealer-modal-dark";
                    displayPosition = "fixed";
                    styleSetter = resetModalStyles;
                }

                if (viewMode === "card") {
                    cssClass = cssClass || "revealer-modal-light";
                    displayPosition = "absolute";
                    styleSetter = adjustCardHeight;
                }

                backPanel = document.createElement('div');
                document.body.appendChild(backPanel);
                configureBaseStyles(backPanel, sourceNode, displayPosition);
                backPanel.innerHTML = displayHtml;

                sourceNode.classList.add('panel-origin');
                backPanel.classList.add('panel-surface');
                backPanel.classList.add(cssClass);

                if (displayPosition == "absolute") {
                    styleSetter(backPanel);
                } else {
                    window.setTimeout(function () {
                        styleSetter(backPanel);
                    }, 0);
                }

                window.setTimeout(function () {
                    backPanel.classList.add('panel-animated');
                    backPanel.classList.add('revealed');
                    sourceNode.classList.add('revealed');
                }, 0);

                backPanel.addEventListener('closeEvent', dismissView);
                backPanel.dismiss = dismissView;

                function dismissView() {
                    configureBaseStyles(backPanel, sourceNode, displayPosition);
                    backPanel.classList.remove('revealed');
                    backPanel.classList.remove('revealed');
                    sourceNode.classList.remove('revealed');
                    window.setTimeout(function () {
                        backPanel.classList.remove(cssClass);
                        document.body.removeChild(backPanel);
                    }, animDuration);
                }

                return backPanel;
            }

            function configureBaseStyles(targetElement, referenceElement, displayMode) {
                targetElement.style.position = displayMode;
                targetElement.style.top = referenceElement.offsetTop + "px";
                targetElement.style.left = referenceElement.offsetLeft + "px";
                targetElement.style['min-height'] = referenceElement.offsetHeight + "px";
                targetElement.style.width = referenceElement.offsetWidth + "px";
                targetElement.style["z-index"] = 99999;
            }

            function resetModalStyles(targetElement) {
                targetElement.style.top = null;
                targetElement.style.left = null;
                targetElement.style.height = null;
                targetElement.style.width = null;
            }

            function adjustCardHeight(targetElement) {
                targetElement.style.height = 'auto';
            }
        }],
    }, {}, [1])(1);
});