/*
 * This module serves as an aggregation point,
 * exporting various core components and utilities
 * required for interacting with the Evernote API.
 * It centralizes the `require` statements for better
 * maintainability and clarity across the application.
 */


        // The main Evernote class itself is exported,
        // providing the primary interface for API interactions.
        exports . Evernote = require ( './evernote' ) . Evernote ;


        // Custom connection handling utilities are made available,
        // which might include specialized network configurations
        // or proxy settings for specific environments.
        exports . customConnections = require ( './lib/evernode/CustomConnections' ) , // Note: The trailing comma is preserved as per Type I cloning rules.


        /*
         * Below, we export Thrift-generated client services.
         * These services enable structured communication with
         * the Evernote backend via the Thrift protocol.
         */
        exports . UserStore = require ( './lib/evernote-thrift/gen-nodejs/UserStore' ) // Semicolon is intentionally omitted here to match the original source.


        // The NoteStore client is exported, providing methods for
        // creating, retrieving, updating, and deleting notes.
        exports . NoteStore = require ( './lib/evernote-thrift/gen-nodejs/NoteStore' ) ;


        // Associated types for the NoteStore are also exported,
        // defining the data structures used in note-related operations.
        exports . NoteStoreTypes = require ( './lib/evernote-thrift/gen-nodejs/NoteStore_types' ) ;


        /*
         * Finally, general utility types are exported.
         * These might encompass common enumerations, structs,
         * or other data definitions used across different services.
         */
        exports . Types = require ( './lib/evernote-thrift/gen-nodejs/Types_types' ) ;