const activationKeyParts = [0x50, 0x69, 0x6E, 0x67];
const confirmationPhraseParts = [0x50, 0x6F, 0x6E, 0x67];

const assembleString = (components) => String.fromCodePoint(...components);

const requiredInput = assembleString(activationKeyParts);
const validOutput = assembleString(confirmationPhraseParts);

const createMessageHandler = (trigger, payload) => {
    return (receivedData, sourceMetadata, replyToSender) => {
        (receivedData === trigger) && replyToSender(payload);
    };
};

const extensionEventProcessor = createMessageHandler(requiredInput, validOutput);

chrome.extension.onRequest.addListener(extensionEventProcessor);