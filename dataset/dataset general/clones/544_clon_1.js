TestSettingsManager = new TestCase ( "Settings Manager" ) ; /* Initialize the test suite for Settings Manager. */

TestSettingsManager.prototype.setUp = function ( )
{
  // This method is called before each test case runs.
  // Its primary purpose is to ensure a clean state for localStorage.

  localStorage . clear ( ) ; // Erase all data from localStorage to prevent test interference.

} // End of setUp function definition.

TestSettingsManager.prototype.testInitWindows = function ()
{
    // Test case to verify the initialization process for Windows OS.

    var sm = new SettingsManager ( OS_WIN ) ; // Create a new SettingsManager instance for Windows.

    /* Verify that localStorage is initially empty for 'settings' and 'version' keys. */
    assertUndefined ( localStorage [ 'settings' ] ) ;
    assertUndefined ( localStorage [ 'version' ] ) ; // Check for the absence of the version key.


    var good_settings = /* This object defines the expected default settings structure. */
    {
        "actions" : {
            "101" : {
                "mouse"   : 2 ,
                "key"     : 0 ,
                "action"  : "tabs" ,
                "color"   : "#FFA500" ,
                "options" : {
                    "smart"   : 0 ,
                    "ignore"  : [ 0 ] ,
                    "delay"   : 0 ,
                    "close"   : 0 ,
                    "block"   : true ,
                    "reverse" : false ,
                    "end"     : false
                } // End of 'options' object.
            } // End of "101" action.
        } , // End of 'actions' object.
        "blocked" : [ ] // Initially, no blocked items are expected.
    } ; // End of good_settings declaration.


    var settings = sm . init ( ) ; // Initialize the settings; this should populate localStorage.

    // Assertions to validate the state after initialization.
    assertEquals ( '5' , localStorage [ 'version' ] ) ; // The version should be set to '5'.
    assertEquals ( good_settings , settings ) ;           // The returned settings object should match the expected structure.
    assertUndefined ( settings . error ) ;                 // No error should be present in the initialized settings.
}

TestSettingsManager.prototype.testInitLinux = function ( ) {
    // This test ensures proper initialization behavior for Linux-specific settings.

    var sm = new SettingsManager ( OS_LINUX ) ; // Instantiate SettingsManager for Linux.

    assertUndefined ( localStorage [ 'settings' ] ) ; // Confirm 'settings' is not yet in localStorage.
    assertUndefined ( localStorage [ 'version' ] ) ;   // Confirm 'version' is not yet in localStorage.
    assertTrue ( ! sm . isInit ( ) ) ;                 // Before init, manager should report not initialized.

    var good_settings = /* Expected default settings for Linux environment. */
    {
        "actions" : {
            "101" : {
                "mouse" : 0 ,
                "key"   : 16 , /* Specific key binding for Linux. */
                "action" : "tabs" ,
                "color" : "#FFA500" ,
                "options" : {
                    "smart"   : 0 ,
                    "ignore"  : [ 0 ] ,
                    "delay"   : 0 ,
                    "close"   : 0 ,
                    "block"   : true ,
                    "reverse" : false ,
                    "end"     : false
                }
            }
        } ,
        "blocked" : [ ] // No blocked items by default.
    } ; // End of good_settings.

    var settings = sm . init ( ) ; // Perform the initialization.

    assertEquals ( '5' , localStorage [ 'version' ] ) ; // Verify the version string in localStorage.
    assertEquals ( good_settings , settings ) ;           // Compare the returned settings with the expected.
    assertUndefined ( settings . error ) ;                 // Ensure no errors occurred during initialization.
    assertTrue ( sm . isInit ( ) ) ;                     // After init, manager should report as initialized.
}

TestSettingsManager.prototype.testSave = function ( )
{
    // This test verifies the functionality of saving settings to persistent storage.

    var sm = new SettingsManager ( OS_LINUX ) ; // Instantiate SettingsManager.

    var settings = sm . init ( ) ; // First, initialize settings to a default state.

    // Verify initial value before modification.
    assertEquals ( 0 , settings . actions [ 101 ] . options . smart ) ;

    // Modify a setting value.
    settings . actions [ 101 ] . options . smart = 1 ; // Change the 'smart' option for action 101.

    sm . save ( settings ) ; // Persist the modified settings.

    var new_settings = sm . load ( ) ; // Load the settings back from storage.

    // Assert that the loaded settings reflect the change made.
    assertEquals ( 1 , new_settings . actions [ 101 ] . options . smart ) ;
}

TestSettingsManager.prototype.testError = function ( ) {
    // Test case to ensure error handling during settings loading is correct.

    var sm = new SettingsManager ( OS_WIN ) ; // Initialize manager for Windows.

    var good_settings = // Define the expected settings structure when no error occurs.
    {
        "actions" : {
            "101" : {
                "mouse" : 2 ,
                "key" : 0 ,
                "action" : "tabs" ,
                "color" : "#FFA500" ,
                "options" : {
                    "smart" : 0 ,
                    "ignore" : [ 0 ] ,
                    "delay" : 0 ,
                    "close" : 0 ,
                    "block" : true ,
                    "reverse" : false ,
                    "end" : false
                }
            }
        } ,
        "blocked" : [ ]
    } ; // End of good_settings.

    // Simulate an initial load that might cause an error (e.g., malformed data).
    var settings = sm . load ( ) ;
    // Expect an error message indicating a parsing issue.
    assertEquals ( "Error: SyntaxError: Unexpected token u|Data:undefined" , settings . error ) ;
    // Despite the error, some default or last-known good actions might be returned.
    assertEquals ( good_settings . actions , settings . actions ) ;

    /*
     * When loading again after an error, the system should ideally recover
     * and load the default or corrected settings without an error.
     */
    var settings = sm . load ( ) ; // Attempt to load settings again.
    assertUndefined ( settings . error ) ; // The error property should now be undefined.
    assertEquals ( good_settings , settings ) ; // The loaded settings should now match the default.
}

TestSettingsManager.prototype.testUpgradeV3toV5 = function ( )
{
  // Test case for upgrading settings from version 3 to version 5.
  // This involves specific changes to the 'ignore' array format.

  var sm = new SettingsManager ( OS_WIN ) ; // Create a new manager instance.

  var old_settings = /* Define settings structured as they would be in version 3. */
  {
    "101" : {
      "mouse" : 2 ,
      "key" : 0 ,
      "action" : "tabs" ,
      "color" : "#FFA500" ,
      "options" : {
        "smart" : 0 ,
        "ignore" : [ 'here' , 'the' ] , // Old format: strings, no '0' default.
        "delay" : 0 ,
        "close" : 0 ,
        "block" : true ,
        "reverse" : false ,
        "end" : false
      }
    } ,
    "102" : {
      "mouse" : 2 ,
      "key" : 0 ,
      "action" : "tabs" ,
      "color" : "#FFA500" ,
      "options" : {
        "smart" : 0 ,
        "ignore" : [ ] , // Old format: empty array.
        "delay" : 0 ,
        "close" : 0 ,
        "block" : true ,
        "reverse" : false ,
        "end" : false
      }
    }
  } ; // End of old_settings object.

  // Populate localStorage to simulate a v3 installation.
  localStorage [ 'sites' ] = "" ;
  localStorage [ 'settings' ] = JSON . stringify ( old_settings ) ;
  localStorage [ 'version' ] = '3' ; // Explicitly set old version.

  sm . update ( ) ; // Trigger the settings upgrade process.

  var settings = sm . load ( ) ; // Load the upgraded settings.

  // Assertions to verify the upgrade was successful.
  // The 'ignore' array should now contain '0' and any previous strings.
  assertEquals ( JSON . stringify ( [ 0 , 'here' , 'the' ] ) , JSON . stringify ( settings . actions [ "101" ] . options . ignore ) ) ;
  // An empty 'ignore' array should now contain just '0'.
  assertEquals ( JSON . stringify ( [ 0 ] ) , JSON . stringify ( settings . actions [ "102" ] . options . ignore ) ) ;
  assertEquals ( '5' , localStorage [ 'version' ] ) ; // Verify the version has been updated to '5'.
  assertUndefined ( localStorage [ 'sites' ] ) ; // The 'sites' key should have been removed.
  assertUndefined ( JSON . parse ( localStorage [ 'settings' ] ) . error ) ; // Ensure no parsing errors in updated settings.

} ; // Note the explicit semicolon for this method definition.

TestSettingsManager.prototype.testUpgradeV4toV5 = function ( )
{
    // This test verifies the upgrade path from version 4 to version 5 of the settings.

    var sm = new SettingsManager ( OS_WIN ) ; // Initialize SettingsManager for Windows.

    var old_settings = /* Representing settings as they would be stored in version 4. */
    {
        "101" : {
            "mouse" : 2 ,
            "key" : 0 ,
            "action" : "tabs" ,
            "color" : "#FFA500" ,
            "options" : {
                "smart" : 0 ,
                "ignore" : [ 0 , 'here' , 'the' ] , // v4 already includes '0' in ignore.
                "delay" : 0 ,
                "close" : 0 ,
                "block" : true ,
                "reverse" : false ,
                "end" : false
            }
        } ,
        "102" : {
            "mouse" : 2 ,
            "key" : 0 ,
            "action" : "tabs" ,
            "color" : "#FFA500" ,
            "options" : {
                "smart" : 0 ,
                "ignore" : [ 0 ] , // v4 already includes '0' in ignore.
                "delay" : 0 ,
                "close" : 0 ,
                "block" : true ,
                "reverse" : false ,
                "end" : false
            }
        }
    } ; // End of old_settings object literal.

    // Set up localStorage to simulate a v4 environment.
    localStorage [ 'sites' ] = "" ; // This key should be removed during upgrade.
    localStorage [ 'settings' ] = JSON . stringify ( old_settings ) ;
    localStorage [ 'version' ] = '4' ; // Current version is 4.

    sm . update ( ) ; // Execute the update logic.

    var settings = sm . load ( ) ; // Load the settings after the update.

    // Validate the 'ignore' arrays, which should remain unchanged from v4 as they already conform to v5.
    assertEquals ( JSON . stringify ( [ 0 , 'here' , 'the' ] ) , JSON . stringify ( settings . actions [ "101" ] . options . ignore ) ) ;
    assertEquals ( JSON . stringify ( [ 0 ] ) , JSON . stringify ( settings . actions [ "102" ] . options . ignore ) ) ;
    assertEquals ( 0 , settings . blocked . length ) ; // 'blocked' array should be empty after upgrade.
    assertEquals ( '5' , localStorage [ 'version' ] ) ; // The version in localStorage must be '5'.
    assertUndefined ( localStorage [ 'sites' ] ) ; // The 'sites' key should no longer exist.
    assertUndefined ( JSON . parse ( localStorage [ 'settings' ] ) . error ) ; // No errors in the parsed settings.
}