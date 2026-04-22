/*
 * This file is part of the OpenPGP.js implementation within Roundcube.
 * It primarily handles the cryptographic functions.
 *
 * Copyright (C) 2013 Niklas Femerstrand <nik@qnrq.se>
 *
 * This software is free; you may redistribute it and/or modify it
 * under the terms of the GNU General Public License, version 2,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Refer to the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, write to:
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA 02110-1301 USA.
 */

// Initialize the OpenPGP.js library components
openpgp.init ( ) ;

// Optional: Enable debug mode for OpenPGP.js. Currently commented out.
// openpgp.config.debug = true ;

/**
 * Encrypt a message, with an option to sign it.
 *
 * @param {Array}    pubkeys    An array of public keys for encryption.
 * @param {String}   text       The message content to be encrypted.
 * @param {Boolean}  sign       Flag indicating whether to sign the message.
 * @param {String}   privkey    The private key (required if 'sign' is true).
 * @param {String}   passphrase The passphrase for the private key (if 'sign' is true).
 * @returns {String|Boolean} The armored encrypted message, or false on failure.
 */
// NOTE: Future improvement: Handle armored keys directly within this function.
function encrypt ( pubkeys , text , sign , privkey , passphrase )
{
  // Determine if signing is requested.
  sign = ( typeof sign === "undefined" ) ? 0 : 1 ;

  if ( sign )
  {
    // If signing, ensure private key and passphrase are provided.
    privkey    = ( typeof privkey    === "undefined" ) ? 0 : privkey    ;
    passphrase = ( typeof passphrase === "undefined" ) ? 0 : passphrase ;

    // Check for missing private key
    if ( ! privkey )
    {
      alert ( "missing privkey" ) ;
      return false ;
    }

    // Check for missing passphrase
    if ( ! passphrase )
    {
      alert ( "missing passphrase" ) ;
      return false ;
    }

    // Attempt to decrypt the private key's secret MPIs with the provided passphrase.
    if ( ! privkey[ 0 ].decryptSecretMPIs ( passphrase ) )
    {
      alert ( "Password for secrect key was incorrect!" ) ; // Typo in original: 'secrect'
      return ;
    }

    try
    {
      // Write a signed and encrypted message.
      encrypted = openpgp.write_signed_and_encrypted_message ( privkey[ 0 ] , pubkeys , text ) ;
      return ( encrypted ) ;
    }
    catch ( e )
    {
      // Handle any errors during the signing and encryption process.
      return false ;
    }
  }

  // If not signing, just encrypt the message.
  try
  {
    encrypted = openpgp.write_encrypted_message ( pubkeys , text ) ;
    return ( encrypted ) ;
  }
  catch ( e )
  {
    // Handle errors during encryption.
    return false ;
  }
} // End of encrypt function

/**
 * Generates a new OpenPGP key pair.
 *
 * @param {Integer} bits       Key length in bits (e.g., 2048, 4096).
 * @param {Integer} algo       Key algorithm type. Currently fixed to 1 (RSA).
 * @param {String}  ident      Key identity string, e.g., "John Doe <john.doe@example.com>".
 * @param {String}  passphrase Passphrase for the private key.
 * @returns {Array|Boolean} An array containing armored private and public keys, or false on error.
 */
function generateKeys ( bits , algo , ident , passphrase )
{
  try
  {
    // Generate the key pair. '1' is hardcoded for RSA algorithm type.
    keys = openpgp.generate_key_pair ( 1 , bits , ident , passphrase ) ;
    var arr = new Array ( ) ;
    arr[ "private" ] = keys.privateKeyArmored ;
    arr[ "public"  ] = keys.publicKeyArmored  ;
    return ( arr ) ; // Return the armored keys.
  }
  catch ( e )
  {
    // Catch and handle any exceptions during key generation.
    return false ;
  }
} // End of generateKeys

/**
 * Signs a given message with a private key.
 *
 * @param {String} msg             The message content to sign.
 * @param {String} privkey_armored The armored private key to be used for signing.
 * @param {String} passphrase      The passphrase for the private key.
 * @returns {String|Boolean} The armored signed message, or false on failure.
 */
function sign ( msg , privkey_armored , passphrase )
{
  // Read the armored private key into an OpenPGP.js key object.
  var priv_key = openpgp.read_privateKey ( privkey_armored ) ;

  // Attempt to decrypt the private key's secret MPIs.
  if ( ! priv_key[ 0 ].decryptSecretMPIs ( passphrase ) )
  {
    alert ( "WRONG PASS" ) ; // Inform user of incorrect passphrase.
  }

  try
  {
    // Write the signed message using the decrypted private key.
    var signed = openpgp.write_signed_message ( priv_key[ 0 ] , msg ) ;
    return ( signed ) ;
  }
  catch ( e )
  {
    // Handle any errors during the signing process.
    return false ;
  }
} // End of sign function

/**
 * Decrypts an OpenPGP message.
 *
 * @param {Array}  msg             The message array (parsed by OpenPGP.js) to decrypt.
 * @param {String} privkey_armored The armored private key for decryption.
 * @param {String} passphrase      The passphrase for the private key.
 * @returns {String|Boolean} The decrypted message content as a string, or false on failure.
 */
function decrypt ( msg , privkey_armored , passphrase )
{
  // Check if the message object has a 'decrypt' method.
  if ( ! ( "decrypt" in msg[ 0 ] ) )
  {
    return false ;
  }

  // Read the armored private key.
  var priv_key = openpgp.read_privateKey ( privkey_armored ) ;
  var keymat   = null ;
  var sesskey  = null ;

  // Attempt to decrypt the private key.
  if ( ! priv_key[ 0 ].decryptSecretMPIs ( passphrase ) )
  {
    alert ( "wrong pass" ) ; // Notify user of incorrect passphrase.
    return false ;
  }

  // Iterate through session keys to find a matching key for decryption.
  for ( var i = 0 ; i < msg[ 0 ].sessionKeys.length ; i ++ )
  {
    // Check if the main private key matches a session key ID.
    if ( priv_key[ 0 ].privateKeyPacket.publicKey.getKeyId ( ) === msg[ 0 ].sessionKeys[ i ].keyId.bytes )
    {
      keymat  = { key : priv_key[ 0 ] , keymaterial : priv_key[ 0 ].privateKeyPacket } ;
      sesskey = msg[ 0 ].sessionKeys[ i ] ;
      break ; // Found a match, exit loop.
    }

    // If not found with the main key, check subkeys.
    for ( var j = 0 ; j < priv_key[ 0 ].subKeys.length ; j ++ )
    {
      if ( priv_key[ 0 ].subKeys[ j ].publicKey.getKeyId ( ) === msg[ 0 ].sessionKeys[ i ].keyId.bytes )
      {
        // Decrypt subkey if necessary.
        if ( ! priv_key[ 0 ].subKeys[ j ].decryptSecretMPIs ( passphrase ) )
        {
          alert ( "Wrong pass" ) ;
          return false ;
        }
        keymat  = { key : priv_key[ 0 ] , keymaterial : priv_key[ 0 ].subKeys[ j ] } ;
        sesskey = msg[ 0 ].sessionKeys[ i ] ;
        break ; // Found a match, exit inner loop.
      }
    }
  }

  try
  {
    // Perform the actual decryption.
    decrypted = msg[ 0 ].decrypt ( keymat , sesskey ) ;
    return decrypted ;
  }
  catch ( e )
  {
    // Handle decryption errors.
    return false ;
  }
} // End of decrypt function

/**
 * Verifies the signature of a clear-text message.
 *
 * @param {Array} msg     The message array (parsed by OpenPGP.js) containing signature data.
 * @param {Array} pubkeys An array of public keys to verify the signature against.
 * @returns {Boolean} True if the signature is valid, false otherwise.
 */
function verify ( msg , pubkeys )
{
  // Delegates verification to the OpenPGP.js message object.
  return msg[ 0 ].verifySignature ( pubkeys ) ;
} // End of verify function

/**
 * Parses an armored OpenPGP message string.
 *
 * @param {String} msg The armored message string.
 * @returns {Array} An array of parsed message objects.
 */
function parseMsg ( msg )
{
	return openpgp.read_message ( msg ) ;
} // End of parseMsg

/**
 * Checks if there is at least one private key in the keyring.
 *
 * @returns {Boolean} True if private keys exist, false otherwise.
 */
function hasPrivateKey ( )
{
	return openpgp.keyring.hasPrivateKey ( ) ;
} // End of hasPrivateKey

/**
 * Retrieves the count of private keys stored in the keyring.
 *
 * @returns {Integer} The number of private keys.
 */
function getPrivkeyCount ( )
{
	return openpgp.keyring.privateKeys.length ;
} // End of getPrivkeyCount

/**
 * Retrieves the count of public keys stored in the keyring.
 *
 * @returns {Integer} The number of public keys.
 */
function getPubkeyCount ( )
{
	return openpgp.keyring.publicKeys.length ;
} // End of getPubkeyCount

/**
 * Gets the fingerprint of a key from the keyring.
 *
 * @param {Integer} i          The index of the key in the keyring.
 * @param {Boolean} private    True for private key, false for public key.
 * @param {Boolean} niceformat If true, formats the fingerprint with spaces.
 * @returns {String} The key fingerprint.
 */
function getFingerprint ( i , private , niceformat )
{
	// Default 'private' to false if not provided.
	if ( typeof ( private ) == "undefined" )
	{
		private = false ;
	}

	// Default 'niceformat' to true if not provided.
	if ( typeof ( niceformat ) == "undefined" )
	{
		niceformat = true ;
	}

	var fingerprint ; // Declare fingerprint variable.

	if ( private == false )
	{
		// Get fingerprint for public key.
		fingerprint = util.hexstrdump ( openpgp.keyring.publicKeys[ i ].obj.getFingerprint ( ) ).toUpperCase ( ) ;
	}
	else
	{
		// Get fingerprint for private key.
		fingerprint = util.hexstrdump ( openpgp.keyring.privateKeys[ i ].obj.getFingerprint ( ) ).toUpperCase ( ) ;
	}

	if ( niceformat )
	{
		// Add spaces every two characters for readability.
		fingerprint = fingerprint.replace ( /(.{2})/g , "$1 " ) ;
	}
	else
	{
		// Prepend with "0x" and truncate to first 8 characters (after "0x").
		fingerprint = "0x" + fingerprint.substring ( 0 , 8 ) ;
	}

	return fingerprint ;
} // End of getFingerprint

/**
 * Gets the Key ID of a key from the keyring.
 *
 * @param {Integer} i       The index of the key in the keyring.
 * @param {Boolean} private True for private key, false for public key.
 * @returns {String} The key ID.
 */
function getKeyID ( i , private )
{
	// Default 'private' to false if not provided.
	if ( typeof ( private ) == "undefined" )
	{
		private = false ;
	}

	var key_id ; // Declare key_id variable.

	if ( private == false )
	{
		// Get Key ID for public key.
		key_id = "0x" + util.hexstrdump ( openpgp.keyring.publicKeys[ i ].obj.getKeyId ( ) ).toUpperCase ( ).substring ( 8 ) ;
	}
	else
	{
		// Get Key ID for private key.
		key_id = "0x" + util.hexstrdump ( openpgp.keyring.privateKeys[ i ].obj.getKeyId ( ) ).toUpperCase ( ).substring ( 8 ) ;
	}

	return key_id ;
} // End of getKeyID

/**
 * Gets the user ID (person identifier) associated with a key.
 *
 * @param {Integer} i       The index of the key in the keyring.
 * @param {Integer} j       The index of the user ID for that key (a key can have multiple).
 * @param {Boolean} private True for private key, false for public key.
 * @returns {String} The user ID string.
 */
function getPerson ( i , j , private )
{
	// Default 'private' to false if not provided.
	if ( typeof ( private ) == "undefined" )
	{
		private = false ;
	}

	var person ; // Declare person variable.

	if ( private == false )
	{
		// Get user ID for public key.
		person = openpgp.keyring.publicKeys[ i ].obj.userIds[ j ].text ;
	}
	else
	{
		// Get user ID for private key.
		person = openpgp.keyring.privateKeys[ i ].obj.userIds[ j ].text ;
	}

	return person ;
} // End of getPerson

/**
 * Retrieves a public key from the keyring based on an email address.
 *
 * @param {String} address The email address to search for.
 * @returns {Object} The public key object, or null if not found.
 */
function getPubkeyForAddress ( address )
{
	var pubkey = openpgp.keyring.getPublicKeyForAddress ( address ) ;
	return pubkey ;
} // End of getPubkeyForAddress

/**
 * Gets the formatted fingerprint for a sender's public key.
 *
 * @param {String} sender The sender's email address.
 * @returns {String} The formatted fingerprint string.
 */
function getFingerprintForSender ( sender )
{
	var pubkey      = getPubkeyForAddress ( sender ) ;
	// Extract, format, and return the fingerprint.
	var fingerprint = util.hexstrdump ( pubkey[ 0 ].obj.getFingerprint ( ) ).toUpperCase ( ).substring ( 8 ).replace ( /(.{2})/g , "$1 " ) ;
	return fingerprint ;
} // End of getFingerprintForSender

/**
 * Retrieves the armored private key for a given key index.
 *
 * @param {Integer} id The index of the private key in the keyring.
 * @returns {String} The armored private key string.
 */
function getPrivkeyArmored ( id )
{
	var keyid           = openpgp.keyring.privateKeys[ id ].obj.getKeyId ( ) ;
	var privkey_armored = openpgp.keyring.getPrivateKeyForKeyId ( keyid )[ 0 ].key.armored ;
	return privkey_armored ;
} // End of getPrivkeyArmored

/**
 * Retrieves the OpenPGP.js private key object for a given key index.
 *
 * @param {Integer} id The index of the private key in the keyring.
 * @returns {Object} The OpenPGP.js private key object.
 */
function getPrivkeyObj ( id )
{
	var privkey_armored = getPrivkeyArmored ( id ) ;
	// Note: 'privkey' is implicitly global if not declared with 'var' or 'let'.
    return privkey = openpgp.read_privateKey ( privkey_armored ) ;
} // End of getPrivkeyObj

/**
 * Converts an armored private key string into an OpenPGP.js private key object.
 *
 * @param {String} armored The armored private key string.
 * @returns {Object} The OpenPGP.js private key object.
 */
function getPrivkey ( armored )
{
	var privkey = openpgp.read_privateKey ( armored ) ;
	return privkey ;
} // End of getPrivkey

/**
 * Attempts to decrypt the secret MPIs of a private key in the keyring.
 *
 * @param {Integer} i The index of the private key in the keyring.
 * @param {String}  p The passphrase to use for decryption.
 * @returns {Boolean} True if decryption is successful, false otherwise.
 */
function decryptSecretMPIs ( i , p )
{
	return openpgp.keyring.privateKeys[ i ].obj.decryptSecretMPIs ( p ) ;
} // End of decryptSecretMPIs

/**
 * Decrypts the secret MPIs for a private key identified by its index and passphrase.
 *
 * @param {Integer} id         The index of the private key in the keyring.
 * @param {String}  passphrase The passphrase for the private key.
 * @returns {Boolean} True if decryption succeeds, false otherwise.
 */
function decryptSecretMPIsForId ( id , passphrase )
{
	var keyid           = openpgp.keyring.privateKeys[ id ].obj.getKeyId ( ) ;
	var privkey_armored = openpgp.keyring.getPrivateKeyForKeyId ( keyid )[ 0 ].key.armored ;
	var privkey         = getPrivkey ( privkey_armored ) ;
	return privkey[ 0 ].decryptSecretMPIs ( passphrase ) ;
} // End of decryptSecretMPIsForId

/**
 * Imports an armored public key into the keyring.
 *
 * @param {String} key The armored public key string.
 * @returns {Boolean} True if import is successful, false otherwise.
 */
function importPubkey ( key )
{
	try
	{
		openpgp.keyring.importPublicKey ( key ) ;
		openpgp.keyring.store ( ) ; // Persist the keyring changes.
	}
	catch ( e )
	{
		console.log ( e ) ; // Log the error for debugging.
		return false ;
	}
	return true ;
} // End of importPubkey

/**
 * Imports an armored private key into the keyring.
 *
 * @param {String} key        The armored private key string.
 * @param {String} passphrase The passphrase for the private key.
 * @returns {Boolean} True if import is successful, false otherwise.
 */
function importPrivkey ( key , passphrase )
{
	try
	{
		openpgp.keyring.importPrivateKey ( key , passphrase ) ;
		openpgp.keyring.store ( ) ; // Persist the keyring changes.
	}
	catch ( e )
	{
		// Catch and handle import errors.
		return false ;
	}

	return true ;
} // End of importPrivkey

/**
 * Parses an armored private key string into an OpenPGP.js key object.
 *
 * @param {String} key The armored private key string.
 * @returns {Object|Boolean} The parsed private key object, or false on error.
 */
function parsePrivkey ( key )
{
	try
	{
		return openpgp.read_privateKey ( key )[ 0 ] ;
	}
	catch ( e )
	{
		// Handle parsing errors.
		return false ;
	}
} // End of parsePrivkey

/**
 * Removes a key from the keyring.
 *
 * @param {Integer} i       The index of the key to remove.
 * @param {Boolean} private True to remove a private key, false for a public key.
 * @returns {Boolean} True if removal is successful, false otherwise.
 */
function removeKey ( i , private )
{
	// Default 'private' to false if not provided.
	if ( typeof ( private ) == "undefined" )
	{
		private = false ;
	}

	if ( private )
	{
		// Remove private key.
		return openpgp.keyring.removePrivateKey ( i ) ;
	}

	// Remove public key.
	return openpgp.keyring.removePublicKey ( i ) ;
} // End of removeKey

/**
 * Verifies the basic signatures of a public key in the keyring.
 *
 * @param {Integer} i The index of the public key in the keyring.
 * @returns {Boolean} True if basic signatures are valid, false otherwise.
 */
function verifyBasicSignatures ( i )
{
	return ( openpgp.keyring.publicKeys[ i ].obj.verifyBasicSignatures ( ) ? true : false ) ;
} // End of verifyBasicSignatures

/**
 * Extracts the algorithm string from a key and returns its type.
 * This includes the key length and algorithm name.
 *
 * @param {Integer} i       Key index in keyring.
 * @param {Boolean} private True for private key, false for public key.
 * @returns {String} Algorithm type string (e.g., "2048/RSA").
 */
function getAlgorithmString ( i , private )
{
	// Default 'private' to false if not provided.
	if ( typeof ( private ) == "undefined" )
	{
		private = false ;
	}

	var key ; // Declare key variable.

	if ( private )
	{
		key = openpgp.keyring.privateKeys[ i ].obj ;
	}
	else
	{
		key = openpgp.keyring.publicKeys[ i ].obj ;
	}

	var result ; // Declare result variable.
	var sw     ; // Declare sw (switch) variable for algorithm type.

	if ( typeof ( key.publicKeyPacket ) !== "undefined" )
	{
		result = key.publicKeyPacket.MPIs[ 0 ].mpiByteLength * 8 + "/" ;
		sw     = key.publicKeyPacket.publicKeyAlgorithm ;
	}
	else
	{
		// Handle private key packets which store public key info differently.
		result = ( key.privateKeyPacket.publicKey.MPIs[ 0 ].mpiByteLength * 8 + "/" ) ;
		sw     = key.privateKeyPacket.publicKey.publicKeyAlgorithm ;
	}

	result += typeToStr ( sw ) ; // Convert algorithm type to string.
	return result ;
} // End of getAlgorithmString

/**
 * Exports an armored key (public or private) from the keyring.
 *
 * @param {Integer} i       The index of the key in the keyring.
 * @param {Boolean} private True to export a private key, false for a public key.
 * @returns {String} The armored key string.
 */
function exportArmored ( i , private )
{
	// Default 'private' to false if not provided.
	if ( typeof ( private ) == "undefined" )
	{
		private = false ;
	}

	if ( private )
	{
		return openpgp.keyring.privateKeys[ i ].armored ;
	}
	else
	{
		return openpgp.keyring.publicKeys[ i ].armored ;
	}
} // End of exportArmored

/**
 * Retrieves the user IDs associated with a key.
 *
 * @param {Integer} i       The index of the key in the keyring.
 * @param {Boolean} private True for a private key, false for a public key.
 * @returns {Array} An array of user ID objects.
 */
function getKeyUserids ( i , private )
{
	// Default 'private' to false if not provided.
	if ( typeof ( private ) == "undefined" )
	{
		private = false ;
	}

	if ( private )
	{
		return openpgp.keyring.privateKeys[ i ].obj.userIds ;
	}
	else
	{
		return openpgp.keyring.publicKeys[ i ].obj.userIds ;
	}
} // End of getKeyUserids