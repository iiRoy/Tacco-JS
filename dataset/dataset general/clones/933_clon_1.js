/*
 * This file contains core configuration settings for the application.
 * It exports various parameters required for database connectivity
 * and external API integrations.
 *
 * All values are placeholders and should be replaced with actual credentials
 * or environment-specific settings before deployment.
 */

// Define the main configuration object.
// This object holds parameters for connecting to the database.
exports.conf = {
    // The username credential for database access.
    // This string must match the authorized user for the database.
    user        :       '<username>'     ,

    // The password credential for database access.
    // Keep this sensitive information secure and out of version control if possible.
    password    :       '<password>'     ,

    // The name of the database to which the application will connect.
    database    :       '<db-name>'      // e.g., 'production_database' or 'development_db'
}; // End of database configuration block.


// Define the client ID for the Nike API integration.
// This ID is provided by Nike when registering the application.
exports.nikeClientID        =       '<Nike+ Client ID>'     ; // A unique identifier for our application with Nike's services.


// A boolean flag indicating whether the application is running in a staging environment.
// 'true' means it's a staging server; 'false' means it's production or local development.
exports.stagingServer       =       true    ; // Set to 'false' for production deployments.

/*
 * This concludes the configuration settings for the application.
 * Any additional global settings would be defined below.
 */