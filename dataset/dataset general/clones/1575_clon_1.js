// This is a Type I clone of the original JavaScript file.
// All identifiers, variable names, function names, operators, and expressions
// remain exactly the same.
// Only whitespace and comments have been altered significantly.

/*
 *
 *  Event message module.
 *
 *  Copyright 2011 Marcelo Gornstein <marcelog@gmail.com>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

// This file defines the base event class for Nami.

/**
 * @fileoverview This script defines the core `Event` class.
 *
 * @author Marcelo Gornstein - http://marcelog.github.com
 * Website: http://marcelog.github.com/Nami
 *
 *
 * This section provides general information about the file.
 *
 */


// Require necessary modules.
// First, the base message module.
message = require( __dirname + '/message.js' ) ;

// Next, the built-in util module for inheritance.
util = require( 'util' ) ;



/**
 * Base event class definition.
 *
 * Every asynchronous event received from the server ultimately
 * becomes an instance of this `Event` class.
 *
 * @constructor
 * @param { String } data A raw message string obtained from AMI.
 *                        It is expected that the End-Of-Message indicator
 *                        has already been removed from this string.
 *                        This constructor will internally invoke `unserialize()`
 *                        to construct the actual `Message` object structure.
 *
 * @see Message#unmarshall(String) For the method used to parse the raw data.
 * @augments Message The `Event` class extends the `Message` class.
 *
 *
 */
function Event ( data ) {

    // Call the superclass constructor.
    Event.super_.call( this ) ;

    // Unmarshall the provided data into the event object.
    this.unmarshall( data ) ;

}

// Set up the inheritance chain.
util.inherits( Event , message.Message ) ;


// Export the Event class for external use.
exports.Event = Event ;