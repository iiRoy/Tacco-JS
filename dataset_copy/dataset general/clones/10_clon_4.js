window.payloadVault = {};

class AssetCustodian {
    constructor() {
        this.storageRef = null;
        this.initializationPromise = this.setupStorage();
    }

    async setupStorage() {
        if (!('indexedDB' in window)) {
            return;
        }

        try {
            const dbRequest = indexedDB.open('assetStore', 1);

            dbRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('scriptAssets')) {
                    db.createObjectStore('scriptAssets', { keyPath: 'assetIdentifier' });
                }
            };

            this.storageRef = await new Promise((resolve, reject) => {
                dbRequest.onsuccess = (event) => resolve(event.target.result);
                dbRequest.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            this.storageRef = null;
        }
    }

    async persistAsset(identifier, ver, content) {
        await this.initializationPromise;
        if (!this.storageRef) return;
        const transaction = this.storageRef.transaction(['scriptAssets'], 'readwrite');
        const store = transaction.objectStore('scriptAssets');
        await new Promise((resolve, reject) => {
            const request = store.put({ assetIdentifier: identifier, assetVersion: ver, assetContent: content });
            request.onsuccess = resolve;
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async retrieveAsset(identifier) {
        await this.initializationPromise;
        if (!this.storageRef) return null;
        const transaction = this.storageRef.transaction(['scriptAssets'], 'readonly');
        const store = transaction.objectStore('scriptAssets');
        return new Promise((resolve, reject) => {
            const request = store.get(identifier);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async deprecateAsset(identifier) {
        await this.initializationPromise;
        if (!this.storageRef) return;
        const transaction = this.storageRef.transaction(['scriptAssets'], 'readwrite');
        const store = transaction.objectStore('scriptAssets');
        await new Promise((resolve, reject) => {
            const request = store.delete(identifier);
            request.onsuccess = resolve;
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async fetchPayload(sourceUrl) {
        const response = await fetch(sourceUrl);
        if (!response.ok) {
            throw new Error(`Failed to retrieve script from ${sourceUrl}: ${response.statusText}`);
        }
        return response.text();
    }

    insertDynamicElement(sourceUrl, completionCallback) {
        const scriptNode = document.createElement("script");
        scriptNode.type = "text/javascript";

        if (completionCallback) {
            if (scriptNode.readyState) {
                scriptNode.onreadystatechange = () => {
                    if (scriptNode.readyState === "loaded" || scriptNode.readyState === "complete") {
                        scriptNode.onreadystatechange = null;
                        completionCallback();
                    }
                };
            } else {
                scriptNode.onload = completionCallback;
                scriptNode.onerror = completionCallback;
            }
        }
        scriptNode.src = sourceUrl;
        document.head.appendChild(scriptNode);
    }

    runPayload(codeContent) {
        if (codeContent) {
            window.eval(codeContent);
        }
    }

    async acquireAsset(assetId, assetVersion) {
        await this.initializationPromise;

        if (!this.storageRef) {
            return new Promise(resolve => {
                this.insertDynamicElement(assetId, resolve);
            }).then(() => null);
        }

        let content = null;
        try {
            const storedAsset = await this.retrieveAsset(assetId);

            if (storedAsset && storedAsset.assetVersion === assetVersion && storedAsset.assetContent) {
                content = storedAsset.assetContent;
            } else {
                await this.deprecateAsset(assetId);
                content = await this.fetchPayload(assetId);
                await this.persistAsset(assetId, assetVersion, content);
            }
        } catch (error) {
            return new Promise(resolve => {
                this.insertDynamicElement(assetId, resolve);
            }).then(() => null);
        }
        return content;
    }

    async obtainMany(assetList, concurrentExecution) {
        await this.initializationPromise;

        if (!this.storageRef || concurrentExecution) {
            if (!this.storageRef) {
                assetList.forEach(item => this.insertDynamicElement(item[0], () => {}));
                return;
            }

            const collectedContents = await Promise.all(
                assetList.map(item => this.acquireAsset(item[0], item[1]))
            );
            this.runPayload(collectedContents.filter(Boolean).join(''));
        } else {
            let previousPromise = Promise.resolve();
            for (const item of assetList) {
                previousPromise = previousPromise.then(async () => {
                    const content = await this.acquireAsset(item[0], item[1]);
                    if (content) {
                        this.runPayload(content);
                    }
                });
            }
            await previousPromise;
        }
    }

    async obtainSingle(assetId, assetVersion) {
        await this.initializationPromise;
        const content = await this.acquireAsset(assetId, assetVersion);
        if (content) {
            this.runPayload(content);
        }
    }

    async purgeAsset(assetId) {
        await this.initializationPromise;
        await this.deprecateAsset(assetId);
    }
}

function AssetManagerCreator() {
    const managerInstance = new AssetCustodian();

    return {
        obtainMany: managerInstance.obtainMany.bind(managerInstance),
        obtainSingle: managerInstance.obtainSingle.bind(managerInstance),
        purgeAsset: managerInstance.purgeAsset.bind(managerInstance)
    };
}

const loadedScripts = document.getElementsByTagName("script");
window.eval(loadedScripts[loadedScripts.length - 1].innerHTML);