class DashboardManager {
    #categoryMap;
    #concealedSections;
    #hideMaintenanceHosts;
    #userCredentials = { user: '', password: '' };
    #sessionToken = null;
    #hostMetrics = {};
    #managedDisruptionsCount = 0;
    #activeIssuesCount = 0;
    #requester;

    constructor(requesterInstance) {
        this.#requester = requesterInstance;
        this.#categoryMap = {
            "allOthers": { label: "allHosts", hue: "#e7a000" }
        };
        this.#concealedSections = JSON.parse(localStorage.getItem('concealedViewSettings')) || {};
        this.#hideMaintenanceHosts = false;
    }

    #outputTrace(...entries) {
        const traceElement = document.getElementById('eventLog');
        if (traceElement) {
            const formattedEntries = entries.map(item => JSON.stringify(item)).join('<br>');
            traceElement.insertAdjacentHTML('beforeend', `-> ${formattedEntries}<br>`);
        }
    }

    #formatTimeInterval(totalSeconds) {
        const intervals = [
            { unit: 'd', seconds: 86400 },
            { unit: 'h', seconds: 3600 },
            { unit: 'm', seconds: 60 },
            { unit: 's', seconds: 1 }
        ];
        let remainingSeconds = totalSeconds;
        const parts = [];

        for (const interval of intervals) {
            if (remainingSeconds >= interval.seconds) {
                const value = Math.floor(remainingSeconds / interval.seconds);
                parts.push(`${value}${interval.unit}`);
                remainingSeconds -= value * interval.seconds;
            }
        }
        return parts.join(' ');
    }

    async #runWorkflow(actionSequence) {
        for (const action of actionSequence) {
            await new Promise(resolve => action(resolve));
        }
    }

    #epochToDateTime(epochSeconds) {
        return new Date(epochSeconds * 1000);
    }

    #calculateTimeSinceEpoch(epochSeconds) {
        const currentTime = Math.floor(Date.now() / 1000);
        return this.#formatTimeInterval(currentTime - epochSeconds);
    }

    async #performAuthentication() {
        if (this.#requester.isAuthenticating) return false;
        this.#requester.isAuthenticating = true;

        if (this.#userCredentials.user && this.#userCredentials.password) {
            const payload = {
                protocol: "2.0",
                identifier: 0,
                operation: "user.authenticate",
                parameters: {
                    user: this.#userCredentials.user,
                    password: this.#userCredentials.password
                }
            };
            try {
                const response = await this.#requester.sendRequest(payload);
                this.#sessionToken = response.result;
                this.#initiateMonitoring();
            } catch (error) {
                alert("Authentication failed: " + (error.message || "Unknown error"));
                location.reload();
            } finally {
                this.#requester.isAuthenticating = false;
            }
        } else {
            alert("Credentials required for access.");
            location.reload();
        }
    }

    #displayAccessPanel() {
        const loginPanel = document.getElementById('authenticationPanel');
        const usernameInput = document.getElementById('userIdentifier');
        const passwordInput = document.getElementById('secretPhrase');
        const submitButton = document.getElementById('commitCredentials');

        if (loginPanel) loginPanel.style.display = 'block';
        if (passwordInput) passwordInput.focus();

        const clickHandler = async () => {
            this.#userCredentials.user = usernameInput ? usernameInput.value : '';
            this.#userCredentials.password = passwordInput ? passwordInput.value : '';
            await this.#performAuthentication();
            if (loginPanel) loginPanel.style.display = 'none';
            this.#userCredentials.user = '';
            this.#userCredentials.password = '';
        };

        if (submitButton) {
            submitButton.removeEventListener('click', clickHandler);
            submitButton.addEventListener('click', clickHandler);
        }
    }

    async #initiateMonitoring() {
        await this.#runWorkflow([
            (next) => this.#requestServiceWindows(next),
            (next) => this.#requestHostOverview(next),
            (next) => this.#requestAlerts(next),
            () => {
                setInterval(() => this.#requestServiceWindows(() => {}), 21500);
                setInterval(() => this.#requestAlerts(() => {}), 10000);
                setInterval(() => this.#requestHostOverview(() => {}), 300000);
            }
        ]);

        const styleSheet = document.createElement('style');
        let cssRules = '';
        for (const groupKey in this.#categoryMap) {
            const groupInfo = this.#categoryMap[groupKey];
            cssRules += `.${groupInfo.label} { background-color: ${groupInfo.hue}; }`;
        }
        styleSheet.innerHTML = cssRules;
        document.head.appendChild(styleSheet);
    }

    #requestAlerts(completionCallback) {
        const queryPayload = {
            operation: "trigger.get",
            parameters: {
                selectHosts: true,
                selectGroups: true,
                activeOnly: true,
                monitoredOnly: true,
                extendedOutput: true
            },
            authentication: this.#sessionToken,
            identifier: 0,
            protocol: "2.0"
        };
        this.#requester.sendRequest(queryPayload)
            .then(response => this.#displayAlerts(response))
            .catch(error => this.#outputTrace("Error fetching alerts:", error))
            .finally(completionCallback);
    }

    #requestServiceWindows(completionCallback) {
        const queryPayload = {
            operation: "maintenance.get",
            parameters: { extendedOutput: true },
            authentication: this.#sessionToken,
            identifier: 0,
            protocol: "2.0"
        };
        this.#requester.sendRequest(queryPayload)
            .then(response => this.#displayServiceWindows(response))
            .catch(error => this.#outputTrace("Error fetching maintenances:", error))
            .finally(completionCallback);
    }

    #requestHostOverview(completionCallback) {
        const queryPayload = {
            operation: "host.get",
            parameters: {
                selectGroups: true,
                extendedOutput: true,
                activeOnly: true,
                monitoredOnly: true
            },
            authentication: this.#sessionToken,
            identifier: 0,
            protocol: "2.0"
        };
        this.#requester.sendRequest(queryPayload)
            .then(response => this.#displayHostOverview(response))
            .catch(error => this.#outputTrace("Error fetching host overview:", error))
            .finally(completionCallback);
    }

    #displayAlerts(apiResponse) {
        let processedResult = { entries: [], hostIndex: {} };
        const currentTimestamp = Date.now() / 1000;
        this.#managedDisruptionsCount = 0;
        this.#activeIssuesCount = 0;

        apiResponse.result.forEach(incident => {
            incident.hosts[0] = incident.hosts[0] || { host: "undefined", hostIdentifier: "0" };
            incident.hosts[0].hostIdentifier = incident.hosts[0].hostIdentifier || "0";

            if (incident.hosts[0].hostIdentifier === "10007") return;

            const hostAlias = incident.hosts[0].host;
            const abbreviatedHost = hostAlias.replace(/\..*$/, '');
            const inMaintenancePhase = incident.hosts[0].maintenance_status === "1";

            const hostGroupNames = this.#hostMetrics[incident.hosts[0].hostIdentifier]?.groups || [];

            incident.description = incident.hosts[0].ip === "127.0.0.1"
                ? incident.description.replace(/\{HOSTNAME\}/, abbreviatedHost)
                : incident.description.replace(/\{HOSTNAME\}/, incident.hosts[0].ip);
            incident.description = incident.description.replace(/^\d+ /, '');
            incident.description = incident.description + ": " + incident.comments;

            inMaintenancePhase ? this.#managedDisruptionsCount++ : this.#activeIssuesCount++;

            processedResult.hostIndex[hostAlias] = processedResult.hostIndex[hostAlias] || {
                hostAlias: hostAlias,
                hostGroups: hostGroupNames,
                isVisible: (() => {
                    let visibility = false;
                    for (const groupName of hostGroupNames) {
                        if (this.#categoryMap.hasOwnProperty(groupName)) {
                            visibility = true;
                            break;
                        }
                    }
                    return incident.value !== "0" && visibility;
                })(),
                hostStyleClass: (() => {
                    let cssClasses = '';
                    for (const groupName of hostGroupNames) {
                        if (this.#categoryMap.hasOwnProperty(groupName)) {
                            cssClasses = this.#categoryMap[groupName].label;
                            break;
                        }
                    }
                    if (inMaintenancePhase) cssClasses += " underMaintenance";
                    return cssClasses;
                })(),
                incidents: []
            };

            processedResult.hostIndex[hostAlias].incidents.push({
                summary: incident.description,
                isRecent: incident.lastchange > (currentTimestamp - 1800),
                elapsedTime: this.#calculateTimeSinceEpoch(incident.lastchange),
                incidentId: incident.triggerid,
                eventTimestamp: incident.lastchange
            });
        });

        for (const alias in processedResult.hostIndex) {
            const hostEntry = processedResult.hostIndex[alias];
            hostEntry.incidents.sort((a, b) => b.eventTimestamp - a.eventTimestamp);

            const incidentCount = hostEntry.incidents.length;
            if (incidentCount > 1 && hostEntry.incidents[0].eventTimestamp < (currentTimestamp - 90000)) {
                hostEntry.isCollapsed = true;
                hostEntry.incidents.unshift({
                    summary: `This host has ${incidentCount} issues`,
                    isVisible: true,
                    isRecent: false,
                    elapsedTime: hostEntry.incidents[0].elapsedTime,
                    eventTimestamp: hostEntry.incidents[0].eventTimestamp
                });
            }
            processedResult.entries.push(hostEntry);
        }

        processedResult.entries.sort((a, b) => b.incidents[0].eventTimestamp - a.incidents[0].eventTimestamp);

        const alertsContainer = document.getElementById('issueDisplay');
        if (!alertsContainer) return;

        alertsContainer.innerHTML = '';

        for (const hostEntry of processedResult.entries) {
            const hostDiv = document.createElement('div');
            hostDiv.className = `host-card ${hostEntry.hostStyleClass}`;

            if (!hostEntry.isVisible || (this.#hideMaintenanceHosts && hostEntry.hostStyleClass.includes('underMaintenance'))) {
                hostDiv.style.display = 'none';
            }

            const hostHeader = document.createElement('h3');
            hostHeader.textContent = hostEntry.hostAlias;
            hostDiv.appendChild(hostHeader);

            const incidentList = document.createElement('ul');
            hostEntry.incidents.forEach((incident, index) => {
                const incidentItem = document.createElement('li');
                incidentItem.className = `incident-item ${incident.isRecent ? 'fresh-incident' : ''} ${hostEntry.isCollapsed && index > 0 ? 'collapsed-incident' : ''}`;
                incidentItem.innerHTML = `
                    <span class="incident-summary">${incident.summary}</span>
                    <span class="incident-duration">${incident.elapsedTime}</span>
                `;
                incidentList.appendChild(incidentItem);
            });
            hostDiv.appendChild(incidentList);

            if (hostEntry.isCollapsed) {
                const expandButton = document.createElement('button');
                expandButton.className = 'expand-toggle';
                expandButton.textContent = 'Toggle Details';
                expandButton.addEventListener('click', () => {
                    hostDiv.querySelectorAll('.collapsed-incident').forEach(item => {
                        item.style.display = item.style.display === 'none' ? 'list-item' : 'none';
                    });
                });
                hostDiv.appendChild(expandButton);
            }
            alertsContainer.appendChild(hostDiv);
        }

        for (const groupKey in this.#concealedSections) {
            document.querySelectorAll(`.host-card.${groupKey}`).forEach(el => el.style.display = 'none');
        }

        document.querySelectorAll('.incident-summary, .maintenance-entry > .name').forEach(element => {
            element.addEventListener('mouseover', function() {
                this.style.background = 'linear-gradient(to top, #c1c1c1, #a8a8a8)';
                this.style.borderRadius = '3px';
                this.style.color = '#333';
            });
            element.addEventListener('mouseout', function() {
                this.style.background = '';
                this.style.borderRadius = '';
                this.style.color = '#ddd';
            });
        });
    }

    #displayServiceWindows(apiResponse) {
        const maintenanceContainer = document.getElementById('scheduledEvents');
        if (!maintenanceContainer) return;

        const currentTimestamp = Date.now() / 1000;
        let headerText = 'Scheduled Events <span id="headerConcealed">(hidden)</span>';

        apiResponse.result.forEach(event => {
            event.statusClass = (() => {
                if (event.active_till < currentTimestamp) return "event-expired";
                if (event.active_since > currentTimestamp) return "event-pending";
                return "";
            })();
            event.displayCondition = (() => {
                return !(event.description.includes('system.filtered') || event.active_till < (currentTimestamp - 7200));
            })();
        });

        maintenanceContainer.innerHTML = `
            <h2 id="eventHeader">${headerText}</h2>
            <div class="event-list">
                ${apiResponse.result.filter(e => e.displayCondition).map(event => `
                    <div class="maintenance-entry ${event.statusClass}">
                        <span class="event-description">${event.description}</span>
                        <span class="event-period">From: ${this.#epochToDateTime(event.active_since).toLocaleString()} To: ${this.#epochToDateTime(event.active_till).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        `;

        const eventHeader = document.getElementById('eventHeader');
        if (eventHeader) {
            eventHeader.addEventListener('click', () => {
                const underMaintenanceElements = document.querySelectorAll('.host-card.underMaintenance');
                if (this.#hideMaintenanceHosts) {
                    eventHeader.innerHTML = 'Scheduled Events';
                    underMaintenanceElements.forEach(el => el.style.display = '');
                    this.#hideMaintenanceHosts = false;
                } else {
                    eventHeader.innerHTML = headerText;
                    underMaintenanceElements.forEach(el => el.style.display = 'none');
                    this.#hideMaintenanceHosts = true;
                }
            });
        }
    }

    #displayHostOverview(apiResponse) {
        delete this.#hostMetrics;
        let groupCollection = {};
        let processedStats = {};
        this.#hostMetrics = {};
        this.#hostMetrics[0] = { groups: [] };

        apiResponse.result.forEach(host => {
            this.#hostMetrics[host.hostid] = this.#hostMetrics[host.hostid] || {};
            this.#hostMetrics[host.hostid].groups = this.#hostMetrics[host.hostid].groups || [];
            host.groups.forEach(group => {
                this.#hostMetrics[host.hostid].groups.push(group.name);
                this.#hostMetrics[host.hostid].groups.unshift("allOthers");
                groupCollection[group.name] = null;
            });
        });
        groupCollection["allOthers"] = null;

        const groupListForDisplay = [];
        for (const groupName in groupCollection) {
            const groupDetails = this.#categoryMap[groupName];
            groupListForDisplay.push({
                groupLabel: groupDetails?.label,
                groupClass: groupDetails?.label
            });
        }
        processedStats.visibleGroups = groupListForDisplay;
        processedStats.managedDisruptions = this.#managedDisruptionsCount;
        processedStats.activeIssues = this.#activeIssuesCount;

        const overviewContainer = document.getElementById('environmentOverview');
        if (!overviewContainer) return;

        overviewContainer.innerHTML = `
            <div class="overview-header">
                <h3>Overall Status</h3>
                <button id="collapseGroups" class="control-button">-</button>
                <button id="expandGroups" class="control-button">+</button>
            </div>
            <div class="group-summary">
                <p>Managed Disruptions: ${processedStats.managedDisruptions}</p>
                <p>Active Issues: ${processedStats.activeIssues}</p>
            </div>
            <ul id="groupDisplayList">
                ${processedStats.visibleGroups.map(group => `
                    <li class="group-item ${group.groupClass}">
                        <span class="group-name">${group.groupLabel}</span>
                    </li>
                `).join('')}
            </ul>
        `;

        const collapseBtn = document.getElementById('collapseGroups');
        const expandBtn = document.getElementById('expandGroups');
        const groupDisplayList = document.getElementById('groupDisplayList');

        if (collapseBtn) {
            collapseBtn.addEventListener('mouseover', () => collapseBtn.style.background = '#333');
            collapseBtn.addEventListener('mouseout', () => collapseBtn.style.background = '');
            collapseBtn.addEventListener('click', () => {
                groupDisplayList.querySelectorAll('.group-item').forEach(item => item.style.display = 'none');
            });
        }
        if (expandBtn) {
            expandBtn.addEventListener('mouseover', () => expandBtn.style.background = '#333');
            expandBtn.addEventListener('mouseout', () => expandBtn.style.background = '');
            expandBtn.addEventListener('click', () => {
                groupDisplayList.querySelectorAll('.group-item').forEach(item => item.style.display = 'list-item');
            });
        }

        const getGroupHue = (groupLabel) => {
            for (const key in this.#categoryMap) {
                if (this.#categoryMap[key].label === groupLabel) {
                    return this.#categoryMap[key].hue;
                }
            }
            return '';
        };

        groupDisplayList.querySelectorAll('.group-item').forEach(groupElement => {
            const groupLabel = groupElement.querySelector('.group-name')?.textContent;
            if (groupLabel) {
                const hue = getGroupHue(groupLabel);
                groupElement.style.backgroundColor = hue;

                groupElement.addEventListener('click', () => {
                    const currentGroupClass = groupElement.classList[1];
                    let isHidden = this.#concealedSections.hasOwnProperty(currentGroupClass);

                    if (isHidden) {
                        groupElement.style.backgroundColor = hue;
                        document.querySelectorAll(`.host-card.${currentGroupClass}`).forEach(el => el.style.display = '');
                        delete this.#concealedSections[currentGroupClass];
                    } else {
                        groupElement.style.backgroundColor = "#555";
                        document.querySelectorAll(`.host-card.${currentGroupClass}`).forEach(el => el.style.display = 'none');
                        this.#concealedSections[currentGroupClass] = true;
                    }
                    localStorage.setItem('concealedViewSettings', JSON.stringify(this.#concealedSections));
                });

                if (this.#concealedSections.hasOwnProperty(groupLabel)) {
                    groupElement.style.backgroundColor = "#555";
                    document.querySelectorAll(`.host-card.${groupLabel}`).forEach(el => el.style.display = 'none');
                }
            }
        });
    }

    startApplication() {
        this.#displayAccessPanel();
    }
}

class NetworkGateway {
    #endpointUrl = "/api_jsonrpc.php";
    #authenticating = false;

    get isAuthenticating() {
        return this.#authenticating;
    }

    set isAuthenticating(value) {
        this.#authenticating = value;
    }

    async sendRequest(requestData) {
        const errorDisplay = document.getElementById('systemError');

        try {
            const response = await fetch(this.#endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseJson = await response.json();

            if (responseJson === null || responseJson.error) {
                const errorMessage = JSON.stringify(responseJson === null ? "Connection timed out or invalid response" : responseJson.error);
                if (errorDisplay) {
                    errorDisplay.innerHTML = `API Error<div id='errorDetails'>(${errorMessage})</div>`;
                    errorDisplay.style.display = 'block';
                }
                throw new Error("API responded with an error: " + errorMessage);
            } else {
                if (errorDisplay) errorDisplay.style.display = 'none';
                return responseJson;
            }
        } catch (fetchError) {
            if (errorDisplay) {
                errorDisplay.innerHTML = `Network Error<div id='errorDetails'>(${fetchError.message})</div>`;
                errorDisplay.style.display = 'block';
            }
            throw fetchError;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const apiHandler = new NetworkGateway();
    const appInstance = new DashboardManager(apiHandler);
    appInstance.startApplication();
});