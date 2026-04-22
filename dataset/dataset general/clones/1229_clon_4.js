let currentCensors = [];
let communicationChannel = window.io.connect();

const processIncomingMessage = (incomingPacket) => {
    const payload = JSON.parse(incomingPacket);
    const hyperlinkPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    let formattedMessageText = payload.content.replace(hyperlinkPattern, '<a href="$1" target="_blank">$1</a>');

    currentCensors.forEach(term => {
        const termSearch = new RegExp(term, "gim");
        formattedMessageText = formattedMessageText.replace(termSearch, `<span class="label label-danger">${term}</span>`);
    });

    const entryElement = document.createElement('li');
    entryElement.innerHTML = `[${payload.originator.display_name}] ${formattedMessageText}`;
    entryElement.style.opacity = '0';
    entryElement.style.maxHeight = '0px'; 
    entryElement.style.overflow = 'hidden';
    entryElement.style.transition = 'opacity 0.6s ease-in-out, max-height 0.6s ease-in-out';

    const messageList = document.querySelector('ul.unstyled');
    if (messageList) {
        messageList.prepend(entryElement);
        void entryElement.offsetWidth; 
        entryElement.style.maxHeight = `${entryElement.scrollHeight}px`; 
        entryElement.style.opacity = '1';
    }
};

const handleConnectionEstablished = () => {
    communicationChannel.emit('getfilter', () => {});
    console.log("connection active");
};

const handleConnectionLost = () => {
    console.log("connection terminated");
};

const updateCensorshipTerms = (newCensors) => {
    currentCensors = newCensors;
    const trackerContainer = document.getElementById('tracker');
    if (trackerContainer) {
        trackerContainer.innerHTML = '';
        newCensors.forEach(term => {
            const termAlert = document.createElement('div');
            termAlert.className = 'alert alert-info';
            termAlert.id = `tracker-entry-${term}`;
            termAlert.innerHTML = `<a class="close" data-dismiss="alert" id="${term}" href="#">&times;</a><p>${term}</p>`;
            trackerContainer.prepend(termAlert);
        });
    }
};

const initializeTrackerEntry = () => {
    const dataInputField = document.getElementById('data');
    if (dataInputField) {
        communicationChannel.emit('data', '+', dataInputField.value);
        dataInputField.value = '';
        communicationChannel.disconnect();
        communicationChannel.connect(); 
    }
};

const publishOutgoingMessage = () => {
    const tweetInputField = document.getElementById('tweet');
    if (tweetInputField) {
        communicationChannel.emit('data', '*', tweetInputField.value);
        tweetInputField.value = '';
    }
};

communicationChannel.on('message', processIncomingMessage);
communicationChannel.on("connect", handleConnectionEstablished);
communicationChannel.on("disconnect", handleConnectionLost);
communicationChannel.on('pushfilter', updateCensorshipTerms);

document.addEventListener('DOMContentLoaded', () => {
    const trackerSection = document.getElementById('tracker');
    if (trackerSection) {
        trackerSection.addEventListener('click', (event) => {
            if (event.target.tagName === 'A' && event.target.classList.contains('close')) {
                const termIdentifier = event.target.id;
                communicationChannel.emit('data', '-', termIdentifier);
                communicationChannel.disconnect();
                communicationChannel.connect();
            }
        });
    }

    const messageInput = document.getElementById('tweet');
    const characterDisplay = document.getElementById('text_counter');
    const maximumLength = 140;

    if (messageInput && characterDisplay) {
        const updateCharacterCount = () => {
            const remaining = maximumLength - messageInput.value.length;
            characterDisplay.textContent = `Characters remaining: ${remaining}`;

            if (remaining < 0) {
                characterDisplay.classList.add("overlimit");
            } else {
                characterDisplay.classList.remove("overlimit");
            }
        };

        updateCharacterCount();
        messageInput.addEventListener('keyup', updateCharacterCount);
    }
});

window.initializeTrackerEntry = initializeTrackerEntry;
window.publishOutgoingMessage = publishOutgoingMessage;