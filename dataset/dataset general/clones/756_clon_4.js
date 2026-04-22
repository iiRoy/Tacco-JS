const queryElement = (selector) => document.querySelector(selector);
const queryAllElements = (selector) => document.querySelectorAll(selector);
const createElement = (tagName, attributes = {}, children = []) => {
    const el = document.createElement(tagName);
    for (const key in attributes) {
        if (key === 'className') {
            el.className = attributes[key];
        } else if (key === 'dataset') {
            for (const dataKey in attributes[key]) {
                el.dataset[dataKey] = attributes[key][dataKey];
            }
        } else {
            el.setAttribute(key, attributes[key]);
        }
    }
    children.forEach(child => {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else {
            el.appendChild(child);
        }
    });
    return el;
};

const extractFormValues = (formElement) => {
    const data = {};
    new FormData(formElement).forEach((value, key) => {
        data[key] = value;
    });
    return data;
};

const attachDelegatedEvent = (parentSelector, eventType, childSelector, handler) => {
    queryElement(parentSelector).addEventListener(eventType, (evt) => {
        const target = evt.target.closest(childSelector);
        if (target && queryElement(parentSelector).contains(target)) {
            handler.call(target, evt);
        }
    });
};

const debugOutput = (...args) => console.log("[DEBUG]", ...args);
const displayUserAlert = (message) => alert(message);

let applicationSettings = {
    dataStoreHandle: null,
    templateEngine: null,
    currentUserProfile: null,
    systemMetadata: {
        lastChangeSequence: 0
    },
    serviceEndpoints: {
        remoteSynchronization: "http://demo.mobile.couchbase.com/todolite",
        identityServer: "http://example.com/server"
    },
    socialAuthDetails: {
        applicationId: "501518809925546",
        redirectionUrl: 'http://console.couchbasecloud.com/index/',
        permissionScope: 'email'
    }
};

const dataStoreIdentifier = "todo";

const templateRenderer = {
    renderMainDashboard: () => `
        <div class="header">
            <h1>All Lists</h1>
            <button class="auth-control"></button>
        </div>
        <form class="new-list-form">
            <input type="text" name="listName" placeholder="New List Name" />
            <button type="submit">Add List</button>
        </form>
        <ul id="scrollable" class="list-container"></ul>
    `,
    renderDashboardList: (viewData) => `
        ${viewData.rows.map(row => `
            <li data-id="${row.id}" class="${row.doc.owner === applicationSettings.currentUserProfile?.userId ? 'owned' : 'shared'}">
                ${row.doc.title}
                <button style="display:none;" class="delete-button">Delete</button>
            </li>
        `).join('')}
    `,
    renderCollectionDetails: (collectionDocument) => `
        <div class="header">
            <button class="back-to-index">&lt; All Lists</button>
            <h1>${collectionDocument.title}</h1>
            <button class="share-collection">Share</button>
        </div>
        <form class="new-task-form">
            <input type="text" name="taskDescription" placeholder="New Task" />
            <button type="submit">Add Task</button>
        </form>
        <ul id="scrollable" class="task-list"></ul>
    `,
    renderCollectionItems: (viewData) => `
        ${viewData.rows.map(row => `
            <li data-id="${row.id}" class="${row.doc.completed ? 'completed' : ''}">
                <span class="task-description">${row.doc.description}</span>
                <button class="camera ${row.doc._attachments?.image ? 'image' : ''}"></button>
                <button style="display:none;" class="delete-button">Delete</button>
            </li>
        `).join('')}
    `,
    renderImageView: (imageDocument) => `
        <div class="header">
            <button class="back-to-list">&lt; Back</button>
            <h1>Image</h1>
            <button class="delete-image">Delete</button>
        </div>
        <img src="${imageDocument.imagePath}" alt="Task Image" class="full-image"/>
    `,
    renderSharingOptions: (viewData) => `
        <div class="header">
            <button class="back-to-list">&lt; Back</button>
            <h1>Share: ${viewData.title}</h1>
        </div>
        <ul id="scrollable" class="profile-list">
            ${viewData.rows.map(row => `
                <li data-id="${row.id}" class="${row.checked ? 'selected' : ''} ${row.id === viewData.ownerId ? 'owner' : ''}">
                    ${row.value.name} ${row.id === viewData.ownerId ? '(Owner)' : ''}
                </li>
            `).join('')}
        </ul>
    `
};
applicationSettings.templateEngine = templateRenderer;

const displayContentRegion = (htmlContent) => {
    window.scrollTo(0, 0);
    queryElement("#content").innerHTML = htmlContent;
};

const reportAuthenticationFailure = (issue) => {
    if (issue.reason) {
        displayUserAlert(`Authentication failed: ${issue.reason}`);
    } else {
        displayUserAlert(`Login error: ${JSON.stringify(issue)}`);
    }
};

const reportLogoutIssue = (issue) => {
    if (issue.reason) {
        displayUserAlert(`Logout failed: ${issue.reason}`);
    } else {
        displayUserAlert(`Logout error: ${JSON.stringify(issue)}`);
    }
};

const dataStoreFacade = {
    listenForChanges: async (sinceSeq, callback) => {
        debugOutput("Establishing change listener from sequence:", sinceSeq);
        try {
            const changesFeed = applicationSettings.dataStoreHandle.changes({ since: sinceSeq });
            changesFeed.on('change', (change) => {
                debugOutput("Received DB change:", change);
                applicationSettings.systemMetadata.lastChangeSequence = change.seq;
                callback(null, change);
            });
            changesFeed.on('error', (err) => {
                debugOutput("DB changes error:", err);
                callback(err);
            });
            return changesFeed;
        } catch (error) {
            debugOutput("Error setting up change listener:", error);
            callback(error);
            return null;
        }
    },
    retrieveDocument: async (docId) => {
        debugOutput("Retrieving document:", docId);
        return await applicationSettings.dataStoreHandle.get(docId);
    },
    storeDocument: async (doc) => {
        debugOutput("Storing document:", doc);
        return await applicationSettings.dataStoreHandle.post(doc);
    },
    updateDocument: async (docId, doc) => {
        debugOutput("Updating document:", docId, doc);
        return await applicationSettings.dataStoreHandle.put(docId, doc);
    },
    queryView: async (viewName, options) => {
        debugOutput("Querying view:", viewName, options);
        return await applicationSettings.dataStoreHandle.views(viewName, options);
    },
    bulkUpdate: async (documents) => {
        debugOutput("Performing bulk update:", documents);
        return await applicationSettings.dataStoreHandle.post("_bulk_docs", { docs: documents });
    }
};

let currentViewUpdateHandler = () => {};

const establishDataMonitor = async () => {
    if (applicationSettings.dataStoreHandle.currentChangesFeed) {
        applicationSettings.dataStoreHandle.currentChangesFeed.cancel();
    }

    const changesFeed = await dataStoreFacade.listenForChanges(
        applicationSettings.systemMetadata.lastChangeSequence,
        (err, change) => {
            if (err) {
                debugOutput("Error in data monitor:", err);
                return;
            }
            debugOutput("Data monitor triggered, calling update handler.");
            currentViewUpdateHandler();
        }
    );
    applicationSettings.dataStoreHandle.currentChangesFeed = changesFeed;
};

const initiateAppSetup = async (callback) => {
    try {
        applicationSettings.dataStoreHandle = {
            changes: (options) => {
                debugOutput("Mock DB changes called with options:", options);
                const emitter = new EventTarget();
                return {
                    on: (event, handler) => emitter.addEventListener(event, handler),
                    cancel: () => debugOutput("Mock changes feed cancelled")
                };
            },
            get: async (id) => { debugOutput("Mock DB get:", id); return { _id: id, title: "Mock Item", description: "Mock Task" }; },
            post: async (doc) => { debugOutput("Mock DB post:", doc); return { ok: true, id: doc._id || `new-doc-${Date.now()}` }; },
            put: async (id, doc) => { debugOutput("Mock DB put:", id, doc); return { ok: true, id: id }; },
            views: async (view, options) => {
                debugOutput("Mock DB views:", view, options);
                if (view[0] === "lists") {
                    return { rows: [{ id: "list1", key: "list1", doc: { _id: "list1", type: "list", title: "My First List", owner: "p:user1" } }] };
                } else if (view[0] === "tasks") {
                    return { rows: [{ id: "task1", key: ["list1", "task1"], doc: { _id: "task1", type: "task", description: "Buy milk", list_id: "list1", completed: false } }] };
                } else if (view === "profiles") {
                    return { rows: [{ id: "p:user1", key: "p:user1", value: { name: "User One" } }] };
                }
                return { rows: [] };
            },
            replicate: {
                to: (remote, options) => {
                    debugOutput("Mock DB replicate.to called:", remote, options);
                    const emitter = new EventTarget();
                    // Simulate replication events
                    setTimeout(() => emitter.dispatchEvent(new CustomEvent('change', { detail: { ok: true, docs_written: 1 } })), 500);
                    setTimeout(() => emitter.dispatchEvent(new CustomEvent('paused', { detail: null })), 1000);
                    return {
                        on: (event, handler) => {
                            emitter.addEventListener(event, (e) => handler(e.detail));
                            return this;
                        }
                    };
                }
            },
            paxUrl: (docId, attachmentName) => `/db/${docId}/${attachmentName}`
        };

        applicationSettings.setUser = (userData, cb) => {
            applicationSettings.currentUserProfile = {
                email: userData.email,
                userId: userData.id,
                accessToken: userData.access_token,
                name: userData.name
            };
            cb(null, true);
        };

        callback(null);
    } catch (err) {
        callback(err);
    }
};

const initializeApplication = async () => {
    await new Promise(resolve => new rapidClick.RapidClick(document.body, resolve));
    await initiateAppSetup(async (err) => {
        if (err) {
            displayUserAlert(err.message || JSON.stringify(err));
            return debugOutput("App setup error:", err);
        }
        await establishDataMonitor();
        await presentMainDashboard();
        await beginDataSynchronization();
    });
};

const presentMainDashboard = async () => {
    displayContentRegion(applicationSettings.templateEngine.renderMainDashboard());

    const authButton = queryElement(".auth-control");
    if (!applicationSettings.currentUserProfile) {
        authButton.textContent = "Sign In";
        authButton.style.display = 'block';
        authButton.onclick = async () => {
            const authResult = await performInitialAuthentication();
            if (authResult.error) {
                reportAuthenticationFailure(authResult.error);
            } else {
                await presentMainDashboard();
            }
        };
    } else {
        authButton.textContent = `Sign Out (${applicationSettings.currentUserProfile.name})`;
        authButton.style.display = 'block';
        authButton.onclick = async () => {
            const logoutResult = await signOutFromSocialNetwork(applicationSettings.currentUserProfile.accessToken);
            if (logoutResult.error) {
                reportLogoutIssue(logoutResult.error);
            } else {
                displayUserAlert("You are now logged out!");
                applicationSettings.currentUserProfile = null;
                await presentMainDashboard();
            }
        };
    }

    queryElement(".new-list-form").addEventListener("submit", async (evt) => {
        evt.preventDefault();
        const newDocData = extractFormValues(evt.target);
        const listDocument = {
            type: "list",
            title: newDocData.listName,
            createdAt: new Date().toISOString()
        };
        if (applicationSettings.currentUserProfile?.userId) {
            listDocument.owner = `p:${applicationSettings.currentUserProfile.userId}`;
        }
        await dataStoreFacade.storeDocument(listDocument);
        evt.target.reset();
    });

    attachDelegatedEvent("#scrollable", "click", "li", function (evt) {
        const itemId = this.dataset.id;
        viewSpecificCollection(itemId);
    });

    attachDelegatedEvent("#scrollable", "swiperight", "li", function (evt) {
        const itemId = this.dataset.id;
        const deleteBtn = this.querySelector(".delete-button");
        if (deleteBtn) {
            deleteBtn.style.display = 'block';
            deleteBtn.onclick = async (deleteEvt) => {
                deleteEvt.stopPropagation();
                await removeRecordEntry(itemId);
                currentViewUpdateHandler();
            };
        }
    });

    currentViewUpdateHandler = async () => {
        try {
            const listData = await dataStoreFacade.queryView(["lists", { descending: true }]);
            debugOutput("Fetched lists for dashboard:", listData);
            queryElement("#scrollable").innerHTML = applicationSettings.templateEngine.renderDashboardList(listData);
        } catch (err) {
            debugOutput("Error fetching lists:", err);
        }
    };
    currentViewUpdateHandler();
};

const viewSpecificCollection = async (collectionId) => {
    try {
        const collectionDoc = await dataStoreFacade.retrieveDocument(collectionId);
        displayContentRegion(applicationSettings.templateEngine.renderCollectionDetails(collectionDoc));

        queryElement(".back-to-index").addEventListener("click", presentMainDashboard);
        queryElement(".share-collection").addEventListener("click", () => initiateSharingProcess(collectionId));

        queryElement(".new-task-form").addEventListener("submit", async (evt) => {
            evt.preventDefault();
            const taskData = extractFormValues(evt.target);
            const taskDocument = {
                type: "task",
                description: taskData.taskDescription,
                listId: collectionId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                completed: false
            };
            await dataStoreFacade.storeDocument(taskDocument);
            evt.target.reset();
        });

        attachDelegatedEvent("#scrollable", "click", "li", async function (evt) {
            const itemId = this.dataset.id;
            if (evt.target.classList.contains("camera")) {
                if (evt.target.classList.contains("image")) {
                    showCapturedImage(itemId);
                } else {
                    captureImage(itemId);
                }
            } else {
                await alterCompletionStatus(itemId);
                currentViewUpdateHandler();
            }
        });

        attachDelegatedEvent("#scrollable", "swiperight", "li", function (evt) {
            const itemId = this.dataset.id;
            const deleteBtn = this.querySelector(".delete-button");
            if (deleteBtn) {
                deleteBtn.style.display = 'block';
                deleteBtn.onclick = async (deleteEvt) => {
                    deleteEvt.stopPropagation();
                    await removeRecordEntry(itemId);
                    currentViewUpdateHandler();
                };
            }
        });

        currentViewUpdateHandler = async () => {
            try {
                const taskListData = await dataStoreFacade.queryView(["tasks", {
                    startkey: [collectionId, {}],
                    endkey: [collectionId],
                    descending: true
                }]);
                debugOutput("Fetched tasks for collection:", taskListData);
                queryElement("#scrollable").innerHTML = applicationSettings.templateEngine.renderCollectionItems(taskListData);
            } catch (err) {
                debugOutput("Error fetching tasks:", err);
            }
        };
        currentViewUpdateHandler();
    } catch (err) {
        debugOutput("Error viewing collection:", err);
        displayUserAlert("Could not load list: " + (err.message || JSON.stringify(err)));
    }
};

const removeRecordEntry = async (recordId) => {
    try {
        const documentToDelete = await dataStoreFacade.retrieveDocument(recordId);
        documentToDelete._deleted = true;
        await dataStoreFacade.updateDocument(recordId, documentToDelete);
        debugOutput("Document marked for deletion:", recordId);
    } catch (err) {
        debugOutput("Error deleting document:", err);
        displayUserAlert("Failed to delete item: " + (err.message || JSON.stringify(err)));
    }
};

const alterCompletionStatus = async (taskId) => {
    try {
        const taskDocument = await dataStoreFacade.retrieveDocument(taskId);
        taskDocument.completed = !taskDocument.completed;
        taskDocument.updatedAt = new Date().toISOString();
        await dataStoreFacade.updateDocument(taskId, taskDocument);
        debugOutput("Task completion status toggled:", taskId);
    } catch (err) {
        debugOutput("Error toggling task status:", err);
        displayUserAlert("Failed to update task status: " + (err.message || JSON.stringify(err)));
    }
};

const captureImage = async (taskId) => {
    debugOutput("Attempting to capture image for task:", taskId);
    if (!(navigator.DeviceCamera && navigator.DeviceCamera.getPicture)) {
        debugOutput("Device camera not available.");
        displayUserAlert("Camera feature not available on this device.");
        return;
    }

    const getImageData = () => new Promise((resolve, reject) => {
        navigator.DeviceCamera.getPicture(resolve, reject, {
            quality: 50,
            targetWidth: 1000,
            targetHeight: 1000,
            destinationType: DeviceCamera.DestinationType.DATA_URL
        });
    });

    try {
        const imageData = await getImageData();
        const taskDoc = await dataStoreFacade.retrieveDocument(taskId);
        taskDoc._attachments = {
            "image": {
                content_type: "image/jpg",
                data: imageData
            }
        };
        await dataStoreFacade.storeDocument(taskDoc);
        debugOutput("Image attached to task:", taskId);
        currentViewUpdateHandler();
    } catch (message) {
        debugOutput("Image capture failed:", message);
        displayUserAlert("Failed to capture image: " + (message || "Unknown error"));
    }
};

const showCapturedImage = async (taskId) => {
    currentViewUpdateHandler = () => {};
    try {
        const imageDoc = await dataStoreFacade.retrieveDocument(taskId);
        imageDoc.imagePath = applicationSettings.dataStoreHandle.paxUrl ?
                                applicationSettings.dataStoreHandle.paxUrl(taskId, "image") :
                                `data:image/jpeg;base64,${imageDoc._attachments?.image?.data}`;
        displayContentRegion(applicationSettings.templateEngine.renderImageView(imageDoc));

        queryElement(".back-to-list").addEventListener("click", () => viewSpecificCollection(imageDoc.listId));
        queryElement(".delete-image").addEventListener("click", async () => {
            const docWithImage = await dataStoreFacade.retrieveDocument(taskId);
            delete docWithImage.imagePath;
            if (docWithImage._attachments?.image) {
                delete docWithImage._attachments.image;
            }
            await dataStoreFacade.storeDocument(docWithImage);
            viewSpecificCollection(docWithImage.listId);
        });
    } catch (err) {
        debugOutput("Error showing image:", err);
        displayUserAlert("Could not display image: " + (err.message || JSON.stringify(err)));
    }
};

const initiateSharingProcess = async (collectionId) => {
    if (!applicationSettings.currentUserProfile) {
        const authResult = await performInitialAuthentication();
        if (authResult.error) {
            return reportAuthenticationFailure(authResult.error);
        }
        debugOutput("Login done for sharing.", authResult);
        await displaySharingOptions(collectionId);
    } else {
        await displaySharingOptions(collectionId);
    }
};

const displaySharingOptions = async (collectionId) => {
    currentViewUpdateHandler = () => {};
    try {
        const collectionDoc = await dataStoreFacade.retrieveDocument(collectionId);
        const profileView = await dataStoreFacade.queryView("profiles");

        profileView.title = collectionDoc.title;
        profileView.ownerId = collectionDoc.owner;

        const currentMembers = new Set((collectionDoc.members || []).concat(collectionDoc.owner));

        profileView.rows.forEach(row => {
            if (currentMembers.has(row.id)) {
                row.checked = "checked";
            }
        });

        displayContentRegion(applicationSettings.templateEngine.renderSharingOptions(profileView));

        queryElement(".back-to-list").addEventListener("click", () => viewSpecificCollection(collectionId));

        attachDelegatedEvent("#scrollable", "click", "li", async function () {
            const profileUserId = this.dataset.id;
            if (profileUserId !== collectionDoc.owner) {
                await modifyAccessPermissions(collectionDoc, profileUserId);
                displaySharingOptions(collectionId);
            } else {
                displaySharingOptions(collectionId);
            }
        });
    } catch (err) {
        debugOutput("Error displaying sharing options:", err);
        displayUserAlert("Failed to load sharing options: " + (err.message || JSON.stringify(err)));
    }
};

const modifyAccessPermissions = async (collectionDocument, userProfileId) => {
    collectionDocument.members = collectionDocument.members || [];
    const memberIndex = collectionDocument.members.indexOf(userProfileId);
    if (memberIndex === -1) {
        collectionDocument.members.push(userProfileId);
    } else {
        collectionDocument.members.splice(memberIndex, 1);
    }
    debugOutput("Updated members for document:", collectionDocument.members);
    await dataStoreFacade.storeDocument(collectionDocument);
};

const performInitialAuthentication = async () => {
    try {
        const socialAuthData = await authenticateViaSocialNetwork();
        if (socialAuthData.error) {
            return { error: socialAuthData.error };
        }

        await new Promise((resolve, reject) => {
            applicationSettings.setUser(socialAuthData.data, (err, ok) => {
                if (err) reject(err); else resolve(ok);
            });
        });

        await registerSocialToken();
        await createPersonalProfile();
        await assignOwnerToAllCollections();
        await beginDataSynchronization();
        return { success: true };
    } catch (err) {
        debugOutput("Initial authentication process failed:", err);
        return { error: err };
    }
};

const registerSocialToken = async () => {
    const registrationDetails = {
        remote_url: applicationSettings.serviceEndpoints.remoteSynchronization,
        email: applicationSettings.currentUserProfile.email,
        access_token: applicationSettings.currentUserProfile.accessToken
    };
    debugOutput("Registering social token:", registrationDetails);
    await networkClient.post([applicationSettings.serviceEndpoints.identityServer, "_facebook_token"], registrationDetails);
};

const assignOwnerToAllCollections = async () => {
    try {
        const allLists = await dataStoreFacade.queryView(["lists", { include_docs: true }]);
        const updatedDocuments = allLists.rows.map(row => {
            row.doc.owner = `p:${applicationSettings.currentUserProfile.userId}`;
            return row.doc;
        });
        await dataStoreFacade.bulkUpdate(updatedDocuments);
        debugOutput("Updated all lists with new owner.");
    } catch (err) {
        debugOutput("Error assigning owner to collections:", err);
        throw err;
    }
};

const createPersonalProfile = async () => {
    debugOutput("Creating personal profile for user:", applicationSettings.currentUserProfile);
    const profileRecord = { ...applicationSettings.currentUserProfile };
    profileRecord.type = "profile";
    profileRecord.userId = profileRecord.email;
    delete profileRecord.email;
    await dataStoreFacade.updateDocument(`p:${profileRecord.userId}`, profileRecord);
};

const authenticateViaSocialNetwork = async () => {
    if (navigator.connection && navigator.connection.type === "none") {
        return { error: { reason: "No network connection" } };
    }

    const { applicationId, redirectionUrl, permissionScope } = applicationSettings.socialAuthDetails;

    SocialAuthProvider.settings.appId = applicationId;
    SocialAuthProvider.settings.redirectUrl = redirectionUrl;
    SocialAuthProvider.settings.permissions = permissionScope;

    try {
        const accessToken = await new Promise((resolve, reject) => {
            SocialAuthProvider.login(resolve, reject);
        });
        const userInfo = await retrieveSocialUserInfo(accessToken);
        return { data: userInfo };
    } catch (err) {
        debugOutput("Social network authentication failed:", err);
        return { error: err };
    }
};

const signOutFromSocialNetwork = async (userAccessToken) => {
    if (navigator.connection && navigator.connection.type === "none") {
        return { error: { reason: "No network connection" } };
    }

    const { applicationId, redirectionUrl, permissionScope } = applicationSettings.socialAuthDetails;

    SocialAuthProvider.settings.appId = applicationId;
    SocialAuthProvider.settings.redirectUrl = redirectionUrl;
    SocialAuthProvider.settings.permissions = permissionScope;

    try {
        await new Promise((resolve, reject) => {
            SocialAuthProvider.logout(userAccessToken, (err, data) => {
                if (err) reject(err); else resolve(data);
            });
        });
        debugOutput("Logged out from social network.");
        return { success: true };
    } catch (err) {
        debugOutput("Social network logout failed:", err);
        return { error: err };
    }
};

const retrieveSocialUserInfo = async (token) => {
    const infoUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`;
    const response = await networkClient.get(infoUrl);
    response.access_token = token;
    return response;
};

const refreshSocialToken = async () => {
    debugOutput("Attempting to refresh social token.");
    try {
        const socialAuthData = await authenticateViaSocialNetwork();
        if (socialAuthData.error) {
            throw socialAuthData.error;
        }

        await new Promise((resolve, reject) => {
            applicationSettings.setUser(socialAuthData.data, (err, ok) => {
                if (err) reject(err); else resolve(ok);
            });
        });

        await registerSocialToken();
        return { success: true };
    } catch (err) {
        debugOutput("Social token refresh failed:", err);
        throw err;
    }
};

const beginDataSynchronization = async (retryCounter = 0) => {
    if (!applicationSettings.currentUserProfile) {
        return debugOutput("No user profile, skipping data synchronization.");
    }

    const remoteSyncConfig = {
        url: applicationSettings.serviceEndpoints.remoteSynchronization,
        auth: { facebook: { email: applicationSettings.currentUserProfile.email } }
    };

    debugOutput("Initiating data synchronization with:", remoteSyncConfig);

    try {
        await applicationSettings.dataStoreHandle.replicate.to(remoteSyncConfig, { live: false, retry: false });
        debugOutput("Initial push replication completed successfully.");

        const liveReplication = applicationSettings.dataStoreHandle.replicate.to(remoteSyncConfig, { live: true, retry: true })
            .on('change', info => debugOutput('Live replication change:', info))
            .on('paused', err => {
                debugOutput('Live replication paused:', err);
                if (err) {
                    if (retryCounter < 5) {
                        setTimeout(() => beginDataSynchronization(retryCounter + 1), Math.pow(2, retryCounter) * 1000);
                    } else {
                        displayUserAlert("Synchronization stopped due to persistent errors.");
                    }
                }
            })
            .on('active', () => debugOutput('Live replication active.'))
            .on('error', err => {
                debugOutput('Live replication error:', err);
            });

        applicationSettings.dataStoreHandle.currentReplication = liveReplication;
        debugOutput("Continuous bidirectional synchronization started.");
    } catch (err) {
        debugOutput("Error during data synchronization setup:", err);
        if (retryCounter < 5) {
            setTimeout(() => beginDataSynchronization(retryCounter + 1), Math.pow(2, retryCounter) * 1000);
        } else {
            displayUserAlert("Failed to establish synchronization after multiple attempts.");
        }
    }
};

document.addEventListener("deviceready", initializeApplication, false);