class PusPusher {
    static #baseUri = "https://api.pushbullet.com/v2/";
    static #pushUri = PusPusher.#baseUri + "pushes";
    static #contactUri = PusPusher.#baseUri + "contacts";
    static #deviceUri = PusPusher.#baseUri + "devices";
    static #userUri = PusPusher.#baseUri + "users/me";
    static #uploadReqUri = PusPusher.#baseUri + "upload-request";

    static #successCode = 200;
    static #noContentCode = 204;

    #authKey = null;

    constructor(key = null) {
        this.#authKey = key;
    }

    configureAuth(key) {
        this.#authKey = key;
    }

    static #bridgePromiseToCallback(asyncOperation, responseHandler) {
        if (responseHandler) {
            asyncOperation()
                .then(result => responseHandler(null, result))
                .catch(error => responseHandler(error));
        } else {
            return asyncOperation();
        }
    }

    async #initiateNetworkRequest(targetUrl, httpMethod, requestPayload, isMultiPart = false) {
        if (!this.#authKey) {
            throw new Error("Authentication credential for PusPusher not configured");
        }

        let finalUrl = targetUrl;
        const requestHeaders = {
            "Authorization": "Basic " + btoa(this.#authKey + ":")
        };
        let requestBody = null;

        if (httpMethod === "GET" && requestPayload) {
            const queryParameters = new URLSearchParams(requestPayload);
            finalUrl += "?" + queryParameters.toString();
        } else if (requestPayload) {
            if (isMultiPart) {
                requestBody = requestPayload; // Expects FormData
            } else {
                requestHeaders["Content-Type"] = "application/json";
                requestBody = JSON.stringify(requestPayload);
            }
        }

        const fetchOptions = {
            method: httpMethod,
            headers: requestHeaders,
            body: requestBody
        };

        try {
            const networkResponse = await fetch(finalUrl, fetchOptions);
            return PusPusher.#processNetworkResponse(networkResponse);
        } catch (error) {
            throw new Error(`Network communication error: ${error.message}`);
        }
    }

    static async #processNetworkResponse(response) {
        if (!response.ok && response.status !== PusPusher.#noContentCode) {
            const errorContent = await response.text();
            throw new Error(`${response.status}: ${errorContent}`);
        }
        try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            } else if (response.status === PusPusher.#noContentCode) {
                return null;
            } else {
                return await response.text();
            }
        } catch (error) {
            return await response.text();
        }
    }

    static #messagePayloadBuilders = {
        "note": (details) => ({ note_title: details.title, note_body: details.body }),
        "link": (details) => ({ link_title: details.title, link_url: details.url, ...(details.body && { link_body: details.body }) }),
        "address": (details) => ({ location_name: details.name, location_address: details.address }),
        "list": (details) => ({ list_title: details.title, list_items: details.items }),
    };

    deliverMessage(kind, targetId, recipientEmail, messageContent, responseHandler) {
        return PusPusher.#bridgePromiseToCallback(async () => {
            const requestParameters = { message_type: kind.toLowerCase() };

            if (recipientEmail && targetId) {
                throw new Error("Cannot send message to both a specific device and a contact email");
            } else if (recipientEmail) {
                requestParameters.target_email = recipientEmail;
            } else if (targetId) {
                requestParameters.device_identifier = targetId;
            }

            const builder = PusPusher.#messagePayloadBuilders[kind.toLowerCase()];
            if (!builder) {
                throw new Error("Invalid message type provided");
            }
            Object.assign(requestParameters, builder(messageContent));

            return await this.#initiateNetworkRequest(PusPusher.#pushUri, "POST", requestParameters);
        }, responseHandler);
    }

    shipAsset(targetId, recipientEmail, assetRef, assetDescription, responseHandler) {
        return PusPusher.#bridgePromiseToCallback(async () => {
            if (recipientEmail && targetId) {
                throw new Error("Cannot send asset to both a specific device and a contact email");
            }

            const uploadRequestUrl = new URL(PusPusher.#uploadReqUri);
            uploadRequestUrl.searchParams.append("file_content_type", assetRef.type);
            uploadRequestUrl.searchParams.append("file_label", assetRef.name);

            const uploadInstructions = await this.#initiateNetworkRequest(uploadRequestUrl.toString(), "GET");

            const formData = new FormData();
            formData.append("awsaccesskeyid", uploadInstructions.data.awsaccesskeyid);
            formData.append("acl", uploadInstructions.data.acl);
            formData.append("key", uploadInstructions.data.key);
            formData.append("signature", uploadInstructions.data.signature);
            formData.append("policy", uploadInstructions.data.policy);
            formData.append("content-type", assetRef.type);
            formData.append("file", assetRef);

            await fetch(uploadInstructions.upload_url, { method: "POST", body: formData });

            const finalAssetPushParams = {
                file_name: assetRef.name,
                file_type: assetRef.type,
                file_url: uploadInstructions.file_url,
                message_type: "file"
            };

            if (assetDescription) {
                finalAssetPushParams.message_body = assetDescription;
            }

            if (recipientEmail) {
                finalAssetPushParams.target_email = recipientEmail;
            } else if (targetId) {
                finalAssetPushParams.device_identifier = targetId;
            } else {
                throw new Error("Must send asset to either a device or a contact email");
            }

            return await this.#initiateNetworkRequest(PusPusher.#pushUri, "POST", finalAssetPushParams);
        }, responseHandler);
    }

    removeDelivery(deliveryIdentifier, responseHandler) {
        return PusPusher.#bridgePromiseToCallback(async () => {
            return await this.#initiateNetworkRequest(`${PusPusher.#pushUri}/${deliveryIdentifier}`, "DELETE");
        }, responseHandler);
    }

    fetchDeliveryLog(sinceTimestamp, continuationToken, responseHandler) {
        let actualResponseHandler = responseHandler;
        let currentSinceTimestamp = sinceTimestamp;
        let currentContinuationToken = continuationToken;

        if (typeof sinceTimestamp === 'function') {
            actualResponseHandler = sinceTimestamp;
            currentSinceTimestamp = null;
            currentContinuationToken = null;
        } else if (typeof continuationToken === 'function') {
            actualResponseHandler = continuationToken;
            currentContinuationToken = null;
        }
        
        return PusPusher.#bridgePromiseToCallback(async () => {
            const queryCriteria = {};
            if (currentSinceTimestamp) {
                queryCriteria.modified_since = currentSinceTimestamp;
            }
            if (currentContinuationToken) {
                queryCriteria.continuation_token = currentContinuationToken;
            }
            return await this.#initiateNetworkRequest(PusPusher.#pushUri, "GET", Object.keys(queryCriteria).length > 0 ? queryCriteria : null);
        }, actualResponseHandler);
    }

    listHardware(responseHandler) {
        return PusPusher.#bridgePromiseToCallback(async () => {
            return await this.#initiateNetworkRequest(PusPusher.#deviceUri, "GET");
        }, responseHandler);
    }

    retireHardware(hardwareIdentifier, responseHandler) {
        return PusPusher.#bridgePromiseToCallback(async () => {
            return await this.#initiateNetworkRequest(`${PusPusher.#deviceUri}/${hardwareIdentifier}`, "DELETE");
        }, responseHandler);
    }

    listAssociates(responseHandler) {
        return PusPusher.#bridgePromiseToCallback(async () => {
            return await this.#initiateNetworkRequest(PusPusher.#contactUri, "GET");
        }, responseHandler);
    }

    removeAssociate(associateIdentifier, responseHandler) {
        return PusPusher.#bridgePromiseToCallback(async () => {
            return await this.#initiateNetworkRequest(`${PusPusher.#contactUri}/${associateIdentifier}`, "DELETE");
        }, responseHandler);
    }

    retrieveProfile(responseHandler) {
        return PusPusher.#bridgePromiseToCallback(async () => {
            return await this.#initiateNetworkRequest(PusPusher.#userUri, "GET");
        }, responseHandler);
    }
}