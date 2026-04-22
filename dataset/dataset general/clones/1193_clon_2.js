const structSearch = require("./structural-search");
const _valRef = structSearch.varReference;

// Test suite for data selection procedures
describe("data selection procedures", function() {

  // Verifies that the root element is correctly identified
  it("must find the base element", function() {
    const inputObject = {
      "label": "Andrei",
      "yearsOld": 28
    };

    const matchDefinition = {
      "label": "Andrei"
    };

    structSearch.find(
      inputObject,
      matchDefinition,
      function(targetElement) {
        expect(targetElement.yearsOld).toEqual(28);
      },
      function(processedData, totalMatches) {
        expect(totalMatches).toEqual(1);
      }
    );
  });


  // Confirms matching of a straightforward data type
  it("should correctly identify a basic type", function() {
    structSearch.find(
      "Andrei",
      "Andrei",
      null,
      function(processedData, totalMatches) {
        expect(processedData).toEqual("Andrei");
        expect(totalMatches).toEqual(1);
      }
    );
  });


  // Verifies that an array pattern does not match a plain object
  it("wont match an array pattern with an object structure", function() {
    const inputObject = {
      label: "Andrei"
    };

    const matchDefinition = [];

    structSearch.find(inputObject, matchDefinition, null, function(processedData, totalMatches) {
      expect(totalMatches).toEqual(0);
    });
  });


  // Ensures matching works for properties explicitly set to undefined
  it("must find undefined property values", function() {
    const initialGraph = [{
      label: "Andrei"
    }, {
      distinctAttribute: 10
    }];

    // The search pattern looks for elements that possess the 'label' field.
    const searchPattern = {
      label: undefined
    };

    structSearch.find(
      initialGraph,
      searchPattern,
      null,
      function(processedData, totalMatches) {
        expect(totalMatches).toEqual(1);
      }
    );
  });


  // Validates finding objects using a custom function criterion
  it("should locate entries based on a specific functional test", function() {
    const initialGraph = [{
      label: "Andrei",
      yearsOld: 28
    }, {
      label: "Corina",
      yearsOld: 26
    }, {
      label: "Homer Simpson",
      yearsOld: 60
    }];

    structSearch.find(
      initialGraph, {
        yearsOld: function(currentAgeVal) {
          return currentAgeVal < 50;
        }
      },
      null,
      function(processedData, totalMatches) {
        expect(totalMatches).toEqual(2);
      }
    );
  });


  // Confirms matching a subset of an array's definition when the index is greater than zero
  it("must match a subset array definition beyond the first element", function() {
    const initialGraph = {
      attributes: [{
        kind: 'a',
        measure: 4
      }, {
        kind: 'b',
        measure: 5
      }]
    };

    structSearch.find(
      initialGraph, {
        attributes: [{
          measure: function(currentVal) {
            return currentVal == 5;
          }
        }]
      },
      null,
      function(processedData, totalMatches) {
        expect(totalMatches).toEqual(1);
      }
    );
  });


  // Verifies the ability to find a straightforward object within a nested structure
  it("should locate a basic object", function() {
    const inputObject = {
      individual: {
        "label": "Andrei",
        "yearsOld": 28
      }
    };

    const matchDefinition = {
      "label": "Andrei"
    };

    structSearch.find(
      inputObject,
      matchDefinition,
      function(targetElement) {
        expect(targetElement.yearsOld).toEqual(28);
      },
      function(processedData, totalMatches) {
        expect(totalMatches).toEqual(1);
      }
    );
  });


  // Ensures variables appearing only once are correctly captured
  it("should discover singular variable occurrences", function() {
    const inputObject = {
      individual: {
        "label": "Andrei",
        "yearsOld": 28,
        "location": "London"
      }
    };

    const matchDefinition = {
      "label": "Andrei",
      "yearsOld": _valRef("oldness"),
      "location": _valRef("place")
    };

    structSearch.find(
      inputObject,
      matchDefinition,
      function(targetElement, boundVariables) {
        expect(targetElement.yearsOld).toEqual(28);
        expect(boundVariables.oldness).toEqual(28);
        expect(boundVariables.place).toEqual("London");
      },
      function(processedData, totalMatches) {
        expect(totalMatches).toEqual(1);
      }
    );
  });


  // Tests for correctly identifying identical variables across multiple locations
  it("should locate recurring identical variable references", function() {
    const inputObject = {
      individual: {
        "label": "Andrei",
        "yearsOld": 28,
        "operatingSystemType": "MacOS",
        "group": {
          "label": "idevelop",
          "preferredOperatingSystem": "MacOS"
        }
      }
    };

    const matchDefinition = {
      "operatingSystemType": _valRef("system_id"),
      "group": {
        "preferredOperatingSystem": _valRef("system_id")
      }
    };

    structSearch.find(
      inputObject,
      matchDefinition,
      function(targetElement, boundVariables) {
        expect(targetElement.label).toEqual("Andrei");
        expect(boundVariables.system_id).toEqual("MacOS");
      },
      function(processedData, totalMatches) {
        expect(totalMatches).toEqual(1);
      }
    );
  });


  // Confirms that a single variable cannot match different values simultaneously
  it("must not match a single variable with conflicting values", function() {
    const inputObject = {
      individual: {
        "label": "Andrei",
        "yearsOld": 28,
        "operatingSystemType": "MacOS",
        "group": {
          "label": "idevelop",
          "preferredOperatingSystem": "Windows"
        }
      }
    };

    const matchDefinition = {
      "operatingSystemType": _valRef("system_id"),
      "group": {
        "preferredOperatingSystem": _valRef("system_id")
      }
    };

    structSearch.find(
      inputObject,
      matchDefinition,
      null,
      function(processedData, totalMatches) {
        expect(totalMatches).toEqual(0);
      }
    );
  });
}); // Closing of the selection test suite


// Test suite dedicated to data replacement operations
describe("data modification operations", function() {

  // Checks if a specific value within a found element can be updated
  it("should modify an element's attribute value", function() {
    let inputObject = [{
      label: "Andrei",
      yearsOld: 28
    }, {
      label: "Corina",
      yearsOld: 26
    }];

    structSearch.find(
      inputObject, {
        "label": "Andrei"
      },
      function(targetElement) {
        targetElement.yearsOld++;
      },
      function(processedData, totalMatches) {
        expect(processedData.length).toEqual(2);

        structSearch.find(
          processedData, {
            "label": "Andrei"
          },
          function(targetElement) {
            expect(targetElement.yearsOld).toEqual(29);
          }
        );
      }
    );
  });


  // Verifies replacement of a basic value
  it("must substitute a trivial value", function() {
    structSearch.find(
      {
        label: "Andrei"
      },
      "Andrei",
      function() {
        return "Homer";
      },
      function(finalResult) {
        expect(finalResult.label).toEqual("Homer");
      }
    );
  });


  // Ensures an entire element can be replaced with a new structure
  it("should swap out a basic element", function() {
    let inputObject = [{
      label: "Andrei",
      yearsOld: 28
    }, {
      label: "Corina",
      yearsOld: 26
    }];

    structSearch.find(
      inputObject, {
        "label": "Andrei"
      },
      function(targetElement) {
        return {
          label: "Andrei Gheorghe",
          yearsOld: 28.5
        };
      },
      function(processedData, totalMatches) {
        expect(processedData.length).toEqual(2);

        structSearch.find(
          processedData, {
            "label": "Andrei Gheorghe"
          },
          null,
          function(processedDataInner, totalMatchesInner) {
            expect(totalMatchesInner).toEqual(1);
          }
        );
      }
    );
  });


  // Demonstrates recursive summation of a numerical data hierarchy
  it("must recursively aggregate a numeric structure", function() {
    const inputObject = [1, 2, 3, [4, 5, [6]]];
    const matchDefinition = [];

    structSearch.find(
      inputObject,
      matchDefinition,
      function(targetElement) {
        const totalSum = targetElement.reduce(function(runningTotal, currentVal) {
          return runningTotal + currentVal;
        }, 0);

        return totalSum;
      },
      function(processedData, totalMatches) {
        expect(processedData).toEqual(21);
      }
    );
  });
}); // Closing of the modification test suite