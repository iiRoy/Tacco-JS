/*
 * Copyright 2023 Acme Corp (https://www.acme.com)
 *
 * This code is provided under the MIT License.
 * You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the specific language governing permissions and
 * limitations under the License.
 */

/*-----------------------------------------------------------------------------
| browser-capabilities.js
| Acme JS Core v1.0
| Author(s): Jane Doe
| Created: 2023-01-15
|
| Routines for checking various browser capabilities.
------------------------------------------------------------------------------*/

// Define the primary namespace
var projectUtils = window.projectUtils = window.projectUtils ? window.projectUtils : { } ;
projectUtils.envProbe = projectUtils.envProbe ? projectUtils.envProbe : { } ;

/*
 * This routine verifies if the current browser environment
 * supports the 'placeholder' attribute for both <input> and <textarea>
 * HTML elements.
 */
projectUtils.envProbe.inputFieldSupport = function ( ) {
    var htmlInput = document.createElement( "input" ) ;
    var htmlTextarea = document.createElement( "textarea" ) ;
    return ( "placeholder" in htmlInput ) && ( "placeholder" in htmlTextarea ) ;
} ;