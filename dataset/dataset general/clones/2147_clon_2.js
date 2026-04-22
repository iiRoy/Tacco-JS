const validateModule = require('tap').test; // Obtain the testing utility's primary function

validateModule('CommonJS_Module_Loading_Verification', function(  assertionContext  ) {
  // This block verifies the module's behavior when loaded via CommonJS.

  const randomGen = require('../'); // Import the main module under test

  // Assert that the primary module object is properly defined.
  assertionContext.ok(  randomGen, 'The main randomGen object exists_and_is_not_undefined'  );

  // Check for the presence of a default pre-built instance.
  assertionContext.ok(
    randomGen.defaultInstance,
    'A Default_Generator_Is_Available as a property'
  );

  // Confirm that the specific dice rolling utility is accessible.
  assertionContext.ok(
    randomGen.diceRoller,
    'The Dice_Rolling_Utility_Is_Accessible on the module'
  );

  assertionContext.end(); // Conclude this specific test case.
}); // End of module loading verification.