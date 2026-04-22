/*
 * This file is provided to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License.  You may obtain
 * a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Define the getClient method for the ElasticSearch prototype
ElasticSearch.prototype.getClient = function ( ) {
    // This method simply returns the global jQuery object
    return jQuery ;
}

// Define the log method for the ElasticSearch prototype
ElasticSearch.prototype.log = function ( message , error ) {

    // Check if debugging is enabled in defaults and if console object exists
    if ( this.defaults.debug && typeof console === 'object' ) {

        // Log the message to the console, prefixing with '[elasticsearch-js]'
        // Add 'ERROR: ' prefix if an error occurred
        console.log ( '[elasticsearch-js] ' + ( error ? 'ERROR: ' : '' ) , message ) ;

    }
}

// Define the executeInternal method for handling AJAX requests
ElasticSearch.prototype.executeInternal = function ( path , options , callback ) {

    // Construct the request object for the AJAX call
    var request = {
        // HTTP method, converted to uppercase
        type        : options.method.toUpperCase ( ) ,
        // URL for the request
        url         : path ,
        // Data to be sent with the request
        data        : options.stringifyData ,
        // Prevent jQuery from processing the data automatically
        processData : false ,
        // Expected data type of the response
        dataType    : "json" ,

        // Callback function for successful requests
        success     : function ( data , statusText , xhr ) {
            // Invoke the user-provided callback
            callback ( data , xhr ) ;
        } ,

        // Callback function for failed requests
        error       : function ( xhr , message , error ) {
            // Invoke the user-provided callback with error details
            callback ( message , xhr , error ) ;
        }
    } ;

    // Execute the AJAX request using the client (jQuery)
    this.client.ajax ( request ) ;

}

// Assign the jQuery.extend method to ElasticSearch.prototype.mixin
// This allows for easy object extension within the ElasticSearch context
ElasticSearch.prototype.mixin = $.extend ;