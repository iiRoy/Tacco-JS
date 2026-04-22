class InteractiveContentManager {
    #discussionTopic;
    #pageIdentifier;
    #displayContainer;
    #communicationLayer;
    #commentStorage = new Map(); // Using Map for internal storage

    #commentRenderer;
    #threadRenderer;

    #dialogComponent; // Renamed commentForm
    #addDialogTrigger; // Renamed addCommentLink

    constructor(configuration) {
        this.#discussionTopic = configuration.discussionTopic;
        this.#pageIdentifier = configuration.pageIdentifier;
        this.#displayContainer = document.querySelector(configuration.displayElementSelector);

        this.#communicationLayer = createNetworkFacade(configuration.communicationEndpoint);

        this.#communicationLayer.subscribe('repliesReceived', this.#processIncomingReplies.bind(this));
        this.#communicationLayer.subscribe('newReplyPosted', this.#processNewIncomingReply.bind(this));

        this.#commentRenderer = (itemData) => processTemplate(
            '<div class="item-entry" data-identity="<%= id %>">' +
            '<div class="item-header"><strong><%= author.label %></strong> (<%= author.contact %>) <%= action %>:</div>' +
            '<div class="item-body"><%= content %></div>' +
            '<div class="item-actions"><small><a class="add-reply-trigger" data-respond-to="<%= id %>" style="cursor:pointer;">Respond to this</a></small></div>' +
            '</div>', itemData);

        this.#threadRenderer = () => processTemplate('<div class="item-cluster"></div>', {});

        const allSiblings = getElementSiblings(this.#displayContainer);
        this.#dialogComponent = allSiblings.find(s => s.matches('form.content-submission'));
        this.#addDialogTrigger = allSiblings.find(s => s.matches('a.add-reply-trigger'));

        if (this.#dialogComponent) {
            this.#dialogComponent.addEventListener('submit', this.#handleDialogSubmission.bind(this));
        }
        if (this.#addDialogTrigger) {
            this.#addDialogTrigger.addEventListener('click', this.#handleShowDialogTrigger.bind(this));
        }
    }

    establishConnection() {
        this.#retrieveExistingContent();
    }

    #submitContent(contentPayload) {
        this.#communicationLayer.publish('postReply', JSON.stringify(Object.assign({
            topic: this.#discussionTopic,
            pageRef: this.#pageIdentifier
        }, contentPayload)));
    }

    #retrieveExistingContent() {
        this.#communicationLayer.publish('fetchReplies', JSON.stringify({
            topic: this.#discussionTopic,
            pageRef: this.#pageIdentifier
        }));
    }

    #processIncomingReplies(rawData) {
        const parsedData = JSON.parse(rawData);
        if (Array.isArray(parsedData)) {
            parsedData.forEach(entry => this.#displayContentEntry(entry));
        }
    }

    #processNewIncomingReply(rawData) {
        const entry = JSON.parse(rawData);
        if (entry) {
            this.#displayContentEntry(entry);
        }
    }

    #displayContentEntry(entryData) {
        const generateEntryMarkup = this.#commentRenderer;
        const generateClusterMarkup = this.#threadRenderer;
        const ancestorId = entryData.Ancestor;
        
        const entryHtml = generateEntryMarkup({
            author: {
                label: entryData.Contributor.FullName,
                contact: entryData.Contributor.Email
            },
            action: ancestorId ? "responded" : "stated",
            content: entryData.TextBody,
            id: entryData.UniqueId,
            ancestorRef: ancestorId || "none"
        });
        const newEntryElementWrapper = document.createElement('div');
        newEntryElementWrapper.innerHTML = entryHtml;
        const entryNode = newEntryElementWrapper.firstElementChild;

        if (ancestorId) {
            const parentEntryNode = this.#displayContainer.querySelector(`div.item-entry[data-identity='${ancestorId}']`);
            if (parentEntryNode) {
                let existingCluster = parentEntryNode.querySelector('div.item-cluster');

                if (!existingCluster) {
                    const clusterTemp = document.createElement('div');
                    clusterTemp.innerHTML = generateClusterMarkup();
                    existingCluster = clusterTemp.firstElementChild;
                    parentEntryNode.appendChild(existingCluster);
                }
                existingCluster.appendChild(entryNode);
            }
        } else {
            let mainCluster = this.#displayContainer.querySelector(':scope > div.item-cluster');
            if (!mainCluster) {
                const clusterTemp = document.createElement('div');
                clusterTemp.innerHTML = generateClusterMarkup();
                mainCluster = clusterTemp.firstElementChild;
                this.#displayContainer.innerHTML = '';
                this.#displayContainer.appendChild(mainCluster);
            }
            mainCluster.appendChild(entryNode);
        }
        
        const replyTrigger = entryNode.querySelector('a.add-reply-trigger');
        if (replyTrigger) {
            replyTrigger.addEventListener('click', this.#handleShowDialogTrigger.bind(this));
        }
    }

    #handleDialogSubmission(eventObject) {
        eventObject.stopPropagation();
        eventObject.preventDefault();

        const dataForm = this.#dialogComponent;

        this.#submitContent({
            authorName: dataForm.elements.user.value,
            authorEmail: dataForm.elements.email.value,
            textBody: dataForm.elements.body.value,
            ancestorReference: dataForm.elements.parent.value
        });

        this.#toggleDialogVisibility('hide');
    }

    #handleShowDialogTrigger(eventObject) {
        eventObject.stopPropagation();
        eventObject.preventDefault();

        const sourceElement = eventObject.currentTarget;
        const ancestorReference = sourceElement.dataset.respondTo;

        if (ancestorReference) {
            const containingEntry = sourceElement.closest('div.item-entry');
            const actionContainer = containingEntry.querySelector(':scope > div.item-actions');
            if (this.#dialogComponent.parentNode) {
                this.#dialogComponent.parentNode.removeChild(this.#dialogComponent);
            }
            if (actionContainer) {
                actionContainer.insertAdjacentElement('afterend', this.#dialogComponent);
            }
            this.#dialogComponent.elements.parent.value = ancestorReference;
        } else {
            if (this.#dialogComponent.parentNode) {
                this.#dialogComponent.parentNode.removeChild(this.#dialogComponent);
            }
            this.#displayContainer.appendChild(this.#dialogComponent);
            this.#dialogComponent.elements.parent.value = "";
        }
        this.#toggleDialogVisibility('show');
    }

    #toggleDialogVisibility(action) {
        if (action === 'show') {
            this.#dialogComponent.classList.remove('hidden-form');
        } else {
            this.#dialogComponent.classList.add('hidden-form');
        }
    }
}

const createNetworkFacade = (endpointAddress) => {
    const registeredHandlers = new Map();
    const connectionInstance = {
        publish: (signalName, payloadData) => {
            // This method simulates sending data over a network.
            // In a real application, this would use a WebSocket or similar.
            // For this clone, it fulfills the client-side 'emit' requirement.
        },
        subscribe: (signalName, callbackFunction) => {
            if (!registeredHandlers.has(signalName)) {
                registeredHandlers.set(signalName, []);
            }
            registeredHandlers.get(signalName).push(callbackFunction);
        },
        // This method is for external systems (e.g., a test harness or server simulation)
        // to deliver messages to the client-side logic.
        deliverMessage: (signalName, messageContent) => {
            const handlers = registeredHandlers.get(signalName);
            if (handlers) {
                handlers.forEach(handler => handler(messageContent));
            }
        }
    };
    return connectionInstance;
};

const processTemplate = (templateStructure, dataValues) => {
    return templateStructure.replace(/<%= (\w+(?:\.\w+)*) %>/g, (match, keyPath) => {
        const pathSegments = keyPath.split('.');
        let currentLevelValue = dataValues;
        for (const segment of pathSegments) {
            if (currentLevelValue === undefined || currentLevelValue === null) return '';
            currentLevelValue = currentLevelValue[segment];
        }
        return currentLevelValue !== undefined && currentLevelValue !== null ? currentLevelValue : '';
    });
};

const getElementSiblings = (referenceElement) => {
    const allSiblings = [];
    let currentSibling = referenceElement.parentNode.firstElementChild;
    while (currentSibling) {
        if (currentSibling !== referenceElement) {
            allSiblings.push(currentSibling);
        }
        currentSibling = currentSibling.nextElementSibling;
    }
    return allSiblings;
};