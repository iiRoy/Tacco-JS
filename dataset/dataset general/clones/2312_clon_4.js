const resourceContainerIdentifier = 'article-section';
const progressIndicatorIdentifier = 'scroll-progress-visual';
const locatorSourcePath = '/all-posts.json';
const scrollActivationThresholdValue = 3000;

const applicationProcessState = {
    allContentLocators: null,
    processingAcquisition: false,
    acquisitionMechanismActive: true,
    contentBatchSize: 0,
};

function deactivateAcquisitionSystem() {
    applicationProcessState.acquisitionMechanismActive = false;
    applicationProcessState.processingAcquisition = false;
    const visualFeedbackElement = document.getElementById(progressIndicatorIdentifier);
    if (visualFeedbackElement) {
        visualFeedbackElement.style.transition = 'opacity 0.5s ease-out';
        visualFeedbackElement.style.opacity = '0';
        setTimeout(() => {
            visualFeedbackElement.style.display = 'none';
        }, 500);
    }
}

async function retrieveIndividualContentUnit(contentIndex) {
    const unitLocator = applicationProcessState.allContentLocators[contentIndex];
    if (!unitLocator) return null;

    const networkResponse = await fetch(unitLocator);
    const rawContentText = await networkResponse.text();

    const contentParser = new DOMParser();
    const contentDocument = contentParser.parseFromString(rawContentText, 'text/html');
    const contentElement = contentDocument.querySelector('.post');

    return contentElement;
}

async function initiateContentAcquisition() {
    if (!applicationProcessState.allContentLocators || applicationProcessState.processingAcquisition) return;

    applicationProcessState.processingAcquisition = true;

    const destinationContainer = document.getElementById(resourceContainerIdentifier);
    const currentUnitCount = destinationContainer ? destinationContainer.children.length : 0;
    let unitsObtainedThisCycle = 0;

    for (let i = 0; i < applicationProcessState.contentBatchSize; i++) {
        const targetUnitIndex = currentUnitCount + unitsObtainedThisCycle;

        if (targetUnitIndex >= applicationProcessState.allContentLocators.length) {
            deactivateAcquisitionSystem();
            break;
        }

        try {
            const fetchedUnit = await retrieveIndividualContentUnit(targetUnitIndex);
            if (fetchedUnit && destinationContainer) {
                destinationContainer.appendChild(fetchedUnit);
                unitsObtainedThisCycle++;
            } else {
                deactivateAcquisitionSystem();
                break;
            }
        } catch (errorDetails) {
            console.error("Error during content unit retrieval:", errorDetails);
            deactivateAcquisitionSystem();
            break;
        }
    }

    if (applicationProcessState.acquisitionMechanismActive) {
        applicationProcessState.processingAcquisition = false;
    }
}

function observeScrollMovement() {
    if (!applicationProcessState.acquisitionMechanismActive || applicationProcessState.processingAcquisition) {
        return;
    }

    const currentViewportHeight = window.innerHeight;
    const currentScrollOffset = window.scrollY;
    const cumulativeScrollPosition = currentViewportHeight + currentScrollOffset;
    const totalPageHeight = document.documentElement.scrollHeight;

    if ((totalPageHeight - scrollActivationThresholdValue) < cumulativeScrollPosition) {
        initiateContentAcquisition();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const initialContentContainer = document.getElementById(resourceContainerIdentifier);
    applicationProcessState.contentBatchSize = initialContentContainer ? initialContentContainer.children.length : 0;

    if (!document.getElementById(progressIndicatorIdentifier)) {
        applicationProcessState.acquisitionMechanismActive = false;
    }

    try {
        const locatorResponse = await fetch(locatorSourcePath);
        const locatorData = await locatorResponse.json();
        applicationProcessState.allContentLocators = locatorData["posts"];

        if (applicationProcessState.allContentLocators.length <= applicationProcessState.contentBatchSize) {
            deactivateAcquisitionSystem();
        }
    } catch (initialError) {
        console.error("Failed to load content locators:", initialError);
        deactivateAcquisitionSystem();
    }

    window.addEventListener('scroll', observeScrollMovement);
});