(function() {
    const htmlHead = document.head || document.getElementsByTagName("head")[0];
    const hasOwn = Object.prototype.hasOwnProperty;

    const domManipulator = {
        createNode(tagName, attributes = {}) {
            const element = document.createElement(tagName);
            Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
            return element;
        },
        appendNode(parent, child) {
            parent.appendChild(child);
        },
        updateLinkSource(linkElement, newHref) {
            linkElement.href = newHref;
        }
    };

    const pathResolver = {
        extractRelativePath(fullUrl, basePathList) {
            const matchingBase = basePathList.find(base => fullUrl.startsWith(base));
            return matchingBase ? fullUrl.substring(matchingBase.length) : false;
        },
        isInternalResource(linkItem, basePathList) {
            if (linkItem.getAttribute("rel") !== "stylesheet") return false;
            const linkHref = linkItem.href;
            if (!linkHref) return false;

            const isAbsoluteExternal = /^https?:\/\//.test(linkHref);
            const isUnderConfiguredBase = basePathList.some(base => linkHref.startsWith(base));

            return !isAbsoluteExternal || isUnderConfiguredBase;
        },
        isPrintMediaLink(linkItem) {
            return linkItem.getAttribute("media") === "print";
        },
        generateUniqueUrl(originalUrl) {
            const separator = originalUrl.indexOf("?") >= 0 ? "&" : "?";
            return `${originalUrl}${separator}_beacon_cache=${new Date().getTime()}`;
        }
    };

    class StyleAsset {
        constructor(assetKey, resourceElement) {
            this.assetKey = assetKey;
            this.referenceElement = resourceElement;
        }

        getKey() {
            return this.assetKey;
        }

        getSourceHref() {
            return this.referenceElement.href;
        }

        applyNewSource(newHref) {
            if (typeof this.referenceElement.setAttribute === "function") {
                domManipulator.updateLinkSource(this.referenceElement, newHref);
            } else {
                const newLink = domManipulator.createNode("link", {
                    rel: "stylesheet",
                    href: newHref
                });
                domManipulator.appendNode(htmlHead, newLink);
                this.referenceElement = newLink;
            }
        }
    }

    const scriptLoader = {
        fetchExternalScript(scriptSource) {
            return new Promise((resolve, reject) => {
                const scriptElement = domManipulator.createNode("script", {
                    type: "text/javascript",
                    src: scriptSource
                });

                scriptElement.onload = () => resolve();
                scriptElement.onerror = () => reject(new Error(`Script load failure: ${scriptSource}`));
                scriptElement.onreadystatechange = function() {
                    if (this.readyState === "complete" || this.readyState === "loaded") {
                        resolve();
                    }
                };

                domManipulator.appendNode(htmlHead, scriptElement);
            });
        },

        obtainDependencies(dependencyMap) {
            const sourcesToFetch = Object.entries(dependencyMap)
                .filter(([globalVar, src]) => !(globalVar in window))
                .map(([, src]) => src);

            if (sourcesToFetch.length === 0) {
                return Promise.resolve();
            }

            return Promise.all(sourcesToFetch.map(src => this.fetchExternalScript(src)));
        }
    };

    class StyleBeacon {
        constructor() {
            this.operationalSettings = this.deriveModuleSettings();
            this.activeResources = new Map();
            this.socketConnection = null;

            this.initiate();
        }

        deriveModuleSettings() {
            const defaultResourceBases = [document.location.protocol + "//" + document.location.host];
            let moduleConfiguration = {
                serverEndpoint: null,
                resourceBases: defaultResourceBases
            };

            if (typeof window.__beacon_config__ !== "undefined") {
                if (!window.__beacon_config__.resourceBases) {
                    window.__beacon_config__.resourceBases = defaultResourceBases;
                }
                return window.__beacon_config__;
            }

            const allScripts = Array.from(document.getElementsByTagName("script"));
            const selfScript = allScripts.find(s => {
                const sourceAttribute = s.getAttribute("src");
                return sourceAttribute && sourceAttribute.endsWith("beacon-client.js");
            });

            if (selfScript) {
                const scriptSource = selfScript.getAttribute("src");
                try {
                    const scriptUrl = new URL(scriptSource, document.baseURI);
                    moduleConfiguration.serverEndpoint = scriptUrl.origin + "/";

                    const baseParameter = scriptUrl.searchParams.get("base");
                    if (baseParameter) {
                        moduleConfiguration.resourceBases = moduleConfiguration.resourceBases.concat(baseParameter.split(","));
                    }
                } catch (e) {
                    const match = scriptSource.match(/^https?:\/\/(.*?)\//);
                    if (match && match[0]) {
                        moduleConfiguration.serverEndpoint = match[0];
                    } else {
                        moduleConfiguration.serverEndpoint = document.location.protocol + "//" + document.location.host + "/";
                    }

                    const baseMatch = scriptSource.match(/\bbase=([^&]*)/);
                    if (baseMatch && baseMatch[1]) {
                        moduleConfiguration.resourceBases = moduleConfiguration.resourceBases.concat(baseMatch[1].split(","));
                    }
                }
            } else {
                moduleConfiguration.serverEndpoint = document.location.protocol + "//" + document.location.host + "/";
            }

            window.__beacon_config__ = moduleConfiguration;
            return moduleConfiguration;
        }

        discoverLocalResources() {
            const allElements = Array.from(document.querySelectorAll("link, style"));

            const getPropertyAttribute = function(attrName) {
                return this[attrName];
            };

            const processElement = (element) => {
                if (pathResolver.isPrintMediaLink(element)) return;

                if (element.tagName.toLowerCase() === "link") {
                    if (pathResolver.isInternalResource(element, this.operationalSettings.resourceBases)) {
                        const relativePath = pathResolver.extractRelativePath(element.href, this.operationalSettings.resourceBases);
                        if (relativePath !== false) {
                            this.activeResources.set(relativePath, new StyleAsset(relativePath, element));
                        }
                    }
                } else if (element.tagName.toLowerCase() === "style") {
                    const content = element.textContent || element.innerText;
                    const importPattern = /@import\s+url\(["']?([^"'\)]+)["']?\)/g;
                    let currentMatch;
                    while ((currentMatch = importPattern.exec(content))) {
                        const importSource = currentMatch[1];
                        const mockLink = {
                            rel: "stylesheet",
                            href: importSource,
                            getAttribute: getPropertyAttribute
                        };
                        if (pathResolver.isInternalResource(mockLink, this.operationalSettings.resourceBases)) {
                            const relativePath = pathResolver.extractRelativePath(importSource, this.operationalSettings.resourceBases);
                            if (relativePath !== false) {
                                this.activeResources.set(relativePath, new StyleAsset(relativePath, mockLink));
                            }
                        }
                    }
                }
            };

            allElements.forEach(processElement);
        }

        broadcastWatchRequests() {
            this.activeResources.forEach(resource => {
                this.socketConnection.emit("watch", {
                    href: resource.getKey()
                });
            });
        }

        updateStyleResource(resourcePath) {
            const targetAsset = this.activeResources.get(resourcePath);
            if (targetAsset) {
                const currentHref = targetAsset.getSourceHref();
                const updatedHref = pathResolver.generateUniqueUrl(currentHref);
                targetAsset.applyNewSource(updatedHref);
            }
        }

        processUpdateNotification(messagePayload) {
            if (messagePayload && messagePayload.href) {
                this.updateStyleResource(messagePayload.href);
            }
        }

        establishSocketConnection() {
            this.socketConnection = io.connect(this.operationalSettings.serverEndpoint);
            this.socketConnection.on("connect", () => this.broadcastWatchRequests());
            this.socketConnection.on("update", (payload) => this.processUpdateNotification(payload));
        }

        initiate() {
            scriptLoader.obtainDependencies({
                io: this.operationalSettings.serverEndpoint + "socket.io/socket.io.js"
            }).then(() => {
                this.establishSocketConnection();
                this.discoverLocalResources();
            }).catch(error => {
                console.error("StyleBeacon: Initialization failed.", error);
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => new StyleBeacon());
    } else {
        new StyleBeacon();
    }

})();