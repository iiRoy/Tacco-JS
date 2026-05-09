let deviceInfoBlob;
let logUpdateHandle;

const deviceTypeAliases = new Map([
    ["spark-core", "Spark Core"],
    ["photon", "Photon"]
]);

const firmwareFormats = new Map([
    ["spark-core", "BIN"]
]);

document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    queryDeviceFirmwareStatus();

    const systemControlInterface = document.getElementById('maintenance-panel');
    if (systemControlInterface) {
        // Simulating dialog behavior (visibility and title)
        systemControlInterface.style.display = 'none'; // Initially hidden, to be opened by button
        systemControlInterface.style.visibility = 'visible'; // Unhide after loading
        // Assuming a title element exists within the panel or is set externally
        // For simplicity, just making it visible.
    }

    const controlPanelToggle = document.querySelector('button#maintenance');
    if (controlPanelToggle) {
        controlPanelToggle.addEventListener('click', () => {
            if (systemControlInterface) {
                systemControlInterface.style.display = 'block'; // Open dialog
            }
        });
    }

    const refreshRateSetter = document.querySelector('button#apply-interval');
    if (refreshRateSetter) {
        refreshRateSetter.addEventListener('click', () => {
            const intervalSelector = document.querySelector('select#interval');
            if (intervalSelector) {
                const messagePayload = new URLSearchParams({
                    actionCode: "interval",
                    dataValue: intervalSelector.value
                });
                fetch('interface_gateway.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: messagePayload
                }).catch(console.error);
            }
        });
    }

    const configLabelButton = document.querySelector('button.apply-profile-name');
    if (configLabelButton) {
        configLabelButton.addEventListener('click', () => {
            const configLabelInput = document.querySelector('input#profile-name');
            if (configLabelInput) {
                const messagePayload = new URLSearchParams({
                    actionCode: "profileName",
                    dataValue: configLabelInput.value
                });
                fetch('interface_gateway.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: messagePayload
                }).catch(console.error);
            }
        });
    }

    const timestampFormatButton = document.querySelector('button.apply-datetime-format-display');
    if (timestampFormatButton) {
        timestampFormatButton.addEventListener('click', () => {
            const timestampFormatSelector = document.getElementById('datetime-format-display');
            if (timestampFormatSelector) {
                const messagePayload = new URLSearchParams({
                    actionCode: "dateTimeFormatDisplay",
                    dataValue: timestampFormatSelector.value
                });
                fetch('interface_gateway.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: messagePayload
                }).catch(console.error);
            }
        });
    }

    const fineTuneParameters = document.getElementById('advanced-settings');
    if (fineTuneParameters) {
        fineTuneParameters.querySelectorAll(".dispatch-setting-button").forEach(button => {
            button.addEventListener('click', function() {
                const parentElement = this.parentElement;
                let dataToTransmit;
                const selectElement = parentElement.querySelector("select");
                const inputElement = parentElement.querySelector("input");

                if (selectElement) {
                    dataToTransmit = { [selectElement.name]: selectElement.value };
                } else if (inputElement) {
                    dataToTransmit = { [inputElement.name]: inputElement.value };
                } else {
                    return;
                }

                const messagePayload = new URLSearchParams({
                    actionCode: "setParameters",
                    dataValue: JSON.stringify(dataToTransmit)
                });

                fetch('interface_gateway.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: messagePayload
                }).then(() => {
                    if (selectElement && selectElement.name === "tempFormat") {
                        // If temperature format is updated, reload all settings in new format and update fields
                        retrieveDeviceParameters();
                        retrieveDeviceConfigurations();
                    }
                }).catch(console.error);
            });
        });
    }

    document.querySelectorAll(".cc.receive-from-script").forEach(btn => btn.addEventListener('click', processScriptedParameters));
    document.querySelectorAll(".cc.update-from-arduino").forEach(btn => btn.addEventListener('click', retrieveDeviceParameters));
    document.querySelectorAll(".cc.load-defaults").forEach(btn => btn.addEventListener('click', revertParameterDefaults));

    document.querySelectorAll(".cs.receive-from-script").forEach(btn => btn.addEventListener('click', processScriptedConfigurations));
    document.querySelectorAll(".cs.update-from-arduino").forEach(btn => btn.addEventListener('click', retrieveDeviceConfigurations));
    document.querySelectorAll(".cs.load-defaults").forEach(btn => btn.addEventListener('click', revertConfigurationDefaults));

    document.querySelectorAll(".cv.receive-from-script").forEach(btn => btn.addEventListener('click', processScriptedVariables));
    document.querySelectorAll(".cv.update-from-arduino").forEach(btn => btn.addEventListener('click', retrieveDeviceVariables));

    const logRefreshButton = document.getElementById("refresh-logs");
    if (logRefreshButton) {
        logRefreshButton.addEventListener('click', () => {
            retrieveAndRenderLogs(true, true);
        });
    }

    const autoLogRefreshButton = document.getElementById("auto-refresh-logs");
    if (autoLogRefreshButton) {
        autoLogRefreshButton.addEventListener('click', function() {
            initiateLogStream(5000, true, true);
            if (this.classList.contains('ui-state-default')) {
                this.classList.remove("ui-state-default");
                this.classList.add("ui-state-error");
                this.querySelector('.ui-button-text').textContent = 'Disable auto-refresh';
            } else {
                this.classList.remove("ui-state-error");
                this.classList.add("ui-state-default");
                this.querySelector('.ui-button-text').textContent = 'Enable auto-refresh';
            }
        });
    }

    const historyPurgeButton = document.getElementById("erase-logs");
    if (historyPurgeButton) {
        historyPurgeButton.addEventListener('click', () => {
            const messagePayload = new URLSearchParams({
                actionCode: "eraseLogs",
                dataValue: ""
            });
            fetch('interface_gateway.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: messagePayload
            }).then(() => retrieveAndRenderLogs(true, true))
            .catch(console.error);
        });
    }

    const firmwareUploadButton = document.querySelector("input#program-submit-button");
    if (firmwareUploadButton) {
        firmwareUploadButton.addEventListener('click', () => {
            initiateLogStream(2000, false, true); // auto-refresh stderr
            const firmwareStatusBanner = document.getElementById("program-stderr-header");
            if (firmwareStatusBanner) {
                firmwareStatusBanner.textContent = "Programming... observe the output for progress.";
            }
        });
    }
}); // End DOMContentLoaded

function configureHardwareDisplay(deviceIdentifier) {
    const boardTypeElement = document.querySelector("#reprogram-arduino .boardType");
    if (boardTypeElement) {
        boardTypeElement.value = deviceIdentifier;
    }

    const boardMonikerElements = document.querySelectorAll(".boardMoniker");
    if (deviceTypeAliases.has(deviceIdentifier)) {
        boardMonikerElements.forEach(el => el.textContent = deviceTypeAliases.get(deviceIdentifier));
    }

    const firmwareTypeElements = document.querySelectorAll(".programFileType");
    if (firmwareFormats.has(deviceIdentifier)) {
        firmwareTypeElements.forEach(el => el.textContent = firmwareFormats.get(deviceIdentifier));
    }
}

function updateSystemInfo(deviceData) {
    deviceInfoBlob = deviceData; // Store globally or in a module scope
    if (deviceInfoBlob && deviceInfoBlob.board) {
        configureHardwareDisplay(deviceInfoBlob.board);
    }
}

function queryDeviceFirmwareStatus() {
    const messagePayload = new URLSearchParams({
        actionCode: "getVersion",
        dataValue: ""
    });
    fetch('interface_gateway.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: messagePayload
    })
    .then(response => response.json())
    .then(updateSystemInfo)
    .catch(console.error);
}

function retrieveAndRenderLogs(refreshStdOutFlag, refreshStdErrFlag) {
    const logFetchUrl = `log_retriever.php?output_stream=${refreshStdOutFlag ? '1' : '0'}&error_stream=${refreshStdErrFlag ? '1' : '0'}`;

    fetch(logFetchUrl)
        .then(response => response.json())
        .then(data => {
            if (refreshStdErrFlag) {
                document.querySelectorAll('div.stderr').forEach(targetDiv => {
                    const scrolledNearBottom = (targetDiv.scrollHeight - targetDiv.scrollTop - targetDiv.clientHeight) < 40;
                    const wasInitiallySmall = targetDiv.textContent.length < 40;

                    targetDiv.innerHTML = data.stderr || "";

                    if (scrolledNearBottom || wasInitiallySmall) {
                        targetDiv.scrollTop = targetDiv.scrollHeight;
                    }
                });
            }
            if (refreshStdOutFlag) {
                document.querySelectorAll('div.stdout').forEach(targetDiv => {
                    const scrolledNearBottom = (targetDiv.scrollHeight - targetDiv.scrollTop - targetDiv.clientHeight) < 40;
                    const wasInitiallySmall = targetDiv.textContent.length < 40;

                    targetDiv.innerHTML = data.stdout || "";

                    if (scrolledNearBottom || wasInitiallySmall) {
                        targetDiv.scrollTop = targetDiv.scrollHeight;
                    }
                });
            }
        })
        .catch(console.error);
}

function initiateLogStream(updateFrequency, outputActive, errorActive) {
    if (logUpdateHandle !== undefined) {
        clearTimeout(logUpdateHandle); // Use clearTimeout for recursive setTimeout
    }

    const scheduledRefresh = () => {
        retrieveAndRenderLogs(outputActive, errorActive);
        logUpdateHandle = setTimeout(scheduledRefresh, updateFrequency);
    };

    scheduledRefresh(); // Initial call
}

const systemControlInterface = document.getElementById('maintenance-panel');
if (systemControlInterface) {
    // Simulating the tabsactivate event for a Type IV clone
    // In a real scenario, this would be triggered by a custom tab implementation
    systemControlInterface.addEventListener('tab_activated_event', () => {
        if (logUpdateHandle !== undefined) {
            clearTimeout(logUpdateHandle);
        }
        const autoLogRefreshButton = document.getElementById('auto-refresh-logs');
        if (autoLogRefreshButton) {
            autoLogRefreshButton.classList.remove("ui-state-error");
            autoLogRefreshButton.classList.add("ui-state-default");
            autoLogRefreshButton.querySelector('.ui-button-text').textContent = 'Enable auto-refresh';
        }
    });
}


// Placeholder functions for external calls (renamed)
function signalFirmwareFailure(errorMessage) {
    window.alert("Device programming error: " + errorMessage);
}

function confirmFirmwareCompletion() {
    const firmwareStatusBanner = document.getElementById("program-stderr-header");
    if (firmwareStatusBanner) {
        firmwareStatusBanner.textContent = "Programming operation finished!";
    }
}

function reportFirmwareIssue() {
    const firmwareStatusBanner = document.getElementById("program-stderr-header");
    if (firmwareStatusBanner) {
        firmwareStatusBanner.textContent = "An issue occurred! Consult logs for specifics!";
    }
}

// Assumed external functions (renamed from original `reloadControlConstantsFromArduino`, etc.)
function retrieveDeviceParameters() { /* ... implementation ... */ }
function retrieveDeviceConfigurations() { /* ... implementation ... */ }
function retrieveDeviceVariables() { /* ... implementation ... */ }
function processScriptedParameters() { /* ... implementation ... */ }
function processScriptedConfigurations() { /* ... implementation ... */ }
function processScriptedVariables() { /* ... implementation ... */ }
function revertParameterDefaults() { /* ... implementation ... */ }
function revertConfigurationDefaults() { /* ... implementation ... */ }