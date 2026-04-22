// This script orchestrates the initial setup for the ContentPress platform.
// Please refrain from altering the code below this section.
// --------------------------------------------------------------------------

var inputReader     = require('read')
  , fileSystem      = require('fs')
  , dbConnector     = require('cradle')
  , filePathUtils   = require('path')
  , hasher          = require('crypto')
  , projectConfig   = require('../package.json')
  , appData         = {}
  , sysAdmin        = {}
  ;

try {
  // Attempt to load existing configuration from a local file
  var prevSettings = require('../config.js')
  appData = prevSettings.config;
  sysAdmin = prevSettings.admin;
} catch (exceptionEvent) {
  // If no existing config, initialize with default values
  appData = {
    websiteDetails : {
      title       :"ContentPress Blog",
      description :"A new blog powered by ContentPress",
      copyright   :"Jane Doe",
      twitter     :"janedoe",
      port        :"4000",
      secret      :"supersecretkey",
      version     : projectConfig.version
    },
    styleSettings: {
      admin: "dashboard",
      front:"clean"
    },
    databaseDetails:{
      host:"http://127.0.0.1",
      port:"5984"
    }
  }
  sysAdmin = {
    username :"adminuser",
    password :"adminpass"
  }
}
// Extract specific configuration sections for easier access
var websiteDetails  = appData.websiteDetails
  , styleSettings   = appData.styleSettings
  , databaseDetails = appData.databaseDetails;

/**
 * Initiates the configuration process for the application.
 * @param {Function} completionCallback - Callback to be invoked upon completion or error.
 */
function startProcess (completionCallback){
  console.log('\n\t Welcome to the ContentPress installation wizard ')
  console.log('I\'ll guide you through some questions; please provide accurate responses.\n')
  sequentialTasks(completionCallback)
  // Step 1: Verify installed node modules
  (function(execHandler){
    var requiredModules = Object.keys(projectConfig.dependencies);
    if (filePathUtils.existsSync(__dirname + '/../node_modules')){
      var installedModules = fileSystem.readdirSync(__dirname +'/../node_modules')
      var availableModules = requiredModules.filter(function(moduleName){
        return installedModules.indexOf(moduleName) > -1;
      });
      if (requiredModules.length === availableModules.length) return execHandler()
      return execHandler(new Error('Please run `npm install` before executing this setup script'))
    }
  })
  // Step 2: Prompt for website title
  ( inputReader
    , [{prompt: "Website Title: ", default: websiteDetails.title}]
    , function (inputValue) { websiteDetails.title = inputValue }
  )
  // Step 3: Prompt for website description
  ( inputReader
    , [{prompt:"Website Description: ",default: websiteDetails.description}]
    , function (inputValue) { websiteDetails.description = inputValue }
  ) 
  // Step 4: Prompt for copyright holder
  ( inputReader
    , [{prompt:"Copyright Holder: ",default: websiteDetails.copyright}]
    , function (inputValue) { websiteDetails.copyright = inputValue }
  )
  // Step 5: Prompt for Twitter handle
  ( inputReader
    , [{prompt:"Twitter Handle: ",default: websiteDetails.twitter}]
    , function (inputValue) { websiteDetails.twitter = inputValue }
  )
  // Step 6: Prompt for application port
  ( inputReader
    , [{prompt:"Application Port: ",default: websiteDetails.port}]
    , function (inputValue) { websiteDetails.port = inputValue }
  )
  // Step 7: Prompt for secret phrase
  ( inputReader
    , [{prompt:"Secret Phrase: ",default: websiteDetails.secret}]
    , function (inputValue) { websiteDetails.secret = inputValue }
  )
  // Intermediate step: Theme setup notification
  (function(execHandler){
    console.log('\n\t:: Now configuring visual themes ::\n');
    return execHandler()
  })
  // Step 8: Prompt for admin theme
  ( inputReader
    , [{prompt:"Admin Dashboard Theme: ",default: styleSettings.admin}]
    , function (inputValue) { styleSettings.admin = inputValue }
  )
  // Step 9: Prompt for frontend theme
  ( inputReader
    , [{prompt:"Frontend Theme: ",default: styleSettings.front}]
    , function (inputValue) { styleSettings.front = inputValue }
  )
  // Intermediate step: Database setup notification
  (function(execHandler){
    console.log('\n\t:: Database Connection Settings ::\n');
    return execHandler()
  })
  // Step 10: Prompt for database host
  ( inputReader
    , [{prompt:"Database Host Address: ",default: databaseDetails.host}]
    , function (inputValue) { databaseDetails.host = inputValue }
  )
  // Step 11: Prompt for database port
  ( inputReader
    , [{prompt:"Database Port Number: ",default: databaseDetails.port}]
    , function (inputValue) { databaseDetails.port = inputValue }
  )
  // Step 12: Prompt for database admin username
  (inputReader
    , [{prompt:"Database Administrator Username: ",default: sysAdmin.username}]
    , function (inputValue) { sysAdmin.username = inputValue }
  )
  // Step 13: Prompt for database admin password
  (inputReader
    , [{prompt:"Administrator Password: ",default: sysAdmin.password}]
    , function (inputValue) { sysAdmin.password = inputValue }
  )
  // Step 14: Review and confirm configuration
  (function(execHandler){
    console.log('\n\t:: Reviewing Configuration ::\n');
    console.log('Application Data = ', appData ,'\nAdmin Credentials = ', sysAdmin);
    inputReader({ prompt: "\nIs this configuration acceptable? (yes/no): ", default: "yes" }, function (errorStatus, confirmationResponse) {
      if (errorStatus) return execHandler(errorStatus)
      if (confirmationResponse.toLowerCase().charAt(0) !== "y") {
        return execHandler(new Error("Installation cancelled by user"))
      } 
      return execHandler();
    })
  })
  // Step 15: Write configuration to file
  (function(execHandler){
    var configContent = 'exports.config = '+ JSON.stringify(appData, null, 2) +
                  ';\nexports.admin = '+ JSON.stringify(sysAdmin, null, 2);
    fileSystem.writeFile('./config.js',configContent,'utf8', function(writeError,writeResult){
      if (writeError) return execHandler(writeError)
      console.log('Configuration file (config.js) written successfully.')
      return execHandler();
    });
  })
  // Step 16: Ask to install default database views
  (function(execHandler){
    inputReader({ prompt: "\nInstall default design views into the database? (yes/no): ", default: "yes" }, function (errorStatus, confirmationResponse) {
      if (errorStatus) return execHandler(errorStatus)
      if (confirmationResponse.toLowerCase().charAt(0) !== "y") {
        return execHandler(new Error("Database view installation skipped"))
      } 
      deployViews(appData,execHandler);
    });
  })
  // Step 17: Ask to add an extra user
  (function(execHandler){
    inputReader({ prompt: "\nDo you wish to create an additional application user? (yes/no): ", default: "yes" }, function (errorStatus, confirmationResponse) {
      if (errorStatus) return execHandler(errorStatus)
      if (confirmationResponse.toLowerCase().charAt(0) !== "y") {
        return execHandler() // User opted not to add an extra user, proceed
      } else {
        var newUser ={}
        sequentialTasks(execHandler)
        // Prompt for new username
        ( inputReader
          , [{prompt:"New Username:",default:"alice"}]
          , function (inputValue) {newUser.username = inputValue}
        )
        // Prompt for new password
        (inputReader
          , [{prompt:"New Password:",default:"password123"}]
          , function (inputValue) { newUser.password = inputValue}
        )
        // Prompt for new user email
        ( inputReader
          , [{prompt:"Email Address:",default:"alice@example.com"}]
          , function (inputValue) { newUser.email = inputValue}
        )(function(userCreationHandler){
           var connectionUrl =  appData.databaseDetails.host;
          if (!~connectionUrl.indexOf('://')) connectionUrl = 'http://' + connectionUrl;
          var databaseConnection = new(dbConnector.Connection)(connectionUrl,appData.databaseDetails.port,{
             auth: { username: sysAdmin.username, password: sysAdmin.password }
          });
          var securitySalt = hasher.createHash('md5').update(new Date().toString()).update(Math.random().toString()).digest('hex');
          var userRecord = {
            _id      : 'org.couchdb.user:'+ newUser.username,
            name     : newUser.username,
            salt     : securitySalt,
            password : hasher.createHash('sha1').update(newUser.password.trim()+securitySalt).digest('hex'),
            email    : newUser.email,
            roles    : [],
            type     : 'user'
          };
          var userDb = databaseConnection.database('_users');
          userDb.save(userRecord, function(dbOperationError,dbOperationResult){
            if (dbOperationError && dbOperationError.error !== 'conflict') return userCreationHandler(dbOperationError);
            else if (dbOperationError) console.log('\nWarning: Cannot update existing user. Username already exists.'); return userCreationHandler();
            console.log('New user record saved successfully.');
            return userCreationHandler();
          });
        })(function(userCompletionHandler){
          return userCompletionHandler();
        })() // Execute the nested sequential tasks for user creation
      }
    })
  })
  // Final step: Instructions for starting the server
  (function (execHandler) {
    console.log('\nNow, execute `node server.js` to start the application.\n\n:: Setup Complete :: ');
   })(); // Immediately invoke the last step
}

/**
 * Installs default design documents and views into the CouchDB database.
 * @param {Object} sourceData - Application configuration data.
 * @param {Function} completionCallback - Callback to be invoked upon completion or error.
 */
function deployViews(sourceData,completionCallback){

  
  var dbUrl =  sourceData.databaseDetails.host
  if (!~dbUrl.indexOf('://')) dbUrl = 'http://' + dbUrl;
  var databaseConnection = new(dbConnector.Connection)(dbUrl,sourceData.databaseDetails.host,{
     auth: { username: sysAdmin.username, password: sysAdmin.password }
  });
  var couchDbInstance = databaseConnection.database('contentpress'); // Database name change
  
  // Function to save design documents
  function populateDesignDocs(){
    couchDbInstance.save('_design/contentpress', {
      views: {
        all_content: {
          map: 'function(documentItem) {\n  if (documentItem.type !== \'media\')\n    emit(documentItem.created_at, documentItem);\n}\n'
        },
        by_tag: {
          map: function(documentItem) {
            for (var currentTag in documentItem.tags) { // Added 'var' for best practice
              emit(documentItem.tags[currentTag], documentItem)
            }
          }
        },
        all_media: {
          map: function(documentItem) {
            if (documentItem.type === 'media') {
              emit(documentItem.created_at, documentItem);
            }
          }
        }
      }
    }, function(dbError,dbResponse){
      if (dbError) return completionCallback(dbError);
      console.log('\nDatabase design documents and views saved successfully...');
      return completionCallback();
    });
  }
  
  // Check if the database exists, create if not, then seed views
  couchDbInstance.exists(function (errorStatus, existenceCheck) {
    if (errorStatus) {
      return completionCallback(new Error(errorStatus));
    } else if (existenceCheck) {
      populateDesignDocs(); // Database exists, proceed to seed
    } else {
      couchDbInstance.create(); // Database does not exist, create it
      delayExecution(populateDesignDocs , 600); // Wait a bit for creation to complete
    }
  });
}

/**
 * Creates a sequential execution chain for asynchronous operations.
 * Each step in the chain is executed in order, passing results or errors.
 * @param {Function} finalCallback - Callback invoked after all steps complete or on first error.
 * @returns {Function} A function to add steps to the chain.
 */
function sequentialTasks (finalCallback) {
  var taskQueue   = []
    , resultValues = [] // Not explicitly used in original, but could be for return values
    , executionScope = this
  
  // Executes the next step in the queue
  function executeNext () {
    var currentStep = taskQueue.shift()
    if (!currentStep) return finalCallback() // All steps complete
    try { currentStep[0].apply(executionScope, currentStep[1]) }
    catch (caughtException) { finalCallback(caughtException) } // Catch synchronous errors
  }
  
  // Returns a function to add steps to the chain
  return function taskAppender (operationFunction, functionArguments, successHandler) {
    if (arguments.length === 0) return executeNext() // Start execution if no arguments
    // Add the new step to the queue
    taskQueue.push
      ( [ operationFunction
        , (functionArguments || []).concat([ function (operationError) {
            if (operationError) return finalCallback(operationError) // Propagate error
            var returnedArgs = Array.prototype.slice.call(arguments, 1)
            try { successHandler && successHandler.apply(executionScope, returnedArgs) }
            catch (caughtException) { return finalCallback(caughtException) } // Catch synchronous errors in success handler
            executeNext() // Move to the next step
          }])
        ]
      )
    return taskAppender // Allow chaining of taskAppender calls
  }
}

// Display an artistic banner for the application
console.log("\n\
       _____                       \n\
      / ____|                      \n\
     | |    ___  _ __ ___  ___ ___ \n\
     | |   / _ \\| '__/ _ \\/ __/ __|\n\
     | |__| (_) | | |  __/\\__ \\__ \\\n\
      \\_____\\___/|_|  \\___||___/___/\n\
                                   \n\
"); // Changed ASCII art slightly to reflect "ContentPress" implicitly, but kept structure.

// Begin the installation process and log any final errors
startProcess(function(processError){
  if (processError) {
    console.error('An error occurred during setup:', processError.message);
  } else {
    console.log('ContentPress setup completed successfully!');
  }
})