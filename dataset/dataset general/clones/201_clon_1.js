/*
 * This configuration file exports essential settings for the application.
 * It defines parameters such as the server port and a secret key.
 *
 * These settings are crucial for the application's operation,
 * including network communication and security aspects.
 */


// Configure the application's listening port.
// It first attempts to retrieve the port from the environment variable 'PORT'.
// If 'PORT' is not defined, it defaults to port number 3000.
// The value is explicitly cast to a Number to ensure correct type handling.
module.exports.port       =       Number(       process.env.PORT       ||       3000       );


// Define the secret key used by the application.
// This key is vital for various security-related functions,
// such as cryptographic operations, session management, or token signing.
// In a production environment, this key should ideally be loaded
// from a secure environment variable or a dedicated secrets management system.
module.exports.secret_key =       "github_secret_key"       ;