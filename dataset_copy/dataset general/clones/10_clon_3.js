window.assetModuleRegistry = {
    systemStatus: 'bootstrapping',
    moduleConfig: {
        dbName: 'scriptAssetCache',
        dbVersion: '1.1',
        dbDescription: 'Cached JavaScript modules for faster loading',
        dbSize: 2 * 1024 * 1024 // 2MB
    },
    activeManagers: {}
};

/**
 * Manages the caching and loading of JavaScript modules.
 * Utilizes WebSQL for persistent storage if available, otherwise falls back to direct script injection.
 */
class ModuleAssetManager {
    constructor() {
        const selfContext = this;
        selfContext.dbConnector = null;

        const isWebSQLSupported = typeof window.openDatabase !== 'undefined' && window.openDatabase !== null;

        if (isWebSQLSupported) {
            try {
                selfContext.dbConnector = window.openDatabase(
                    window.assetModuleRegistry.moduleConfig.dbName,
                    window.assetModuleRegistry.moduleConfig.dbVersion,
                    window.assetModuleRegistry.moduleConfig.dbDescription,
                    window.assetModuleRegistry.moduleConfig.dbSize
                );
            } catch (err) {
                console.error("ModuleAssetManager: Failed to initialize WebSQL database.", err);
                selfContext.dbConnector = null;
            }
        }

        const handleDbOperationFailure = (tx, error) => {
            console.warn(`ModuleAssetManager DB Error [Code: ${error.code || 'N/A'}]: ${error.message}`);
            return true;
        };

        const handleDbOperationSuccess = (tx, results) => {
            return true;
        };

        if (selfContext.dbConnector) {
            selfContext.dbConnector.transaction(tx => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS module_payloads (
                        entry_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        module_path TEXT NOT NULL UNIQUE,
                        module_version TEXT NOT NULL,
                        payload_content TEXT NOT NULL,
                        creation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    );`,
                    [],
                    handleDbOperationSuccess,
                    handleDbOperationFailure
                );
            }, handleDbOperationFailure, () => {
                // console.log("ModuleAssetManager: Database table 'module_payloads' ensured.");
            });
        }

        const appendDynamicScript = (sourcePath, completionCallback) => {
            const scriptNode = document.createElement("script");
            scriptNode.type = "text/javascript";
            scriptNode.async = true;

            if (completionCallback) {
                scriptNode.onload = () => {
                    completionCallback();
                };
                scriptNode.onreadystatechange = () => {
                    if (scriptNode.readyState === "loaded" || scriptNode.readyState === "complete") {
                        scriptNode.onreadystatechange = null;
                        completionCallback();
                    }
                };
                scriptNode.onerror = (error) => {
                    console.error(`ModuleAssetManager: Failed to load script from ${sourcePath}`, error);
                    completionCallback(new Error(`Script loading error for ${sourcePath}`));
                };
            }

            scriptNode.src = sourcePath;

            const targetHead = document.head || document.getElementsByTagName("head")[0];
            if (targetHead) {
                targetHead.appendChild(scriptNode);
            } else {
                console.error("ModuleAssetManager: Could not find document head to append script.");
                if (completionCallback) completionCallback(new Error("Document head not found"));
            }
        };

        const persistModuleContent = (modulePath, moduleVersion, moduleCode) => {
            if (!selfContext.dbConnector) return Promise.resolve(false);

            return new Promise((resolve, reject) => {
                selfContext.dbConnector.transaction(tx => {
                    tx.executeSql(
                        'INSERT OR REPLACE INTO module_payloads (module_path, module_version, payload_content) VALUES (?, ?, ?);',
                        [modulePath, moduleVersion, moduleCode],
                        () => resolve(true),
                        (tx, err) => {
                            handleDbOperationFailure(tx, err);
                            reject(err);
                        }
                    );
                });
            });
        };

        const interpretModulePayload = (codeString) => {
            try {
                (new Function(codeString)).call(window);
            } catch (e) {
                console.error("ModuleAssetManager: Error during module payload execution.", e);
            }
        };

        const retrieveAndCacheModule = (modulePath, moduleVersion) => {
            let fetchedCode = null;
            const xhrRequest = new XMLHttpRequest();
            xhrRequest.open('GET', modulePath, false); // Synchronous XHR as per original design
            try {
                xhrRequest.send(null);
                if (xhrRequest.status === 200) {
                    fetchedCode = xhrRequest.responseText;
                    persistModuleContent(modulePath, moduleVersion, fetchedCode)
                        .catch(err => console.warn(`ModuleAssetManager: Failed to cache module ${modulePath}`, err));
                } else {
                    console.error(`ModuleAssetManager: Failed to fetch module ${modulePath}. Status: ${xhrRequest.status}`);
                }
            } catch (e) {
                console.error(`ModuleAssetManager: XHR failed for ${modulePath}.`, e);
            }
            return fetchedCode;
        };

        const removeModuleEntries = (modulePath) => {
            if (!selfContext.dbConnector) return Promise.resolve(false);

            return new Promise((resolve, reject) => {
                selfContext.dbConnector.transaction(tx => {
                    tx.executeSql(
                        'DELETE FROM module_payloads WHERE module_path = ?;',
                        [modulePath],
                        () => resolve(true),
                        (tx, err) => {
                            handleDbOperationFailure(tx, err);
                            reject(err);
                        }
                    );
                });
            });
        };

        selfContext.bufferedCodeSegments = [];
        selfContext.modulesProcessedCount = 0;
        selfContext.totalModulesExpected = 0;

        const checkAndExecuteAggregatedPayload = () => {
            if (selfContext.modulesProcessedCount === selfContext.totalModulesExpected && selfContext.totalModulesExpected > 0) {
                const combinedCode = selfContext.bufferedCodeSegments.filter(Boolean).join('\n/* --- Module Separator --- */\n');
                if (combinedCode.trim().length > 0) {
                    interpretModulePayload(combinedCode);
                    selfContext.bufferedCodeSegments = [];
                    selfContext.modulesProcessedCount = 0;
                    selfContext.totalModulesExpected = 0;
                } else {
                    console.warn("ModuleAssetManager: No code to execute for aggregated payload.");
                }
            }
        };

        const processModuleRequest = (modulePath, moduleVersion, segmentIndex, totalSegments) => {
            selfContext.totalModulesExpected = totalSegments;

            if (!selfContext.dbConnector) {
                appendDynamicScript(modulePath, (error) => {
                    if (error) {
                        console.error(`ModuleAssetManager: Direct script injection failed for ${modulePath}`);
                    }
                    selfContext.modulesProcessedCount++;
                    checkAndExecuteAggregatedPayload();
                });
            } else {
                selfContext.dbConnector.transaction(tx => {
                    tx.executeSql(
                        'SELECT payload_content FROM module_payloads WHERE module_path = ? AND module_version = ?;',
                        [modulePath, moduleVersion],
                        (transaction, data) => {
                            let moduleContent = null;
                            if (data.rows.length > 0 && data.rows.item(0).payload_content) {
                                moduleContent = data.rows.item(0).payload_content;
                            }

                            if (moduleContent) {
                                selfContext.bufferedCodeSegments[segmentIndex] = moduleContent;
                                selfContext.modulesProcessedCount++;
                                checkAndExecuteAggregatedPayload();
                            } else {
                                removeModuleEntries(modulePath)
                                    .then(() => {
                                        const fetchedContent = retrieveAndCacheModule(modulePath, moduleVersion);
                                        if (fetchedContent) {
                                            selfContext.bufferedCodeSegments[segmentIndex] = fetchedContent;
                                            selfContext.modulesProcessedCount++;
                                            checkAndExecuteAggregatedPayload();
                                        } else {
                                            console.error(`ModuleAssetManager: Failed to retrieve or cache module: ${modulePath}`);
                                            selfContext.modulesProcessedCount++;
                                            checkAndExecuteAggregatedPayload();
                                        }
                                    })
                                    .catch(err => {
                                        console.error(`ModuleAssetManager: Error during module refresh for ${modulePath}`, err);
                                        selfContext.modulesProcessedCount++;
                                        checkAndExecuteAggregatedPayload();
                                    });
                            }
                        },
                        (tx, err) => {
                            handleDbOperationFailure(tx, err);
                            console.error(`ModuleAssetManager: DB query failed for ${modulePath}. Attempting direct fetch.`);
                            const fetchedContent = retrieveAndCacheModule(modulePath, moduleVersion);
                            if (fetchedContent) {
                                selfContext.bufferedCodeSegments[segmentIndex] = fetchedContent;
                            } else {
                                console.error(`ModuleAssetManager: Failed to retrieve module via direct fetch after DB error: ${modulePath}`);
                            }
                            selfContext.modulesProcessedCount++;
                            checkAndExecuteAggregatedPayload();
                        }
                    );
                });
            }
            return selfContext;
        };

        return {
            provisionAssets: (moduleList, loadConcurrently = false) => {
                if (!Array.isArray(moduleList) || moduleList.length === 0) {
                    console.warn("ModuleAssetManager: No modules provided for provisioning.");
                    return;
                }

                selfContext.bufferedCodeSegments = new Array(moduleList.length).fill(null);
                selfContext.modulesProcessedCount = 0;
                selfContext.totalModulesExpected = moduleList.length;

                const useDbForLoading = !!selfContext.dbConnector;
                const forceSequentialInjection = !useDbForLoading && !loadConcurrently;

                if (useDbForLoading || loadConcurrently) {
                    moduleList.forEach((moduleEntry, idx) => {
                        if (!Array.isArray(moduleEntry) || moduleEntry.length < 2) {
                            console.warn(`ModuleAssetManager: Invalid module entry at index ${idx}. Skipping.`, moduleEntry);
                            selfContext.modulesProcessedCount++;
                            checkAndExecuteAggregatedPayload();
                            return;
                        }
                        processModuleRequest(moduleEntry[0], moduleEntry[1], idx, moduleList.length);
                    });
                } else if (forceSequentialInjection) {
                    let currentModuleIndex = 0;
                    const loadNextModuleSequentially = (error) => {
                        if (error) console.error("ModuleAssetManager: Error in sequential loading, proceeding to next.", error);

                        if (currentModuleIndex < moduleList.length) {
                            const currentModuleEntry = moduleList[currentModuleIndex];
                            if (!Array.isArray(currentModuleEntry) || currentModuleEntry.length < 2) {
                                console.warn(`ModuleAssetManager: Invalid module entry at index ${currentModuleIndex}. Skipping.`, currentModuleEntry);
                                currentModuleIndex++;
                                loadNextModuleSequentially();
                                return;
                            }
                            appendDynamicScript(currentModuleEntry[0], loadNextModuleSequentially);
                            currentModuleIndex++;
                        } else {
                            console.log("ModuleAssetManager: All modules injected sequentially.");
                        }
                    };
                    loadNextModuleSequentially();
                }
            },

            provisionAsset: (modulePath, moduleVersion) => {
                if (typeof modulePath !== 'string' || typeof moduleVersion !== 'string') {
                    console.error("ModuleAssetManager: Invalid module path or version provided.");
                    return;
                }
                selfContext.bufferedCodeSegments = new Array(1).fill(null);
                selfContext.modulesProcessedCount = 0;
                selfContext.totalModulesExpected = 1;
                processModuleRequest(modulePath, moduleVersion, 0, 1);
            },

            invalidateCacheEntry: (modulePath) => {
                if (typeof modulePath !== 'string') {
                    console.error("ModuleAssetManager: Invalid module path for cache invalidation.");
                    return Promise.resolve(false);
                }
                return removeModuleEntries(modulePath);
            }
        };
    }
}

const allPageScripts = document.getElementsByTagName("script");
const currentScriptTag = allPageScripts[allPageScripts.length - 1];

if (currentScriptTag && currentScriptTag.innerHTML.trim()) {
    try {
        new Function(currentScriptTag.innerHTML).call(window);
    } catch (e) {
        console.error("Error executing inline script content from current tag:", e);
    }
}