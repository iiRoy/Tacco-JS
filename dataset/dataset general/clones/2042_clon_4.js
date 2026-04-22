const appProtocol = window.location.protocol;
const appHostname = window.location.host;
const currentPortalAddress = appProtocol + "//" + appHostname;

const documentLocationParts = document.URL.split("//");
const effectiveDomainParts = (documentLocationParts[1] ? documentLocationParts[1] : documentLocationParts[0]).split("/");
const domainIdentifier = effectiveDomainParts[1];

const databaseEndpoint = currentPortalAddress + "/" + domainIdentifier;
const replicationOptions = { "continuous": true };

const templateDatabaseURI = "http://library.iriscouch.com/library";
const registrationServiceURI = "http://www.thelittlelibrary.com/library.php";
const remoteDataHost = "library.iriscouch.com";
const maximumStorageCapacity = 250000000;

let authenticatedUserIdentifier = '';
let translationCatalog = {};

async function makeHttpRequest(method, url, body = null, headers = {}, dataType = 'json') {
    const requestOptions = {
        method: method,
        headers: {
            'Accept': 'application/json',
            ...headers
        }
    };

    if (body) {
        if (body instanceof FormData) {
            requestOptions.body = body;
        } else {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }
    }

    let effectiveUrl = url;
    if (dataType === 'jsonp') {
        const callbackName = `jsonpCallback_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        effectiveUrl += (effectiveUrl.includes('?') ? '&' : '?') + `callback=${callbackName}`;

        return new Promise((resolve, reject) => {
            window[callbackName] = (data) => {
                delete window[callbackName];
                resolve(data);
            };

            const script = document.createElement('script');
            script.src = effectiveUrl;
            script.onerror = (e) => {
                delete window[callbackName];
                reject(new Error(`JSONP request failed for ${url}: ${e}`));
            };
            document.head.appendChild(script);
        });
    } else {
        try {
            const response = await fetch(effectiveUrl, requestOptions);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("HTTP Request Error:", error);
            throw error;
        }
    }
}

const couchDbService = {
    async retrieveSessionInfo() {
        return makeHttpRequest('GET', `${currentPortalAddress}/_session`);
    },
    async retrieveDocument(dbName, docId) {
        return makeHttpRequest('GET', `${currentPortalAddress}/${dbName}/${docId}`);
    },
    async saveDocument(dbName, docId, docData, rev = null) {
        const url = rev ? `${currentPortalAddress}/${dbName}/${docId}?rev=${rev}` : `${currentPortalAddress}/${dbName}/${docId}`;
        return makeHttpRequest('PUT', url, docData);
    },
    async createNewDocument(dbName, docData) {
        return makeHttpRequest('POST', `${currentPortalAddress}/${dbName}`, docData);
    },
    async loginUser(username, password) {
        return makeHttpRequest('POST', `${currentPortalAddress}/_session`, { name: username, password: password });
    },
    async registerUser(userIdentifier, userPassword) {
        const userDocId = `org.couchdb.user:${userIdentifier}`;
        const userPayload = {
            name: userIdentifier,
            password: userPassword,
            roles: [userIdentifier],
            type: "user"
        };
        return makeHttpRequest('PUT', `${currentPortalAddress}/_users/${encodeURIComponent(userDocId)}`, userPayload);
    },
    async queryView(dbName, designDoc, viewName, queryParams = {}) {
        let url = `${currentPortalAddress}/${dbName}/_design/${designDoc}/_view/${viewName}`;
        const queryString = new URLSearchParams(queryParams).toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        return makeHttpRequest('GET', url);
    },
    async getDatabaseInfo(dbName) {
        return makeHttpRequest('GET', `${currentPortalAddress}/${dbName}`);
    }
};

const domUtil = {
    select(selector, parent = document) {
        return parent.querySelector(selector);
    },
    selectAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },
    createElement(tagName, attributes = {}, textContent = '') {
        const element = document.createElement(tagName);
        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(key, attributes[key]);
            }
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    },
    append(parent, child) {
        parent.appendChild(child);
    },
    prepend(parent, child) {
        parent.insertBefore(child, parent.firstChild);
    },
    addClass(element, className) {
        if (element) element.classList.add(className);
    },
    removeClass(element, className) {
        if (element) element.classList.remove(className);
    },
    setText(element, text) {
        if (element) element.textContent = text;
    },
    setHtml(element, html) {
        if (element) element.innerHTML = html;
    },
    getValue(element) {
        return element ? element.value : '';
    },
    getChecked(element) {
        return element ? element.checked : false;
    },
    show(element) {
        if (element) element.style.display = '';
    },
    hide(element) {
        if (element) element.style.display = 'none';
    },
    fadeIn(element, duration = 500) {
        if (!element) return;
        element.style.opacity = 0;
        element.style.display = '';
        let start = null;
        function animate(currentTime) {
            if (!start) start = currentTime;
            const progress = (currentTime - start) / duration;
            element.style.opacity = progress;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = 1;
            }
        }
        requestAnimationFrame(animate);
    },
    fadeOut(element, duration = 500, callback = () => {}) {
        if (!element) return;
        element.style.opacity = 1;
        let start = null;
        function animate(currentTime) {
            if (!start) start = currentTime;
            const progress = (currentTime - start) / duration;
            element.style.opacity = 1 - progress;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.opacity = 0;
                callback();
            }
        }
        requestAnimationFrame(animate);
    },
    addEvent(element, eventType, handler) {
        if (element) element.addEventListener(eventType, handler);
    },
    removeEvent(element, eventType, handler) {
        if (element) element.removeEventListener(eventType, handler);
    },
    redirect(url) {
        window.location.assign(url);
    },
    setFormAction(formElement, actionUrl) {
        if (formElement) formElement.setAttribute('action', actionUrl);
    },
    alertUser(message) {
        alert(message);
    },
    showLoader() {
        let loader = domUtil.select('#app-loader');
        if (!loader) {
            loader = domUtil.createElement('div', { id: 'app-loader', style: 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background: rgba(0,0,0,0.7); color: white; border-radius: 5px; z-index: 9999;' }, 'Loading...');
            domUtil.append(document.body, loader);
        }
        domUtil.show(loader);
    },
    hideLoader() {
        let loader = domUtil.select('#app-loader');
        if (loader) {
            domUtil.hide(loader);
        }
    }
};

class CatalogManager {
    constructor() {
        this.currentProtocol = appProtocol;
        this.currentHost = appHostname;
        this.fullHostAddress = currentPortalAddress;
        this.databaseIdentifier = domainIdentifier;
        this.databaseAddress = databaseEndpoint;
        this.remoteHostAddress = remoteDataHost;
        this.registrationServicePath = registrationServiceURI;
        this.maxDatabaseBytes = maximumStorageCapacity;

        this.currentUserAlias = authenticatedUserIdentifier;
        this.languageTranslations = translationCatalog;

        this.initializeApplication();
    }

    async initializeApplication() {
        await this.fetchUserAuthenticationStatus();
        await this.loadApplicationLanguage();
    }

    async fetchUserAuthenticationStatus() {
        try {
            const sessionData = await couchDbService.retrieveSessionInfo();
            this.currentUserAlias = sessionData.userCtx.name;
        } catch (error) {
            console.warn("Could not retrieve session info, user might not be logged in.", error);
            this.currentUserAlias = '';
        }
    }

    async loadApplicationLanguage() {
        try {
            const langViewResult = await couchDbService.queryView(this.databaseIdentifier, 'library', 'currentLang');
            if (langViewResult.total_rows === 0) {
                this.languageTranslations = await makeHttpRequest('GET', `${this.databaseAddress}/_design/library/language.json`);
                this.languageTranslations = this.languageTranslations.texts;
            } else {
                const langDocId = langViewResult.rows[0].id;
                const langDoc = await couchDbService.retrieveDocument(this.databaseIdentifier, langDocId);
                this.languageTranslations = langDoc.texts;
            }
        } catch (error) {
            console.error("Failed to load application language:", error);
            this.languageTranslations = {
                noOnline: "Cannot create online database.",
                addTitle: "Please add a title.",
                noSpace: "Not enough space in database.",
                saved: "Saved!",
                errorSettings: "Error loading settings.",
                fromTheLibrary: "From the library of",
                currentFilesLabel: "Current Files",
                deleteLabel: "Delete",
                books: "Books", audio: "Audio", videos: "Videos", pictures: "Pictures", documents: "Documents", notes: "Notes", courses: "Courses",
                settings: "Settings", get: "Get"
            };
        }
    }

    performAccessVerification() {
        const footerViewElement = domUtil.select('.ui-footer h4');

        if (this.currentUserAlias && this.currentUserAlias !== 'null' && footerViewElement) {
            if (this.remoteHostAddress === this.currentHost && this.currentUserAlias !== this.databaseIdentifier) {
                domUtil.redirect("login.html");
                return;
            }
            const userDisplay = domUtil.createElement('span');
            domUtil.setHtml(userDisplay, `${this.currentUserAlias}<br />`);
            domUtil.prepend(footerViewElement, userDisplay);
        } else {
            domUtil.redirect("login.html");
        }
    }

    async establishRemoteDatabase(accountName, accountPasskey) {
        const couchDbUserKey = `org.couchdb.user%3A${accountName}`;
        const couchDbUserFullKey = `org.couchdb.user:${accountName}`;

        try {
            const userAccountInfo = await couchDbService.retrieveDocument('_users', couchDbUserKey);
            const encryptedPasskey = userAccountInfo.password_sha;
            const encryptionSalt = userAccountInfo.salt;

            const registrationResponse = await makeHttpRequest('POST', this.registrationServicePath, {
                username: accountName,
                password: encryptedPasskey,
                salt: encryptionSalt
            }, { 'Content-Type': 'application/x-www-form-urlencoded' });

            if (registrationResponse) {
                const currentRevision = userAccountInfo._rev;
                await couchDbService.saveDocument('_users', couchDbUserFullKey, {
                    _id: couchDbUserFullKey,
                    _rev: currentRevision,
                    name: accountName,
                    onlineDB: registrationResponse,
                    password_sha: encryptedPasskey,
                    salt: encryptionSalt,
                    type: "user",
                    roles: [accountName]
                });
                domUtil.redirect('login.html');
            } else {
                domUtil.alertUser(this.languageTranslations.noOnline);
                domUtil.redirect("index.html");
            }
        } catch (error) {
            console.error("Error creating online database:", error);
            domUtil.alertUser(this.languageTranslations.noOnline);
            domUtil.redirect("index.html");
        }
    }

    async processRegistration(accountName, accountPasskey) {
        domUtil.showLoader();
        try {
            await couchDbService.registerUser(accountName, accountPasskey);
            await couchDbService.loginUser(accountName, accountPasskey);
            await this.establishRemoteDatabase(accountName, accountPasskey);
        } catch (error) {
            console.error("Error during signup process:", error);
            domUtil.alertUser("Registration failed: " + error.message);
            domUtil.hideLoader();
        }
    }

    async displayCategoryCount(categoryKey) {
        try {
            const viewData = await couchDbService.queryView(this.databaseIdentifier, 'library', categoryKey);
            const countElement = domUtil.select(`.${categoryKey}Total`);
            if (countElement) {
                domUtil.addClass(countElement, 'ui-li-count ui-btn-up-c ui-btn-corner-all');
                domUtil.setText(countElement, viewData.total_rows);
            }
        } catch (error) {
            console.error(`Failed to display count for ${categoryKey}:`, error);
        }
    }

    async renderCategoryList() {
        try {
            const designDocData = await couchDbService.retrieveDocument(this.databaseIdentifier, '_design/library');
            const homeListElement = domUtil.select('ul.homeList');
            if (!homeListElement) return;

            const categoryViews = designDocData.views || {};
            const viewKeys = Object.keys(categoryViews);

            for (const singleViewKey of viewKeys) {
                if (singleViewKey !== "languages" && singleViewKey !== "currentLang") {
                    let translatedViewName = this.languageTranslations[singleViewKey] || singleViewKey;

                    const listItem = domUtil.createElement('li', { class: 'ui-li-has-count' });
                    const anchor = domUtil.createElement('a', {
                        href: `library.html?type=${singleViewKey}`,
                        rel: 'external',
                        'data-transition': 'slide'
                    });
                    domUtil.setText(anchor, translatedViewName);

                    const countSpan = domUtil.createElement('span', { class: `${singleViewKey}Total` });
                    domUtil.append(anchor, countSpan);
                    domUtil.append(listItem, anchor);
                    domUtil.append(homeListElement, listItem);

                    this.displayCategoryCount(singleViewKey);
                }
            }
        } catch (error) {
            console.error("Failed to render category list:", error);
        }
    }

    async renderItemList(categoryName, libraryUrl, isLocal) {
        const headingElement = domUtil.select('h1');
        if (headingElement) {
            domUtil.setText(headingElement, this.languageTranslations[categoryName] || categoryName);
        }

        const dataType = isLocal ? 'json' : 'jsonp';
        try {
            const categoryItemsData = await makeHttpRequest('GET', `${libraryUrl}/_design/library/_view/${categoryName}`, null, {}, dataType);

            const listedItemsContainer = domUtil.select(`ul.listedItems`);
            if (!listedItemsContainer) return;

            if (!categoryItemsData.rows || categoryItemsData.rows.length === 0) {
                domUtil.append(listedItemsContainer, domUtil.createElement('li', {}, 'No items found.'));
                return;
            }

            for (const singleItem of categoryItemsData.rows) {
                let itemDisplayDate = '', itemFileLink = '';
                const itemDetails = singleItem.key;

                const getFileExtension = (fileName) => fileName.split('.').pop();

                if (itemDetails.date) {
                    itemDisplayDate = `(${itemDetails.date})`;
                }

                const itemSettingsPath = `${libraryUrl}/_design/library/settings.html?id=${itemDetails._id}&type=${itemDetails.type}`;

                const attachments = itemDetails._attachments || {};
                const attachmentNames = Object.keys(attachments);

                const preferredFilenames = ["default.htm", "default.html", "index.htm", "index.html"];
                for (const filename of preferredFilenames) {
                    if (attachmentNames.includes(filename)) {
                        itemFileLink = isLocal
                            ? `wrapper.html?name=${encodeURIComponent(itemDetails.title)}&url=${encodeURIComponent(libraryUrl)}&path=${encodeURIComponent(filename)}`
                            : `${libraryUrl}/${itemDetails._id}/${filename}`;
                        break;
                    }
                }

                if (!itemFileLink && attachmentNames.length > 0) {
                    const firstFilename = attachmentNames[0];
                    itemFileLink = `${libraryUrl}/${itemDetails._id}/${firstFilename}`;
                    if (isLocal) {
                        if (!firstFilename) {
                            itemFileLink = `_show/details/${itemDetails._id}`;
                        }
                    }
                } else if (!itemFileLink && attachmentNames.length === 0 && isLocal) {
                    itemFileLink = `_show/details/${itemDetails._id}`;
                }

                let itemThumbnailHtml = '';
                const imageExtensions = { jpg: 1, gif: 1, png: 1, jpeg: 1, JPG: 1, GIF: 1, PNG: 1, JPEG: 1, BMP: 1 };
                for (const filename in attachments) {
                    const fileExt = getFileExtension(filename);
                    if (imageExtensions[fileExt]) {
                        itemThumbnailHtml = `<img src="${libraryUrl}/${itemDetails._id}/${filename}" />`;
                        break;
                    }
                }

                const sanitizeText = (text) => text ? String(text).replace(/(<([^>]+)>)/ig, "") : '';

                const listItem = domUtil.createElement('li');
                const itemAnchor = domUtil.createElement('a', { href: itemFileLink, class: 'itemURL', rel: 'external' });
                domUtil.setHtml(itemAnchor, itemThumbnailHtml +
                    `<h3 class="itemTitle">${sanitizeText(itemDetails.title)}</h3>` +
                    `<p class="itemDetails"><strong>${sanitizeText(itemDetails.author)}</strong> ${sanitizeText(itemDisplayDate)}<br />${sanitizeText(itemDetails.description)}</p>`);

                const settingsAnchor = domUtil.createElement('a', {
                    href: itemSettingsPath,
                    rel: 'external',
                    class: `used${dataType}`,
                    'data-library-url': itemDetails._id
                });
                domUtil.setText(settingsAnchor, this.languageTranslations.settings || this.languageTranslations.get);

                domUtil.append(listItem, itemAnchor);
                domUtil.append(listItem, settingsAnchor);
                domUtil.append(listedItemsContainer, listItem);
            }
        } catch (error) {
            console.error("Failed to render item list:", error);
        }
    }

    extractQueryParameter(parameterKey, defaultValue = "add") {
        parameterKey = parameterKey.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp(`[\\?&]${parameterKey}(=([^&#]*)|&|#|$)`);
        const results = regex.exec(window.location.href);

        if (!results || !results[2]) {
            return defaultValue;
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    async populateSettingsForm(documentId) {
        const settingsFormElement = domUtil.select('.settingsForm');
        const settingsHeading = domUtil.select('#settings h1');
        if (!settingsFormElement || !settingsHeading) return;

        try {
            const itemDocument = await couchDbService.retrieveDocument(this.databaseIdentifier, documentId);

            if (!itemDocument) {
                domUtil.fadeOut(settingsFormElement, 500, () => {
                    domUtil.setHtml(settingsFormElement, `<p>${this.languageTranslations.errorSettings}</p>`);
                    domUtil.fadeIn(settingsFormElement);
                });
                return;
            }

            if (itemDocument.user) {
                const userSourceInfo = domUtil.createElement('p', { style: 'color: #777777' });
                domUtil.setHtml(userSourceInfo, `<em>${this.languageTranslations.fromTheLibrary} <strong>${itemDocument.user}</strong></em>`);
                domUtil.prepend(settingsFormElement, userSourceInfo);
            }

            domUtil.setText(settingsHeading, itemDocument.title || '');
            domUtil.select('input#title', settingsFormElement).value = itemDocument.title || '';
            domUtil.select('input#author', settingsFormElement).value = itemDocument.author || '';
            domUtil.select('textarea#description', settingsFormElement).value = itemDocument.description || '';
            domUtil.select('input#date', settingsFormElement).value = itemDocument.date || '';
            domUtil.select('input#_rev', settingsFormElement).value = itemDocument._rev || '';
            domUtil.select('input#type', settingsFormElement).value = itemDocument.type || '';
            domUtil.select('input#filename', settingsFormElement).value = itemDocument.filename || '';

            domUtil.setFormAction(settingsFormElement, `/${this.databaseIdentifier}/${itemDocument._id}`);

            if (!itemDocument.filename && !itemDocument._attachments) {
                return;
            }

            const filesListContainer = domUtil.createElement('div', { class: 'filesList', style: 'margin: 20px 0px; border: 1px solid #ccc; padding: 0px 20px; border-radius: 10px; background: #fff;' });
            domUtil.setHtml(filesListContainer, `<h3>${this.languageTranslations.currentFilesLabel}</h3>`);
            domUtil.append(domUtil.select('#_attachments', settingsFormElement).parentNode, filesListContainer);

            for (const filename in itemDocument._attachments) {
                const attachmentInfo = itemDocument._attachments[filename];
                const fileSize = attachmentInfo.length - 1;
                let displaySize = Math.round(fileSize / 1000);
                if (displaySize <= 999) displaySize += 'KB';
                else if (displaySize <= 9999999) displaySize = Math.round(displaySize / 1024) + 'MB';
                else displaySize = Math.round(displaySize / (1024 * 1024)) + 'GB';

                const fileLink = `/${this.databaseIdentifier}/${itemDocument._id}/${filename}`;
                const fileEntryHtml = `<p style="position:relative; border-top: 1px solid #ccc; padding-top: 10px;">` +
                    `<span data-inline="true"><strong><a href="${fileLink}" rel="external">${filename}</a></strong><span style="color: #999">, ${displaySize}</span></span> ` +
                    `<button type="button" title="${this.languageTranslations.deleteLabel} ${filename}" style="position:absolute; top: 2px; right: 0px; display: block;" data-filename="${filename}" class="deleteItemFile ui-btn ui-btn-icon-notext ui-btn-corner-all ui-shadow ui-btn-down-c ui-btn-up-c"><span class="ui-btn-inner ui-btn-corner-all" aria-hidden="true"><span class="ui-btn-text">${this.languageTranslations.deleteLabel}</span><span class="ui-icon ui-icon-delete ui-icon-shadow"></span></span></button></p>`;
                
                const tempDiv = domUtil.createElement('div');
                domUtil.setHtml(tempDiv, fileEntryHtml);
                domUtil.append(filesListContainer, tempDiv.firstChild);
            }

            domUtil.selectAll('.deleteItemFile', filesListContainer).forEach(button => {
                domUtil.addEvent(button, 'click', async (event) => {
                    const fileToDelete = event.currentTarget.dataset.filename;
                    try {
                        let currentDoc = await couchDbService.retrieveDocument(this.databaseIdentifier, documentId);
                        await makeHttpRequest('DELETE', `${this.databaseAddress}/${documentId}/${fileToDelete}?rev=${currentDoc._rev}`);
                        domUtil.alertUser(`${fileToDelete} deleted successfully.`);
                        domUtil.redirect(window.location.href);
                    } catch (error) {
                        console.error(`Error deleting file ${fileToDelete}:`, error);
                        domUtil.alertUser(`Failed to delete ${fileToDelete}: ${error.message}`);
                    }
                });
            });

        } catch (error) {
            console.error("Failed to populate settings form:", error);
            domUtil.fadeOut(settingsFormElement, 500, () => {
                domUtil.setHtml(settingsFormElement, `<p>${this.languageTranslations.errorSettings}</p>`);
                domUtil.fadeIn(settingsFormElement);
            });
        }
    }

    async submitItemForm(formElement, documentId, itemCategory) {
        if (!formElement) return;

        const titleInput = domUtil.select('input#title', formElement);
        const authorInput = domUtil.select('input#author', formElement);
        const descriptionInput = domUtil.select('textarea#description', formElement);
        const dateInput = domUtil.select('input#date', formElement);
        const revInput = domUtil.select('input#_rev', formElement);
        const deleteCheckbox = domUtil.select('input#delete', formElement);
        const typeSelect = domUtil.select('select', formElement);
        const fileInput = domUtil.select('input:file', formElement);

        const itemTitle = domUtil.getValue(titleInput);
        const itemAuthor = domUtil.getValue(authorInput);
        const itemDescription = domUtil.getValue(descriptionInput);
        const itemDate = domUtil.getValue(dateInput);
        const itemRevision = domUtil.getValue(revInput);
        const shouldDeleteItem = domUtil.getChecked(deleteCheckbox) ? 'Yes' : 'No';
        const itemType = domUtil.getValue(typeSelect);
        let uploadedFilename = '';

        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            uploadedFilename = fileInput.files[0].name;
        } else {
            if (fileInput) fileInput.remove();
        }

        if (!uploadedFilename) {
            uploadedFilename = domUtil.getValue(domUtil.select('input#filename', formElement));
        }

        if (!itemTitle) {
            domUtil.alertUser(this.languageTranslations.addTitle);
            return;
        }

        let currentDbSize = this.maxDatabaseBytes;
        try {
            const dbInfo = await couchDbService.getDatabaseInfo(this.databaseIdentifier);
            currentDbSize = dbInfo.data_size;
        } catch (error) {
            console.error("Failed to get database info for size check:", error);
        }

        if (shouldDeleteItem !== 'Yes' && currentDbSize >= this.maxDatabaseBytes) {
            domUtil.alertUser(this.languageTranslations.noSpace);
            return;
        }

        if (shouldDeleteItem === 'Yes') {
            try {
                const currentDoc = await couchDbService.retrieveDocument(this.databaseIdentifier, documentId);
                await makeHttpRequest('DELETE', `${this.databaseAddress}/${documentId}?rev=${currentDoc._rev}`);
                domUtil.alertUser(this.languageTranslations.saved);
                domUtil.redirect("index.html");
            } catch (error) {
                console.error("Error deleting document:", error);
                domUtil.alertUser("Error deleting item: " + error.message);
            }
            return;
        }

        let documentToSave = {
            title: itemTitle,
            author: itemAuthor,
            description: itemDescription,
            date: itemDate,
            type: itemType,
            filename: uploadedFilename,
            user: this.currentUserAlias || null
        };

        let currentDocRev = itemRevision;
        let existingAttachments = {};

        if (documentId !== 'add') {
            try {
                const existingDoc = await couchDbService.retrieveDocument(this.databaseIdentifier, documentId);
                currentDocRev = existingDoc._rev;
                existingAttachments = existingDoc._attachments || {};
                documentToSave = { ...existingDoc, ...documentToSave };
                documentToSave._rev = currentDocRev;
            } catch (error) {
                console.error("Error fetching existing document for update:", error);
                domUtil.alertUser("Failed to update item: " + error.message);
                return;
            }
        }

        try {
            let response;
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                let docIdForAttachment = documentId;
                if (documentId === 'add') {
                    const newDocResp = await couchDbService.createNewDocument(this.databaseIdentifier, documentToSave);
                    docIdForAttachment = newDocResp.id;
                    documentToSave._id = newDocResp.id;
                    documentToSave._rev = newDocResp.rev;
                } else {
                    response = await couchDbService.saveDocument(this.databaseIdentifier, documentId, documentToSave, currentDocRev);
                    documentToSave._rev = response.rev;
                }

                const fileToUpload = fileInput.files[0];
                const attachmentUrl = `${this.databaseAddress}/${documentToSave._id}/${fileToUpload.name}?rev=${documentToSave._rev}`;

                const attachmentResponse = await fetch(attachmentUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': fileToUpload.type || 'application/octet-stream' },
                    body: fileToUpload
                });

                if (!attachmentResponse.ok) {
                    const errorText = await attachmentResponse.text();
                    throw new Error(`Failed to upload attachment: ${attachmentResponse.status}, Details: ${errorText}`);
                }
                const attachmentResult = await attachmentResponse.json();
                documentToSave._rev = attachmentResult.rev;

                domUtil.alertUser(this.languageTranslations.saved);
                domUtil.redirect("index.html");

            } else {
                if (documentId === 'add') {
                    response = await couchDbService.createNewDocument(this.databaseIdentifier, documentToSave);
                } else {
                    response = await couchDbService.saveDocument(this.databaseIdentifier, documentId, documentToSave, currentDocRev);
                }
                if (response) {
                    domUtil.alertUser(this.languageTranslations.saved);
                    domUtil.redirect("index.html");
                }
            }
        } catch (error) {
            console.error("Error saving document:", error);
            domUtil.alertUser("Error saving item: " + error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const catalogApp = new CatalogManager();

    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '') {
        await catalogApp.renderCategoryList();
        catalogApp.performAccessVerification();
    } else if (currentPage === 'library.html') {
        const itemType = catalogApp.extractQueryParameter('type');
        const isLocal = true;
        await catalogApp.renderItemList(itemType, catalogApp.databaseAddress, isLocal);
    } else if (currentPage === 'settings.html') {
        const itemId = catalogApp.extractQueryParameter('id');
        await catalogApp.populateSettingsForm(itemId);

        const settingsForm = domUtil.select('form.settingsForm');
        if (settingsForm) {
            domUtil.addEvent(settingsForm, 'submit', async (event) => {
                event.preventDefault();
                const itemType = catalogApp.extractQueryParameter('type');
                await catalogApp.submitItemForm(settingsForm, itemId, itemType);
            });
        }
    } else if (currentPage === 'signup.html') {
        const signupForm = domUtil.select('form#signup-form');
        if (signupForm) {
            domUtil.addEvent(signupForm, 'submit', async (event) => {
                event.preventDefault();
                const usernameInput = domUtil.select('#username-input', signupForm);
                const passwordInput = domUtil.select('#password-input', signupForm);
                if (usernameInput && passwordInput) {
                    await catalogApp.processRegistration(domUtil.getValue(usernameInput), domUtil.getValue(passwordInput));
                }
            });
        }
    }
});