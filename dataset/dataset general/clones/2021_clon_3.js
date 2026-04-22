/* Structure for activity records in collective notes */

// Core dependency for database interaction
const dataAccessLayer = require('mongoose');

// Extract the Schema constructor for convenience and clarity
const DatabaseSchemaBuilder = dataAccessLayer.Schema;

// Define a helper for common schema types to improve readability and reduce verbosity
const SchemaTypeDefinitions = DatabaseSchemaBuilder.Types;

// Intermediate object to hold schema field definitions, constructed piecewise
const activityFieldDefinitions = {};

// Define the primary identifier for the activity, with detailed constraints
activityFieldDefinitions.activityTitle = {
    type: String,
    required: [true, 'The activity title is a mandatory attribute.'], // Custom error message
    trim: true, // Remove leading/trailing whitespace
    minlength: [3, 'Activity title must contain at least 3 characters.'],
    maxlength: [128, 'Activity title cannot exceed 128 characters in length.']
};

// Define the timestamp for when the record was initially created
activityFieldDefinitions.creationTimestamp = {
    type: Date,
    default: function() { return new Date(); }, // Use a function to ensure a new Date object for each document
    immutable: true, // This field, once set, should not be modifiable
    index: true // Add an index to this field for efficient date-based queries
};

// Define a detailed textual account of the activity
activityFieldDefinitions.detailedAccount = {
    type: String,
    minlength: [10, 'A detailed account requires a minimum of 10 characters.'],
    maxlength: [2048, 'The detailed account cannot exceed 2048 characters.'],
    default: 'No specific description has been provided for this activity.' // Provide a fallback default description
};

// Define the unique tag identifier, including custom validation logic
activityFieldDefinitions.tagIdentifier = {
    type: String,
    required: false, // This field is optional
    unique: false, // Not necessarily unique across all records
    trim: true,
    lowercase: true, // Store tags in a consistent lowercase format
    validate: {
        validator: function(v) {
            // Validation only applies if a value is actually provided
            return v === undefined || v === null || v.startsWith('#');
        },
        message: props => `The tag identifier '${props.value}' is invalid! It must commence with the '#' symbol.`
    }
};

// Add a new field to reference the entity that originated this activity
activityFieldDefinitions.originatorReference = {
    type: SchemaTypeDefinitions.ObjectId, // Using Mongoose's ObjectId type
    ref: 'UserEntity', // Specifies a reference to a 'UserEntity' model (assuming its existence)
    required: [true, 'An originator reference is indispensable for every activity record.']
};

// Add a status field to track the workflow state of the activity
activityFieldDefinitions.workflowState = {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'], // Enumerate the permissible states for this field
    default: 'pending', // Set an initial default state
    index: true // Index this field for efficient filtering by status
};

// Construct the full schema using the previously defined field definitions
const ActivityBlueprint = new DatabaseSchemaBuilder(activityFieldDefinitions, {
    // Enable automatic timestamp management with custom field names
    timestamps: { createdAt: 'recordCreationDate', updatedAt: 'lastModifiedDate' },
    // Explicitly define the collection name in the database
    collection: 'activity_records'
});

// Add a custom instance method to the schema for checking recency
ActivityBlueprint.methods.isRecent = function() {
    const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
    return this.recordCreationDate > twentyFourHoursAgo;
};

// Pre-save hook example: ensure tagIdentifier is null if empty string
ActivityBlueprint.pre('save', function(next) {
    if (this.tagIdentifier === '') {
        this.tagIdentifier = null;
    }
    next();
});

// Export the compiled model for external use by other modules
module.exports = dataAccessLayer.model('ActivityRecord', ActivityBlueprint);