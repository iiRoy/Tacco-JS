var currentPanel = null;
var currentFold = null;
var eventTimeDisplay = true;
var autoUpdate = true;
var dataStore = {};

window.isSmallScreen = function () {
 return window.mediaQuery('(max-width: 767px)').matches;
};

window.isMediumScreen = function () {
 return window.mediaQuery('(min-width: 768px) and (max-width: 979px)').matches;
};

window.isLargeScreen = function () {
 return window.mediaQuery('(min-width: 979px)').matches;
};

$.httpReq({
 method: "GET",
 targetUrl: "/api/config/timesinceevent",
 dataTypeHeader: "application/json; charset=utf-8",
 responseFormat: "json",
 requestBody: "{}",
 onSuccess: function (apiResponse) {
  eventTimeDisplay = apiResponse.timeSinceEvent.toLowerCase() === "true";
 }
});

function generateEventList(eventData) {
 var templateSource = $("#history-template").html();
 var eventTemplate = Handlebars.compile(templateSource);

 eventData.reverse().forEach(function (singleEvent, idx) {
  singleEvent.displayTime = timeUtil(singleEvent.dateTimeValue).calendar();
 });

 return eventTemplate({historyItems: eventData, showRelativeTime: eventTimeDisplay});
}

function renderDetailsView(systemData, viewTemplateId) {
 var viewSource = $(viewTemplateId).html();
 var detailTemplate = Handlebars.compile(viewSource);

 var securityAreas = [];
 for (var areaIdx = 1; areaIdx < 65; areaIdx++) {
  var currentArea = systemData.securityArea[areaIdx + ''];
  if (currentArea && currentArea.label) {
   currentArea.identifier = areaIdx;
   currentArea.statusClass = currentArea.state.unlocked ? 'status-critical' : 'status-ok';
   currentArea.statusIcon = !currentArea.state.unlocked ? 'icon-check-circle' : 'icon-alert-triangle';
   currentArea.activityLog = generateEventList(currentArea.recentActivity);
   currentArea.isSelected = "";
   if (currentFold === "foldArea" + areaIdx) {
    currentArea.isSelected = "in";
   }
   securityAreas.push(currentArea);
  }
 }

 var systemPartitions = [];
 for (var partIdx = 1; partIdx < 65; partIdx++) {
  var currentPartition = systemData.systemPartition[partIdx + ''];
  if (currentPartition && currentPartition.label) {
   currentPartition.identifier = partIdx;
   currentPartition.statusClass = currentPartition.state.operational ? 'status-ok' : 'status-critical';
   currentPartition.statusIcon = currentPartition.state.operational ? 'icon-check-circle' : 'icon-alert-triangle';
   currentPartition.activityLog = generateEventList(currentPartition.recentActivity);
   currentPartition.isSelected = "";
   if (currentFold === "foldPartition" + partIdx) {
    currentPartition.isSelected = "in";
   }
   systemPartitions.push(currentPartition);
  }
 }

 return detailTemplate({
  securityAreas: securityAreas,
  allAreaActivity: generateEventList(systemData.securityArea.recentActivity),
  systemPartitions: systemPartitions,
  allPartitionActivity: generateEventList(systemData.systemPartition.recentActivity),
  allAreasSelected: currentFold === "foldAreaAll" ? "in" : "",
  allPartitionsSelected: currentFold === "foldPartitionAll" ? "in" : "",
 });
}

function renderControlButtons(controlData) {
 var buttonSource = $("#controls-template").html();
 var buttonTemplate = Handlebars.compile(buttonSource);

 return buttonTemplate({
  enableSecurity: !controlData.systemPartition["1"].state.secured && !controlData.systemPartition["1"].state.exitDelayActive,
  disableSecurity: controlData.systemPartition["1"].state.secured,
  abortDelay: controlData.systemPartition["1"].state.exitDelayActive,
  activateOutput: controlData.systemPartition["1"].state.outputActive
 });
}

function deactivateSystem() {
 notificationService.ask("Please enter your access code:", function (confirmed, accessCode) {
  if (confirmed) {
   executeCommand("/api/security/deactivate?passcode=" + accessCode);
  }
 });
}

function triggerOutput() {
 notificationService.ask("Enter output # to trigger:", function (firstConfirmed, outputNumber) {
  if (firstConfirmed) {
   notificationService.ask("Please enter your access code:", function (secondConfirmed, accessCode) {
    if (secondConfirmed) {
     executeCommand("/api/output?outputId=" + outputNumber + "&passcode=" + accessCode);
    }
   });
  }
 });
}

function secureSystemWithCode() {
 notificationService.ask("Please enter your access code:", function (confirmed, accessCode) {
  if (confirmed) {
   console.info(accessCode);
   executeCommand("/api/security/activateWithCode?passcode=" + accessCode);
  } else {
   notificationService.error("system not secured");
  }
 });
}

function executeCommand(commandUrl) {
 console.info(commandUrl);
 $.httpReq({
  method: "GET",
  targetUrl: commandUrl,
  dataTypeHeader: "application/json; charset=utf-8",
  responseFormat: "json",
  onSuccess: function (responseObj) {
   console.info(responseObj.outcome);
   notificationService.success(responseObj.outcome);
  },
  onError: function () {
   notificationService.error("command execution failed");
  }
 });
}

function displayStatusMessages(statusInfo) {
 var statusHtml = '';
 if (statusInfo.systemPartition["1"].state.entryDelayActive) {
  statusHtml += '<span class="status-badge status-info">Entry delay</span>';
 }

 if (statusInfo.systemPartition["1"].state.exitDelayActive) {
  statusHtml += '<span class="status-badge status-info">Exit delay</span>';
 }

 if (statusInfo.systemPartition["1"].state.alarmTriggered) {
  statusHtml += '<span class="status-badge status-critical">Alarm</span>';
 }

 if (statusInfo.systemPartition["1"].state.troubleDetected) {
  statusHtml += '<span class="status-badge status-warning">Trouble</span>';
 }

 if (statusInfo.systemPartition["1"].state.tamperDetected) {
  statusHtml += '<span class="status-badge status-warning">Tamper</span>';
 }

 if (statusInfo.systemPartition["1"].state.outputActive) {
  statusHtml += '<span class="status-badge status-info">Output Operation Active</span>';
 }

 $('#status-display').html(statusHtml).showFade();
}

function refreshDisplayElement(elementId, newValue, forceUpdate) {
 var cachedValue = dataStore[elementId];
 if (cachedValue !== newValue || forceUpdate) {
  $(elementId).html(newValue).showFade();
  dataStore[elementId] = newValue;
  return true;
 }
 return false;
}

function updateSystemView(forceRefresh) {
 $.httpReq({
  method: "GET",
  apiUrl: "/api/system",
  dataTypeHeader: "application/json; charset=utf-8",
  responseFormat: "json",
  requestBody: "{}",
  onSuccess: function (responseData) {
   if (isSmallScreen()) {
    refreshDisplayElement('#mobile-view', renderDetailsView(responseData, "#mobile-layout"), forceRefresh);
   } else {
    if (refreshDisplayElement('#main-view', renderDetailsView(responseData, "#desktop-layout"), forceRefresh)) {
     if (currentPanel) {
      $('#navigation-tabs a[href="' + currentPanel + '"]').tab('activate');
     }
    }
   }
   refreshDisplayElement('#controls-panel', renderControlButtons(responseData), forceRefresh);
   $('#navigation-tabs').tabPlugin();

   $('#navigation-tabs a[data-action="toggle-tab"]').on('tab-shown', function (evt) {
    currentPanel = evt.target.hashLink;
   });
   $('.collapsible-section').on('expand', function () {
    currentFold = this.elementId;
   }).on('collapse', function () {
    currentFold = null;
   });

   if (autoUpdate) {
    $("#auto-update-toggle").addClass('is-active');
   }

   if (eventTimeDisplay) {
    $("#relative-time-toggle").addClass('is-active');
   }

   displayStatusMessages(responseData);
  }
 });
}

$(document).onReady(function () {
 updateSystemView();
 TouchOptimiser.init(document.body);
});

window.setInterval(function () {
 if (autoUpdate) {
  updateSystemView(false);
 }
}, 5000 /* milliseconds */);