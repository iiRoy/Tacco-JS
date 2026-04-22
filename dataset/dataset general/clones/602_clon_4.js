class WebClient {
    static globalToken = '';

    static async makeRequest(endpoint, method = 'GET', data = null, errorCallback = null) {
        const fetchOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': WebClient.globalToken
            }
        };

        if (data) {
            fetchOptions.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(endpoint, fetchOptions);
            if (!response.ok) {
                if (errorCallback) {
                    errorCallback(null, { status: response.status, responseText: await response.text() });
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (response.status === 204 || method === 'DELETE') {
                return null;
            }
            return await response.json();
        } catch (problem) {
            console.error('Network or server issue:', problem);
            if (errorCallback && !problem.response) {
                 errorCallback(null, { status: 0, responseText: problem.message });
            }
            throw problem;
        }
    }
}

class SecretVaultEntry {
    constructor(initialData = {}) {
        this.uniqueId = initialData.id || null;
        this.label = initialData.title || '';
        this.accountName = initialData.username || '';
        this.secretValue = initialData.password || '';
        this.resourceLink = initialData.url || '';
        this.details = initialData.notes || '';
        this.accessGroups = initialData.shares || [];
        this.obscuredSecret = '********';
    }

    revealSecret() {
        this.obscuredSecret = this.secretValue;
    }

    concealSecret() {
        this.obscuredSecret = '********';
    }

    checkValidity(attrs) {
        if (attrs.label.length === 0 || attrs.secretValue.length === 0) {
            return "Please enter a label and a secret";
        }

        if (attrs.resourceLink) {
            const linkPattern = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
            if (!linkPattern.test(attrs.resourceLink)) {
                return "Please enter a valid resource link";
            }
        }
        return null;
    }

    toTransferObject() {
        return {
            id: this.uniqueId,
            title: this.label,
            username: this.accountName,
            password: this.secretValue,
            url: this.resourceLink,
            notes: this.details,
            shares: this.accessGroups
        };
    }
}

class VaultDataStore {
    constructor(apiPath) {
        this.records = [];
        this.apiEndpoint = apiPath;
        this.subscribers = [];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.records));
    }

    sortRecords() {
        this.records.sort((rec1, rec2) => {
            return rec1.label.localeCompare(rec2.label);
        });
    }

    async retrieveRecords() {
        try {
            const data = await WebClient.makeRequest(this.apiEndpoint);
            this.records = data.map(item => new SecretVaultEntry(item));
            this.sortRecords();
            this.notifySubscribers();
        } catch (e) {
            console.error("Failed to retrieve records:", e);
        }
    }

    async generateRecord(recordData, errorCallback = null) {
        const newEntry = new SecretVaultEntry(recordData);
        const validationMessage = newEntry.checkValidity(recordData);
        if (validationMessage) {
            if (errorCallback) errorCallback(null, { status: 400, responseText: validationMessage });
            return;
        }

        try {
            const responseData = await WebClient.makeRequest(this.apiEndpoint, 'POST', newEntry.toTransferObject(), errorCallback);
            newEntry.uniqueId = responseData.id;
            this.records.push(newEntry);
            this.sortRecords();
            this.notifySubscribers();
        } catch (e) {
            console.error("Failed to generate record:", e);
        }
    }

    async refreshEntry(recordUniqueId, updatedData, errorCallback = null) {
        const targetEntry = this.records.find(rec => rec.uniqueId === recordUniqueId);
        if (!targetEntry) return;

        const prospectiveEntry = new SecretVaultEntry({ ...targetEntry.toTransferObject(), ...updatedData, id: recordUniqueId });
        const validationMessage = prospectiveEntry.checkValidity(prospectiveEntry);
        if (validationMessage) {
            if (errorCallback) errorCallback(null, { status: 400, responseText: validationMessage });
            return;
        }

        try {
            Object.assign(targetEntry, {
                label: updatedData.label,
                accountName: updatedData.accountName,
                secretValue: updatedData.secretValue,
                resourceLink: updatedData.resourceLink,
                details: updatedData.details,
                accessGroups: updatedData.accessGroups
            });
            await WebClient.makeRequest(`${this.apiEndpoint}${recordUniqueId}/`, 'PUT', targetEntry.toTransferObject(), errorCallback);
            this.sortRecords();
            this.notifySubscribers();
        } catch (e) {
            console.error("Failed to refresh entry:", e);
        }
    }

    async eliminateRecord(recordUniqueId, errorCallback = null) {
        try {
            await WebClient.makeRequest(`${this.apiEndpoint}${recordUniqueId}/`, 'DELETE', null, errorCallback);
            this.records = this.records.filter(rec => rec.uniqueId !== recordUniqueId);
            this.notifySubscribers();
        } catch (e) {
            console.error("Failed to eliminate record:", e);
        }
    }

    getRecordById(uniqueId) {
        return this.records.find(rec => rec.uniqueId === uniqueId);
    }
}

class EntryRowComponent {
    constructor(secretRecordData, parentApplication) {
        this.dataObject = secretRecordData;
        this.mainVaultApp = parentApplication;
        this.rowElement = this.composeDisplay();
        this.attachInteractions();
    }

    composeDisplay() {
        const element = document.createElement('tr');
        element.dataset.uniqueId = this.dataObject.uniqueId;
        element.innerHTML = `
            <td>${this.dataObject.label}</td>
            <td class="secret-field">${this.dataObject.obscuredSecret}</td>
            <td>${this.dataObject.accountName}</td>
            <td>${this.dataObject.resourceLink ? `<a href="${this.dataObject.resourceLink}" target="_blank">${this.dataObject.resourceLink}</a>` : ''}</td>
            <td>
                <a href="#" class="action-edit">Edit</a>
                <a href="#" class="action-delete">Delete</a>
            </td>
        `;
        return element;
    }

    attachInteractions() {
        const secretCell = this.rowElement.querySelector('.secret-field');
        if (secretCell) {
            secretCell.addEventListener('mouseover', this.revealSecret.bind(this));
            secretCell.addEventListener('mouseout', this.concealSecret.bind(this));
        }

        this.rowElement.querySelector('.action-edit')?.addEventListener('click', this.modifySecret.bind(this));
        this.rowElement.querySelector('.action-delete')?.addEventListener('click', this.deleteSecret.bind(this));
    }

    revealSecret(event) {
        event.stopPropagation();
        this.dataObject.revealSecret();
        this.rowElement.querySelector('.secret-field').textContent = this.dataObject.obscuredSecret;
    }

    concealSecret(event) {
        event.stopPropagation();
        this.dataObject.concealSecret();
        this.rowElement.querySelector('.secret-field').textContent = this.dataObject.obscuredSecret;
    }

    modifySecret(event) {
        event.preventDefault();
        event.stopPropagation();
        this.mainVaultApp.modifySecret(this.dataObject);
    }

    deleteSecret(event) {
        event.preventDefault();
        event.stopPropagation();
        if (confirm("Are you certain you wish to remove this entry?")) {
            this.mainVaultApp.removeEntry(this.dataObject.uniqueId, (data, response) => {
                if (response && response.status === 403) {
                    alert("You lack the authorization to remove that data.");
                } else {
                    alert("Failed to remove that data.");
                }
            });
        }
    }

    updateDisplay() {
        this.rowElement.querySelector('td:nth-child(1)').textContent = this.dataObject.label;
        this.rowElement.querySelector('.secret-field').textContent = this.dataObject.obscuredSecret;
        this.rowElement.querySelector('td:nth-child(3)').textContent = this.dataObject.accountName;
        const linkCell = this.rowElement.querySelector('td:nth-child(4)');
        if (this.dataObject.resourceLink) {
            linkCell.innerHTML = `<a href="${this.dataObject.resourceLink}" target="_blank">${this.dataObject.resourceLink}</a>`;
        } else {
            linkCell.innerHTML = '';
        }
    }
}

class EntryTableComponent {
    constructor(parentApplication) {
        this.mainVaultApp = parentApplication;
        this.elementRef = document.createElement('tbody');
        this.vaultData = new VaultDataStore('/api/1.0/passwords/');
        this.vaultData.subscribe(this.composeDisplay.bind(this));
        this.recordComponents = new Map();
        this.initiate();
    }

    initiate() {
        this.vaultData.retrieveRecords();
    }

    addEntryDisplay(secretRecord) {
        const component = new EntryRowComponent(secretRecord, this.mainVaultApp);
        this.recordComponents.set(secretRecord.uniqueId, component);
        this.elementRef.appendChild(component.rowElement);
    }

    composeDisplay() {
        this.elementRef.innerHTML = '';
        this.recordComponents.clear();
        this.vaultData.records.forEach(record => this.addEntryDisplay(record));
    }

    async createEntry(entryData, errorCallback) {
        await this.vaultData.generateRecord(entryData, errorCallback);
    }

    async refreshEntry(entryUniqueId, updatedData, errorCallback) {
        await this.vaultData.refreshEntry(entryUniqueId, updatedData, errorCallback);
    }

    async removeEntry(entryUniqueId, errorCallback) {
        await this.vaultData.eliminateRecord(entryUniqueId, errorCallback);
    }
}

class VaultApplication {
    constructor() {
        this.panelElement = document.querySelector('#passwordPanel');
        this.modalElement = document.querySelector('#passwordModal');
        this.formElement = document.querySelector('#passwordForm');
        this.entryListManager = new EntryTableComponent(this);

        this.initiate();
    }

    initiate() {
        this.panelElement.querySelector('table').appendChild(this.entryListManager.elementRef);
        this.attachGlobalInteractions();
    }

    attachGlobalInteractions() {
        this.formElement.addEventListener('submit', this.processModalSubmission.bind(this));
        this.formElement.addEventListener('keydown', this.handleModalKeypress.bind(this));
        
        // Simulate Bootstrap's 'hidden' event for the modal
        // If Bootstrap is loaded, it might trigger 'hide.bs.modal'
        this.modalElement.addEventListener('hide.bs.modal', () => this.setupFormFields());
        
        // Manual handling for close button and clicking outside
        document.querySelector('#passwordModal .close')?.addEventListener('click', () => {
            this.hideModal();
            this.setupFormFields();
        });
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.hideModal();
                this.setupFormFields();
            }
        });
    }

    presentIssue(data, response) {
        if (response && response.status === 403) {
            alert("You lack the authorization to modify that data.");
        } else {
            alert("Failed to create or modify that data. Ensure valid information was provided.");
        }
    }

    setupFormFields(entryData = {}) {
        const defaultData = {
            label: '',
            accountName: '',
            secretValue: '',
            resourceLink: '',
            details: '',
            accessGroups: []
        };

        const currentData = { ...defaultData, ...entryData };

        this.formElement.querySelector('#id_title').value = currentData.label;
        this.formElement.querySelector('#id_username').value = currentData.accountName;
        this.formElement.querySelector('#id_password').value = currentData.secretValue;
        this.formElement.querySelector('#id_url').value = currentData.resourceLink;
        this.formElement.querySelector('#id_notes').value = currentData.details;

        const shareCheckboxes = this.formElement.querySelectorAll('input[type="checkbox"]');
        const selectedShareIds = currentData.accessGroups.map(elem => elem.id || elem);

        shareCheckboxes.forEach(checkbox => {
            checkbox.checked = selectedShareIds.includes(parseInt(checkbox.value));
        });

        this.modalElement.dataset.currentEntryId = '';
    }

    modifySecret(recordObject) {
        this.setupFormFields(recordObject);
        this.modalElement.dataset.currentEntryId = recordObject.uniqueId;
        this.showModal();
    }

    showModal() {
        this.modalElement.style.display = 'block';
        this.modalElement.setAttribute('aria-hidden', 'false');
        this.modalElement.classList.add('show');
        document.body.classList.add('modal-open');
    }

    hideModal() {
        this.modalElement.style.display = 'none';
        this.modalElement.setAttribute('aria-hidden', 'true');
        this.modalElement.classList.remove('show');
        document.body.classList.remove('modal-open');
    }

    async processModalSubmission(event) {
        event.preventDefault();
        event.stopPropagation();

        const formData = {
            label: this.formElement.querySelector('#id_title').value,
            accountName: this.formElement.querySelector('#id_username').value,
            secretValue: this.formElement.querySelector('#id_password').value,
            resourceLink: this.formElement.querySelector('#id_url').value,
            details: this.formElement.querySelector('#id_notes').value,
            accessGroups: Array.from(this.formElement.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value))
        };

        const currentEntryId = this.modalElement.dataset.currentEntryId;

        if (currentEntryId) {
            await this.entryListManager.refreshEntry(currentEntryId, formData, this.presentIssue.bind(this));
        } else {
            await this.entryListManager.createEntry(formData, this.presentIssue.bind(this));
        }

        this.hideModal();
        this.setupFormFields();
    }

    handleModalKeypress(event) {
        if (event.key === 'Enter') {
            this.processModalSubmission(event);
        }
    }

    async removeEntry(entryId, errorCallback) {
        await this.entryListManager.removeEntry(entryId, errorCallback);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const csrfInput = document.querySelector('input[name=csrfmiddlewaretoken]');
    if (csrfInput) {
        WebClient.globalToken = csrfInput.value;
    }

    const mainVaultApp = new VaultApplication();
});