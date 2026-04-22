const utilAccess = require('util');
const fileHandle = require('fs');
const operatingSystem = require('os');
const pathUtility = require('path');
const lineInterface = require('readline');
const webServer = require('http');
const URLParser = require('url');

const movesConnector = require('moves-api').MovesApi;
const dateManipulation = require('date-fns');

const appSettingsLocation = pathUtility.join(operatingSystem.homedir(), '.data_transfer_agent.json');
const defaultSettingsSource = pathUtility.join(__dirname, '../config.sample.json');
const standardDateFormat = 'yyyyMMdd';

const outputBanner = () => {
    console.log('Welcome to Data Transfer Agent, your Moves.app data exporter!');
    console.log('------------------------------------------------------------');
    console.log('');
};

const terminateExecution = (code) => {
    process.exit(code);
};

const fileSystemOperations = {
    checkExistence: (filePath) => fileHandle.existsSync(filePath),
    readTextContent: (filePath, encoding = 'utf8') => fileHandle.readFileSync(filePath, encoding),
    writeTextContent: (filePath, content, encoding = 'utf8') => fileHandle.writeFileSync(filePath, content, encoding),
    copyViaStreams: (sourcePath, destinationPath) => {
        return new Promise((resolve, reject) => {
            const reader = fileHandle.createReadStream(sourcePath);
            const writer = fileHandle.createWriteStream(destinationPath);
            reader.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
            reader.on('error', reject);
        });
    },
    listDirectoryItems: (directoryPath) => fileHandle.readdirSync(directoryPath),
    loadModuleSafely: (modulePath) => require(modulePath)
};

const configurationManager = (() => {
    let internalConfig = {};
    const configKeySeparator = ':';

    const accessNested = (obj, pathParts) => {
        let current = obj;
        for (const part of pathParts) {
            if (typeof current !== 'object' || current === null || !current.hasOwnProperty(part)) {
                return undefined;
            }
            current = current[part];
        }
        return current;
    };

    const assignNested = (obj, pathParts, value) => {
        let current = obj;
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (typeof current[part] !== 'object' || current[part] === null) {
                current[part] = {};
            }
            current = current[part];
        }
        current[pathParts[pathParts.length - 1]] = value;
    };

    return {
        loadSettings: () => {
            if (fileSystemOperations.checkExistence(appSettingsLocation)) {
                try {
                    internalConfig = JSON.parse(fileSystemOperations.readTextContent(appSettingsLocation));
                } catch (e) {
                    console.error('Error parsing configuration file:', e.message);
                    terminateExecution(1);
                }
            } else {
                internalConfig = {};
            }
        },
        saveSettings: async () => {
            try {
                await fileSystemOperations.writeTextContent(appSettingsLocation, JSON.stringify(internalConfig, null, 2));
            } catch (e) {
                console.error('Error saving configuration:', e.message);
                terminateExecution(1);
            }
        },
        getValue: (keyPath) => {
            const parts = keyPath.split(configKeySeparator);
            return accessNested(internalConfig, parts);
        },
        setValue: (keyPath, value) => {
            const parts = keyPath.split(configKeySeparator);
            assignNested(internalConfig, parts, value);
        },
        getAll: () => ({ ...internalConfig })
    };
})();

const dateProcessor = {
    parseDateString: (dateStr) => dateManipulation.parse(dateStr, standardDateFormat, new Date()),
    formatDateToString: (dateObj) => dateManipulation.format(dateObj, standardDateFormat),
    addDaysToDate: (dateObj, days) => dateManipulation.addDays(dateObj, days),
    subtractDaysFromDate: (dateObj, days) => dateManipulation.subDays(dateObj, days),
    getDaysDifference: (date1, date2) => dateManipulation.differenceInCalendarDays(date2, date1), // date-fns is (dateLeft, dateRight)
    getToday: () => new Date(),
    getYesterday: () => dateManipulation.subDays(new Date(), 1)
};

const argumentHandler = (() => {
    const parse = (args) => {
        const parsed = {
            command: null,
            parameters: {}
        };
        let i = 0;
        while (i < args.length) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                const key = arg.substring(2);
                const nextArg = args[i + 1];
                if (nextArg && !nextArg.startsWith('--') && !nextArg.startsWith('-')) {
                    parsed.parameters[key] = nextArg;
                    i += 2;
                } else {
                    parsed.parameters[key] = true;
                    i += 1;
                }
            } else {
                if (!parsed.command) {
                    parsed.command = arg;
                }
                i += 1;
            }
        }
        return parsed;
    };

    return {
        interpretArguments: () => parse(process.argv.slice(2))
    };
})();

const interactivePrompt = {
    gatherInput: async (questions) => {
        const io = lineInterface.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        });

        const results = {};
        for (const q of questions) {
            await new Promise(resolve => {
                io.question(`${q}: `, (answer) => {
                    results[q] = answer;
                    resolve();
                });
            });
        }
        io.close();
        return results;
    }
};

class MovesGateway {
    constructor(config) {
        if (!config || !config.clientId || !config.clientSecret || !config.redirectUri) {
            console.error('MovesGateway: Missing essential configuration for Moves API.');
            terminateExecution(1);
        }
        this.client = new movesConnector(config);
    }

    async getProfileData() {
        return utilAccess.promisify(this.client.getProfile).call(this.client);
    }

    async getStorylineData(params) {
        return utilAccess.promisify(this.client.getStoryline).call(this.client, params);
    }

    generateAuthenticationURL() {
        return this.client.generateAuthUrl();
    }

    async exchangeAuthCodeForToken(code) {
        return utilAccess.promisify(this.client.getAccessToken).call(this.client, code);
    }
}

const authenticationService = {
    startOAuthFlow: (movesConfig) => {
        return new Promise((resolve, reject) => {
            const movesClient = new movesConnector(movesConfig);

            let serverInstance;
            const requestListener = (req, res) => {
                const parsedUrl = URLParser.parse(req.url, true);

                if (parsedUrl.pathname === '/') {
                    res.writeHead(302, { 'Location': movesClient.generateAuthUrl() });
                    res.end();
                } else if (parsedUrl.pathname === '/auth') {
                    if (parsedUrl.query.error) {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end(`Authentication Error: ${parsedUrl.query.error}`);
                        serverInstance.close(() => reject(new Error(parsedUrl.query.error)));
                        return;
                    }

                    movesClient.getAccessToken(parsedUrl.query.code, (err, accessToken) => {
                        if (err) {
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end(`Error obtaining token: ${err.message}`);
                            serverInstance.close(() => reject(err));
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('Authentication successful! You can close this window and return to your terminal.');
                        serverInstance.close(() => resolve(accessToken));
                    });
                } else {
                    res.writeHead(404);
                    res.end('Not Found');
                }
            };

            serverInstance = webServer.createServer(requestListener);
            serverInstance.listen(3000, () => {
                console.log('Temporary authentication server listening on http://localhost:3000');
            });

            serverInstance.on('error', (e) => {
                console.error('Authentication server error:', e.message);
                reject(e);
            });
        });
    }
};

const applicationOperations = {
    performInitialSetup: async () => {
        outputBanner();
        console.log('> Hello there. Just let me check if you already have a config.');

        if (fileSystemOperations.checkExistence(appSettingsLocation)) {
            console.log('> Found an existing configuration file. To re-initialize, please remove it first.');
            console.log('> Located at: ' + appSettingsLocation);
            terminateExecution(1);
        }

        try {
            await fileSystemOperations.copyViaStreams(defaultSettingsSource, appSettingsLocation);
            configurationManager.loadSettings();
        } catch (e) {
            console.error('Failed to copy or load initial configuration:', e.message);
            terminateExecution(1);
        }

        console.log('> Noo, okay. I created an empty one for you.');
        console.log('> I will walk you through the configuration process.');
        console.log('');
        console.log('> First of all we need to create a Moves API Client. Please go to this URL and follow the instructions to create a new app.');
        console.log('');
        console.log('https://dev.moves-app.com/apps');
        console.log('');
        console.log('> (Please use "http://localhost:3000/auth" when asked for a "Redirect URI")');
        console.log('');
        console.log('> After creating your app, please enter your credentials:');
        console.log('');

        try {
            const { clientId, clientSecret } = await interactivePrompt.gatherInput(['clientId', 'clientSecret']);
            configurationManager.setValue('moves:clientId', clientId);
            configurationManager.setValue('moves:clientSecret', clientSecret);
            configurationManager.setValue('moves:redirectUri', 'http://localhost:3000/auth');

            console.log('');
            console.log('> Okay, my friend. Step one completed. Now we need to create an access token.');
            console.log('> Point your web browser to this URL and follow the instructions:');
            console.log('');
            console.log('http://localhost:3000/');
            console.log('');

            const obtainedToken = await authenticationService.startOAuthFlow(configurationManager.getValue('moves'));
            console.log('> Good work, seems like we managed to get an access token. I will save this for you.');
            configurationManager.setValue('moves:accessToken', obtainedToken);
            await configurationManager.saveSettings();

            console.log('');
            console.log('> Saved! Now I am ready to export all your data, I guess.');
            terminateExecution(0);

        } catch (error) {
            console.error('Configuration process failed:', error.message || error);
            terminateExecution(1);
        }
    },

    displayUserInformation: async () => {
        configurationManager.loadSettings();
        if (!configurationManager.getValue('moves')) {
            console.log('> Your configuration file appears to be corrupted or incomplete.');
            terminateExecution(1);
        }
        outputBanner();

        try {
            const movesGateway = new MovesGateway(configurationManager.getValue('moves'));
            const userInfo = await movesGateway.getProfileData();

            console.log('> Your profile information:');
            console.log('  userIdentifier: ', userInfo.userId);
            console.log('  startingDay: ', dateProcessor.formatDateToString(dateProcessor.parseDateString(userInfo.profile.firstDate)));
        } catch (error) {
            console.log('> AN ISSUE OCCURRED WITH YOUR PROFILE RETRIEVAL:');
            console.log('> ' + error.message || error);
            terminateExecution(1);
        }
    },

    initiateDataTransfer: async () => {
        configurationManager.loadSettings();
        if (!configurationManager.getValue('moves')) {
            console.log('> Your configuration file appears to be corrupted or incomplete.');
            terminateExecution(1);
        }
        outputBanner();

        const cliArgs = argumentHandler.interpretArguments();
        let activeExportModule = null;
        let exportPeriod = { begin: null, end: null };

        const processParamsForExport = (currentModule, currentPeriod, params) => {
            let updatedModule = currentModule;
            let updatedPeriod = { ...currentPeriod };

            if (params.destination) {
                const moduleFilename = pathUtility.join(__dirname, 'output', `${params.destination}.js`);
                if (!fileSystemOperations.checkExistence(moduleFilename)) {
                    console.log(`> Export module "${params.destination}" not found.`);
                    terminateExecution(1);
                }
                const moduleContent = fileSystemOperations.loadModuleSafely(moduleFilename);
                updatedModule = new moduleContent.PluggedInModule(params);
            }

            if (params.dayStart) {
                updatedPeriod.begin = dateProcessor.parseDateString(params.dayStart.toString());
            }
            if (params.dayEnd) {
                updatedPeriod.end = dateProcessor.parseDateString(params.dayEnd.toString());
            }
            if (params.duration) {
                const numDays = parseInt(params.duration, 10);
                if (isNaN(numDays)) {
                    console.log('> Invalid number of days specified for --duration.');
                    terminateExecution(1);
                }
                updatedPeriod.end = dateProcessor.getToday();
                updatedPeriod.begin = dateProcessor.subtractDaysFromDate(updatedPeriod.end, numDays);
            }
            if (params.previousDay) {
                updatedPeriod.end = dateProcessor.getYesterday();
                updatedPeriod.begin = dateProcessor.subtractDaysFromDate(updatedPeriod.end, 1);
            }
            return { module: updatedModule, period: updatedPeriod };
        };

        let resultFromDefaults = processParamsForExport(activeExportModule, exportPeriod, configurationManager.getValue('defaults') || {});
        activeExportModule = resultFromDefaults.module;
        exportPeriod = resultFromDefaults.period;

        let resultFromCli = processParamsForExport(activeExportModule, exportPeriod, cliArgs.parameters);
        activeExportModule = resultFromCli.module;
        exportPeriod = resultFromCli.period;

        if (!exportPeriod.begin || !exportPeriod.end || !activeExportModule) {
            console.log('> No valid date range or export module specified.');
            terminateExecution(1);
        }

        const totalExportDays = dateProcessor.getDaysDifference(exportPeriod.begin, exportPeriod.end);
        if (totalExportDays < 0) {
            console.log('> The end date must be after or on the same day as the start date.');
            terminateExecution(1);
        }

        console.log(`> Utilizing ${activeExportModule.meta.title} to transfer data for ${totalExportDays} days!`);
        console.log('');

        const movesGateway = new MovesGateway(configurationManager.getValue('moves'));

        for (let i = 0; i <= totalExportDays; i++) { // Include the end day
            const currentDay = dateProcessor.addDaysToDate(exportPeriod.begin, i);
            const dayIdentifier = dateProcessor.formatDateToString(currentDay);

            try {
                const storylineData = await movesGateway.getStorylineData({ from: dayIdentifier, trackPoints: true });
                if (storylineData && storylineData.length > 0) {
                    await activeExportModule.processDayData(storylineData[0]);
                    console.log(`> Transferred data for ${dayIdentifier}`);
                } else {
                    console.log(`> No storyline data for ${dayIdentifier}, skipping.`);
                }
            } catch (error) {
                console.log(`! Error during data transfer for ${dayIdentifier}: ${error.message || error}`);
            }
        }
        console.log('');
        console.log('> Data transfer complete!');
        terminateExecution(0);
    },

    presentAssistance: async () => {
        outputBanner();

        console.log('Operations:');
        console.log('  setup - Configure your application');
        console.log('  userinfo - Display current user details');
        console.log('  transfer - Begin data export!');
        console.log('  help - Show this assistance guide');
        console.log('');

        console.log('Parameters:');
        console.log('  --destination [Exporter] - Specify the export module');
        console.log('  --dayStart [' + standardDateFormat + '] - Initial day for export');
        console.log('  --dayEnd [' + standardDateFormat + '] - Final day for export');
        console.log('');
        console.log('  --duration [n] - Export the most recent n days');
        console.log('  --previousDay - Export the day before today');
        console.log('');

        console.log('Available data exporters:');

        const describeExportModule = async (modulePath) => {
            try {
                const moduleContent = fileSystemOperations.loadModuleSafely(modulePath);
                const exporterInstance = new moduleContent.PluggedInModule();
                if (!exporterInstance.meta) {
                    return;
                }

                console.log(`  ${exporterInstance.meta.title}: ${exporterInstance.meta.summary}`);
                for (const key in exporterInstance.meta.configOptions) {
                    console.log(`    --${key} ${exporterInstance.meta.configOptions[key]}`);
                }
                console.log('');
            } catch (e) {
                console.error(`Error loading export module for help: ${modulePath}: ${e.message}`);
            }
        };

        const exporterDirectory = pathUtility.join(__dirname, 'output');
        const exporterFiles = fileSystemOperations.listDirectoryItems(exporterDirectory);

        for (const file of exporterFiles) {
            if (file.endsWith('.js')) {
                await describeExportModule(pathUtility.join(exporterDirectory, file));
            }
        }

        terminateExecution(0);
    }
};

const mainProgramEntry = async () => {
    const cliCommand = argumentHandler.interpretArguments();

    switch (cliCommand.command) {
        case 'setup':
            await applicationOperations.performInitialSetup();
            break;
        case 'userinfo':
            await applicationOperations.displayUserInformation();
            break;
        case 'transfer':
            await applicationOperations.initiateDataTransfer();
            break;
        case 'help':
            await applicationOperations.presentAssistance();
            break;
        default:
            console.log('Unknown command. Use "help" for available commands.');
            await applicationOperations.presentAssistance();
            break;
    }
};

mainProgramEntry();