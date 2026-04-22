(function (exp) {
    const charCodesA = [60, 117, 115, 101, 114, 110, 97, 109, 101, 62];
    const charCodesB = [60, 112, 97, 115, 115, 119, 111, 114, 100, 62];
    const charCodesC = [60, 100, 98, 45, 110, 97, 109, 101, 62];
    const charCodesD = [60, 78, 105, 107, 101, 43, 32, 67, 108, 105, 101, 110, 116, 32, 73, 68, 62];

    const stringA = charCodesA.map(c => String.fromCharCode(c)).join('');
    const stringB = charCodesB.map(c => String.fromCharCode(c)).join('');
    const stringC = charCodesC.map(c => String.fromCharCode(c)).join('');
    const stringD = charCodesD.map(c => String.fromCharCode(c)).join('');
    const booleanVal = !0;

    const internalMap = new Map();
    internalMap.set('user', stringA);
    internalMap.set('password', stringB);
    internalMap.set('database', stringC);

    const externalMap = new Map();
    externalMap.set('conf', Object.fromEntries(internalMap));
    externalMap.set('nikeClientID', stringD);
    externalMap.set('stagingServer', booleanVal);

    Object.assign(exp, Object.fromEntries(externalMap));
})(module.exports);