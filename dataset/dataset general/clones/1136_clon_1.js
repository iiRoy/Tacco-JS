var select = require ( 'soupselect' ) .select
  , htmlparser = require ( "htmlparser" )
  , fs = require ( 'fs' )
  , sys = require ( 'sys' )
; /* End of module imports. These modules are essential for parsing HTML,
    interacting with the file system, and debugging. */


// Load the HTML content from a predefined test file synchronously.
var html = fs . readFileSync ( 'testdata/test.html' , 'utf-8' ) ;


/*
 * This function orchestrates the parsing of the global 'html' content
 * and then executes a provided callback with the resulting Document Object Model (DOM).
 *
 * @param {object} test - The test harness object (e.g., from Nodeunit or similar framework).
 * @param {function} callback - A function to be called with the parsed DOM.
 *                              It receives 'dom' as its single argument.
 */
function runTest ( test , callback )
{
    var handler = new htmlparser.DefaultHandler
    (
        function ( err , dom ) // This anonymous function handles the parser's output.
        {
            if ( err ) // Check for any errors during HTML parsing.
            {
                sys . debug ( "Error: " + err ) ; // Log the error using Node's debug utility.
            }
            else // If parsing was successful, proceed with the DOM.
            {
                callback ( dom ) ; // Invoke the provided callback with the generated DOM.
            }
        }
    ) ; // End of DefaultHandler instantiation.


    var parser = new htmlparser . Parser ( handler ) ; // Create a new HTML parser instance, attaching our handler.


    parser . parseComplete ( html ) ; // Start the parsing process for the global 'html' string.
}


/**
 * Compares the IDs of elements selected by a given CSS selector against a list of expected IDs.
 * Both lists of IDs are sorted before comparison to ensure order independence.
 *
 * @param {object} test - The test object from the testing framework.
 * @param {object} dom - The DOM tree to query.
 * @param {string} selector - The CSS selector string.
 * @param {Array<string>} expected_ids - An array of strings, representing the IDs expected to be found.
 */
function assertSelects ( test , dom , selector , expected_ids )
{
    var el_ids = [ ] ; // Initialize an empty array to store IDs of found elements.

    var els = select ( dom , selector ) ; // Use 'soupselect' to find elements matching the selector.


    els . forEach ( function ( el ) // Iterate over each selected element.
    {
        // Check if the element has 'attribs' and if 'id' exists within 'attribs'.
        if ( el . attribs && el . attribs . id )
        {
            el_ids . push ( el . attribs . id ) ; // Add the element's ID to our list.
        }
        else
        {
            el_ids . push ( '' ) ; // If no ID, push an empty string to maintain count/position in some cases.
        }
    } ) ; // End of forEach loop.


    el_ids . sort ( ) ; // Sort the actual IDs found.
    expected_ids . sort ( ) ; // Sort the expected IDs for a reliable comparison.


    // Perform a deep equality check between the sorted expected and actual ID arrays.
    test . deepEqual
    (
        expected_ids ,
        el_ids ,
        "Selector " + selector + ", expected " + sys . inspect ( expected_ids ) + ", got " + sys . inspect ( el_ids )
    ) ;
}


// Helper function to run multiple assertSelects calls for various selectors and expected IDs.
// This simplifies testing scenarios where multiple assertions of the same type are needed.
function assertSelectMultiple ( test , dom , specs )
{
    specs . forEach (
        function ( spec ) // Each 'spec' in the array is itself an array: [selector_string, expected_ids_array].
        {
            assertSelects ( test , dom , spec [ 0 ] , spec [ 1 ] ) ; // Deconstruct and call assertSelects.
        }
    ) ;
}


exports . basicSelectors =
{
    // Test case 1: Selecting a single tag that appears exactly once in the document.
    one_tag_one : function ( test )
    {
        runTest ( test , function ( dom )
        {
            var els = select ( dom , 'title' ) ; // Select all 'title' tags.
            test . equal ( els . length , 1 ) ; // Verify that exactly one title tag was found.
            test . equal ( els [ 0 ] . name , 'title' ) ; // Confirm the tag name is 'title'.
            test . equal ( els [ 0 ] . children [ 0 ] . raw , 'The title' ) ; // Check the raw text content.
        } ) ;
        test . done ( ) ; // Indicate that this test has completed.
    } ,


    // Test case 2: Selecting a tag that appears multiple times in the document.
    one_tag_many : function ( test )
    {
        runTest ( test , function ( dom )
        {
            var els = select ( dom , 'div' ) ; // Select all 'div' tags.
            test . equal ( els . length , 3 ) ; // Expect three 'div' elements.
            els . forEach ( function ( div )
            {
                test . equal ( div . name , 'div' ) ; // Ensure each selected element is indeed a 'div'.
            } ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 3: Selecting a nested tag using descendant selector, expecting one match.
    tag_in_tag_one : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelects ( test , dom , 'div div' , [ 'inner' ] ) ; // Find a 'div' inside another 'div'.
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 4: Selecting multiple nested tags using descendant selector.
    tags_in_tags : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelects ( test , dom , 'span span' , [ 'yx' , 'yy' ] ) ; // Find 'span' inside 'span'.
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 5: Selecting nested tags with multiple parent-child combinations, expecting multiple matches.
    tag_in_tag_many : function ( test )
    {
        [ 'html div' , 'html body div' , 'body div' ] . forEach ( function ( selector )
        {
            runTest ( test , function ( dom )
            {
                assertSelects ( test , dom , selector , [ 'main' , 'inner' , 'footer' ] ) ; // Test various paths to divs.
            } ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 6: Selecting a tag that does not exist in the document.
    tag_no_match : function ( test )
    {
        runTest ( test , function ( dom )
        {
            test . equal ( select ( dom , 'del' ) . length , 0 ) ; // Expect no 'del' tags.
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 7: Selecting an invalid tag name (should yield no results).
    tag_invalid_tag : function ( test )
    {
        runTest ( test , function ( dom )
        {
            test . equal ( select ( dom , 'tag%t' ) . length , 0 ) ; // Malformed tag names should not match.
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 8: Selecting specific header tags (h1, h2).
    header_tags : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelectMultiple ( test , dom , [
                [ 'h1' , [ 'header1' ] ] , // Select h1 tags.
                [ 'h2' , [ 'header2' , 'header3' ] ] // Select h2 tags.
            ] ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 9: Selecting elements by a single class name.
    class_one : function ( test )
    {
        runTest ( test , function ( dom )
        {
            [ '.onep' , 'p.onep' , 'html p.onep' ] . forEach ( function ( selector )
            {
                var els = select ( dom , selector ) ;
                test . equal ( els . length , 1 ) ; // Expect one element with class 'onep'.
                test . equal ( els [ 0 ] . name , 'p' ) ; // Verify it's a paragraph tag.
                test . equal ( els [ 0 ] . attribs . class , 'onep' ) ; // Confirm its class attribute.
            } ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 10: Selecting an element with a class name but mismatched tag.
    class_mismatched_tag : function ( test )
    {
        runTest ( test , function ( dom )
        {
            var els = select ( dom , 'div.onep' ) ; // Try to find a 'div' with class 'onep'.
            test . equal ( els . length , 0 ) ; // This should not match, as 'onep' is on a 'p' tag.
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 11: Selecting an element with multiple class names.
    multi_class : function ( test )
    {
        runTest ( test , function ( dom )
        {
            var els = select ( dom , 'p.class1.class2.class3' ) ; // Select a paragraph with all three classes.
            test . equal ( els . length , 1 ) ; // Expect one such element.
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 12: Selecting elements by ID, including compound selectors.
    one_id : function ( test )
    {
        runTest ( test , function ( dom )
        {
            [ 'div#inner' , '#inner' , 'div div#inner' ] . forEach ( function ( selector )
            {
                assertSelects ( test , dom , selector , [ 'inner' ] ) ; // Test various ways to select '#inner'.
            } ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 13: Attempting to select an ID that does not exist.
    bad_id : function ( test )
    {
        runTest ( test , function ( dom )
        {
            var els = select ( dom , '#doesnotexist' ) ; // Select a non-existent ID.
            test . equal ( els . length , 0 ) ; // Expect no matches.
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 14: Selecting child elements within an element identified by ID.
    items_in_id : function ( test )
    {
        runTest ( test , function ( dom )
        {
            var els = select ( dom , 'div#inner p' ) ; // Select paragraphs inside the div with ID 'inner'.
            test . equal ( els . length , 3 ) ; // Expect three paragraphs.
            els . forEach ( function ( el )
            {
                test . equal ( el . name , 'p' ) ; // Confirm each is a paragraph.
            } ) ;
            test . equal ( els [ 1 ] . attribs . class , 'onep' ) ; // Check class of the second paragraph.

            // The original comment suggests checking for absence of 'class' attribute,
            // which implies 'attribs' might not exist or be empty.
            // This is a check for the actual structure created by the parser for an element without attributes.
            test . ok ( typeof els [ 0 ] . attribs == 'undefined' ) ;
            test . done ( ) ;
        } ) ;
    } ,


    // Test case 15: Various selectors that are expected to yield no results.
    a_bunch_of_emptys : function ( test )
    {
        runTest ( test , function ( dom )
        {
            [ 'div#main del' , 'div#main div.oops' , 'div div#main' ] . forEach ( function ( selector )
            {
                test . equal ( select ( dom , selector ) . length , 0 ) ; // All these selectors should return nothing.
            } ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 16: Verifying selection with multiple class support.
    multi_class_support : function ( test )
    {
        runTest ( test , function ( dom )
        {
            [ '.class1' , 'p.class1' , '.class2' , 'p.class2' ,
                '.class3' , 'p.class3' , 'html p.class2' ,
                    'div#inner .class2' ] . forEach ( function ( selector )
            {
                assertSelects ( test , dom , selector , [ 'pmulti' ] ) ; // All these should select the 'pmulti' element.
            } ) ;
        } ) ;
        test . done ( ) ;
    } ,

}


exports . attributeSelectors =
{

    // Test case 17: Attribute equals selector `[attr="value"]`.
    attribute_equals : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelectMultiple ( test , dom , [
                [ 'p[class="onep"]' , [ 'p1' ] ] , // Paragraph with class "onep".
                [ 'p[id="p1"]' , [ 'p1' ] ] , // Paragraph with id "p1".
                [ '[class="onep"]' , [ 'p1' ] ] , // Any element with class "onep".
                [ '[id="p1"]' , [ 'p1' ] ] , // Any element with id "p1".
                [ 'link[rel="stylesheet"]' , [ 'l1' ] ] , // Link with rel="stylesheet".
                [ 'link[type="text/css"]' , [ 'l1' ] ] , // Link with type="text/css".
                [ 'link[href="blah.css"]' , [ 'l1' ] ] , // Link with href="blah.css".
                [ 'link[href="no-blah.css"]' , [ ] ] , // Link with non-existent href.
                [ '[rel="stylesheet"]' , [ 'l1' ] ] , // Any element with rel="stylesheet".
                [ '[type="text/css"]' , [ 'l1' ] ] , // Any element with type="text/css".
                [ '[href="blah.css"]' , [ 'l1' ] ] , // Any element with href="blah.css".
                [ '[href="no-blah.css"]' , [ ] ] , // Any element with non-existent href.
                [ 'p[href="no-blah.css"]' , [ ] ] , // Paragraph with non-existent href.
                [ '[href="no-blah.css"]' , [ ] ] , // Duplicative test for non-existent href.
            ] ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 18: Attribute contains word selector `[attr~="value"]`.
    attribute_tilde : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelectMultiple ( test , dom , [
                [ 'p[class~="class1"]' , [ 'pmulti' ] ] , // Paragraph whose class list includes "class1".
                [ 'p[class~="class2"]' , [ 'pmulti' ] ] , // Paragraph whose class list includes "class2".
                [ 'p[class~="class3"]' , [ 'pmulti' ] ] , // Paragraph whose class list includes "class3".
                [ '[class~="class1"]' , [ 'pmulti' ] ] , // Any element whose class list includes "class1".
                [ '[class~="class2"]' , [ 'pmulti' ] ] , // Any element whose class list includes "class2".
                [ '[class~="class3"]' , [ 'pmulti' ] ] , // Any element whose class list includes "class3".
                [ 'a[rel~="friend"]' , [ 'bob' ] ] , // Anchor with rel attribute containing "friend".
                [ 'a[rel~="met"]' , [ 'bob' ] ] , // Anchor with rel attribute containing "met".
                [ '[rel~="friend"]' , [ 'bob' ] ] , // Any element with rel attribute containing "friend".
                [ '[rel~="met"]' , [ 'bob' ] ] , // Any element with rel attribute containing "met".
            ] ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 19: Attribute starts with selector `[attr^="value"]`.
    attribute_startswith : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelectMultiple ( test , dom , [
                [ '[rel^="style"]' , [ 'l1' ] ] , // Any element with rel starting with "style".
                [ 'link[rel^="style"]' , [ 'l1' ] ] , // Link with rel starting with "style".
                [ 'notlink[rel^="notstyle"]' , [ ] ] , // Non-existent tag with rel starting with "notstyle".
                [ '[rel^="notstyle"]' , [ ] ] , // Any element with rel starting with "notstyle" (none exist).
                [ 'link[rel^="notstyle"]' , [ ] ] , // Link with rel starting with "notstyle" (none exist).
                [ 'link[href^="bla"]' , [ 'l1' ] ] , // Link with href starting with "bla".
                [ 'a[href^="http://"]' , [ 'bob' , 'me' ] ] , // Anchor with href starting with "http://".
                [ '[href^="http://"]' , [ 'bob' , 'me' ] ] , // Any element with href starting with "http://".
                [ '[id^="p"]' , [ 'pmulti' , 'p1' ] ] , // Any element with id starting with "p".
                [ '[id^="m"]' , [ 'me' , 'main' ] ] , // Any element with id starting with "m".
                [ 'div[id^="m"]' , [ 'main' ] ] , // Div with id starting with "m".
                [ 'a[id^="m"]' , [ 'me' ] ] , // Anchor with id starting with "m".
            ] ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 20: Attribute ends with selector `[attr$="value"]`.
    attribute_endswith : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelectMultiple ( test , dom , [
                [ '[href$=".css"]' , [ 'l1' ] ] , // Any element with href ending with ".css".
                [ 'link[href$=".css"]' , [ 'l1' ] ] , // Link with href ending with ".css".
                [ 'link[id$="1"]' , [ 'l1' ] ] , // Link with id ending with "1".
                [ '[id$="1"]' , [ 'l1' , 'p1' , 'header1' ] ] , // Any element with id ending with "1".
                [ 'div[id$="1"]' , [ ] ] , // Div with id ending with "1" (none exist).
                [ '[id$="noending"]' , [ ] ] , // Any element with id ending with "noending" (none exist).
            ] ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 21: Attribute contains substring selector `[attr*="value"]`.
    attribute_contains : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelectMultiple ( test , dom , [
                // Tests derived from startswith, but using contains.
                [ '[rel*="style"]' , [ 'l1' ] ] ,
                [ 'link[rel*="style"]' , [ 'l1' ] ] ,
                [ 'notlink[rel*="notstyle"]' , [ ] ] ,
                [ '[rel*="notstyle"]' , [ ] ] ,
                [ 'link[rel*="notstyle"]' , [ ] ] ,
                [ 'link[href*="bla"]' , [ 'l1' ] ] ,
                [ 'a[href*="http://"]' , [ 'bob' , 'me' ] ] ,
                [ '[href*="http://"]' , [ 'bob' , 'me' ] ] ,
                [ '[id*="p"]' , [ 'pmulti' , 'p1' ] ] ,
                [ 'div[id*="m"]' , [ 'main' ] ] ,
                [ 'a[id*="m"]' , [ 'me' ] ] ,
                // Tests derived from endswith, but using contains.
                [ '[href*=".css"]' , [ 'l1' ] ] ,
                [ 'link[href*=".css"]' , [ 'l1' ] ] ,
                [ 'link[id*="1"]' , [ 'l1' ] ] ,
                [ '[id*="1"]' , [ 'l1' , 'p1' , 'header1' ] ] ,
                [ 'div[id*="1"]' , [ ] ] ,
                [ '[id*="noending"]' , [ ] ] ,
                // New tests specific to contains.
                [ '[href*="."]' , [ 'bob' , 'me' , 'l1' ] ] , // Any element with href containing a dot.
                [ 'a[href*="."]' , [ 'bob' , 'me' ] ] , // Anchor with href containing a dot.
                [ 'link[href*="."]' , [ 'l1' ] ] , // Link with href containing a dot.
                [ 'div[id*="n"]' , [ 'main' , 'inner' ] ] , // Div with id containing "n".
                [ 'div[id*="nn"]' , [ 'inner' ] ] , // Div with id containing "nn".
            ] ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 22: Attribute exact or hyphen selector `[attr|="value"]`.
    attribute_exact_or_hypen : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelectMultiple ( test , dom , [
                [ 'p[lang|="en"]' , [ 'lang-en' , 'lang-en-gb' , 'lang-en-us' ] ] , // Paragraphs with lang="en" or lang starting with "en-".
                [ '[lang|="en"]' , [ 'lang-en' , 'lang-en-gb' , 'lang-en-us' ] ] , // Any element with lang="en" or lang starting with "en-".
                [ 'p[lang|="fr"]' , [ 'lang-fr' ] ] , // Paragraph with lang="fr" or lang starting with "fr-".
                [ 'p[lang|="gb"]' , [ ] ] , // Paragraph with lang="gb" or lang starting with "gb-" (none exist).
            ] ) ;
        } ) ;
        test . done ( ) ;
    } ,


    // Test case 23: Attribute exists selector `[attr]`.
    attribute_exists : function ( test )
    {
        runTest ( test , function ( dom )
        {
            assertSelectMultiple ( test , dom , [
                [ '[rel]' , [ 'l1' , 'bob' , 'me' ] ] , // Any element that has a 'rel' attribute.
                [ 'link[rel]' , [ 'l1' ] ] , // Link elements that have a 'rel' attribute.
                [ 'a[rel]' , [ 'bob' , 'me' ] ] , // Anchor elements that have a 'rel' attribute.
                [ '[lang]' , [ 'lang-en' , 'lang-en-gb' , 'lang-en-us' , 'lang-fr' ] ] , // Any element that has a 'lang' attribute.
                [ 'p[class]' , [ 'p1' , 'pmulti' ] ] , // Paragraph elements that have a 'class' attribute.
                [ '[blah]' , [ ] ] , // Any element that has a 'blah' attribute (none exist).
                [ 'p[blah]' , [ ] ] , // Paragraph elements that have a 'blah' attribute (none exist).
            ] ) ;
        } ) ;
        test . done ( ) ;
    } ,

} // End of exports.attributeSelectors object.