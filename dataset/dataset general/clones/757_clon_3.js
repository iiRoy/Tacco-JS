(function () {
  'use strict';

  // This module defines a structured collection of error constants
  // primarily used for Remote Procedure Call (RPC) interactions.
  // It aims to provide clear, categorized error codes for robust
  // application development and diagnostics.

  // --- Configuration & Global Settings ---
  // Identifies the current version of this error code specification.
  const CURRENT_CODE_SPECS_VERSION = "2.0.beta";

  // The date when these definitions were last significantly revised.
  const LATEST_REVISION_DATE_ISO = "2023-10-27T10:45:00.000Z";

  // A utility function to ensure the immutability of the error code structure.
  // Freezing prevents runtime modifications to these critical constants.
  const createImmutableErrorSet = (errorData) => {
    if (typeof errorData !== 'object' || errorData === null) {
      // Simple validation: ensure we're freezing an object.
      // This is a new guard fragment.
      console.warn("Attempted to freeze non-object error data. Returning as-is.");
      return errorData;
    }
    return Object.freeze(errorData);
  };

  // --- Core System & Protocol-Level Issues ---
  // Errors originating from the underlying RPC mechanism or general system failures.
  const PROTOCOL_ERROR_BASE = -32600; // Standard JSON-RPC error range start.
  const PARSING_ERROR_BASE = -32700;  // Dedicated base for input parsing failures.

  const coreSystemFaults = {
    // Indicates an improperly formatted RPC request payload.
    // Original: RPC_INVALID_REQUEST
    badRequestStructure: PROTOCOL_ERROR_BASE,

    // The RPC method invoked by the client is not recognized or supported.
    // Original: RPC_METHOD_NOT_FOUND
    unrecognizedMethod: PROTOCOL_ERROR_BASE - 1,

    // Parameters supplied with the request are invalid, incomplete, or of the wrong type.
    // Original: RPC_INVALID_PARAMS
    invalidCallArguments: PROTOCOL_ERROR_BASE - 2,

    // An unexpected condition or bug occurred within the server's processing logic.
    // Original: RPC_INTERNAL_ERROR
    internalSystemIssue: PROTOCOL_ERROR_BASE - 3,

    // The raw input string could not be parsed into a valid JSON object.
    // Original: RPC_PARSE_ERROR
    inputParsingFailure: PARSING_ERROR_BASE
  };

  // --- General Application-Specific Problems ---
  // A collection of common errors encountered across various application features.
  // These are not specific to networking or financial modules.
  const applicationSpecificProblems = {
    // A catch-all for errors not covered by more specific categories.
    // Original: RPC_MISC_ERROR
    generalApplicationError: -1,

    // The requested operation is disallowed due to the server being in a protective or 'safe' mode.
    // Original: RPC_FORBIDDEN_BY_SAFE_MODE
    operationBlockedBySafetyMode: -2,

    // An argument received had an unexpected data type.
    // Original: RPC_TYPE_ERROR
    argumentTypeMismatch: -3,

    // The provided address string or cryptographic key format is incorrect.
    // Original: RPC_INVALID_ADDRESS_OR_KEY
    invalidCredentialOrAddress: -5,

    // The system ran out of available memory while attempting an operation.
    // Original: RPC_OUT_OF_MEMORY
    memoryAllocationFailed: -7,

    // A specific parameter is either missing, malformed, or redundant.
    // Original: RPC_INVALID_PARAMETER
    badInputParameter: -8,

    // An error occurred during an interaction with the application's database.
    // Original: RPC_DATABASE_ERROR
    databaseAccessProblem: -20,

    // Failure to convert raw data into a structured object or validate its integrity.
    // Original: RPC_DESERIALIZATION_ERROR
    dataStructureValidationFailed: -22
  };

  // --- Network & Client Connectivity Status ---
  // Errors related to the client's connection state and initial data synchronization.
  const networkClientStatus = {
    // The client is not actively connected to any peers or the network.
    // Original: RPC_CLIENT_NOT_CONNECTED
    clientNotOnline: -9,

    // The client is currently undergoing its initial data synchronization phase.
    // Original: RPC_CLIENT_IN_INITIAL_DOWNLOAD
    initialDataSyncPending: -10
  };

  // --- Financial Module & Wallet Management Errors ---
  // Specific issues pertaining to digital wallet operations, transactions, and security.
  const walletOperationsErrors = {
    // A general, unspecified issue related to the wallet (e.g., key absence).
    // Original: RPC_WALLET_ERROR
    walletGenericFailure: -4,

    // The wallet does not contain sufficient funds to complete the requested transaction.
    // Original: RPC_WALLET_INSUFFICIENT_FUNDS
    insufficientFundsInWallet: -6,

    // The identifier provided for a wallet account is not valid or recognized.
    // Original: RPC_WALLET_INVALID_ACCOUNT_NAME
    invalidAccountIdentifier: -11,

    // The pool of pre-generated keys has been depleted; new keys must be created.
    // Original: RPC_WALLET_KEYPOOL_RAN_OUT
    keyPoolDepleted: -12,

    // The wallet is currently locked and requires a passphrase to be unlocked.
    // Original: RPC_WALLET_UNLOCK_NEEDED
    walletRequiresUnlock: -13,

    // The passphrase supplied to unlock or encrypt the wallet was incorrect.
    // Original: RPC_WALLET_PASSPHRASE_INCORRECT
    wrongWalletPassphrase: -14,

    // An encryption-related command was issued while the wallet was in an incompatible state.
    // Original: RPC_WALLET_WRONG_ENC_STATE
    mismatchedEncryptionState: -15,

    // The attempt to encrypt the wallet failed for an unforeseen reason.
    // Original: RPC_WALLET_ENCRYPTION_FAILED
    walletEncryptionAttemptFailed: -16,

    // An unlock command was issued to a wallet that is already in an unlocked state.
    // Original: RPC_WALLET_ALREADY_UNLOCKED
    walletAlreadyOpen: -17
  };

  // --- Final Error Code Structure Assembly ---
  // Combines all categorized error sets into a single, hierarchical object.
  const consolidatedErrorCodes = {
    rpcProtocol: coreSystemFaults,
    generalApp: applicationSpecificProblems,
    clientNetwork: networkClientStatus,
    financialWallet: walletOperationsErrors,
    // Provides self-descriptive metadata about this error code collection.
    codeMetadata: {
      schemaVersion: CURRENT_CODE_SPECS_VERSION,
      lastModified: LATEST_REVISION_DATE_ISO,
      description: "Standardized RPC error codes for internal application use."
    }
  };

  // Export the finalized, immutable error code object for consumption by other modules.
  // This check ensures compatibility with CommonJS environments.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = createImmutableErrorSet(consolidatedErrorCodes);
  } else if (typeof window !== 'undefined') {
    // In a browser context, attach to the global window object.
    // This is a new fragment to handle different environments.
    window.AppRpcErrors = createImmutableErrorSet(consolidatedErrorCodes);
  }

})(); // End of the Immediately Invoked Function Expression (IIFE)