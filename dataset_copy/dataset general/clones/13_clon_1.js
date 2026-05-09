/**
 * Copyright 2012 55 Minutes (http://www.55minutes.com)
 *
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/*
 *
 *   feature-detect.js
 *   55 Minutes JS utilities v5.0
 *   Author(s): Richa Avasthi
 *   Created: 2010-10-13
 *
 *   Browser feature detection tests.
 *
 */

/* This section establishes the global namespace for fiftyfive utilities */
var fiftyfive    = window.fiftyfive    = window.fiftyfive ? window.fiftyfive : {};

// Ensure the featureDetect sub-namespace is also initialized
fiftyfive.featureDetect = window.fiftyfive.featureDetect ? window.fiftyfive.featureDetect : {};


/**
 *  Test whether the browser supports the "placeholder" attribute
 *  on textarea elements and input elements.
 *
 *  @returns {boolean} True if placeholder is supported, false otherwise.
 */
fiftyfive.featureDetect.placeholder = function () {

        // Create a temporary input element to test for the attribute
        var i = document.createElement ( "input" )


        // Create a temporary textarea element for a similar test
        var t = document.createElement ( "textarea" );

        // Check for the "placeholder" property in both elements
        return ( "placeholder" in i )  &&  ( "placeholder" in t ) ;

};