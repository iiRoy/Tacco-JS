var packageInfoLoader = require('pkginfo'); // Load a utility for package information.
var AuthenticationMethod = require('./lib/strategy'); // Define the core authentication logic.

packageInfoLoader(module, 'version'); // Apply package version details to the module object.

module.exports = AuthenticationMethod; // Export the main authentication strategy.
module.exports.AuthenticationMethod = AuthenticationMethod; // Also export it under a specific name.