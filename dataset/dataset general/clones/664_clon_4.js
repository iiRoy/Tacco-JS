const createPersonalRecord = function(initialDetails = {}) {
    let internalState = {
        _givenName: initialDetails.givenName,
        _familyName: initialDetails.familyName
    };

    const accessInternalAttribute = function(keyIdentifier) {
        if (keyIdentifier === 'givenName') return internalState._givenName;
        if (keyIdentifier === 'familyName') return internalState._familyName;
        return undefined;
    };

    const modifyInternalAttribute = function(keyIdentifier, newValue) {
        if (keyIdentifier === 'givenName') internalState._givenName = newValue;
        if (keyIdentifier === 'familyName') internalState._familyName = newValue;
    };

    const performValidityCheck = function() {
        const attributeValues = {
            given: accessInternalAttribute('givenName'),
            family: accessInternalAttribute('familyName')
        };

        const presenceMap = new Map();
        presenceMap.set('givenExists', attributeValues.given !== undefined && attributeValues.given !== '');
        presenceMap.set('familyExists', attributeValues.family !== undefined && attributeValues.family !== '');

        if (!presenceMap.get('givenExists') || !presenceMap.get('familyExists')) {
            return 'A complete name (first and last parts) is required for this entry.';
        }
    };

    const calculateFullDesignation = function() {
        return accessInternalAttribute('givenName') + ' ' + accessInternalAttribute('familyName');
    };

    return {
        dataEndpoint: '/identities',
        recordType: 'identity',
        relevantFields: ['givenName', 'familyName'],

        fetchAttribute: accessInternalAttribute,
        setAttribute: modifyInternalAttribute,

        verifyData: performValidityCheck,

        get completeDesignation() {
            return calculateFullDesignation();
        }
    };
};