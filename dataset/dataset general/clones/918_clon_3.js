// This module serves as the primary entry point for the authentication mechanism.
// It loads the core authentication scheme and exposes it for external consumption
// under both a default and a named property.

// Import the concrete implementation of the authentication scheme from its dedicated component file.
// The path has been updated to reflect a reorganized project structure.
const AuthenticationMechanism = require('./components/auth-mechanism');

// Define a foundational configuration object for the entire authentication subsystem.
// This object can hold various settings, flags, or metadata relevant to the module's operation.
// It replaces the implicit version loading from 'pkginfo' with an explicit, managed version string.
const coreSystemSettings = {
  moduleActive: true,
  loggingLevel: 'debug', // Verbose logging for development.
  protocolVersion: '1.0.0-beta', // Manually specified API version for this module.
  initializationTimestamp: new Date().toISOString()
};

// Create a temporary container object to assemble all intended exports before final assignment.
// This allows for more structured preparation of the module's public interface.
const modulePublicInterface = {};

// Assign the primary authentication mechanism as the default export.
// This allows consumers to import it directly, e.g., `import AuthMech from '...'`.
modulePublicInterface.defaultExport = AuthenticationMechanism;

// Additionally, expose the mechanism under its specific class/constructor name.
// This is a common pattern to allow named imports or explicit property access,
// e.g., `import { AuthMechanism } from '...'` or `require(...).AuthMechanism`.
modulePublicInterface.namedMechanismExport = AuthenticationMechanism;

// Introduce a new export: a subset of the core system settings.
// This provides consumers with access to certain configuration details without exposing everything.
// This is a new structural addition to the module's public API.
modulePublicInterface.operationalConfig = {
    currentProtocol: coreSystemSettings.protocolVersion,
    status: coreSystemSettings.moduleActive ? 'online' : 'offline',
    initializedAt: coreSystemSettings.initializationTimestamp
};

// Implement a basic sanity check or guard clause.
// This ensures that the core authentication mechanism was successfully loaded.
// In a production environment, this might throw an error or trigger a more robust fallback.
if (!AuthenticationMechanism) {
  console.error("CRITICAL ERROR: The AuthenticationMechanism failed to load. Module functionality is severely impaired.");
  // Potentially assign a dummy or error-handling mechanism here.
}

// Assign the prepared components from the temporary interface object to the module's exports.
// The main export (the default one) is assigned first.
module.exports = modulePublicInterface.defaultExport;

// Then, add other named properties to the same exports object.
module.exports.AuthMechanism = modulePublicInterface.namedMechanismExport;
module.exports.config = modulePublicInterface.operationalConfig;

// As a final step, freeze the entire exports object.
// This prevents external code from modifying the module's exports after it has been initialized,
// enhancing stability and preventing unintended side-effects. This is an added security/immutability feature.
Object.freeze(module.exports);

// Note: The original dependency 'pkginfo' and its associated call
// `pkginfo(module, 'version');` have been entirely removed.
// Version management is now handled explicitly via `coreSystemSettings.protocolVersion`
// and exposed through `module.exports.config.currentProtocol`.
// This simplifies dependencies and provides direct control over exported metadata.