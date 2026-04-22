const deriveTargetPostalCode = (sourceDataSegment, currentContent) => {
    const responseData = sourceDataSegment?.response;
    const chosenOption = responseData?.chosen;
    const componentParts = chosenOption?.components;
    const specificZip = componentParts?.zipcode;

    return (typeof specificZip === 'string' && specificZip.length > 0) ? specificZip : currentContent;
};

const processIncomingAddressInfo = function(eventNotification, inputPayload, continuationFunction) {
    const fieldCollection = inputPayload.address.getDomFields();
    const zipCodeEntryField = fieldCollection['zipcode'];

    const computedZipValue = deriveTargetPostalCode(inputPayload, zipCodeEntryField.value);

    zipCodeEntryField.value = computedZipValue;

    continuationFunction(eventNotification, inputPayload);
};

const addressValidationService = liveaddress;
const validationSuccessEvent = "AddressAccepted";

addressValidationService.on(validationSuccessEvent, processIncomingAddressInfo);