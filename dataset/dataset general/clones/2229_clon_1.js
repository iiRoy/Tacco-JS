$(     function      (      )       {

    /*
     * This block contains QUnit tests for the 'contextmenus' functionality.
     * It ensures the various features of the context menu plugin work as expected.
     */

    // Initialize a new QUnit test module named 'contextmenus'.
    module(  'contextmenus'  ) ;

    // Test case: Verify that the 'contextmenu' method is indeed defined on jQuery objects.
    test(    'contextmenu defined on jquery object'   ,    function    (    )     {
        // Assert that the 'contextmenu' property exists on a jQuery-wrapped document body element.
        ok(   $(   document.body   ).contextmenu  ,  'contextmenu method is defined'   ) ;
    }   ) ;

    // Test case: Check if the 'contextmenu()' method returns the jQuery element it was called on.
    test(  'returns element'   ,  function   (   )    {
        // Declare a variable 'el' and assign it a new jQuery div element.
        var     el     =     $('<div />') ;
        // Assert that the first DOM element of the returned jQuery object is strictly equal
        // to the first DOM element of the original 'el' jQuery object.
        ok(   el.contextmenu(  )[0]  ===  el[0]  ,  'same element returned'   ) ;
    }  ) ;

    /*
     * Test case: Ensure that the context menu does NOT open when its parent element has the 'disabled' attribute.
     * This verifies the disabled state handling for HTML attributes.
     */
    test(    'should not open context-menu if context is disabled via element disabled attribute'   ,   function    (    )     {
        // Define a multi-line string containing the HTML structure for the context menu.
        // The main div has a 'disabled' attribute.
        var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu" disabled>'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '   <ul>'    + // Note: This <ul> closing tag is intentionally malformed in the original.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Create a jQuery object from the HTML, find the context-toggling element,
            // initialize contextmenu, and then trigger the 'contextmenu' event.
            contextmenu    =    $(   contextHTML   ).find(   '[data-toggle="context"]'   ).contextmenu(   ).trigger(   'contextmenu'   ) ;

        // Assert that the context menu element does NOT have the 'open' class.
        // This confirms it did not open.
        ok(    !contextmenu.find(   '#context-menu'   ).hasClass(   'open'   )   ,   'open class added on contextmenu'    ) ;
    }   ) ;

    /*
     * Test case: Verify that the context menu does NOT open if its parent element has the 'disabled' class.
     * This checks for handling of disabled states via CSS classes.
     */
    test(   'should not open context-menu if context is disabled via element disabled class'  ,  function   (   )    {
        // Similar HTML structure, but with 'class="disabled"' instead of 'disabled' attribute.
        var     contextHTML     =     '<div>'     +
                '<div id="main" data-toggle="context" data-target="#context-menu" class="disabled">'     +
                '  <div id="context-menu">'     +
                '    <ul class="dropdown-menu">'     +
                '      <li><a href="#">Action</a></li>'     +
                '      <li><a href="#">Something else here</a></li>'     +
                '      <li class="divider"></li>'     +
                '      <li><a href="#">Another link</a></li>'     +
                '   <ul>'     + // Malformed <ul> closing tag from original.
                '  </div>'     +
                '</div>'     +
                '</div>'     ,
            // Process the HTML and trigger the contextmenu event.
            contextmenu     =     $(   contextHTML   ).find(   '[data-toggle="context"]'   ).contextmenu(   ).trigger(   'contextmenu'   ) ;

        // Assert that the context menu element does NOT have the 'open' class.
        ok(   !contextmenu.find(   '#context-menu'   ).hasClass(   'open'   )   ,   'open class added on contextmenu'   ) ;
    }   ) ;

    // Test case: Confirm that the 'open' class is added to the menu when the context element is right-clicked.
    test(   'should add class open to menu if context is right clicked'   ,   function    (    )     {
        // HTML structure for a standard, enabled context menu.
        var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu">'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag from original.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Initialize and trigger the contextmenu.
            contextmenu    =    $(   contextHTML   ).find(   '[data-toggle="context"]'   ).contextmenu(   ).trigger(   'contextmenu'   ) ;

        // Assert that the context menu element DOES have the 'open' class.
        ok(   contextmenu.find(   '#context-menu'   ).hasClass(   'open'   )   ,   'open class added on contextmenu'   ) ;
    }   ) ;

    // Test case: Verify that clicking anywhere on the document body removes the 'open' class from the context menu.
    test(   'should remove open class if body/document is clicked'   ,   function    (    )     {
        // HTML for a single context menu.
        var     contextHTML     =     '<div>'     +
                '<div id="main" data-toggle="context" data-target="#context-menu">'     +
                '  <div id="context-menu">'     +
                '    <ul class="dropdown-menu">'     +
                '      <li><a href="#">Action</a></li>'     +
                '      <li><a href="#">Something else here</a></li>'     +
                '      <li class="divider"></li>'     +
                '      <li><a href="#">Another link</a></li>'     +
                '    <ul>'     + // Malformed <ul> closing tag.
                '  </div>'     +
                '</div>'     +
                '</div>'     ,
            // Append the HTML to the QUnit fixture, find the context trigger,
            // initialize the contextmenu, and open it.
            contextmenu     =     $(   contextHTML   )
                .appendTo(   '#qunit-fixture'   )
                .find(   '[data-toggle="context"]'   )
                .contextmenu(   )
                .trigger(   'contextmenu'   ) ;

        // First assertion: The menu should be open after right-click.
        ok(   contextmenu.find(   '#context-menu'   ).hasClass(   'open'   )   ,   'open class added on right click'   ) ;
        // Simulate a click on the document body.
        $(   'body'   ).click(   ) ;
        // Second assertion: The menu should now be closed.
        ok(   !contextmenu.find(   '#context-menu'   ).hasClass(   'open'   )   ,   'open class removed'   ) ;
        // Clean up the DOM by removing the test contextmenu.
        contextmenu.remove(   ) ;
    }   ) ;

    /*
     * Test case: Ensure that clicking the body closes ALL open context menus,
     * especially when multiple context menus are present.
     */
    test(   'should remove open class if body is right clicked with multiple contextmenus'   ,   function    (    )     {
        // HTML containing two distinct context menu triggers and their respective menus.
        var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu">'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '<div data-toggle="context" data-target="#context-menu2">'    +
                '  <div id="context-menu2">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Append to fixture, get all context menu triggers, and separate them.
            contextmenus    =    $(   contextHTML   ).appendTo(   '#qunit-fixture'   ).find(   '[data-toggle="context"]'   )  ,
            first    =    contextmenus.first(   )  ,
            last    =    contextmenus.last(   ) ;

        // Initial assertion: Confirm two context menus were found.
        ok(   contextmenus.length   ===   2   ,   'Should be two contextmenus'   ) ;

        // Scenario 1: Open the first context menu and then close it with a body click.
        // Trigger right-click on the first context menu.
        first.trigger(   'contextmenu'   ) ;
        // Assert the first menu is open.
        ok(   first.find(   '#context-menu.open'   ).length   ===   1   ,   'open class added to first on right click'   ) ;
        // Assert only one menu is open in total.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   1   ,   'only one menu is open'   ) ;
        // Simulate body click.
        $(   'body'   ).click(   ) ;
        // Assert all menus are closed.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   0   ,   'open class removed'   ) ;

        // Scenario 2: Open the last context menu and then close it with a body click.
        // Trigger right-click on the last context menu.
        last.trigger(   'contextmenu'   ) ;
        // Assert the last menu is open.
        ok(   last.find(   '#context-menu2.open'   ).length   ===   1   ,   'open class added to last on right click'   ) ;
        // Assert only one menu is open in total.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   1   ,   'only one menu is open'   ) ;
        // Simulate body click.
        $(   'body'   ).click(   ) ;
        // Assert all menus are closed.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   0   ,   'open class removed'   ) ;

        // Scenario 3: Open both context menus and then close them with a body click.
        // Open both menus.
        first.trigger(   'contextmenu'   ) ;
        last.trigger(   'contextmenu'   ) ;
        // Assert both menus are open.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   2   ,   'two menus is open'   ) ;
        // Simulate body click.
        $(   'body'   ).click(   ) ;
        // Assert both menus are closed.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   0   ,   'both menus is closed'   ) ;

        // Clear the QUnit fixture's HTML content after the test.
        $(   '#qunit-fixture'   ).html(   ) ;
    }   ) ;

    /*
     * Test case: When multiple context menus are open, clicking an item in one menu
     * should close only that specific menu, not all of them.
     */
    test(   'should not remove open class from other context menus if menu item is clicked'   ,   function    (    )     {
                // HTML for two context menus, identical to the previous test.
                var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu">'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '<div data-toggle="context" data-target="#context-menu2">'    +
                '  <div id="context-menu2">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Setup context menus, first and last references.
            contextmenus    =    $(   contextHTML   ).appendTo(   '#qunit-fixture'   ).find(   '[data-toggle="context"]'   )  ,
            first    =    contextmenus.first(   )  ,
            last    =    contextmenus.last(   ) ;

        // Initial assertion: Verify two context menus exist.
        ok(   contextmenus.length   ===   2   ,   'Should be two contextmenus'   ) ;
        // Open both context menus.
        first.trigger(   'contextmenu'   ) ;
        last.trigger(   'contextmenu'   ) ;
        // Assert that both menus are currently open.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   2   ,   'opened two contextmenus'   ) ;

        // Click the first item in the *first* context menu.
        first.find(   'ul > li:first a'   ).click(   ) ;
        // Assert that only one context menu remains open.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   1   ,   'only one contextmenu'   ) ;

        // Click the first item in the *last* context menu.
        last.find(   'ul > li:first a'   ).click(   ) ;
        // Assert that all context menus are now closed.
        ok(   $(   '#qunit-fixture .open'   ).length   ===   0   ,   'contextmenus closed'   ) ;

        // Clear the QUnit fixture's HTML content.
        $(   '#qunit-fixture'   ).html(   ) ;
    }   ) ;

    // Test case: Confirm that the 'before' callback function is invoked when the context menu is opened.
    test(   'calls before callback'   ,   function    (    )     {
        // HTML for a single context menu.
        var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu">'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Counter for callback invocations.
            calls    =    0    ,
            // Define the 'before' callback function.
            before    =    function    (    )     {
                calls++ ; // Increment the counter when called.
            }    ,
            // Initialize the contextmenu with the 'before' callback and trigger it.
            contextmenu    =    $(   contextHTML   )
                .find(   '[data-toggle="context"]'   )
                .contextmenu(   {
                    'before'    :    before // Pass the 'before' function as an option.
                }   ).trigger(   'contextmenu'   ) ;

        // Assert that the 'before' callback was called exactly once.
        ok(   calls   ===   1   ,   'called before callback'   ) ;
        // Clean up.
        contextmenu.remove(   ) ;
    }   ) ;

    // Test case: Verify that the 'onItem' callback is triggered when a menu item is clicked.
    test(   'calls onItem callback if an menu item is clicked'   ,   function    (    )     {
        // HTML for a single context menu.
        var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu">'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Counter for callback invocations.
            calls    =    0    ,
            // Define the 'onItem' callback function.
            onItem    =    function    (    )     {
                calls++ ; // Increment the counter when called.
            }    ,
            // Initialize the contextmenu with the 'onItem' callback and open it.
            contextmenu    =    $(   contextHTML   )
                .find(   '[data-toggle="context"]'   )
                .contextmenu(   {
                    'onItem'    :    onItem // Pass the 'onItem' function as an option.
                }   )
                .trigger(   'contextmenu'   ) ;

        // Simulate a click on the first menu item's anchor tag.
        contextmenu.find(   'ul > li:first a'   ).click(   ) ;
        // Assert that the 'onItem' callback was called exactly once.
        ok(   calls   ===   1   ,   'called onItem callback'   ) ;
        // Clean up.
        contextmenu.remove(   ) ;
    }   ) ;

    /*
     * Test case: Verify that the custom 'show.bs.context' and 'hide.bs.context' events are fired
     * at the appropriate times. This test uses QUnit's async methods.
     */
    test(   'should fire show and hide event'   ,   function    (    )     {
        // HTML for a single context menu.
        var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu">'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Append to fixture, find trigger, initialize contextmenu.
            contextmenu    =    $(   contextHTML   )
                .appendTo(   '#qunit-fixture'   )
                .find(   '[data-toggle="context"]'   )
                .contextmenu(   ) ;

        // Inform QUnit that this test is asynchronous.
        stop(   ) ;

        // Attach event handlers to the context menu element.
        contextmenu
            .find(   '#context-menu'   )
            .on(   'show.bs.context'   ,   function    (    )     {
                // Assertion for 'show' event.
                ok(   true   ,   'show was called'   ) ;
            }   )
            .on(   'hide.bs.context'   ,   function    (    )     {
                // Assertion for 'hide' event.
                ok(   true   ,   'hide was called'   ) ;
                // Resume QUnit testing after 'hide' event.
                start(   ) ;
            }   ) ;

        // Trigger the context menu to open.
        contextmenu.trigger(   'contextmenu'   ) ;
        // Simulate a click on the document body to close the menu.
        $(   document.body   ).click(   ) ;
    }   ) ;

    /*
     * Test case: Verify that the custom 'shown.bs.context' and 'hidden.bs.context' events are fired
     * after the menu has fully opened or closed. This also uses QUnit's async methods.
     */
    test(   'should fire shown and hidden event'   ,   function    (    )     {
        // HTML for a single context menu.
        var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu">'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Append to fixture, find trigger, initialize contextmenu.
            contextmenu    =    $(   contextHTML   )
                .appendTo(   '#qunit-fixture'   )
                .find(   '[data-toggle="context"]'   )
                .contextmenu(   ) ;

        // Inform QUnit that this test is asynchronous.
        stop(   ) ;

        // Attach event handlers to the context menu element.
        contextmenu
            .find(   '#context-menu'   )
            .on(   'shown.bs.context'   ,   function    (    )     {
                // Assertion for 'shown' event.
                ok(   true   ,   'shown was called'   ) ;
            }   )
            .on(   'hidden.bs.context'   ,   function    (    )     {
                // Assertion for 'hidden' event.
                ok(   true   ,   'hidden was called'   ) ;
                // Resume QUnit testing after 'hidden' event.
                start(   ) ;
            }   ) ;

        // Trigger the context menu to open.
        contextmenu.trigger(   'contextmenu'   ) ;
        // Simulate a click on the document body to close the menu.
        $(   document.body   ).click(   ) ;
    }   ) ;

    /*
     * Test case: Ensure that pressing the Escape key on the keyboard closes an open context menu.
     * This tests keyboard accessibility for closing the menu.
     */
    test(   'should remove open class if keyboard escape key is pressed'   ,   function    (    )     {
        // HTML for a single context menu.
        var    contextHTML    =    '<div>'    +
                '<div id="main" data-toggle="context" data-target="#context-menu">'    +
                '  <div id="context-menu">'    +
                '    <ul class="dropdown-menu">'    +
                '      <li><a href="#">Action</a></li>'    +
                '      <li><a href="#">Something else here</a></li>'    +
                '      <li class="divider"></li>'    +
                '      <li><a href="#">Another link</a></li>'    +
                '    <ul>'    + // Malformed <ul> closing tag.
                '  </div>'    +
                '</div>'    +
                '</div>'     ,
            // Append to fixture, find trigger, initialize contextmenu, and open it.
            contextmenu    =    $(   contextHTML   )
                .appendTo(   '#qunit-fixture'   )
                .find(   '[data-toggle="context"]'   )
                .contextmenu(   )
                .trigger(   'contextmenu'   ) ;

        // First assertion: The menu should be open after right-click.
        ok(   contextmenu.find(   '#context-menu'   ).hasClass(   'open'   )   ,   'open class added on right click'   ) ;
        // Simulate a 'keydown' event for the Escape key (which: 27) on the document body.
        $(   'body'   ).trigger(   $.Event(   'keydown'   ,   {   which   :   27   }   )   ) ;
        // Second assertion: The menu should now be closed.
        ok(   !contextmenu.find(   '#context-menu'   ).hasClass(   'open'   )   ,   'open class removed'   ) ;
        // Clean up the DOM.
        contextmenu.remove(   ) ;
    }   ) ;
}   ) ; // End of the main document ready function wrapper.