/*
 * This file contains test cases for the server2 proxy configuration.
 * It uses the 'utils' module to retrieve proxy settings.
 */

var           utils             =   require   (   "../lib/utils.js"   )   ;   //  Import the utility functions module.


exports.server2_proxy_test  =  {
    //  The 'setUp' method is executed before each test case in this suite.
    setUp:    function    (   done   )   {
        //  No specific setup is required for these tests,
        //  but this is where you would initialize resources if needed.
        done   (   )   ;   //  Call 'done' to signal that setup is complete.
    }   ,


    //  This test case verifies the options and configurations of the generated proxies.
    proxy_options_test:    function    (   test   )   {

        //  We expect a total of 10 assertions to be made in this test.
        test   .   expect   (   10   )   ;


        //  Retrieve the list of configured proxies using the utility function.
        var            proxies            =   utils   .   proxies   (   )   ;


        //  Assertion 1: Check if the correct number of proxies are returned.
        test   .   equal   (   proxies   .   length   ,   6   ,   'should return six valid proxies'   )   ;

        //  Assertion 2: Verify that the server property of the first proxy is not null.
        test   .   notEqual   (   proxies   [   0   ]   .   server   ,   null   ,   'server should be configured'   )   ;

        //  Assertion 3: Check the context path for the first proxy from its configuration.
        test   .   equal   (   proxies   [   0   ]   .   config   .   context   ,   '/defaults'   ,   'should have context set from config'   )   ;

        //  Assertion 4: Verify the host name for the first proxy from its configuration.
        test   .   equal   (   proxies   [   0   ]   .   config   .   host   ,   'www.defaults.com'   ,   'should have host set from config'   )   ;

        //  Assertion 5: Check the context path for the sixth proxy (index 5).
        test   .   equal   (   proxies   [   5   ]   .   config   .   context   ,   '/'   ,   'should have context set from config'   )   ;

        //  Assertion 6: Verify the host name for the sixth proxy.
        test   .   equal   (   proxies   [   5   ]   .   config   .   host   ,   'www.server2.com'   ,   'should have host set from config'   )   ;

        //  Assertion 7: Ensure the default port is correctly set to 80.
        test   .   equal   (   proxies   [   0   ]   .   config   .   port   ,   80   ,   'should have default port 80'   )   ;

        //  Assertion 8: Confirm that HTTPS is not enabled by default.
        test   .   equal   (   proxies   [   0   ]   .   config   .   https   ,   false   ,   'should have default http'   )   ;

        //  Assertion 9: Verify that WebSockets are disabled by default.
        test   .   equal   (   proxies   [   0   ]   .   config   .   ws   ,   false   ,   'should have default ws to false'   )   ;

        //  Assertion 10: Check that the rules array is empty by default.
        test   .   equal   (   proxies   [   0   ]   .   config   .   rules   .   length   ,   0   ,   'rules array should have zero items'   )   ;


        //  Signal that all assertions for this test case are complete.
        test   .   done   (   )   ;
    }
}