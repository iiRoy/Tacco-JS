const domOperations = {
    selectElement: (query) => document.querySelector(query),
    attachEvent: (targetElement, eventName, handlerFunction) => {
        if (targetElement) {
            targetElement.addEventListener(eventName, handlerFunction);
        }
    },
    alterElementContent: (oldElement, newMarkup) => {
        if (oldElement && oldElement.parentNode) {
            const temporaryContainer = document.createElement('div');
            temporaryContainer.innerHTML = newMarkup;
            oldElement.parentNode.replaceChild(temporaryContainer.firstChild, oldElement);
        }
    }
};

const cloudServiceGateway = {
    initiateAuthentication: (credentialConfig) => {
        return new Promise((resolve, reject) => {
            window.externalApiService.auth.authorize(credentialConfig, (authResult) => {
                if (authResult && !authResult.error) {
                    resolve(authResult);
                } else {
                    reject(authResult.error || new Error("Authentication process failed."));
                }
            });
        });
    },

    loadClientModule: (moduleIdentifier, moduleVersion) => {
        return new Promise((resolve, reject) => {
            window.externalApiService.client.load(moduleIdentifier, moduleVersion, () => {
                if (window.externalApiService.client[moduleIdentifier]) {
                    resolve();
                } else {
                    reject(new Error(`Failed to load module: ${moduleIdentifier}`));
                }
            });
        });
    },

    searchItemsByTitle: (searchTitle) => {
        return new Promise((resolve, reject) => {
            const searchRequest = window.externalApiService.client.drive.files.list({
                'q': `title='${searchTitle}'`
            });
            searchRequest.execute((responsePayload) => {
                if (responsePayload && responsePayload.items) {
                    resolve(responsePayload.items);
                } else {
                    reject(new Error("No items matching title or API error during search."));
                }
            });
        });
    },

    retrieveItemDetails: (uniqueResourceID) => {
        return new Promise((resolve, reject) => {
            console.log(`Querying details for ID: ${uniqueResourceID}`);
            const detailRequest = window.externalApiService.client.request({
                'path': `/drive/v2/files/${uniqueResourceID}`,
                'method': 'GET'
            });
            detailRequest.execute((responsePayload) => {
                if (responsePayload) {
                    resolve(responsePayload);
                } else {
                    reject(new Error("Failed to retrieve resource details."));
                }
            });
        });
    },

    downloadResourceContent: (contentAccessURL) => {
        return new Promise((resolve, reject) => {
            if (!contentAccessURL) {
                return reject(new Error("No content download URL provided."));
            }
            const currentAuthToken = window.externalApiService.auth.getToken().access_token;
            const httpAgent = new XMLHttpRequest();
            httpAgent.open('GET', contentAccessURL);
            httpAgent.setRequestHeader('Authorization', 'Bearer ' + currentAuthToken);
            httpAgent.onload = () => {
                if (httpAgent.status >= 200 && httpAgent.status < 300) {
                    resolve(httpAgent.responseText);
                } else {
                    reject(new Error(`HTTP status error ${httpAgent.status}: ${httpAgent.statusText}`));
                }
            };
            httpAgent.onerror = () => {
                reject(new Error("Network communication error during content download."));
            };
            httpAgent.send();
        });
    },

    uploadNewResource: (resourceInfo, textualContent) => {
        return new Promise((resolve, reject) => {
            const contentBoundary = '---DRIVEUPLOAD-' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
            const partSegment = "\r\n--" + contentBoundary + "\r\n";
            const closingSegment = "\r\n--" + contentBoundary + "--";

            const composedUploadPayload =
                partSegment +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(resourceInfo) +
                partSegment +
                'Content-Type: text/plain\r\n' +
                'Content-Transfer-Encoding: utf8\r\n' +
                '\r\n' +
                textualContent +
                closingSegment;

            const uploadOperation = window.externalApiService.client.request({
                'path': '/upload/drive/v2/files',
                'method': 'POST',
                'params': { 'uploadType': 'multipart' },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + contentBoundary + '"'
                },
                'body': composedUploadPayload
            });

            uploadOperation.execute((uploadResult) => {
                if (uploadResult && !uploadResult.error) {
                    resolve(uploadResult);
                } else {
                    reject(uploadResult.error || new Error("Resource upload operation failed."));
                }
            });
        });
    }
};

const mainApplicationFlow = async () => {
    const authInitiatorButton = domOperations.selectElement('#accessButton');
    const authSettings = { /* client_id: 'YOUR_CLIENT_ID', scope: 'https://www.googleapis.com/auth/drive', immediate: false */ };

    // Assuming 'externalApiService' (gapi) and 'textualContentEditor' (editor) are globally available
    if (typeof window.externalApiService === 'undefined') {
        console.error("External API Service (gapi) not found. Please ensure it is loaded correctly.");
        return;
    }
    if (typeof window.textualContentEditor === 'undefined') {
        console.error("Textual Content Editor (editor) not found. Please ensure it is initialized.");
        return;
    }

    domOperations.attachEvent(authInitiatorButton, 'click', async () => {
        try {
            await cloudServiceGateway.initiateAuthentication(authSettings);
            domOperations.alterElementContent(authInitiatorButton, "<span id='saveAction'>Save</span>|<span id='loadAction'>Load</span>|<span id='disconnectAction'>Disconnect</span>");

            const loadElement = domOperations.selectElement('#loadAction');
            const saveElement = domOperations.selectElement('#saveAction');

            domOperations.attachEvent(loadElement, 'click', async () => {
                const requestedFilename = prompt("Enter the file name to load:");
                if (!requestedFilename) return;

                try {
                    await cloudServiceGateway.loadClientModule('drive', 'v2');
                    const discoveredItems = await cloudServiceGateway.searchItemsByTitle(requestedFilename);

                    if (discoveredItems.length > 0) {
                        const primaryItem = discoveredItems[0];
                        console.info(`Discovered item: ${primaryItem.title} (ID: ${primaryItem.id}, Type: ${primaryItem.mimeType})`);

                        const itemMetadata = await cloudServiceGateway.retrieveItemDetails(primaryItem.id);
                        console.info(`Item Title: ${itemMetadata.title}`);
                        console.info(`Item Description: ${itemMetadata.description}`);
                        console.info(`Item MIME Type: ${itemMetadata.mimeType}`);

                        if (itemMetadata.downloadUrl) {
                            const fileData = await cloudServiceGateway.downloadResourceContent(itemMetadata.downloadUrl);
                            console.info("RECEIVED DATA (first 100 chars): " + fileData.substring(0, 100) + "...");
                            window.textualContentEditor.setValue(fileData);
                        } else {
                            alert("OPERATION FAILED: No download URL found for this resource.");
                        }
                    } else {
                        alert("OPERATION FAILED: Resource not located by the provided name.");
                    }
                } catch (error) {
                    console.error("Error during resource loading:", error);
                    alert("OPERATION FAILED during resource loading: " + (error.message || error));
                }
            });

            domOperations.attachEvent(saveElement, 'click', async () => {
                const currentEditorContent = window.textualContentEditor.getValue();
                const newFilename = prompt("Provide a name for the file to save:");
                if (!newFilename) return;

                const fileDescriptor = {
                    'title': newFilename,
                    'mimeType': "text/plain"
                };

                try {
                    await cloudServiceGateway.uploadNewResource(fileDescriptor, currentEditorContent);
                    alert("Resource successfully stored!");
                } catch (error) {
                    console.error("Error during resource storage:", error);
                    alert("OPERATION FAILED during resource storage: " + (error.message || error));
                }
            });

            const disconnectElement = domOperations.selectElement('#disconnectAction');
            domOperations.attachEvent(disconnectElement, 'click', () => {
                console.log("Disconnect action initiated.");
                alert("Disconnect functionality requires specific GAPI sign-out implementation.");
            });

        } catch (error) {
            console.error("Authentication process failed:", error);
            alert("AUTHENTICATION FAILED: " + (error.message || error));
        }
    });
};

// Mock global dependencies to allow the cloned code to be syntactically valid
// without requiring the actual GAPI or editor to be present for analysis.
// In a real environment, these would be the actual GAPI library and editor instance.
if (typeof window.externalApiService === 'undefined') {
    window.externalApiService = {
        auth: {
            authorize: (cfg, cb) => { console.log('Mock gapi.auth.authorize called'); cb({ access_token: 'mock_token' }); },
            getToken: () => ({ access_token: 'mock_token_123' })
        },
        client: {
            load: (mod, ver, cb) => {
                console.log(`Mock gapi.client.load(${mod}, ${ver}) called`);
                window.externalApiService.client[mod] = {
                    files: {
                        list: (params) => ({ execute: (listCb) => { console.log('Mock gapi.client.drive.files.list executed'); listCb({ items: [{ id: 'mock_file_id', title: 'Mock File', mimeType: 'text/plain' }] }); } })
                    }
                };
                cb();
            },
            request: (req) => ({
                execute: (reqCb) => {
                    console.log(`Mock gapi.client.request(${req.path}, ${req.method}) executed`);
                    if (req.path.includes('/drive/v2/files/')) {
                        reqCb({ title: 'Mock File', description: 'Mock description', mimeType: 'text/plain', downloadUrl: 'mock_download_url' });
                    } else if (req.path.includes('/upload/drive/v2/files')) {
                        reqCb({ id: 'new_mock_file_id', title: 'New Mock File' });
                    } else {
                        reqCb({});
                    }
                }
            })
        }
    };
}

if (typeof window.textualContentEditor === 'undefined') {
    window.textualContentEditor = {
        getValue: () => "Mock editor content.",
        setValue: (content) => console.log("Mock editor set value:", content.substring(0, Math.min(content.length, 100)) + (content.length > 100 ? "..." : ""))
    };
}


// Start the application flow
mainApplicationFlow();