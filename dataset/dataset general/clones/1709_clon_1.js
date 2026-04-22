var     vows    =   require('vows')
    ,   assert  =   require('assert')
    ,   gm      =   require('../lib/googlemaps');
// This is a test suite for the reverseGeocode function of the Google Maps API wrapper.


vows
    .describe  ( 'reverseGeocode' ) // Describe the 'reverseGeocode' functionality.
    .addBatch  ( {

        // Test case 1: Simple reverse geocode request.
        'Simple reverse geocode (41.850033 , -87.6500523)' :
        {
            topic: function ( )
            {
                // Execute the reverseGeocode function with specific coordinates and parameters.
                gm.reverseGeocode( '41.850033,-87.6500523' ,   this.callback  ,  'false'  ,  'en' )
            },

            // Assertion for a valid request status.
            'returns as a valid request' : function ( err , result )
            {
                // If an error occurred during the API call, throw it.
                if  (  err  )  throw  err;

                // Ensure the status returned by the Google Maps API is 'OK'.
                assert.equal( result.status  ,  'OK' );
            },

            /*
             * Note regarding the location name for "Chicago":
             * Google's reverse geocoding API sometimes returns varying results for the same coordinates,
             * especially for general locations like city centers. The expected 'locality' name
             * for these coordinates has shown some inconsistency in past tests.
             * This comment serves as a reminder of that potential flakiness.
             * If this test fails due to a different city name, it might be a Google API variation,
             * rather than an issue with the wrapper itself.
             */
            'returns expected name (Pilsen)' : function ( err,   result )
            {
                // Filter the address components to find the 'locality' type.
                var locality  =  result.results[0].address_components.filter(
                    function( el )
                    {
                        // Check if 'locality' is present in the types array for the component.
                        return   el.types.indexOf( 'locality' ) !== -1;
                    }
                ) [0];

                // Assert that the long name of the found locality is 'Chicago'.
                assert.equal( locality.long_name  ,  'Chicago' )
            }
        }
    } ) . export ( module ) ;

/*
 * This is a comprehensive multi-line comment block.
 * It contains a sample JSON response from a Google Maps reverse geocoding query.
 * This data is often useful for understanding the structure of the API responses
 * and for debugging or extending the test suite.
 *
 * Reverse geocode query results example (truncated for brevity in some sections):
{
   "status":"OK",
   "results":[
      {
         "types":[
            "postal_code"
         ],
         "formatted_address":"Chicago, IL 60664, USA",
         "address_components":[
            {
               "long_name":"60664",
               "short_name":"60664",
               "types":[
                  "postal_code"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "locality",
                  "political"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "administrative_area_level_3",
                  "political"
               ]
            },
            {
               "long_name":"Cook",
               "short_name":"Cook",
               "types":[
                  "administrative_area_level_2",
                  "political"
               ]
            },
            {
               "long_name":"Illinois",
               "short_name":"IL",
               "types":[
                  "administrative_area_level_1",
                  "political"
               ]
            },
            {
               "long_name":"United States",
               "short_name":"US",
               "types":[
                  "country",
                  "political"
               ]
            }
         ],
         "geometry":{
            "location":{
               "lat":41.85,
               "lng":-87.65
            },
            "location_type":"APPROXIMATE",
            "viewport":{
               "southwest":{
                  "lat":41.8468524,
                  "lng":-87.6531476
               },
               "northeast":{
                  "lat":41.8531476,
                  "lng":-87.6468524
               }
            }
         }
      },
      {
         "types":[
            "postal_code"
         ],
         "formatted_address":"Chicago, IL 60695, USA",
         "address_components":[
            {
               "long_name":"60695",
               "short_name":"60695",
               "types":[
                  "postal_code"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "locality",
                  "political"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "administrative_area_level_3",
                  "political"
               ]
            },
            {
               "long_name":"Cook",
               "short_name":"Cook",
               "types":[
                  "administrative_area_level_2",
                  "political"
               ]
            },
            {
               "long_name":"Illinois",
               "short_name":"IL",
               "types":[
                  "administrative_area_level_1",
                  "political"
               ]
            },
            {
               "long_name":"United States",
               "short_name":"US",
               "types":[
                  "country",
                  "political"
               ]
            }
         ],
         "geometry":{
            "location":{
               "lat":41.85,
               "lng":-87.65
            },
            "location_type":"APPROXIMATE",
            "viewport":{
               "southwest":{
                  "lat":41.8468524,
                  "lng":-87.6531476
               },
               "northeast":{
                  "lat":41.8531476,
                  "lng":-87.6468524
               }
            }
         }
      },
      {
         "types":[
            "postal_code"
         ],
         "formatted_address":"Chicago, IL 60688, USA",
         "address_components":[
            {
               "long_name":"60688",
               "short_name":"60688",
               "types":[
                  "postal_code"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "locality",
                  "political"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "administrative_area_level_3",
                  "political"
               ]
            },
            {
               "long_name":"Cook",
               "short_name":"Cook",
               "types":[
                  "administrative_area_level_2",
                  "political"
               ]
            },
            {
               "long_name":"Illinois",
               "short_name":"IL",
               "types":[
                  "administrative_area_level_1",
                  "political"
               ]
            },
            {
               "long_name":"United States",
               "short_name":"US",
               "types":[
                  "country",
                  "political"
               ]
            }
         ],
         "geometry":{
            "location":{
               "lat":41.85,
               "lng":-87.65
            },
            "location_type":"APPROXIMATE",
            "viewport":{
               "southwest":{
                  "lat":41.8468524,
                  "lng":-87.6531476
               },
               "northeast":{
                  "lat":41.8531476,
                  "lng":-87.6468524
               }
            }
         }
      },
      {
         "types":[
            "postal_code"
         ],
         "formatted_address":"Chicago, IL 60686, USA",
         "address_components":[
            {
               "long_name":"60686",
               "short_name":"60686",
               "types":[
                  "postal_code"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "locality",
                  "political"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "administrative_area_level_3",
                  "political"
               ]
            },
            {
               "long_name":"Cook",
               "short_name":"Cook",
               "types":[
                  "administrative_area_level_2",
                  "political"
               ]
            },
            {
               "long_name":"Illinois",
               "short_name":"IL",
               "types":[
                  "administrative_area_level_1",
                  "political"
               ]
            },
            {
               "long_name":"United States",
               "short_name":"US",
               "types":[
                  "country",
                  "political"
               ]
            }
         ],
         "geometry":{
            "location":{
               "lat":41.85,
               "lng":-87.65
            },
            "location_type":"APPROXIMATE",
            "viewport":{
               "southwest":{
                  "lat":41.8468524,
                  "lng":-87.6531476
               },
               "northeast":{
                  "lat":41.8531476,
                  "lng":-87.6468524
               }
            }
         }
      },
      {
         "types":[
            "postal_code"
         ],
         "formatted_address":"Chicago, IL 60696, USA",
         "address_components":[
            {
               "long_name":"60696",
               "short_name":"60696",
               "types":[
                  "postal_code"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "locality",
                  "political"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "administrative_area_level_3",
                  "political"
               ]
            },
            {
               "long_name":"Cook",
               "short_name":"Cook",
               "types":[
                  "administrative_area_level_2",
                  "political"
               ]
            },
            {
               "long_name":"Illinois",
               "short_name":"IL",
               "types":[
                  "administrative_area_level_1",
                  "political"
               ]
            },
            {
               "long_name":"United States",
               "short_name":"US",
               "types":[
                  "country",
                  "political"
               ]
            }
         ],
         "geometry":{
            "location":{
               "lat":41.85,
               "lng":-87.65
            },
            "location_type":"APPROXIMATE",
            "viewport":{
               "southwest":{
                  "lat":41.8468524,
                  "lng":-87.6531476
               },
               "northeast":{
                  "lat":41.8531476,
                  "lng":-87.6468524
               }
            }
         }
      },
      {
         "types":[
            "postal_code"
         ],
         "formatted_address":"Chicago, IL 60290, USA",
         "address_components":[
            {
               "long_name":"60290",
               "short_name":"60290",
               "types":[
                  "postal_code"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "locality",
                  "political"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "administrative_area_level_3",
                  "political"
               ]
            },
            {
               "long_name":"Cook",
               "short_name":"Cook",
               "types":[
                  "administrative_area_level_2",
                  "political"
               ]
            },
            {
               "long_name":"Illinois",
               "short_name":"IL",
               "types":[
                  "administrative_area_level_1",
                  "political"
               ]
            },
            {
               "long_name":"United States",
               "short_name":"US",
               "types":[
                  "country",
                  "political"
               ]
            }
         ],
         "geometry":{
            "location":{
               "lat":41.85,
               "lng":-87.65
            },
            "location_type":"APPROXIMATE",
            "viewport":{
               "southwest":{
                  "lat":41.8468524,
                  "lng":-87.6531476
               },
               "northeast":{
                  "lat":41.8531476,
                  "lng":-87.6468524
               }
            }
         }
      },
      {
         "types":[
            "street_address"
         ],
         "formatted_address":"2398 S Morgan St, Chicago, IL 60608, USA",
         "address_components":[
            {
               "long_name":"2398",
               "short_name":"2398",
               "types":[
                  "street_number"
               ]
            },
            {
               "long_name":"S Morgan St",
               "short_name":"S Morgan St",
               "types":[
                  "route"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "locality",
                  "political"
               ]
            },
            {
               "long_name":"Chicago",
               "short_name":"Chicago",
               "types":[
                  "administrative_area_level_3",
                  "political"
               ]
            },
            {
               "long_name":"Cook",
*/