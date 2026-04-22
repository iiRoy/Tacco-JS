/* This is a self-executing anonymous function, also known as an IIFE (Immediately Invoked Function Expression). */
( function ( ) {

  // The main test suite for jQuery.responsiveMenu plugin.
  describe ( "jQuery.responsiveMenu" , function ( ) {

    // Setup that runs before each test spec within this describe block.
    beforeEach ( function ( ) {

      // Declare a variable for a dummy DOM element.
      var dummyDiv ;

      // Load HTML fixtures for testing.
      loadFixtures ( "oneLevelMenu.html" ) ;

      // Select the menu element from the loaded fixture.
      this.one = $( "#one-level-menu" ) ;

      // Create a new dummy div element for appending.
      dummyDiv = $( '<div id="dummy"></div>' ) ;

      // Append the dummy div to the document body.
      dummyDiv.appendTo ( "body" ) ;

      // Define options for the responsive menu plugin.
      this.options = {
        switchWidth : 555 , // The width at which the menu switches to responsive mode.
        appendTo    : "#dummy" // The element to which the responsive menu should be appended.
      } ;

      // Teardown that runs after each test spec within this describe block.
      afterEach ( function ( ) {

        // Remove the dummy div to clean up the DOM after each test.
        return $( "#dummy" ).remove ( ) ;
      } ) ;

      // Add custom Jasmine matchers for HTML structure comparison.
      return this.addMatchers ( {
        // Custom matcher to compare HTML strings, ignoring dynamic style attributes.
        toBeHtmlStuctureEqual : function ( expected ) {

          // Inner function to remove dynamically added style attributes which can vary.
          var removeGarbage ;

          removeGarbage = function ( html ) {
            // Remove various forms of display style attributes that jQuery might add.
            html = html.split ( ' style="display:none;"' ).join ( '' ) ;
            html = html.split ( ' style="display:block;"' ).join ( '' ) ;
            html = html.split ( ' style="display: none;"' ).join ( '' ) ;
            html = html.split ( ' style="display: block;"' ).join ( '' ) ;
            // Return the cleaned HTML string.
            return html ;
          } ;

          // Compare the cleaned actual HTML with the expected HTML.
          return removeGarbage ( this.actual ) === expected ;
        }
      } ) ;
    } ) ;


    // Nested describe block for plugin options behavior.
    describe ( "plugin options behavior" , function ( ) {

      // Test spec: check if the plugin is available on the jQuery object.
      it ( "should be available on the jQuery object" , function ( ) {

        return expect ( $.fn.responsiveMenu ).toBeDefined ( ) ;
      } ) ;

      // Test spec: check if the plugin methods are chainable, returning the jQuery object.
      it ( "should be chainable" , function ( ) {

        // Calling responsiveMenu should return the original jQuery object itself.
        return expect ( this.one.responsiveMenu ( ) ).toBe ( this.one ) ;
      } ) ;

      // Test spec: verify that the plugin offers default values.
      it ( "should offer default values" , function ( ) {

        var plugin ; // Variable to hold the plugin instance.
        // Initialize the plugin and get its data.
        plugin = this.one.responsiveMenu ( ).data ( "responsiveMenu" ) ;
        // Expect default values to be defined within the plugin instance.
        return expect ( plugin.defaults ).toBeDefined ( ) ;
      } ) ;

      // Test spec: ensure custom options overwrite default values.
      return it ( "should overwrite the defaults" , function ( ) {

        var options , plugin ; // Variables for custom options and the plugin instance.

        // Define a set of custom options to test the overwriting functionality.
        options = {
          switchWidth        : 555 ,
          currentClass       : "this-is" ,
          appendTo           : "#here" ,
          visualTab          : "+" ,
          manualMediaQueries : true ,
          label              : "Label"
        } ;

        // Initialize the plugin with the custom options.
        plugin = this.one.responsiveMenu ( options ).data ( "responsiveMenu" ) ;

        // Assert that each custom option has been applied correctly to the plugin's internal options.
        expect ( plugin.options.switchWidth ).toBe ( options.switchWidth ) ;
        expect ( plugin.options.currentClass ).toBe ( options.currentClass ) ;
        expect ( plugin.options.appendTo ).toBe ( options.appendTo ) ;
        expect ( plugin.options.visualTab ).toBe ( options.visualTab ) ;
        expect ( plugin.options.manualMediaQueries ).toBe ( options.manualMediaQueries ) ;
        return expect ( plugin.options.label ).toBe ( options.label ) ;
      } ) ;
    } ) ;


    // Nested describe block for manualMediaQueries option behavior.
    describe ( "manualMediaQueries" , function ( ) {

      // Sub-describe block: behavior when manualMediaQueries is set to false (this is the default).
      describe ( "when it is set to false" , function ( ) {

        // Setup before each spec in this block.
        beforeEach ( function ( ) {
          // Initialize the plugin with default options (manualMediaQueries: false implicitly).
          return this.plugin = this.one.responsiveMenu ( this.options ).data ( "responsiveMenu" ) ;
        } ) ;

        // Test spec: onResize method should be triggered when the window is resized.
        it ( "should trigger onResize method" , function ( ) {

          spyOn ( this.plugin , 'onResize' ) ; // Spy on the onResize method to track calls.
          $( window ).trigger ( 'resize' ) ; // Manually trigger a 'resize' event on the window.
          // Expect onResize to have been called by the plugin's event listener.
          return expect ( this.plugin.onResize ).toHaveBeenCalled ( ) ;
        } ) ;

        // Test spec: behavior when window width is wider than the defined switchWidth.
        it ( "should hide select menu and show actual menu when window width is wider than switchWidth" , function ( ) {

          var fakeEvent ; // Create a fake event object to simulate window width.
          fakeEvent = {
            width : function ( ) {
              return 600 ; // Simulate a window width of 600px, which is > 555 (switchWidth).
            }
          } ;
          this.plugin.onResize ( fakeEvent ) ; // Call onResize with the fake event.
          expect ( this.one ).toBeVisible ( ) ; // Expect the original menu to be visible.
          return expect ( $( '#dummy select' ) ).toBeHidden ( ) ; // Expect the generated select menu to be hidden.
        } ) ;

        // Test spec: behavior when window width is narrower than the defined switchWidth.
        return it ( "should show select menu and hide an actual menu when window width is narrower than switchWidth" , function ( ) {

          var fakeEvent ; // Create another fake event object.
          fakeEvent = {
            width : function ( ) {
              return 500 ; // Simulate a window width of 500px, which is < 555 (switchWidth).
            }
          } ;
          this.plugin.onResize ( fakeEvent ) ; // Call onResize with the fake event.
          expect ( this.one ).toBeHidden ( ) ; // Expect the original menu to be hidden.
          return expect ( $( '#dummy select' ) ).toBeVisible ( ) ; // Expect the generated select menu to be visible.
        } ) ;
      } ) ;

      // Sub-describe block: behavior when manualMediaQueries is set to true.
      return describe ( "when it is set to true" , function ( ) {

        // Setup before each spec in this block.
        beforeEach ( function ( ) {

          var options ; // Declare options variable.
          // Define options with manualMediaQueries explicitly set to true.
          options = {
            appendTo           : "#dummy" ,
            manualMediaQueries : true
          } ;
          // Initialize the plugin with these specific options.
          return this.plugin = this.one.responsiveMenu ( options ).data ( "responsiveMenu" ) ;
        } ) ;

        // Test spec: onResize method should NOT be triggered when manualMediaQueries is true.
        return it ( "shouldn't change visibility of menus" , function ( ) {

          spyOn ( this.plugin , 'onResize' ) ; // Spy on the onResize method.
          $( window ).trigger ( 'resize' ) ; // Trigger a resize event (should be ignored by plugin).
          // Expect onResize NOT to have been called because manualMediaQueries is true.
          return expect ( this.plugin.onResize ).not.toHaveBeenCalled ( ) ;
        } ) ;
      } ) ;
    } ) ;


    // Nested describe block for testing with a one-level menu structure.
    describe ( "with one level menu" , function ( ) {

      // Test spec: verify correct HTML tree generation for a simple one-level menu.
      it ( "should generate correct html tree" , function ( ) {

        var a , generatedHtml , shouldBeGenerated ; // Declare variables for plugin instance, generated HTML, and expected HTML.

        // Define the expected HTML string for the generated select menu.
        shouldBeGenerated = '<select class="responsive-select-menu">' +
                            '<option value="#one">One</option>' +
                            '<option value="#two">Two</option>' +
                            '<option value="#three">Three</option>' +
                            '<option value="#four">Four</option></select>' ;

        // Initialize the plugin and get its instance.
        a = this.one.responsiveMenu ( this.options ).data ( "responsiveMenu" ) ;
        // Get the HTML of the generated select menu's parent (which contains the select element).
        generatedHtml = a.select.parent ( ).html ( ) ;
        // Compare the generated HTML with the expected HTML using the custom matcher.
        return expect ( generatedHtml ).toBeHtmlStuctureEqual ( shouldBeGenerated ) ;
      } ) ;

      // Test spec: verify that the current page item is correctly selected in the generated menu.
      return it ( "should set a selected on current page item" , function ( ) {

        var generatedHtml , shouldBeGenerated ; // Declare variables.

        // Load a different fixture which includes a 'current' item.
        loadFixtures ( 'oneLevelMenuWithCurrent.html' ) ;
        this.withCurrent = $( '#one-level-menu-with-current' ) ; // Select the new menu element.

        // Define the expected HTML, specifically with the 'Two' option marked as selected.
        shouldBeGenerated = '<select class="responsive-select-menu">' +
                            '<option value="#one">One</option>' +
                            '<option value="#two" selected="selected">Two</option>' +
                            '<option value="#three">Three</option>' +
                            '<option value="#four">Four</option></select>' ;

        // Initialize the plugin on the new menu and retrieve the generated HTML.
        generatedHtml = this.withCurrent.responsiveMenu ( this.options ).data ( "responsiveMenu" ).select.parent ( ).html ( ) ;
        // Compare the generated HTML with the expected HTML.
        return expect ( generatedHtml ).toBeHtmlStuctureEqual ( shouldBeGenerated ) ;
      } ) ;
    } ) ;


    // Nested describe block for testing with a multi-level menu structure.
    describe ( "with multi-level menu" , function ( ) {

      // Setup before each spec in this block.
      beforeEach ( function ( ) {

        loadFixtures ( "multiLevelMenu.html" ) ; // Load fixture for a standard multi-level menu.
        this.multi = $( "#multi-level-menu" ) ; // Select the multi-level menu element.
        loadFixtures ( "multiLevelMenuWithCurrent.html" ) ; // Load fixture for a multi-level menu with a current item.
        return this.multiWithCurrent = $( "#multi-level-with-current-menu" ) ; // Select the multi-level menu with current item.
      } ) ;

      // Test spec: verify correct HTML tree generation for a multi-level menu.
      it ( "should generate corrent html tree" , function ( ) {

        var generatedHtml , shouldBeGenerated ; // Declare variables.

        // Define the expected HTML structure for the multi-level select menu,
        // including indentation prefixes for sub-levels.
        shouldBeGenerated = '<select class="responsive-select-menu">' +
                            '<option value="#one">One</option>' +
                            '<option value="#two">Two</option>' +
                            '<option value="#sub-one">-- Sub-one</option>' +
                            '<option value="#sub-sub-one">---- Sub-Sub-one</option>' +
                            '<option value="#sub-sub-two">---- Sub-Sub-two</option>' +
                            '<option value="#sub-two">-- Sub-two</option>' +
                            '<option value="#three">Three</option>' +
                            '<option value="#four">Four</option>' +
                            '</select>' ;

        // Initialize the plugin and retrieve the generated HTML.
        generatedHtml = this.multi.responsiveMenu ( this.options ).data ( "responsiveMenu" ).select.parent ( ).html ( ) ;
        // Compare the generated HTML with the expected HTML.
        return expect ( generatedHtml ).toBeHtmlStuctureEqual ( shouldBeGenerated ) ;
      } ) ;

      // Test spec: verify correct selection of current page item in a multi-level menu.
      return it ( "should correctly set in select menu current page item on multilevel menu" , function ( ) {

        var generatedHtml , shouldBeGenerated ; // Declare variables.

        // Define the expected HTML structure with 'Sub-Sub-two' option marked as selected.
        shouldBeGenerated = '<select class="responsive-select-menu">' +
                            '<option value="#one">One</option>' +
                            '<option value="#two">Two</option>' +
                            '<option value="#sub-one">-- Sub-one</option>' +
                            '<option value="#sub-sub-one">---- Sub-Sub-one</option>' +
                            '<option value="#sub-sub-two" selected="selected">---- Sub-Sub-two</option>' +
                            '<option value="#sub-two">-- Sub-two</option>' +
                            '<option value="#three">Three</option>' +
                            '<option value="#four">Four</option>' +
                            '</select>' ;

        // Initialize the plugin on the menu with a current item and retrieve its generated HTML.
        generatedHtml = this.multiWithCurrent.responsiveMenu ( this.options ).data ( "responsiveMenu" ).select.parent ( ).html ( ) ;
        // Compare the generated HTML with the expected HTML.
        return expect ( generatedHtml ).toBeHtmlStuctureEqual ( shouldBeGenerated ) ;
      } ) ;
    } ) ;


    // Nested describe block for testing the 'label' option.
    return describe ( "with label set" , function ( ) {

      // Test spec: verify that a custom label is rendered as the first option in the select menu.
      return it ( "should render select with label" , function ( ) {

        var a , generatedHtml , options , shouldBeGenerated ; // Declare variables.

        // Define options including a custom label for the responsive menu.
        options = {
          switchWidth : 555 ,
          appendTo    : "#dummy" ,
          label       : "Menu"
        } ;

        // Define the expected HTML structure with the 'Menu' label as the first option,
        // typically linking to a non-redirecting value.
        shouldBeGenerated = '<select class="responsive-select-menu">' +
                            '<option value="#no-redirect">Menu</option>' +
                            '<option value="#one">One</option>' +
                            '<option value="#two">Two</option>' +
                            '<option value="#three">Three</option>' +
                            '<option value="#four">Four</option></select>' ;

        // Initialize the plugin with the label option.
        a = this.one.responsiveMenu ( options ).data ( "responsiveMenu" ) ;
        // Get the HTML of the generated select menu.
        generatedHtml = a.select.parent ( ).html ( ) ;
        // Compare the generated HTML with the expected HTML.
        return expect ( generatedHtml ).toBeHtmlStuctureEqual ( shouldBeGenerated ) ;
      } ) ;
    } ) ;
  } ) ;

} ) .call ( this ) ;