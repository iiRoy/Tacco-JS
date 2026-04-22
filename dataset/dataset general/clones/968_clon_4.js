const extractToken = (tokenKeyIdentifier) => {
    const allPieces = document.cookie ? document.cookie.split(';') : [];
    let discoveredValue = null;

    allPieces.find(currentPiece => {
        const cleanedPiece = currentPiece.trim();
        const keyPrefix = `${tokenKeyIdentifier}=`;
        if (cleanedPiece.startsWith(keyPrefix)) {
            discoveredValue = decodeURIComponent(cleanedPiece.substring(keyPrefix.length));
            return true;
        }
        return false;
    });

    return discoveredValue;
};

const securityStampValue = extractToken('csrftoken');

const nonProtectiveOperations = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);
const isOperationNonProtective = (operationType) => nonProtectiveOperations.has(operationType.toUpperCase());

const makeNetworkCall = async (targetPath, requestBody, methodType = 'POST') => {
    const callOptions = {
        method: methodType,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    };

    if (!isOperationNonProtective(methodType)) {
        callOptions.headers['X-CSRFToken'] = securityStampValue;
    }

    const networkResponse = await fetch(targetPath, callOptions);
    if (!networkResponse.ok) {
        throw new Error(`Network failure! Status: ${networkResponse.status}`);
    }
    return networkResponse;
};

const initiatePreviewRefresh = async () => {
    try {
        const inputElement = document.querySelector('#content');
        if (!inputElement) {
            console.error("Source content element not found for preview.");
            return;
        }
        const currentContent = inputElement.value;

        const responseData = await makeNetworkCall(
            '/previewer/',
            { 'content': currentContent },
            'POST'
        );

        const processedData = await responseData.json();
        console.log(processedData);

        const outputDisplayElement = document.querySelector('.previewer');
        if (outputDisplayElement && processedData && processedData.marked) {
            outputDisplayElement.innerHTML = processedData.marked;
        } else if (!outputDisplayElement) {
            console.error("Preview display element not found.");
        } else {
            console.warn("Processed data or 'marked' property missing for display.");
        }
    } catch (problem) {
        console.error("Problem during preview refresh:", problem);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (keyboardEvent) => {
        if (keyboardEvent.ctrlKey && keyboardEvent.key === 'Enter') {
            const activationButton = document.querySelector('#submit');
            if (activationButton) {
                activationButton.click();
                keyboardEvent.preventDefault();
            }
        }
    });

    const refreshButton = document.querySelector('#pre-btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            initiatePreviewRefresh();
        });
    }
});