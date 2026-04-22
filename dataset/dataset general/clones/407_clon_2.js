(function (globalScope, documentObject, jQueryInstance) {
  // Core application configuration and utility functions container
  var appCore = {
    // Defines different categories for display
    categoryDefinitions: {
      // "production":       { label: "prod", visualHue: "#3dbc34" },
      // "quality_assurance":  { label: "qa",   visualHue: "#f370ff" },
      // "testing_environment":{ label: "test", visualHue: "#479bdb" },

      general: { label: "allHosts", visualHue: "#e7a000" },
    },

    // Stores user-hidden categories in local storage
    concealedCategories:
      JSON.parse(localStorage.getItem("concealedCategories")) || {},
    // Flag to control visibility of hosts under maintenance
    suppressMaintenanceHosts: false,

    // A simple logging mechanism for debugging
    outputMessage: function () {
      jQueryInstance("#applicationLog").append("-> "); // Prefix for log entries
      for (
        var idx = 0, count = arguments.length;
        idx < count;
        ++idx
      ) {
        jQueryInstance("#applicationLog").append(
          JSON.stringify(arguments[idx]) + "<br>"
        );
      }
    },

    // Converts a number of seconds into a human-readable duration string
    durationFormat: function (totalSeconds) {
      var numDays = Math.floor(totalSeconds / 86400);
      var numHours = Math.floor((totalSeconds - numDays * 86400) / 3600);
      var numMinutes = Math.floor(
        (totalSeconds - numDays * 86400 - numHours * 3600) / 60
      );
      var remainingSeconds = Math.floor(
        totalSeconds -
          numDays * 86400 -
          numHours * 3600 -
          numMinutes * 60
      );

      var timeParts = []; // Array to hold duration components
      if (numDays !== 0) timeParts.push(numDays + "d");
      if (numHours !== 0) timeParts.push(numHours + "h");
      if (numMinutes !== 0) timeParts.push(numMinutes + "m");
      if (remainingSeconds !== 0) timeParts.push(remainingSeconds + "s");

      return timeParts.join(" ");
    },

    // Executes a series of asynchronous functions sequentially
    processSequence: function sequentialExecution() {
      var taskSteps = Array.prototype.slice.call(arguments),
        currentStepIndex = 0;

      function callbackFunction() {
        if (currentStepIndex === taskSteps.length) return;
        taskSteps[++currentStepIndex](callbackFunction);
      }
      taskSteps[currentStepIndex](callbackFunction);
    },

    // Converts a Unix timestamp (seconds since epoch) to a Date object
    timestampToDate: function (unixTimestamp) {
      return new Date(unixTimestamp * 1000);
    },

    // Calculates and formats the duration from a Unix timestamp to now
    timestampToDuration: function (unixTimestamp) {
      var currentEpoch = (+new Date() / 1000).toFixed();
      return appCore.durationFormat(currentEpoch - unixTimestamp);
    },

    // Handles user authentication process
    performAuthentication: function () {
      if (appCore.isAuthenticating) return false; // Prevent re-authentication
      appCore.isAuthenticating = true;

      if (appCore.usernameID && appCore.passwordSecret) {
        var requestPayload = {
          authKey: "", // Authentication key, initially empty
          apiMethod: "user.authenticate",
          methodParams: {
            user: appCore.usernameID,
            password: appCore.passwordSecret,
          },
          rpcVersion: "2.0",
          requestID: 0,
        };

        transmitAPIRequest(requestPayload, function (responseObject) {
          appCore.sessionToken = responseObject.operationResult;
          appCore.initiateApplication(); // Start app after successful auth
        });
      } else {
        globalScope.alert("Username and password required!");
        documentObject.location.reload(); // Reload page on auth failure
      }
    },

    // Displays the login form and handles submission
    showLoginInterface: function () {
      jQueryInstance("#authenticationPanel").show();
      jQueryInstance("#secretField").focus(); // Focus on password input

      jQueryInstance("#submitButton").click(function () {
        appCore.usernameID = jQueryInstance("#userIDField").val();
        appCore.passwordSecret = jQueryInstance("#secretField").val();
        appCore.performAuthentication();
        jQueryInstance("#authenticationPanel").hide();
        delete appCore.usernameID; // Clear sensitive data
        delete appCore.passwordSecret;
      });
    },

    // Stores host-specific statistics
    hostStatistics: {},

    // Main function to initialize and run the application
    initiateApplication: function () {
      // Execute initial data fetches in sequence
      appCore.processSequence(
        fetchMaintenanceData,
        fetchHostStats,
        fetchProblemData,
        function () {
          // Set up periodic updates for various data types
          globalScope.setInterval(fetchMaintenanceData, 21500); // Maintenance data every ~21.5s
          globalScope.setInterval(fetchProblemData, 10000); // Problem data every 10s
          globalScope.setInterval(fetchHostStats, 300000); // Host statistics every 5 minutes
        }
      );

      var cssBlock = "<style>";
      // Generate dynamic CSS rules for host categories
      for (var catKey in appCore.categoryDefinitions) {
        var currentCategory = appCore.categoryDefinitions[catKey];
        cssBlock +=
          "." +
          currentCategory.label +
          " { background-color: " +
          currentCategory.visualHue +
          "; }";
      }
      cssBlock += "</style>";
      jQueryInstance("html > head").append(jQueryInstance(cssBlock));

      // Function to retrieve and display problem data
      function fetchProblemData(callbackFunction) {
        var issueQuery = {
          apiMethod: "trigger.get",
          methodParams: {
            retrieveHosts: true,
            retrieveGroups: true,
            onlyActive: true,
            isMonitored: true,
            fullOutput: true,
          },
          authKey: appCore.sessionToken,
          requestID: 0,
          rpcVersion: 2.0,
        };
        transmitAPIRequest(issueQuery, renderProblems, callbackFunction);
      }

      // Function to retrieve and display maintenance data
      function fetchMaintenanceData(callbackFunction) {
        var maintenanceScheduleQuery = {
          apiMethod: "maintenance.get",
          methodParams: { fullOutput: true },
          authKey: appCore.sessionToken,
          requestID: 0,
          rpcVersion: 2.0,
        };
        transmitAPIRequest(
          maintenanceScheduleQuery,
          renderMaintenanceView,
          callbackFunction
        );
      }

      // Function to retrieve and display host statistics
      function fetchHostStats(callbackFunction) {
        var hostInfoQuery = {
          apiMethod: "host.get",
          methodParams: {
            retrieveGroups: true,
            fullOutput: true,
            onlyActive: true,
            isMonitored: true,
          },
          authKey: appCore.sessionToken,
          requestID: 0,
          rpcVersion: 2.0,
        };
        transmitAPIRequest(hostInfoQuery, renderHostInfo, callbackFunction);
      }

      // Renders the list of problems based on the API response
      function renderProblems(apiResponse) {
        var processedResults = { operationResult: [], hostData: {} },
          currentEpoch = +new Date() / 1000;

        appCore.issuesInMaintenance = 0; // Reset counters
        appCore.activeIssues = 0;

        apiResponse.operationResult.forEach(function (alertItem, k) {
          // Ensure host data is present for the alert
          alertItem.hosts[0] = alertItem.hosts[0] || {
            host: "undefined",
            hostIdentifier: "0",
          };
          alertItem.hosts[0].hostIdentifier =
            alertItem.hosts[0].hostIdentifier || "0";

          // Skip a specific host ID that might be a Zabbix internal artifact
          if (alertItem.hosts[0].hostIdentifier === "10007") return; // Placeholder for Zabbix quirks

          // Priority-based filtering could be added here
          // if (parseInt(alertItem.priority) < 4) return;

          var fullHostName = alertItem.hosts[0].host;
          var abbrHostName = fullHostName.replace(/\..*$/, "");
          var underMaintenance =
            alertItem.hosts[0].maintenance_status === "1" ? true : false;

          var hostCategoryList =
            appCore.hostStatistics[alertItem.hosts[0].hostIdentifier].groups ||
            [];
          // Replace host placeholders in description
          alertItem.alertDescription =
            alertItem.hosts[0].ipAddress === "127.0.0.1"
              ? alertItem.alertDescription.replace(
                  /\{HOSTNAME\}/,
                  abbrHostName
                )
              : alertItem.alertDescription.replace(
                  /\{HOSTNAME\}/,
                  alertItem.hosts[0].ipAddress
                );
          alertItem.alertDescription = alertItem.alertDescription.replace(
            /^\d+ /,
            ""
          );
          alertItem.alertDescription =
            alertItem.alertDescription + ": " + alertItem.alertComments;

          // Increment appropriate problem counter
          underMaintenance
            ? appCore.issuesInMaintenance++
            : appCore.activeIssues++;

          // Initialize host entry in results if it doesn't exist
          processedResults.hostData[fullHostName] =
            processedResults.hostData[fullHostName] || {
              fullHostName: fullHostName,
              hostCategoryList: hostCategoryList,
              isVisible: (function () {
                var showEntry = false;
                hostCategoryList.forEach(function (cat) {
                  for (var catKey in appCore.categoryDefinitions)
                    if (cat === catKey) showEntry = true;
                });
                if (alertItem.value === "0") showEntry = false; // Resolved problems are not visible
                return showEntry;
              })(),
              environmentClass: (function () {
                var cssClasses = "";
                hostCategoryList.forEach(function (cat) {
                  for (var catKey in appCore.categoryDefinitions)
                    if (catKey === cat)
                      cssClasses = appCore.categoryDefinitions[catKey].label;
                });
                if (underMaintenance) cssClasses += " underMaintenance";
                return cssClasses;
              })(),
              incidentList: [],
            };

          // Add the problem details to the host's incident list
          processedResults.hostData[fullHostName].incidentList.push({
            alertDescription: alertItem.alertDescription,
            isRecent: alertItem.lastchange > currentEpoch - 1800 ? true : false, // Last 30 minutes
            timeElapsed: appCore.timestampToDuration(alertItem.lastchange),
            incidentID: alertItem.triggerid,
            eventTimestamp: alertItem.lastchange,
          });
        });

        // Process each host's problems
        for (var hostKey in processedResults.hostData) {
          var currentHostEntry = processedResults.hostData[hostKey];
          // Sort incidents within a host by timestamp (newest first)
          currentHostEntry.incidentList.sort(function (probA, probB) {
            return probB.eventTimestamp - probA.eventTimestamp;
          });

          var numIncidents = currentHostEntry.incidentList.length;
          // If multiple old problems, collapse them
          if (
            numIncidents > 1 &&
            currentHostEntry.incidentList[0].eventTimestamp <
              currentEpoch - 25 * 3600
          ) {
            currentHostEntry.isCollapsed = true;
            currentHostEntry.incidentList.unshift({
              alertDescription:
                "This host has " + numIncidents + " problems",
              isVisible: true,
              isRecent: false,
              timeElapsed: currentHostEntry.incidentList[0].timeElapsed,
              eventTimestamp: currentHostEntry.incidentList[0].eventTimestamp,
            });
          }
          processedResults.operationResult.push(currentHostEntry);
        }

        // Sort all hosts by the timestamp of their newest problem
        processedResults.operationResult.sort(function (hostA, hostB) {
          return (
            hostB.incidentList[0].eventTimestamp -
            hostA.incidentList[0].eventTimestamp
          );
        });
        delete processedResults.hostData; // Clean up intermediate data

        // Compile and render the problem view using Handlebars
        var htmlTemplate = documentObject.getElementById("problems_template")
            .innerHTML,
          templateCompiler = Handlebars.compile(htmlTemplate);

        jQueryInstance("#problemDisplayArea").html(
          templateCompiler(processedResults)
        );

        // Apply visual styling for hidden categories
        for (var hiddenCatKey in appCore.concealedCategories) {
          jQueryInstance(".issue.u" + hiddenCatKey).hide();
        }

        // Toggle functionality for collapsible problem sections
        jQueryInstance(".collapsibleSection").toggle(
          function () {
            jQueryInstance(this)
              .siblings(".incident:hidden")
              .show();
          },
          function () {
            jQueryInstance(this)
              .siblings(".incident")
              .hide();
          }
        );

        // Hide hosts under maintenance if the flag is set
        if (appCore.suppressMaintenanceHosts)
          jQueryInstance(".underMaintenance").hide();

        // Hover effects for problem descriptions and maintenance names
        jQueryInstance(
          ".itemDescription, .serviceBlock > .blockName"
        ).hover(
          function () {
            jQueryInstance(this)
              .css(
                "background",
                "-moz-linear-gradient(top, #c1c1c1, #a8a8a8)"
              )
              .css(
                "background",
                "-webkit-gradient(linear, left bottom, left top, from(#c1c1c1), to(#a8a8a8))"
              )
              .css({
                "-webkit-border-radius": "3px",
                "-moz-border-radius": "3px",
                color: "#333",
              });
          },
          function () {
            jQueryInstance(this).css({ background: "", color: "#ddd" });
          }
        );

        // Clean up memory
        delete htmlTemplate;
        delete processedResults;
        delete apiResponse;
      }

      // Renders the list of current and upcoming maintenances
      function renderMaintenanceView(apiResponse) {
        var viewContent =
            'Maintenances <span id="headerConcealed">(hidden)</span>',
          currentEpoch = +new Date() / 1000;

        apiResponse.operationResult.forEach(function (maintenanceEntry) {
          maintenanceEntry.statusExpired = (function () {
            if (maintenanceEntry.activeUntil < currentEpoch) return "expired";
            if (maintenanceEntry.activeFrom > currentEpoch) return "waiting";
          })();
          maintenanceEntry.isVisible = (function () {
            var showEntry = true;
            // Hide maintenances with specific tags or very old expired ones
            if (
              maintenanceEntry.alertDescription.search(
                /appCore.excluded/
              ) != -1 ||
              maintenanceEntry.activeUntil < currentEpoch - 7200
            )
              showEntry = false; // 2 hours

            return showEntry;
          })();
        });

        // Compile and render the maintenance view
        var htmlTemplate = documentObject.getElementById(
            "maintenances_template"
          ).innerHTML,
          templateCompiler = Handlebars.compile(htmlTemplate);

        jQueryInstance("#maintenanceSchedule").html(
          templateCompiler(apiResponse)
        );

        // Set initial header state for maintenance view
        if (appCore.suppressMaintenanceHosts)
          jQueryInstance("#mainHeader").html(viewContent);

        // Toggle display of hosts in maintenance on header click
        jQueryInstance("#mainHeader").click(function () {
          var clickedElement = jQueryInstance(this);
          if (appCore.suppressMaintenanceHosts) {
            clickedElement.html("Maintenances");
            jQueryInstance(".underMaintenance").show();
            appCore.suppressMaintenanceHosts = false;
          } else {
            clickedElement.html(viewContent);
            jQueryInstance(".underMaintenance").hide();
            appCore.suppressMaintenanceHosts = true;
          }
        });

        // Clean up memory
        delete apiResponse;
        delete htmlTemplate;
      }

      // Renders host statistics and category filtering controls
      function renderHostInfo(hostDataResponse) {
        // No inline comments for this function, as per requirement
        delete appCore.hostStatistics;
        var categoryMap = {},
          processedHostStats = {};

        appCore.hostStatistics = {};
        // Initialize a dummy entry for host ID 0, if needed (XXX FIXME XXX)
        appCore.hostStatistics[0] = { groups: [] };

        hostDataResponse.operationResult.forEach(function (singleHost) {
          appCore.hostStatistics[singleHost.hostIdentifier] = appCore
            .hostStatistics[singleHost.hostIdentifier]
            ? appCore.hostStatistics[singleHost.hostIdentifier]
            : {};
          appCore.hostStatistics[singleHost.hostIdentifier].groups = appCore
            .hostStatistics[singleHost.hostIdentifier].groups
            ? appCore.hostStatistics[singleHost.hostIdentifier].groups
            : [];
          singleHost.groups.forEach(function (hostGroup) {
            appCore.hostStatistics[singleHost.hostIdentifier].groups.push(
              hostGroup.name
            );
            appCore.hostStatistics[singleHost.hostIdentifier].groups.unshift(
              "general"
            );
            categoryMap[hostGroup.name] = null;
          });
        });
        categoryMap["general"] = null; // Ensure 'general' category is always present

        var categoryList = [];
        for (var mapKey in categoryMap)
          categoryList.push({
            categoryName:
              appCore.categoryDefinitions[mapKey] &&
              appCore.categoryDefinitions[mapKey].label,
            styleClass:
              appCore.categoryDefinitions[mapKey] &&
              appCore.categoryDefinitions[mapKey].label,
          });

        processedHostStats.categoryList = categoryList;
        processedHostStats.issuesInMaintenanceCount =
          appCore.issuesInMaintenance;
        processedHostStats.activeIssuesCount = appCore.activeIssues;

        var htmlTemplate = documentObject.getElementById("ustats_template")
            .innerHTML,
          templateCompiler = Handlebars.compile(htmlTemplate);

        jQueryInstance("#environmentPanel").html(
          templateCompiler(processedHostStats)
        );

        // Hover effects for expand/collapse buttons
        jQueryInstance("#expandAll,#collapseAll")
          .mouseover(function () {
            jQueryInstance(this).css("background", "#333");
          })
          .mouseout(function () {
            jQueryInstance(this).css("background", "");
          });

        // Click handlers for expand/collapse buttons
        jQueryInstance("#collapseAll").click(function () {
          jQueryInstance(".categoryItem-").fadeOut(300);
        });
        jQueryInstance("#expandAll").click(function () {
          jQueryInstance(".categoryItem-").fadeIn(300);
        });

        // Helper function to get color for a category label
        var retrieveCategoryColor = function (categoryLabel) {
          for (var defKey in appCore.categoryDefinitions) {
            if (appCore.categoryDefinitions[defKey].label === categoryLabel) {
              return appCore.categoryDefinitions[defKey].visualHue;
            }
          }
        };

        // Apply colors to category blocks
        for (var idx = 0; idx < categoryList.length; idx++) {
          jQueryInstance(
            ".environmentBlock > ." + categoryList[idx].categoryName
          )
            .parent()
            .show()
            .css(
              "background-color",
              retrieveCategoryColor(categoryList[idx].categoryName)
            );
        }

        // Click handler for individual category blocks to toggle visibility
        jQueryInstance(".environmentBlock").click(function () {
          var clickedElement = jQueryInstance(this);
          var selectedCategory = clickedElement.children().attr("class"), // e.g., "p2"
            isHidden = false;

          for (var hiddenCatKey in appCore.concealedCategories)
            if (hiddenCatKey === selectedCategory) isHidden = true;

          if (isHidden) {
            clickedElement.css(
              "background-color",
              retrieveCategoryColor(selectedCategory)
            );
            clickedElement
              .children()
              .css("background-color", retrieveCategoryColor(selectedCategory));
            jQueryInstance(".u" + selectedCategory + ".issue").show();
            delete appCore.concealedCategories[selectedCategory];
            localStorage.setItem(
              "concealedCategories",
              JSON.stringify(appCore.concealedCategories)
            );
          } else {
            clickedElement.css("background-color", "#555");
            clickedElement.children().css("background-color", "#555");
            jQueryInstance(".u" + selectedCategory + ".issue").hide();
            appCore.concealedCategories[selectedCategory] = true;
            localStorage.setItem(
              "concealedCategories",
              JSON.stringify(appCore.concealedCategories)
            );
          }
        });

        // Apply visual state for initially hidden categories
        for (var hiddenCatKey in appCore.concealedCategories) {
          jQueryInstance(".environmentBlock > ." + hiddenCatKey)
            .parent()
            .css("background-color", "#555");
          jQueryInstance(".environmentBlock > ." + hiddenCatKey).css(
            "background-color",
            "#555"
          );
        }

        // Clean up memory
        delete htmlTemplate;
        delete processedHostStats;
        delete categoryList;
        delete categoryMap;
      }
    },
  };

  // Global function for making AJAX requests to the API
  var transmitAPIRequest = function (requestObject, successHandler, completeHandler) {
    jQueryInstance.ajax({
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      url: "/api_jsonrpc.php", // API endpoint
      data: JSON.stringify(requestObject),
      timeout: 20000, // 20-second timeout
      success: function (responseObject) {
        if (responseObject === null || responseObject.error) {
          // appCore.outputMessage(responseObject); // Log API errors
          jQueryInstance("#errorMessageDisplay").html(
            "API Error" +
              "<div id='errorDetails'>(" +
              // JSON.stringify(responseObject === null ? "connection timed out" : responseObject) +
              JSON.stringify(responseObject) +
              ")</div>"
          );
          jQueryInstance("#errorMessageDisplay").fadeIn(500); // Show error message
        } else {
          jQueryInstance("#errorMessageDisplay").fadeOut(500); // Hide error on success
          successHandler(responseObject); // Execute success callback
          if (completeHandler) completeHandler(); // Execute optional completion callback
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        jQueryInstance("#errorMessageDisplay").html(
          "<div id='errorDetails'>(" +
            textStatus +
            " " +
            jqXHR.responseText +
            ")</div>"
        );
        jQueryInstance("#errorMessageDisplay").fadeIn(500); // Display AJAX error
      },
    });
  };

  // Entry point: Execute login process once the DOM is fully loaded
  jQueryInstance(documentObject).on("DOMContentLoaded", function () {
    appCore.showLoginInterface();
    // appCore.initiateApplication(); // Uncomment to bypass login for testing
  });
})(window, document, jQuery);