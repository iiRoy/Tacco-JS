const dataAccessLayer = require('mongoose'); // Renamed 'mongoose' to 'dataAccessLayer'

// Helper for Mongoose ObjectId operations, enhancing readability and explicit type handling
const DocumentIdentifier = dataAccessLayer.Types.ObjectId;

// Defines the blueprint for a cinematic production record
// Renamed 'MovieSchema' to 'CinemaProductionBlueprint'
const CinemaProductionBlueprint = new dataAccessLayer.Schema({
    // Core attributes of the film
    productionTitle: { // Renamed 'title' to 'productionTitle'
        type: String,
        required: [true, 'A film title is mandatory.'], // Added required validation message
        trim: true, // Ensured leading/trailing whitespace is removed
        minlength: 2, // Added minimum length validation
        maxlength: 200 // Added maximum length validation
    },
    mainDirector: { // Renamed 'doctor' to 'mainDirector'
        type: String,
        trim: true,
        default: 'Unspecified Director' // Provided a default value
    },
    spokenLocale: { // Renamed 'language' to 'spokenLocale'
        type: String,
        trim: true,
        enum: { // Added an enum validator for specific languages
            values: ['English', 'Mandarin', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Other'],
            message: '{VALUE} is not a supported spoken locale.'
        },
        default: 'English'
    },
    originNation: { // Renamed 'country' to 'originNation'
        type: String,
        trim: true,
        default: 'International' // Provided a more generic default
    },
    plotOverview: { // Renamed 'summary' to 'plotOverview'
        type: String,
        trim: true,
        maxlength: 1500, // Increased max length for more detailed summaries
        default: 'No plot overview available.' // Added a default for empty summaries
    },
    // Removed 'flash' field entirely as a Type III deletion example
    displayPosterUrl: { // Renamed 'poster' to 'displayPosterUrl'
        type: String,
        trim: true,
        validate: { // Custom URL validation
            validator: function(val) {
                return val === '' || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(val);
            },
            message: props => `${props.value} is not a valid URL for the display poster!`
        },
        default: '' // Default to empty string instead of null
    },
    releaseCalendarYear: { // Renamed 'year' to 'releaseCalendarYear' and changed type
        type: Number, // Changed data type from String to Number
        min: [1888, 'Year must be 1888 or later.'], // Earliest known film
        max: [new Date().getFullYear() + 2, 'Year cannot be in the distant future.'], // Allows for upcoming films
        required: [true, 'Release year is required.']
    },
    // Management and auditing information for the record
    auditTrail: { // Renamed 'meta' to 'auditTrail'
        recordCreationDate: { // Renamed 'createAt' to 'recordCreationDate'
            type: Date,
            default: Date.now // Using Date.now directly for default as Mongoose handles it
        },
        lastModificationDate: { // Renamed 'updateAt' to 'lastModificationDate'
            type: Date,
            default: Date.now
        }
    }
}, {
    // Schema options
    collection: 'cinema_productions', // Explicitly set collection name
    timestamps: false, // Disabling Mongoose's automatic timestamps as we manage them manually
    versionKey: '__v_revision' // Renamed default __v version key
});

// Pre-save hook for managing audit trail timestamps
CinemaProductionBlueprint.pre('save', function(completionCallback) { // Renamed 'next' to 'completionCallback'
    const currentMoment = new Date(); // Introduced a helper variable for current time

    if (this.isNew) {
        // If it's a new entry, set both creation and modification dates
        this.auditTrail.recordCreationDate = currentMoment;
        this.auditTrail.lastModificationDate = currentMoment;
    } else {
        // If updating an existing entry, only refresh the modification date
        this.auditTrail.lastModificationDate = currentMoment;
    }

    // Example of a guard clause: check for a critical field before proceeding
    if (!this.productionTitle || this.productionTitle.length < 2) {
        return completionCallback(new Error('Production title is too short or missing.'));
    }

    completionCallback(); // Proceed to the next middleware or save operation
});

// Static methods attached to the schema for collection-level operations
CinemaProductionBlueprint.statics = {
    /**
     * Retrieves all cinematic production records.
     * @param {Function} responseHandler - The callback function to handle results.
     * @returns {dataAccessLayer.Query} A Mongoose Query object.
     */
    retrieveAllProductions: function(responseHandler) { // Renamed 'fetch' to 'retrieveAllProductions', 'cb' to 'responseHandler'
        const preferredSortOrder = { 'auditTrail.lastModificationDate': -1 }; // Defined a constant for sorting
        return this
            .find({})
            .sort(preferredSortOrder) // Sorted by last modification date in descending order
            .lean() // Added .lean() for faster query execution, returning plain JS objects
            .exec(responseHandler);
    },

    /**
     * Locates a single cinematic production record by its unique identifier.
     * @param {string} uniqueRecordId - The ID of the production record.
     * @param {Function} responseHandler - The callback function to handle results.
     * @returns {dataAccessLayer.Query} A Mongoose Query object.
     */
    findProductionById: function(uniqueRecordId, responseHandler) { // Renamed 'findById' to 'findProductionById', 'id' to 'uniqueRecordId'
        // Robust input validation for the ID
        if (!uniqueRecordId || typeof uniqueRecordId !== 'string' || !DocumentIdentifier.isValid(uniqueRecordId)) {
            return responseHandler(new Error('A valid string identifier is required for this operation.'));
        }

        // Constructing the query filter using the explicit DocumentIdentifier
        const queryFilterObject = { _id: new DocumentIdentifier(uniqueRecordId) };

        return this
            .findOne(queryFilterObject)
            .select('-__v_revision') // Exclude the custom version key from results
            .exec(responseHandler);
    }
};

// Export the defined schema to be compiled into a model elsewhere
module.exports = CinemaProductionBlueprint;