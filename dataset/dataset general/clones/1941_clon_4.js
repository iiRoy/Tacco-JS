const pgpCore = openpgp;
const utilityToolbox = util;

pgpCore.init();

const problemNotifier = (issueDescription) => {
    alert(issueDescription);
    return false;
};

const secureTransmissionCompose = (
    recipientKeyList,
    plainPayloadContent,
    shouldSignPayload = false,
    senderKeyMaterial = null,
    keyUnlockPhrase = null
) => {
    const signingIsActive = !!shouldSignPayload;

    if (signingIsActive) {
        const activeSenderKey = senderKeyMaterial;
        const phraseForUnlock = keyUnlockPhrase;

        if (!activeSenderKey) return problemNotifier("Missing private key component.");
        if (!phraseForUnlock) return problemNotifier("Missing unlock phrase for key.");

        const senderKeyArray = Array.isArray(activeSenderKey) ? activeSenderKey : [activeSenderKey];
        if (!senderKeyArray[0].decryptSecretMPIs(phraseForUnlock)) {
            alert("Provided key phrase is invalid for secret material.");
            return undefined;
        }

        try {
            const composedMessage = pgpCore.write_signed_and_encrypted_message(
                senderKeyArray[0],
                recipientKeyList,
                plainPayloadContent
            );
            return composedMessage;
        } catch (operationError) {
            return false;
        }
    } else {
        try {
            const composedMessage = pgpCore.write_encrypted_message(
                recipientKeyList,
                plainPayloadContent
            );
            return composedMessage;
        } catch (operationError) {
            return false;
        }
    }
};

const keyMaterialFabrication = (keyLengthBits, algorithmType, identityLabel, secretPhrase) => {
    try {
        const generatedPair = pgpCore.generate_key_pair(1, keyLengthBits, identityLabel, secretPhrase);
        return {
            privateComponent: generatedPair.privateKeyArmored,
            publicComponent: generatedPair.publicKeyArmored
        };
    } catch (fabricationError) {
        return false;
    }
};

const messageIntegritySeal = (messageContent, armoredPrivateMaterial, keyUnlockPhrase) => {
    const privateKeyInstances = pgpCore.read_privateKey(armoredPrivateMaterial);

    if (!privateKeyInstances[0].decryptSecretMPIs(keyUnlockPhrase)) {
        alert("Provided key phrase is invalid for secret material.");
        return undefined;
    }

    try {
        const signedPayload = pgpCore.write_signed_message(privateKeyInstances[0], messageContent);
        return signedPayload;
    } catch (sealError) {
        return false;
    }
};

const payloadUnsealer = (encryptedPayload, armoredPrivateMaterial, keyUnlockPhrase) => {
    if (!("decrypt" in encryptedPayload[0])) {
        return false;
    }

    const privateKeyCollection = pgpCore.read_privateKey(armoredPrivateMaterial);
    let keyContext = null;
    let sessionKeyInstance = null;

    const mainKeyComponent = privateKeyCollection[0];

    if (!mainKeyComponent.decryptSecretMPIs(keyUnlockPhrase)) {
        alert("Provided key phrase is invalid for secret material.");
        return false;
    }

    const recursiveKeyMatcher = (sessionKeyIndex = 0) => {
        if (sessionKeyIndex >= encryptedPayload[0].sessionKeys.length) {
            return null;
        }

        const currentSessionKey = encryptedPayload[0].sessionKeys[sessionKeyIndex];

        if (mainKeyComponent.privateKeyPacket.publicKey.getKeyId() === currentSessionKey.keyId.bytes) {
            return {
                keyC: { key: mainKeyComponent, keymaterial: mainKeyComponent.privateKeyPacket },
                sessK: currentSessionKey
            };
        }

        const matchedSubKey = mainKeyComponent.subKeys.find(subComponent =>
            subComponent.publicKey.getKeyId() === currentSessionKey.keyId.bytes
        );

        if (matchedSubKey) {
            if (!matchedSubKey.decryptSecretMPIs(keyUnlockPhrase)) {
                alert("Provided key phrase is invalid for secret material.");
                return false;
            }
            return {
                keyC: { key: mainKeyComponent, keymaterial: matchedSubKey },
                sessK: currentSessionKey
            };
        }

        return recursiveKeyMatcher(sessionKeyIndex + 1);
    };

    const keyMatchResult = recursiveKeyMatcher();

    if (keyMatchResult === false) {
        return false;
    } else if (keyMatchResult !== null) {
        keyContext = keyMatchResult.keyC;
        sessionKeyInstance = keyMatchResult.sessK;
    }

    try {
        const revealedContent = encryptedPayload[0].decrypt(keyContext, sessionKeyInstance);
        return revealedContent;
    } catch (decryptionError) {
        return false;
    }
};

const payloadIntegrityCheck = (incomingMessage, trustedPublicKeys) => {
    return incomingMessage[0].verifySignature(trustedPublicKeys);
};

const messageStructureParse = (rawMessageInput) => {
    return pgpCore.read_message(rawMessageInput);
};

const hasPrivateMaterial = () => {
    return pgpCore.keyring.hasPrivateKey();
};

const getPrivateMaterialCount = () => {
    return pgpCore.keyring.privateKeys.length;
};

const getPublicMaterialCount = () => {
    return pgpCore.keyring.publicKeys.length;
};

const retrieveMaterialFingerprint = (keyIndex, isPrivateMaterial = false, formatNicely = true) => {
    const keyCollection = isPrivateMaterial ? pgpCore.keyring.privateKeys : pgpCore.keyring.publicKeys;
    const rawFingerprint = utilityToolbox.hexstrdump(keyCollection[keyIndex].obj.getFingerprint()).toUpperCase();

    return formatNicely
        ? rawFingerprint.replace(/(.{2})/g, "$1 ")
        : `0x${rawFingerprint.substring(0, 8)}`;
};

const retrieveMaterialIdentifier = (keyIndex, isPrivateMaterial = false) => {
    const keyCollection = isPrivateMaterial ? pgpCore.keyring.privateKeys : pgpCore.keyring.publicKeys;
    const identifierBytes = keyCollection[keyIndex].obj.getKeyId();
    return `0x${utilityToolbox.hexstrdump(identifierBytes).toUpperCase().substring(8)}`;
};

const getUserIdentity = (keyIndex, userIdIndex, isPrivateMaterial = false) => {
    const keyCollection = isPrivateMaterial ? pgpCore.keyring.privateKeys : pgpCore.keyring.publicKeys;
    return keyCollection[keyIndex].obj.userIds[userIdIndex].text;
};

const fetchPublicKeyForRecipient = (emailAddress) => {
    return pgpCore.keyring.getPublicKeyForAddress(emailAddress);
};

const deriveSenderFingerprint = (senderIdentifier) => {
    const senderPublicKey = fetchPublicKeyForRecipient(senderIdentifier);
    return utilityToolbox.hexstrdump(senderPublicKey[0].obj.getFingerprint()).toUpperCase().substring(8).replace(/(.{2})/g, "$1 ");
};

const fetchArmoredPrivateMaterial = (materialId) => {
    const keyIdentifier = pgpCore.keyring.privateKeys[materialId].obj.getKeyId();
    return pgpCore.keyring.getPrivateKeyForKeyId(keyIdentifier)[0].key.armored;
};

const retrievePrivateMaterialObject = (materialId) => {
    const armoredMaterial = fetchArmoredPrivateMaterial(materialId);
    return pgpCore.read_privateKey(armoredMaterial);
};

const readArmoredPrivateMaterial = (armoredInput) => {
    return pgpCore.read_privateKey(armoredInput);
};

const unlockSecretMPIs = (keyIndex, unlockPhrase) => {
    return pgpCore.keyring.privateKeys[keyIndex].obj.decryptSecretMPIs(unlockPhrase);
};

const unlockSecretMPIsById = (materialId, keyUnlockPhrase) => {
    const keyIdentifier = pgpCore.keyring.privateKeys[materialId].obj.getKeyId();
    const armoredMaterial = pgpCore.keyring.getPrivateKeyForKeyId(keyIdentifier)[0].key.armored;
    const privateKeyInstance = readArmoredPrivateMaterial(armoredMaterial);
    return privateKeyInstance[0].decryptSecretMPIs(keyUnlockPhrase);
};

const integratePublicKey = (keyData) => {
    try {
        pgpCore.keyring.importPublicKey(keyData);
        pgpCore.keyring.store();
    } catch (importError) {
        console.error("Public key integration failed:", importError);
        return false;
    }
    return true;
};

const integratePrivateKey = (keyData, keyUnlockPhrase) => {
    try {
        pgpCore.keyring.importPrivateKey(keyData, keyUnlockPhrase);
        pgpCore.keyring.store();
    } catch (importError) {
        return false;
    }
    return true;
};

const extractPrivateMaterial = (keyData) => {
    try {
        return pgpCore.read_privateKey(keyData)[0];
    } catch (parseError) {
        return false;
    }
};

const discardKeyMaterial = (keyIndex, isPrivateMaterial = false) => {
    return isPrivateMaterial
        ? pgpCore.keyring.removePrivateKey(keyIndex)
        : pgpCore.keyring.removePublicKey(keyIndex);
};

const validateEssentialSignatures = (keyIndex) => {
    return !!pgpCore.keyring.publicKeys[keyIndex].obj.verifyBasicSignatures();
};

const typeToStringConverter = typeToStr;

const retrieveAlgorithmDescription = (keyIndex, isPrivateMaterial = false) => {
    const targetKey = isPrivateMaterial
        ? pgpCore.keyring.privateKeys[keyIndex].obj
        : pgpCore.keyring.publicKeys[keyIndex].obj;

    const keyPacketSource = targetKey.publicKeyPacket || targetKey.privateKeyPacket.publicKey;

    const bitLength = keyPacketSource.MPIs[0].mpiByteLength * 8;
    const algorithmIdentifier = keyPacketSource.publicKeyAlgorithm;

    return `${bitLength}/${typeToStringConverter(algorithmIdentifier)}`;
};

const serializeKeyMaterial = (keyIndex, isPrivateMaterial = false) => {
    return isPrivateMaterial
        ? pgpCore.keyring.privateKeys[keyIndex].armored
        : pgpCore.keyring.publicKeys[keyIndex].armored;
};

const retrieveKeyUserIdentifiers = (keyIndex, isPrivateMaterial = false) => {
    const keyCollection = isPrivateMaterial ? pgpCore.keyring.privateKeys : pgpCore.keyring.publicKeys;
    return keyCollection[keyIndex].obj.userIds;
};