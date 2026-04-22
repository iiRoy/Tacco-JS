import * as fs from 'node:fs/promises';
import { fileURLToPath as pathFromURL, pathToFileURL } from 'node:url';
import { dirname as getDir } from 'node:path';

import webApp from 'express';
import dbManager from 'mongoose';
import dataParser from 'body-parser';
import corsEnabler from 'cors';
import httpLogger from 'morgan';
import compressor from 'compression';

const currentPath = getDir(pathFromURL(import.meta.url));

class MissingResourceError extends Error {
    constructor(messagePayload) {
        super(messagePayload);
        this.name = 'MissingResourceError';
    }
}

async function startService() {
    let appConfig;
    try {
        const rawConfig = await fs.readFile(`${currentPath}/settings.json`, 'utf8');
        appConfig = JSON.parse(rawConfig);
    } catch (configError) {
        throw new Error(`Settings file 'settings.json' missing or malformed. Original error: ${configError.message}`);
    }

    const webService = webApp();

    webService.use(dataParser.json());
    webService.use(dataParser.urlencoded({ extended: true }));
    webService.use(corsEnabler());
    webService.use(compressor());

    webService.use(webApp.static(`${currentPath}/public_assets`));
    webService.set('page_templates', `${currentPath}/renderings`);

    if (appConfig.debugging_enabled) {
        webService.use((fault, reqObject, respObject, nextFunction) => {
            console.error("Application Fault (DEBUG MODE):", fault.stack);
            respObject.status(500).json({
                message: "An internal issue occurred.",
                details: fault.message,
                stack: fault.stack
            });
        });
    }

    if (appConfig.logging_active) {
        webService.use(httpLogger('dev'));
    }

    const moduleImporter = async (targetPath) => {
        try {
            const directoryContents = await fs.readdir(targetPath, { withFileTypes: true });
            for (const item of directoryContents) {
                if (item.isFile() && item.name.endsWith('.js')) {
                    const moduleFullPath = `${targetPath}/${item.name}`;
                    await import(pathToFileURL(moduleFullPath).href);
                }
            }
        } catch (readError) {
            console.error(`Failed to load modules from ${targetPath}:`, readError);
            throw readError;
        }
    };

    const dataStore = dbManager.createConnection(
        `mongodb://${appConfig.database.host}:${appConfig.database.port}/${appConfig.database.name}`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    );

    dataStore.on('error', (connectionError) => {
        console.error('Database connection problem:', connectionError);
        process.exit(1);
    });
    await new Promise((resolve, reject) => {
        dataStore.once('open', () => {
            console.log('Database connection established.');
            resolve();
        });
        dataStore.once('error', reject);
    });

    for (const modelPath of appConfig.resource_loaders.data_models) {
        await moduleImporter(modelPath);
    }
    for (const controllerPath of appConfig.resource_loaders.api_handlers) {
        await moduleImporter(controllerPath);
    }

    if (appConfig.resource_loaders.enable_default_api_endpoints) {
        const sendJsonPayload = (responseObject, statusCode, payloadContent) => {
            responseObject.header('Content-Type', 'application/json');
            responseObject.status(statusCode).json(payloadContent);
        };

        const buildQueryOptions = (requestParameters) => {
            const options = {};
            if (requestParameters.query_filter) {
                try {
                    options.filter = JSON.parse(requestParameters.query_filter);
                } catch (e) {
                    console.warn("Invalid query_filter JSON:", requestParameters.query_filter);
                    options.filter = {};
                }
            }
            if (requestParameters.sort_order) {
                try {
                    options.sort = JSON.parse(requestParameters.sort_order);
                } catch (e) {
                    console.warn("Invalid sort_order JSON:", requestParameters.sort_order);
                    if (typeof requestParameters.sort_order === 'string') {
                        const sortObj = {};
                        requestParameters.sort_order.split(',').forEach(s => {
                            s = s.trim();
                            if (s.startsWith('-')) {
                                sortObj[s.substring(1)] = -1;
                            } else {
                                sortObj[s] = 1;
                            }
                        });
                        options.sort = sortObj;
                    } else {
                        options.sort = {};
                    }
                }
            }
            if (requestParameters.result_limit) {
                options.limit = parseInt(requestParameters.result_limit, 10);
            }
            if (requestParameters.skip_count) {
                options.skip = parseInt(requestParameters.skip_count, 10);
            }
            return options;
        };

        const collectionAccessProvider = (collectionKey) => {
            return dataStore.model(collectionKey);
        };

        webService.get('/:collection_name', async (reqObject, respObject, nextRoute) => {
            try {
                const currentModel = collectionAccessProvider(reqObject.params.collection_name);
                const queryOptions = buildQueryOptions(reqObject.query);

                const foundRecords = await currentModel.find(queryOptions.filter || {}, null, queryOptions);
                const processedRecords = foundRecords.map(record => record.toObject());
                sendJsonPayload(respObject, 200, processedRecords);
            } catch (operationError) {
                nextRoute(operationError);
            }
        });

        webService.get('/:collection_name/:identifier', async (reqObject, respObject, nextRoute) => {
            try {
                const currentModel = collectionAccessProvider(reqObject.params.collection_name);
                const foundRecord = await currentModel.findById(reqObject.params.identifier);

                if (!foundRecord) {
                    nextRoute(new MissingResourceError(`Entry with ID ${reqObject.params.identifier} not found.`));
                } else {
                    sendJsonPayload(respObject, 200, foundRecord.toObject());
                }
            } catch (operationError) {
                nextRoute(operationError);
            }
        });

        const persistDocument = async (reqObject, respObject, nextRoute) => {
            try {
                const currentModel = collectionAccessProvider(reqObject.params.collection_name);
                const payloadData = reqObject.body[reqObject.params.collection_name];

                let targetDocument;
                if (reqObject.params.identifier) {
                    targetDocument = await currentModel.findById(reqObject.params.identifier);
                    if (!targetDocument) {
                        return nextRoute(new MissingResourceError(`Entry with ID ${reqObject.params.identifier} not found for update.`));
                    }
                    Object.assign(targetDocument, payloadData);
                } else {
                    targetDocument = new currentModel(payloadData);
                }

                const savedDocument = await targetDocument.save();
                sendJsonPayload(respObject, reqObject.params.identifier ? 200 : 201, savedDocument.toObject());
            } catch (operationError) {
                nextRoute(operationError);
            }
        };

        webService.post('/:collection_name', persistDocument);
        webService.put('/:collection_name', persistDocument);
        webService.post('/:collection_name/:identifier', persistDocument);
        webService.put('/:collection_name/:identifier', persistDocument);

        webService.delete('/:collection_name/:identifier', async (reqObject, respObject, nextRoute) => {
            try {
                const currentModel = collectionAccessProvider(reqObject.params.collection_name);
                const targetDocument = await currentModel.findById(reqObject.params.identifier);

                if (!targetDocument) {
                    nextRoute(new MissingResourceError(`Entry with ID ${reqObject.params.identifier} not found for deletion.`));
                } else {
                    await targetDocument.remove();
                    sendJsonPayload(respObject, 200, { message: 'Deletion successful.' });
                }
            } catch (operationError) {
                nextRoute(operationError);
            }
        });
    }

    webService.use((fault, reqObject, respObject, nextFunction) => {
        if (fault instanceof MissingResourceError) {
            respObject.status(404).json({ issue: 'Resource not available', message: fault.message });
        } else {
            console.error("Critical Application Issue:", fault.stack || fault);
            respObject.status(500).json({ issue: 'Internal system fault', message: 'An unexpected error occurred on the server.' });
        }
    });

    webService.listen(appConfig.network.port, () => {
        console.log(`Web service operating on port ${appConfig.network.port}`);
    });
}

startService().catch(err => {
    console.error("Failed to start service:", err);
    process.exit(1);
});