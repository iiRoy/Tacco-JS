((globalScope) => {
    'use strict';

    const SoftwareVersion = 0.4;

    const applicationState = {
        planetData: {},
        primaryPlanetIdentifier: null,
        highlightPreference: null,
        suppressSecondary: null,
        updateTimerHandle: null,
        displayOrderSequence: [],
        clientLastUpdate: 0,
        serverTimePoint: 0,
        currentSortingMethod: null,
    };

    const retrievePersistedSettings = (defaultValues, callback) => {
        chrome.storage.local.get(defaultValues, (retrievedSettings) => {
            applicationState.planetData = retrievedSettings.servers;
            applicationState.primaryPlanetIdentifier = retrievedSettings.main;
            applicationState.highlightPreference = retrievedSettings.flare;
            applicationState.suppressSecondary = retrievedSettings.hide2;
            applicationState.displayOrderSequence = retrievedSettings.order;
            applicationState.clientLastUpdate = retrievedSettings.lastUpdate;
            applicationState.serverTimePoint = retrievedSettings.serverTimestamp;
            applicationState.currentSortingMethod = retrievedSettings.sortOrder;
            callback(retrievedSettings);
        });
    };

    const persistSettings = (settingsObject) => {
        chrome.storage.local.set(settingsObject);
    };

    const constructPlanetDisplay = () => {
        const containerElement = document.querySelector('.alert-container');
        if (!containerElement) return;

        containerElement.innerHTML = '';

        Object.values(applicationState.planetData).forEach(planetEntry => {
            if (applicationState.suppressSecondary && planetEntry.id !== applicationState.primaryPlanetIdentifier) {
                return;
            }

            const extraClassIndicator = (planetEntry.id === applicationState.primaryPlanetIdentifier) ? ' in' : '';

            const planetRowHTML = `
                <div class="row" id="server-${planetEntry.id}" draggable="true">
                    <div class="col-xs-1">
                        <button type="button" class="btn btn-default btn-lg handle">
                            <span class="glyphicon glyphicon-align-justify"></span>
                        </button>
                    </div>
                    <div class="col-xs-11">
                        <div class="panel panel-default server-${planetEntry.id}">
                            <div class="panel-heading">
                                <h4 class="panel-title">
                                    <a data-toggle="collapse" href="#collapse${planetEntry.id}">
                                        <span class="server-name">${planetEntry.name}</span>
                                    </a>
                                    <span class="pull-right badge remaining"></span>
                                </h4>
                                <table class="table info text-center hide">
                                    <tbody>
                                        <tr>
                                            <td class="type"></td>
                                            <td class="continent"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div id="collapse${planetEntry.id}" class="panel-collapse collapse${extraClassIndicator}">
                                <div class="panel-body text-center"></div>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <td class="remaining"></td>
                                            <td class="type"></td>
                                            <td class="continent"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            containerElement.insertAdjacentHTML('beforeend', planetRowHTML);

            refreshPlanetDisplay(planetEntry);
        });
    };

    const refreshPlanetDisplay = (planetEntry) => {
        const planetElementRef = document.querySelector(`.server-${planetEntry.id}`);
        if (!planetElementRef) return;

        const typeElement = planetElementRef.querySelector('.type');
        const continentElement = planetElementRef.querySelector('.continent');
        const panelBodyElement = planetElementRef.querySelector('.panel-body');
        const remainingElement = planetElementRef.querySelector('.remaining');
        const infoTableElement = planetElementRef.querySelector('.info');
        const handleElement = planetElementRef.querySelector('.handle');

        if (planetEntry.Status === 1) {
            planetElementRef.classList.add('success');
            infoTableElement.classList.remove('hide');
            handleElement.style.height = '51px';

            let alertMediaElement = planetElementRef.querySelector('.server-name video');
            if (!alertMediaElement) {
                alertMediaElement = document.createElement('video');
                alertMediaElement.width = 30;
                alertMediaElement.height = 30;
                alertMediaElement.autoplay = true;
                alertMediaElement.loop = true;
                const sourceElement = document.createElement('source');
                sourceElement.src = 'img/AlertAnim2.mp4';
                sourceElement.type = 'video/mp4';
                alertMediaElement.appendChild(sourceElement);
                planetElementRef.querySelector('.server-name').insertAdjacentElement('beforebegin', alertMediaElement);
                alertMediaElement.play();
            }

            typeElement.innerHTML = planetEntry.alert.type;
            typeElement.setAttribute('data-tooltip', 'true');
            typeElement.setAttribute('title', `EXP Bonus: ${planetEntry.alert.experience_bonus}%`);

            const alertTypeHandlers = new Map([
                ['Territory', () => injectAlertSpecificContent('territory', planetEntry)],
                ['Bio', () => injectAlertSpecificContent('facility', planetEntry)],
                ['Tech', () => injectAlertSpecificContent('facility', planetEntry)],
                ['Amp', () => injectAlertSpecificContent('facility', planetEntry)],
            ]);
            const handler = alertTypeHandlers.get(planetEntry.alert.type);
            if (handler) handler();

            continentElement.textContent = planetEntry.alert.zone;
            remainingElement.classList.remove('inactive');

            recalculateTimers(planetEntry);
        } else {
            const existingVideo = planetElementRef.querySelector('video');
            if (existingVideo) existingVideo.remove();
            typeElement.innerHTML = '';
            continentElement.innerHTML = '';
            panelBodyElement.innerHTML = `<a href="${planetEntry.FullAlertLink}" target="_blank">View all alerts for this server</a>`;
            remainingElement.classList.add('inactive');
            infoTableElement.classList.add('hide');
            handleElement.style.height = 'auto';
        }

        if (typeof planetEntry.Status === 'string') {
            const displayStatus = planetEntry.Status.charAt(0).toUpperCase() + planetEntry.Status.slice(1);
            const statusTarget = planetElementRef.querySelector('.remaining:not(.badge)');
            if (statusTarget) {
                statusTarget.textContent = displayStatus;
            }
            if (planetEntry.Status.includes('error')) {
                planetElementRef.classList.add('danger');
            }
        }
    };

    const generateTerritorySection = (planetEntry) => {
        const vanuPercentage = planetEntry.alert.TerritoryVS;
        const trPercentage = planetEntry.alert.TerritoryTR;
        const ncPercentage = planetEntry.alert.TerritoryNC;
        const remainingPercentage = 100 - ncPercentage - trPercentage;

        const targetPanelBody = document.querySelector(`#collapse${planetEntry.id} > .panel-body`);
        const progressHTML = `
            <div class="progress">
                <div class="progress-bar progress-bar-danger" style="width:${trPercentage}%">${Math.floor(trPercentage)}%</div>
                <div class="progress-bar progress-bar-info" style="width:${ncPercentage}%">${Math.floor(ncPercentage)}%</div>
                <div class="progress-bar progress-bar-purple" style="width:${remainingPercentage}%">${Math.floor(vanuPercentage)}%</div>
            </div>
        `;
        targetPanelBody.insertAdjacentHTML('beforeend', progressHTML);
        return [targetPanelBody, vanuPercentage, trPercentage, ncPercentage];
    };

    const assembleFacilityView = (planetEntry) => {
        const targetPanelBody = document.querySelector(`#collapse${planetEntry.id} > .panel-body`);
        const facilitiesContainer = document.createElement('div');
        facilitiesContainer.classList.add('facilities');
        targetPanelBody.appendChild(facilitiesContainer);

        let vanuCount = 0;
        let trCount = 0;
        let ncCount = 0;

        Object.entries(planetEntry.alert)
            .filter(([key, value]) => !['dataID', 'dataTimestamp', 'resultID', 'start', 'type', 'zone', 'notified'].includes(key) && value !== null)
            .forEach(([facilityName, status]) => {
                let statusClass = 'progress-bar-purple';
                switch (status) {
                    case '1':
                        vanuCount++;
                        break;
                    case '2':
                        ncCount++;
                        statusClass = 'progress-bar-info';
                        break;
                    case '3':
                        trCount++;
                        statusClass = 'progress-bar-danger';
                        break;
                    default:
                        break;
                }
                const facilityDiv = document.createElement('div');
                facilityDiv.classList.add('facility', statusClass);
                facilityDiv.setAttribute('data-tooltip', 'true');
                facilityDiv.setAttribute('title', `${facilityName} (${planetEntry.alert.type})`);
                facilitiesContainer.appendChild(facilityDiv);
            });

        return [targetPanelBody, vanuCount, trCount, ncCount];
    };

    const injectAlertSpecificContent = (contentType, planetEntry) => {
        const targetPanelBody = document.querySelector(`#collapse${planetEntry.id} > .panel-body`);
        targetPanelBody.innerHTML = '';

        let contentData;
        const contentGenerators = new Map([
            ['territory', generateTerritorySection],
            ['facility', assembleFacilityView],
        ]);

        const generator = contentGenerators.get(contentType);
        if (generator) {
            contentData = generator(planetEntry);
        } else {
            return;
        }

        const [containerElement, vanuVal, trVal, ncVal] = contentData;
        let leadingFactionMessage = 'Fair fight.';
        let leadingFactionId = 4;

        if (ncVal < vanuVal && trVal < vanuVal) {
            leadingFactionId = 0;
            leadingFactionMessage = 'Vanu is leading.';
        } else if (trVal < ncVal && ncVal > vanuVal) {
            leadingFactionId = 1;
            leadingFactionMessage = 'NC is leading.';
        } else if (trVal > vanuVal && ncVal < trVal) {
            leadingFactionId = 2;
            leadingFactionMessage = 'TR is leading.';
        }

        const messageClass = (applicationState.highlightPreference === leadingFactionId) ? 'text-success' : 'text-info';
        const messageHTML = `
            <div class="${messageClass}">
                ${leadingFactionMessage}<br>
                <a href="${planetEntry.FullAlertLink}" target="_blank">View this alert live on PS2Alerts</a>
            </div>
        `;
        containerElement.insertAdjacentHTML('beforeend', messageHTML);
    };

    const recalculateTimers = (singlePlanetEntry = null) => {
        if (!singlePlanetEntry) {
            Object.values(applicationState.planetData).forEach(planetEntry => recalculateTimers(planetEntry));
            return;
        }

        const currentTime = Date.now();

        if (singlePlanetEntry.Status === 1) {
            const timeDifference = +singlePlanetEntry.alert.start - currentTime;
            const timeRemainingObject = new Date(timeDifference);

            const hoursAdjustment = (singlePlanetEntry.alert.type === 'Territory' || singlePlanetEntry.alert.zone === 'Global') ? 2 : 1;
            timeRemainingObject.setUTCHours(timeRemainingObject.getUTCHours() + hoursAdjustment);

            const hoursVal = timeRemainingObject.getUTCHours();
            const minutesVal = String(timeRemainingObject.getUTCMinutes()).padStart(2, '0');
            const secondsVal = String(timeRemainingObject.getUTCSeconds()).padStart(2, '0');

            if (hoursVal < 2 && (hoursVal + parseInt(minutesVal) + parseInt(secondsVal)) > 0) {
                if (singlePlanetEntry.id === applicationState.primaryPlanetIdentifier) {
                    chrome.runtime.getBackgroundPage((backgroundProcess) => {
                        if (backgroundProcess && backgroundProcess.alert) {
                            backgroundProcess.alert.init(false, backgroundProcess.alert.updateBadge(singlePlanetEntry));
                        }
                    });
                }
                const remainingDisplayElement = document.querySelector(`.server-${singlePlanetEntry.id} .remaining`);
                if (remainingDisplayElement) {
                    remainingDisplayElement.textContent = `${hoursVal}h ${minutesVal}m ${secondsVal}s`;
                }
            } else {
                singlePlanetEntry.Status = 'INACTIVE';
                applicationState.planetData[`s${singlePlanetEntry.id}`] = singlePlanetEntry;
                persistSettings({ servers: applicationState.planetData });
                refreshPlanetDisplay(singlePlanetEntry);
            }
        }
    };

    const notifyPlanetDataChanged = (planetEntry) => {
        refreshPlanetDisplay(planetEntry);
    };

    const initiateDataRefresh = () => {
        const refreshButtonElement = document.getElementById('refresh');
        if (refreshButtonElement) {
            refreshButtonElement.disabled = true;
        }

        chrome.runtime.getBackgroundPage((backgroundProcess) => {
            if (backgroundProcess && backgroundProcess.alert) {
                backgroundProcess.alert.init(true, () => {
                    retrievePersistedSettings({ lastUpdate: 0, serverTimestamp: 0 }, (data) => {
                        if (refreshButtonElement) {
                            const clientTime = new Date(data.lastUpdate).toLocaleString();
                            const serverTime = new Date(data.serverTimestamp).toLocaleString();
                            refreshButtonElement.setAttribute('title', `Last updates<br>Client: ${clientTime}<br>Server: ${serverTime}`);
                        }
                    });
                    globalScope.setTimeout(() => {
                        if (refreshButtonElement) {
                            refreshButtonElement.disabled = false;
                        }
                    }, 120000);
                });
            }
        });
    };

    let draggedItem = null;

    const handleDragStart = (event) => {
        const targetRow = event.target.closest('.row');
        if (targetRow) {
            draggedItem = targetRow;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', draggedItem.id);
            draggedItem.classList.add('dragging');
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const targetElement = event.target.closest('.row');
        if (targetElement && targetElement !== draggedItem) {
            const container = targetElement.parentNode;
            const bounding = targetElement.getBoundingClientRect();
            const offset = bounding.y + (bounding.height / 2);
            if (event.clientY - offset > 0) {
                container.insertBefore(draggedItem, targetElement.nextSibling);
            } else {
                container.insertBefore(draggedItem, targetElement);
            }
        }
    };

    const handleDragEnd = () => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
        updateOrderPersistence();
    };

    const updateOrderPersistence = () => {
        const container = document.querySelector('.alert-container');
        if (!container) return;
        const childNodes = Array.from(container.children);
        const displayOrderSequence = childNodes.map(node => node.id);
        persistSettings({ sortOrder: displayOrderSequence });

        Array.from(document.querySelectorAll('video')).forEach(mediaPlayer => mediaPlayer.play());
    };

    const initializeApplication = () => {
        const defaultStorageValues = {
            servers: {},
            main: 13,
            lastUpdate: 0,
            order: [],
            flare: 0,
            hide2: 0,
            serverTimestamp: 0,
            sortOrder: null
        };

        retrievePersistedSettings(defaultStorageValues, () => {
            constructPlanetDisplay();

            applicationState.updateTimerHandle = globalScope.setTimeout(function updateLoop() {
                recalculateTimers();
                applicationState.updateTimerHandle = globalScope.setTimeout(updateLoop, 1000);
            }, 1000);

            if (applicationState.currentSortingMethod !== null && !applicationState.suppressSecondary) {
                const container = document.querySelector('.alert-container');
                if (container) {
                    const existingElements = new Map(Array.from(container.children).map(el => [el.id, el]));
                    container.innerHTML = '';

                    applicationState.currentSortingMethod.forEach(elementId => {
                        const element = existingElements.get(elementId);
                        if (element) {
                            container.appendChild(element);
                        }
                    });
                }
            }

            const alertContainer = document.querySelector('.alert-container');
            if (alertContainer) {
                alertContainer.addEventListener('dragstart', handleDragStart);
                alertContainer.addEventListener('dragover', handleDragOver);
                alertContainer.addEventListener('dragleave', (e) => e.preventDefault()); // Allow leaving
                alertContainer.addEventListener('drop', (e) => e.preventDefault()); // Allow drop
                alertContainer.addEventListener('dragend', handleDragEnd);
            }

            const refreshButton = document.getElementById('refresh');
            if (refreshButton) {
                refreshButton.addEventListener('click', (eventTrigger) => {
                    initiateDataRefresh();
                    eventTrigger.stopImmediatePropagation();
                });

                const clientTime = new Date(applicationState.clientLastUpdate).toLocaleString();
                const serverTime = new Date(applicationState.serverTimePoint).toLocaleString();
                refreshButton.setAttribute('title', `Last updates<br>Client: ${clientTime}<br>Server: ${serverTime}`);
                refreshButton.setAttribute('data-tooltip', 'true');
            }

            const mainServerPanel = document.querySelector(`.server-${applicationState.primaryPlanetIdentifier}`);
            if (mainServerPanel) {
                mainServerPanel.classList.add('panel-info');
                mainServerPanel.classList.remove('panel-default');
            }

            const optionsButton = document.getElementById('options');
            if (optionsButton) {
                optionsButton.addEventListener('click', () => {
                    chrome.tabs.create({ url: 'settings.html' });
                });
                optionsButton.setAttribute('title', `v${SoftwareVersion}`);
                optionsButton.parentNode.querySelectorAll('[data-tooltip]').forEach(el => {
                    // Placeholder for native tooltip initialization if needed
                });
            }

            globalScope.setTimeout(() => {
                Array.from(document.querySelectorAll('video')).forEach(mediaPlayer => mediaPlayer.play());
            }, 550);
        });
    };

    document.addEventListener('DOMContentLoaded', initializeApplication);

    globalScope.ApplicationInterface = {
        notifyPlanetDataChanged: notifyPlanetDataChanged,
        initiateDataRefresh: initiateDataRefresh,
        getAppState: () => ({ ...applicationState })
    };

})(window);