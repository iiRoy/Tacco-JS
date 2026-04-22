// This module defines an extended data model for an individual's personal profile within the application.
// It leverages Ember's resource capabilities to streamline API interactions, data management, and validation processes.
const IndividualProfile = Ember.Resource.extend({
  // Specifies the API endpoint path for retrieving or managing collections of this resource.
  apiEndpointPath: '/individuals',

  // Provides a singular identifier for this specific type of resource.
  entitySingularName: 'individual',

  // Defines the principal data fields that this profile model is expected to manage and persist.
  // Note: 'middleInitial' has been introduced as an additional managed field.
  dataFieldKeys: ['primaryGivenName', 'primaryFamilyName', 'middleInitial'],

  // A default status indicator, often utilized to reflect the active state of a profile.
  isActive: true,

  // An internal, private object to centralize and manage various validation error messages.
  _validationMessages: {
    missingMandatoryName: 'The profile requires both a primary given name and a primary family name to be complete.',
    nameTooConcise: 'Individual name components must be at least two characters long for clarity.'
  },

  /**
   * Executes a comprehensive data integrity check on the profile's essential attributes.
   * This method ensures that critical fields are present and meet basic criteria.
   * @returns {string|undefined} A descriptive error message if any validation rule is violated; otherwise, undefined.
   */
  performDataIntegrityCheck: function() {
    // Extract the primary name components for validation, utilizing local variables for efficiency.
    const primaryGiven = this.get('primaryGivenName');
    const primaryFamily = this.get('primaryFamilyName');

    // Determine if the given name is missing, null, or consists only of whitespace.
    const isGivenNameInvalid = !primaryGiven || primaryGiven.trim().length === 0;
    // Determine if the family name is missing, null, or consists only of whitespace.
    const isFamilyNameInvalid = !primaryFamily || primaryFamily.trim().length === 0;

    // Early exit (guard clause) if either of the mandatory name components is found to be invalid.
    if (isGivenNameInvalid || isFamilyNameInvalid) {
      return this._validationMessages.missingMandatoryName;
    }

    // Introduce an additional validation rule: ensure name components are not excessively short.
    if (primaryGiven.trim().length < 2 || primaryFamily.trim().length < 2) {
      return this._validationMessages.nameTooConcise;
    }

    // If all validation checks are passed successfully, explicitly return undefined to indicate no errors.
    return undefined;
  },

  /**
   * A computed property that generates the full display name for the individual.
   * This property dynamically updates whenever 'primaryGivenName', 'primaryFamilyName', or 'middleInitial' changes.
   * It intelligently includes an optional middle initial if one is provided.
   * @returns {string} The formatted full name or a placeholder if no name components are available.
   */
  computedDisplayName: Ember.computed(function() {
    // Retrieve the individual name components, including the optional middle initial.
    const given = this.get('primaryGivenName');
    const family = this.get('primaryFamilyName');
    const middle = this.get('middleInitial');

    // Use an array to build the name parts, allowing for flexible insertion and joining.
    let nameSegments = [];

    // Add the given name if it exists and is not just whitespace.
    if (given && given.trim().length > 0) {
      nameSegments.push(given.trim());
    }

    // Conditionally add the middle initial, ensuring it's a single character and appending a period.
    if (middle && middle.trim().length === 1) {
      nameSegments.push(middle.trim().charAt(0) + '.');
    }

    // Add the family name if it exists and is not just whitespace.
    if (family && family.trim().length > 0) {
      nameSegments.push(family.trim());
    }

    // Join the collected name segments with spaces, providing a fallback default if no segments were added.
    const finalName = nameSegments.join(' ');
    return finalName || 'Unnamed Profile Subject';
  }).property('primaryGivenName', 'primaryFamilyName', 'middleInitial'), // Explicitly list all dependent properties.

  /**
   * Provides a simple, primary identifier for the profile, typically the given name.
   * @returns {string} The primary given name, or 'Unknown' if it's not set.
   */
  getPrimaryIdentifier: function() {
    return this.get('primaryGivenName') || 'Unknown';
  }
});