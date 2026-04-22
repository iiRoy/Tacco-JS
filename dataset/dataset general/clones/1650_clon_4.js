const credentialVault = {
    accessIdentifier: 'API_KEY',
    secretKey: 'API_SECRET'
};

const inputChannel = require('process').stdin;
const taskRecallSystem = require('../../rtm.js');

const outputStream = {
    report: (...args) => console.log(...args),
    error: (...args) => console.error(...args)
};

const systemControl = {
    terminate: (code = 0) => process.exit(code)
};

class RecallEngineFacade {
    constructor(identifier, secret) {
        this.underlyingSystem = new taskRecallSystem(identifier, secret, 'delete');
        this.sessionCredential = null;
    }

    async obtainAuthorizationTicket() {
        return new Promise((resolve, reject) => {
            this.underlyingSystem.get('rtm.auth.getFrob', (apiResponse) => {
                if (apiResponse && apiResponse.rsp && apiResponse.rsp.frob) {
                    resolve(apiResponse.rsp.frob);
                } else {
                    reject(new Error('Failed to obtain authorization ticket from service.'));
                }
            });
        });
    }

    generateAuthenticationWebAddress(ticket) {
        return this.underlyingSystem.getAuthUrl(ticket);
    }

    async verifyAuthenticationToken(ticket) {
        return new Promise((resolve, reject) => {
            this.underlyingSystem.get('rtm.auth.getToken', { frob: ticket }, (apiResponse) => {
                if (apiResponse && apiResponse.rsp && apiResponse.rsp.auth && apiResponse.rsp.auth.token) {
                    this.sessionCredential = apiResponse.rsp.auth.token;
                    resolve(apiResponse.rsp.auth.token);
                } else {
                    reject(new Error('No valid authentication token found.'));
                }
            });
        });
    }

    async fetchUserTaskCollections() {
        return new Promise((resolve, reject) => {
            if (!this.sessionCredential) {
                return reject(new Error('Session credential missing for collection retrieval.'));
            }
            this.underlyingSystem.auth_token = this.sessionCredential;

            this.underlyingSystem.get('rtm.lists.getList', (apiResponse) => {
                if (apiResponse && apiResponse.rsp && apiResponse.rsp.lists && Array.isArray(apiResponse.rsp.lists.list)) {
                    resolve(apiResponse.rsp.lists.list);
                } else {
                    reject(new Error('Failed to retrieve user task collections.'));
                }
            });
        });
    }
}

const waitForUserInteraction = () => {
    return new Promise((resolve) => {
        inputChannel.resume();
        inputChannel.once('data', () => {
            inputChannel.pause();
            resolve();
        });
    });
};

async function applicationEntry() {
    const recallEngine = new RecallEngineFacade(credentialVault.accessIdentifier, credentialVault.secretKey);

    try {
        const authorizationTicket = await recallEngine.obtainAuthorizationTicket();
        const authenticationWebAddress = recallEngine.generateAuthenticationWebAddress(authorizationTicket);

        outputStream.report('Please visit the following URL in your browser to authenticate:\n');
        outputStream.report(authenticationWebAddress, '\n');
        outputStream.report('After authenticating, press any key to resume...');

        await waitForUserInteraction();

        await recallEngine.verifyAuthenticationToken(authorizationTicket);

        outputStream.report('Lists:');

        const agendaCollections = await recallEngine.fetchUserTaskCollections();

        agendaCollections.forEach(singleCollection => {
            outputStream.report(`${singleCollection.name} (id: ${singleCollection.id})`);
        });

        outputStream.report();

        systemControl.terminate();

    } catch (err) {
        outputStream.error(err.message || 'An unforeseen issue occurred.');
        systemControl.terminate(1);
    }
}

applicationEntry();