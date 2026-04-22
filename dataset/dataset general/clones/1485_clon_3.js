(function(globalScope) {
    'use strict';

    // Current version of the dashboard interface
    const DASH_UI_VERSION = '1.0.beta';

    /**
     * @class DashboardManager
     * @description Manages the display and updates of alert information for monitored game servers.
     */
    var DashboardManager = function() {
        // Retrieve persistent configuration and state from browser storage
        chrome.storage.local.get({
            monitoredServers: {}, // All tracked servers
            primaryMonitorId: 13, // Default primary server ID
            lastClientSync: 0,    // Timestamp of last client-side data fetch
            displayOrder: [],     // Custom display order of server panels
            factionHighlightId: 0, // Faction ID to highlight (e.g., 0 for VS, 1 for NC, 2 for TR)
            hideInactiveMonitors: 0, // Flag to hide servers not currently active
            serverDataTimestamp: 0, // Timestamp of last data update from external server
            customSortPreference: null // User's preferred sort order
        }, (storedConfig) => {
            // Apply retrieved settings to instance properties
            this.activeMonitorTargets = storedConfig.monitoredServers || {};
            this.primaryMonitorId = storedConfig.primaryMonitorId || 13;
            this.factionHighlightId = storedConfig.factionHighlightId || 0;
            this.hideInactiveMonitors = storedConfig.hideInactiveMonitors || 0;

            // Initialize the visual layout of server panels
            this.renderInitialMonitorPanels();

            // Set up a recurring timer to update countdowns and visual states
            this.displayUpdateInterval = globalScope.setInterval(this.updateMonitorTimers.bind(this), 1000);

            // --- Type III: Structural changes for sort order handling ---
            // If a custom display order exists and inactive monitors are not suppressed
            if (storedConfig.customSortPreference !== null && storedConfig.customSortPreference.length > 0 && !this.hideInactiveMonitors) {
                const $detachedPanelContainer = $('.alert-display-area').detach(); // Detach the entire container
                let reorderedPanels = [];

                // Re-find and collect elements in the preferred order
                for (let i = 0; i < storedConfig.customSortPreference.length; i++) {
                    const panelId = storedConfig.customSortPreference[i];
                    const $foundPanel = $detachedPanelContainer.find(`#server-panel-${panelId}`);
                    if ($foundPanel.length) {
                        reorderedPanels.push($foundPanel);
                    }
                }
                // Prepend a new container and then add the reordered panels
                $('body').prepend('<section class="alert-display-area container-fluid"></section>')
                         .find('.alert-display-area')
                         .append(reorderedPanels);
            }

            // Initialize jQuery UI Sortable for drag-and-drop reordering
            $('.alert-display-area').sortable({
                handle: '.drag-handle-grip', // Element to drag
                items: '.monitor-row'        // Draggable items
            }).on('sortupdate', () => {
                const currentOrder = [];
                // Get the updated order of server panel IDs
                Array.from(document.getElementsByClassName('alert-display-area')[0].children).forEach(childElement => {
                    if (childElement.id && childElement.id.startsWith('server-panel-')) {
                        currentOrder.push(childElement.id.replace('server-panel-', ''));
                    }
                });
                // Persist the new order to storage
                chrome.storage.local.set({ customSortPreference: currentOrder });

                // --- Type III: Add new fragment (validation/logging) ---
                console.log(`Monitor panel order updated: ${currentOrder.join(', ')}`);

                // Ensure any videos playing are restarted after DOM manipulation
                Array.from($('video')).forEach(mediaElement => {
                    if (mediaElement.paused) {
                        mediaElement.play();
                    }
                });
            });

            // Set up click handler for the refresh button
            $('#force-refresh-data').on('click', (evt) => {
                this.triggerDataReload();
                evt.stopPropagation(); // Prevent event bubbling
            }).attr({
                // --- Type II: Rewriting string, Type III: Template literal ---
                title: `Last Client Sync: ${new Date(storedConfig.lastClientSync).toLocaleString()}<br>Last Server Data: ${new Date(storedConfig.serverDataTimestamp).toLocaleString()}`,
                'data-tooltip': true // Enable tooltip
            }).tooltip();

            // Highlight the primary monitor panel
            $(`.status-panel-server-${this.primaryMonitorId}`).addClass('panel-primary-active').removeClass('panel-default-inactive');
        }.bind(this)); // Bind 'this' to the DashboardManager instance

        // Set up click handler for the options button
        $('#settings-gear').on('click', () => {
            chrome.tabs.create({ url: 'settings.html' }); // Open settings page
        }).attr('title', `Dashboard v${DASH_UI_VERSION}`).parent().find('[data-tooltip]').tooltip();

        // --- Type III: Added a small delay to ensure videos play after initial render ---
        globalScope.setTimeout(() => {
            Array.from($('video')).forEach(mediaElement => mediaElement.play());
        }, 600); // Slightly increased delay for robustness
    };

    /**
     * Prototype methods for DashboardManager
     */
    DashboardManager.prototype = {
        activeMonitorTargets: {}, // Stores server data objects
        displayUpdateInterval: null, // Handle for the setInterval timer
        constructor: DashboardManager, // Explicit constructor reference

        /**
         * @method renderInitialMonitorPanels
         * @description Iterates through monitored servers and adds their HTML panels to the display.
         */
        renderInitialMonitorPanels: function() {
            Object.values(this.activeMonitorTargets).forEach(serverInfo => {
                // --- Type III: Guard clause for conditional rendering ---
                if (this.hideInactiveMonitors && serverInfo.id !== this.primaryMonitorId) {
                    return; // Skip rendering if inactive and hidden
                }

                let panelActiveClass = ''; // Class for active collapse state
                if (serverInfo.id === this.primaryMonitorId) {
                    panelActiveClass = ' in'; // 'in' makes the collapse section expanded
                }

                // Append the main panel structure to the alert display area
                $('.alert-display-area').append(`
                    <div class="monitor-row" id="server-panel-${serverInfo.id}">
                        <div class="col-xs-1">
                            <button type="button" class="btn btn-secondary btn-lg drag-handle-grip">
                                <span class="glyphicon glyphicon-align-justify"></span>
                            </button>
                        </div>
                        <div class="col-xs-11">
                            <div class="panel status-panel status-panel-server-${serverInfo.id} panel-default-inactive">
                                <div class="panel-heading">
                                    <h4 class="panel-title">
                                        <a data-toggle="collapse" href="#details-collapse-${serverInfo.id}">
                                            <span class="monitor-label-name">${serverInfo.name}</span>
                                        </a>
                                        <span class="pull-right badge status-countdown-badge"></span>
                                    </h4>
                                    <table class="table overview-summary text-center hidden-element">
                                        <tbody>
                                            <tr>
                                                <td class="alert-type-cell"></td>
                                                <td class="alert-zone-cell"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div id="details-collapse-${serverInfo.id}" class="panel-collapse collapse${panelActiveClass}">
                                    <div class="panel-body-content text-center"></div>
                                    <table class="table detail-status-table">
                                        <tbody>
                                            <tr>
                                                <td class="status-countdown-cell"></td>
                                                <td class="alert-type-cell"></td>
                                                <td class="alert-zone-cell"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                // After adding the HTML, update the dynamic content of the panel
                this.updateMonitorPanelDisplay(serverInfo);
            });
        },

        /**
         * @method updateMonitorPanelDisplay
         * @param {object} serverData - The data object for a specific server monitor.
         * @description Updates the visual representation of a single server's alert panel.
         */
        updateMonitorPanelDisplay: function(serverData) {
            const $panelElement = $(`.status-panel-server-${serverData.id}`);

            // --- Type III: Add validation/null check ---
            if (!serverData || !serverData.alert) {
                console.warn(`Attempted to update panel for server ${serverData ? serverData.id : 'unknown'} with missing alert data.`);
                $panelElement.find('.panel-body-content').html('<p class="text-danger">No alert data available.</p>');
                return;
            }

            if (serverData.Status === 1) { // Alert is active
                $panelElement.addClass('alert-active').removeClass('alert-inactive error-status');
                $panelElement.find('.overview-summary').removeClass('hidden-element');
                $panelElement.find('.drag-handle-grip').css('min-height', '51px'); // Adjust handle height

                const $nameContainer = $panelElement.find('.monitor-label-name');
                // Add animated icon if not already present
                if ($nameContainer.find('video').length === 0) {
                    $nameContainer.prepend('<video width="30" height="30" autoplay loop><source src="assets/alert_animation.mp4" type="video/mp4"></video>');
                    $nameContainer.find('video')[0].play(); // Ensure playback starts
                }

                // Update alert type and add tooltip
                $panelElement.find('.alert-type-cell').html(serverData.alert.type).attr({
                    //title: `XP Bonus: ${serverData.alert.experience_bonus}%`, // Example: commented out if bonus not always present
                    'data-tooltip': true
                }).tooltip({ container: 'body' });

                // Process alert details based on type
                this.processAlertContent(serverData.alert.type, serverData);

                $panelElement.find('.alert-zone-cell').text(serverData.alert.zone);
                $panelElement.find('.status-countdown-badge').removeClass('inactive-status');

                this.updateMonitorTimers(serverData); // Update timer for this specific server
            } else { // Alert is inactive or has an error status
                $panelElement.removeClass('alert-active');
                $panelElement.find('video').remove(); // Remove animated icon
                $panelElement.find('.alert-type-cell').empty();
                $panelElement.find('.alert-zone-cell').empty();
                // Provide a link to view all alerts for this server
                $panelElement.find('.panel-body-content').html(`<a href="${serverData.FullAlertLink}" target="_blank">View all live alerts for this server</a>`);
                $panelElement.find('.status-countdown-badge').addClass('inactive-status');
                $panelElement.find('.overview-summary').addClass('hidden-element');
                $panelElement.find('.drag-handle-grip').css('min-height', 'auto'); // Reset handle height
            }

            // Handle special string-based statuses (e.g., 'error', 'maintenance')
            if (typeof serverData.Status === 'string') {
                $panelElement.find('.status-countdown-badge:not(".badge")').html(serverData.Status.charAt(0).toUpperCase() + serverData.Status.slice(1));
                if (serverData.Status.toLowerCase().includes('error')) {
                    $panelElement.addClass('error-status');
                }
            }
        },

        /**
         * @method generateTerritoryProgress
         * @param {object} alertSourceData - Server data containing territory alert details.
         * @returns {Array} An array containing the appended jQuery element and faction percentages.
         * @description Generates and appends a territory control progress bar.
         */
        _generateTerritoryProgress: function(alertSourceData) {
            const vsShare = alertSourceData.alert.TerritoryVS;
            const trShare = alertSourceData.alert.TerritoryTR;
            const ncShare = alertSourceData.alert.TerritoryNC;
            const remainingShare = 100 - ncShare - trShare; // Assuming remaining is VS for a simpler calculation

            // Append the progress bar HTML
            const $progressContainer = $(`#details-collapse-${alertSourceData.id} > .panel-body-content`).append(`
                <div class="progress-bar-stack">
                    <div class="progress-segment progress-segment-tr" style="width:${trShare}%">${Math.floor(trShare)}%</div>
                    <div class="progress-segment progress-segment-nc" style="width:${ncShare}%">${Math.floor(ncShare)}%</div>
                    <div class="progress-segment progress-segment-vs" style="width:${vsShare}%">${Math.floor(vsShare)}%</div>
                </div>
            `);

            return [$progressContainer, vsShare, trShare, ncShare];
        },

        /**
         * @method processAlertContent
         * @param {string} category - The type of alert ('Territory', 'Bio', 'Tech', 'Amp').
         * @param {object} alertSource - The server data object for the alert.
         * @description Dispatches to specific content generation functions based on alert category.
         */
        processAlertContent: function(category, alertSource) {
            let alertDisplayResult;
            $(`#details-collapse-${alertSource.id} > .panel-body-content`).empty(); // Clear previous content

            switch (category) {
                case 'Territory':
                    alertDisplayResult = this._generateTerritoryProgress(alertSource);
                    break;
                case 'Bio':
                case 'Tech':
                case 'Amp':
                    alertDisplayResult = this._generateFacilityBreakdown(alertSource);
                    break;
                default:
                    console.warn(`Unknown alert category: ${category}`);
                    return; // Exit if category is not recognized
            }

            const $outputArea = alertDisplayResult[0];
            let statusMessage = 'Neutral conflict.';
            let leadingFactionIndex = 4; // Default for no clear leader
            let messageStyleClass = 'text-status-neutral';

            // Extract faction shares/counts from the result array
            const vsValue = alertDisplayResult[1];
            const trValue = alertDisplayResult[2];
            const ncValue = alertDisplayResult[3];

            // Determine leading faction
            if (ncValue < vsValue && trValue < vsValue) {
                leadingFactionIndex = 0; // VS leading
                statusMessage = 'Vanu Sovereignty is currently in the lead.';
            } else if (trValue < ncValue && vsValue < ncValue) {
                leadingFactionIndex = 1; // NC leading
                statusMessage = 'New Conglomerate holds the advantage.';
            } else if (vsValue < trValue && ncValue < trValue) {
                leadingFactionIndex = 2; // TR leading
                statusMessage = 'Terran Republic is dominating.';
            }

            // Apply highlight class if leading faction matches user preference
            if (this.factionHighlightId === leadingFactionIndex) {
                messageStyleClass = 'text-status-highlight';
            }

            // Append the status message and a link to external alert details
            $outputArea.append(`
                <div class="${messageStyleClass}">${statusMessage}<br>
                    <a href="${alertSource.FullAlertLink}" target="_blank">View this alert live on PS2Alerts</a>
                </div>
            `);
        },

        /**
         * @method _generateFacilityBreakdown
         * @param {object} alertSourceData - Server data containing facility alert details.
         * @returns {Array} An array containing the appended jQuery element and faction facility counts.
         * @description Generates and appends a visual breakdown of facility ownership.
         */
        _generateFacilityBreakdown: function(alertSourceData) {
            const $bodyContent = $(`#details-collapse-${alertSourceData.id} > .panel-body-content`);
            const $facilityDisplay = $bodyContent.append('<div class="facility-grid-container"></div>').find('.facility-grid-container');

            let vsFacilityCount = 0;
            let trFacilityCount = 0;
            let ncFacilityCount = 0;

            // Define keys to ignore from the alert object
            const ignoreKeys = ['dataID', 'dataTimestamp', 'resultID', 'start', 'type', 'zone', 'notified', 'experience_bonus']; // Type III: Added exp_bonus to ignore

            // Iterate through alert properties to find facility statuses
            Object.entries(alertSourceData.alert).forEach(([facilityKey, facilityStatus]) => {
                if (ignoreKeys.includes(facilityKey) || facilityStatus === null) {
                    return; // Skip ignored keys or null statuses
                }

                let ownerClass = 'facility-owner-vs'; // Default to VS
                switch (facilityStatus) {
                    case '1': // Vanu Sovereignty
                        vsFacilityCount++;
                        break;
                    case '2': // New Conglomerate
                        ncFacilityCount++;
                        ownerClass = 'facility-owner-nc';
                        break;
                    case '3': // Terran Republic
                        trFacilityCount++;
                        ownerClass = 'facility-owner-tr';
                        break;
                    default:
                        // Type III: Add a log for unexpected status
                        console.warn(`Unexpected facility status for ${facilityKey}: ${facilityStatus}`);
                        ownerClass = 'facility-owner-unknown';
                        break;
                }
                // Append a small div for each facility, with tooltip
                $facilityDisplay.append(`
                    <div class="individual-facility-block ${ownerClass}" data-info-tooltip="true" title="${facilityKey} (${alertSourceData.alert.type})"></div>
                `);
            });
            $facilityDisplay.find('[data-info-tooltip]').tooltip(); // Initialize tooltips

            return [$facilityDisplay, vsFacilityCount, trFacilityCount, ncFacilityCount];
        },

        /**
         * @method updateMonitorTimers
         * @param {object} [targetServer] - Optional server data object to update. If not provided, all are updated.
         * @description Updates the countdown timers for active alerts.
         */
        updateMonitorTimers: function(targetServer) {
            // If no specific server is provided, iterate and update all
            if (!targetServer) {
                Object.values(this.activeMonitorTargets).forEach(srv => this.updateMonitorTimers(srv));
                return;
            }

            const currentMoment = Date.now();

            // Only update if the alert is currently active
            if (targetServer.Status === 1) {
                const timeRemainingMs = +targetServer.alert.start - currentMoment;
                const countdownDateTime = new Date(timeRemainingMs);

                // Adjust hours based on alert type/zone for correct display
                // --- Type III: Simplified logic, removed redundant checks for global zone if territory implies it ---
                if (targetServer.alert.type === 'Territory' || targetServer.alert.zone === 'Global') {
                    countdownDateTime.setUTCHours(countdownDateTime.getUTCHours() + 2);
                } else {
                    countdownDateTime.setUTCHours(countdownDateTime.getUTCHours() + 1);
                }

                const hours = countdownDateTime.getUTCHours();
                const minutes = ('0' + countdownDateTime.getUTCMinutes()).slice(-2);
                const seconds = ('0' + countdownDateTime.getUTCSeconds()).slice(-2);

                // If there's still time remaining (less than 2 hours, and total time > 0)
                if (hours < 2 && (hours + parseInt(minutes, 10) + parseInt(seconds, 10)) > 0) {
                    // If this is the primary monitor, update the browser extension badge
                    if (targetServer.id === this.primaryMonitorId) {
                        chrome.runtime.getBackgroundPage(function(backgroundPage) {
                            if (backgroundPage && backgroundPage.alertSystem) { // Type III: Added existence check
                                backgroundPage.alertSystem.updateBrowserBadge(false, backgroundPage.alertSystem.getBadgeContent(targetServer));
                            }
                        });
                    }
                    // Update the displayed countdown text
                    $(`.status-panel-server-${targetServer.id} .status-countdown-badge`).html(`${hours}h ${minutes}m ${seconds}s`);
                } else {
                    // If time has run out, mark as inactive and refresh the panel
                    targetServer.Status = 'INACTIVE_COMPLETED'; // Type III: More descriptive status
                    this.updateMonitorPanelDisplay(targetServer);
                    // --- Type III: Removed commented out badge decrement logic ---
                }
            }
        },

        /**
         * @method handleServerDataUpdate
         * @param {object} serverData - The updated data object for a server.
         * @description Callback for when server data is updated from the background script.
         */
        handleServerDataUpdate: function(serverData) {
            this.updateMonitorPanelDisplay(serverData);
        },

        /**
         * @method triggerDataReload
         * @description Initiates a full data refresh from the background script.
         */
        triggerDataReload: function() {
            const $refreshButton = $('#force-refresh-data');
            $refreshButton.prop('disabled', true); // Disable button to prevent spamming

            chrome.runtime.getBackgroundPage((backgroundPage) => {
                if (backgroundPage && backgroundPage.alertSystem) { // Type III: Added existence check
                    backgroundPage.alertSystem.initiateDataFetch(true, (latestSyncData) => {
                        // After refresh, update the tooltip with new timestamps
                        chrome.storage.local.get({ lastClientSync: 0, serverDataTimestamp: 0 }, (syncTimestamps) => {
                            $refreshButton.attr('title', `Last Client Sync: ${new Date(syncTimestamps.lastClientSync).toLocaleString()}<br>Last Server Data: ${new Date(syncTimestamps.serverDataTimestamp).toLocaleString()}`);
                        });
                        // Re-enable button after a cool-down period
                        globalScope.setTimeout(() => {
                            $refreshButton.prop('disabled', false);
                        }, 120000); // 2-minute cooldown
                    });
                } else {
                    console.error("Background page or alertSystem not available for refresh.");
                    $refreshButton.prop('disabled', false); // Re-enable if error
                }
            });
        }
    };

    // --- Type III: Changed global variable name and how it's assigned ---
    globalScope.AlertDashboardInstance = null; // Initialize to null

    // When the DOM is fully loaded, instantiate the DashboardManager
    $(document).ready(function() {
        globalScope.AlertDashboardInstance = new DashboardManager();
    });

})(window);