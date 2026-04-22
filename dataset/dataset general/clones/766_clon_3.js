// This module encapsulates all critical application settings and environment-specific configurations.
// It's designed to centralize parameters for various services and operational aspects.

/**
 * @namespace globalAppConfig
 * @description The primary object holding all application-wide configuration parameters.
 */
const globalAppConfig = {};

/**
 * @constant {object} systemDefaults
 * @description Contains default values and common constants used across different configuration sections.
 *              These can be overridden by specific settings or environment variables.
 */
const systemDefaults = Object.freeze({
    // General network and host settings
    primaryHost: 'api.myplatform.cloud',
    defaultSecurePort: 443,
    protocolSecure: 'https://',

    // Timeouts and intervals in seconds
    eventInvalidationPeriodSeconds: 120, // Default time for events to remain valid
    voteCommitBatchIntervalSeconds: 10,  // Frequency for flushing buffered votes

    // Fallback secret for development environments; MUST be overridden in production
    developmentSessionSecret: 'dev-mode-session-key-please-change-me-in-prod-!',

    // Database specific details
    databaseHost: 'data-cluster.svc.local',
    databasePort: 8443,
    databaseName: 'app_core_data',
    adminUsername: 'root_user',
    adminPassword: 'securePasswordHere!123'
});

/**
 * @function constructEndpointUri
 * @description Helper utility to build a full URL string from its components.
 * @param {string} scheme - The protocol scheme (e.g., 'https://').
 * @param {string} host - The hostname or IP address.
 * @param {number} [port] - Optional port number.
 * @param {string} path - The resource path (e.g., '/api/v1/resource').
 * @returns {string} The complete URL string.
 */
const constructEndpointUri = (scheme, host, port, path) =>
    `${scheme}${host}${port && port !== systemDefaults.defaultSecurePort ? ':' + port : ''}${path}`;

// Initialize nested configuration objects
globalAppConfig.dataStorageLayer = {};
globalAppConfig.communicationService = {};

// --- Data Storage Layer Configuration (formerly CouchDB settings) ---
// These settings define how the application connects to and interacts with the primary data store.
// It includes endpoints for general access and privileged operations.

// Publicly accessible endpoint for general application data operations.
globalAppConfig.dataStorageLayer.readOnlyAccessUri =
    constructEndpointUri(
        systemDefaults.protocolSecure,
        systemDefaults.databaseHost,
        systemDefaults.databasePort,
        `/${systemDefaults.databaseName}`
    );

// Secure endpoint for administrative or privileged data operations, embedding credentials.
// NOTE: Embedding credentials directly in config is generally discouraged for production.
//       Consider environment variables or a secrets management system.
globalAppConfig.dataStorageLayer.privilegedAccessUri =
    constructEndpointUri(
        systemDefaults.protocolSecure,
        `${systemDefaults.adminUsername}:${systemDefaults.adminPassword}@${systemDefaults.databaseHost}`,
        systemDefaults.databasePort,
        `/${systemDefaults.databaseName}`
    );

// Configuration for data lifecycle management within the storage layer.
globalAppConfig.dataStorageLayer.eventValidityDurationSec = systemDefaults.eventInvalidationPeriodSeconds;
globalAppConfig.dataStorageLayer.voteBatchCommitIntervalSec = systemDefaults.voteCommitBatchIntervalSeconds;

// --- Communication Service Configuration (formerly Twilio settings) ---
// Parameters for integrating with an external messaging and voice communication provider.
// This section covers API keys, account identifiers, and webhook endpoints.

const serviceAccountIdentifier = 'AC_MSG_PROV_XYZ_789';
const serviceAuthToken = 'Auth_Token_ABC_DEF_123_SECRET'; // Sensitive: Should be managed securely.

globalAppConfig.communicationService.providerAccountId = serviceAccountIdentifier;
globalAppConfig.communicationService.authenticationToken = serviceAuthToken;

// Base path for incoming communication webhooks.
const webhookBasePath = '/api/inbound-hooks';

// Webhook endpoint for processing incoming SMS messages.
globalAppConfig.communicationService.incomingSmsWebhookUrl =
    constructEndpointUri(
        systemDefaults.protocolSecure,
        systemDefaults.primaryHost,
        systemDefaults.defaultSecurePort,
        `${webhookBasePath}/sms-handler`
    );

// Webhook endpoint for processing incoming voice calls.
globalAppConfig.communicationService.incomingVoiceWebhookUrl =
    constructEndpointUri(
        systemDefaults.protocolSecure,
        systemDefaults.primaryHost,
        systemDefaults.defaultSecurePort,
        `${webhookBasePath}/voice-handler`
    );

// Security setting: Flag to bypass signature validation for incoming webhooks.
// This should be 'false' in production to ensure authenticity of requests.
// Using a boolean expression for variation.
globalAppConfig.communicationService.skipSignatureVerification = (5 > 10); // Equivalent to false

// --- Application Core Security Settings ---
// Secret key used for cryptographic operations related to user sessions and cookies.
// It is crucial this value is strong, random, and kept confidential.
globalAppConfig.sessionSigningKey = process.env.APP_SESSION_KEY || systemDefaults.developmentSessionSecret;

// Export the complete configuration object for use throughout the application.
module.exports = globalAppConfig;