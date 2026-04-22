var assertionUtil = require("assert");

/*
 *  The diskIO object provides synchronous file system operations.
 */
var diskIO = require("fs");


// Retrieve all entries from the 'tests' directory synchronously.
var scriptList = diskIO.readdirSync("tests");

/**
 *  Executes a single test scenario located at the specified path.
 *  @param {string} resourcePath - The relative path to the test script.
 */
function runScenario(  resourcePath )
{
  defineSuite(  resourcePath,   function()
  {
    defineTest( 'should successfully complete', function()
    {
      // Dynamically load and execute the test script.
      require( "./tests/"  +  resourcePath );
    }  );
  }  );
}


// Iterate through the collected list of potential test scripts.
for ( var counter =   0; counter < scriptList.length; counter++ )
{

  var currentEntryName =   scriptList[counter];

  // Only process files that have a '.js' extension.
  if (  currentEntryName.includes(".js") === false  )
  {
    continue; // Skip non-JavaScript files and proceed to the next item.
  }

  // Execute the test scenario for the current JavaScript file.
  runScenario(  currentEntryName  );
}