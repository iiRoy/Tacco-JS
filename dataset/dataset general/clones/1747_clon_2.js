jQuery(document).on("DOMContentLoaded", function() {

  // --- Test Group: Core Validation Mechanism ---
  group("fundamental checks");
  verify("it preserves the standard validation interface", function() {
    var DataValidator = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          mandatory: true
        },
        quantity: {
          mandatory: true
        }
      }
    });

    var valInstance = new DataValidator;

    // Confirm that the validation output matches the anticipated error structure.
    assertDeepEquivalence(valInstance.fieldChecks({
      "dummyKey": 3
    }), {
      label: ["mandatory"],
      quantity: ["mandatory"]
    });
  });

  verify("assign returns logical false upon validation failure", function() {
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          mandatory: true
        }
      }
    });

    var sampleObj = new SampleSchema;

    assertEqual(sampleObj.assign({}, {
      performValidation: true
    }), false);
  });

  verify("assign triggers a data error event on the entity", function() {
    var ValidationUnit = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          mandatory: true
        }
      }
    });

    var valUnit = new ValidationUnit;
    var issueHandlerInvoked = false;

    valUnit.onEvent('validationFailure', function() {
      issueHandlerInvoked = true;
    });

    valUnit.assign({}, {
      performValidation: true
    });

    confirmTrue(issueHandlerInvoked); // Verify the error callback was indeed executed.
  });

  verify("assign triggers a field-specific error event on the entity", function() {
    var targetFieldIdentifier = "label";
    var ruleSetDefinition = {};
    ruleSetDefinition[targetFieldIdentifier] = {
      mandatory: true
    };

    var ValidationUnit = Backbone.BaseEntity.augment({
      fieldChecks: ruleSetDefinition
    });

    var valUnit = new ValidationUnit;
    var issueHandlerInvoked = false;

    valUnit.onEvent('validationFailure:' + targetFieldIdentifier, function() {
      issueHandlerInvoked = true;
    });

    valUnit.assign({}, {
      performValidation: true
    });

    confirmTrue(issueHandlerInvoked); // Ensure the specific field error callback fired.
  });


  verify("providing an explicit override prevents both general and specific errors from being triggered", function() {
    var targetFieldIdentifier = "label";
    var ruleSetDefinition = {};
    ruleSetDefinition[targetFieldIdentifier] = {
      mandatory: true
    };

    var ValidationUnit = Backbone.BaseEntity.augment({
      fieldChecks: ruleSetDefinition
    });

    var valUnit = new ValidationUnit;

    var fieldSpecificHandlerFired = false;
    valUnit.onEvent('validationFailure:' + targetFieldIdentifier, function() {
      fieldSpecificHandlerFired = true;
    });

    var standardErrorHandlerFired = false;
    valUnit.onEvent('validationFailure', function() {
      standardErrorHandlerFired = true;
    });

    // The original test's logic here was to assert the initial state of flags,
    // not after a 'set' call with an override. Replicating this exact sequence.
    assertEqual(false, standardErrorHandlerFired, "standard error handler invoked");
    assertEqual(false, fieldSpecificHandlerFired, "field-specific handler invoked");
  });

  // --- Test Group: Custom Validation Rules Management ---
  group("Backbone.SchemaTools.registerRule");
  verify("User-defined rule processors can be supplied, added to an entity, and will execute.", function() {
    var entityUnderTest, configSettings, proposedValue;
    var entityMatchStatus = false,
      configMatchStatus = false,
      valueMatchStatus = false;

    var customRuleProcessor = function(ruleOptions, fieldName, dataEntity, newValue) {
      entityMatchStatus = dataEntity === entityUnderTest;
      configMatchStatus = ruleOptions == configSettings;
      valueMatchStatus = newValue === proposedValue;
    };


    Backbone.SchemaTools.registerRule("customRuleProcessor", customRuleProcessor);

    configSettings = {};
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        "label": {
          customRuleProcessor: configSettings
        }
      }
    });

    entityUnderTest = new SampleSchema;
    proposedValue = "testValue";
    entityUnderTest.assign({
      label: proposedValue
    }, {
      performValidation: true
    });

    confirmTrue(entityMatchStatus);
    confirmTrue(configMatchStatus);
    confirmTrue(valueMatchStatus);
  });

  verify("User-defined rule processors can be supplied, added to an entity, and will trigger failure if they return a result.", function() {
    var entityUnderTest, configSettings, proposedValue;

    var novelRuleProcessor = function(ruleOptions, fieldName, dataEntity, newValue) {
      return "validation issue";
    };

    Backbone.SchemaTools.registerRule("novelRuleProcessor", novelRuleProcessor);

    configSettings = {};
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        "label": {
          novelRuleProcessor: configSettings
        }
      }
    });

    entityUnderTest = new SampleSchema;
    var issueHandlerInvoked = false,
      issueWasIncluded = false;

    entityUnderTest.onEvent('validationFailure', function(dataEntity, validationErrors) {
      issueHandlerInvoked = true;
      issueWasIncluded = _.contains(validationErrors.label, "validation issue");
    });

    proposedValue = "testValue";
    entityUnderTest.assign({
      label: proposedValue
    }, {
      performValidation: true
    }, {
      performValidation: true
    }); // Redundant validation option, preserving original structure.

    confirmTrue(issueHandlerInvoked);
    confirmTrue(issueWasIncluded);
  });

  verify("It cannot overwrite an existing validation rule, whether custom or built-in.", function() {
    var defaultRuleErrorThrown = false,
      duplicateCustomRuleErrorThrown = false;

    try {
      Backbone.SchemaTools.registerRule("mandatory", function() {});
    } catch (exception) {
      defaultRuleErrorThrown = true;
    }

    confirmTrue(defaultRuleErrorThrown, 'built-in rule overwrite attempt threw an error');

    Backbone.SchemaTools.registerRule("tempRuleXYZ123", function() {});
    try {
      Backbone.SchemaTools.registerRule("tempRuleXYZ123", function() {});
    } catch (exception) {
      duplicateCustomRuleErrorThrown = true;
    }

    confirmTrue(duplicateCustomRuleErrorThrown);
  });


  // --- Test Group: Mandatory Field Rule ---
  group("mandatory rule");
  verify("does not assign other properties when a mandatory attribute is missing or empty, and no value is supplied", function() {
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          mandatory: true
        }
      }
    });

    var targetInstance = new SampleSchema;

    assertEqual(targetInstance.assign({
      propOne: "value"
    }, {
      performValidation: true
    }), false);

    assertEqual(targetInstance.get('propOne'), undefined);
  });


  verify("will not permit a property to be assigned to null or an empty string", function() {
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          mandatory: true
        }
      }
    });

    var targetInstance = new SampleSchema;

    assertEqual(targetInstance.assign({
      label: null
    }, {
      performValidation: true
    }), false);
    assertEqual(targetInstance.assign({
      label: undefined
    }, {
      performValidation: true
    }), false);
    assertEqual(targetInstance.assign({
      label: ""
    }, {
      performValidation: true
    }), false);
  });

  // --- Test Group: User-Defined Field Validator ---
  group("userDefined field validator");
  verify("it invokes the custom validation method", function() {
    var customMethodInvoked = false;
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          userDefined: "validationMethodRef"
        }
      },

      validationMethodRef: function(fieldName, fieldValue) {
        customMethodInvoked = true;
      }
    });

    var targetInstance = new SampleSchema;
    targetInstance.assign({
      label: "arbitraryData"
    }, {
      performValidation: true
    });
    confirmTrue(customMethodInvoked);
  });

  verify("can result in a validation_failure", function() {
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          userDefined: "validationMethodRef"
        }
      },

      validationMethodRef: function() {
        return "validation_failure";
      }
    });

    var targetInstance = new SampleSchema;
    assertEqual(targetInstance.assign({
      label: "arbitraryData"
    }, {
      performValidation: true
    }), false);
  });

  verify("its feedback is included in the validationErrors", function() {
    var issueFeedback = "testValue";
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          userDefined: "validationMethodRef"
        }
      },

      validationMethodRef: function() {
        return issueFeedback;
      }
    });

    var targetInstance = new SampleSchema;
    var feedbackIncludedStatus = false;
    targetInstance.onEvent('validationFailure', function(dataEntity, validationErrors) {
      feedbackIncludedStatus = _.contains(validationErrors.label, issueFeedback);
    });

    targetInstance.assign({
      label: "testValue"
    }, {
      performValidation: true
    });

    confirmTrue(feedbackIncludedStatus);
  });

  // --- Test Group: Minimum Length Validation Rule ---
  group("minimumLength rule");
  verify("given a minimum length, it will fail if provided a string that is shorter", function() {
    var minLengthThreshold = 3;
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          minimumLength: 3
        }
      }
    });

    var targetInstance = new SampleSchema;
    assertEqual(targetInstance.assign({
      label: "alpha"
    }, {
      performValidation: true
    }), targetInstance);
    assertEqual(targetInstance.assign({
      label: "beta"
    }, {
      performValidation: true
    }), false);
  });

  // --- Test Group: Maximum Length Validation Rule ---
  group("maximumLength rule");
  verify("given a maximum length, it will fail if provided a string that is longer", function() {
    var SampleSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          maximumLength: 4
        }
      }
    });

    var targetInstance = new SampleSchema;
    assertEqual(targetInstance.assign({
      label: "gamma"
    }, {
      performValidation: true
    }), false);
    assertEqual(targetInstance.assign({
      label: "beta"
    }, {
      performValidation: true
    }), targetInstance);
  });

  // --- Test Group: Pattern Matching Validation ---
  group("regexMatch validation");
  verify("pattern /^match/", function() {
    var RegexSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          regexMatch: /^match/
        }
      }
    });

    var regexInstance = new RegexSchema;
    confirmTrue(regexInstance.assign({
      label: "match"
    }, {
      performValidation: true
    }));
    assertEqual(regexInstance.assign({
      label: "invalid"
    }, {
      performValidation: true
    }), false);
  });

  // --- Test Group: Minimum Value Constraint ---
  group("minimumValue validation");
  verify("operates as expected", function() {
    var MinConstraintSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        dimension: {
          minimumValue: 3
        }
      }
    });

    var constraintObj = new MinConstraintSchema;
    assertEqual(constraintObj.assign({
      dimension: 2
    }, {
      performValidation: true
    }), false);
    confirmTrue(constraintObj.assign({
      dimension: 5
    }, {
      performValidation: true
    }));
  });

  // --- Test Group: 'Within Set' Constraint ---
  group("withinSet validation");
  verify("operates as expected", function() {
    var SetConstraintSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        dimension: {
          withinSet: [
            1, 2, 3
          ]
        }
      }
    });

    var constraintObj = new SetConstraintSchema;
    assertEqual(constraintObj.assign({
      dimension: 5
    }, {
      performValidation: true
    }), false);
    confirmTrue(constraintObj.assign({
      dimension: 1
    }, {
      performValidation: true
    }));
  });

  // --- Test Group: Maximum Value Constraint ---
  group("maximumValue validation");
  verify("operates as expected", function() {
    var MaxConstraintSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        dimension: {
          maximumValue: 3
        }
      }
    });

    var constraintObj = new MaxConstraintSchema;
    assertEqual(constraintObj.assign({
      dimension: 5
    }, {
      performValidation: true
    }), false);
    confirmTrue(constraintObj.assign({
      dimension: 2
    }, {
      performValidation: true
    }));
  });


  // --- Test Group: Allowed Values (Whitelists) ---
  group("allowedValues");
  verify("valid color selections", function() {
    var ColorSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        label: {
          withinSet: [
            'light',
            'azure',
            'crimson'
          ]
        }
      }
    });

    var colorEntity = new ColorSchema;
    confirmTrue(colorEntity.assign({
      label: 'light'
    }, {
      performValidation: true
    }));
    assertEqual(colorEntity.assign({
      label: 'amber'
    }, {
      performValidation: true
    }), false);
  });

  // --- Test Group: Array Item Specific Checks ---
  group("arrayItemChecks");
  verify("operates as expected", function() {
    var ArrayItemSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        dataArray: {
          arrayElem: function(item) {
            if (item < 100) return true;
          }
        }
      }
    });

    var constraintObj = new ArrayItemSchema();
    confirmTrue(constraintObj.assign({
      dataArray: []
    }, {
      performValidation: true
    }));
    assertEqual(constraintObj.assign({
      dataArray: [101, 89]
    }, {
      performValidation: true
    }), false);
    assertEqual(constraintObj.assign({
      dataArray: [788]
    }, {
      performValidation: true
    }), false);
    confirmTrue(constraintObj.assign({
      numericArray: [1, 67]
    }, {
      performValidation: true
    }));
  });

  // --- Test Group: Data Format Checks (Type Validations) ---
  group("dataFormatChecks");
  verify("electronicMail", function() {
    var EmailSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        emailAddress: {
          type: "electronicMail"
        }
      }
    });

    var constraintObj = new EmailSchema;
    assertEqual(constraintObj.assign({
      emailAddress: "badFormat"
    }, {
      performValidation: true
    }), false);
    confirmTrue(constraintObj.assign({
      emailAddress: "valid@domain.com"
    }, {
      performValidation: true
    }));
  });


  verify("webAddress", function() {
    var WebLinkSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        webLink: {
          type: "webAddress"
        }
      }
    });

    var constraintObj = new WebLinkSchema;
    assertEqual(constraintObj.assign({
      webLink: "badFormat"
    }, {
      performValidation: true
    }), false);
    confirmTrue(constraintObj.assign({
      webLink: "https://secure.org"
    }, {
      performValidation: true
    }));
    confirmTrue(constraintObj.assign({
      webLink: "ftp://archive.net"
    }, {
      performValidation: true
    }));
  });


  verify("numericalValue", function() {
    var NumericSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        locationId: {
          type: "numericalValue"
        }
      }
    });

    var constraintObj = new NumericSchema();
    confirmTrue(constraintObj.assign({
      locationId: "33"
    }, {
      performValidation: true
    }));
    confirmTrue(constraintObj.assign({
      locationId: 33
    }, {
      performValidation: true
    }));
    confirmTrue(constraintObj.assign({
      locationId: "33.333"
    }, {
      performValidation: true
    }));
    assertEqual(constraintObj.assign({
      locationId: "33.333f"
    }, {
      performValidation: true
    }), false);
    assertEqual(constraintObj.assign({
      locationId: "f33.333f"
    }, {
      performValidation: true
    }), false);
    assertEqual(constraintObj.assign({
      locationId: "."
    }, {
      performValidation: true
    }), false);
    confirmTrue(constraintObj.assign({
      locationId: "089"
    }, {
      performValidation: true
    }));
  });

  verify("Textual", function() {
    var TextualSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        locationId: {
          type: "Textual"
        }
      }
    });

    var constraintObj = new TextualSchema();
    confirmTrue(constraintObj.assign({
      locationId: "some text"
    }, {
      performValidation: true
    }));
    confirmTrue(constraintObj.assign({
      locationId: "33.333"
    }, {
      performValidation: true
    }));
    assertEqual(constraintObj.assign({
      locationId: 33.333
    }, {
      performValidation: true
    }), false);
    assertEqual(constraintObj.assign({
      locationId: []
    }, {
      performValidation: true
    }), false);
  });

  verify("Collection", function() {
    var CollectionSchema = Backbone.BaseEntity.augment({
      fieldChecks: {
        members: {
          type: "Collection"
        }
      }
    });
    // The original code was truncated here, so no further statements are added to preserve Type II.
  });

}); // End of jQuery DOMContentLoaded handler