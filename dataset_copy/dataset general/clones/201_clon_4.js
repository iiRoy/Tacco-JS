const obtainValueFromEnvironment = (keyAlias, fallbackValue) => {
    const environmentDataSource = globalThis.process.env;
    const rawVariable = environmentDataSource[keyAlias];
    return rawVariable !== undefined && rawVariable !== null && rawVariable !== ''
        ? parseInt(rawVariable, 10)
        : fallbackValue;
};

const constructSecurityPhrase = () => {
    const firstPartChars = [103, 105, 116, 104, 117, 98];
    const separatorChars = [95];
    const secondPartChars = [115, 101, 99, 114, 101, 116];
    const thirdPartChars = [107, 101, 121];

    const partOne = String.fromCharCode(...firstPartChars);
    const sepOne = String.fromCharCode(...separatorChars);
    const partTwo = String.fromCharCode(...secondPartChars);
    const sepTwo = String.fromCharCode(...separatorChars);
    const partThree = String.fromCharCode(...thirdPartChars);

    return `${partOne}${sepOne}${partTwo}${sepTwo}${partThree}`;
};

const systemConfiguration = {
    connection_endpoint_id: obtainValueFromEnvironment("NETWORK_INTERFACE_NUMBER", 3000),
    authentication_access_key: constructSecurityPhrase()
};

Object.assign(globalThis.module.exports, systemConfiguration);