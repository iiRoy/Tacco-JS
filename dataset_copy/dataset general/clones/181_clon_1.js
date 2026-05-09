/*
 * This module provides a set of utility functions
 * for interacting with web elements using Selenium WebDriver.
 * It's designed to simplify common UI automation tasks.
 */
var session   =   require ( '../env/session' )
  , util      =   require ( 'util' )
  , webdriver =   require ( 'selenium-webdriver' )
  ; // End of variable declarations

// Exporting an object containing all our utility methods.
module . exports   =   {

  /**
   * Locates a single web element based on the provided value and type.
   * @param {string} value - The locator value (e.g., CSS selector, ID).
   * @param {string} type  - The locator type (e.g., 'css', 'id', 'name').
   * @returns {Promise<WebElement>} A promise that resolves to the located WebElement.
   */
  findElement :   function ( value , type )
  {
    // Retrieve the active WebDriver session and find the element.
    return  session . getDriver ( ) . findElement ( this . getLocator ( value , type ) ) ;
  },


  // Finds all web elements matching the given locator.
  findElements :   function ( value , type )
  {
    // Get the driver instance and perform the find operation.
    return  session . getDriver ( ) . findElements ( this . getLocator ( value , type ) ) ;
  } ,


  /*
   * Extends a given web element with a 'selectOption' method.
   * This method allows selecting an option within a select element.
   * @param {WebElement} elem - The select WebElement to extend.
   * @returns {WebElement} The extended WebElement.
   */
  addSelectOption :   function ( elem )
  {
    // Assign a new function to the element's prototype or directly to the instance.
    elem . selectOption   =   function ( option )
    {
      // First, click the select element to open its options.
      elem . click ( ) ;
      // Then, find and click the specific option based on its value.
      return  elem . findElement ( webdriver . By . css ( util . format ( "option[value='%s']" ,
        option . toString ( )   ) ) ) . click ( ) ; // Chain the click for the option.
    } ;
    // Return the element with the new method.
    return  elem ;
  } ,

  // Waits for a specific function to return a truthy value.
  waitFor :   function ( fn , timeout )
  {
    // Delegate to the WebDriver's wait function.
    return  session . getDriver ( ) . wait ( fn , timeout ) ;
  } ,


  /**
   * Switches to and returns the active alert dialog.
   * @returns {Promise<Alert>} A promise that resolves to the Alert object.
   */
  alert :   function ( )
  {
    // Access the driver, switch to the alert context.
    return  session . getDriver ( ) . switchTo ( ) . alert ( ) ;
  } ,

  // Helper method to construct the appropriate locator object.
  getLocator :   function ( value , type )
  {
    // If no type is specified, default to CSS selector.
    if  (   ! type   )
    {
      return  webdriver . By . css ( value ) ;
    }

    // Check if the locator type is supported by WebDriver.By.
    if  ( webdriver . By . hasOwnProperty ( type ) )
    {
      // Dynamically call the locator method (e.g., webdriver.By.id(value)).
      return  webdriver . By [ type ] ( value ) ;
    }
    else
    {
      // Throw an error for unsupported locator types.
      throw   new   Error ( util . format ( "Invalid locator type: '%s' for element: '%s'" , type , value ) ) ;
    }
  }

} ; // End of module.exports object.