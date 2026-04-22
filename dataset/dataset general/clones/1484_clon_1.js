/*
 * This test file is designed to validate the functionality of the 'xss' sanitization library.
 * It leverages the 'chai' assertion library for verifications and 'mocha' as the test runner.
 * The primary goal is to ensure the XSS filter correctly strips malicious content
 * while preserving legitimate HTML and URL structures.
 */

// Import the assertion library 'chai' to enable 'expect' style assertions.
var     expect      =   require (   "chai"  )   .   expect  ;

// Import the 'xss' library itself, which is the subject of these tests.
var xss = require ( ".." ) ;


/*
 * Main test suite for the core 'xss()' function, which sanitizes HTML strings.
 * This block contains various sub-suites to cover different aspects of HTML sanitization.
 */
describe    (   "xss()" ,   function    (   )   {


    /**
     * Helper function to streamline the creation of HTML sanitization test cases.
     * It sets up an assertion that compares the output of `xss(given)` with an expected value.
     *
     * @param   {string}    given       - The input HTML string to be sanitized.
     * @param   {string}    [expected]  - The anticipated sanitized HTML output. If omitted,
     *                                      the 'given' string itself is used as the expected output.
     * @returns {function}  A Mocha-compatible test function ready for execution.
     */
    function    html    (   given   ,   expected    )   {
                                                                    // Check if 'expected' argument was provided.
        if  (   arguments.length    ==  1   )   {                   // If not, assume the input is also the expected output.
            expected    =   given   ;
        }
        return  function    (   )   {
            // Assert that the sanitized output strictly equals the expected output.
            expect  (   xss (   given   )   ,   given   )   .   to  .   eql (   expected    )   ;
        }   ;
    }


    /**
     * Helper function specifically for generating URL sanitization test cases.
     * It wraps the call to `xss.url()` and asserts its output against an expected value.
     *
     * @param   {string}    given       - The input URL string to be sanitized.
     * @param   {string}    [expected]  - The anticipated sanitized URL output. If not provided,
     *                                      'given' is used as the default expected value.
     * @returns {function}  A test function for Mocha.
     */
    function    url (   given   ,   expected    )   {
        // If 'expected' is not explicitly passed, it defaults to the 'given' value.
        if  (   arguments   .   length  ==  1   )   {
            expected    =   given   ;
        }
        return  function    (   )   {
            // Assert the equality of the sanitized URL and the expected URL.
            expect  (   xss .   url (   given   )   ,   given   )   .   to  .   eql (   expected    )   ;
        }   ;
    }


    // This nested describe block focuses on elements and attributes that should be
    // completely stripped or removed by the XSS sanitizer due to security concerns.
    describe    (   "strips"    ,   function    (   )   {
        it  (   "<script>"  ,   html    (   '<script>doevil</script>'   ,   ''  )   )   ;   // Script tags are a primary XSS vector and must be removed.
        it  (   "<style>"   ,   html    (   '<style>doevil</style>'     ,   ''  )   )   ;   // Style tags can be exploited for XSS and should be stripped.
        it  (   "<iframe>"  ,   html    (   '<iframe></iframe>'         ,   ''  )   )   ;   // Iframes allow embedding external content and are often removed.
        it  (   "[id]"      ,   html    (   '<img id="one">'            ,   '<img>' )   )   ;   // The 'id' attribute should be stripped by default.
        it  (   "[class]"   ,   html    (   '<img class="one">'         ,   '<img>' )   )   ;   // The 'class' attribute should be stripped by default.
        it  (   "[style]"   ,   html    (   '<img style="test">'        ,   '<img>' )   )   ;   // The 'style' attribute (inline CSS) should be stripped.
        it  (   "[on*]"     ,   html    (   '<img onclick="doevil">'    ,   '<img>' )   )   ;   // All 'on*' event handler attributes must be removed.
        it  (   "[data-*]"  ,   html    (   '<img data-test="test">'    ,   '<img>' )   )   ;   // Custom 'data-*' attributes are generally stripped.
        it  (   "uncontained <li>"  ,   html    (   '<div><li></li></div>'  ,   '<div></div>'   )   )   ; // `<li>` elements outside `<ul>` or `<ol>` are malformed.
        it  (   "uncontained <thead>"   ,   html    (   '<thead></thead>'       ,   ''  )   )   ;   // Table structural elements without proper parent context.
        it  (   "uncontained <tbody>"   ,   html    (   '<tbody></tbody>'       ,   ''  )   )   ;
        it  (   "uncontained <tfoot>"   ,   html    (   '<tfoot></tfoot>'       ,   ''  )   )   ;
        it  (   "uncontained <tr>"      ,   html    (   '<tr></tr>'             ,   ''  )   )   ;
        it  (   "uncontained <td>"      ,   html    (   '<td></td>'             ,   ''  )   )   ;
        it  (   "uncontained <th>"      ,   html    (   '<th></th>'             ,   ''  )   )   ;
    }   )   ;


    /*
     * TODO: Future enhancement - ensure all allowed HTML elements are explicitly tested.
     * This section verifies which elements and attributes are permitted and remain in the output.
     */
    describe    (   "permits"   ,   function    (   )   {
        it  (   "<a>"       ,   html    (   '<a>one</a>'           )   )   ;   // Anchor tags are generally allowed for navigation.
        it  (   "<a href>"  ,   html    (   '<a href="#">one</a>'  )   )   ;   // The 'href' attribute for anchors is essential and allowed.
        it  (   "<aside>"   ,   html    (   '<aside></aside>'      )   )   ;   // HTML5 semantic element 'aside'.
        it  (   "<br>"      ,   html    (   '<br>'                  )   )   ;   // Line break element.
        it  (   "<li (ul)>" ,   html    (   '<ul><li>one</li></ul>' )   )   ;   // List item within an unordered list, correctly structured.
        it  (   "<li (ol)>" ,   html    (   '<ol><li>one</li></ol>' )   )   ;   // List item within an ordered list, correctly structured.
        it  (   "<hr>"      ,   html    (   '<hr>'                  )   )   ;   // Horizontal rule element.
        it  (   "<table>"   ,   html    (   '<table><tbody><tr><th></th></tr><tr><td></td></tr></tbody></table>'   )   )   ; // Complex table structure including tbody, tr, th, td.

        /*
         * The following elements/attributes were considered for whitelisting but were
         * ultimately decided against for the current version of the sanitizer.
         * They remain commented out for historical context or future reconsideration.
         */
        // it("<iframe>", html('<iframe></iframe>')); // Iframes are too risky for general allowance.
        // it("[data-*]", html('<img data-test="test">')); // Data attributes are often stripped.
        // it("[data-*] (empty)", html('<img data-test>', '<img data-test="">')); // Empty data attributes.
    }   )   ;


    // This block tests the URL sanitization specific function: xss.url().
    describe    (   ".url()"    ,   function    (   )   {
        /*
         * The URL sanitizer operates on a strict whitelist principle.
         * Consequently, only a limited set of sanity checks are necessary
         * to confirm that no malicious or unapproved schemes are permitted.
         */
        describe    (   "strips"    ,   function    (   )   {
            it  (   "javascript:"   ,   url (   "javascript:doevil" ,   ""  )   )   ;   // JavaScript URIs must be stripped for security.
        }   )   ;


        describe    (   "permits"   ,   function    (   )   {
            it  (   "http"      ,   url (   'http://'       )   )   ;   // Standard HTTP protocol is allowed.
            it  (   "https"     ,   url (   'https://'      )   )   ;   // Secure HTTPS protocol is allowed.
            it  (   "mailto"    ,   url (   'mailto:'       )   )   ;   // Mailto links are allowed.
            it  (   "local"     ,   url (   '#local'        )   )   ;   // Local page anchors are allowed.
            it  (   "relative"  ,   url (   '/relative'     )   )   ;   // Relative paths are allowed.
        }   )   ;
    }   )   ;


    /*
     * This section contains tests derived from common XSS attack vectors,
     * often found in resources like the OWASP XSS Filter Evasion Cheat Sheet.
     * The goal is to ensure the sanitizer can withstand various evasion techniques.
     *
     * TODO: Consider expanding this section to include a comprehensive test
     * suite for each known attack type, potentially driven by an external data source.
     */
    describe    (   "attacks"   ,   function    (   )   {
        it  (   "malformed img"     ,   html    (   '<IMG """><SCRIPT>alert("XSS")</SCRIPT>"'   ,   '<img>"'    )   )   ;   // Test for malformed image tag with script injection.
        it  (   "malformed on*"     ,   html    (   '<IMG SRC= onmouseover="alert(\'xxs\')">'   ,   '<img src="">'  )   )   ;   // Test for event handler attribute injection.
        it  (   " &#14; javascript:",   html    (   '<a href=" &#14; javascript:doevil"></a>'   ,   '<a href=""></a>'   )   )   ;   // Test for control characters in URL scheme.
        it  (   "&#106;"            ,   html    (   '<a href="&#106;&#97;"></a>'                ,   '<a href=""></a>'   )   )   ;   // Test for HTML entity encoded JavaScript.
    }   )   ;

}   )   ; // End of the primary 'xss()' describe block.


/*
 * This describe block focuses on testing the internal '_sanitizeAttributes'
 * function, which is responsible for cleaning up element attributes based on rules.
 */
describe    (   "sanitizeAttributes()"  ,   function    (   )   {

    // Test case related to a specific bug fix (Issue #1) concerning undefined attributes.
    it  (   "handles undefined attributes"  ,   function    (   )   {
        expect  (   function    (   )   {
            // Simulate an element structure where an attribute might be explicitly undefined.
            var $el =   [   {   tagName :   "div"   ,   attributes  :   {   "0" :   undefined   }   }   ]   ;
            // Call the private sanitization method; it should not throw an error.
            xss .   _sanitizeAttributes (   $el ,   xss .   defaults    )   ;
        }   )   .   to  .   not .   throw (   )   ; // Expect no error to be thrown during this operation.
    }   )   ;


    /*
     * This test addresses Issue #2, ensuring that the sanitizer correctly handles
     * attribute maps, specifically iterating only over own properties and not
     * inherited ones, preventing unexpected behavior from prototypes.
     *
     * TODO: For more robust callback testing, consider integrating 'sinon-chai'
     * to allow for the use of spies and stubs to verify method calls.
     */
    it  (   "only iterates on own properties"   ,   function    (   )   {
        var attrRemoved =   false   ; // Flag to check if an attribute was unexpectedly removed.

        // Define a custom prototype to simulate inherited properties that should be ignored.
        function    AttrMap (   )   {   }   ;
        AttrMap .   prototype   .   fail    =   function    (   )   {   }   ; // An inherited method, not an own property.

        // Create a mock element with an instance of AttrMap as its attributes.
        var $el =   [   {   tagName :   "div"   ,   attributes  :   new AttrMap (   )   }   ]   ;
        // Add a mock removeAttr function to the element, to capture calls.
        $el .   removeAttr  =   function    (   )   {
            attrRemoved =   true    ; // Set flag if removeAttr is invoked.
        }   ;

        // Define options that force all attributes to be removed (using a regex that matches nothing).
        var options =   {   attributes  :   {   all :   /^$/    }   }   ;
        xss .   _sanitizeAttributes (   $el ,   options )   ; // Perform the sanitization.

        // Assert that 'removeAttr' was NOT called, meaning the inherited 'fail' property was ignored.
        expect  (   attrRemoved )   .   to  .   eql (   false   )   ;
    }   )   ;

}   )   ; // End of 'sanitizeAttributes()' describe block.


/*
 * This final describe block is dedicated to testing the internal
 * '_getAttributeName' utility function, which helps normalize attribute access
 * across different DOM representation styles (e.g., jQuery vs. Cheerio).
 */
describe    (   "getAttributeName()"    ,   function    (   )   {

    // This nested block tests scenarios where attributes are indexed numerically,
    // which is typical in jQuery or standard browser DOM representations.
    describe    (   "with numeric index (jquery/browser)"   ,   function    (   )   {
        // Sample attribute object structure.
        var attributes  =   {   "0" :   {   name    :   "class" ,   "1" :   undefined   }   }   ;

        it  (   "returns name"  ,   function    (   )   {
            // Test with a direct numeric index.
            expect  (   xss .   _getAttributeName   (   attributes  ,   0   )   )   .   to  .   eql (   "class" )   ;
            // Test with a string-represented numeric index.
            expect  (   xss .   _getAttributeName   (   attributes  ,   "0" )   )   .   to  .   eql (   "class" )   ;
        }   )   ;

        // Addresses Issue #1: ensures robustness when an attribute entry is undefined.
        it  (   "handles undefined attributes"  ,   function    (   )   {
            expect  (   xss .   _getAttributeName   (   attributes  ,   "1" )   )   .   to  .   eql (   undefined   )   ;
        }   )   ;
    }   )   ;


    // This nested block tests scenarios where attributes are indexed by their name,
    // commonly found in Node.js environments or libraries like Cheerio.
    describe    (   "with named index (node/cheerio)"   ,   function    (   )   {
        // Sample attribute object structure for named indexing.
        var attributes  =   {   "class" :   {   name    :   "class" }   }   ;

        it  (   "returns name"  ,   function    (   )   {
            expect  (   xss .   _getAttributeName   (   attributes  ,   "class" )   )   .   to  .   eql (   "class" )   ;
        }   )   ;
    }   )   ;

}   )   ; // End of 'getAttributeName()' describe block.