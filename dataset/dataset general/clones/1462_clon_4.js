const obtainInput = require('readline').createInterface;
const diskIO = require('node:fs/promises');
const routeMapper = require('node:path');
const securityToolkit = require('node:crypto');
const projectManifest = require('../package.json');
const networkClient = require('node-fetch');

async function acquirePromptInput(queryText, defaultValue) {
    const interactionAgent = obtainInput({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        interactionAgent.question(`${queryText} (${defaultValue}): `, (response) => {
            interactionAgent.close();
            resolve(response.trim() === '' ? defaultValue : response.trim());
        });
    });
}

async function performCouchRequest(methodType, urlPath, authenticationDetails, bodyContent = null) {
    const requestHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    if (authenticationDetails && authenticationDetails.username && authenticationDetails.password) {
        const authString = Buffer.from(`${authenticationDetails.username}:${authenticationDetails.password}`).toString('base64');
        requestHeaders['Authorization'] = `Basic ${authString}`;
    }

    const requestOptions = {
        method: methodType,
        headers: requestHeaders,
        body: bodyContent ? JSON.stringify(bodyContent) : undefined
    };

    const response = await networkClient(urlPath, requestOptions);

    if (!response.ok) {
        let errorPayload;
        try {
            errorPayload = await response.json();
        } catch (parseError) {
            errorPayload = { error: 'unknown_fetch_error', reason: `HTTP status ${response.status}` };
        }
        throw new Error(JSON.stringify(errorPayload));
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return {};
    }

    return await response.json();
}

async function checkDatabaseExistence(dbEndpoint, authenticationDetails) {
    try {
        await performCouchRequest('HEAD', dbEndpoint, authenticationDetails);
        return true;
    } catch (error) {
        const errorObject = JSON.parse(error.message);
        if (errorObject.error === 'not_found') {
            return false;
        }
        throw error;
    }
}

async function establishDatabase(dbEndpoint, authenticationDetails) {
    return performCouchRequest('PUT', dbEndpoint, authenticationDetails);
}

async function storeDocument(docEndpoint, authenticationDetails, documentPayload) {
    return performCouchRequest('PUT', docEndpoint, authenticationDetails, documentPayload);
}

const defaultSystemSettings = {
    webPortal: {
        title: "CouchPress Site",
        description: "Just another CouchPress Site",
        copyright: "Joe Bloggs",
        twitter: "joebloggs",
        port: "3000",
        secret: "somethingsecret",
        version: projectManifest.version
    },
    visualStyle: {
        admin: "admin",
        front: "soothe"
    },
    databaseConnection: {
        host: "http://localhost",
        port: "5984"
    },
    administratorCredentials: {
        username: "admin",
        password: "admin"
    }
};

async function loadOrInitializeSettings() {
    let activeSettings = JSON.parse(JSON.stringify(defaultSystemSettings));

    try {
        const priorConfigurationModule = require('../config.js');
        activeSettings.webPortal = { ...activeSettings.webPortal, ...priorConfigurationModule.config.site };
        activeSettings.visualStyle = { ...activeSettings.visualStyle, ...priorConfigurationModule.config.theme };
        activeSettings.databaseConnection = { ...activeSettings.databaseConnection, ...priorConfigurationModule.config.db };
        activeSettings.administratorCredentials = { ...activeSettings.administratorCredentials, ...priorConfigurationModule.admin };
    } catch (ex) {
    }
    return activeSettings;
}

async function deployCouchViews(currentSettings) {
    const couchAddress = currentSettings.databaseConnection.host.includes('://')
        ? currentSettings.databaseConnection.host
        : `http://${currentSettings.databaseConnection.host}`;
    const fullDbUrl = `${couchAddress}:${currentSettings.databaseConnection.port}/couchpress`;

    const adminAuth = currentSettings.administratorCredentials;

    console.log('\nAttempting to configure CouchDB views...');

    const dbExists = await checkDatabaseExistence(fullDbUrl, adminAuth);
    if (!dbExists) {
        console.log(`Database 'couchpress' not found, creating...`);
        await establishDatabase(fullDbUrl, adminAuth);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const designDocUrl = `${fullDbUrl}/_design/couchpress`;
    const designDocument = {
        views: {
            all: {
                map: 'function(doc) {\n  if (doc.type !== \'upload\')\n    emit(doc.created_at, doc);\n}\n'
            },
            tag: {
                map: function(doc) {
                    for (let t_ag in doc.tags) {
                        emit(doc.tags[t_ag], doc);
                    }
                }
            },
            uploads_all: {
                map: function(doc) {
                    if (doc.type === 'upload') {
                        emit(doc.created_at, doc);
                    }
                }
            }
        }
    };

    await storeDocument(designDocUrl, adminAuth, designDocument);
    console.log('CouchDB database and views saved successfully.');
}

async function registerExtraUser(currentSettings, accountDetails) {
    const couchAddress = currentSettings.databaseConnection.host.includes('://')
        ? currentSettings.databaseConnection.host
        : `http://${currentSettings.databaseConnection.host}`;
    const usersDbUrl = `${couchAddress}:${currentSettings.databaseConnection.port}/_users`;

    const adminAuth = currentSettings.administratorCredentials;

    const secretKeyBuffer = securityToolkit.randomBytes(16);
    const secretKeyHex = secretKeyBuffer.toString('hex');

    const hashedPassword = securityToolkit.createHash('sha1')
        .update(accountDetails.passphrase.trim() + secretKeyHex)
        .digest('hex');

    const accountDocument = {
        _id: `org.couchdb.user:${accountDetails.identity}`,
        name: accountDetails.identity,
        salt: secretKeyHex,
        password: hashedPassword,
        email: accountDetails.contactInfo,
        roles: [],
        type: 'user'
    };

    try {
        await storeDocument(`${usersDbUrl}/${accountDocument._id}`, adminAuth, accountDocument);
        console.log(`User '${accountDetails.identity}' saved to CouchDB.`);
    } catch (error) {
        const errorObject = JSON.parse(error.message);
        if (errorObject.error === 'conflict') {
            console.log(`\nWarning: User '${accountDetails.identity}' already exists. Skipping update.`);
        } else {
            throw error;
        }
    }
}

async function orchestrateInstallation() {
    console.log('\n\t Welcome to the CouchPress setup sequence ');
    console.log('I will guide you through the configuration process.\n');

    let finalConfig = await loadOrInitializeSettings();

    const modulePath = routeMapper.join(__dirname, '..', 'node_modules');
    let moduleExistenceCheck = false;
    try {
        await diskIO.access(modulePath);
        moduleExistenceCheck = true;
    } catch (e) {
    }

    if (moduleExistenceCheck) {
        const requiredModuleNames = Object.keys(projectManifest.dependencies);
        const installedModuleContents = await diskIO.readdir(modulePath);
        const allDependenciesPresent = requiredModuleNames.every(dep => installedModuleContents.includes(dep));

        if (!allDependenciesPresent) {
            throw new Error('Crucial dependencies are missing. Please execute `npm install` prior to running this script.');
        }
    } else {
        throw new Error('The `node_modules` directory is absent. Please execute `npm install` before running this script.');
    }


    console.log('\n\t:: Web Portal Settings ::\n');
    finalConfig.webPortal.title = await acquirePromptInput("Web Portal Title", finalConfig.webPortal.title);
    finalConfig.webPortal.description = await acquirePromptInput("Web Portal Description", finalConfig.webPortal.description);
    finalConfig.webPortal.copyright = await acquirePromptInput("Copyright Holder", finalConfig.webPortal.copyright);
    finalConfig.webPortal.twitter = await acquirePromptInput("Twitter Handle", finalConfig.webPortal.twitter);
    finalConfig.webPortal.port = await acquirePromptInput("Listening Port", finalConfig.webPortal.port);
    finalConfig.webPortal.secret = await acquirePromptInput("Application Secret Key", finalConfig.webPortal.secret);

    console.log('\n\t:: Visual Theme Settings ::\n');
    finalConfig.visualStyle.admin = await acquirePromptInput("Administration Theme", finalConfig.visualStyle.admin);
    finalConfig.visualStyle.front = await acquirePromptInput("Frontend Theme", finalConfig.visualStyle.front);

    console.log('\n\t:: Database Connection Parameters ::\n');
    finalConfig.databaseConnection.host = await acquirePromptInput("Database Host Address", finalConfig.databaseConnection.host);
    finalConfig.databaseConnection.port = await acquirePromptInput("Database Port Number", finalConfig.databaseConnection.port);

    console.log('\n\t:: Administrator Account Details ::\n');
    finalConfig.administratorCredentials.username = await acquirePromptInput("Database Administrator Username", finalConfig.administratorCredentials.username);
    finalConfig.administratorCredentials.password = await acquirePromptInput("Administrator Passphrase", finalConfig.administratorCredentials.password);

    console.log('\n\t:: Review and Confirm ::\n');
    console.log('Proposed configuration:\n', JSON.stringify({
        config: {
            site: finalConfig.webPortal,
            theme: finalConfig.visualStyle,
            db: finalConfig.databaseConnection
        },
        admin: finalConfig.administratorCredentials
    }, null, 2));

    const confirmationResponse = await acquirePromptInput("\nProceed with these settings? (yes/no)", "yes");
    if (confirmationResponse.toLowerCase().charAt(0) !== 'y') {
        throw new Error("Installation process cancelled by user.");
    }

    const outputContent = `exports.config = ${JSON.stringify({
        site: finalConfig.webPortal,
        theme: finalConfig.visualStyle,
        db: finalConfig.databaseConnection
    }, null, 2)};\nexports.admin = ${JSON.stringify(finalConfig.administratorCredentials, null, 2)};`;

    await diskIO.writeFile('./config.js', outputContent, 'utf8');
    console.log('`config.js` written successfully.');

    const installViewsQuery = await acquirePromptInput("\nDeploy default views to database? (yes/no)", "yes");
    if (installViewsQuery.toLowerCase().charAt(0) === 'y') {
        await deployCouchViews(finalConfig);
    }

    const addExtraUserQuery = await acquirePromptInput("\nDo you wish to create an additional user account? (yes/no)", "yes");
    if (addExtraUserQuery.toLowerCase().charAt(0) === 'y') {
        const newAccount = {};
        newAccount.identity = await acquirePromptInput("New Username", "guest");
        newAccount.passphrase = await acquirePromptInput("New Passphrase", "guestpass");
        newAccount.contactInfo = await acquirePromptInput("New User Email", "guest@example.com");
        await registerExtraUser(finalConfig, newAccount);
    }

    console.log('\nInstallation complete! Please run `node server` to start your application.\n');
}

console.log("\n\
       _____             _                       \n\
      |     |___ _ _ ___| |_ ___ ___ ___ ___ ___ \n\
      |   --| . | | |  _|   | . |  _| -_|_ -|_ -|\n\
      |_____|___|___|___|_|_|  _|_| |___|___|___|\n\
                            |_|                  \n\
");

orchestrateInstallation().catch((problem) => {
    console.error(`\nAn error occurred during installation: ${problem.message}`);
    process.exit(1);
});