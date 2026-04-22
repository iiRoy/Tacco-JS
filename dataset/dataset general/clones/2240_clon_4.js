const activeContainer = Ti.UI.currentWindow;
const primaryApplication = activeContainer.app;
const currentDisplayReference = Ti.UI.currentTab;

const initiateVisualSequence = () => {
    primaryApplication.foundation.UI.openWindow(
        'Cats pictures (Flickr API)',
        currentDisplayReference,
        { contentSource: 'jsonpTest.js' }
    );
};

const visualItemDetails = {
    captionLabel: 'JSONP request',
    possessesSubItems: true
};

const displayRowComponent = Ti.UI.createTableViewRow(visualItemDetails);

const interactivePanel = Ti.UI.createTableView({
    data: [displayRowComponent]
});

interactivePanel.addEventListener('click', (interactionEventObject) => {
    if (interactionEventObject.rowData === displayRowComponent) {
        initiateVisualSequence();
    }
});

activeContainer.add(interactivePanel);