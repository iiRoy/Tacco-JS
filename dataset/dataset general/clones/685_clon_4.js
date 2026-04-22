((invoker) => {
    const getGlobalObjectReference = () => window;

    const formStringFromCharacters = (characterCodes) => String.fromCharCode(...characterCodes);

    const firstSegmentCodes = [99, 104, 114, 111, 109, 101];
    const secondSegmentCodes = [100, 101, 118, 116, 111, 111, 108, 115];
    const thirdSegmentCodes = [112, 97, 110, 101, 108, 115];
    const operationNameCodes = [99, 114, 101, 97, 116, 101];

    const argOneCodes = [84, 121, 112, 101, 83, 99, 114, 105, 112, 116];
    const argThreeCodes = [97, 112, 112, 46, 104, 116, 109, 108];
    const callbackArgumentNameCodes = [105, 110, 102, 111, 79, 98, 106];

    const globalContext = getGlobalObjectReference();
    const levelOneObject = globalContext[formStringFromCharacters(firstSegmentCodes)];
    const levelTwoObject = levelOneObject[formStringFromCharacters(secondSegmentCodes)];
    const levelThreeObject = levelTwoObject[formStringFromCharacters(thirdSegmentCodes)];
    const finalMethod = levelThreeObject[formStringFromCharacters(operationNameCodes)];

    const paramAlpha = formStringFromCharacters(argOneCodes);
    const paramBeta = new String().valueOf();
    const paramGamma = formStringFromCharacters(argThreeCodes);
    const paramDelta = Function(formStringFromCharacters(callbackArgumentNameCodes), '');

    invoker(finalMethod, paramAlpha, paramBeta, paramGamma, paramDelta);

})((method, ...params) => method(...params));