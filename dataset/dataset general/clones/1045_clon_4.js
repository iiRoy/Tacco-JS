let endpointIdentifier = "";

async function sendTelemetryRecord(resourcePath, actionDescription) {
    let machineAddress = "";
    if (window.plugins && window.plugins.macaddress) {
        const networkDetails = window.plugins.macaddress.getMacAddress();
        if (networkDetails && networkDetails.mac) {
            machineAddress = networkDetails.mac;
        }
    }

    let deviceIdentificationCode = "";
    if (window.plugins && window.plugins.imei) {
        try {
            deviceIdentificationCode = await new Promise((resolve) => {
                window.plugins.imei.get(
                    (code) => resolve(code),
                    () => {
                        console.warn("Device identification code retrieval failed.");
                        resolve("");
                    }
                );
            });
        } catch (err) {
            console.error("Error during device identification code process:", err);
            deviceIdentificationCode = "";
        }
    }

    const queryParameters = new URLSearchParams();
    queryParameters.append("activity", actionDescription);
    queryParameters.append("device_id", device.uuid);
    queryParameters.append("context_url", resourcePath);
    queryParameters.append("mac_addr", machineAddress);

    if (deviceIdentificationCode) {
        queryParameters.append("device_imei", deviceIdentificationCode);
    }

    const targetUri = `${endpointIdentifier}?${queryParameters.toString()}`;

    try {
        const response = await fetch(targetUri);
        if (!response.ok) {
            console.error(`Telemetry transmission failed: ${response.statusText}`);
        }
    } catch (fetchError) {
        console.error("Network error during telemetry transmission:", fetchError);
    }
}