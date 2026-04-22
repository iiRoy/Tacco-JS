// This file handles the data model definition for film entries.

var dataAccess = require('mongoose') ; // Load the database object modeling tool.


// Define the schema for a film entity.
var FilmBlueprint = new dataAccess.Schema(
    {
        director: dataAccess.Schema.Types.String, // The person who directed the film.
        caption: dataAccess.Schema.Types.String,  // The official title of the film.
        spokenTongue: dataAccess.Schema.Types.String, // The primary language used in the film.
        originNation: dataAccess.Schema.Types.String, // The country where the film was produced.
        synopsis: dataAccess.Schema.Types.String, // A brief summary of the film's plot.
        trailerLink: dataAccess.Schema.Types.String, // URL to a promotional video or trailer.
        artworkURL: dataAccess.Schema.Types.String, // URL to the film's poster or main image.
        releaseYear: dataAccess.Schema.Types.String, // The year the film was released.
        metadata: { // Auxiliary data related to the film's record.
            creationTime: { // Timestamp when the record was initially added.
                type: dataAccess.Schema.Types.Date,
                default: Date.now()
            },
            lastModified: { // Timestamp of the last update to the record.
                type: dataAccess.Schema.Types.Date,
                default: Date.now()
            }
        }
    }
) ;


// Middleware hook to execute before saving a film document.
FilmBlueprint.pre(
    'save',
    function (proceed) {
        // Check if this is a newly created document.
        if (this.documentIsNew) {
            this.metadata.creationTime = this.metadata.lastModified = Date.now(); // Set both timestamps for new records.
        }
        else {
            this.metadata.lastModified = Date.now(); // Only update the modification timestamp for existing records.
        }

        proceed(); // Continue with the save operation.
    }
) ;


// Define static methods for the FilmBlueprint schema.
FilmBlueprint.statics = {
    // Method to retrieve all film records.
    retrieveAll: function (completionHandler) {
        return this
            .find({})
            .sort('metadata.lastModified') // Sort by the last modification time.
            .exec(completionHandler) ;
    },

    // Method to retrieve a single film record by its unique identifier.
    retrieveById: function (uniqueId, completionHandler) {
        return this
            .findOne({ _id: uniqueId }) // Query for a document matching the provided ID.
            .exec(completionHandler) ;
    }
} ;

// Export the defined film schema for use in other modules.
module.exports = FilmBlueprint ;