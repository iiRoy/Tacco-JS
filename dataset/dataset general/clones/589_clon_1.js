var    geoip     =    require   (   '../lib/geoip'   )   ;   //  Import the geoip library for testing purposes.


module.exports    =    {   // This object exports all the individual test functions for the geoip module.


        testLookup   :    function   (   test   )        {

            //  This test function verifies the basic lookup functionality for both IPv4 and IPv6 addresses.


            test   .   expect   (   2   )   ;   //  We expect exactly two assertions to be run in this particular test case.


            var     ip     =     '8.8.4.4'     ;     //  Define an example IPv4 address for testing.
            var     ipv6     =     '2001:4860:b002::68'     ;     //  Define an example IPv6 address for testing.


            var    actual    =    geoip    .    lookup    (    ip    )    ;     //  Perform a geoip lookup for the specified IPv4 address.


            test    .    ok    (    actual    ,    'should return data about IPv4.'    )    ;     //  Assert that a non-null result (data) was returned for the IPv4 lookup.


            actual    =    geoip    .    lookup    (    ipv6    )    ;     //  Now, perform a geoip lookup for the specified IPv6 address.


            test    .    ok    (    actual    ,    'should return data about IPv6.'    )    ;     //  Assert that a non-null result (data) was returned for the IPv6 lookup.


            test    .    done    (    )    ;     //  Signal to the test runner that this test case (testLookup) is complete.
        }   ,


        testUTF8   :    function   (   test   )        {

            /*
             *   This test function specifically verifies that UTF-8 characters
             *   within city names are handled and returned correctly by the geoip lookup.
             */


            test   .   expect   (   2   )   ;   //  Expecting two assertions to confirm UTF-8 handling.


            var     ip     =     "31.17.105.227"     ;     //  An IP address known to be associated with a city name containing UTF-8 characters.
            var     expected     =     "Neumünster"     ;     //  The precise expected UTF-8 city name.
            var     actual     =     geoip     .     lookup     (     ip     )     ;     //  Execute the geoip lookup for the test IP.


            test    .    ok    (    actual    ,    "Should return a non-null value for "    +    ip    )    ;     //  First, verify that any data was returned at all for this IP.


            test    .    equal    (    actual    .    city    ,    expected    ,    "UTF8 city name does not match"    )    ;     //  Then, assert that the 'city' property matches the expected UTF-8 string.


            test    .    done    (    )    ;     //  Conclude the test case for UTF-8 character handling.
        }   ,


        testMetro   :    function   (   test   )        {

            //  This test function ensures that the correct metro code is retrieved for a given IP address.


            test   .   expect   (   2   )   ;   //  We anticipate two assertions for validating the metro code.


            var    actual    =    geoip    .    lookup    (    "23.240.63.68"    )    ;     //  Perform a lookup using an IP address known to have metro code information.


            test    .    equal    (    actual    .    city    ,    "Van Nuys"    )    ;     //  Verify that the city name matches for this specific IP.
            test    .    equal    (    actual    .    metro    ,    803    )    ;     //  Verify that the metro code matches the expected value.


            test    .    done    (    )    ;     //  Complete the metro code test case.
        }

}   ;   // End of the module.exports object definition.