const maxPersonLabelLen = 19;
const maxNoteLen = 500;

const globalScheduleState = {
    meetingDescriptor: null,
    registeredAttendees: new Map(), // Maps participant ID to object { name, choices, isViewer, elementRef }
    eventTimeSegments: new Map(),   // Maps time segment ID to object { label, approvals, rejections, elementRef }
    viewerParticipantId: null,
    activeTimeSegmentIdentifiers: [], // Ordered list of time segment IDs
    activeDisplayMode: {
        type: null, // 'attendee' or 'timeSegment'
        identifier: null  // ID of the currently selected attendee or time segment
    },
    persistenceTaskHandle: null // For setTimeout
};

// Assuming gettext is a global function from the original environment
// Fallback if not available
function obtainText(key) {
    return typeof gettext === 'function' ? gettext(key) : key;
}

// Replaces jQuery's .css('display', value)
function adjustVisibility(elements, displayValue) {
    if (!Array.isArray(elements)) {
        elements = [elements];
    }
    elements.forEach(elem => {
        if (elem) elem.style.display = displayValue;
    });
}

// Replaces jQuery's .toggleClass(className, force)
function toggleCssClass(element, className, force) {
    if (element) {
        if (force === true) {
            element.classList.add(className);
        } else if (force === false) {
            element.classList.remove(className);
        } else {
            element.classList.toggle(className);
        }
    }
}

// Replaces jQuery's .empty()
function clearContents(element) {
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

// Replaces jQuery's .data() for storing complex objects directly on elements
const elementDataRegistry = new WeakMap(); // Prevents memory leaks by not holding strong references

function storeElementData(element, key, value) {
    let data = elementDataRegistry.get(element);
    if (!data) {
        data = {};
        elementDataRegistry.set(element, data);
    }
    data[key] = value;
}

function retrieveElementData(element, key) {
    const data = elementDataRegistry.get(element);
    return data ? data[key] : undefined;
}

// Schedules a save operation after a delay
function scheduleDataPersistence() {
    if (globalScheduleState.persistenceTaskHandle) {
        clearTimeout(globalScheduleState.persistenceTaskHandle);
    }
    globalScheduleState.persistenceTaskHandle = setTimeout(() => {
        commitRecords(true);
    }, 5000);
    const saveBtn = document.querySelector('.save button');
    if (saveBtn) saveBtn.disabled = false;
}

// Commits user availability data to the server
async function commitRecords(isAsynchronous) {
    clearTimeout(globalScheduleState.persistenceTaskHandle);
    globalScheduleState.persistenceTaskHandle = null;

    const viewerAttendee = globalScheduleState.registeredAttendees.get(globalScheduleState.viewerParticipantId);
    if (!viewerAttendee) {
        console.error("Viewer's attendee data not found for saving.");
        return;
    }

    const compiledAvailability = globalScheduleState.activeTimeSegmentIdentifiers.map(segmentId => {
        const choice = viewerAttendee.choices.get(segmentId);
        const status = choice ? choice[0] : 0;
        const note = choice ? choice[1] : '';
        return `${segmentId}:${status}:${note}`;
    }).join('\n');

    const statusDisplay = document.querySelector('.appointment .status');
    const saveButton = document.querySelector('.save button');

    try {
        const response = await fetch('/set-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                id: window.sessionIdentifier, // Assuming window.sessionIdentifier holds the meeting ID
                a: compiledAvailability
            }).toString()
        });

        if (!response.ok) throw new Error('Network response not ok.');

        const now = new Date();
        const formattedTime = [
            now.getHours().toString().padStart(2, '0'),
            now.getMinutes().toString().padStart(2, '0'),
            now.getSeconds().toString().padStart(2, '0')
        ].join(':');
        if (statusDisplay) statusDisplay.textContent = `${obtainText('Automatically saved on ')} ${formattedTime}.`;
        if (saveButton) saveButton.disabled = true;

    } catch (error) {
        console.error('Error saving availability:', error);
        if (statusDisplay) statusDisplay.textContent = `${obtainText('Sorry, your availability could not be saved.')} ${obtainText('Please try again.')}`;
    }
}

// Updates the visual bar for a time segment item
function refreshStatusIndicator(timeSegmentElement) {
    const segmentData = retrieveElementData(timeSegmentElement, 'timeSegmentData');
    if (!segmentData) return;

    const totalParticipants = globalScheduleState.registeredAttendees.size;
    if (totalParticipants === 0) return;

    const totalWidth = 105;
    const yesWidth = (segmentData.approvals / totalParticipants) * totalWidth;
    const noWidth = (segmentData.rejections / totalParticipants) * totalWidth;
    const middleWidth = totalWidth - yesWidth - noWidth;

    if (middleWidth < 0 || middleWidth > totalWidth) return;

    const barElement = timeSegmentElement.querySelector('.bar');
    if (barElement) {
        barElement.style.borderLeftWidth = `${yesWidth}px`;
        barElement.style.borderRightWidth = `${noWidth}px`;
        barElement.style.width = `${middleWidth}px`;
    }
}

// Handles selection of an item (attendee or time segment) in the UI
function designateItem(selectedElement) {
    const parentContainer = selectedElement.closest('.select');
    if (parentContainer) {
        parentContainer.querySelectorAll('li').forEach(li => {
            toggleCssClass(li, 'selected', false);
        });
    }
    toggleCssClass(selectedElement, 'selected', true);
    const availabilityDisplay = document.querySelector('.appointment .availability');
    clearContents(availabilityDisplay);
}

// Builds the interactive availability module for a specific attendee and time segment
function buildInteractionModule(attendeeInfo, timeSegmentIdentifier) {
    const interactionContainer = document.createElement('div');
    interactionContainer.className = 'availability';

    // Retrieve choice; default to [0, ''] if not set
    const segmentChoice = attendeeInfo.choices.get(timeSegmentIdentifier) || [0, ''];
    const initialStatus = segmentChoice[0];
    const initialComment = segmentChoice[1];

    const statusClassesMap = { '-1': 'no', '0': 'maybe', '1': 'yes' };

    if (attendeeInfo.isViewer) {
        toggleCssClass(interactionContainer, 'form', true);

        const choiceGroup = document.createElement('div');
        choiceGroup.className = 'choose';

        const choiceButtonsConfig = [
            { value: 1, labelClass: 'label-yes' },
            { value: 0, labelClass: 'label-maybe' },
            { value: -1, labelClass: 'label-no' }
        ];

        choiceButtonsConfig.forEach((btnConfig) => {
            const buttonElement = document.createElement('div');
            buttonElement.className = `toggle ${btnConfig.labelClass}`;
            storeElementData(buttonElement, 'choiceValue', btnConfig.value);
            choiceGroup.appendChild(buttonElement);

            buttonElement.addEventListener('click', (event) => {
                const currentChoiceValue = retrieveElementData(event.currentTarget, 'choiceValue');
                const previousChoiceValue = segmentChoice[0];

                if (currentChoiceValue === previousChoiceValue) return;

                // Update UI for choice buttons
                choiceButtonsConfig.forEach(b => {
                    const btn = choiceGroup.querySelector(`.${b.labelClass}`);
                    toggleCssClass(btn, 'checked', false);
                });
                toggleCssClass(event.currentTarget, 'checked', true);

                // Update data model for the specific attendee's choice
                segmentChoice[0] = currentChoiceValue;
                attendeeInfo.choices.set(timeSegmentIdentifier, segmentChoice);

                // Update global counts for the time segment
                const affectedTimeSegment = globalScheduleState.eventTimeSegments.get(timeSegmentIdentifier);
                if (affectedTimeSegment) {
                    if (previousChoiceValue === 1) affectedTimeSegment.approvals--;
                    if (previousChoiceValue === -1) affectedTimeSegment.rejections--;
                    if (currentChoiceValue === 1) affectedTimeSegment.approvals++;
                    if (currentChoiceValue === -1) affectedTimeSegment.rejections++;

                    const segmentElement = retrieveElementData(affectedTimeSegment, 'elementRef');
                    if (segmentElement) refreshStatusIndicator(segmentElement);
                }

                // Update interaction container class
                toggleCssClass(interactionContainer, statusClassesMap[previousChoiceValue], false);
                toggleCssClass(interactionContainer, statusClassesMap[currentChoiceValue], true);

                scheduleDataPersistence();
            });
        });

        // Set initial checked state based on data
        const selectedButtonConfig = choiceButtonsConfig.find(b => b.value === initialStatus);
        if (selectedButtonConfig) {
            toggleCssClass(choiceGroup.querySelector(`.${selectedButtonConfig.labelClass}`), 'checked', true);
        } else {
            toggleCssClass(choiceGroup.querySelector(`.label-maybe`), 'checked', true); // Default to 'maybe'
        }

        interactionContainer.appendChild(choiceGroup);
        toggleCssClass(interactionContainer, statusClassesMap[initialStatus], true);


        const commentInput = document.createElement('textarea');
        commentInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') event.preventDefault();
        });
        const handleCommentChange = (event) => {
            let currentText = event.target.value;
            if (currentText.length > maxNoteLen) {
                currentText = currentText.substring(0, maxNoteLen);
                event.target.value = currentText;
            }
            segmentChoice[1] = currentText;
            attendeeInfo.choices.set(timeSegmentIdentifier, segmentChoice);
            scheduleDataPersistence();
        };
        commentInput.addEventListener('keyup', handleCommentChange);
        commentInput.addEventListener('blur', handleCommentChange);
        commentInput.value = initialComment;
        interactionContainer.appendChild(commentInput);

    } else { // Not the viewer
        toggleCssClass(interactionContainer, 'static', true);

        const statusDisplay = document.createElement('div');
        statusDisplay.className = 'possible';
        const statusLabel = document.createElement('div');

        const effectiveStatus = initialStatus; // Use initialStatus for non-viewer
        toggleCssClass(interactionContainer, statusClassesMap[effectiveStatus], true);
        statusLabel.className = `label-${statusClassesMap[effectiveStatus]}`;
        
        statusDisplay.appendChild(statusLabel);

        const commentDisplay = document.createElement('div');
        commentDisplay.className = 'comment';
        commentDisplay.textContent = initialComment || (effectiveStatus === 0 ? `[${obtainText('Not filled in yet.')}]` : '');

        interactionContainer.appendChild(statusDisplay);
        interactionContainer.appendChild(commentDisplay);
    }

    return interactionContainer;
}

// Populates the list of attendees in the UI
function populateParticipantList() {
    const participantListContainer = document.querySelector('.appointment .people .select');
    clearContents(participantListContainer);

    let viewerElementRef = null;
    let viewerIndex = -1;
    let currentIndex = 0;

    globalScheduleState.registeredAttendees.forEach((attendee, attendeeId) => {
        const listItem = document.createElement('li');
        let displayLabel = attendee.name;
        if (displayLabel.length > maxPersonLabelLen) {
            displayLabel = displayLabel.substring(0, maxPersonLabelLen - 2) + '…';
        }
        listItem.textContent = displayLabel;

        storeElementData(listItem, 'participantId', attendeeId);
        storeElementData(attendee, 'elementRef', listItem); // Store reference back to DOM element

        if (attendee.isViewer) {
            toggleCssClass(listItem, 'me', true);
            viewerElementRef = listItem;
            viewerIndex = currentIndex;
        }
        participantListContainer.appendChild(listItem);
        currentIndex++;

        listItem.addEventListener('click', (event) => {
            handleParticipantSelection(event.currentTarget, attendeeId, currentIndex - 1);
        });
    });

    // Simulate initial click for the viewer
    if (viewerElementRef) {
        handleParticipantSelection(viewerElementRef, globalScheduleState.viewerParticipantId, viewerIndex);
    }
}

// Populates the list of time segments in the UI
function populateTimeSlotList() {
    const timeSegmentListContainer = document.querySelector('.appointment .dates .select');
    clearContents(timeSegmentListContainer);

    globalScheduleState.eventTimeSegments.forEach((segment, segmentId) => {
        const listItem = document.createElement('li');
        const contentSpan = document.createElement('span');
        contentSpan.textContent = segment.label;
        const barSpan = document.createElement('span');
        barSpan.className = 'bar';
        contentSpan.appendChild(barSpan);
        listItem.appendChild(contentSpan);

        storeElementData(listItem, 'timeSegmentData', segment);
        storeElementData(segment, 'elementRef', listItem); // Store reference back to DOM element

        timeSegmentListContainer.appendChild(listItem);

        refreshStatusIndicator(listItem); // Initial bar update

        listItem.addEventListener('click', (event) => {
            handleTimeSlotSelection(event.currentTarget, segmentId);
        });
    });
}

// Handles participant selection and updates the availability display
function handleParticipantSelection(selectedElement, participantId, index = -1) {
    designateItem(selectedElement);
    globalScheduleState.activeDisplayMode.type = 'attendee';
    globalScheduleState.activeDisplayMode.identifier = participantId;

    const selectedAttendee = globalScheduleState.registeredAttendees.get(participantId);
    if (!selectedAttendee) return;

    const availabilityDisplay = document.querySelector('.appointment .availability');
    const balloonDiv = document.createElement('div');
    balloonDiv.className = 'person balloon';
    availabilityDisplay.appendChild(balloonDiv);

    const arrowDiv = document.createElement('div');
    arrowDiv.className = 'arrow';
    if (index !== -1) {
        arrowDiv.style.marginTop = `${5 + index * 40}px`;
    }
    balloonDiv.appendChild(arrowDiv);

    globalScheduleState.activeTimeSegmentIdentifiers.forEach(segmentId => {
        const interactionModule = buildInteractionModule(selectedAttendee, segmentId);
        balloonDiv.appendChild(interactionModule);
    });
}

// Handles time segment selection and updates the availability display
function handleTimeSlotSelection(selectedElement, timeSegmentId) {
    designateItem(selectedElement);
    globalScheduleState.activeDisplayMode.type = 'timeSegment';
    globalScheduleState.activeDisplayMode.identifier = timeSegmentId;

    const availabilityDisplayCell = document.querySelector('.appointment td.availability');
    clearContents(availabilityDisplayCell);

    globalScheduleState.registeredAttendees.forEach(attendee => {
        const balloonDiv = document.createElement('div');
        balloonDiv.className = 'date balloon';
        availabilityDisplayCell.appendChild(balloonDiv);

        const arrowDiv = document.createElement('div');
        arrowDiv.className = 'arrow';
        balloonDiv.appendChild(arrowDiv);

        const interactionModule = buildInteractionModule(attendee, timeSegmentId);
        balloonDiv.appendChild(interactionModule);
    });
}

// Transforms raw data into application state
function processRawScheduleData(rawData) {
    globalScheduleState.meetingDescriptor = rawData.meta;
    globalScheduleState.viewerParticipantId = rawData.invitee;

    // Process time segments first to get ordered IDs
    globalScheduleState.activeTimeSegmentIdentifiers = rawData.dates.map(d => d.id);
    rawData.dates.forEach(dateEntry => {
        const segment = {
            id: dateEntry.id,
            label: dateEntry.s,
            approvals: 0,
            rejections: 0,
            elementRef: null // Will be set during DOM creation
        };
        globalScheduleState.eventTimeSegments.set(dateEntry.id, segment);
    });

    // Process participants and their choices
    rawData.people.forEach(personEntry => {
        const participant = {
            id: personEntry.id,
            name: personEntry.name,
            isViewer: personEntry.id === rawData.invitee,
            choices: new Map(), // Maps timeSegmentId to [status, comment]
            elementRef: null // Will be set during DOM creation
        };

        // Populate choices from raw availability data
        globalScheduleState.activeTimeSegmentIdentifiers.forEach(segmentId => {
            const rawChoice = rawData.availability[personEntry.id]?.[segmentId] || [];
            participant.choices.set(segmentId, rawChoice);

            // Update global time segment counts based on this participant's choice
            const status = rawChoice[0] || 0;
            const targetSegment = globalScheduleState.eventTimeSegments.get(segmentId);
            if (targetSegment) {
                if (status === 1) targetSegment.approvals++;
                if (status === -1) targetSegment.rejections++;
            }
        });
        globalScheduleState.registeredAttendees.set(personEntry.id, participant);
    });
}

// Renders the main schedule view after data is loaded
function renderSchedule(dataPayload) {
    processRawScheduleData(dataPayload); // Populate global state

    adjustVisibility([
        document.querySelector('.side-help'),
        document.querySelector('.appointment')
    ], 'block');

    const descriptionElement = document.querySelector('.appointment .description');
    if (descriptionElement) descriptionElement.innerHTML = globalScheduleState.meetingDescriptor.description;
    document.title = `Pleft · ${globalScheduleState.meetingDescriptor.title}`;

    configureAdminPanel(dataPayload);

    populateParticipantList();
    populateTimeSlotList();
}

// Handles errors during initial data fetch
function handleFetchError() {
    adjustVisibility(document.querySelector('.not-found'), 'block');
    adjustVisibility([
        document.querySelector('.side-help'),
        document.querySelector('.appointment')
    ], 'none');
}

// Sets up administrative tools
function configureAdminPanel(initialData) {
    const viewerId = globalScheduleState.viewerParticipantId;
    const initiatorId = initialData.meta.initiator;

    const proposeDateField = document.querySelector('.propose-date input[name=id]');
    if (proposeDateField) proposeDateField.value = window.sessionIdentifier;

    const resendInvitationsForm = document.querySelector('.resend-invitations');
    const inviteParticipantForm = document.querySelector('.invite-participant');
    const emailAddressesSection = document.querySelector('.email-addresses');

    if (initiatorId === viewerId) {
        const resendSelect = resendInvitationsForm.querySelector('select[name=invitee]');
        clearContents(resendSelect);
        initialData.people.forEach(person => {
            if (person.id !== viewerId) {
                const opt = document.createElement('option');
                opt.value = person.id;
                opt.textContent = person.name;
                resendSelect.appendChild(opt);
            }
        });
        if (initialData.people.length <= 1) {
            if (resendSelect) resendSelect.disabled = true;
            const resendButton = resendInvitationsForm.querySelector('button');
            if (resendButton) resendButton.disabled = true;
        }

        const inviteInput = inviteParticipantForm.querySelector('input[name=id]');
        if (inviteInput) inviteInput.value = window.sessionIdentifier;

        const emailTextArea = emailAddressesSection.querySelector('textarea');
        if (emailTextArea) {
            emailTextArea.value = initialData.addresses.join(', ');
            if (initialData.people.length <= 1) {
                emailTextArea.disabled = true;
            }
        }
    } else {
        adjustVisibility([resendInvitationsForm, inviteParticipantForm, emailAddressesSection], 'none');
    }

    document.querySelectorAll('.tools form').forEach(formElement => {
        formElement.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = formElement.querySelector('button');
            const successMessage = formElement.querySelector('.success');
            const errorMessage = formElement.querySelector('.error');

            if (submitButton) submitButton.disabled = true;
            if (successMessage) successMessage.textContent = '';
            if (errorMessage) errorMessage.textContent = '';

            const formData = new FormData(formElement);
            const urlEncodedData = new URLSearchParams(formData).toString();

            try {
                const response = await fetch(formElement.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: urlEncodedData
                });

                if (!response.ok) throw new Error('Tool action failed.');

                if (successMessage) successMessage.textContent = obtainText('Done!');
                if (submitButton) submitButton.disabled = false;

                if (formElement.classList.contains('invite-participant') || formElement.classList.contains('propose-date')) {
                    location.reload();
                }
            } catch (error) {
                console.error('Tool submission error:', error);
                if (errorMessage) errorMessage.textContent = obtainText('An error occurred.');
                if (submitButton) submitButton.disabled = false;
            }
        });
    });
}

// Main initialization function
function initiateScheduleViewer() {
    adjustVisibility(document.querySelectorAll('.overview > *'), 'none');

    window.addEventListener('beforeunload', () => {
        if (globalScheduleState.persistenceTaskHandle) {
            commitRecords(false); // Synchronous save on unload
        }
    });

    const manualSaveButton = document.querySelector('.save button');
    if (manualSaveButton) {
        manualSaveButton.addEventListener('click', () => {
            commitRecords(true);
        });
    }

    fetch(`/data?id=${window.sessionIdentifier}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderSchedule(data);
        })
        .catch(error => {
            console.error('Failed to load schedule data:', error);
            handleFetchError();
        });
}

document.addEventListener('DOMContentLoaded', initiateScheduleViewer);