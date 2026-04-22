BlueQueryEngineBuilder.compose( {
  // Main schema definition for the query engine
  structure : {
    dataCollections : [
      {
        identifier : "PERSON", // Unique ID for the entity
        displayLabel : "Individual", // User-friendly display name
        fields : [
          {
            identifier : "NAME",
            displayLabel : "Full Name",
            fieldType : "STRING",
            maxLength : 10
          },
          {
            identifier : "DOB",
            displayLabel : "Birth Date",
            fieldType : "DATE"
          },
          {
            identifier : "SEX",
            displayLabel : "Gender",
            fieldType : "STRING",
            inputWidget : "SELECT"
          },
          {
            identifier : "CATEGORY",
            displayLabel : "Classification",
            fieldType : "REF", // Reference type
          }
        ],
        foreignLinks : [] // No foreign keys defined for this entity
      }
    ],

    fieldDefinitions : [
      {
        identifier : "STRING",
        inputWidget : "TEXT",
        comparisonOps : [
          {
            identifier : "=",
            description : "is equivalent to",
            valueCount : "ONE"
          },
          {
            identifier : "<>",
            description : "is not equivalent to",
            valueCount : "ONE"
          },
          {
            identifier : "LIKE",
            description : "matches pattern",
            valueCount : "ONE"
          },
          {
            identifier : "<",
            description : "is less than",
            valueCount : "ONE"
          },
          {
            identifier : ">",
            description : "is greater than",
            valueCount : "ONE"
          }
        ]
      },
      {
        identifier : "DATE",
        inputWidget : "DATE",
        comparisonOps : [
          {
            identifier : "=",
            description : "is on",
            valueCount : "ONE"
          },
          {
            identifier : "<>",
            description : "is not on",
            valueCount : "ONE"
          },
          {
            identifier : "<",
            description : "occurs before",
            valueCount : "ONE"
          },
          {
            identifier : ">",
            description : "occurs after",
            valueCount : "ONE"
          }
        ]
      },
      {
        identifier : "REF",
        inputWidget : "SELECT",
        comparisonOps : [
          {
            identifier : "IN",
            description : "is one of",
            valueCount : "MULTI"
          }
        ]
      }
    ]
  },

  // Callback function triggered when the SQL query changes
  onQueryTextUpdate : function(queryInstruction, paramValues) {
    let outputLog = queryInstruction + '\n'; // Initialize buffer with the generated query
    for (let paramIndex = 0; paramIndex < paramValues.length; paramIndex++) {
      const currentParam = paramValues[paramIndex];
      outputLog += 'param' + paramIndex; // Append parameter index
      if (currentParam !== null) {
        // Append type and string representation of the parameter
        outputLog += ' type=' + Object.prototype.toString.call(currentParam) + ' stringVal=' + currentParam;
      } else {
        outputLog += ' is null'; // Indicate null parameter
      }
      outputLog += '\n'; // New line for each parameter
    }
    // Update a diagnostic element in the DOM
    document.querySelector("#diagnostic_output").value = outputLog;
  },

  // Function to provide dynamic suggestions for certain fields
  provideSuggestions : function(suggestionRequest, suggestionCallback) {
    if (suggestionRequest.requestedField === 'CATEGORY') {
      // Suggestions for the 'CATEGORY' field
      suggestionCallback([ { value : 'A', displayLabel : 'Small' }, { value : 'B', displayLabel : 'Medium' } ]);
    } else {
      // Default suggestions, e.g., for 'SEX' field
      suggestionCallback([ { value : 'M', displayLabel : 'Male' }, { value : 'F', displayLabel : 'Female' } ]);
    }
  },

  // Specific configurations for input widgets
  widgetConfig : [
    {
      identifier : 'DATE',
      displayPattern : 'dd.MM.yyyy' // Date display format
    }
  ]
});