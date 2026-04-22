class DateTimeHelper {
    static formatStandardDateOutput(inputDate) {
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const yearMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const dayOfWeekName = weekDays[inputDate.getDay()];
        const dayOfMonthValue = String(inputDate.getDate()).padStart(2, '0');
        const monthNameValue = yearMonths[inputDate.getMonth()];
        const yearShort = String(inputDate.getFullYear() % 100).padStart(2, '0');

        let firstPart = `${dayOfWeekName}, ${dayOfMonthValue} ${monthNameValue} ${yearShort}`;

        const hoursValue = inputDate.getHours();
        const minutesValue = inputDate.getMinutes();
        const secondsValue = inputDate.getSeconds();

        let timeValue = `${hoursValue}:${minutesValue}:${secondsValue}`;

        const tzOffsetMinutes = inputDate.getTimezoneOffset();
        const tzSign = tzOffsetMinutes < 0 ? "+" : "-";
        const absTzOffsetMinutes = Math.abs(tzOffsetMinutes);
        const tzOffsetHours = Math.floor(absTzOffsetMinutes / 60);
        const tzRemainingMinutes = absTzOffsetMinutes % 60;

        let formattedTzOffset = tzSign;
        formattedTzOffset += String(tzOffsetHours).padStart(2, '0');
        formattedTzOffset += String(tzRemainingMinutes).padStart(2, '0');
        
        return `${firstPart} ${timeValue} ${formattedTzOffset}`;
    }
}

class CustomModal {
    constructor(modalId, config = {}) {
        this.element = document.getElementById(modalId);
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.id = modalId;
            document.body.appendChild(this.element);
        }
        this.element.classList.add('custom-modal-container');
        this.element.style.display = 'none';

        this.contentWrapper = document.createElement('div');
        this.contentWrapper.classList.add('custom-modal-content');
        this.element.appendChild(this.contentWrapper);

        this.buttonTray = document.createElement('div');
        this.buttonTray.classList.add('custom-modal-button-tray');
        this.element.appendChild(this.buttonTray);

        this.config = {
            height: config.height || 'auto',
            width: config.width || 'auto',
            canResize: config.resizable || false,
            isOverlay: config.modal || false,
            openOnLoad: config.autoOpen || false,
            actionButtons: config.buttons || {}
        };

        this.contentWrapper.style.height = this.config.height === 'auto' ? 'auto' : `${parseInt(this.config.height) - 70}px`;
        this.element.style.width = this.config.width === 'auto' ? 'auto' : `${this.config.width}px`;

        if (this.config.isOverlay) {
            this.backdrop = document.createElement('div');
            this.backdrop.classList.add('custom-modal-backdrop');
            document.body.appendChild(this.backdrop);
            this.backdrop.style.display = 'none';
        }

        this.refreshButtons(this.config.actionButtons);

        if (this.config.openOnLoad) {
            this.openModal();
        }
    }

    setInnerContent(htmlString) {
        this.contentWrapper.innerHTML = htmlString;
    }

    refreshButtons(buttonMap) {
        this.buttonTray.innerHTML = '';
        Object.keys(buttonMap).forEach(btnLabel => {
            const buttonElement = document.createElement('button');
            buttonElement.textContent = btnLabel;
            buttonElement.addEventListener('click', buttonMap[btnLabel].bind(this));
            this.buttonTray.appendChild(buttonElement);
        });
    }

    openModal() {
        this.element.style.display = 'flex';
        if (this.backdrop) {
            this.backdrop.style.display = 'block';
        }
    }

    closeModal() {
        this.element.style.display = 'none';
        if (this.backdrop) {
            this.backdrop.style.display = 'none';
        }
    }

    // Mimic jQuery UI dialog function calls
    operate(action) {
        if (action === 'close') {
            this.closeModal();
        } else if (action === 'open') {
            this.openModal();
        }
        return this;
    }
}

class MessageNotifier {
    constructor() {
        this.notificationContainer = document.getElementById('notificationContainer');
        if (!this.notificationContainer) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.id = 'notificationContainer';
            document.body.prepend(this.notificationContainer);
            const textSpan = document.createElement('span');
            this.notificationContainer.appendChild(textSpan);
        }
        this.notificationText = this.notificationContainer.querySelector('span');
        this.notificationContainer.style.display = 'none';
    }

    showAlert(message, styleClass) {
        this.notificationText.textContent = message;
        this.notificationContainer.className = '';
        this.notificationContainer.classList.add(styleClass);
        this.notificationContainer.style.display = 'block';
    }

    showError(message) {
        this.showAlert(message, 'alert-error-style');
    }

    showSuccess(message) {
        this.showAlert(message, 'alert-success-style');
    }

    showInfo(message) {
        this.showAlert(message, 'alert-info-style');
    }
}

class DataFetcher {
    constructor(notifier) {
        this.notifier = notifier;
    }

    async makeApiRequest(endpoint, httpMethod = 'GET', dataPayload = null) {
        const requestOptions = {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        if (dataPayload && (httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'DELETE')) {
            requestOptions.body = JSON.stringify(dataPayload);
        }

        try {
            const response = await fetch(endpoint, requestOptions);
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorBody.message || `Request failed with status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            this.notifier.showError(`Operation failed: ${error.message}`);
            throw error;
        }
    }
}

class DashboardManager {
    constructor() {
        this.messageHandler = new MessageNotifier();
        this.apiClient = new DataFetcher(this.messageHandler);

        this.statusEntryModal = this.initializeStatusEntryModal();
        this.serviceEntryModal = this.initializeServiceEntryModal();
        this.statusRemovalModal = this.initializeStatusRemovalModal();

        this.currentStatusEditLink = null;
        this.currentStatusDeleteElement = null;

        this.setupGlobalEventListeners();
    }

    initializeStatusEntryModal() {
        const modal = new CustomModal('statusEntryModalElement', {
            height: 515,
            width: 460,
            resizable: false,
            modal: true,
            autoOpen: false,
            buttons: {
                'Confirm Action': this.handleStatusSubmission.bind(this),
                'Abort': function() { this.operate('close'); }
            }
        });
        // Initial content for the modal (form fields would be in the HTML)
        modal.setInnerContent(`
            <label for="statusNameInput">Name:</label><input type="text" id="statusNameInput"/><br/>
            <label for="statusDescriptionInput">Description:</label><textarea id="statusDescriptionInput"></textarea><br/>
            <label for="statusLevelSelect">Level:</label><select id="statusLevelSelect"></select><br/>
            <fieldset>
                <legend>Image:</legend>
                <input type="radio" name="statusImageRadio" value="green.png" id="imageGreen"><label for="imageGreen">Green</label>
                <input type="radio" name="statusImageRadio" value="yellow.png" id="imageYellow"><label for="imageYellow">Yellow</label>
                <input type="radio" name="statusImageRadio" value="red.png" id="imageRed"><label for="imageRed">Red</label>
            </fieldset>
        `);
        return modal;
    }

    initializeServiceEntryModal() {
        const modal = new CustomModal('serviceEntryModalElement', {
            height: 310,
            width: 460,
            resizable: false,
            modal: true,
            autoOpen: false,
            buttons: {
                'Create New Service': this.handleServiceCreation.bind(this),
                'Cancel': function() { this.operate('close'); }
            }
        });
        modal.setInnerContent(`
            <label for="serviceNameInput">Service Name:</label><input type="text" id="serviceNameInput"/><br/>
            <label for="serviceDescriptionInput">Description:</label><textarea id="serviceDescriptionInput"></textarea><br/>
        `);
        return modal;
    }

    initializeStatusRemovalModal() {
        const modal = new CustomModal('statusRemovalModalElement', {
            resizable: false,
            modal: true,
            buttons: {
                'Delete Confirmation': this.confirmStatusDeletion.bind(this),
                'Abort': function() { this.operate('close'); }
            }
        });
        modal.setInnerContent('<p>Are you sure you want to delete this status?</p>');
        return modal;
    }

    setupGlobalEventListeners() {
        document.body.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('status-edit-action')) {
                event.preventDefault();
                this.currentStatusEditLink = target;
                this.prepareStatusEdit(target);
            } else if (target.classList.contains('status-delete-action')) {
                event.preventDefault();
                this.currentStatusDeleteElement = target;
                this.statusRemovalModal.operate('open');
            }
        });

        const addStatusButton = document.getElementById('addNewStatusBtn');
        if (addStatusButton) {
            addStatusButton.addEventListener('click', () => {
                document.getElementById('statusNameInput').value = '';
                document.getElementById('statusDescriptionInput').value = '';
                document.getElementById('statusLevelSelect').value = '';
                Array.from(document.querySelectorAll('input[name="statusImageRadio"]')).forEach(radio => radio.checked = false);
                this.statusEntryModal.operate('open');
                this.statusEntryModal.refreshButtons({
                    'Create Status': this.handleStatusSubmission.bind(this),
                    'Abort': function() { this.operate('close'); }
                });
                this.currentStatusEditLink = null; // Clear edit context
            });
        }

        const addServiceButton = document.getElementById('addServiceBtn');
        if (addServiceButton) {
            addServiceButton.addEventListener('click', () => {
                this.serviceEntryModal.operate('open');
            });
        }
        
        const statusToggle = document.getElementById('statusCheckbox');
        const messageToggle = document.getElementById('messageCheckbox');
        const submitStatusBtn = document.querySelector('#submitButton .status-action');
        const submitMessageBtn = document.querySelector('#submitButton .message-action');

        if(statusToggle) statusToggle.addEventListener('change', () => {
            if(statusToggle.checked) submitStatusBtn.removeAttribute('disabled');
            else submitStatusBtn.setAttribute('disabled', 'disabled');
        });
        if(messageToggle) messageToggle.addEventListener('change', () => {
            if(messageToggle.checked) submitMessageBtn.removeAttribute('disabled');
            else submitMessageBtn.setAttribute('disabled', 'disabled');
        });
    }

    // --- Status Management (Legend) ---
    async initializeStatusManagement(isAdminUser) {
        try {
            const statuses = await this.apiClient.makeApiRequest("/api/v1/statuses.json");
            const statusGridBody = document.getElementById('statusTableBody');
            if (statuses && statuses.statuses) {
                statuses.statuses.forEach(statusData => {
                    statusGridBody.appendChild(this.buildStatusRow(statusData, isAdminUser));
                });
            }
        } catch (error) { /* Handled by DataFetcher */ }

        try {
            const levels = await this.apiClient.makeApiRequest("/api/v1/levels.json");
            const statusLevelSelect = document.getElementById('statusLevelSelect');
            if (levels && levels.levels) {
                levels.levels.forEach(levelName => {
                    const option = document.createElement('option');
                    option.setAttribute('name', 'level-option');
                    option.value = levelName;
                    option.textContent = levelName;
                    statusLevelSelect.appendChild(option);
                });
            }
        } catch (error) { /* Handled by DataFetcher */ }
    }

    buildStatusRow(statusInfo, isAdminUser) {
        const rowElement = document.createElement('tr');

        const iconCell = document.createElement('td');
        iconCell.classList.add('status-icon-cell');
        const imgElement = document.createElement('img');
        imgElement.src = statusInfo.image;
        imgElement.alt = statusInfo.name;
        iconCell.appendChild(imgElement);
        rowElement.appendChild(iconCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.classList.add('status-description-cell');
        descriptionCell.textContent = statusInfo.description;
        rowElement.appendChild(descriptionCell);

        if (isAdminUser) {
            const levelCell = document.createElement('td');
            levelCell.classList.add('status-level-cell');
            levelCell.textContent = statusInfo.level;
            rowElement.appendChild(levelCell);

            const editCell = document.createElement('td');
            const editLink = document.createElement('a');
            editLink.textContent = "Adjust"; // Renamed from "Edit"
            editLink.href = statusInfo.url;
            editLink.classList.add('status-edit-action');
            editCell.appendChild(editLink);
            rowElement.appendChild(editCell);

            const deleteCell = document.createElement('td');
            const deleteLink = document.createElement('a');
            deleteLink.textContent = "Remove"; // Renamed from "Delete"
            deleteLink.href = statusInfo.url;
            deleteLink.classList.add('status-delete-action');
            deleteCell.appendChild(deleteLink);
            rowElement.appendChild(deleteCell);
        }
        return rowElement;
    }

    prepareStatusEdit(triggerLink) {
        const parentRow = triggerLink.closest('tr');
        const iconImage = parentRow.querySelector('.status-icon-cell img');
        const imageName = iconImage.src.split('/').pop().slice(0, -4);

        document.getElementById('statusNameInput').value = iconImage.alt;
        document.getElementById('statusDescriptionInput').value = parentRow.querySelector('.status-description-cell').textContent;
        document.getElementById('statusLevelSelect').value = parentRow.querySelector('.status-level-cell').textContent;

        Array.from(document.querySelectorAll('input[name="statusImageRadio"]')).forEach(radio => {
            radio.checked = (radio.value.replace('.png', '') === imageName);
        });

        this.statusEntryModal.operate('open');
        this.statusEntryModal.refreshButtons({
            'Save Changes': this.handleStatusSubmission.bind(this),
            'Abort': function() { this.operate('close'); }
        });
    }

    async handleStatusSubmission() {
        const nameVal = document.getElementById('statusNameInput').value;
        const descVal = document.getElementById('statusDescriptionInput').value;
        const imageVal = document.querySelector('input[name="statusImageRadio"]:checked')?.value;
        const levelVal = document.getElementById('statusLevelSelect').value;

        const payload = {
            'status[name]': nameVal,
            'status[description]': descVal,
            'status[image]': imageVal,
            'status[level]': levelVal
        };

        const isEditing = !!this.currentStatusEditLink;
        const url = isEditing ? this.currentStatusEditLink.href : "/api/v1/statuses.json";
        const method = isEditing ? "PUT" : "POST";

        try {
            const responseData = await this.apiClient.makeApiRequest(url, method, payload);
            this.statusEntryModal.operate('close');
            if (isEditing) {
                const parentRow = this.currentStatusEditLink.closest('tr');
                parentRow.querySelector('.status-description-cell').textContent = responseData.description;
                parentRow.querySelector('.status-level-cell').textContent = responseData.level;
                parentRow.querySelector('.status-icon-cell img').alt = responseData.name;
                parentRow.querySelector('.status-icon-cell img').src = responseData.image;
            } else {
                document.getElementById('statusTableBody').appendChild(this.buildStatusRow(responseData, true));
            }
            this.messageHandler.showSuccess(isEditing ? "Status updated successfully!" : "New status created!");
        } catch (error) {
            this.messageHandler.showError(isEditing ? "Failed to update status." : "Failed to create new status.");
        }
    }

    async confirmStatusDeletion() {
        const deleteUrl = this.currentStatusDeleteElement.href;
        try {
            await this.apiClient.makeApiRequest(deleteUrl, "DELETE");
            this.currentStatusDeleteElement.closest('tr').remove();
            this.statusRemovalModal.operate('close');
            this.messageHandler.showSuccess("Status successfully removed.");
        } catch (error) {
            this.messageHandler.showError("Unable to remove status.");
        }
    }

    // --- Service Overview (Index) ---
    async initializeServiceOverview() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const headerRow = document.querySelector('#serviceListingHead tr');
        Array.from({ length: 5 }).forEach((_, i) => {
            const pastDate = new Date(today.getTime() - (4 - i) * 86400000); // 5 days, from oldest to newest
            const dateCell = document.createElement('th');
            dateCell.classList.add('service-date-header');
            dateCell.textContent = `${pastDate.getMonth() + 1}/${pastDate.getDate()}/${pastDate.getFullYear()}`;
            headerRow.appendChild(dateCell);
        });

        try {
            const servicesData = await this.apiClient.makeApiRequest("/api/v1/services.json");
            const serviceListingBody = document.getElementById('serviceListingBody');
            if (servicesData && servicesData.services) {
                servicesData.services.forEach(serviceEntry => {
                    serviceListingBody.appendChild(this.constructServiceEntry(serviceEntry, true));
                });
            }
        } catch (error) { /* Handled by DataFetcher */ }
    }

    constructServiceEntry(serviceDetails, fetchDetailedStatuses) {
        const defaultIcon = "/images/status/tick-circle.png";
        const unknownIcon = "/images/status/question-white.png";
        let currentIcon = defaultIcon;

        const serviceRow = document.createElement('tr');
        serviceRow.id = `service-item-${serviceDetails.id}`; // Unique ID

        const nameCell = document.createElement('td');
        const nameLink = document.createElement('a');
        nameLink.href = `services/${serviceDetails.id}`;
        nameLink.textContent = serviceDetails.name;
        nameCell.appendChild(nameLink);
        serviceRow.appendChild(nameCell);

        const currentStatusCell = document.createElement('td');
        currentStatusCell.classList.add('service-current-status', 'highlighted-status');
        const currentStatusLink = document.createElement('a');
        currentStatusLink.href = `services/${serviceDetails.id}`;
        const currentStatusImg = document.createElement('img');
        currentStatusImg.src = fetchDetailedStatuses ? unknownIcon : defaultIcon;
        currentStatusImg.alt = "Current Status";
        currentStatusLink.appendChild(currentStatusImg);
        currentStatusCell.appendChild(currentStatusLink);
        serviceRow.appendChild(currentStatusCell);

        Array.from({ length: 5 }).forEach(() => {
            const historyStatusCell = document.createElement('td');
            historyStatusCell.classList.add('service-past-status');
            const historyStatusImg = document.createElement('img');
            historyStatusImg.src = unknownIcon;
            historyStatusImg.alt = "Historical Status";
            historyStatusCell.appendChild(historyStatusImg);
            serviceRow.appendChild(historyStatusCell);
        });

        const serviceListingTable = document.getElementById('serviceListingTable');
        if (serviceListingTable) {
            serviceListingTable.style.opacity = 0; // Simulate fadeOut
            setTimeout(() => {
                serviceListingTable.style.opacity = 1; // Simulate fadeIn
            }, 100);
        }

        if (fetchDetailedStatuses) {
            this.fetchAndDisplayServiceStatus(serviceDetails.id, serviceRow);
            this.fetchAndDisplayServiceHistory(serviceDetails.id, serviceRow);
        }

        return serviceRow;
    }

    async fetchAndDisplayServiceStatus(serviceId, rowElement) {
        const defaultIcon = "/images/status/tick-circle.png";
        try {
            const currentEvent = await this.apiClient.makeApiRequest(`/api/v1/services/${serviceId}/events/current.json`);
            const statusImageElement = rowElement.querySelector('.highlighted-status img');
            if (statusImageElement) {
                statusImageElement.src = currentEvent.status.image;
                if (currentEvent.informational) {
                    const infoIcon = document.createElement('img');
                    infoIcon.src = "/images/small-information.png";
                    infoIcon.classList.add('info-overlay-icon');
                    statusImageElement.parentNode.appendChild(infoIcon);
                }
            }
        } catch (error) {
            const statusImageElement = rowElement.querySelector('.highlighted-status img');
            if (statusImageElement) statusImageElement.src = defaultIcon;
        }
    }

    async fetchAndDisplayServiceHistory(serviceId, rowElement) {
        const defaultIcon = "/images/status/tick-circle.png";
        const infoIconPath = "/images/status/information.png";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(today.getTime() - 86400000); // Yesterday
        const startDate = new Date(endDate.getTime() - 86400000 * 4); // 5 days including yesterday

        const historyUrl = `/api/v1/services/${serviceId}/events.json?start=${DateTimeHelper.formatStandardDateOutput(startDate)}&end=${DateTimeHelper.formatStandardDateOutput(endDate)}`;

        try {
            const historicalResults = await this.apiClient.makeApiRequest(historyUrl);
            const eventCalendar = {};
            const dateSequence = [];

            // Populate dateSequence and initialize eventCalendar for the last 5 days
            Array.from({ length: 5 }).forEach((_, i) => {
                const day = new Date(endDate.getTime() - (4 - i) * 86400000);
                dateSequence.push(day);
                eventCalendar[day.toDateString()] = false; // Use toDateString for consistent key
            });

            if (historicalResults && historicalResults.events) {
                historicalResults.events.forEach(eventData => {
                    const eventDate = new Date(eventData.timestamp);
                    eventDate.setHours(0, 0, 0, 0); // Normalize
                    if (eventCalendar.hasOwnProperty(eventDate.toDateString())) {
                        eventCalendar[eventDate.toDateString()] = eventData.informational || eventData.status.level !== "NORMAL";
                    }
                });
            }

            dateSequence.forEach((day, index) => {
                const targetCell = rowElement.querySelectorAll('.service-past-status')[index];
                if (targetCell) {
                    const eventLink = document.createElement('a');
                    eventLink.href = `/services/${serviceId}/${day.getFullYear()}/${day.getMonth() + 1}/${day.getDate()}`;
                    const eventImage = document.createElement('img');
                    eventImage.src = eventCalendar[day.toDateString()] ? infoIconPath : defaultIcon;
                    eventLink.appendChild(eventImage);
                    targetCell.innerHTML = ''; // Clear existing unknown image
                    targetCell.appendChild(eventLink);
                }
            });

        } catch (error) { /* Handled by DataFetcher */ }
    }

    async handleServiceCreation() {
        const serviceName = document.getElementById('serviceNameInput').value;
        const serviceDesc = document.getElementById('serviceDescriptionInput').value;

        const payload = {
            'service[name]': serviceName,
            'service[description]': serviceDesc
        };

        try {
            const newServiceData = await this.apiClient.makeApiRequest("/api/v1/services.json", "POST", payload);
            this.serviceEntryModal.operate('close');
            document.getElementById('serviceListingBody').appendChild(this.constructServiceEntry(newServiceData, false));
            this.messageHandler.showSuccess("New service created successfully!");
        } catch (error) {
            this.messageHandler.showError("Could not create service. Please check name and description.");
        }
    }

    // --- Service Details Page ---
    populateServiceDetails(serviceIdentifier, isAdminFlag, startDate, endDate) {
        const createEventRow = (eventData) => {
            const eventDate = new Date(eventData.timestamp);
            let displayHour;
            let timePeriod;

            if (eventDate.getHours() < 12) {
                displayHour = eventDate.getHours() === 0 ? 12 : eventDate.getHours();
                timePeriod = "AM";
            } else if (eventDate.getHours() === 12) {
                displayHour = 12;
                timePeriod = "PM";
            } else {
                displayHour = eventDate.getHours() - 12;
                timePeriod = "PM";
            }

            const formattedTime = `${displayHour}:${String(eventDate.getMinutes()).padStart(2, '0')}${timePeriod}`;
            const formattedDate = `${eventDate.toLocaleString('en-US', { month: 'long', day: 'numeric' })}, ${formattedTime}`;

            const eventRow = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.textContent = formattedDate;
            eventRow.appendChild(timeCell);

            const statusCell = document.createElement('td');
            statusCell.classList.add('event-status-cell', 'highlighted-event');
            const statusImage = document.createElement('img');
            statusImage.src = eventData.informational ? "/images/status/information.png" : eventData.status.image;
            statusCell.appendChild(statusImage);
            eventRow.appendChild(statusCell);

            return eventRow;
        };

        // This part of the original function was incomplete, so I'll assume it would fetch events and populate.
        // For Type IV clone, I'll just provide the structure for `createEventRow`.
        // If there was AJAX logic here, I would implement it using apiClient.makeApiRequest.
    }
}

// Instantiate the main application controller when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const appController = new DashboardManager();

    // Example calls (assuming these functions are triggered by page loads or user actions)
    // To replicate the original "stashboard.fillLegend(isAdmin)" call:
    // appController.initializeStatusManagement(true); // Assuming isAdmin is true for admin pages

    // To replicate the original "stashboard.fillIndex()" call:
    // appController.initializeServiceOverview();

    // To replicate the original "stashboard.fillService(serviceName, isAdmin, start_date, end_date)" call:
    // appController.populateServiceDetails("my-service", false, null, null);
});