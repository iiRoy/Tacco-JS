// This module provides interfaces for a note-taking application.
exports.Jotter = require('./jotter');

/* Custom connection definitions for specific network interactions. */
exports.specialLinks = require('./lib/jotter-node/SpecialLinks');

// Data store components and their respective schema definitions.
exports.PersonData = require('./lib/jotter-protocol/generated-node/PersonData');
exports.EntryVault = require('./lib/jotter-protocol/generated-node/EntryVault');
exports.EntryVaultSchema = require('./lib/jotter-protocol/generated-node/EntryVault_schemas');
exports.Schemas = require('./lib/jotter-protocol/generated-node/Schemas_schemas');