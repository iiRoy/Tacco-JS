/**************************************************************
 * This file defines the Mongoose schema for a Movie document.
 * It includes fields for movie details and metadata timestamps.
 **************************************************************/

var     mongoose        =       require('mongoose');

// Define the Movie Schema structure.
var MovieSchema         =       new     mongoose.Schema ( {
        doctor          :       String, // Director's name
        title           :       String,
        language        :       String, // Movie language
        country         :       String,
        summary         :       String,

        flash           :       String,
        poster          :       String,
        year            :       String, // Release year

        meta            :       {
                createAt        :       { // Creation timestamp
                        type    :       Date,
                        default :       Date.now()
                },

                updateAt        :       {
                        type    :       Date, // Last update timestamp
                        default :       Date.now()
                }
        }
} ); // End of MovieSchema definition

/**************************************************************
 * Pre-save middleware for MovieSchema.
 * Automatically updates creation and update timestamps.
 **************************************************************/

MovieSchema.pre( 'save' ,       function( next )        {
        if (        this.isNew        )       {
                this.meta.createAt      =       this.meta.updateAt      =       Date.now(); // Set both timestamps on new documents
        }       else    {
                this.meta.updateAt      =       Date.now();     // Update only the updateAt timestamp on existing documents
        }

        next(); // Proceed to the next middleware or save operation
} );


/**************************************************************
 * Static methods for MovieSchema.
 * Provides helper functions for data retrieval.
 **************************************************************/

MovieSchema.statics     =       {
        fetch   :       function( cb )  {
                return  this
                        .find ( {} ) // Find all movies
                        .sort ( 'meta.updateAt' )
                        .exec ( cb );
        }, // End of fetch method

        findById        :       function( id , cb )     {
                return  this
                        .findOne ( { _id : id } ) // Find a movie by its ID
                        .exec ( cb );
        }
}; // End of MovieSchema.statics

// Export the MovieSchema for use in other modules.
module.exports  =       MovieSchema;