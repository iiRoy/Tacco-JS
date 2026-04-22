const centralSystem = (() => {
    const applicationState = {
        currentActiveTabIdentifier: null,
        currentExpandedPanelIdentifier: null,
        useRelativeTimeFormat: true,
        isAutoRefreshEnabled: true,
        contentCache: {}
    };

    const mediaQueryHelpers = {
        isMobileDevice: () => window.matchMedia('(max-width: 767px)').matches,
        isTabletDevice: () => window.matchMedia('(min-width: 768px) and (max-width: 979px)').matches,
        isDesktopDevice: () => window.matchMedia('(min-width: 979px)').matches
    };

    const networkService = {
        fetchDataFromEndpoint: async (urlPath, methodType = 'GET', bodyContent = null) => {
            const requestOptions = {
                method: methodType,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            if (bodyContent) {
                requestOptions.body = JSON.stringify(bodyContent);
            }
            const response = await fetch(urlPath, requestOptions);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        }
    };

    const dateTimeFormatter = {
        formatEventDateTime: (isoTimestamp) => {
            const eventDate = new Date(isoTimestamp);
            const now = new Date();

            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            const timeString = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (eventDate >= startOfToday && eventDate < startOfTomorrow) {
                return `Today at ${timeString}`;
            }
            if (eventDate >= startOfYesterday && eventDate < startOfToday) {
                return `Yesterday at ${timeString}`;
            }
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const diffDays = Math.floor((startOfToday - eventDate) / (1000 * 60 * 60 * 24));
            if (diffDays > 0 && diffDays < 7) {
                const dayName = daysOfWeek[eventDate.getDay()];
                if (eventDate.getDay() < now.getDay() || (eventDate.getDay() === now.getDay() && diffDays > 0)) {
                    return `${dayName} at ${timeString}`;
                } else {
                    return `Last ${dayName} at ${timeString}`;
                }
            }
            if (eventDate > startOfTomorrow && eventDate < new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                return `Next ${daysOfWeek[eventDate.getDay()]} at ${timeString}`;
            }

            return eventDate.toLocaleDateString();
        }
    };

    const uiRenderer = {
        generateEventListMarkup: (eventItems) => {
            const sortedEvents = [...eventItems].reverse();
            const eventEntryTemplate = (event) => `
                <li class="event-record">
                    <time class="record-time">${applicationState.useRelativeTimeFormat ? dateTimeFormatter.formatEventDateTime(event.datetime) : new Date(event.datetime).toLocaleString()}</time>
                    <span class="record-message">${event.message}</span>
                </li>
            `;
            return `<ul class="event-log">${sortedEvents.map(eventEntryTemplate).join('')}</ul>`;
        },

        buildDetailedContent: (dataEnvelope) => {
            const zoneStatusMap = {
                true: { css: 'status-critical', icon: 'icon-alert-triangle' },
                false: { css: 'status-normal', icon: 'icon-check-circle' }
            };
            const partitionStatusMap = {
                true: { css: 'status-normal', icon: 'icon-check-circle' },
                false: { css: 'status-critical', icon: 'icon-alert-triangle' }
            };

            const processSensorCollection = (collection, statusMap, panelPrefix) => {
                return Array.from({ length: 64 }, (_, i) => i + 1)
                    .map(index => collection[index + ''])
                    .filter(item => item && item.name)
                    .map(item => {
                        const statusInfo = statusMap[item.status.open !== undefined ? item.status.open : item.status.ready];
                        return {
                            ...item,
                            uniqueId: item.id,
                            displayClass: statusInfo.css,
                            displayIcon: statusInfo.icon,
                            pastEvents: uiRenderer.generateEventListMarkup(item.lastevents),
                            currentPanelState: applicationState.currentExpandedPanelIdentifier === `${panelPrefix}${item.id}` ? 'is-expanded' : ''
                        };
                    });
            };

            const processedZones = processSensorCollection(dataEnvelope.zone, zoneStatusMap, 'zonePanel');
            const processedPartitions = processSensorCollection(dataEnvelope.partition, partitionStatusMap, 'partitionPanel');

            const zoneAllPanelState = applicationState.currentExpandedPanelIdentifier === 'zonePanelAll' ? 'is-expanded' : '';
            const partitionAllPanelState = applicationState.currentExpandedPanelIdentifier === 'partitionPanelAll' ? 'is-expanded' : '';

            return `
                <section class="info-group">
                    <div class="collapsible-container">
                        <h3 class="container-title">Security Zones</h3>
                        <div id="zonePanelAll" class="collapsible-item ${zoneAllPanelState}">
                            <div class="item-header" data-panel-id="zonePanelAll">All Zone Events</div>
                            <div class="item-content">${uiRenderer.generateEventListMarkup(dataEnvelope.zone.lastevents)}</div>
                        </div>
                        ${processedZones.map(zone => `
                            <div id="zonePanel${zone.uniqueId}" class="collapsible-item ${zone.currentPanelState}">
                                <div class="item-header" data-panel-id="zonePanel${zone.uniqueId}">${zone.name} <span class="badge-status ${zone.displayClass}">${zone.displayIcon}</span></div>
                                <div class="item-content">${zone.pastEvents}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="collapsible-container">
                        <h3 class="container-title">System Partitions</h3>
                        <div id="partitionPanelAll" class="collapsible-item ${partitionAllPanelState}">
                            <div class="item-header" data-panel-id="partitionPanelAll">All Partition Events</div>
                            <div class="item-content">${uiRenderer.generateEventListMarkup(dataEnvelope.partition.lastevents)}</div>
                        </div>
                        ${processedPartitions.map(partition => `
                            <div id="partitionPanel${partition.uniqueId}" class="collapsible-item ${partition.currentPanelState}">
                                <div class="item-header" data-panel-id="partitionPanel${partition.uniqueId}">${partition.name} <span class="badge-status ${partition.displayClass}">${partition.displayIcon}</span></div>
                                <div class="item-content">${partition.pastEvents}</div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        },

        composeActionButtons: (dataEnvelope) => {
            const primaryPartitionStatus = dataEnvelope.partition["1"].status;
            return `
                <div class="control-actions">
                    <button id="armCommand" class="action-button ${!primaryPartitionStatus.armed && !primaryPartitionStatus.exit_delay ? '' : 'hidden'}">Engage Arm</button>
                    <button id="disarmCommand" class="action-button ${primaryPartitionStatus.armed ? '' : 'hidden'}">Disengage Arm</button>
                    <button id="cancelCommand" class="action-button ${primaryPartitionStatus.exit_delay ? '' : 'hidden'}">Abort Exit Delay</button>
                    <button id="pgmCommand" class="action-button ${primaryPartitionStatus.pgm_output ? '' : 'hidden'}">Activate PGM</button>
                </div>
            `;
        },

        renderStatusNotifications: (dataEnvelope) => {
            const primaryPartitionStatus = dataEnvelope.partition["1"].status;
            const notificationElements = [];

            const addNotification = (condition, text, type) => {
                if (condition) {
                    notificationElements.push(`<span class="notification-label label-${type}">${text}</span>`);
                }
            };

            addNotification(primaryPartitionStatus.entry_delay, 'Entry Sequence Active', 'info');
            addNotification(primaryPartitionStatus.exit_delay, 'Exit Sequence Active', 'info');
            addNotification(primaryPartitionStatus.alarm, 'System Alarm Triggered', 'critical');
            addNotification(primaryPartitionStatus.trouble, 'System Trouble Detected', 'warning');
            addNotification(primaryPartitionStatus.tamper, 'Tamper Event Occurred', 'warning');
            addNotification(primaryPartitionStatus.pgm_output, 'PGM Output in Progress', 'info');

            return notificationElements.join('');
        },

        updateTargetElement: (targetSelector, newContentHTML, forceRefresh = false) => {
            const existingContent = applicationState.contentCache[targetSelector];
            if (existingContent !== newContentHTML || forceRefresh) {
                const targetElement = document.querySelector(targetSelector);
                if (targetElement) {
                    targetElement.innerHTML = newContentHTML;
                    targetElement.classList.add('is-visible');
                }
                applicationState.contentCache[targetSelector] = newContentHTML;
                return true;
            }
            return false;
        }
    };

    const userInteraction = {
        requestUserInput: (queryPrompt, completionCallback) => {
            const inputResult = prompt(queryPrompt);
            completionCallback(inputResult !== null, inputResult);
        },
        displaySuccessMessage: (msg) => console.info(`Success: ${msg}`),
        displayErrorMessage: (msg) => console.error(`Error: ${msg}`)
    };

    const applicationCore = {
        executeSystemCommand: async (commandURI) => {
            console.log(`Sending command: ${commandURI}`);
            try {
                const commandResponse = await networkService.fetchDataFromEndpoint(commandURI);
                console.log(`Command result: ${commandResponse.response}`);
                userInteraction.displaySuccessMessage(commandResponse.response);
            } catch (err) {
                userInteraction.displayErrorMessage(`Command failed: ${err.message}`);
            }
        },

        triggerDisarmSequence: () => {
            userInteraction.requestUserInput("Please enter your security code to disarm:", (isConfirmed, codeValue) => {
                if (isConfirmed && codeValue) {
                    applicationCore.executeSystemCommand(`/api/alarm/disarm?alarmcode=${codeValue}`);
                }
            });
        },

        initiatePgmOperation: () => {
            userInteraction.requestUserInput("Enter PGM number to activate:", (pgmConfirmed, pgmNumber) => {
                if (pgmConfirmed && pgmNumber) {
                    userInteraction.requestUserInput("Enter your security code for PGM activation:", (codeConfirmed, securityCode) => {
                        if (codeConfirmed && securityCode) {
                            applicationCore.executeSystemCommand(`/api/pgm?pgmnum=${pgmNumber}&alarmcode=${securityCode}`);
                        }
                    });
                }
            });
        },

        engageArmingWithCode: () => {
            userInteraction.requestUserInput("Provide your security code to arm the system:", (isConfirmed, codeValue) => {
                if (isConfirmed && codeValue) {
                    console.log(`Attempting to arm with code: ${codeValue}`);
                    applicationCore.executeSystemCommand(`/api/alarm/armwithcode?alarmcode=${codeValue}`);
                } else {
                    userInteraction.displayErrorMessage("Arming process cancelled or no code supplied.");
                }
            });
        },

        refreshInterfaceData: async (forceUpdateAll = false) => {
            try {
                const systemStatusData = await networkService.fetchDataFromEndpoint("/api");

                let mainContentHTML;
                if (mediaQueryHelpers.isMobileDevice()) {
                    mainContentHTML = uiRenderer.buildDetailedContent(systemStatusData);
                } else {
                    mainContentHTML = uiRenderer.buildDetailedContent(systemStatusData);
                }

                const contentWasModified = uiRenderer.updateTargetElement('#main-display-area', mainContentHTML, forceUpdateAll);

                if (contentWasModified && applicationState.currentActiveTabIdentifier) {
                    const previouslyActiveTab = document.querySelector(`.navigation-tabs .tab-link[data-target-id="${applicationState.currentActiveTabIdentifier}"]`);
                    if (previouslyActiveTab) {
                        previouslyActiveTab.click();
                    }
                }

                uiRenderer.updateTargetElement('#action-controls-area', uiRenderer.composeActionButtons(systemStatusData), forceUpdateAll);
                uiRenderer.updateTargetElement('#status-notification-bar', uiRenderer.renderStatusNotifications(systemStatusData), forceUpdateAll);

                applicationCore.setupDynamicListeners();

                const autoRefreshToggle = document.querySelector('#auto-refresh-switch');
                if (autoRefreshToggle) {
                    if (applicationState.isAutoRefreshEnabled) autoRefreshToggle.classList.add('is-active');
                    else autoRefreshToggle.classList.remove('is-active');
                }

                const timeFormatToggle = document.querySelector('#time-display-switch');
                if (timeFormatToggle) {
                    if (applicationState.useRelativeTimeFormat) timeFormatToggle.classList.add('is-active');
                    else timeFormatToggle.classList.remove('is-active');
                }

            } catch (err) {
                userInteraction.displayErrorMessage(`Failed to refresh display data: ${err.message}`);
            }
        },

        setupDynamicListeners: () => {
            document.querySelectorAll('.navigation-tabs .tab-link').forEach(link => {
                link.removeEventListener('click', applicationCore.handleTabNavigation);
                link.addEventListener('click', applicationCore.handleTabNavigation);
            });

            document.querySelectorAll('.collapsible-item .item-header').forEach(header => {
                header.removeEventListener('click', applicationCore.handlePanelExpansion);
                header.addEventListener('click', applicationCore.handlePanelExpansion);
            });

            document.getElementById('disarmCommand')?.removeEventListener('click', applicationCore.triggerDisarmSequence);
            document.getElementById('disarmCommand')?.addEventListener('click', applicationCore.triggerDisarmSequence);

            document.getElementById('pgmCommand')?.removeEventListener('click', applicationCore.initiatePgmOperation);
            document.getElementById('pgmCommand')?.addEventListener('click', applicationCore.initiatePgmOperation);

            document.getElementById('armCommand')?.removeEventListener('click', applicationCore.engageArmingWithCode);
            document.getElementById('armCommand')?.addEventListener('click', applicationCore.engageArmingWithCode);
        },

        handleTabNavigation: (event) => {
            event.preventDefault();
            const targetContentId = event.currentTarget.dataset.targetId;
            applicationState.currentActiveTabIdentifier = targetContentId;

            document.querySelectorAll('.navigation-tabs .tab-link').forEach(link => link.classList.remove('is-active'));
            document.querySelectorAll('.tab-content-section').forEach(content => content.classList.remove('is-active'));

            event.currentTarget.classList.add('is-active');
            document.querySelector(targetContentId)?.classList.add('is-active');
        },

        handlePanelExpansion: (event) => {
            const panelHeader = event.currentTarget;
            const parentPanel = panelHeader.closest('.collapsible-item');
            if (!parentPanel) return;

            const panelIdentity = panelHeader.dataset.panelId;
            const isCurrentlyExpanded = parentPanel.classList.contains('is-expanded');

            if (applicationState.currentExpandedPanelIdentifier && applicationState.currentExpandedPanelIdentifier !== panelIdentity) {
                document.getElementById(applicationState.currentExpandedPanelIdentifier)?.classList.remove('is-expanded');
            }

            if (isCurrentlyExpanded) {
                parentPanel.classList.remove('is-expanded');
                applicationState.currentExpandedPanelIdentifier = null;
            } else {
                parentPanel.classList.add('is-expanded');
                applicationState.currentExpandedPanelIdentifier = panelIdentity;
            }
        },

        initializeApplication: async () => {
            try {
                const initialConfig = await networkService.fetchDataFromEndpoint("/api/config/eventtimeago");
                applicationState.useRelativeTimeFormat = initialConfig.eventtimeago.toLowerCase() === "true";
            } catch (err) {
                console.warn("Initial time format configuration failed to load, defaulting to relative time.", err);
            }

            await applicationCore.refreshInterfaceData(true);

            setInterval(() => {
                if (applicationState.isAutoRefreshEnabled) {
                    applicationCore.refreshInterfaceData(false);
                }
            }, 5000);
        }
    };

    return {
        startSystem: applicationCore.initializeApplication
    };
})();

document.addEventListener('DOMContentLoaded', centralSystem.startSystem);