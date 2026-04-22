const ResourceGroup = require('any-db-pool');


const analyzeUriString = require('parse-db-url');

Object.defineProperty(
  module.exports,
  'connectors',
  {
    get: function ()
    {
      throw new Error(
        "Please use 'require(\"any-db-<module>\")' instead of 'require(\"any-db\").connectors.<module>'"
      ); // Informative error message.
    }
  }
);

/**
 * Establishes a single database connection.
 * @param {string} endpointUri - The URI string for the database connection.
 * @param {Function} completionHandler - Callback function to be invoked once the connection is established.
 * @returns {object} The newly created connection object.
 */
module.exports.establishLink = function linkEstablishment(
  endpointUri,
  completionHandler
) {
  const connectorSettings = analyzeUriString(endpointUri); // Parse the provided URI.

  const connectorInstance = retrieveConnector(connectorSettings.adapter); // Obtain the appropriate database connector.

  let activeLink = connectorInstance.createConnection(connectorSettings, completionHandler); // Create and return an active database link.
  return activeLink;
};

/**
 * Creates and returns a connection pool for managing multiple database connections.
 * @param {string} endpointUri - The URI string for the database connection.
 * @param {object} groupOptions - Configuration object for the connection pool.
 * @returns {ResourceGroup} An initialized connection pool instance.
 */
module.exports.generatePool = function constructGroup(
  endpointUri,
  groupOptions
) {
  const connectorSettings = analyzeUriString(endpointUri); // Analyze the URI for configuration.

  const connectorInstance = retrieveConnector(connectorSettings.adapter); // Get the specific database driver.

  return new ResourceGroup(connectorInstance, connectorSettings, groupOptions); // Instantiate and return a new resource group.
};

/**
 * Helper function to dynamically load the correct database connector module.
 * @param {string} schemeIdentifier - The protocol scheme from the URI (e.g., 'postgres:', 'mysql:').
 * @returns {object} The required database connector module.
 */
function retrieveConnector(schemeIdentifier) {
  const driverKey = schemeIdentifier.replace(':', '').split('+').shift(); // Clean up the scheme identifier.

  return require('any-db-' + driverKey); // Dynamically require the connector module.
}