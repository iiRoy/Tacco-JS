(() => {
  // Application-wide configuration and utility functions.
  // This module orchestrates various data fetching and UI rendering tasks.
  const coreApplication = {
    // Defines display properties for different host categories.
    categoryDefinitions: {
      // "production":       { label: "prod", styleColor: "#3dbc34" },
      // "quality_assurance":{ label: "qa",   styleColor: "#f370ff" },
      // "development":      { label: "dev",  styleColor: "#479bdb" },
      "others": { label: "allHosts", styleColor: "#e7a000" }
    },

    // Stores IDs of host groups currently hidden from display.
    suppressedGroupIds: JSON.parse(localStorage.getItem('hiddenGroups')) || {},

    // Flag to control visibility of hosts under maintenance.
    shouldHideMaintenanceHosts: false,

    // A simple logging utility for debugging purposes.
    devLog: function(...messages) {
      const logElement = $('#app-messages');
      if (logElement.length === 0) {
        console.warn("Log element '#app-messages' not found.");
        return;
      }
      logElement.append("-> ");
      for (const msg of messages) {
        logElement.append(`${JSON.stringify(msg)}<br>`);
      }
      logElement.scrollTop(logElement[0].scrollHeight); // Scroll to bottom
    },

    /**
     * Converts a number of seconds into a human-readable duration string.
     * @param {number} totalSeconds - The total number of seconds.
     * @returns {string} A formatted duration string (e.g., "1d 2h 3m 4s").
     */
    formatSecondsToDuration: function(totalSeconds) {
      if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
        return "N/A"; // Guard clause for invalid input
      }

      const SECONDS_IN_DAY = 86400;
      const SECONDS_IN_HOUR = 3600;
      const SECONDS_IN_MINUTE = 60;

      let remainingSeconds = totalSeconds;

      const numDays = Math.floor(remainingSeconds / SECONDS_IN_DAY);
      remainingSeconds -= numDays * SECONDS_IN_DAY;

      const numHours = Math.floor(remainingSeconds / SECONDS_IN_HOUR);
      remainingSeconds -= numHours * SECONDS_IN_HOUR;

      const numMinutes = Math.floor(remainingSeconds / SECONDS_IN_MINUTE);
      remainingSeconds -= numMinutes * SECONDS_IN_MINUTE;

      const numSeconds = Math.floor(remainingSeconds);

      const durationParts = [];
      if (numDays > 0) durationParts.push(`${numDays}d`);
      if (numHours > 0) durationParts.push(`${numHours}h`);
      if (numMinutes > 0) durationParts.push(`${numMinutes}m`);
      if (numSeconds > 0 || durationParts.length === 0) durationParts.push(`${numSeconds}s`); // Ensure at least '0s' if total is 0

      return durationParts.join(' ');
    },

    /**
     * Executes a series of asynchronous functions sequentially.
     * Each function in the sequence receives a callback to trigger the next.
     * @param {...Function} tasks - Functions to be executed in order.
     */
    executeSequentialTasks: function(...tasks) {
      if (tasks.length === 0) {
        return; // Guard clause for no tasks
      }

      let currentTaskIndex = 0;
      const advanceToNextTask = () => {
        if (currentTaskIndex < tasks.length) {
          const nextTask = tasks[currentTaskIndex++];
          // Ensure the task is a function before attempting to call it.
          if (typeof nextTask === 'function') {
            nextTask(advanceToNextTask);
          } else {
            console.error("Non-function element found in task sequence:", nextTask);
            advanceToNextTask(); // Skip to the next task
          }
        }
      };
      advanceToNextTask();
    },

    /**
     * Converts a Unix epoch timestamp (seconds) to a JavaScript Date object.
     * @param {number} epochSeconds - Seconds since epoch.
     * @returns {Date} Corresponding Date object.
     */
    convertEpochToDate: (epochSeconds) => new Date(epochSeconds * 1000),

    /**
     * Calculates the duration from a past epoch timestamp to now, formatted as a string.
     * @param {number} pastEpochSeconds - The past epoch timestamp in seconds.
     * @returns {string} Formatted duration string.
     */
    getRelativeDurationFromEpoch: function(pastEpochSeconds) {
      const currentEpochSeconds = Math.floor(Date.now() / 1000);
      const difference = currentEpochSeconds - pastEpochSeconds;
      return coreApplication.formatSecondsToDuration(difference);
    },

    // Authentication state variables
    isAuthInProgress: false,
    currentUser: null,
    currentPass: null,
    authToken: null,

    /**
     * Attempts to authenticate the user with provided credentials.
     * Prevents multiple authentication attempts concurrently.
     */
    processUserAuthentication: function() {
      if (coreApplication.isAuthInProgress) {
        coreApplication.devLog("Authentication already in progress, skipping.");
        return false;
      }
      coreApplication.isAuthInProgress = true;

      if (!coreApplication.currentUser || !coreApplication.currentPass) {
        alert("Username and password are required for authentication.");
        location.reload(); // Force refresh if credentials are missing
        coreApplication.isAuthInProgress = false;
        return false;
      }

      const authenticationPayload = {
        id: 0,
        jsonrpc: "2.0",
        method: "user.authenticate",
        params: {
          user: coreApplication.currentUser,
          password: coreApplication.currentPass
        }
      };

      const handleAuthResponse = (responseObj) => {
        if (responseObj && responseObj.result) {
          coreApplication.authToken = responseObj.result;
          coreApplication.bootstrapApplication(); // Start main app flow on success
        } else {
          coreApplication.devLog("Authentication failed.", responseObj);
          alert("Invalid credentials or server error. Please try again.");
          location.reload();
        }
      };

      jsonRpcCall(authenticationPayload, handleAuthResponse, () => {
        coreApplication.isAuthInProgress = false; // Reset flag after completion
      });
      return true;
    },

    /**
     * Displays the login interface and handles user input for authentication.
     */
    initiateLoginInterface: function() {
      const loginPanel = $('#login');
      const passwordInput = $('#password');
      const loginButton = $('#button');
      const usernameInput = $('#username');

      loginPanel.show();
      passwordInput.focus();

      let isLoginButtonClickBlocked = false; // Simple debounce flag

      loginButton.on('click', function() {
        if (isLoginButtonClickBlocked) return;
        isLoginButtonClickBlocked = true; // Block further clicks temporarily

        coreApplication.currentUser = usernameInput.val();
        coreApplication.currentPass = passwordInput.val();

        if (coreApplication.processUserAuthentication()) {
          loginPanel.hide();
          // Clear sensitive data from the coreApplication object after use
          coreApplication.currentUser = null;
          coreApplication.currentPass = null;
        }
        // Allow clicks again after a short delay or based on auth response
        setTimeout(() => isLoginButtonClickBlocked = false, 1500);
      });
    },

    // Stores aggregated statistics about hosts.
    systemHostStats: {},

    /**
     * Initializes the main application logic, setting up data fetches and UI updates.
     */
    bootstrapApplication: function() {
      coreApplication.devLog("Application bootstrap started.");
      coreApplication.executeSequentialTasks(
        fetchMaintenanceData,
        fetchHostMetrics,
        fetchProblemTriggers,
        () => {
          // Set up periodic refresh intervals for data
          setInterval(fetchMaintenanceData, 22000); // ~22 seconds
          setInterval(fetchProblemTriggers, 11000); // ~11 seconds
          setInterval(fetchHostMetrics, 305000); // ~5 minutes
          coreApplication.devLog("Periodic data refresh configured.");
        }
      );

      // Dynamically generate and inject CSS for host group colors
      const styleElement = $('<style>');
      let dynamicCssRules = '';
      for (const groupName in coreApplication.categoryDefinitions) {
        const groupInfo = coreApplication.categoryDefinitions[groupName];
        if (groupInfo && groupInfo.label && groupInfo.styleColor) {
          dynamicCssRules += `.${groupInfo.label} { background-color: ${groupInfo.styleColor}; }`;
        }
      }
      styleElement.text(dynamicCssRules);
      $('html > head').append(styleElement);
      coreApplication.devLog("Dynamic CSS injected for category styling.");
    }
  }; // End of coreApplication object

  // --- Core Application Functions (Private-like) ---

  /** Fetches maintenance data from the API. */
  function fetchMaintenanceData(doneCallback) {
    coreApplication.devLog("Fetching maintenance schedule...");
    const maintenanceRequest = {
      method: "maintenance.get",
      params: {
        extendoutput: true
      },
      auth: coreApplication.authToken,
      id: 1, // Unique ID for this request
      jsonrpc: "2.0"
    };
    jsonRpcCall(maintenanceRequest, displayMaintenanceSchedule, doneCallback);
  }

  /** Fetches host statistics from the API. */
  function fetchHostMetrics(doneCallback) {
    coreApplication.devLog("Fetching host metrics...");
    const hostMetricRequest = {
      method: "host.get",
      params: {
        select_groups: true,
        extendoutput: true,
        only_true: true, // Only include enabled hosts
        monitored: true // Only include monitored hosts
      },
      auth: coreApplication.authToken,
      id: 2,
      jsonrpc: "2.0"
    };
    jsonRpcCall(hostMetricRequest, displayHostStatistics, doneCallback);
  }

  /** Fetches problem triggers from the API. */
  function fetchProblemTriggers(doneCallback) {
    coreApplication.devLog("Fetching problem triggers...");
    const triggerRequest = {
      method: "trigger.get",
      params: {
        select_hosts: true,
        select_groups: true,
        only_true: true, // Only show enabled triggers
        monitored: true, // Only show triggers on monitored items
        extendoutput: true // Get full trigger details
      },
      auth: coreApplication.authToken,
      id: 3,
      jsonrpc: "2.0"
    };
    jsonRpcCall(triggerRequest, displayProblemReport, doneCallback);
  }

  /**
   * Processes and displays active problem triggers.
   * @param {object} apiResponse - The JSON response from the trigger.get API call.
   */
  function displayProblemReport(apiResponse) {
    if (!apiResponse || !Array.isArray(apiResponse.result)) {
      coreApplication.devLog("Invalid API response for problems:", apiResponse);
      return;
    }

    coreApplication.devLog("Processing problem report...");
    const processedAlertData = {
      alerts: [],
      hostMap: new Map()
    };
    const currentEpochSeconds = Math.floor(Date.now() / 1000);

    coreApplication.maintenancedProblemsCount = 0;
    coreApplication.activeProblemCount = 0;

    const ZABBIX_DEFAULT_HOST_ID_TO_IGNORE = "10007"; // Common Zabbix internal host ID

    for (const alertItem of apiResponse.result) {
      // Ensure host data is present, providing defaults if missing
      const primaryHost = alertItem.hosts && alertItem.hosts[0] || {
        host: "unknown_host",
        hostid: "0",
        ip: "N/A",
        maintenance_status: "0"
      };

      if (primaryHost.hostid === ZABBIX_DEFAULT_HOST_ID_TO_IGNORE) {
        continue; // Skip this internal Zabbix host
      }

      // Optional: Filter triggers by priority (e.g., show only 'High' or 'Disaster')
      // if (parseInt(alertItem.priority) < 4) continue;

      const hostIdentifier = primaryHost.host;
      const shortHostId = hostIdentifier.replace(/\..*$/, '');
      const isInMaintenance = primaryHost.maintenance_status === "1";

      // Retrieve host's group information from systemHostStats
      const hostGroups = coreApplication.systemHostStats[primaryHost.hostid] ?
        coreApplication.systemHostStats[primaryHost.hostid].groups : [];

      // Update trigger description based on host IP or name
      let alertDescription = alertItem.description;
      alertDescription = alertDescription.replace(/\{HOSTNAME\}/g, primaryHost.ip === "127.0.0.1" ? shortHostId : primaryHost.ip);
      alertDescription = alertDescription.replace(/^\d+ /, ''); // Remove leading numbers if any
      alertDescription = `${alertDescription}: ${alertItem.comments}`;

      // Update problem counters
      isInMaintenance ? coreApplication.maintenancedProblemsCount++ : coreApplication.activeProblemCount++;

      // Initialize host entry in the map if it doesn't exist
      if (!processedAlertData.hostMap.has(hostIdentifier)) {
        processedAlertData.hostMap.set(hostIdentifier, {
          hostname: hostIdentifier,
          hostGroups: hostGroups,
          // Determine if the host should be displayed based on its groups
          isVisible: hostGroups.some(group => {
            for (const key in coreApplication.categoryDefinitions) {
              if (group === key) return true;
            }
            return false;
          }) && alertItem.value !== "0", // Also hide if trigger value is 'OK'
          // Generate CSS class string for environment styling
          environmentClass: (() => {
            let cssClasses = '';
            for (const group of hostGroups) {
              const groupDef = coreApplication.categoryDefinitions[group];
              if (groupDef) cssClasses += `${groupDef.label} `;
            }
            if (isInMaintenance) cssClasses += "in-maintenance";
            return cssClasses.trim();
          })(),
          alerts: [] // List of alerts for this host
        });
      }

      // Add the current alert to the host's list
      const hostEntry = processedAlertData.hostMap.get(hostIdentifier);
      hostEntry.alerts.push({
        description: alertDescription,
        isRecent: alertItem.lastchange > (currentEpochSeconds - 60 * 30), // True if changed in last 30 mins
        durationString: coreApplication.getRelativeDurationFromEpoch(alertItem.lastchange),
        triggerId: alertItem.triggerid,
        epochTimestamp: alertItem.lastchange
      });
    }

    // Convert map to array and sort alerts within each host
    for (const [hostKey, hostDetails] of processedAlertData.hostMap.entries()) {
      hostDetails.alerts.sort((a1, a2) => a2.epochTimestamp - a1.epochTimestamp);

      // Implement alert shortening for hosts with many old problems
      const numAlerts = hostDetails.alerts.length;
      if (numAlerts > 1 && hostDetails.alerts[0].epochTimestamp < (currentEpochSeconds - 25 * 60 * 60)) {
        hostDetails.shouldShorten = true;
        hostDetails.alerts.unshift({
          description: `This host has ${numAlerts} problems`,
          isVisible: true,
          isRecent: false,
          durationString: hostDetails.alerts[0].durationString,
          epochTimestamp: hostDetails.alerts[0].epochTimestamp
        });
      }
      processedAlertData.alerts.push(hostDetails);
    }

    // Sort hosts by the most recent alert
    processedAlertData.alerts.sort((a, b) => b.alerts[0].epochTimestamp - a.alerts[0].epochTimestamp);

    // Render problems using Handlebars template
    const problemsContainer = $("#problem-dashboard");
    const problemTemplateElement = document.getElementById('problem-list-template');
    if (!problemTemplateElement || !Handlebars) {
      coreApplication.devLog("Handlebars or problem template not found.");
      return;
    }
    const problemListTemplate = Handlebars.compile(problemTemplateElement.innerHTML);
    problemsContainer.html(problemListTemplate(processedAlertData));

    // Apply hidden group styling and state
    for (const groupId in coreApplication.suppressedGroupIds) {
      $(`.alert-item-container.group-${groupId}`).hide();
    }

    // Toggle for shortened problem lists
    $('.shorten-toggle').on('click', function() {
      $(this).siblings('.alert-detail:hidden').show();
      $(this).toggleClass('expanded');
    });

    // Hide hosts in maintenance if the flag is set
    if (coreApplication.shouldHideMaintenanceHosts) {
      $('.host-entry.in-maintenance').hide();
    }

    // Add hover effects for descriptions
    $(".alert-description, .maintenance-entry > .name").hover(function() {
      $(this).css({
        "background": "linear-gradient(to top, #c1c1c1, #a8a8a8)",
        "border-radius": "3px",
        "color": "#333"
      });
    }, function() {
      $(this).css({
        "background": "",
        "color": "#ddd"
      });
    });
    coreApplication.devLog("Problem report displayed.");
  }

  /**
   * Displays the current maintenance schedule.
   * @param {object} apiResponse - The JSON response from the maintenance.get API call.
   */
  function displayMaintenanceSchedule(apiResponse) {
    if (!apiResponse || !Array.isArray(apiResponse.result)) {
      coreApplication.devLog("Invalid API response for maintenances:", apiResponse);
      return;
    }

    coreApplication.devLog("Processing maintenance schedule...");
    const currentEpochSeconds = Math.floor(Date.now() / 1000);
    const MAINTENANCE_EXPIRY_THRESHOLD = 7200; // 2 hours in seconds

    // Enrich maintenance events with display properties
    const enrichedMaintenanceEvents = apiResponse.result.map(maintEvent => {
      let status = '';
      if (maintEvent.active_till < currentEpochSeconds) {
        status = "expired";
      } else if (maintEvent.active_since > currentEpochSeconds) {
        status = "pending";
      }

      const isDisplayable = !(
        maintEvent.description.includes('coreApplication.filtered') ||
        maintEvent.active_till < (currentEpochSeconds - MAINTENANCE_EXPIRY_THRESHOLD)
      );

      return {
        ...maintEvent,
        status: status,
        isDisplayable: isDisplayable
      };
    });

    const maintenancePanel = $("#maintenance-schedule");
    const maintenanceTemplateElement = document.getElementById('maintenance-list-template');
    if (!maintenanceTemplateElement || !Handlebars) {
      coreApplication.devLog("Handlebars or maintenance template not found.");
      return;
    }
    const maintenanceListTemplate = Handlebars.compile(maintenanceTemplateElement.innerHTML);
    maintenancePanel.html(maintenanceListTemplate({
      events: enrichedMaintenanceEvents
    }));

    // Manage the toggle for hiding/showing maintenance hosts
    const headerElement = $('#maintenance-header');
    const headerHtmlHidden = `Maintenances <span id="header-hide-indicator">(hidden)</span>`;
    const headerHtmlVisible = `Maintenances`;

    headerElement.html(coreApplication.shouldHideMaintenanceHosts ? headerHtmlHidden : headerHtmlVisible);

    headerElement.off('click').on('click', function() {
      coreApplication.shouldHideMaintenanceHosts = !coreApplication.shouldHideMaintenanceHosts;
      $(this).html(coreApplication.shouldHideMaintenanceHosts ? headerHtmlHidden : headerHtmlVisible);
      if (coreApplication.shouldHideMaintenanceHosts) {
        $('.host-entry.in-maintenance').hide();
      } else {
        $('.host-entry.in-maintenance').show();
      }
      coreApplication.devLog(`Maintenance host visibility toggled to: ${coreApplication.shouldHideMaintenanceHosts ? 'hidden' : 'visible'}`);
    });
    coreApplication.devLog("Maintenance schedule displayed.");
  }

  /**
   * Processes and displays aggregated host statistics.
   * @param {object} apiResponse - The JSON response from the host.get API call.
   */
  function displayHostStatistics(apiResponse) {
    if (!apiResponse || !Array.isArray(apiResponse.result)) {
      coreApplication.devLog("Invalid API response for host stats:", apiResponse);
      return;
    }

    coreApplication.devLog("Processing host statistics...");
    const distinctGroups = new Set();
    const temporaryHostStats = {}; // Use a temporary object

    // Initialize a default entry for 'unknown' hosts or those without groups
    temporaryHostStats["0"] = {
      groups: []
    };

    for (const host of apiResponse.result) {
      const hostId = host.hostid;
      temporaryHostStats[hostId] = temporaryHostStats[hostId] || {
        groups: []
      };

      for (const group of host.groups) {
        temporaryHostStats[hostId].groups.push(group.name);
        distinctGroups.add(group.name);
      }
      // Ensure 'others' is always considered a group for every host
      temporaryHostStats[hostId].groups.unshift("others");
      distinctGroups.add("others");
    }
    coreApplication.systemHostStats = temporaryHostStats; // Update the global state

    // Prepare list of categories for display in the statistics panel
    const categoryDisplayList = Array.from(distinctGroups).map(groupName => {
      const groupDef = coreApplication.categoryDefinitions[groupName];
      return {
        name: groupName,
        label: groupDef ? groupDef.label : groupName, // Use label if defined, else raw name
        cssClass: groupDef ? groupDef.label : groupName // Use label for CSS class
      };
    });

    const statisticsSummary = {
      categoryList: categoryDisplayList.sort((a, b) => a.label.localeCompare(b.label)), // Sort alphabetically
      numMaintenancedProblems: coreApplication.maintenancedProblemsCount,
      numActiveProblems: coreApplication.activeProblemCount
    };

    const statsContainer = $("#environment-stats");
    const statsTemplateElement = document.getElementById('stats-panel-template');
    if (!statsTemplateElement || !Handlebars) {
      coreApplication.devLog("Handlebars or stats template not found.");
      return;
    }
    const statsTemplate = Handlebars.compile(statsTemplateElement.innerHTML);
    statsContainer.html(statsTemplate(statisticsSummary));

    // Helper to get color for a category label
    const retrieveCategoryColor = (categoryLabel) => {
      for (const key in coreApplication.categoryDefinitions) {
        if (coreApplication.categoryDefinitions[key].label === categoryLabel) {
          return coreApplication.categoryDefinitions[key].styleColor;
        }
      }
      return null; // Default if not found
    };

    // Apply colors to category display items
    for (const category of categoryDisplayList) {
      const color = retrieveCategoryColor(category.cssClass);
      if (color) {
        $(`.category-item > .${category.cssClass}`).parent().show().css('background-color', color);
      }
    }

    // Toggle all categories visibility
    $('#expand-all-categories, #collapse-all-categories')
      .on('mouseenter', function() {
        $(this).css('background', '#333');
      })
      .on('mouseleave', function() {
        $(this).css('background', '');
      });
    $('#collapse-all-categories').on('click', function() {
      $('.category-item-content').fadeOut(300);
    });
    $('#expand-all-categories').on('click', function() {
      $('.category-item-content').fadeIn(300);
    });

    // Handle click on individual category items to hide/show problems
    $('.category-item').on('click', function() {
      const categoryLabel = $(this).children().attr('class'); // e.g., "prod" or "qa"
      let isCurrentlyHidden = false;

      // Check if this category is in the suppressed list (using its original group name as key)
      let originalGroupName = null;
      for (const key in coreApplication.categoryDefinitions) {
        if (coreApplication.categoryDefinitions[key].label === categoryLabel) {
          originalGroupName = key;
          break;
        }
      }

      if (originalGroupName && coreApplication.suppressedGroupIds[originalGroupName]) {
        isCurrentlyHidden = true;
      }

      const itemColor = retrieveCategoryColor(categoryLabel);

      if (isCurrentlyHidden) {
        // Show category: remove from suppressed list, restore color, show problems
        $(this).css("background-color", itemColor);
        $(this).children().css("background-color", itemColor);
        $(`.problem-entity.group-${originalGroupName}`).show();
        if (originalGroupName) delete coreApplication.suppressedGroupIds[originalGroupName];
      } else {
        // Hide category: add to suppressed list, change to grey, hide problems
        const hiddenColor = "#555";
        $(this).css("background-color", hiddenColor);
        $(this).children().css("background-color", hiddenColor);
        $(`.problem-entity.group-${originalGroupName}`).hide();
        if (originalGroupName) coreApplication.suppressedGroupIds[originalGroupName] = true;
      }
      localStorage.setItem('hiddenGroups', JSON.stringify(coreApplication.suppressedGroupIds));
      coreApplication.devLog(`Category '${categoryLabel}' visibility toggled to: ${isCurrentlyHidden ? 'visible' : 'hidden'}`);
    });

    // Apply initial hidden state to categories based on localStorage
    for (const groupName in coreApplication.suppressedGroupIds) {
      const groupDef = coreApplication.categoryDefinitions[groupName];
      if (groupDef) {
        $('.category-item > .' + groupDef.label).parent().css("background-color", "#555");
        $('.category-item > .' + groupDef.label).css("background-color", "#555");
      }
    }
    coreApplication.devLog("Host statistics displayed and interactivity configured.");
  }

  // --- AJAX Communication Utility ---

  const API_ENDPOINT_URL = "/api_jsonrpc.php"; // Centralized API endpoint

  /**
   * Makes a JSON-RPC API call using jQuery AJAX.
   * @param {object} requestBody - The JSON-RPC request payload.
   * @param {Function} onSuccess - Callback function for successful responses.
   * @param {Function} [onCompletion] - Optional callback function to execute after success or error.
   */
  const jsonRpcCall = function(requestBody, onSuccess, onCompletion) {
    let serializedData;
    try {
      serializedData = JSON.stringify(requestBody);
    } catch (e) {
      coreApplication.devLog("Error serializing request body:", e, requestBody);
      displayGlobalError("Request serialization failed.");
      if (onCompletion) onCompletion();
      return;
    }

    $.ajax({
      type: 'POST',
      dataType: "json",
      contentType: "application/json",
      url: API_ENDPOINT_URL,
      data: serializedData,
      timeout: 25000, // Increased timeout for potentially slow API calls
      success: function(jsonResponse) {
        if (jsonResponse === null || jsonResponse.error) {
          coreApplication.devLog("API Error Response:", jsonResponse || "No response received (null).");
          displayGlobalError(
            `API Error: ${jsonResponse ? JSON.stringify(jsonResponse.error) : "Connection timed out or empty response."}`
          );
        } else {
          $('#app-error-display').fadeOut(500); // Hide previous errors
          if (onSuccess) onSuccess(jsonResponse);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        coreApplication.devLog("AJAX Request Failed:", textStatus, errorThrown, jqXHR.responseText);
        displayGlobalError(
          `Network/Server Error: ${textStatus} - ${jqXHR.responseText || errorThrown}`
        );
      },
      complete: function() {
        if (onCompletion) onCompletion();
      }
    });
  };

  /**
   * Displays a global error message to the user.
   * @param {string} message - The error message to display.
   */
  function displayGlobalError(message) {
    const errorDisplay = $('#app-error-display');
    if (errorDisplay.length === 0) {
      console.error("Error display element '#app-error-display' not found. Message:", message);
      return;
    }
    errorDisplay.html(
      `<div class='error-heading'>Application Error</div>
       <div class='error-details'>${message}</div>`
    ).fadeIn(500);
  }

  // --- Application Entry Point ---

  $(document).ready(function() {
    if (typeof jQuery === 'undefined') {
      console.error("jQuery not loaded. Application cannot start.");
      return;
    }
    if (typeof Handlebars === 'undefined') {
      console.error("Handlebars.js not loaded. Templates will not render.");
      // Potentially render a fallback message or disable features.
    }

    coreApplication.devLog("Document ready. Initiating login flow.");
    coreApplication.initiateLoginInterface();
    // coreApplication.bootstrapApplication(); // Uncomment for direct app start (e.g., if no auth needed)
  });

})();