(function() {

    // Global Configuration and Application State
    const currentCookieInfo = document.cookie.match("terminal_color=(.+?)(;|$)");
    const displayColorValue = currentCookieInfo && currentCookieInfo.length ? currentCookieInfo[1] : '17,187,17'; // Default green
    const marginSpace = 10; // Renamed PADDING

    let commLink = io.connect(window.location.origin); // Renamed socket
    let connectionRestored = false; // Renamed reconnect
    let channelInstances = []; // Renamed feeds
    const hueSelector = document.getElementById('color-picker'); // Renamed color_picker
    const reloaderPanel = document.getElementById('refresh'); // Renamed refresh
    const topNavigation = document.getElementById('nav_bar'); // Renamed nav_bar
    const channelMenu = document.getElementById('add-feed'); // Renamed add_feed
    const displayArea = document.getElementById('feeds'); // Renamed feed_container
    const layoutOptions = document.getElementById('tile-chooser'); // Renamed tile_chooser
    const transmissionIndicator = document.querySelector('.data_received'); // Renamed data_received
    const statusLight = document.getElementById('connection'); // Renamed connected
    const alertBanner = document.getElementById('notification'); // Renamed notification
    let refreshProcessActive = false; // Renamed refresh_active
    const dataRepository = new Map(); // Renamed cache, using Map

    let viewportWidth = displayArea.offsetWidth; // Renamed win_width
    let viewportHeight = window.innerHeight - topNavigation.offsetHeight; // Renamed win_height

    let windowSizingDelay = null; // Renamed resize_timer (Debouncer)

    const arrangementModes = { // Renamed tile_prefs
        fullScreenMode: 'fullview',
        horizontalSplit: 'sidebyside',
        verticalSplit: 'stacked',
        quadrantLayout: 'quadrant'
    };

    // --- Helper Functions for DOM Interaction ---
    const selectElement = (selector, parent = document) => parent.querySelector(selector);
    const selectAllElements = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
    const createDomElement = (tag, classes = [], attributes = {}) => {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes);
        for (const key in attributes) el.setAttribute(key, attributes[key]);
        return el;
    };

    // --- Core Application Logic ---

    function initializeApplication() { // Renamed init
        channelInstances = retrieveConfigurationHash();

        if (channelInstances.length) {
            channelInstances.forEach(instance => createStreamPanel(instance));
            manageLayerOrder();
            selectAllElements('.stream-panel input').forEach(input => {
                const event = new KeyboardEvent('keyup', { bubbles: true });
                input.dispatchEvent(event);
            });
        }

        bindInteractionListeners();
        hueSelector.style.backgroundColor = `rgb(${displayColorValue})`;
        syncLayoutPreference();
    }

    function bindInteractionListeners() { // Renamed attachEvents
        commLink.on('connect', () => {
            if (connectionRestored) {
                connectionRestored = false;
                initiatePageReload();
            }
            statusLight.title = 'Connected';
            statusLight.classList.add('active-status');
        });

        commLink.on('disconnect', () => {
            connectionRestored = true;
            statusLight.title = 'Disconnected';
            statusLight.classList.remove('active-status');
        });

        commLink.on('refresh', initiatePageReload);

        layoutOptions.addEventListener('click', (event) => {
            const targetOption = event.target.closest('.layout-option');
            if (targetOption) {
                const preference = targetOption.dataset.preference;
                applyLayoutPreference(preference);
            }
        });

        window.addEventListener('resize', adjustWindowDimensions);

        channelMenu.addEventListener('click', handleChannelSelection);
    }

    function handleChannelSelection(event) { // Renamed onAddFeedClick
        event.preventDefault();
        const clickedLink = event.target.closest('a');
        if (!clickedLink) return;

        const channelIdentifier = clickedLink.getAttribute('href').substring(1);
        const existingPanel = document.getElementById(`${channelIdentifier}-stream-panel`);

        if (existingPanel) {
            manageLayerOrder(channelIdentifier);
            return;
        }

        const panelCount = selectAllElements('.stream-panel').length;
        const newPanelData = {
            identifier: channelIdentifier,
            topOffset: 100 + (panelCount * 20),
            leftOffset: 100 + (panelCount * 20)
        };

        createStreamPanel(newPanelData);
        channelInstances.push(newPanelData);

        manageLayerOrder(newPanelData.identifier);
        syncLayoutPreference();
        persistCurrentState();
    }

    function adjustWindowDimensions(event) { // Renamed onWindowResize
        clearTimeout(windowSizingDelay);

        if (event.target !== window) {
            clearLayoutPreference();
            activateMovementStyle();
        } else if (!alertBanner.classList.contains('visible-banner')) {
            selectElement('p', alertBanner).textContent = 'Resizing...';
            alertBanner.style.display = 'block';
            alertBanner.style.opacity = '1';
        }

        windowSizingDelay = setTimeout(() => {
            deactivateMovementStyle();
            syncLayoutPreference();
            alertBanner.style.opacity = '0';
            alertBanner.addEventListener('transitionend', function handler() {
                alertBanner.style.display = 'none';
                alertBanner.removeEventListener('transitionend', handler);
            }, { once: true });
        }, 100);
    }

    function activateMovementStyle() { // Renamed setMovingClass
        document.body.classList.add('in-motion');
    }

    function deactivateMovementStyle() { // Renamed unsetMovingClass
        document.body.classList.remove('in-motion');
    }

    function setMainAreaDimensions() { // Renamed setContainerSize
        viewportWidth = displayArea.offsetWidth;
        viewportHeight = window.innerHeight - topNavigation.offsetHeight;
        displayArea.style.height = `${viewportHeight}px`;
    }

    function syncLayoutPreference() { // Renamed updateTilePreference
        setMainAreaDimensions();

        if (localStorage.getItem('layout_preference')) {
            applyLayoutPreference(localStorage.getItem('layout_preference'));
        }
    }

    function applyLayoutPreference(preference) { // Renamed setTilePreference
        selectAllElements('.layout-option', layoutOptions).forEach(option => option.classList.remove('active-option'));
        selectElement(`[data-preference="${preference}"]`, layoutOptions).classList.add('active-option');
        localStorage.setItem('layout_preference', preference);

        executeLayoutTransformation(preference);
    }

    function clearLayoutPreference() { // Renamed unsetTilePreference
        selectAllElements('.layout-option', layoutOptions).forEach(option => option.classList.remove('active-option'));
        localStorage.removeItem('layout_preference');
    }

    function executeLayoutTransformation(preference) { // Renamed activateTilePreference
        const transformationMap = new Map([
            [arrangementModes.fullScreenMode, arrangeFullView],
            [arrangementModes.horizontalSplit, arrangeSideBySide],
            [arrangementModes.verticalSplit, arrangeStacked],
            [arrangementModes.quadrantLayout, arrangeQuadrant]
        ]);

        const transformFunction = transformationMap.get(preference);
        if (transformFunction) {
            transformFunction();
        }
        persistCurrentState();
    }

    function arrangeFullView() { // Renamed setTilesFullscreen
        selectAllElements('.stream-panel').forEach(panel => {
            Object.assign(panel.style, {
                width: `${viewportWidth}px`,
                height: `${viewportHeight - (6 * marginSpace)}px`,
                left: '0px',
                top: '0px'
            });
        });
    }

    function arrangeSideBySide() { // Renamed setTilesHorizontally
        selectAllElements('.stream-panel').forEach((panel, index) => {
            Object.assign(panel.style, {
                width: `${(viewportWidth - (2 * marginSpace)) / 2}px`,
                height: `${viewportHeight - (6 * marginSpace)}px`,
                left: `${index % 2 === 0 ? 0 : viewportWidth / 2}px`,
                top: '0px'
            });
        });
    }

    function arrangeStacked() { // Renamed setTilesVertically
        selectAllElements('.stream-panel').forEach((panel, index) => {
            Object.assign(panel.style, {
                width: `${viewportWidth}px`,
                height: `${(viewportHeight - (12 * marginSpace)) / 2}px`,
                left: '0px',
                top: `${index % 2 === 0 ? 0 : viewportHeight / 2}px`
            });
        });
    }

    function arrangeQuadrant() { // Renamed setTilesFourways
        selectAllElements('.stream-panel').forEach((panel, index) => {
            const panelProps = {
                width: `${(viewportWidth - (2 * marginSpace)) / 2}px`,
                height: `${(viewportHeight - (12 * marginSpace)) / 2}px`
            };

            const positionCalculations = new Map([
                [0, { top: '0px', left: '0px' }],
                [1, { top: '0px', left: `${viewportWidth / 2}px` }],
                [2, { top: `${viewportHeight / 2}px`, left: '0px' }],
                [3, { top: `${viewportHeight / 2}px`, left: `${viewportWidth / 2}px` }]
            ]);

            Object.assign(panel.style, panelProps, positionCalculations.get(index % 4));
        });
    }

    function initiatePageReload() { // Renamed refreshPage

        if (refreshProcessActive) return;

        refreshProcessActive = true;

        let countdownValue = parseInt(selectElement('.countdown-timer', reloaderPanel).textContent, 10);
        let reloadIntervalId;

        const cancelHandler = function(event) {
            event.preventDefault();
            clearInterval(reloadIntervalId);
            reloaderPanel.style.opacity = '0';
            reloaderPanel.addEventListener('transitionend', function handler() {
                reloaderPanel.style.display = 'none';
                reloaderPanel.removeEventListener('transitionend', handler);
            }, { once: true });
            refreshProcessActive = false;
            selectElement('.countdown-timer', reloaderPanel).textContent = 10;
            this.removeEventListener('click', cancelHandler);
        };

        selectElement('.cancel-reload', reloaderPanel).addEventListener('click', cancelHandler, { once: true });

        reloaderPanel.style.display = 'block';
        reloaderPanel.style.opacity = '1';

        reloadIntervalId = setInterval(() => {
            countdownValue--;
            selectElement('.countdown-timer', reloaderPanel).textContent = countdownValue;
            if (countdownValue <= 0) {
                clearInterval(reloadIntervalId);
                selectAllElements('.stream-panel').concat([reloaderPanel]).forEach(el => {
                    el.style.opacity = '0';
                    el.addEventListener('transitionend', function handler() {
                        el.style.display = 'none';
                        el.removeEventListener('transitionend', handler);
                    }, { once: true });
                });
                window.location.reload(true);
            }
        }, 1000);
    }

    function retrieveConfigurationHash() { // Renamed getHash
        try {
            const currentHash = window.location.hash.substring(1);
            if (currentHash.startsWith('%')) {
                return JSON.parse(decodeURIComponent(currentHash));
            }
            return JSON.parse(currentHash);
        } catch (e) {
            return [];
        }
    }

    function storeConfigurationHash(dataPayload) { // Renamed setHash
        window.location.hash = JSON.stringify(dataPayload);
    }

    function persistCurrentState() { // Renamed updateHash
        const updatedInstances = channelInstances.map(instance => {
            const currentElement = document.getElementById(`${instance.identifier}-stream-panel`);
            if (!currentElement) {
                return null;
            }
            const currentRect = currentElement.getBoundingClientRect();
            const parentRect = displayArea.getBoundingClientRect(); // Get parent rect for relative positions

            instance.topOffset = currentRect.top - parentRect.top;
            instance.leftOffset = currentRect.left - parentRect.left;
            instance.width = currentElement.offsetWidth;
            instance.height = currentElement.offsetHeight;
            instance.regexPattern = selectElement('input', currentElement).value;
            return instance;
        }).filter(instance => instance !== null);

        channelInstances = updatedInstances;
        storeConfigurationHash(channelInstances);
    }

    function manageLayerOrder(targetIdentifier = null) { // Renamed updateZIndex
        if (targetIdentifier) {
            const targetIndex = channelInstances.findIndex(inst => inst.identifier === targetIdentifier);
            if (targetIndex !== -1) {
                const [movedInstance] = channelInstances.splice(targetIndex, 1);
                channelInstances.push(movedInstance);
            }
        }

        channelInstances.forEach((instance, idx) => {
            const panelElement = document.getElementById(`${instance.identifier}-stream-panel`);
            if (panelElement) {
                panelElement.style.zIndex = (idx + 1) * 100;
                panelElement.classList.remove('active-panel');
            }
        });

        if (channelInstances.length > 0) {
            const lastPanel = document.getElementById(`${channelInstances[channelInstances.length - 1].identifier}-stream-panel`);
            if (lastPanel) {
                lastPanel.classList.add('active-panel');
            }
        }
    }

    function processStreamData(preElement, incomingData, channelIdentifier, patternChanged) { // Renamed filterFeed

        const inputElement = selectElement('input', preElement.parentElement);
        const currentPattern = inputElement.dataset.activeRegex;
        let channelData = dataRepository.get(channelIdentifier) || [];

        if (channelData.length > 2000) {
            channelData = channelData.slice(channelData.length - 1500);
        }

        if (incomingData) {
            const processedData = incomingData
                .replace(/\b13\d{8,11}\b/g, (match) => `"${new Date(parseInt(match.substring(0, 10)) * 1000).toISOString()}"`)
                .split(/\s*\n+/)
                .filter(line => line.trim() !== '');
            channelData = channelData.concat(processedData);
            dataRepository.set(channelIdentifier, channelData);
        }

        if (currentPattern) {
            let regexObject;
            try {
                 const regexStringMatch = currentPattern.match(/^\/(.*)\/([a-z]*)$/);
                 if (regexStringMatch) {
                     regexObject = new RegExp(regexStringMatch[1], regexStringMatch[2]);
                 } else {
                     regexObject = new RegExp(currentPattern);
                 }
            } catch (e) {
                // Should not happen if regex is validated on input, but fallback
                regexObject = new RegExp('');
            }


            const filteredLines = channelData.reduce((accumulator, line) => {
                const matchResult = line.match(regexObject);
                if (matchResult) {
                    accumulator.push(matchResult.length > 1 && matchResult.slice(1).join(', ') || line);
                }
                return accumulator;
            }, []);

            preElement.textContent = filteredLines.join("\n") + "\n";

            if (patternChanged) {
                preElement.scrollTop = preElement.scrollHeight;
            }
        } else {
            preElement.textContent = channelData.join("\n") + "\n";
        }
    }

    // --- Manual Draggable and Resizable Implementations ---
    function makeDraggable(element, handle, onStopCallback) {
        let isDragging = false;
        let initialX, initialY;
        let xOffset = 0, yOffset = 0;

        const startDrag = (e) => {
            if (e.target !== handle && !handle.contains(e.target)) return; // Only drag by handle

            e.preventDefault();
            isDragging = true;
            element.classList.add('dragging-element');

            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;

            const elementRect = element.getBoundingClientRect();
            xOffset = clientX - elementRect.left;
            yOffset = clientY - elementRect.top;

            initialX = clientX;
            initialY = clientY;

            document.addEventListener("mousemove", performDrag, false);
            document.addEventListener("mouseup", endDrag, false);
            document.addEventListener("touchmove", performDrag, false);
            document.addEventListener("touchend", endDrag, false);
        };

        const performDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;

            let newLeft = currentX - xOffset;
            let newTop = currentY - yOffset;

            // Containment logic
            const containerRect = displayArea.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            newLeft = Math.max(containerRect.left, Math.min(newLeft, containerRect.right - elementRect.width));
            newTop = Math.max(containerRect.top, Math.min(newTop, containerRect.bottom - elementRect.height));

            element.style.left = `${newLeft - containerRect.left}px`;
            element.style.top = `${newTop - containerRect.top}px`;
        };

        const endDrag = () => {
            isDragging = false;
            element.classList.remove('dragging-element');
            document.removeEventListener("mousemove", performDrag, false);
            document.removeEventListener("mouseup", endDrag, false);
            document.removeEventListener("touchmove", performDrag, false);
            document.removeEventListener("touchend", endDrag, false);
            if (onStopCallback) onStopCallback();
        };

        handle.addEventListener("mousedown", startDrag, false);
        handle.addEventListener("touchstart", startDrag, false);
    }

    function makeResizable(element, handle, onStopCallback) {
        let isResizing = false;
        let initialX, initialY, initialWidth, initialHeight;

        const startResize = (e) => {
            e.preventDefault();
            isResizing = true;
            element.classList.add('resizing-element');

            initialX = e.clientX || e.touches[0].clientX;
            initialY = e.clientY || e.touches[0].clientY;
            initialWidth = element.offsetWidth;
            initialHeight = element.offsetHeight;

            document.addEventListener("mousemove", performResize, false);
            document.addEventListener("mouseup", endResize, false);
            document.addEventListener("touchmove", performResize, false);
            document.addEventListener("touchend", endResize, false);
        };

        const performResize = (e) => {
            if (!isResizing) return;
            e.preventDefault();

            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;

            const newWidth = initialWidth + (currentX - initialX);
            const newHeight = initialHeight + (currentY - initialY);

            element.style.width = `${Math.max(50, newWidth)}px`; // Minimum width
            element.style.height = `${Math.max(50, newHeight)}px`; // Minimum height
        };

        const endResize = () => {
            isResizing = false;
            element.classList.remove('resizing-element');
            document.removeEventListener("mousemove", performResize, false);
            document.removeEventListener("mouseup", endResize, false);
            document.removeEventListener("touchmove", performResize, false);
            document.removeEventListener("touchend", endResize, false);
            if (onStopCallback) onStopCallback();
        };

        handle.addEventListener("mousedown", startResize, false);
        handle.addEventListener("touchstart", startResize, false);
    }

    function createStreamPanel(panelData) { // Renamed addNewFeed
        const panelElement = createDomElement('div', ['stream-panel'], { id: `${panelData.identifier}-stream-panel` });

        Object.assign(panelElement.style, {
            position: 'absolute', // Ensure absolute positioning for draggable/resizable
            top: `${panelData.topOffset}px`,
            left: `${panelData.leftOffset}px`,
            width: panelData.width ? `${panelData.width}px` : '300px', // Default width if not set
            height: panelData.height ? `${panelData.height}px` : '200px' // Default height if not set
        });

        const panelNav = createDomElement('nav');
        panelNav.innerHTML = `
            <span>${panelData.identifier}</span>
            <a href="#" class="close-panel-btn">&times;</a>
            <input type="text" placeholder="/.*/" />
            <button class="toggle-stream-btn">pause</button>
        `;

        const preDisplay = createDomElement('pre', ['terminal-output'], { contenteditable: 'true' });
        preDisplay.style.color = `rgb(${displayColorValue})`;
        preDisplay.dataset.autoscroll = 'true';

        if (panelData.regexPattern) {
            selectElement('input', panelNav).value = panelData.regexPattern;
        }

        panelElement.append(panelNav, preDisplay);
        displayArea.append(panelElement);

        // Initial hide with fade transition
        panelElement.style.display = 'block';
        panelElement.style.opacity = '0';
        panelElement.style.transition = 'opacity 0.2s ease-in-out';
        setTimeout(() => panelElement.style.opacity = '1', 0);

        makeDraggable(panelElement, panelNav, () => {
            persistCurrentState();
            clearLayoutPreference();
        });

        const resizeHandle = createDomElement('div', ['resize-handle']);
        panelElement.append(resizeHandle);

        makeResizable(panelElement, resizeHandle, persistCurrentState);

        panelElement.addEventListener('mousedown', () => {
            manageLayerOrder(panelData.identifier);
            persistCurrentState();
        });

        const pauseButton = selectElement('.toggle-stream-btn', panelNav);
        pauseButton.addEventListener('click', () => {
            panelElement.classList.toggle('paused-stream');
            if (panelElement.classList.contains('paused-stream')) {
                commLink.emit('unsubscribe', `${panelData.identifier}:raw`);
                pauseButton.textContent = 'resume';
            } else {
                commLink.emit('subscribe', `${panelData.identifier}:raw`);
                pauseButton.textContent = 'pause';
            }
        });

        const regexInput = selectElement('input', panelNav);
        regexInput.addEventListener('keydown', (e) => e.stopPropagation());
        regexInput.addEventListener('keyup', () => {
            const inputValue = regexInput.value;

            if (inputValue.length === 0) {
                const hadPattern = !!regexInput.dataset.activeRegex;
                delete regexInput.dataset.activeRegex;
                persistCurrentState();
                if (hadPattern) {
                    processStreamData(preDisplay, null, panelData.identifier, true);
                }
                return;
            }

            try {
                let regexObject;
                const regexStringMatch = inputValue.match(/^\/(.*)\/([a-z]*)$/);

                if (regexStringMatch) {
                    const pattern = regexStringMatch[1];
                    const modifiers = regexStringMatch[2];
                    regexObject = new RegExp(pattern, modifiers);
                } else {
                    regexObject = new RegExp(inputValue);
                }

                regexInput.dataset.activeRegex = inputValue; // Store original input string for persistCurrentState
                regexInput.classList.remove('input-error');

                persistCurrentState();
                processStreamData(preDisplay, null, panelData.identifier, true);

            } catch (error) {
                console.error(error);
                regexInput.classList.add('input-error');
            }
        });

        preDisplay.addEventListener('scroll', (e) => {
            preDisplay.dataset.autoscroll = (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight).toString();
        });

        commLink.emit('subscribe', `${panelData.identifier}:raw`);
        commLink.on(`${panelData.identifier}:raw`, (incomingPayload) => {
            transmissionIndicator.classList.add('active-transmission');
            setTimeout(() => { transmissionIndicator.classList.remove('active-transmission'); }, 800);

            const currentScrollEnabled = preDisplay.dataset.autoscroll === 'true';

            processStreamData(preDisplay, incomingPayload, panelData.identifier);

            if (currentScrollEnabled) {
                preDisplay.scrollTop = preDisplay.scrollHeight;
            }
        });

        const closeButton = selectElement('.close-panel-btn', panelNav);
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();

            const listItem = selectElement(`li:has(a[href="#${panelData.identifier}"])`, channelMenu);
            if (listItem) listItem.classList.remove('active-channel');

            commLink.emit("unsubscribe", `${panelData.identifier}:raw`);

            panelElement.style.opacity = '0';
            panelElement.addEventListener('transitionend', function handler() {
                panelElement.remove();
                persistCurrentState();
                this.removeEventListener('transitionend', handler);
            }, { once: true });
        });
    }

    // Initialize the application on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeApplication);

})();