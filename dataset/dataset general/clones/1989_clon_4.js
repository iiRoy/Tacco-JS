const displayManager = (function() {
    let renderingState = {
        renderOrder: [],
        resourceBatch: [],
        totalResourcesToLoad: 0,
        loadedResourceCount: 0,
        erroredAssets: {},

        planeIdentifiers: [],
        planeCount: 0,

        spatialData: {},
        activeLocationIdentifier: null,
        sceneScrollExtent: 0,

        viewDimensionX: null,
        viewDimensionY: null,
        viewAreaWidth: null,
        viewAreaHeight: null,

        locationLoadingInProgress: true,
        currentItemLoading: null,
        loadTimestamps: {
            begin: null,
            end: null
        }
    };

    const domManipulator = {
        fetchElement: (selector) => document.querySelector(selector),
        createDiv: () => document.createElement('div'),
        createCanvas: () => document.createElement('canvas'),
        createImage: () => document.createElement('img'),
        createList: () => document.createElement('ul'),
        createListItem: () => document.createElement('li'),
        createAnchor: () => document.createElement('a'),
        createHeading: (level) => document.createElement(`h${level}`),

        setElementAttributes: (element, attributes) => {
            for (const key in attributes) {
                element.setAttribute(key, attributes[key]);
            }
        },
        applyStyles: (element, styles) => {
            for (const prop in styles) {
                element.style.setProperty(prop, styles[prop]);
            }
        },
        clearChildren: (element) => {
            if (!element) return;
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        appendTo: (parent, child) => {
            if (parent && child) {
                parent.appendChild(child);
            }
        },
        removeElement: (element) => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        },
        updateTextContent: (element, text) => {
            if (element) element.textContent = text;
        }
    };

    const colorProcessor = {
        toRgbString: (colorValue) => {
            if (typeof colorValue === 'string' && (colorValue.length === 6 || colorValue.length === 4 || colorValue.length === 1)) {
                let hex = colorValue;
                while (hex.length < 6) {
                    hex = '0' + hex;
                }
                return `#${hex}`;
            } else {
                const r = (colorValue >> 16) & 0xff;
                const g = (colorValue >> 8) & 0xff;
                const b = colorValue & 0xff;
                return `rgb(${r},${g},${b})`;
            }
        },
        generateLinearGradient: (topColor, bottomColor) => {
            const top = colorProcessor.toRgbString(topColor);
            const bottom = colorProcessor.toRgbString(bottomColor);
            return [
                `-webkit-gradient(linear, left top, left bottom, color-stop(0, ${top}), color-stop(1, ${bottom}))`,
                `-o-linear-gradient(bottom, ${top} 0%, ${bottom} 100%)`,
                `-moz-linear-gradient(bottom, ${top} 0%, ${bottom} 100%)`,
                `-webkit-linear-gradient(bottom, ${top} 0%, ${bottom} 100%)`,
                `-ms-linear-gradient(bottom, ${top} 0%, ${bottom} 100%)`,
                `linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)`
            ];
        }
    };

    const visualModifier = {
        mapGlitchFilterToCss: (filterName, filterValue) => {
            const modifiers = [];
            switch (filterName) {
                case 'brightness':
                    if (filterValue < 0) {
                        modifiers.push(`brightness(${1 - (filterValue / -100)})`);
                    } else if (filterValue > 0) {
                        modifiers.push(`brightness(${1 + (filterValue / 100)})`);
                    }
                    break;
                case 'contrast':
                    if (filterValue < 0) {
                        modifiers.push(`contrast(${1 - (filterValue / -100)})`);
                    } else if (filterValue > 0) {
                        modifiers.push(`contrast(${1 + (filterValue / 100)})`);
                    }
                    break;
                case 'saturation':
                    if (filterValue < 0) {
                        modifiers.push(`saturation(${1 - (filterValue / -100)})`);
                    } else if (filterValue > 0) {
                        modifiers.push(`saturation(${1 + (filterValue / 100)})`);
                    }
                    break;
            }
            return modifiers;
        }
    };

    const remoteScriptInjector = (scriptUrl) => {
        const scriptElement = document.createElement('script');
        scriptElement.src = scriptUrl;
        scriptElement.async = true;
        document.head.appendChild(scriptElement);
    };

    window.processLocationPayload = (data) => {
        renderingState.spatialData = data;
        methods.assembleView();
    };

    const methods = {
        startup: (locationId) => {
            const viewportObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.target.classList.contains('stage_holder_container')) {
                        renderingState.viewAreaWidth = entry.contentRect.width;
                        renderingState.viewAreaHeight = entry.contentRect.height;
                    }
                }
            });
            const stageHolderElement = domManipulator.fetchElement('.stage_holder_container');
            if (stageHolderElement) {
                viewportObserver.observe(stageHolderElement);
                renderingState.viewAreaWidth = stageHolderElement.offsetWidth;
                renderingState.viewAreaHeight = stageHolderElement.offsetHeight;
            }

            methods.fetchLocationData(locationId);

            if (typeof gameAgent !== 'undefined' && gameAgent.initialize) {
                gameAgent.initialize();
            }
        },

        fetchLocationData: (locationId) => {
            renderingState.loadTimestamps.begin = new Date();
            renderingState.activeLocationIdentifier = locationId;

            const mainView = domManipulator.fetchElement('.visual_display_area');
            const placeLabel = domManipulator.fetchElement('.place_label');
            const agentContainer = domManipulator.fetchElement('.agent_container');
            const otherAgentsContainer = domManipulator.fetchElement('.other_agent_containers');
            const localConversation = domManipulator.fetchElement('.local_conversation ul');
            const exitGateways = domManipulator.fetchElement('.exit_gateways');

            if (mainView) {
                mainView.style.transition = 'opacity 1.333s';
                mainView.style.opacity = '0.1';
            }
            domManipulator.updateTextContent(placeLabel, '');
            domManipulator.removeElement(agentContainer);
            domManipulator.removeElement(otherAgentsContainer);
            domManipulator.clearChildren(localConversation);

            if (typeof gameAgent !== 'undefined') {
                gameAgent.otherUsers = {};
                gameAgent.isLoaded = false;
            }
            domManipulator.clearChildren(exitGateways);

            renderingState.renderOrder = [];
            renderingState.resourceBatch = [];
            renderingState.locationLoadingInProgress = true;

            const scriptPath = `http://revdancatt.github.io/CAT422-glitch-location-viewer/locations/${locationId}.callback.json`;
            remoteScriptInjector(scriptPath);
        },

        assembleView: () => {
            const sceneData = renderingState.spatialData;
            document.title = `MVURXI : ${sceneData.label}`;
            domManipulator.updateTextContent(domManipulator.fetchElement('.place_label'), sceneData.label);

            const mainView = domManipulator.fetchElement('.visual_display_area');
            const loadingOverlay = domManipulator.fetchElement('.loading_indicator_wrapper');

            if (mainView) {
                mainView.style.transition = 'none';
                mainView.style.opacity = '0';
                domManipulator.clearChildren(mainView);
                mainView.style.transition = 'opacity 0.666s';
                mainView.style.opacity = '1';
            }
            window.scrollTo(0, 0);

            if (loadingOverlay) {
                loadingOverlay.style.transition = 'opacity 0.666s';
                loadingOverlay.style.opacity = '1';
                loadingOverlay.style.display = 'block';
            }

            const sceneWidth = parseInt(sceneData.dynamic.r, 10) - parseInt(sceneData.dynamic.l, 10);
            const sceneHeight = parseInt(sceneData.dynamic.b, 10) - parseInt(sceneData.dynamic.t, 10);

            domManipulator.applyStyles(mainView, {
                'position': 'absolute',
                'overflow': 'hidden',
                'width': `${sceneWidth}px`,
                'height': `${sceneHeight}px`,
                'z-index': '-1000'
            });
            renderingState.viewDimensionX = sceneWidth;
            renderingState.viewDimensionY = sceneHeight;

            const gradientStyles = colorProcessor.generateLinearGradient(
                sceneData.gradient.top,
                sceneData.gradient.bottom
            );
            gradientStyles.forEach(style => {
                domManipulator.applyStyles(mainView, { 'background-image': style });
            });

            renderingState.sceneScrollExtent = mainView.offsetWidth - window.innerWidth;
            renderingState.viewDimensionX = mainView.offsetWidth;

            renderingState.locationLoadingInProgress = false;
            methods.arrangeVisualPlanes();
        },

        arrangeVisualPlanes: () => {
            const sceneData = renderingState.spatialData;

            const sortedLayerKeys = Object.keys(sceneData.dynamic.layers).sort((a, b) => {
                return sceneData.dynamic.layers[a].z - sceneData.dynamic.layers[b].z;
            });

            renderingState.renderOrder = [];
            renderingState.planeIdentifiers = [];

            sortedLayerKeys.forEach(key => {
                renderingState.renderOrder.push(key);
                renderingState.planeIdentifiers.push(key);
            });

            const mainView = domManipulator.fetchElement('.visual_display_area');
            const exitGateways = domManipulator.fetchElement('.exit_gateways');
            const exitListElement = domManipulator.createList();

            renderingState.renderOrder.forEach(id => {
                const layerData = sceneData.dynamic.layers[id];

                const planeElement = domManipulator.createDiv();
                domManipulator.setElementAttributes(planeElement, { id: id });
                domManipulator.applyStyles(planeElement, {
                    'position': 'absolute',
                    'width': `${parseInt(layerData.w, 10)}px`,
                    'height': `${parseInt(layerData.h, 10)}px`,
                    'left': '0',
                    'top': `${parseInt(domManipulator.fetchElement('.visual_display_area').style.height, 10) - parseInt(layerData.h, 10)}px`,
                    'z-index': `${parseInt(layerData.z, 10)}`
                });

                const planeCanvas = domManipulator.createCanvas();
                domManipulator.setElementAttributes(planeCanvas, {
                    id: `${id}_surface`,
                    width: parseInt(layerData.w, 10),
                    height: parseInt(layerData.h, 10)
                });
                domManipulator.applyStyles(planeCanvas, {
                    'width': `${parseInt(layerData.w, 10)}px`,
                    'height': `${parseInt(layerData.h, 10)}px`,
                    'position': 'absolute',
                    'top': '0',
                    'left': '0'
                });

                const activeFilters = [];
                for (const filterKey in layerData.filters) {
                    activeFilters.push(...visualModifier.mapGlitchFilterToCss(filterKey, layerData.filters[filterKey]));
                }

                if (activeFilters.length > 0) {
                    const filterString = activeFilters.join(' ');
                    domManipulator.applyStyles(planeCanvas, {
                        'filter': filterString,
                        '-webkit-filter': filterString,
                        '-moz-filter': filterString,
                        '-o-filter': filterString,
                        '-ms-filter': filterString
                    });
                }

                domManipulator.appendTo(planeElement, planeCanvas);

                if (id === 'midground') {
                    const agentVisual = domManipulator.createDiv();
                    domManipulator.setElementAttributes(agentVisual, { 'class': 'agent_container' });

                    const agentFrame = domManipulator.createDiv();
                    domManipulator.setElementAttributes(agentFrame, { 'class': 'agent_visual_frame' });

                    const agentFigure = domManipulator.createDiv();
                    domManipulator.setElementAttributes(agentFigure, { 'class': 'agent_figure' });
                    domManipulator.applyStyles(agentFigure, { 'background-image': 'url(img/glitchen/root_base.png)' });

                    domManipulator.appendTo(agentFrame, agentFigure);
                    domManipulator.appendTo(agentVisual, agentFrame);

                    const nameDisplay = domManipulator.createDiv();
                    nameDisplay.classList.add('label_caption');
                    domManipulator.updateTextContent(nameDisplay, gameAgent.agentIdentity);
                    domManipulator.appendTo(agentVisual, nameDisplay);

                    if (typeof gameAgent !== 'undefined' && gameAgent.setCoordinates) {
                        gameAgent.setCoordinates(parseInt(layerData.w, 10) / 2 + 100, 100);
                    }
                    domManipulator.appendTo(planeElement, agentVisual);

                    if (gameAgent.isConnected) {
                        if (typeof networkChannel !== 'undefined' && networkChannel.emit) {
                            networkChannel.emit('joinroom', sceneData.label, gameAgent.currentPosition.x, gameAgent.currentPosition.y, gameAgent.currentPosition.facing);
                        }
                    }
                }

                domManipulator.appendTo(mainView, planeElement);

                for (const signalKey in layerData.signposts) {
                    const signalData = layerData.signposts[signalKey];
                    for (const connectionKey in signalData.connects) {
                        const connectionData = signalData.connects[connectionKey];
                        const linkItem = domManipulator.createListItem();
                        const linkAnchor = domManipulator.createAnchor();
                        domManipulator.setElementAttributes(linkAnchor, {
                            id: connectionData.tsid.replace('L', 'G'),
                            href: `#/${connectionData.tsid}`
                        });
                        domManipulator.updateTextContent(linkAnchor, connectionData.label);
                        domManipulator.appendTo(linkItem, linkAnchor);
                        domManipulator.appendTo(exitListElement, linkItem);
                    }
                }
            });

            domManipulator.appendTo(exitGateways, domManipulator.createHeading(2));
            domManipulator.updateTextContent(domManipulator.fetchElement('.exit_gateways h2'), 'Exits');
            domManipulator.appendTo(exitGateways, exitListElement);

            exitListElement.querySelectorAll('a').forEach(anchor => {
                anchor.addEventListener('click', (event) => {
                    event.preventDefault();
                    methods.fetchLocationData(anchor.id);
                });
            });

            if (typeof gameAgent !== 'undefined') {
                gameAgent.isLoaded = true;
            }

            methods.catalogueDecorations();
        },

        catalogueDecorations: () => {
            const sceneData = renderingState.spatialData;
            renderingState.totalResourcesToLoad = 0;

            renderingState.renderOrder.forEach(planeId => {
                const plane = sceneData.dynamic.layers[planeId];
                
                if (plane.decos && plane.decos.length > 0) {
                    plane.items = plane.decos.sort((a, b) => b.z - a.z);
                    renderingState.totalResourcesToLoad += plane.items.length;
                    delete plane.decos;
                } else {
                    plane.items = [];
                }
            });

            renderingState.loadedResourceCount = renderingState.totalResourcesToLoad;
            renderingState.erroredAssets = {};

            methods.beginResourceLoading();
        },

        beginResourceLoading: () => {
            if (renderingState.locationLoadingInProgress) return;
            
            const loadingOverlay = domManipulator.fetchElement('.loading_indicator_wrapper');
            if (loadingOverlay) {
                loadingOverlay.style.transition = 'opacity 0.666s';
                loadingOverlay.style.opacity = '0';
                loadingOverlay.addEventListener('transitionend', function handler() {
                    loadingOverlay.style.display = 'none';
                    loadingOverlay.removeEventListener('transitionend', handler);
                });
            }
            renderingState.loadTimestamps.end = new Date();
            console.log(`Location loaded in ${renderingState.loadTimestamps.end - renderingState.loadTimestamps.begin}ms`);
        }
    };

    return {
        initializeEngine: methods.startup
    };
})();