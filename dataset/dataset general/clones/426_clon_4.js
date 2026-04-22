document.addEventListener('DOMContentLoaded', function() {

    // --- Core Communication Mechanism (Simple Pub/Sub) ---
    const centralDispatcher = (() => {
        const messageHandlers = {};

        function registerListener(messageType, processor) {
            if (!messageHandlers[messageType]) {
                messageHandlers[messageType] = [];
            }
            messageHandlers[messageType].push(processor);
        }

        function broadcastMessage(messageType, payload) {
            if (messageHandlers[messageType]) {
                messageHandlers[messageType].forEach(processor => processor(payload));
            }
        }
        return { registerListener, broadcastMessage };
    })();

    // --- Application Data Repository (Replaces Backbone Models/Collections) ---
    const applicationDataRepository = (() => {
        let mainActivityRecords = [];
        let participantActivityRecords = [];
        let currentFocusRemarks = [];
        let currentFocusId = null;

        // Simulate fetching data from a backend
        const simulatedBackend = {
            obtainAllActivityRecords: () => new Promise(resolve => {
                setTimeout(() => resolve([
                    { uniqueId: 'event_alpha', designation: 'Tech Summit', synopsis: 'Deep dive into emerging tech trends.', participantCount: 10, hasJoined: false },
                    { uniqueId: 'event_beta', designation: 'Creative Workshop', synopsis: 'Hands-on design thinking session.', participantCount: 5, hasJoined: true },
                    { uniqueId: 'event_gamma', designation: 'Startup Pitch Day', synopsis: 'Showcasing innovative new ventures.', participantCount: 20, hasJoined: false }
                ]), 100); // Short delay
            }),
            obtainParticipantActivityRecords: () => new Promise(resolve => {
                setTimeout(() => resolve([
                    { uniqueId: 'event_beta', designation: 'Creative Workshop', synopsis: 'Hands-on design thinking session.', participantCount: 5, hasJoined: true }
                ]), 150); // Short delay
            }),
            obtainActivityRemarks: (activityId) => new Promise(resolve => {
                setTimeout(() => {
                    const remarks = {
                        'event_alpha': [{ commentText: 'Excited to attend!' }, { commentText: 'Will definitely be there.' }],
                        'event_beta': [{ commentText: 'Fantastic topic!' }],
                        'event_gamma': []
                    };
                    resolve(remarks[activityId] || []);
                }, 100); // Short delay
            })
        };

        async function retrieveAllActivityData() {
            mainActivityRecords = await simulatedBackend.obtainAllActivityRecords();
            centralDispatcher.broadcastMessage('allActivitiesUpdated', mainActivityRecords);
        }

        async function retrieveParticipantActivityData() {
            participantActivityRecords = await simulatedBackend.obtainParticipantActivityRecords();
            centralDispatcher.broadcastMessage('participantActivitiesUpdated', participantActivityRecords);
        }

        async function retrieveFocusRemarks(activityIdentifier) {
            currentFocusId = activityIdentifier;
            currentFocusRemarks = await simulatedBackend.obtainActivityRemarks(activityIdentifier);
            centralDispatcher.broadcastMessage('focusRemarksUpdated', currentFocusRemarks);
        }

        function modifyActivityEnrollment(activityIdentifier, newEnrollmentStatus) {
            const updateActivityList = (list) => list.map(activity => {
                if (activity.uniqueId === activityIdentifier) {
                    const updatedActivity = {
                        ...activity,
                        hasJoined: newEnrollmentStatus,
                        participantCount: activity.participantCount + (newEnrollmentStatus ? 1 : -1)
                    };
                    // If joining, add to participant list if not already present
                    if (newEnrollmentStatus && !participantActivityRecords.some(a => a.uniqueId === activityIdentifier)) {
                        participantActivityRecords.push(updatedActivity);
                        centralDispatcher.broadcastMessage('participantActivityAdded', updatedActivity);
                    }
                    // If un-joining, remove from participant list
                    if (!newEnrollmentStatus) {
                        participantActivityRecords = participantActivityRecords.filter(a => a.uniqueId !== activityIdentifier);
                        centralDispatcher.broadcastMessage('participantActivityRemoved', activityIdentifier);
                    }
                    return updatedActivity;
                }
                return activity;
            });

            mainActivityRecords = updateActivityList(mainActivityRecords);
            participantActivityRecords = updateActivityList(participantActivityRecords);
            centralDispatcher.broadcastMessage('allActivitiesUpdated', mainActivityRecords);
            centralDispatcher.broadcastMessage('participantActivitiesUpdated', participantActivityRecords);
            centralDispatcher.broadcastMessage('activityDetailsRefreshed', findSingleActivity(activityIdentifier));
        }

        function submitNewRemark(activityIdentifier, remarkContent) {
            if (currentFocusId === activityIdentifier) {
                const newRemark = { commentText: remarkContent };
                currentFocusRemarks.push(newRemark);
                centralDispatcher.broadcastMessage('newRemarkPosted', newRemark);
                centralDispatcher.broadcastMessage('activityDetailsRefreshed', findSingleActivity(activityIdentifier));
            }
        }

        function findSingleActivity(activityIdentifier) {
            return mainActivityRecords.find(a => a.uniqueId === activityIdentifier) ||
                   participantActivityRecords.find(a => a.uniqueId === activityIdentifier);
        }

        function getFocusRemarks() {
            return currentFocusRemarks;
        }

        function getAllActivityData() { return [...mainActivityRecords]; }
        function getParticipantActivityData() { return [...participantActivityRecords]; }

        return {
            retrieveAllActivityData, retrieveParticipantActivityData, retrieveFocusRemarks,
            modifyActivityEnrollment, submitNewRemark,
            getAllActivityData, getParticipantActivityData, findSingleActivity, getFocusRemarks
        };
    })();

    // --- User Interface Renderers (Replaces Backbone Views) ---

    // Simple template functions (Replaces ich/Handlebars)
    const generateActivityOverview = (activityItem) => `
        <div class="activity-overview-card" data-record-id="${activityItem.uniqueId}">
            <div class="activity-heading" data-action="display-info">${activityItem.designation}</div>
            <div class="activity-summary">${activityItem.synopsis}</div>
            <div class="activity-stats">
                Participants: <span class="participant-total">${activityItem.participantCount}</span>
                <button class="action-enroll" data-action="toggle-enrollment">
                    ${activityItem.hasJoined ? 'Leave' : 'Join'}
                </button>
            </div>
        </div>
    `;

    const generateDetailedActivityView = (activityItem, remarkCount = 0) => `
        <div class="detailed-activity-display" data-record-id="${activityItem.uniqueId}">
            <h2 class="detailed-heading">${activityItem.designation}</h2>
            <p class="detailed-summary">${activityItem.synopsis}</p>
            <div class="detailed-stats">
                Participants: <span class="participant-total">${activityItem.participantCount}</span>
                <button class="action-enroll" data-action="toggle-enrollment">
                    ${activityItem.hasJoined ? 'Leave' : 'Join'}
                </button>
                <div class="remark-summary">Remarks: <span class="remark-total">${remarkCount}</span></div>
            </div>
        </div>
    `;

    const generateRemarkEntry = (remarkEntry) => `<div>Speaker: ${remarkEntry.commentText}</div>`;

    // UI Component Management
    const uiComponentManager = (() => {

        const mainFeedOutput = document.getElementById('main-feed-container');
        const personalFeedOutput = document.getElementById('my-feed-container');
        const alternatePersonalFeedOutput = document.getElementById('my-feed-alternate-container');
        const detailInfoOutput = document.getElementById('detailed-info-container');
        const remarksListOutput = document.getElementById('remarks-list-container');
        const remarkEntryField = document.getElementById('new-remark-input');
        const remarkSubmissionButton = document.getElementById('submit-new-remark');

        function attachActivityCardInteractions(parentElement, interactionCallbacks) {
            parentElement.querySelectorAll('.activity-overview-card').forEach(card => {
                const recordId = card.dataset.recordId;
                card.querySelector('[data-action="display-info"]').addEventListener('click', () => interactionCallbacks.viewDetails(recordId));
                card.querySelector('[data-action="toggle-enrollment"]').addEventListener('click', (event) => {
                    const currentStatus = event.target.textContent.includes('Leave');
                    interactionCallbacks.toggleEnrollment(recordId, !currentStatus);
                });
            });
        }

        function attachDetailedActivityInteractions(parentElement, interactionCallbacks) {
             const enrollmentButton = parentElement.querySelector('.action-enroll');
             if (enrollmentButton) {
                 enrollmentButton.addEventListener('click', (event) => {
                     const recordId = parentElement.querySelector('.detailed-activity-display').dataset.recordId;
                     const currentStatus = event.target.textContent.includes('Leave');
                     interactionCallbacks.toggleEnrollment(recordId, !currentStatus);
                 });
             }
        }

        function renderMainActivityList(activities) {
            mainFeedOutput.innerHTML = activities.map(generateActivityOverview).join('');
            attachActivityCardInteractions(mainFeedOutput, {
                viewDetails: pageNavigationSystem.displayDetailedSection,
                toggleEnrollment: applicationDataRepository.modifyActivityEnrollment
            });
        }

        function renderParticipantActivityList(activities) {
            personalFeedOutput.innerHTML = activities.map(generateActivityOverview).join('');
            attachActivityCardInteractions(personalFeedOutput, {
                viewDetails: pageNavigationSystem.displayDetailedSection,
                toggleEnrollment: applicationDataRepository.modifyActivityEnrollment
            });
        }

        function addParticipantActivityItem(activity) {
             const newCardWrapper = document.createElement('div');
             newCardWrapper.innerHTML = generateActivityOverview(activity);
             personalFeedOutput.appendChild(newCardWrapper.firstElementChild);
             attachActivityCardInteractions(newCardWrapper, {
                viewDetails: pageNavigationSystem.displayDetailedSection,
                toggleEnrollment: applicationDataRepository.modifyActivityEnrollment
            });
        }

        function renderAlternateParticipantActivityList(activities) {
            alternatePersonalFeedOutput.innerHTML = activities.map(generateActivityOverview).join('');
            attachActivityCardInteractions(alternatePersonalFeedOutput, {
                viewDetails: pageNavigationSystem.displayDetailedSection,
                toggleEnrollment: applicationDataRepository.modifyActivityEnrollment
            });
        }

        function renderDetailedActivityInfo(activity) {
            const currentRemarksCount = applicationDataRepository.getFocusRemarks().length;
            detailInfoOutput.innerHTML = generateDetailedActivityView(activity, currentRemarksCount);
            attachDetailedActivityInteractions(detailInfoOutput, {
                toggleEnrollment: applicationDataRepository.modifyActivityEnrollment
            });
        }

        function renderActivityRemarks(remarks) {
            remarksListOutput.innerHTML = remarks.map(generateRemarkEntry).join('');
        }

        function appendActivityRemark(remark) {
            remarksListOutput.insertAdjacentHTML('beforeend', generateRemarkEntry(remark));
        }

        function configureRemarkInput(activityId) {
            if (remarkSubmissionButton) {
                remarkSubmissionButton.onclick = () => {
                    const text = remarkEntryField.value.trim();
                    if (text) {
                        applicationDataRepository.submitNewRemark(activityId, text);
                        remarkEntryField.value = '';
                    }
                };
            }
        }

        return {
            renderMainActivityList,
            renderParticipantActivityList, addParticipantActivityItem,
            renderAlternateParticipantActivityList,
            renderDetailedActivityInfo, renderActivityRemarks, appendActivityRemark,
            configureRemarkInput
        };
    })();

    // --- Page Routing & Tab Management (Replaces App/Page Views) ---
    const pageNavigationSystem = (() => {
        const tabControlPanel = document.getElementById('main-tab-navigation');
        const contentAreas = {
            'main-home-area': document.getElementById('home-screen-content'),
            'my-events-area': document.getElementById('my-activities-screen-content'),
            'detail-info-area': document.getElementById('activity-details-screen-content')
        };
        let currentDisplayedActivityId = null;

        function activateContentTab(tabKey) {
            // Deactivate all navigation buttons
            tabControlPanel.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            // Activate target button
            const targetButton = tabControlPanel.querySelector(`[data-nav-target="${tabKey}"]`);
            if (targetButton) {
                targetButton.classList.add('active');
            }

            // Hide all content areas
            Object.values(contentAreas).forEach(area => area.style.display = 'none');
            // Show relevant content area
            if (tabKey === 'home') {
                contentAreas['main-home-area'].style.display = 'block';
            } else if (tabKey === 'personal') {
                contentAreas['my-events-area'].style.display = 'block';
            } else if (tabKey === 'detail') {
                contentAreas['detail-info-area'].style.display = 'block';
            }
        }

        function displayHomeScreen() {
            activateContentTab('home');
            applicationDataRepository.retrieveAllActivityData();
            applicationDataRepository.retrieveParticipantActivityData();
        }

        function displayPersonalEventsScreen() {
            activateContentTab('personal');
            applicationDataRepository.retrieveParticipantActivityData();
        }

        function displayDetailedSection(activityIdentifier) {
            activateContentTab('detail');
            currentDisplayedActivityId = activityIdentifier;
            const activityRecord = applicationDataRepository.findSingleActivity(activityIdentifier);
            if (activityRecord) {
                uiComponentManager.renderDetailedActivityInfo(activityRecord);
                applicationDataRepository.retrieveFocusRemarks(activityIdentifier);
                uiComponentManager.configureRemarkInput(activityIdentifier);
            } else {
                console.warn(`Activity with ID ${activityIdentifier} not found.`);
            }
        }

        function initializeTabListeners() {
            tabControlPanel.querySelector('[data-nav-target="home"]').addEventListener('click', displayHomeScreen);
            tabControlPanel.querySelector('[data-nav-target="personal"]').addEventListener('click', displayPersonalEventsScreen);
            // The detail tab is activated programmatically
        }

        return {
            displayHomeScreen, displayPersonalEventsScreen, displayDetailedSection, initializeTabListeners
        };
    })();

    // --- Main Application Orchestrator (Replaces global `app` instance) ---
    const primaryApplicationManager = (() => {
        function commenceOperation() {
            // Link data changes to UI rendering
            centralDispatcher.registerListener('allActivitiesUpdated', uiComponentManager.renderMainActivityList);
            centralDispatcher.registerListener('participantActivitiesUpdated', (activities) => {
                uiComponentManager.renderParticipantActivityList(activities);
                uiComponentManager.renderAlternateParticipantActivityList(activities);
            });
            centralDispatcher.registerListener('participantActivityAdded', uiComponentManager.addParticipantActivityItem);

            centralDispatcher.registerListener('activityDetailsRefreshed', (activity) => {
                // If the refreshed activity is the one currently in detail view
                if (activity.uniqueId === applicationDataRepository.findSingleActivity(activity.uniqueId)?.uniqueId) {
                    uiComponentManager.renderDetailedActivityInfo(activity);
                }
                // Also update main and personal lists to reflect enrollment changes
                uiComponentManager.renderMainActivityList(applicationDataRepository.getAllActivityData());
                uiComponentManager.renderParticipantActivityList(applicationDataRepository.getParticipantActivityData());
                uiComponentManager.renderAlternateParticipantActivityList(applicationDataRepository.getParticipantActivityData());
            });

            centralDispatcher.registerListener('focusRemarksUpdated', uiComponentManager.renderActivityRemarks);
            centralDispatcher.registerListener('newRemarkPosted', (newRemark) => {
                uiComponentManager.appendActivityRemark(newRemark);
                // Re-render detail card to update remark count
                const currentActivity = applicationDataRepository.findSingleActivity(applicationDataRepository.findSingleActivity(newRemark.activityId)?.uniqueId);
                if (currentActivity) {
                   uiComponentManager.renderDetailedActivityInfo(currentActivity);
                }
            });

            // Setup primary navigation
            pageNavigationSystem.initializeTabListeners();

            // Load initial view
            pageNavigationSystem.displayHomeScreen();
        }

        return { commenceOperation };
    })();

    // Initiate the application's lifecycle
    primaryApplicationManager.commenceOperation();
});

// Assumed HTML structure for the cloning to work:
/*
<div id="main-tab-navigation">
    <button class="nav-button active" data-nav-target="home">Main Hub</button>
    <button class="nav-button" data-nav-target="personal">My Enrollments</button>
    <button class="nav-button" data-nav-target="detail">Enrollment Info</button>
</div>

<div id="home-screen-content" style="display: block;">
    <h2>All Activities</h2>
    <div id="main-feed-container"></div>
    <h2>My Activities (Home View)</h2>
    <div id="my-feed-container"></div>
</div>

<div id="my-activities-screen-content" style="display: none;">
    <h2>My Personal Activities</h2>
    <div id="my-feed-alternate-container"></div>
</div>

<div id="activity-details-screen-content" style="display: none;">
    <div id="detailed-info-container"></div>
    <h3>Remarks Section</h3>
    <div id="remarks-list-container"></div>
    <div class="remark-entry-area">
        <input type="text" id="new-remark-input" placeholder="Add your comment...">
        <button id="submit-new-remark">Post Remark</button>
    </div>
</div>
*/