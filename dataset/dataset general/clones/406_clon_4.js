const fetch = require('node-fetch');

const SERVICE_ENDPOINT = "https://api.gotinder.com";
const BASE_HEADERS = {
    'User-Agent': 'Tinder Android Version 2.2.3',
    'os_version': '16'
};

class MatchmakerService {
    #accessCredential = null;
    #lastInteractionTimestamp = new Date();
    #currentProfileIdentifier = null;
    #serviceConfigurationData = null;

    constructor() {
        // Initialization can be done here if needed
    }

    async #performNetworkOperation(method, endpointPath, requestPayload = null) {
        let fullRequestUrl = `${SERVICE_ENDPOINT}/${endpointPath}`;
        const operationHeaders = { ...BASE_HEADERS };

        if (this.#accessCredential) {
            operationHeaders['X-Auth-Token'] = this.#accessCredential;
        }

        const fetchConfiguration = {
            method: method,
            headers: operationHeaders,
        };

        if (requestPayload) {
            if (method === 'GET' && Object.keys(requestPayload).length > 0) {
                const queryParameters = new URLSearchParams(requestPayload).toString();
                fullRequestUrl += `?${queryParameters}`;
            } else if (method === 'POST') {
                fetchConfiguration.body = JSON.stringify(requestPayload);
                operationHeaders['Content-Type'] = 'application/json';
            }
        }
        
        try {
            const networkResponse = await fetch(fullRequestUrl, fetchConfiguration);
            if (!networkResponse.ok) {
                const errorContent = await networkResponse.text();
                throw new Error(`Service error: ${networkResponse.status} - ${errorContent}`);
            }
            const responseData = await networkResponse.json();
            return responseData;
        } catch (operationError) {
            console.error("Network operation encountered an issue:", operationError);
            throw operationError;
        }
    }

    async fetchNearbyProfiles(maximumCount) {
        return this.#performNetworkOperation('GET', 'user/recs', { limit: maximumCount });
    }

    async dispatchMessage(recipientId, content) {
        return this.#performNetworkOperation('POST', `user/matches/${recipientId}`, { message: content });
    }

    async declineProfile(profileIdentifier) {
        return this.#performNetworkOperation('GET', `pass/${profileIdentifier}`);
    }

    async approveProfile(profileIdentifier) {
        return this.#performNetworkOperation('GET', `like/${profileIdentifier}`);
    }

    async authenticateUser(socialMediaToken, socialMediaId) {
        try {
            const authResult = await this.#performNetworkOperation('POST', 'auth', {
                facebook_token: socialMediaToken,
                facebook_id: socialMediaId
            });

            if (authResult && authResult.token) {
                this.#accessCredential = authResult.token;
                this.#currentProfileIdentifier = authResult.user._id;
                this.#serviceConfigurationData = authResult;
                return authResult;
            } else if (authResult && authResult.error) {
                throw new Error(`Authentication failure: ${authResult.error}`);
            } else {
                throw new Error("Authentication failure: Malformed response.");
            }
        } catch (authError) {
            console.error("Authentication process failed:", authError);
            throw authError;
        }
    }

    hasValidSession() {
        return this.#accessCredential !== null;
    }

    retrieveSessionKey() {
        return this.#accessCredential;
    }

    getServiceConfiguration() {
        return this.#serviceConfigurationData;
    }

    async retrieveRecentActivity() {
        const currentTimestamp = this.#lastInteractionTimestamp.toISOString();
        const activityResponse = await this.#performNetworkOperation('POST', 'updates', { last_activity_date: currentTimestamp });
        
        if (activityResponse && activityResponse.last_activity_date) {
            this.#lastInteractionTimestamp = new Date(activityResponse.last_activity_date);
        }
        return activityResponse;
    }

    async fetchAllActivity() {
        return this.#performNetworkOperation('POST', 'updates', { last_activity_date: "" });
    }

    async updateGeolocation(longitudeCoordinate, latitudeCoordinate) {
        return this.#performNetworkOperation('POST', 'user/ping', { lon: longitudeCoordinate, lat: latitudeCoordinate });
    }

    async fetchUserProfile(profileIdentifier) {
        return this.#performNetworkOperation('GET', `user/${profileIdentifier}`);
    }
}

module.exports = { MatchmakerService };