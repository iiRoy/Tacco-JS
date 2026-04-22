const apiEndpoints = require('../custom_modules/constants').URLS;
const HttpAgent = require('./requester');

class DatingAppClient {
    #httpService;

    constructor() {
        this.#httpService = new HttpAgent();
    }

    asyncAuthenticate(userIdentifier, secretCode, completionHandler) {
        const credentialsPayload = { user: userIdentifier, passcode: secretCode };
        this.#httpService.initiatePost(apiEndpoints.login, credentialsPayload, completionHandler);
    }

    fetchProfileView(targetHandle, responseCallback) {
        const profileAccessPath = apiEndpoints.visit_user.split('{username}').join(targetHandle);
        this.#httpService.requestGet(profileAccessPath, responseCallback);
    }

    submitEvaluation(entityIdentifier, ratingValue, resultCallback) {
        const evaluationDetails = {
            api_version: 1,
            rating: ratingValue,
            assessment_category: 'personality',
            evaluated_entity_id: entityIdentifier
        };
        this.#httpService.initiatePost(apiEndpoints.rate, evaluationDetails, resultCallback);
    }

    retrieveRapidMatch(completionCallback) {
        this.#httpService.requestGet(apiEndpoints.quickmatch, completionCallback);
    }

    obtainIndividualProfile(personHandle, doneCallback) {
        const individualProfilePath = apiEndpoints.user_profile.split('{username}').join(personHandle);
        this.#httpService.requestGet(individualProfilePath, doneCallback);
    }

    accessVisitorLog(finalCallback) {
        this.#httpService.requestGet(apiEndpoints.get_visitors, finalCallback);
    }
}

module.exports = DatingAppClient;