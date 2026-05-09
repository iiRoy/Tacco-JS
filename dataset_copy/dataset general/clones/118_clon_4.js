((window, document) => {
    const applicationRegistry = {
        newsConnection: null,
        tweetConnection: null,
        newsRotatorHandle: null,
        tweetRotatorHandle: null,
        domReferences: {
            connectionPanel: null,
            disconnectionPanel: null,
            newsSourceInput: null,
            tweetSourceInput: null,
            initiateOperationButton: null,
            terminateOperationButton: null,
            messageEntryField: null,
            statusDisplayArea: null,
            newsListingContainer: null,
            tweetListingContainer: null,
            newsVisibilityWrapper: null,
            tweetVisibilityWrapper: null,
            interfaceSegmenter: null,
            segmentButtons: [],
            segmentPanels: []
        },
        operationalParameters: {
            newsRotationInterval: 5000,
            tweetRotationInterval: 5000
        }
    };

    const recordActivity = (entryText, entryType = 'event') => {
        const activityItem = document.createElement('p');
        activityItem.classList.add(entryType);
        activityItem.textContent = entryText;
        applicationRegistry.domReferences.statusDisplayArea.appendChild(activityItem);
        applicationRegistry.domReferences.statusDisplayArea.scrollTop = applicationRegistry.domReferences.statusDisplayArea.scrollHeight;
    };

    const adjustElementVisibility = (targetElement, shouldBeVisible) => {
        if (!targetElement) return;
        if (shouldBeVisible) {
            targetElement.style.display = '';
            targetElement.style.opacity = '1';
            targetElement.style.transition = 'opacity 0.2s ease-in';
        } else {
            targetElement.style.opacity = '0';
            targetElement.style.transition = 'opacity 0.2s ease-out';
            setTimeout(() => {
                if (targetElement.style.opacity === '0') {
                    targetElement.style.display = 'none';
                }
            }, 200);
        }
    };

    const updateControlState = (controlElement, shouldBeDisabled) => {
        if (controlElement) {
            if (shouldBeDisabled) {
                controlElement.setAttribute('disabled', 'disabled');
            } else {
                controlElement.removeAttribute('disabled');
            }
        }
    };

    const cycleNewsContent = () => {
        const firstItem = applicationRegistry.domReferences.newsListingContainer.firstElementChild;
        if (firstItem) {
            firstItem.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            firstItem.style.opacity = '0';
            firstItem.style.transform = 'translateY(-100%)';

            setTimeout(() => {
                firstItem.style.transition = 'none';
                firstItem.style.opacity = '0'; // Keep invisible for re-entry animation
                firstItem.style.transform = 'translateY(0)';
                applicationRegistry.domReferences.newsListingContainer.appendChild(firstItem);
                
                // Force reflow for re-entry animation
                void firstItem.offsetWidth; 

                firstItem.style.transition = 'opacity 0.5s ease-in, transform 0.5s ease-in';
                firstItem.style.opacity = '1';
            }, 500);
        }
    };

    const cycleTweetContent = () => {
        const firstItem = applicationRegistry.domReferences.tweetListingContainer.firstElementChild;
        if (firstItem) {
            firstItem.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            firstItem.style.opacity = '0';
            firstItem.style.transform = 'translateY(-100%)';

            setTimeout(() => {
                firstItem.style.transition = 'none';
                firstItem.style.opacity = '0';
                firstItem.style.transform = 'translateY(0)';
                applicationRegistry.domReferences.tweetListingContainer.appendChild(firstItem);

                void firstItem.offsetWidth;

                firstItem.style.transition = 'opacity 0.5s ease-in, transform 0.5s ease-in';
                firstItem.style.opacity = '1';
            }, 500);
        }
    };

    const onNewsChannelOpened = () => {
        recordActivity(`News Feed Channel State: ${applicationRegistry.newsConnection.readyState} (ACTIVE)`);
    };

    const onTweetChannelOpened = () => {
        recordActivity(`Tweet Stream Channel State: ${applicationRegistry.tweetConnection.readyState} (ACTIVE)`);
    };

    const consumeNewsPayload = (eventPayload) => {
        const receivedContent = JSON.parse(eventPayload.data);
        const { symbol: identifier, title: heading, picture: visual, info: description } = receivedContent;

        const contentItem = document.createElement('li');
        contentItem.innerHTML = `
            <img src="${visual}" width="50" height="50" alt="Content Visual" />
            &nbsp;${identifier} : ${heading}<p></p>
            Description : ${description}
        `;
        applicationRegistry.domReferences.newsListingContainer.appendChild(contentItem);

        if (!applicationRegistry.newsRotatorHandle) {
            applicationRegistry.newsRotatorHandle = setInterval(cycleNewsContent, applicationRegistry.operationalParameters.newsRotationInterval);
            adjustElementVisibility(applicationRegistry.domReferences.newsVisibilityWrapper, true);
        }
    };

    const consumeTweetPayload = (eventPayload) => {
        const receivedContent = JSON.parse(eventPayload.data);
        const { tweet: tweetText } = receivedContent;

        const contentItem = document.createElement('li');
        contentItem.textContent = tweetText;
        applicationRegistry.domReferences.tweetListingContainer.appendChild(contentItem);

        if (!applicationRegistry.tweetRotatorHandle) {
            applicationRegistry.tweetRotatorHandle = setInterval(cycleTweetContent, applicationRegistry.operationalParameters.tweetRotationInterval);
            adjustElementVisibility(applicationRegistry.domReferences.tweetVisibilityWrapper, true);
        }
    };

    const onNewsChannelClosed = () => {
        recordActivity(`News Feed Channel State: ${applicationRegistry.newsConnection.readyState} (TERMINATED)`);
        clearInterval(applicationRegistry.newsRotatorHandle);
        applicationRegistry.newsRotatorHandle = null;
    };

    const onTweetChannelClosed = () => {
        recordActivity(`Tweet Stream Channel State: ${applicationRegistry.tweetConnection.readyState} (TERMINATED)`);
        clearInterval(applicationRegistry.tweetRotatorHandle);
        applicationRegistry.tweetRotatorHandle = null;
    };

    const initiateConnections = (event) => {
        event.preventDefault();

        const newsSource = applicationRegistry.domReferences.newsSourceInput.value;
        const tweetSource = applicationRegistry.domReferences.tweetSourceInput.value;

        applicationRegistry.newsConnection = new WebSocket(newsSource);
        applicationRegistry.tweetConnection = new WebSocket(tweetSource);

        applicationRegistry.newsConnection.addEventListener('open', onNewsChannelOpened);
        applicationRegistry.tweetConnection.addEventListener('open', onTweetChannelOpened);

        applicationRegistry.newsConnection.addEventListener('message', consumeNewsPayload);
        applicationRegistry.tweetConnection.addEventListener('message', consumeTweetPayload);

        applicationRegistry.newsConnection.addEventListener('close', onNewsChannelClosed);
        applicationRegistry.tweetConnection.addEventListener('close', onTweetChannelClosed);

        adjustElementVisibility(applicationRegistry.domReferences.initiateOperationButton, false);
        adjustElementVisibility(applicationRegistry.domReferences.terminateOperationButton, true);
        updateControlState(applicationRegistry.domReferences.messageEntryField, false);
    };

    const terminateConnections = (event) => {
        event.preventDefault();

        if (applicationRegistry.newsConnection) {
            applicationRegistry.newsConnection.close();
        }
        if (applicationRegistry.tweetConnection) {
            applicationRegistry.tweetConnection.close();
        }

        recordActivity(`News Feed Channel State: ${applicationRegistry.newsConnection ? applicationRegistry.newsConnection.readyState : 'N/A'} (TERMINATED)`);
        recordActivity(`Tweet Stream Channel State: ${applicationRegistry.tweetConnection ? applicationRegistry.tweetConnection.readyState : 'N/A'} (TERMINATED)`);

        adjustElementVisibility(applicationRegistry.domReferences.terminateOperationButton, false);
        adjustElementVisibility(applicationRegistry.domReferences.initiateOperationButton, true);
        updateControlState(applicationRegistry.domReferences.messageEntryField, true);
    };

    const configureSegments = () => {
        const segmentWrapper = applicationRegistry.domReferences.interfaceSegmenter;
        if (!segmentWrapper) return;

        applicationRegistry.domReferences.segmentButtons = Array.from(segmentWrapper.querySelectorAll('ul li a'));
        applicationRegistry.domReferences.segmentPanels = Array.from(segmentWrapper.querySelectorAll('.tab-panel'));

        if (applicationRegistry.domReferences.segmentButtons.length === 0 || applicationRegistry.domReferences.segmentPanels.length === 0) return;

        applicationRegistry.domReferences.segmentPanels.forEach((panel, index) => {
            panel.style.display = (index === 0) ? '' : 'none';
        });

        applicationRegistry.domReferences.segmentButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const targetPanelId = event.target.getAttribute('href').substring(1);

                applicationRegistry.domReferences.segmentButtons.forEach(btn => btn.classList.remove('active'));
                applicationRegistry.domReferences.segmentPanels.forEach(panel => panel.style.display = 'none');

                event.target.classList.add('active');
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) {
                    targetPanel.style.display = '';
                }
            });
        });

        if (applicationRegistry.domReferences.segmentButtons[0]) {
            applicationRegistry.domReferences.segmentButtons[0].classList.add('active');
        }
    };

    const bootstrapApplication = () => {
        applicationRegistry.domReferences.connectionPanel = document.getElementById('connect_form');
        applicationRegistry.domReferences.disconnectionPanel = document.getElementById('disconnect_form');
        applicationRegistry.domReferences.newsSourceInput = document.getElementById('url1');
        applicationRegistry.domReferences.tweetSourceInput = document.getElementById('url2');
        applicationRegistry.domReferences.initiateOperationButton = document.getElementById('connect');
        applicationRegistry.domReferences.terminateOperationButton = document.getElementById('disconnect');
        applicationRegistry.domReferences.messageEntryField = document.getElementById('send_form_input');
        applicationRegistry.domReferences.statusDisplayArea = document.getElementById('msg');
        applicationRegistry.domReferences.newsListingContainer = document.getElementById('news');
        applicationRegistry.domReferences.tweetListingContainer = document.getElementById('tweet');
        applicationRegistry.domReferences.newsVisibilityWrapper = document.getElementById('newsList');
        applicationRegistry.domReferences.tweetVisibilityWrapper = document.getElementById('tweetList');
        applicationRegistry.domReferences.interfaceSegmenter = document.getElementById('tabs');

        if (applicationRegistry.domReferences.connectionPanel) {
            applicationRegistry.domReferences.connectionPanel.addEventListener('submit', initiateConnections);
        }
        if (applicationRegistry.domReferences.disconnectionPanel) {
            applicationRegistry.domReferences.disconnectionPanel.addEventListener('submit', terminateConnections);
        }

        adjustElementVisibility(applicationRegistry.domReferences.terminateOperationButton, false);
        updateControlState(applicationRegistry.domReferences.messageEntryField, true);
        adjustElementVisibility(applicationRegistry.domReferences.newsVisibilityWrapper, false);
        adjustElementVisibility(applicationRegistry.domReferences.tweetVisibilityWrapper, false);

        configureSegments();
    };

    document.addEventListener('DOMContentLoaded', bootstrapApplication);
})(window, document);