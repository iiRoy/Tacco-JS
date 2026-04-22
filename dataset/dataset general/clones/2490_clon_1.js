( function ( ) {
  // This immediately invoked function expression (IIFE)
  // encapsulates the entire CSSpec library to prevent global scope pollution.

  // Initialize the main CSSpec object, which will hold all core components.
  var    CSSpec    =    { } ;


  // -------------------------------------------------------------------------
  // CSSpec.Example Class Definition
  // -------------------------------------------------------------------------

  // Define the CSSpec.Example class constructor.
  // This class represents a single test example or "it" block.
  CSSpec . Example = function ( desc , parent , fn ) {
    this . description = desc ; // The textual description of this example.
    this . parent = parent ; // Reference to the parent ExampleGroup.

    // If a parent group exists, register this example with it.
    if ( this . parent )
    {
      this . parent . examples . push ( this ) ;
    }

    this . fn = fn ; // The actual test function to be executed.
  } ; // End of CSSpec.Example constructor.


  // Define methods for the CSSpec.Example prototype.
  CSSpec . Example . prototype = {

    /*
     * Executes this specific example.
     * It sets up a context, runs parent before hooks,
     * logs the example description, executes the example's function,
     * and finally runs parent after hooks.
     */
    run : function ( ) {
      var ctx = { currentExample : this } ; // Create a context object for hooks.

      // Execute before hooks from the parent group, if any.
      if ( this . parent ) {
        this . parent . runBeforeHooks ( ctx ) ;
      }

      // Log the execution of the example to the console.
      console . log ( "Running example: " + this . descriptions ( ) . join ( " " ) ) ;
      this . fn . apply ( ctx ) ; // Execute the example's actual test function.

      // Execute after hooks from the parent group, if any.
      if ( this . parent ) {
        this . parent . runAfterHooks ( ctx ) ;
      }
    } , // End of run method.


    /**
     * Recursively gathers descriptions from this example and its parent groups
     * to form a full descriptive path.
     * @returns {Array<string>} An array of description strings.
     */
    descriptions : function ( ) {
      var descriptions = this . parent ? this . parent . descriptions ( ) : [ ] ;
      descriptions . push ( this . description ) ; // Add this example's description.
      return descriptions ;
    } // End of descriptions method.

  } ; // End of CSSpec.Example.prototype definition.


  // -------------------------------------------------------------------------
  // CSSpec.ExampleGroup Class Definition
  // -------------------------------------------------------------------------

  /*
   * Defines the CSSpec.ExampleGroup class.
   * This class serves as a container for related examples and nested groups,
   * providing structure and shared setup/teardown capabilities.
   */
  CSSpec . ExampleGroup = function ( desc , parent ) {
    this . description = desc ; // Description of this group.
    this . parent = parent ; // Reference to the parent ExampleGroup.

    // If this group has a parent, add itself to the parent's examples.
    if ( this . parent ) {
      this . parent . examples . push ( this ) ;
    }

    this . examples = [ ] ; // Array to hold child examples and nested groups.
    this . beforeHooks = [ ] ; // Hooks to run before each example in this group.
    this . afterHooks = [ ] ; // Hooks to run after each example in this group.

    // Original comment was here: console.log("Created example group: " + this.descriptions());
    // This line was commented out in the original, keeping it that way.
  } ; // Concluding the CSSpec.ExampleGroup constructor definition.


  // Prototype methods for CSSpec.ExampleGroup.
  CSSpec . ExampleGroup . prototype = {

    /*
     * Runs all examples and nested groups contained within this group.
     */
    run : function ( ) {
      var group = this ; // Keep a reference to the current group.

      // Iterate over each example/group and run it.
      $ . each ( this . examples , function ( ) {
        this . run ( ) ; // Polymorphic call: runs example or nested group.
      } ) ;

      // If this is the top-level group, log a success message.
      if ( ! this . parent ) {
        console . log ( "Success!" ) ;
      }
    } , // End of run method for ExampleGroup.


    /**
     * Executes all 'before' hooks registered for this group and its ancestors.
     * @param {object} ctx - The context object for hook execution.
     */
    runBeforeHooks : function ( ctx ) {
      // First, run hooks from parent groups.
      if ( this . parent ) {
        this . parent . runBeforeHooks ( ) ;
      }

      // Then, run hooks specific to this group.
      $ . each ( this . beforeHooks , function ( ) {
        this . apply ( ctx ) ;
      } ) ;
    } , // End of runBeforeHooks.


    /*
     * Executes all 'after' hooks registered for this group and its ancestors.
     * @param {object} ctx - The context object for hook execution.
     */
    runAfterHooks : function ( ctx ) {
      // First, run hooks from parent groups.
      if ( this . parent ) {
        this . parent . runAfterHooks ( ) ;
      }

      // Then, run hooks specific to this group.
      $ . each ( this . afterHooks , function ( ) {
        this . apply ( ctx ) ;
      } ) ;
    } , // End of runAfterHooks.


    // Provides a hierarchical array of descriptions for this group.
    descriptions : function ( ) {
      var descriptions = this . parent ? this . parent . descriptions ( ) : [ ] ;
      descriptions . push ( this . description ) ; // Add this group's description.
      return descriptions ;
    } // End of descriptions method.

  } ; // End of CSSpec.ExampleGroup.prototype.


  // -------------------------------------------------------------------------
  // Matchers functionality
  // -------------------------------------------------------------------------

  /**
   * Constructs a new Matchers object.
   * This object is used to perform assertions on a given value.
   * @param {*} value - The value to be asserted against.
   */
  CSSpec . Matchers = function ( value ) {
    this . value = value ; // Store the value for subsequent assertions.
  } ; // End of CSSpec.Matchers constructor.


  // Prototype methods for CSSpec.Matchers.
  CSSpec . Matchers . prototype = {
    /**
     * Asserts that the matcher's value is strictly equal to the expected value.
     * If the values are not equal, an error is thrown.
     * @param {*} expected - The value that is expected.
     */
    toEqual : function ( expected ) {
      // Perform the comparison. Note: uses loose equality (==).
      if ( ! ( this . value == expected ) )
      {
        // If assertion fails, throw an informative error message.
        throw "Expected " + expected + " but got " + this . value ;
      }
    } // End of toEqual method.
  } ; // End of CSSpec.Matchers.prototype.


  // -------------------------------------------------------------------------
  // Scope management for test definitions
  // -------------------------------------------------------------------------

  /**
   * The CSSpec.Scope class manages the current context for defining tests.
   * It holds the current example group.
   * @param {string} desc - The description for the root example group of this scope.
   */
  CSSpec . Scope = function ( desc ) {
    this . _group = new CSSpec . ExampleGroup ( desc ) ; // Initialize the root example group.
  } ; // End of CSSpec.Scope constructor.


  // Prototype methods for CSSpec.Scope.
  CSSpec . Scope . prototype = {

    /*
     * Defines a new example group (a "describe" block).
     * It temporarily sets the current group to the newly created group
     * to allow nested definitions.
     * @param {string} desc - Description of the new group.
     * @param {function} fn - Function containing nested describe/it calls.
     * @returns {CSSpec.ExampleGroup} The newly created example group.
     */
    describe : function ( desc , fn ) {
      var group = new CSSpec . ExampleGroup ( desc , this . _group ) ; // Create a new child group.
      this . _group = group ; // Set the new group as the current active group.

      // If a definition function is provided, execute it within the context of the new group.
      if ( fn ) {
        fn . apply ( group ) ;
      }

      this . _group = group . parent ; // Restore the previous group as the current active group.
      return group ;
    } , // End of describe method.

    /*
     * Defines a new test example (an "it" block).
     * @param {string} desc - Description of the test example.
     * @param {function} fn - The actual test function.
     * @returns {CSSpec.Example} The newly created example.
     */
    it : function ( desc , fn ) {
      return new CSSpec . Example ( desc , this . _group , fn ) ;
    } , // End of it method.


    /*
     * Creates a new Matchers object for making assertions.
     * @param {*} value - The value to be asserted.
     * @returns {CSSpec.Matchers} A new Matchers instance.
     */
    expect : function ( value ) {
      return new CSSpec . Matchers ( value ) ;
    } , // End of expect method.


    /*
     * Initiates the running of all tests within this scope's root group.
     */
    run : function ( ) {
      this . _group . run ( ) ; // Delegate the run operation to the root example group.
    } // End of run method.

  } ; // End of CSSpec.Scope.prototype.


  // -------------------------------------------------------------------------
  // Global API
  // -------------------------------------------------------------------------

  /**
   * The main entry point for defining a test suite.
   * Creates and returns a new CSSpec.Scope.
   * @param {string} desc - The description for the top-level test suite.
   * @returns {CSSpec.Scope} A new testing scope.
   */
  CSSpec . describe = function ( desc ) {
    return new CSSpec . Scope ( desc ) ;
  } ; // End of global CSSpec.describe function.


  // Expose the CSSpec object globally on the window object.
  window . CSSpec = CSSpec ;

} ) ( ) ; // Conclude the immediately invoked function expression (IIFE).
// End of CSSpec module.