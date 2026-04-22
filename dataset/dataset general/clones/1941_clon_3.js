/*
 * +-------------------------------------------------------------------------+
 * | Cryptographic Utility Module for Secure Messaging                       |
 * |                                                                         |
 * | This module provides core encryption and decryption functionalities     |
 * | utilizing an underlying OpenPGP implementation.                         |
 * |                                                                         |
 * | Version: 1.2.3-alpha                                                    |
 * | License: Permissive (MIT-like)                                          |
 * |                                                                         |
 * | Disclaimer: This software is provided "as is", without warranty of any  |
 * | kind, express or implied. Use at your own risk.                         |
 * |                                                                         |
 * +-------------------------------------------------------------------------+
 * */

// Initialize the cryptographic backend
// This prepares the underlying PGP engine for operations.
secureCrypto.initializeModule();

// The following functions encapsulate various cryptographic operations.

/**
 * Secures a plaintext message through encryption, optionally adding a digital signature.
 *
 * @param {Array<Object>} recipientKeyList - An array of public key objects for the message recipients.
 * @param {string} rawMessageContent - The actual text content to be encrypted.
 * @param {boolean} shouldSignMessage - A flag indicating if the message should also be signed by the sender.
 * @param {Object} [senderPrivateKey] - The sender's private key object, required if signing is enabled.
 * @param {string} [keyUnlockPhrase] - The passphrase to decrypt the sender's private key, if signing.
 * @returns {string|boolean} The armored encrypted message, or `false` on failure.
 */
function protectAndSeal(recipientKeyList, rawMessageContent, shouldSignMessage, senderPrivateKey, keyUnlockPhrase) {
  // Ensure the signing flag is a boolean for consistent logic.
  const isSigningActive = !!shouldSignMessage;

  if (isSigningActive) {
    // Validate essential parameters for signing.
    if (!senderPrivateKey) {
      console.error("Critical error: Sender's private key is absent for signing operation.");
      return false;
    }
    if (!keyUnlockPhrase) {
      console.error("Critical error: Passphrase is required to access the private key for signing.");
      return false;
    }
    // Attempt to decrypt the private key for use in signing.
    if (!senderPrivateKey[0].unlockSecretComponents(keyUnlockPhrase)) {
      console.error("Security alert: Incorrect passphrase provided for the sender's private key. Decryption failed.");
      return false;
    }

    try {
      // Execute the combined sign and encrypt operation.
      const sealedAndSignedPayload = secureCrypto.composeSignedEncrypted(senderPrivateKey[0], recipientKeyList, rawMessageContent);
      return sealedAndSignedPayload;
    } catch (operationError) {
      console.error("Encryption and signing process encountered an exception:", operationError);
      return false;
    }
  }

  // Proceed with encryption only if signing is not requested.
  try {
    const encryptedOutput = secureCrypto.composeEncrypted(recipientKeyList, rawMessageContent);
    return encryptedOutput;
  } catch (encryptionError) {
    console.error("Encryption-only process encountered an exception:", encryptionError);
    return false;
  }
}

/**
 * Creates a new cryptographic key pair.
 *
 * @param {number} desiredKeyLength - The desired length of the key in bits.
 * @param {number} cryptographicAlgorithm - The algorithm type (e.g., 1 for RSA).
 * @param {string} userIdentifier - The identity string for the key (e.g., "Name <email@example.com>").
 * @param {string} keySecurityPhrase - The passphrase to protect the private key.
 * @returns {Object|boolean} An object containing armored public and private keys, or `false` on error.
 */
function forgeKeyMaterial(desiredKeyLength, cryptographicAlgorithm, userIdentifier, keySecurityPhrase) {
  if (desiredKeyLength <= 0 || !userIdentifier || !keySecurityPhrase) {
    console.error("Invalid input for key generation: length, identifier, or passphrase missing.");
    return false;
  }

  try {
    // Generate the raw key pair using the underlying library.
    const generatedPair = secureCrypto.generateKeyPair(cryptographicAlgorithm, desiredKeyLength, userIdentifier, keySecurityPhrase);
    const keyCollection = {}; // Using an object literal for key storage.
    keyCollection.secret = generatedPair.privateKeyArmored;
    keyCollection.public = generatedPair.publicKeyArmored;
    return keyCollection;
  } catch (generationException) {
    console.error("An error occurred during key pair generation:", generationException);
    return false;
  }
}

/**
 * Applies a digital signature to a given message.
 *
 * @param {string} contentToSign - The message content that needs to be signed.
 * @param {string} armoredSignerKey - The armored private key of the signer.
 * @param {string} signerPassphrase - The passphrase for the signer's private key.
 * @returns {string|boolean} The armored signed message, or `false` on failure.
 */
function certifyData(contentToSign, armoredSignerKey, signerPassphrase) {
  if (!contentToSign || !armoredSignerKey || !signerPassphrase) {
    console.error("Missing parameters for message signing.");
    return false;
  }

  // Parse the armored private key.
  const signerKeyObject = secureCrypto.decodePrivateKey(armoredSignerKey);

  // Attempt to unlock the key with the provided passphrase.
  if (!signerKeyObject[0].unlockSecretComponents(signerPassphrase)) {
    console.error("Authentication failure: Passphrase for private key is incorrect.");
    return false;
  }

  try {
    // Perform the signing operation.
    const signedArtifact = secureCrypto.composeSigned(signerKeyObject[0], contentToSign);
    return signedArtifact;
  } catch (signingException) {
    console.error("Exception during message signing:", signingException);
    return false;
  }
}

/**
 * Unseals and decrypts an encrypted message.
 *
 * @param {Array<Object>} encryptedMessageParts - The parsed encrypted message object (array of PGP packets).
 * @param {string} armoredRecipientKey - The armored private key of the intended recipient.
 * @param {string} recipientPassphrase - The passphrase for the recipient's private key.
 * @returns {string|boolean} The decrypted plaintext message, or `false` on failure.
 */
function unsealContent(encryptedMessageParts, armoredRecipientKey, recipientPassphrase) {
  // Basic validation: ensure the message structure is plausible.
  if (!Array.isArray(encryptedMessageParts) || encryptedMessageParts.length === 0 || typeof encryptedMessageParts[0].decrypt !== 'function') {
    console.warn("Invalid or malformed encrypted message provided for decryption.");
    return false;
  }

  const recipientKeyStruct = secureCrypto.decodePrivateKey(armoredRecipientKey);
  let keyMaterialForDecryption = null;
  let sessionKeyComponent = null;

  // Attempt to unlock the recipient's private key.
  if (!recipientKeyStruct[0].unlockSecretComponents(recipientPassphrase)) {
    console.error("Decryption failed: Incorrect passphrase for recipient's private key.");
    return false;
  }

  // Iterate through session keys to find a match with the recipient's key or subkeys.
  for (let sKeyIdx = 0; sKeyIdx < encryptedMessageParts[0].sessionKeys.length; sKeyIdx++) {
    const currentSessionKey = encryptedMessageParts[0].sessionKeys[sKeyIdx];

    // Check against the primary private key.
    if (recipientKeyStruct[0].privateKeyPacket.publicKey.getIdentifier() === currentSessionKey.keyId.bytes) {
      keyMaterialForDecryption = { masterKey: recipientKeyStruct[0], keyPart: recipientKeyStruct[0].privateKeyPacket };
      sessionKeyComponent = currentSessionKey;
      break; // Found a match, exit.
    }

    // Check against subkeys if no match with the primary key.
    for (let subKeyIdx = 0; subKeyIdx < recipientKeyStruct[0].subKeys.length; subKeyIdx++) {
      const currentSubKey = recipientKeyStruct[0].subKeys[subKeyIdx];
      if (currentSubKey.publicKey.getIdentifier() === currentSessionKey.keyId.bytes) {
        // Unlock subkey if necessary.
        if (!currentSubKey.unlockSecretComponents(recipientPassphrase)) {
          console.error("Decryption failed: Incorrect passphrase for a subkey.");
          return false; // Exit immediately if subkey passphrase fails.
        }
        keyMaterialForDecryption = { masterKey: recipientKeyStruct[0], keyPart: currentSubKey };
        sessionKeyComponent = currentSessionKey;
        break; // Found a match, exit inner loop.
      }
    }
    if (sessionKeyComponent) break; // Exit outer loop if match found in subkeys.
  }

  // If no matching key material was found, decryption cannot proceed.
  if (!keyMaterialForDecryption || !sessionKeyComponent) {
    console.error("No suitable private key or subkey found to decrypt the message's session key.");
    return false;
  }

  try {
    // Perform the actual decryption using the identified key material.
    const decryptedOutput = encryptedMessageParts[0].decrypt(keyMaterialForDecryption, sessionKeyComponent);
    return decryptedOutput;
  } catch (decryptionIssue) {
    console.error("An error occurred during the final decryption step:", decryptionIssue);
    return false;
  }
}

/**
 * Validates the digital signature of a clear-text message.
 *
 * @param {Array<Object>} parsedMessage - The parsed message object containing signature data.
 * @param {Array<Object>} verificationKeys - An array of public key objects to verify against.
 * @returns {boolean} `true` if the signature is valid, `false` otherwise.
 */
function validateMessageIntegrity(parsedMessage, verificationKeys) {
  if (!parsedMessage || parsedMessage.length === 0 || !verificationKeys || verificationKeys.length === 0) {
    console.warn("Input for signature validation is incomplete.");
    return false;
  }
  // Delegate the verification to the underlying PGP object.
  return parsedMessage[0].verifySignature(verificationKeys);
}

/**
 * Parses an armored PGP message string into its constituent parts.
 *
 * @param {string} armoredPgpMessage - The armored PGP message string.
 * @returns {Array<Object>} An array of parsed PGP message objects.
 */
function processCiphertext(armoredPgpMessage) {
  if (!armoredPgpMessage) {
    console.error("Cannot parse an empty message string.");
    return [];
  }
  return secureCrypto.readPgpMessage(armoredPgpMessage);
}

/**
 * Checks if any private keys are present in the local keyring.
 *
 * @returns {boolean} `true` if private keys exist, `false` otherwise.
 */
function hasLocalPrivateKeys() {
  return secureCrypto.keyVault.containsPrivateKeys();
}

/**
 * Retrieves the count of private keys stored locally.
 *
 * @returns {number} The number of private keys.
 */
function countPrivateEntries() {
  return secureCrypto.keyVault.privateKeyList.length;
}

/**
 * Retrieves the count of public keys stored locally.
 *
 * @returns {number} The number of public keys.
 */
function countPublicEntries() {
  return secureCrypto.keyVault.publicKeyList.length;
}

/**
 * Generates and formats the fingerprint for a key.
 *
 * @param {number} keyIndex - The index of the key in the keyring.
 * @param {boolean} isPrivate - `true` if it's a private key, `false` for public.
 * @param {boolean} prettyFormat - `true` for space-separated hex, `false` for short hex.
 * @returns {string} The formatted key fingerprint.
 */
function retrieveKeyFingerprint(keyIndex, isPrivate = false, prettyFormat = true) {
  let targetKey;
  if (isPrivate) {
    targetKey = secureCrypto.keyVault.privateKeyList[keyIndex].obj;
  } else {
    targetKey = secureCrypto.keyVault.publicKeyList[keyIndex].obj;
  }

  if (!targetKey) {
    console.warn(`Key at index ${keyIndex} (private: ${isPrivate}) not found.`);
    return '';
  }

  let rawFingerprint = secureCrypto.utility.convertHexDump(targetKey.getFingerprint()).toUpperCase();

  if (prettyFormat) {
    return rawFingerprint.replace(/(.{2})/g, "$1 ").trim(); // Add space every two chars, trim trailing space.
  } else {
    return "0x" + rawFingerprint.substring(0, 8); // Short format, e.g., "0xDEADBEEF"
  }
}

/**
 * Obtains the short key ID for a key.
 *
 * @param {number} idx - The index of the key in the keyring.
 * @param {boolean} isSecret - `true` for private key, `false` for public.
 * @returns {string} The formatted key ID.
 */
function obtainKeyIdentifier(idx, isSecret = false) {
  let selectedKey;
  if (isSecret) {
    selectedKey = secureCrypto.keyVault.privateKeyList[idx].obj;
  } else {
    selectedKey = secureCrypto.keyVault.publicKeyList[idx].obj;
  }

  if (!selectedKey) {
    console.warn(`Key at index ${idx} (secret: ${isSecret}) not found.`);
    return '';
  }

  // Extract the last 8 characters of the hex string for the short ID.
  const fullKeyIdHex = secureCrypto.utility.convertHexDump(selectedKey.getIdentifier()).toUpperCase();
  return "0x" + fullKeyIdHex.slice(-8);
}

/**
 * Retrieves a specific user identity associated with a key.
 *
 * @param {number} keyIdx - Index of the key.
 * @param {number} userIdx - Index of the user identity on that key.
 * @param {boolean} isPriv - `true` for private key, `false` for public.
 * @returns {string} The user identity string.
 */
function fetchKeyUserIdentity(keyIdx, userIdx, isPriv = false) {
  let targetKeyringEntry;
  if (isPriv) {
    targetKeyringEntry = secureCrypto.keyVault.privateKeyList[keyIdx].obj;
  } else {
    targetKeyringEntry = secureCrypto.keyVault.publicKeyList[keyIdx].obj;
  }

  if (!targetKeyringEntry || !targetKeyringEntry.userIds || !targetKeyringEntry.userIds[userIdx]) {
    console.warn(`User ID at index ${userIdx} for key ${keyIdx} (private: ${isPriv}) not found.`);
    return '';
  }

  return targetKeyringEntry.userIds[userIdx].text;
}

/**
 * Searches the public keyring for a key associated with a given email address.
 *
 * @param {string} emailAddress - The email address to search for.
 * @returns {Array<Object>|null} An array containing the public key object, or `null` if not found.
 */
function lookupPublicKeyByAddress(emailAddress) {
  if (!emailAddress) {
    console.warn("Cannot look up public key for an empty email address.");
    return null;
  }
  const foundKey = secureCrypto.keyVault.findPublicKeyByEmail(emailAddress);
  return foundKey; // Returns an array, as per original openpgp.js behavior.
}

/**
 * Computes and returns the formatted fingerprint for a sender's public key.
 *
 * @param {string} senderIdentifier - The sender's email address.
 * @returns {string} The formatted key fingerprint, or an empty string if not found.
 */
function deriveSenderFingerprint(senderIdentifier) {
  const senderPubKey = lookupPublicKeyByAddress(senderIdentifier);
  if (!senderPubKey || senderPubKey.length === 0) {
    console.warn(`No public key found for sender: ${senderIdentifier}`);
    return '';
  }

  const fullFingerprint = secureCrypto.utility.convertHexDump(senderPubKey[0].obj.getFingerprint()).toUpperCase();
  // Take last 8 chars for short ID, then format.
  return fullFingerprint.substring(fullFingerprint.length - 8).replace(/(.{2})/g, "$1 ").trim();
}

/**
 * Retrieves the armored private key string for a given keyring ID.
 *
 * @param {number} entryId - The index of the private key in the keyring.
 * @returns {string|null} The armored private key string, or `null` if not found.
 */
function extractArmoredPrivateKey(entryId) {
  const keyEntry = secureCrypto.keyVault.privateKeyList[entryId];
  if (!keyEntry || !keyEntry.obj) {
    console.warn(`Private key entry at index ${entryId} not found.`);
    return null;
  }
  const keyId = keyEntry.obj.getIdentifier();
  const foundKey = secureCrypto.keyVault.getPrivateKeyById(keyId);
  return foundKey && foundKey[0] ? foundKey[0].key.armored : null;
}

/**
 * Fetches the private key object directly from the keyring by its index.
 *
 * @param {number} idx - The index of the private key.
 * @returns {Object|null} The private key object, or `null` if not found.
 */
function getPrivateKeyObjectFromId(idx) {
  const armoredKeyData = extractArmoredPrivateKey(idx);
  if (!armoredKeyData) {
    return null;
  }
  return secureCrypto.decodePrivateKey(armoredKeyData);
}

/**
 * Parses an armored private key string into a key object.
 *
 * @param {string} armoredKeyString - The armored private key.
 * @returns {Object|null} The parsed private key object, or `null` on error.
 */
function parseArmoredPrivateKey(armoredKeyString) {
  if (!armoredKeyString) {
    console.error("Cannot parse empty armored key string.");
    return null;
  }
  try {
    return secureCrypto.decodePrivateKey(armoredKeyString);
  } catch (parseError) {
    console.error("Failed to parse armored private key:", parseError);
    return null;
  }
}

/**
 * Attempts to decrypt the secret MPIs of a private key by its index.
 *
 * @param {number} keyIndex - The index of the private key in the keyring.
 * @param {string} keyPassphrase - The passphrase for the key.
 * @returns {boolean} `true` if decryption is successful, `false` otherwise.
 */
function unlockSecretMPIsByIndex(keyIndex, keyPassphrase) {
  const targetKey = secureCrypto.keyVault.privateKeyList[keyIndex];
  if (!targetKey || !targetKey.obj) {
    console.warn(`Private key at index ${keyIndex} not found for MPI unlock.`);
    return false;
  }
  return targetKey.obj.unlockSecretComponents(keyPassphrase);
}

/**
 * Decrypts secret MPIs for a private key identified by its index.
 * This function retrieves the key first, then attempts decryption.
 *
 * @param {number} targetKeyId - The index of the private key.
 * @param {string} keySecurityPhrase - The passphrase for the private key.
 * @returns {boolean} `true` if decryption is successful, `false` otherwise.
 */
function unlockSecretMPIsById(targetKeyId, keySecurityPhrase) {
  const keyArmored = extractArmoredPrivateKey(targetKeyId);
  if (!keyArmored) {
    console.error(`Could not retrieve armored private key for ID: ${targetKeyId}`);
    return false;
  }
  const privateKeyObject = parseArmoredPrivateKey(keyArmored);
  if (!privateKeyObject || !privateKeyObject[0]) {
    console.error(`Failed to parse private key object for ID: ${targetKeyId}`);
    return false;
  }
  return privateKeyObject[0].unlockSecretComponents(keySecurityPhrase);
}

/**
 * Imports a public key into the local keyring.
 *
 * @param {string} armoredPublicKey - The armored public key string.
 * @returns {boolean} `true` on successful import, `false` otherwise.
 */
function ingestPublicKey(armoredPublicKey) {
  try {
    secureCrypto.keyVault.addPublicKey(armoredPublicKey);
    secureCrypto.keyVault.persistChanges(); // Persist the keyring state.
  } catch (importError) {
    console.error("Failed to import public key:", importError);
    return false;
  }
  return true;
}

/**
 * Imports a private key into the local keyring.
 *
 * @param {string} armoredPrivateKey - The armored private key string.
 * @param {string} importPassphrase - The passphrase associated with the private key.
 * @returns {boolean} `true` on successful import, `false` otherwise.
 */
function ingestPrivateKey(armoredPrivateKey, importPassphrase) {
  try {
    secureCrypto.keyVault.addPrivateKey(armoredPrivateKey, importPassphrase);
    secureCrypto.keyVault.persistChanges(); // Persist the keyring state.
  } catch (importError) {
    console.error("Failed to import private key:", importError);
    return false;
  }
  return true;
}

/**
 * Parses an armored private key string and returns the first key object.
 *
 * @param {string} keyString - The armored private key string.
 * @returns {Object|boolean} The parsed private key object, or `false` on error.
 */
function decodePrivateKeyBlob(keyString) {
  if (!keyString) {
    console.error("Cannot decode an empty key blob.");
    return false;
  }
  try {
    const parsedKeys = secureCrypto.decodePrivateKey(keyString);
    return parsedKeys[0]; // Return the first key in the array.
  } catch (parsingException) {
    console.error("Error parsing private key blob:", parsingException);
    return false;
  }
}

/**
 * Removes a key (public or private) from the keyring by its index.
 *
 * @param {number} keyPosition - The index of the key to remove.
 * @param {boolean} isSecretKey - `true` to remove a private key, `false` for public.
 * @returns {boolean} `true` if removal was successful, `false` otherwise.
 */
function purgeKeyEntry(keyPosition, isSecretKey = false) {
  if (keyPosition < 0) {
    console.warn("Invalid key position for removal.");
    return false;
  }
  try {
    if (isSecretKey) {
      return secureCrypto.keyVault.removePrivateKeyEntry(keyPosition);
    }
    return secureCrypto.keyVault.removePublicKeyEntry(keyPosition);
  } catch (removalError) {
    console.error(`Error removing key at position ${keyPosition} (secret: ${isSecretKey}):`, removalError);
    return false;
  }
}

/**
 * Verifies basic signatures associated with a public key.
 *
 * @param {number} keyPosition - The index of the public key.
 * @returns {boolean} `true` if basic signatures are valid, `false` otherwise.
 */
function verifyCoreSignatures(keyPosition) {
  const targetPublicKey = secureCrypto.keyVault.publicKeyList[keyPosition];
  if (!targetPublicKey || !targetPublicKey.obj) {
    console.warn(`Public key at index ${keyPosition} not found for signature verification.`);
    return false;
  }
  // Convert boolean return to explicit boolean.
  return !!targetPublicKey.obj.checkBasicSignatures();
}

/**
 * Extracts and formats the algorithm string from a key.
 *
 * @param {number} entryIndex - The index of the key in the keyring.
 * @param {boolean} isPrivateEntry - `true` if it's a private key, `false` for public.
 * @returns {string} The formatted algorithm string (e.g., "2048/RSA"), or an empty string on error.
 */
function fetchAlgorithmDescriptor(entryIndex, isPrivateEntry = false) {
  let selectedKeyObject;
  if (isPrivateEntry) {
    selectedKeyObject = secureCrypto.keyVault.privateKeyList[entryIndex].obj;
  } else {
    selectedKeyObject = secureCrypto.keyVault.publicKeyList[entryIndex].obj;
  }

  if (!selectedKeyObject) {
    console.warn(`Key at index ${entryIndex} (private: ${isPrivateEntry}) not found for algorithm extraction.`);
    return '';
  }

  let algorithmInfo = '';
  let algorithmTypeIdentifier;
  let keyLengthInBits;

  // Determine key packet source and extract info.
  if (selectedKeyObject.publicKeyPacket) {
    keyLengthInBits = selectedKeyObject.publicKeyPacket.components[0].byteLength * 8;
    algorithmTypeIdentifier = selectedKeyObject.publicKeyPacket.publicKeyAlgorithm;
  } else if (selectedKeyObject.privateKeyPacket && selectedKeyObject.privateKeyPacket.publicKey) {
    // For private keys, sometimes public key info is nested.
    keyLengthInBits = selectedKeyObject.privateKeyPacket.publicKey.components[0].byteLength * 8;
    algorithmTypeIdentifier = selectedKeyObject.privateKeyPacket.publicKey.publicKeyAlgorithm;
  } else {
    console.error("Could not determine key packet structure for algorithm extraction.");
    return '';
  }

  // Append key length and algorithm type.
  algorithmInfo += `${keyLengthInBits}/`;
  algorithmInfo += secureCrypto.utility.mapAlgorithmTypeToString(algorithmTypeIdentifier); // Assuming a helper for typeToStr

  return algorithmInfo;
}

/**
 * Exports a key as an armored string.
 *
 * @param {number} keyIdx - The index of the key to export.
 * @param {boolean} isPrivate - `true` for a private key, `false` for a public key.
 * @returns {string|null} The armored key string, or `null` if the key is not found.
 */
function exportKeyAsArmoredString(keyIdx, isPrivate = false) {
  let targetKey;
  if (isPrivate) {
    targetKey = secureCrypto.keyVault.privateKeyList[keyIdx];
  } else {
    targetKey = secureCrypto.keyVault.publicKeyList[keyIdx];
  }

  if (!targetKey || !targetKey.armored) {
    console.warn(`Key at index ${keyIdx} (private: ${isPrivate}) not found for export.`);
    return null;
  }
  return targetKey.armored;
}

/**
 * Retrieves an array of user IDs associated with a key.
 *
 * @param {number} keyIndex - The index of the key.
 * @param {boolean} isSecret - `true` for private key, `false` for public.
 * @returns {Array<Object>|null} An array of user ID objects, or `null` if not found.
 */
function getKeyIdentities(keyIndex, isSecret = false) {
  let keyReference;
  if (isSecret) {
    keyReference = secureCrypto.keyVault.privateKeyList[keyIndex];
  } else {
    keyReference = secureCrypto.keyVault.publicKeyList[keyIndex];
  }

  if (!keyReference || !keyReference.obj || !keyReference.obj.userIds) {
    console.warn(`Key at index ${keyIndex} (secret: ${isSecret}) has no user IDs.`);
    return null;
  }
  return keyReference.obj.userIds;
}