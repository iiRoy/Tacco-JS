function selectElement(identifier) {
    return document.querySelector(identifier);
}

function selectElementById(id) {
    return document.getElementById(id);
}

function dataEscaper(str) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

async function retrieveRemoteData(urlPath, options = {}) {
    try {
        const response = await fetch(urlPath, options);
        if (!response.ok) {
            throw new Error(`Server response error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Data retrieval issue:", error);
        throw error;
    }
}

function constructPeerEntry(messageData, entrySequence, isGroupConversation) {
    const visibilityStyle = isGroupConversation ? 'block' : 'none';
    const escapedMessage = dataEscaper(messageData.text);
    const initialSpeaker = dataEscaper(messageData.chatter);
    return `
        <div style="margin: 16px;" id="entry-item-${entrySequence}">
            <span style="color: #929197; font-size: 12px; display: ${visibilityStyle}" class="speakerLabel">${initialSpeaker}</span>
            <div class="row" style="border-radius: 16px; padding: 8px 16px 8px 16px; background-color: #e6e5eb;">
                ${escapedMessage}
            </div>
        </div>`;
}

function constructSelfEntry(messageData) {
    const escapedMessage = dataEscaper(messageData.text);
    return `
        <div style="margin: 16px;">
            <div class="row" style="border-radius: 16px; padding: 8px 16px 8px 16px; background-color: #027bfe; color: #fbfeff;">
                ${escapedMessage}
            </div>
        </div>`;
}

let activeConversationIdentifier = null;
let lastKnownMessageContent = "";
let currentViewIsGroup = false;

function retrieveConversationIdentifier() {
    return selectElementById('conversationcontainer').dataset.id || '';
}

async function determineConversationMetadata() {
    let rawIdentifier = retrieveConversationIdentifier().trim();
    activeConversationIdentifier = rawIdentifier;

    const conversationNameElement = selectElementById("contactname");

    if (rawIdentifier.includes('-chat')) {
        conversationNameElement.textContent = rawIdentifier.split('-chat')[0];
        activeConversationIdentifier = 'chat' + rawIdentifier.split('-chat')[1];
        currentViewIsGroup = true;
    } else if (!rawIdentifier.includes('@')) {
        currentViewIsGroup = false;
        try {
            const resolvedName = await retrieveRemoteData("/getNameFromPhone/" + rawIdentifier);
            const processedName = resolvedName.trim();
            conversationNameElement.textContent = processedName === "" ? rawIdentifier : processedName;
        } catch (e) {
            conversationNameElement.textContent = rawIdentifier;
        }
    } else {
        currentViewIsGroup = false;
        conversationNameElement.textContent = rawIdentifier;
    }
}

async function refreshConversationDisplay() {
    await determineConversationMetadata();

    const conversationListContainer = selectElementById("messagelist");
    conversationListContainer.innerHTML = '';

    const allConversationEntries = await retrieveRemoteData("/getAllMessagesInChat/" + activeConversationIdentifier);

    const entryHTMLArray = allConversationEntries.map((entry, sequence) => {
        if (entry.chatter === "me") {
            return constructSelfEntry(entry);
        } else {
            if (currentViewIsGroup) {
                (async (chatterID, targetElementID) => {
                    try {
                        const fetchedName = await retrieveRemoteData("/getNameFromPhone/" + chatterID);
                        if (fetchedName.trim() !== "") {
                            const targetSpeaker = selectElementById(targetElementID).querySelector('.speakerLabel');
                            if (targetSpeaker) {
                                targetSpeaker.textContent = fetchedName.trim();
                            }
                        }
                    } catch (e) {
                        // In case of error, the original chatter ID remains, mimicking original behavior.
                    }
                })(entry.chatter, `entry-item-${sequence}`);
            }
            return constructPeerEntry(entry, sequence, currentViewIsGroup);
        }
    });

    conversationListContainer.innerHTML = entryHTMLArray.join('');

    if (allConversationEntries.length > 0) {
        lastKnownMessageContent = allConversationEntries[allConversationEntries.length - 1].text;
    } else {
        lastKnownMessageContent = "";
    }

    selectElementById('conversationcontainer').classList.remove('hide');
    selectElementById('conversationlistcontainer').classList.add('hide');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

const contentUpdatePolling = setInterval(async () => {
    if (!activeConversationIdentifier) {
        return;
    }

    try {
        const latestEntryData = await retrieveRemoteData("/getLastMessageInChat/" + activeConversationIdentifier);
        if (latestEntryData.text !== lastKnownMessageContent) {
            refreshConversationDisplay();
        }
    } catch (e) {
        console.warn("Issue during content polling:", e);
    }
}, 5000);

function handleInputSubmission(event) {
    const textInput = selectElementById('newmessagetext');
    if (event.key === 'Enter' && textInput.value.trim() !== '') {
        const messagePayload = textInput.value.trim();
        textInput.value = '';

        const postData = new URLSearchParams();
        postData.append('to', activeConversationIdentifier);
        postData.append('message', messagePayload);

        retrieveRemoteData("/sendNewMessage", {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: postData,
        })
        .then(() => refreshConversationDisplay())
        .catch(e => console.error("Message submission failed:", e));
    }
}

function navigateToOverview() {
    selectElementById('conversationcontainer').classList.add('hide');
    selectElementById('conversationlistcontainer').classList.remove('hide');
}

document.addEventListener('DOMContentLoaded', () => {
    const messageInputField = selectElementById('newmessagetext');
    if (messageInputField) {
        messageInputField.addEventListener('keydown', handleInputSubmission);
    }

    const overviewTransitionButton = selectElementById('backToListViewBtn'); // Assuming an ID for the back button
    if (overviewTransitionButton) {
        overviewTransitionButton.addEventListener('click', navigateToOverview);
    }
});