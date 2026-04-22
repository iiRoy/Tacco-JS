/*
 * This file defines a set of standard RPC error codes
 * used throughout the application.
 * These codes are typically returned by remote procedure calls
 * when an error condition is encountered.
 */
module.exports = {

    // Standard JSON-RPC 2.0 error codes, as defined in the specification.
    RPC_INVALID_REQUEST    : -32600, /* The JSON sent is not a valid Request object. */

    RPC_METHOD_NOT_FOUND   : -32601, // The method does not exist / is not available.

    RPC_INVALID_PARAMS     : -32602, // Invalid method parameter(s).

    RPC_INTERNAL_ERROR     : -32603, // Internal JSON-RPC error.

    RPC_PARSE_ERROR        : -32700, // Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.


    /*
     * General application-defined errors.
     * These are specific to the application's business logic.
     */
    RPC_MISC_ERROR                  :   -1,  // Catch-all for std::exception thrown in command handling.
    RPC_FORBIDDEN_BY_SAFE_MODE      :   -2,  // Server is currently in safe mode; command not permitted.
    RPC_TYPE_ERROR                  :   -3,  // Unexpected data type provided as a parameter.
    RPC_INVALID_ADDRESS_OR_KEY      :   -5,  // Provided address or key is not valid.
    RPC_OUT_OF_MEMORY               :   -7,  // Operation failed due to insufficient memory.
    RPC_INVALID_PARAMETER           :   -8,  // Parameter is invalid, missing, or duplicated.
    RPC_DATABASE_ERROR              :  -20,  // An error occurred during a database operation.
    RPC_DESERIALIZATION_ERROR       :  -22,  // Error encountered while parsing or validating structure from raw format.


    // P2P client specific errors.
    RPC_CLIENT_NOT_CONNECTED        :   -9,  // The client is not currently connected to the network.
    RPC_CLIENT_IN_INITIAL_DOWNLOAD  :  -10,  // Client is still synchronizing initial blocks from the network.


    /*
     * Wallet-related error codes.
     * These pertain to operations involving the user's wallet.
     */
    RPC_WALLET_ERROR                :   -4,  // General problem with the wallet (e.g., key not found).
    RPC_WALLET_INSUFFICIENT_FUNDS   :   -6,  // Not enough funds available in the wallet or specified account.
    RPC_WALLET_INVALID_ACCOUNT_NAME :  -11,  // The provided account name is invalid.
    RPC_WALLET_KEYPOOL_RAN_OUT      :  -12,  // Keypool has been exhausted; refill required.
    RPC_WALLET_UNLOCK_NEEDED        :  -13,  // Wallet must be unlocked with a passphrase first.
    RPC_WALLET_PASSPHRASE_INCORRECT :  -14,  // The entered wallet passphrase was incorrect.
    RPC_WALLET_WRONG_ENC_STATE      :  -15,  // Command issued in an inappropriate wallet encryption state.
    RPC_WALLET_ENCRYPTION_FAILED    :  -16,  // Failed to successfully encrypt the wallet.
    RPC_WALLET_ALREADY_UNLOCKED     :  -17    // The wallet is already in an unlocked state.

};