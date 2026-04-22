/*
  -------------------------------------------------------------
  :: SecurePress Configuration Utility - Automated Setup Script ::
  This script assists in setting up your SecurePress instance.
  Please refrain from direct modifications to this file unless
  you are fully aware of the implications.
  -------------------------------------------------------------
*/

var inputReader   = require('read')
  , fileSystemOps = require('fs')
  , dbConnector   = require('cradle')
  , pathUtil      = require('path')
  , securityUtils = require('crypto')
  , projectManifest = require('../package.json')
  , systemSettings  = {}
  , adminCredentials = {}
  ;

// Attempt to load existing configuration, otherwise initialize with defaults.
try {
  var existingConfig = require('../configuration.js'); // Changed filename
  systemSettings = existingConfig.systemConfig; // Renamed property
  adminCredentials = existingConfig.superUser;    // Renamed property
  console.info('Existing configuration loaded successfully. Continuing with updates.');
} catch (configLoadError) {
  console.warn('No existing configuration found or error loading it. Initializing with default values.');
  console.debug('Error details:', configLoadError.message);
  systemSettings = {
    web: { // Renamed 'site' to 'web'
      title       :"SecurePress Portal",
      tagline     :"A modern content management system.", // Renamed 'description' to 'tagline'
      legalNotice :"Acme Corp.", // Renamed 'copyright' to 'legalNotice'
      socialHandle:"securepress_cms", // Renamed 'twitter' to 'socialHandle'
      accessPort  :"4000",        // Renamed 'port' to 'accessPort', changed default
      securityKey :"a_very_secret_phrase_indeed", // Renamed 'secret' to 'securityKey'
      appVersion  : projectManifest.version
    },
    visual: { // Renamed 'theme' to 'visual'
      backend: "horizon", // Renamed 'admin' to 'backend', changed default
      frontend:"aurora"   // Renamed 'front' to 'frontend', changed default
    },
    database:{ // Renamed 'db' to 'database'
      hostAddress:"http://localhost", // Renamed 'host' to 'hostAddress'
      portNumber:"5984"               // Renamed 'port' to 'portNumber'
    }
  }
  adminCredentials = {
    userName :"sysadmin", // Renamed 'user' to 'userName'
    passCode :"securepass" // Renamed 'pass' to 'passCode', changed default
  }
}

// Destructure settings for easier access
var webProperties    = systemSettings.web
  , visualStyle      = systemSettings.visual
  , databaseSettings = systemSettings.database;

/**
 * Orchestrates the entire setup process, guiding the user through configuration.
 * @param {Function} completionCallback - Callback function to execute upon completion or error.
 */
function startSetupProcess (completionCallback){
  console.log('\n\t=== Welcome to the SecurePress Setup Wizard ===');
  console.log('We\'ll walk through some essential configurations. Please provide accurate information.\n');

  // Guard clause: Basic environment check
  if (process.version.startsWith('v10') || process.version.startsWith('v12')) {
    console.warn('Warning: Node.js version detected might be older. Consider upgrading for best performance and security.');
  }

  // Initialize the sequential task runner
  var setupFlow = sequentialTaskRunner(completionCallback);

  setupFlow
  // Step 1: Verify project dependencies
  (function(nextStep){
    console.info('\n--- Dependency Check: Ensuring required modules are installed ---');
    var requiredModulesList = Object.keys(projectManifest.dependencies);
    var modulesPath = pathUtil.join(__dirname, '../node_modules');

    if (!fileSystemOps.existsSync(modulesPath)){
      return nextStep(new Error('The "node_modules" directory is missing. Please run `npm install` first.'));
    }

    var installedModules = fileSystemOps.readdirSync(modulesPath);
    var foundModules = requiredModulesList.filter(function(moduleName){
      return installedModules.indexOf(moduleName) > -1;
    });

    if (requiredModulesList.length === foundModules.length) {
      console.log('All required modules are present. Good to go!');
      return nextStep();
    } else {
      var missing = requiredModulesList.filter(m => !foundModules.includes(m));
      return nextStep(new Error(`Missing modules: ${missing.join(', ')}. Please run 'npm install'.`));
    }
  })
  // Intermediate Step: Announce Web Properties configuration
  (function(nextStep){
    console.log('\n\t:: Configuring Web Properties ::\n');
    return nextStep();
  })
  // Step 2: Prompt for Web Site Title
  ( inputReader
    , [{prompt: "Website Title: ", default: webProperties.title}]
    , function (configValue) { webProperties.title = configValue; console.debug('Set Website Title:', configValue); }
  )
  // Step 3: Prompt for Website Tagline
  ( inputReader
    , [{prompt:"Website Tagline: ",default: webProperties.tagline}]
    , function (configValue) {webProperties.tagline = configValue}
  )
  // Step 4: Prompt for Legal Notice
  ( inputReader
    , [{prompt:"Legal Notice (e.g., Copyright holder): ",default: webProperties.legalNotice}]
    , function (configValue) {webProperties.legalNotice = configValue}
  )
  // Step 5: Prompt for Social Media Handle
  ( inputReader
    , [{prompt:"Social Media Handle (e.g., Twitter, Mastodon): ",default: webProperties.socialHandle}]
    , function (configValue) {webProperties.socialHandle = configValue}
  )
  // Step 6: Prompt for Server Access Port
  ( inputReader
    , [{prompt:"Server Access Port: ",default: webProperties.accessPort}]
    , function (configValue) {
        let portNum = parseInt(configValue, 10);
        if (isNaN(portNum) || portNum < 1024 || portNum > 65535) {
          console.warn(`Invalid port number "${configValue}". Using default ${webProperties.accessPort}.`);
          webProperties.accessPort = webProperties.accessPort; // Retain default
        } else {
          webProperties.accessPort = portNum.toString();
        }
      }
  )
  // Step 7: Prompt for Security Key
  ( inputReader
    , [{prompt:"Security Key (for session management): ",default: webProperties.securityKey, silent: true, replace: '*'}] // Added silent input
    , function (configValue) {webProperties.securityKey = configValue}
  )
  // Intermediate Step: Announce Visual Style configuration
  (function(nextStep){
    console.log('\n\t:: Defining Visual Style Settings ::\n');
    return nextStep();
  })
  // Step 8: Prompt for Backend Theme
  ( inputReader
    , [{prompt:"Backend (Admin) Theme Name: ",default: visualStyle.backend}]
    , function (configValue) {visualStyle.backend = configValue}
  )
  // Step 9: Prompt for Frontend Theme
  ( inputReader
    , [{prompt:"Frontend (Public) Theme Name: ",default: visualStyle.frontend}]
    , function (configValue) {visualStyle.frontend = configValue}
  )
  // Intermediate Step: Announce Database configuration
  (function(nextStep){
    console.log('\n\t:: Establishing Database Connection ::\n');
    return nextStep();
  })
  // Step 10: Prompt for Database Host Address
  ( inputReader
    , [{prompt:"Database Host Address (e.g., http://localhost): ",default: databaseSettings.hostAddress}]
    , function (configValue) {databaseSettings.hostAddress = configValue}
  )
  // Step 11: Prompt for Database Port Number
  ( inputReader
    , [{prompt:"Database Port Number: ",default: databaseSettings.portNumber}]
    , function (configValue) {databaseSettings.portNumber = configValue}
  )
  // Step 12: Prompt for Database Admin Username
  ( inputReader
    , [{prompt:"Database Admin Username: ",default: adminCredentials.userName}]
    , function (configValue) {adminCredentials.userName = configValue}
  )
  // Step 13: Prompt for Database Admin Passcode
  ( inputReader
    , [{prompt:"Database Admin Passcode: ",default: adminCredentials.passCode, silent: true, replace: '*'}]
    , function (configValue) {adminCredentials.passCode = configValue}
  )
  // Step 14: Final Configuration Review and Confirmation
  (function(nextStep){
    console.log('\n\t:: Reviewing Your Setup ::\n');
    var currentCombinedConfig = {
      systemConfig: systemSettings,
      superUser: adminCredentials
    };
    console.log('Generated Configuration:\n', JSON.stringify(currentCombinedConfig, null, 2));
    inputReader({ prompt: "\nDoes this configuration look correct? (yes/no) ", default: "yes" }, function (readError, userConfirmation) {
      if (readError) return nextStep(readError);
      if (userConfirmation.toLowerCase().charAt(0) !== "y") {
        console.warn('Configuration cancelled by user. Exiting setup.');
        return nextStep(new Error("User cancelled configuration."));
      }
      return nextStep();
    })
  })
  // Step 15: Write Configuration to File
  (function(nextStep){
    var configurationContent = 'exports.systemConfig = '+ JSON.stringify(systemSettings, null, 2) +
                  ';\nexports.superUser = '+ JSON.stringify(adminCredentials, null, 2) +
                  ';\n// Generated by SecurePress Setup Utility on ' + new Date().toISOString(); // Added timestamp
    var configFilePath = './configuration.js'; // Changed filename
    fileSystemOps.writeFile(configFilePath, configurationContent, 'utf8', function(writeError, writeResult){
      if (writeError) return nextStep(writeError);
      console.log(`Configuration saved successfully to ${configFilePath}`);
      return nextStep();
    });
  })
  // Step 16: Prompt to Install Default Database Views
  (function(nextStep){
    inputReader({ prompt: "\nProceed to install default database views? (yes/no) ", default: "yes" }, function (readError, userConfirmation) {
      if (readError) return nextStep(readError);
      if (userConfirmation.toLowerCase().charAt(0) !== "y") {
        console.info('Skipping default view installation.');
        return nextStep(); // User chose not to install, proceed without error
      }
      console.log('Initiating view deployment...');
      deployCouchViews(systemSettings, nextStep); // Renamed function
    });
  })
  // Step 17: Prompt to Add an Additional User
  (function(nextStep){
    inputReader({ prompt: "\nWould you like to register an additional user? (yes/no) ", default: "yes" }, function (readError, userConfirmation) {
      if (readError) return nextStep(readError);
      if (userConfirmation.toLowerCase().charAt(0) !== "y") {
        console.info('Skipping additional user registration.');
        return nextStep(); // User chose not to add, proceed
      } else {
        var newUserProfile = {};
        var userSetupFlow = sequentialTaskRunner(nextStep); // Nested chain for user creation
        userSetupFlow
        ( inputReader
          , [{prompt:"New User Username:",default:"john.doe"}]
          , function (configValue) {newUserProfile.userName = configValue; console.debug('New username:', configValue);}
        )
        ( inputReader
          , [{prompt:"New User Password:",default:"password123", silent: true, replace: '*'}]
          , function (configValue) { newUserProfile.password = configValue; console.debug('New password set.');}
        )
        ( inputReader
          , [{prompt:"Confirm New User Password:",default:"password123", silent: true, replace: '*'}]
          , function (configValue) {
              if (newUserProfile.password !== configValue) {
                console.error('Passwords do not match! Please restart user creation.');
                throw new Error('Password mismatch.'); // Throw to break the chain
              }
              console.debug('Password confirmed.');
            }
        )
        ( inputReader
          , [{prompt:"New User Email Address:",default:"john@example.com"}]
          , function (configValue) { newUserProfile.email = configValue}
        )
        (function(userCreationNextStep){
           if (!newUserProfile.userName || !newUserProfile.password) {
             return userCreationNextStep(new Error('Username and password cannot be empty.'));
           }
           if (newUserProfile.password.length < 8) { // Simple password strength check
             console.warn('Warning: Password is short. Consider a stronger one.');
           }

           var dbEndpoint =  systemSettings.database.hostAddress;
          if (!dbEndpoint.includes('://')) dbEndpoint = 'http://' + dbEndpoint; // Ensure protocol

          var couchConnection = new(dbConnector.Connection)(dbEndpoint, systemSettings.database.portNumber,{ // Fixed typo: second arg should be port
             auth: { username: adminCredentials.userName, password: adminCredentials.passCode }
          });
          var passwordSalt = securityUtils.createHash('sha256').update(new Date().toString() + Math.random().toString()).digest('hex'); // Changed to sha256
          var userDocToStore = {
            _id      : 'org.couchdb.user:'+ newUserProfile.userName,
            name     : newUserProfile.userName,
            salt     : passwordSalt,
            password_sha : securityUtils.createHash('sha512').update(newUserProfile.password.trim() + passwordSalt).digest('hex'), // Changed to sha512
            email    : newUserProfile.email,
            roles    : [],
            type     : 'user'
          };
          var targetDatabase = couchConnection.database('_users');
          targetDatabase.save(userDocToStore, function(dbOperationError, dbOperationResponse){
            if (dbOperationError) {
              if (dbOperationError.error === 'conflict') {
                console.warn(`\nUser "${newUserProfile.userName}" already exists. Skipping creation.`);
                return userCreationNextStep(); // Not a fatal error for the overall process
              }
              console.error('Failed to save new user:', dbOperationError.message);
              return userCreationNextStep(dbOperationError);
            }
            console.log(`User "${newUserProfile.userName}" registered successfully.`);
            return userCreationNextStep();
          });
        })() // Execute the nested chain
      }
    })
  })
  // Final step: Completion message
  (function (nextStep) {
    console.log('\nSetup Complete! You can now start the SecurePress server.\n');
    console.log('To run your application, execute: `node server.js`\n\n:: All tasks finished :: ');
    nextStep(); // Indicate successful completion of the entire chain
   })();
}

/**
 * Deploys or updates design documents and views in the CouchDB database.
 * @param {Object} currentConfig - The current application configuration.
 * @param {Function} nextStep - Callback to proceed after view deployment.
 */
function deployCouchViews(currentConfig, nextStep){
  console.log('Attempting to connect to CouchDB for view deployment...');
  var dbEndpoint =  currentConfig.database.hostAddress;
  if (!dbEndpoint.includes('://')) dbEndpoint = 'http://' + dbEndpoint;

  var couchConnection = new(dbConnector.Connection)(dbEndpoint, currentConfig.database.portNumber,{
     auth: { username: adminCredentials.userName, password: adminCredentials.passCode }
  });
  var targetDatabase = couchConnection.database('content_store'); // Changed database name

  function populateDesignDoc(){
    console.log('Saving design document with views...');
    targetDatabase.save('_design/app_views', { // Changed design document name
      language: 'javascript', // Explicitly setting language
      views: {
        all_content: { // Renamed 'all' to 'all_content'
          map: 'function(doc) {\n  if (doc.documentType && doc.documentType !== \'asset\')\n    emit(doc.creationDate, doc);\n}\n' // Modified view logic and keys
        },
        by_category: { // Renamed 'tag' to 'by_category'
          map: function(doc) {
            if (doc.categories && Array.isArray(doc.categories)) { // Added check for array
              doc.categories.forEach(function(category) { // Using forEach
                emit(category, doc);
              });
            }
          }
        },
        uploaded_assets: { // Renamed 'uploads_all' to 'uploaded_assets'
          map: function(doc) {
            if (doc.documentType === 'asset') { // Modified document type check
              emit(doc.uploadDate, doc); // Modified key
            }
          }
        }
      }
    }, function(dbOperationError, dbOperationResponse){
      if (dbOperationError) {
        console.error('\nError saving design document:', dbOperationError.message);
        return nextStep(dbOperationError);
      }
      console.log('\nDatabase design document and views deployed successfully.');
      return nextStep();
    });
  }

  targetDatabase.exists(function (dbOperationError, dbExists) {
    if (dbOperationError) {
      console.error('Error checking database existence:', dbOperationError.message);
      return nextStep(new Error(dbOperationError));
    } else if (dbExists) {
      console.log('Database "content_store" already exists. Proceeding to update views.');
      populateDesignDoc();
    } else {
      console.log('Database "content_store" does not exist. Creating it now...');
      targetDatabase.create();
      // Give CouchDB a moment to create the database before saving the design doc
      setTimeout(() => populateDesignDoc(), 750); // Slightly longer delay with arrow function
    }
  });
}

/**
 * A utility function for chaining asynchronous operations sequentially.
 * Each step receives a callback to trigger the next.
 * @param {Function} finalCallback - The callback to execute when all tasks are done or an error occurs.
 * @returns {Function} A chainable function to add tasks.
 */
function sequentialTaskRunner (finalCallback) {
  var taskQueue = [];
  var executionContext = this; // Preserve context if needed

  /**
   * Executes the next task in the queue.
   * If the queue is empty, calls the final callback.
   */
  function executeNextTask () {
    var currentTask = taskQueue.shift();
    if (!currentTask) {
      if (typeof finalCallback === 'function') {
        return finalCallback(); // All tasks completed
      } else {
        console.error('Sequential task runner finished, but no valid final callback provided.');
        return;
      }
    }
    try {
      // Apply the function with its arguments and an intermediate callback
      currentTask[0].apply(executionContext, currentTask[1]);
      console.debug('Executing task:', currentTask[0].name || 'anonymous function');
    } catch (taskExecutionError) {
      console.error('Error during task execution:', taskExecutionError.message);
      finalCallback(taskExecutionError); // Pass error to final callback
    }
  }

  /**
   * Adds a new asynchronous function to the task queue.
   * @param {Function} asyncFunction - The function to execute.
   * @param {Array} [functionArgs=[]] - Arguments to pass to the function (excluding the callback).
   * @param {Function} [successHandler] - An optional handler for successful results from asyncFunction.
   * @returns {Function} The chain builder itself, allowing further chaining.
   */
  return function chainBuilder (asyncFunction, functionArgs, successHandler) {
    if (arguments.length === 0) { // If called with no arguments, start execution
      return executeNextTask();
    }

    // Add the step to the queue
    taskQueue.push
      ( [ asyncFunction
        , (functionArgs || []).concat([ function (stepError) {
            if (stepError) {
              console.error('Step encountered an error:', stepError.message);
              return finalCallback(stepError); // Pass error up the chain
            }
            var actualArgs = Array.prototype.slice.call(arguments, 1); // Get args passed from asyncFunction after error
            try {
              successHandler && successHandler.apply(executionContext, actualArgs);
            } catch (handlerError) {
              console.error('Error in success handler:', handlerError.message);
              return finalCallback(handlerError);
            }
            executeNextTask(); // Proceed to the next task
          }])
        ]
      );
    return chainBuilder; // Allow chaining
  }
}

console.log("\n\
  _/_/_/_/    _/_/_/   _/_/_/  _/_/_/_/ _/_/_/_/ _/_/_/  \n\
 _/        _/    _/ _/        _/       _/       _/   _/ \n\
 _/  _/_/ _/    _/ _/  _/_/   _/_/_/   _/_/_/   _/_/_/   \n\
 _/    _/ _/    _/ _/    _/   _/       _/       _/  _/  \n\
_/_/_/_/    _/_/_/   _/_/_/  _/_/_/_/ _/_/_/_/ _/    _/ \n\
                                                          \n\
"); // New ASCII art for SecurePress

startSetupProcess(function(finalError){
  if (finalError) {
    console.error('\n!!! SecurePress Setup Failed !!!');
    console.error('Reason:', finalError.message);
    process.exit(1); // Exit with error code
  } else {
    console.log('\n--- SecurePress Setup Completed Successfully ---');
    process.exit(0); // Exit successfully
  }
});