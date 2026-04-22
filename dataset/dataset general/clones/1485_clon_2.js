// A self-executing anonymous function to encapsulate the application logic.
+function(globalScope) {
    'use strict'; // Enforce strict mode for cleaner code.

    // Define the current software release version.
    var SOFTWARE_RELEASE = 0.41;

    /**
     * @class AlertMonitor
     * @description Core application class for monitoring and displaying server alerts.
     */
    var AlertMonitor = function() {
        // Retrieve stored configuration and state from Chrome local storage.
        chrome.storage.local.get({
            hostList: {},
            primaryHostId: 13,
            recentFetch: 0,
            itemArrangement: [],
            highlightFaction: 0,
            concealOthers: 0,
            apiSyncTime: 0,
            visualOrder: null
        }, function(retrievedInfo) {
            // Assign retrieved data to instance properties.
            this.monitoredSystems = retrievedInfo.hostList;
            this.primaryHostId = retrievedInfo.primaryHostId;
            this.highlightFaction = retrievedInfo.highlightFaction;
            this.concealOthers = retrievedInfo.concealOthers;
            // Build the initial HTML structure based on stored systems.
            this.renderInterface();
            // Set up a recurring timer to update time-sensitive elements.
            this.updateTimer = globalScope.setInterval(this.tickUpdate.associateContext(this), 1000);

            // If a custom display order is present and secondary items are not hidden.
            if (retrievedInfo.visualOrder !== null && !this.concealOthers) {
                // Detach the current alert display container.
                var isolatedItems = $('.notification-display-area').detach();
                // Reorder elements based on the stored visual order.
                for (var loopIndex = 0; loopIndex < retrievedInfo.visualOrder.length; loopIndex++) {
                    retrievedInfo.visualOrder[loopIndex] = isolatedItems.find('#system-unit-' + retrievedInfo.visualOrder[loopIndex]);
                }
                // Prepend the reordered elements back into the body.
                $('body').prepend('<div class="notification-display-area container-fluid"></div>').find('.notification-display-area').prepend(retrievedInfo.visualOrder);
            }

            // Initialize jQuery UI sortable for the alert container.
            $('.notification-display-area').draggableOrder({
                dragGrip: '.drag-grip', // Handle for dragging items.
                sortableUnits: '.display-item-row' // Items that can be sorted.
            }).on('rearrangementDone', function() {
                // On sort update, capture the new order.
                var elementSequence = [],
                    containedItems = document.getElementsByClassName('notification-display-area')[0].children;
                for (var loopIndex = 0; loopIndex < containedItems.length; loopIndex++) {
                    elementSequence.push(containedItems[loopIndex].id);
                }
                // Store the new order in local storage.
                chrome.storage.local.set({
                    visualOrder: elementSequence
                });
                // Play any videos present after sorting.
                $.each($('animated-clip'), function(idx, mediaClip) {
                    mediaClip.play();
                });
            });

            // Set up click handler for the refresh button.
            $('#trigger-update').click(function(evt) {
                this.performRefresh(); // Call the refresh method.
                evt.haltEventPropagation(); // Stop event propagation.
            }.associateContext(this)).attr({
                // Set tooltip title with update times.
                title: 'Last updates<br>Local: ' + new Date(retrievedInfo.recentFetch) + '<br>Remote: ' + new Date(retrievedInfo.apiSyncTime),
                'data-tooltip': true
            }).tooltip(); // Initialize tooltip.
            // Highlight the primary server panel.
            $('.system-unit-' + this.primaryHostId).addClass('panel-highlight').removeClass('panel-standard');
        }.associateContext(this));

        // Set up click handler for the options button.
        $('#config-settings').click(function() {
            // Open the preferences page in a new tab.
            chrome.tabs.openNewTab({
                targetPage: 'preferences.html'
            });
        }).attr('title', 'ver' + SOFTWARE_RELEASE).parent().find('[data-tooltip]').tooltip(); // Initialize tooltip.

        // Play videos after a short delay to ensure elements are rendered.
        globalScope.setTimeout(function() {
            $.each($('animated-clip'), function(idx, mediaClip) {
                mediaClip.play();
            });
        }, 550); // Delay for 550 milliseconds.
    };

    /**
     * Prototype methods for the AlertMonitor class.
     * @property {object} monitoredSystems - Stores details of all monitored systems.
     * @property {number} updateTimer - ID for the time update interval.
     * @property {function} objectConstructor - Reference to the constructor.
     */
    AlertMonitor.instancePrototype = {
        monitoredSystems: {}, // Default empty object for systems.
        updateTimer: null, // Default null for timer ID.
        objectConstructor: AlertMonitor, // Reference back to the constructor.

        /**
         * Populates the display area with HTML for each monitored system.
         */
        renderInterface: function() {
            // Iterate through each monitored system.
            $.each(this.monitoredSystems, function(listPosition, hostDetails) {
                // If secondary items are hidden and this is not the primary host, skip.
                if (this.concealOthers && hostDetails.id !== this.primaryHostId)
                    return;

                var classModifier = ''; // Initialize class modifier for collapsing panels.
                // If this is the primary host, add 'in' for expanded state.
                if (hostDetails.id === this.primaryHostId)
                    classModifier = ' in';

                // Append the HTML structure for the system to the notification area.
                $('.notification-display-area').append('<div class="display-item-row" id="system-unit-' + hostDetails.id + '"><div class="col-xs-1"><button type="button" class="btn btn-default btn-lg drag-grip"><span class="glyphicon glyphicon-align-justify"></span></button></div><div class="col-xs-11"><div class="panel panel-standard system-unit-' + hostDetails.id + '"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse"  href="#expand-section' + hostDetails.id + '"><span class="system-label">' + hostDetails.name + '</span></a><span class="align-end badge time-left"></span></h4><table class="table info hidden-element text-center"><tbody><tr><td class="event-kind"></td><td class="region-name"></td></tr></tbody></table></div><div id="expand-section' + hostDetails.id + '" class="panel-collapse collapse' + classModifier + '"><div class="panel-body text-center"></div><table class="table"><tbody><tr><td class="time-left"></td><td class="event-kind"></td><td class="region-name"></td></tr></tbody></table></div></div></div></div>');
                // Update the table content for the current system.
                this.updateSystemPanel(hostDetails);
            }.associateContext(this));
        },

        /**
         * Updates the display panel for a specific system based on its status.
         * @param {object} hostDetails - The system data object.
         */
        updateSystemPanel: function(hostDetails) {
            var hostPanel = $('.system-unit-' + hostDetails.id); // Reference to the system's panel.

            // Check if the system is active (Status code 1).
            if (hostDetails.operationalState === 1) {
                hostPanel.addClass('status-ok'); // Add success class.
                hostPanel.find('.info').removeClass('hidden-element'); // Show info table.
                hostPanel.find('.drag-grip').css('height', '51px'); // Adjust handle height.

                var mediaIcon = hostPanel.find('.system-label');
                // If no video is present, add and play the alert animation.
                if (mediaIcon.find('animated-clip').length === 0)
                    mediaIcon.before('<animated-clip width="30" height="30" autoplay loop><source src="media/AlertAnim2.mp4" type="video/mp4"></animated-clip>').prev()[0].play();

                // Set event type and tooltip.
                hostPanel.find('.event-kind').html(hostDetails.eventDetails.type).attr({
                    // title: 'Experience Boost: ' + hostDetails.eventDetails.experience_bonus + '%',
                    'data-tooltip': true
                }).tooltip({
                    tooltipParent: 'body'
                });

                // Add specific display logic based on event type.
                switch (hostDetails.eventDetails.type) {
                    case 'AreaControl':
                        this.addType('area-control', hostDetails);
                        break;
                    case 'Biotech':
                        this.addType('building-capture', hostDetails);
                        break;
                    case 'TechPlant':
                        this.addType('building-capture', hostDetails);
                        break;
                    case 'AmpStation':
                        this.addType('building-capture', hostDetails);
                        break;
                    default:
                        break;
                }

                hostPanel.find('.region-name').text(hostDetails.eventDetails.zone); // Set region name.
                hostPanel.find('.time-left').removeClass('dormant-state'); // Remove inactive state from timer.

                this.tickUpdate(hostDetails); // Update the timer for this system.
            } else {
                // System is not active.
                hostPanel.find('animated-clip').remove(); // Remove video.
                hostPanel.find('.event-kind').empty(); // Clear event type.
                hostPanel.find('.region-name').empty(); // Clear region name.
                hostPanel.find('.panel-body').html('<a href="' + hostDetails.FullAlertLink + '" target="_blank">Examine all notifications for this host</a>'); // Display link.
                hostPanel.find('.time-left').addClass('dormant-state'); // Add inactive state to timer.
                hostPanel.find('.info').addClass('hidden-element'); // Hide info table.
                hostPanel.find('.drag-grip').css('height', 'auto'); // Reset handle height.
            }

            // Handle string-based status messages (e.g., 'error').
            if (typeof hostDetails.operationalState === 'string') {
                hostPanel.find('.time-left:not(".badge")').html(hostDetails.operationalState.charAt(0).toUpperCase() + hostDetails.operationalState.slice(1));
                if (hostDetails.operationalState.indexOf('failure') !== -1)
                    hostPanel.addClass('error-status'); // Add error class.
            }
        },

        /**
         * Renders the progress bars for territory control alerts.
         * @param {object} hostDetails - The system data object.
         * @returns {Array} Tuple containing the progress row and faction percentages.
         */
        _renderTerritoryProgress: function(hostDetails) {
            var vanuPercent = hostDetails.eventDetails.TerritoryVS,
                trPercent = hostDetails.eventDetails.TerritoryTR,
                ncPercent = hostDetails.eventDetails.TerritoryNC,
                totalOther = 100 - ncPercent - trPercent, // Calculate remaining for Vanu.
                displayLine = $('#expand-section' + hostDetails.id + ' > .panel-body').append('<div class="status-bar"><div class="status-bar-red" style="width:' + trPercent + '%">' + Math.floor(trPercent) + '%</div><div class="status-bar-blue" style="width:' + ncPercent + '%">' + Math.floor(ncPercent) + '%</div><div class="status-bar-purple" style="width:' + totalOther + '%" >' + Math.floor(vanuPercent) + '%</div></div>');

            return [displayLine, vanuPercent, trPercent, ncPercent];
        },

        /**
         * Adds specific content based on the alert category.
         * @param {string} categoryType - The type of alert ('area-control' or 'building-capture').
         * @param {object} hostDetails - The system data object.
         */
        addType: function(categoryType, hostDetails) {
            var renderedInfo;
            $('#expand-section' + hostDetails.id + ' > .panel-body').html(''); // Clear panel body.
            switch (categoryType) {
                case 'area-control':
                    renderedInfo = this._renderTerritoryProgress(hostDetails);
                    break;
                case 'building-capture':
                    renderedInfo = this._renderFacilityStatus(hostDetails);
                    break;
                default:
                    return; // Exit if type is unknown.
            }

            var contentWrapper = renderedInfo[0],
                statusMessage = 'Balanced engagement.',
                dominantSide = 4, // Default for fair fight.
                styleSuffix = 'text-highlight';

            // Determine leading faction and update message/style.
            if (renderedInfo[3] < renderedInfo[1] && renderedInfo[2] < renderedInfo[1]) {
                dominantSide = 0; // Vanu
                statusMessage = 'The Vanu Sovereignty is ahead.';
            } else if (renderedInfo[2] < renderedInfo[3] && renderedInfo[3] > renderedInfo[1]) {
                dominantSide = 1; // NC
                statusMessage = 'The New Conglomerate is ahead.';
            } else if (renderedInfo[2] > renderedInfo[1] && renderedInfo[3] < renderedInfo[2]) {
                dominantSide = 2; // TR
                statusMessage = 'The Terran Republic is ahead.';
            }

            // Apply highlight if user's preferred faction is leading.
            if (this.highlightFaction === dominantSide)
                styleSuffix = 'text-positive';

            // Append the status message and PS2Alerts link.
            contentWrapper.append('<div class="' + styleSuffix + '">' + statusMessage + '<br><a href="' + hostDetails.FullAlertLink + '" target="_blank">See this event live on PS2Alerts.com</a></div>');
        },

        /**
         * Renders the facility status for building capture alerts.
         * @param {object} hostDetails - The system data object.
         * @returns {Array} Tuple containing the facility row and faction counts.
         */
        _renderFacilityStatus: function(hostDetails) {
            var displayLine = $('#expand-section' + hostDetails.id + ' > .panel-body').append('<div class="building-statuses"></div>'),
                panelBodyContainer = $('#expand-section' + hostDetails.id + ' > .panel-body'),
                facilityElements = panelBodyContainer.find('.building-statuses'),
                vanuCount = 0,
                trCount = 0,
                ncCount = 0;

            // Iterate through facility statuses in the alert details.
            $.each(hostDetails.eventDetails, function(structureId, controlState) {
                // Skip non-facility properties or null states.
                if (structureId === 'infoIdentifier' || structureId === 'infoTime' || structureId === 'outcomeIdentifier' || structureId === 'startTime' || structureId === 'type' || structureId === 'regionName' || controlState === null || structureId === 'isNotified')
                    return;

                var classToApply = 'status-bar-purple'; // Default to Vanu color.
                switch (controlState) {
                    case '1': // Vanu Sovereignty
                        vanuCount++;
                        break;
                    case '2': // New Conglomerate
                        ncCount++;
                        classToApply = 'status-bar-blue';
                        break;
                    case '3': // Terran Republic
                        trCount++;
                        classToApply = 'status-bar-red';
                        break;
                    default:
                        break;
                }
                // Append a div for each facility with its color and tooltip.
                facilityElements.append('<div class="structure ' + classToApply + '" data-tooltip="true" title="' + structureId + ' (' + hostDetails.eventDetails.type + ')">');
            });
            facilityElements.find('[data-tooltip]').tooltip(); // Initialize tooltips for facilities.

            return [displayLine, vanuCount, trCount, ncCount];
        },

        /**
         * Updates the remaining time display for a given system.
         * If no system is provided, updates all systems.
         * @param {object} [hostDetails] - Optional system data object.
         */
        tickUpdate: function(hostDetails) {
            // If no specific system is provided, iterate and update all.
            if (!hostDetails) {
                return $.each(this.monitoredSystems, function(idx, systemInfo) {
                    this.tickUpdate(systemInfo);
                }.associateContext(this));
            }
            var nowMillis = Date.now(); // Get current timestamp.

            // Only update active systems.
            if (hostDetails.operationalState === 1) {
                var durationCalc = new Date(+hostDetails.eventDetails.startTime - nowMillis);

                // Adjust duration based on alert type (Territory/Global vs. others).
                if (hostDetails.eventDetails.type === 'AreaControl' || hostDetails.eventDetails.zone === 'Global') {
                    durationCalc.setUniversalHours(durationCalc.getUniversalHours() + 2);
                } else {
                    durationCalc.setUniversalHours(durationCalc.getUniversalHours() + 1);
                }

                var hourPart = durationCalc.getUniversalHours();
                var minutePart = ('0' + durationCalc.getUniversalMinutes()).slice(-2);
                var secondPart = ('0' + durationCalc.getUniversalSeconds()).slice(-2);

                // If time remaining (less than 2 hours and positive duration).
                if (hourPart < 2 && (hourPart + +minutePart + +secondPart) > 0) {
                    // If this is the primary host, update background page badge.
                    if (hostDetails.id === this.primaryHostId)
                        chrome.runtime.fetchBackgroundScript(function(scriptContext) {
                            scriptContext.systemAlert.initializeSystem(false, scriptContext.systemAlert.refreshBadgeCount(hostDetails));
                        });
                    // Display remaining time.
                    return $('.system-unit-' + hostDetails.id + ' .time-left').html(hourPart + 'hr ' + minutePart + 'min ' + secondPart + 'sec');
                }
                // If alert time has run out, mark as inactive.
                hostDetails.operationalState = 'OFFLINE';
                this.updateSystemPanel(hostDetails); // Refresh panel to reflect inactive state.
            }
        },

        /**
         * Callback for when a system's data has been updated.
         * @param {object} hostDetails - The updated system data object.
         */
        statusUpdated: function(hostDetails) {
            this.updateSystemPanel(hostDetails); // Refresh the display for the updated system.
        },

        /**
         * Initiates a manual refresh of system data.
         */
        performRefresh: function() {
            var refreshButton = $('#trigger-update'); // Reference to the refresh button.
            refreshButton.attr('disabled', true); // Disable button during refresh.
            chrome.runtime.fetchBackgroundScript(function(scriptContext) {
                scriptContext.systemAlert.initializeSystem(true, function() {
                    // After refresh, update button tooltip with new timestamps.
                    chrome.storage.local.get({
                        recentFetch: 0,
                        apiSyncTime: 0
                    }, function(configData) {
                        refreshButton.attr('title', new Date(configData.recentFetch) + '(' + new Date(configData.apiSyncTime) + ')');
                    });
                    // Re-enable button after a cooldown period.
                    globalScope.setTimeout(function() {
                        refreshButton.removeAttr('disabled');
                    }, 120000); // 2 minutes cooldown.
                });
            });
        }
    };

    // Make the AlertMonitor class globally accessible.
    globalScope.AlertMonitor = AlertMonitor;
}(window); // Pass the global window object.

// When the DOM is ready, instantiate the AlertMonitor.
$.fn.ready(function() {
    AlertMonitor = new AlertMonitor();
});