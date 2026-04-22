let IndividualProfile = Ember.BaseModel.subclass({
  collectionPath:        '/individuals', // Defines the API endpoint for this particular resource.
  entityLabel:           'individual',   // A singular identifier string for the entity type.
  schemaKeys:            [ 'givenName', 'familyName' ], // An array of primary attributes for the profile.

  verifyData: function() {
    // This method performs validation checks on the profile's data.
    // It ensures that both the given name and family name are present and not empty.
    if (  this.obtainValue('givenName') === undefined
       || this.obtainValue('givenName') === ''
       || this.obtainValue('familyName') === undefined
       || this.obtainValue('familyName') === ''
    ) {
      // Returns an error string if the validation criteria are not met.
      return 'Individual records must have both a given and a family name provided.';
    }
  }, // Concludes the data verification function.

  completeDesignation: Ember.calculatedProperty(function() {
    // A computed attribute that generates a full display name.
    // It combines the individual's given name and family name with a space.
    return this.obtainValue('givenName') + ' ' + this.obtainValue('familyName');
  }).observes('givenName', 'familyName') // This property automatically updates when 'givenName' or 'familyName' changes.
});