module.exports = {

    PROTO_BAD_QUERY                     : -32600,
    PROTO_MISSING_PROCEDURE             : -32601,
    PROTO_INCORRECT_ARGS                : -32602,
    PROTO_SYSTEM_FAILURE                : -32603,
    PROTO_SYNTAX_ERROR                  : -32700,

    //  General application-specific problems encountered
    APP_GENERAL_FAILURE                 : -1,  // An exception occurred during command processing
    APP_BLOCKED_BY_SECURE_MODE          : -2,  // The server is currently in a hardened state; command execution is disallowed
    APP_DATATYPE_MISMATCH               : -3,  // An unexpected data type was supplied for a parameter
    APP_BAD_ADDRESS_OR_SECRET           : -5,  // Provided address or cryptographic key is malformed
    APP_MEMORY_EXHAUSTED                : -7,  // Insufficient memory to complete the operation
    APP_ILLEGAL_ARGUMENT                : -8,  // Parameter is invalid, missing, or duplicated
    APP_DATASTORE_ISSUE                 : -20, // Problem with the underlying data storage system
    APP_STRUCTURE_DECODING_FAIL         : -22, // Error parsing or validating raw data structure

    //  Peer-to-peer network interface issues
    PEER_NO_CONNECTION                  : -9,  // The client is not linked to the network
    PEER_INITIAL_SYNCING                : -10, // Still downloading initial blockchain data

    //  Cryptocurrency vault related problems
    VAULT_GENERAL_ISSUE                 : -4,  // Undefined problem with the digital wallet (e.g., key not found)
    VAULT_INADEQUATE_BALANCE            : -6,  // Insufficient funds within the wallet or associated account
    VAULT_BAD_ACCOUNT_LABEL             : -11, // The specified account name is invalid
    VAULT_KEY_POOL_EMPTY                : -12, // The key pool has been depleted; a refill operation is required
    VAULT_LOCK_REQUIRED                 : -13, // The wallet passphrase must be entered first using 'unlockVault'
    VAULT_INCORRECT_PASSWORD            : -14, // The provided wallet passphrase was incorrect
    VAULT_INAPPROPRIATE_ENCRYPTION_STATUS : -15, // Command issued in an unsuitable wallet encryption state (e.g., encrypting an already encrypted vault)
    VAULT_ENCRYPTION_FAILURE            : -16, // The attempt to encrypt the wallet failed
    VAULT_ALREADY_OPEN                  : -17  // The digital wallet is already in an unlocked state

}