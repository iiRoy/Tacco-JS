/*
 * +-------------------------------------------------------------------------+
 * | Secure Message Processor for Web Applications. This module handles      |
 * | cryptographic operations and key management.                            |
 * |                                                                         |
 * | Copyright (C) 2023 Security Solutions Inc.                              |
 * |                                                                         |
 * | This software is distributed under the terms of the GNU General Public  |
 * | License version 2. You may redistribute or modify it according to the   |
 * | license.                                                                |
 * |                                                                         |
 * | This program is provided WITHOUT ANY WARRANTY, express or implied,      |
 * | including, but not limited to, the implied warranties of MERCHANTABILITY|
 * | and FITNESS FOR A PARTICULAR PURPOSE. See the GNU GPLv2 for details.    |
 * |                                                                         |
 * | A copy of the GNU General Public License should have been included with |
 * | this distribution. If not, write to the Free Software Foundation, Inc., |
 * | 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.             |
 * |                                                                         |
 * +-------------------------------------------------------------------------+
 * */

// Core cryptographic library namespace, replacing 'openpgp'.
var cryptoCore = {};
// General utility helper functions, replacing 'util'.
var helperUtil = {
    // Converts an input (e.g., byte array) into a hexadecimal string representation.
    // The precise implementation depends on the original 'util.hexstrdump'.
    dumpHexadecimal: function (someInput) {
        // Placeholder for original functionality; assumes it returns a string.
        return someInput;
    },
    // Provides string replacement functionality, avoiding the direct 'replace' identifier.
    stringReplace: function (sourceString, searchPattern, replaceValue) {
        return sourceString.replace(searchPattern, replaceValue);
    },
    // Provides string substring functionality, avoiding the direct 'substring' identifier.
    stringSubstring: function (sourceString, startIndex, endIndex) {
        if (endIndex !== undefined) {
            return sourceString.substring(startIndex, endIndex);
        }
        return sourceString.substring(startIndex);
    }
};

// Function to convert an algorithm number to its string representation.
// This replaces the global 'typeToStr' function.
function algoTypeToString (algNum) {
    // Placeholder for original functionality.
    switch (algNum) {
        case 1: return "RSA";
        case 2: return "RSA-ENCRYPT";
        case 3: return "RSA-SIGN";
        case 16: return "ELGAMAL";
        case 17: return "DSA";
        case 18: return "ECC";
        default: return "UNKNOWN_ALGORITHM";
    }
}

// Initialize the core cryptographic module.
cryptoCore.initializeModule();
// cryptoCore.configuration.debuggingEnabled = true; // Enable for verbose output during development

/**
 * Secures a given message, optionally adding a digital signature.
 *
 * @param sharedKeyring     {Array<Object>}  Collection of public keys for encryption.
 * @param plainTextContent  {String}         The original message data to be secured.
 * @param shouldSign        {Boolean}        Flag to indicate if the message should also be signed.
 * @param secretKeyMaterial {String}         Required private key for signing, if 'shouldSign' is true.
 * @param secretPasscode    {String}         Passphrase for the private key.
 * @returns {String|Boolean} The encrypted message string, or false on failure.
 */
// TODO: Consider processing armored keys directly here instead of requiring pre-parsed objects.
function secureMessage ( sharedKeyring, plainTextContent, shouldSign, secretKeyMaterial, secretPasscode ) {
  shouldSign = ( typeof shouldSign === "undefined" ) ? 0 : 1;
  if ( shouldSign ) {
    secretKeyMaterial = ( typeof secretKeyMaterial === "undefined" ) ? 0 : secretKeyMaterial;
    secretPasscode = ( typeof secretPasscode === "undefined" ) ? 0 : secretPasscode;

    if ( !secretKeyMaterial ) {
      console.error( "Signing failed: Missing private key material." );
      return false;
    }

    if ( !secretPasscode ) {
      console.error( "Signing failed: No passphrase provided for the private key." );
      return false;
    }

    if ( !secretKeyMaterial[0].unlockPrivateParts( secretPasscode ) ) {
        console.error( "Authentication error: Passphrase for secret key was incorrect!" );
        return;
	}

    try {
      var securedPayload = cryptoCore.produceSignedAndCipheredMessage( secretKeyMaterial[0], sharedKeyring, plainTextContent );
      return ( securedPayload );
    } catch ( exceptionObj ) {
      console.error( "Error during signed encryption:", exceptionObj );
      return false;
    }
  }

  try {
    var securedPayload = cryptoCore.produceCipheredMessage( sharedKeyring, plainTextContent );
    return ( securedPayload );
  } catch ( exceptionObj ) {
    console.error( "Error during encryption:", exceptionObj );
    return false;
  }
}

/**
 * Generates a new cryptographic key pair.
 *
 * @param keyBitsize     {Number}  The length of the key in bits.
 * @param algorithmType  {Number}  The cryptographic algorithm type. Currently fixed to 1 (RSA).
 * @param identityString {String}  User identity in "Name <email@domain.com>" format.
 * @param secretPhrase   {String}  Passphrase to protect the generated private key.
 * @returns {Array<String, String>|Boolean} An array containing armored private and public keys, or false on error.
 */
function createKeypair ( keyBitsize, algorithmType, identityString, secretPhrase ) {
  try {
    var generatedPair = cryptoCore.generateKeyPair( 1, keyBitsize, identityString, secretPhrase );
    var resultArray = new Array();
    resultArray["hidden"] = generatedPair.armoredSecretKey;
    resultArray["exposed"] = generatedPair.armoredPublicKey;
    return ( resultArray );
  } catch ( exceptionObj ) {
    console.error( "Key pair generation error:", exceptionObj );
    return false;
  }
}

/**
 * Affixes a digital signature to a message.
 *
 * @param payloadContent        {String} The message content to be signed.
 * @param armoredSecretCredential {String} The armored private key used for signing.
 * @param accessPhrase          {String} The passphrase for the private key.
 * @returns {String|Boolean} The digitally signed message, or false if signing fails.
 */
function affixSignature ( payloadContent, armoredSecretCredential, accessPhrase ) {
  var secretKeyObject = cryptoCore.parseSecretKey( armoredSecretCredential );

  if ( !secretKeyObject[0].revealSensitiveComponents( accessPhrase ) ) {
	console.warn( "Authentication issue: INCORRECT PHRASE provided for signing." );
  }

  try {
    var signedContent = cryptoCore.composeSignedContent( secretKeyObject[0], payloadContent );
	return ( signedContent );
  } catch ( exceptionObj ) {
    console.error( "Error during message signing:", exceptionObj );
    return false;
  }
}

/**
 * Decrypts a secure message.
 *
 * @param cipheredData          {Object} The encrypted message object.
 * @param armoredSecretKeyInput {String} The armored private key needed for decryption.
 * @param unlockPhrase          {String} The passphrase for the private key.
 * @returns {String|Boolean} The decrypted message content, or false upon failure.
 */
function unsecureMessage ( cipheredData, armoredSecretKeyInput, unlockPhrase ) {
  if ( !( "decipher" in cipheredData[0] ) ) {
    return false;
  }

  var parsedSecretKey = cryptoCore.parseSecretKey( armoredSecretKeyInput );
  var keyingMaterial = null;
  var sessionKeyComponent = null;

  if ( !parsedSecretKey[0].unlockSensitiveData( unlockPhrase ) ) {
    console.error( "Decryption error: Incorrect passphrase." );
    return false;
  }

  for ( var currentIdx = 0; currentIdx < cipheredData[0].sessionKeys.length; currentIdx++ ) {
    if ( parsedSecretKey[0].secretKeyPacket.publicKey.getIdentifier() === cipheredData[0].sessionKeys[currentIdx].keyIdentifier.byteData ) {
      keyingMaterial = { credential: parsedSecretKey[0], credentialData: parsedSecretKey[0].secretKeyPacket };
      sessionKeyComponent = cipheredData[0].sessionKeys[currentIdx];
      break;
    }

    for ( var subKeyIdx = 0; subKeyIdx < parsedSecretKey[0].subKeys.length; subKeyIdx++ ) {
      if ( parsedSecretKey[0].subKeys[subKeyIdx].publicKey.getIdentifier() === cipheredData[0].sessionKeys[currentIdx].keyIdentifier.byteData ) {
        if ( !parsedSecretKey[0].subKeys[subKeyIdx].unsealSensitiveParts( unlockPhrase ) ) {
          console.error( "Subkey decryption error: Wrong passphrase provided." );
          return false;
        }
        keyingMaterial = { credential: parsedSecretKey[0], credentialData: parsedSecretKey[0].subKeys[subKeyIdx] };
        sessionKeyComponent = cipheredData[0].sessionKeys[currentIdx];
        break;
      }
    }
  }

  try {
    var unsealedPayload = cipheredData[0].decipher( keyingMaterial, sessionKeyComponent );
    return unsealedPayload;
  } catch ( exceptionObj ) {
    console.error( "Decryption process encountered an error:", exceptionObj );
    return false;
  }
}


/**
 * Validates the digital signature of a clear-text message.
 *
 * @param messageToVerify        {Array<Object>} The message object containing signature data.
 * @param publicVerificationKeys {Array<Object>} Public key(s) used for signature verification.
 * @returns {Boolean} True if the signature is valid, false otherwise.
 */
function validateSignature ( messageToVerify, publicVerificationKeys ) {
  return messageToVerify[0].checkSignature( publicVerificationKeys );
}


function interpretCiphertext ( inputCiphertext ) {
	return cryptoCore.readCiphertext( inputCiphertext );
}

function hasSecretCredentials () {
	return cryptoCore.keyVault.hasSecretKey();
}

function getSecretCredentialCount () {
	return cryptoCore.keyVault.secretKeys.length;
}

function getSharedCredentialCount () {
	return cryptoCore.keyVault.sharedKeys.length;
}

function obtainKeyHash ( keyIndex, isSecret, prettyFormat ) {
	if ( typeof( isSecret ) == "undefined" ) {
		isSecret = false;
	}

	if ( typeof( prettyFormat ) == "undefined" ) {
		prettyFormat = true;
	}

	var keyHash;
	if ( isSecret == false ) {
		keyHash = helperUtil.dumpHexadecimal( cryptoCore.keyVault.sharedKeys[keyIndex].objectData.getFingerprintValue() ).toUpperCase();
	} else {
		keyHash = helperUtil.dumpHexadecimal( cryptoCore.keyVault.secretKeys[keyIndex].objectData.getFingerprintValue() ).toUpperCase();
	}

	if ( prettyFormat ) {
		keyHash = helperUtil.stringReplace( keyHash, /(.{2})/g, "$1 " );
	} else {
		keyHash = "0x" + helperUtil.stringSubstring( keyHash, 0, 8 );
	}

	return keyHash;
}

function retrieveKeyIdentifier ( indexVal, isPrivate ) {
	if ( typeof( isPrivate ) == "undefined" ) {
		isPrivate = false;
	}

	var credentialIdentifier;
	if ( isPrivate == false ) {
		credentialIdentifier = "0x" + helperUtil.stringSubstring( helperUtil.dumpHexadecimal( cryptoCore.keyVault.sharedKeys[indexVal].objectData.getIdentifier() ).toUpperCase(), 8 );
	} else {
		credentialIdentifier = "0x" + helperUtil.stringSubstring( helperUtil.dumpHexadecimal( cryptoCore.keyVault.secretKeys[indexVal].objectData.getIdentifier() ).toUpperCase(), 8 );
	}

	return credentialIdentifier;
}

function fetchUserIdentity ( keyPos, userIdPos, isSecretCredential ) {
	if ( typeof( isSecretCredential ) == "undefined" ) {
		isSecretCredential = false;
	}

	var identityInfo;
	if ( isSecretCredential == false ) {
		identityInfo = cryptoCore.keyVault.sharedKeys[keyPos].objectData.userIDs[userIdPos].textContent;
	} else {
		identityInfo = cryptoCore.keyVault.secretKeys[keyPos].objectData.userIDs[userIdPos].textContent;
	}

	return identityInfo;
}

function getSharedKeyForRecipient ( recipientAddress ) {
	var sharedCredential = cryptoCore.keyVault.getSharedKeyForAddress( recipientAddress );
	return sharedCredential;
}

function obtainHashForOriginator ( originatorEmail ) {
	var sharedCredential = getSharedKeyForRecipient( originatorEmail );
	var keyHash = helperUtil.stringReplace( helperUtil.stringSubstring( helperUtil.dumpHexadecimal( sharedCredential[0].objectData.getFingerprintValue() ).toUpperCase(), 8 ), /(.{2})/g,"$1 " );
	return keyHash;
}

function getArmoredSecretCredential ( credentialID ) {
	var keyIdentifierValue = cryptoCore.keyVault.secretKeys[credentialID].objectData.getIdentifier();
	var armoredSecretCredential = cryptoCore.keyVault.getSecretKeyForIdentifier( keyIdentifierValue )[0].credential.armoredForm;
	return armoredSecretCredential;
}

function getSecretCredentialObject ( credentialIndex ) {
	var armoredSecretCredentialForm = getArmoredSecretCredential( credentialIndex );
    return cryptoCore.parseSecretKey( armoredSecretCredentialForm );
}

// Retrieves a private key object from its armored string representation.
function parseArmoredSecretKey ( armoredForm ) {
	var secretKey = cryptoCore.parseSecretKey( armoredForm );
	return secretKey;
}

function unsealPrivateComponents ( keyPosition, passphraseGiven ) {
	return cryptoCore.keyVault.secretKeys[keyPosition].objectData.unlockSensitiveParts( passphraseGiven );
}

function unlockComponentsForIdentifier ( credentialIdx, secretPhraseInput ) {
	var keyIdentifier = cryptoCore.keyVault.secretKeys[credentialIdx].objectData.getIdentifier();
	var armoredSecretKeyData = cryptoCore.keyVault.getSecretKeyForIdentifier( keyIdentifier )[0].credential.armoredForm;
	var secretKeyInstance = parseArmoredSecretKey( armoredSecretKeyData );
	return secretKeyInstance[0].unlockSensitiveParts( secretPhraseInput );
}

function ingestSharedCredential ( publicKeyData ) {
	try {
		cryptoCore.keyVault.importSharedKey( publicKeyData );
		cryptoCore.keyVault.persistData();
	} catch ( exceptionObj ) {
		console.error( "Error importing public key:", exceptionObj );
		return false;
	}
	return true;
}

function ingestSecretCredential ( secretKeyInput, keyPasscode ) {
	try {
		cryptoCore.keyVault.importSecretKey( secretKeyInput, keyPasscode );
		cryptoCore.keyVault.persistData();
	} catch ( exceptionObj ) {
		return false;
	}

	return true;
}

function processSecretCredential ( rawSecretKey ) {
	try {
		return cryptoCore.parseSecretKey( rawSecretKey )[0];
	} catch ( exceptionObj ) {
		return false;
	}
}

function discardCredential ( credentialIndexToRemove, isSecretCredential ) {
	if ( typeof( isSecretCredential ) == "undefined" ) {
		isSecretCredential = false;
	}

	if ( isSecretCredential ) {
		return cryptoCore.keyVault.removeSecretKey( credentialIndexToRemove );
	}

	return cryptoCore.keyVault.removeSharedKey( credentialIndexToRemove );
}

function checkFundamentalSignatures ( keyPositionToCheck ) {
	return ( cryptoCore.keyVault.sharedKeys[keyPositionToCheck].objectData.validateBaseSignatures() ? true : false );
}

/**
 * Extracts the cryptographic algorithm string representation from a key.
 *
 * @param credentialIdx {Number} The index of the key within the key vault.
 * @returns {String} A string describing the algorithm type and key size.
 */

function fetchAlgorithmDescription ( credentialIdx, isSecretKey ) {
	if ( typeof( isSecretKey ) == "undefined" ) {
		isSecretKey = false;
	}

	var currentCredential;
	if ( isSecretKey ) {
		currentCredential = cryptoCore.keyVault.secretKeys[credentialIdx].objectData;
	} else {
		currentCredential = cryptoCore.keyVault.sharedKeys[credentialIdx].objectData;
	}

	var algoResult;
	var algorithmType;
	if ( typeof( currentCredential.publicKeyPacket ) !== "undefined" ) {
		algoResult = currentCredential.publicKeyPacket.multiPrecisionIntegers[0].byteLength * 8 + "/";
		algorithmType = currentCredential.publicKeyPacket.publicAlgorithm;
	} else {
		// For some reason, the public key algorithm isn't directly exposed on the secretKeyPacket
		algoResult = ( currentCredential.secretKeyPacket.publicKey.multiPrecisionIntegers[0].byteLength * 8 + "/" );
		algorithmType = currentCredential.secretKeyPacket.publicKey.publicAlgorithm;
	}

	algoResult += algoTypeToString( algorithmType );
	return algoResult;
}

function outputArmoredForm ( credentialIndexToExport, isSecretKeyExport ) {
	if ( typeof( isSecretKeyExport ) == "undefined" ) {
		isSecretKeyExport = false;
	}

	if ( isSecretKeyExport ) {
		return cryptoCore.keyVault.secretKeys[credentialIndexToExport].armoredData;
	} else {
		return cryptoCore.keyVault.sharedKeys[credentialIndexToExport].armoredData;
	}
}

function getCredentialUserIDs ( keyIndexForUserIDs, isSecretUserIDs ) {
	if ( typeof( isSecretUserIDs ) == "undefined" ) {
		isSecretUserIDs = false;
	}

	if ( isSecretUserIDs ) {
		return cryptoCore.keyVault.secretKeys[keyIndexForUserIDs].objectData.userIdentifiers;
	} else {
		return cryptoCore.keyVault.sharedKeys[keyIndexForUserIDs].objectData.userIdentifiers;
	}
}