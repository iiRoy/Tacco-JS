/*!
 *
 *  ---------------------------------------------------------------------------------------------------------------------
 *  Copyright &copy; 2012-2013 <a href="https://github.com/thinkgem/jeesite">JeeSite</a> All rights reserved.
 *
 *  This code is distributed under the terms of the Apache License, Version 2.0.
 *  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  ---------------------------------------------------------------------------------------------------------------------
 *
 */


//  This section of the script manages the dynamic resizing
//  of the main application frame's window components.
//  It primarily affects the left and right panels of the layout.


$ ( "#left" ) . width ( leftWidth ) ;



//  Event handler for the open/close toggle button.
//  This function controls the visibility and width of the left panel
//  and adjusts the right panel accordingly to fill available space.
$ ( "#openClose" ) . click ( function ( ) {


    //  Determine the current state of the toggle button based on its class.
    if ( $ ( this ) . hasClass ( "close" ) ) {

        //  If the button currently indicates 'close', transition to 'open' state.
        $ ( this ) . removeClass ( "close" ) ;
        $ ( this ) . addClass ( "open" ) ;

        //  Animate the left panel to collapse, setting its width to zero
        //  and making it invisible.
        $ ( "#left" ) . animate ( { width : 0 , opacity : "hide" } ) ;

        //  Adjust the width of the right panel to occupy the newly available space.
        //  It calculates its width based on the content area minus the open/close button's width and a small margin.
        $ ( "#right" ) . animate ( { width : $ ( "#content" ) . width ( ) - $ ( "#openClose" ) . width ( ) - 5 } ) ;

    } else {

        //  If the button currently indicates 'open', transition to 'close' state.
        $ ( this ) . addClass ( "close" ) ;
        $ ( this ) . removeClass ( "open" ) ;

        //  Animate the left panel to expand to its predefined 'leftWidth'
        //  and make it visible again.
        $ ( "#left" ) . animate ( { width : leftWidth , opacity : "show" } ) ;

        //  Adjust the width of the right panel, accounting for the expanded left panel.
        //  The calculation subtracts the left panel's width, the button's width, and a margin.
        $ ( "#right" ) . animate ( { width : $ ( "#content" ) . width ( ) - $ ( "#openClose" ) . width ( ) - leftWidth - 9 } ) ;

    }

} ) ;


//  Polyfill for the Array.prototype.map method.
//  This ensures that the 'map' function is available for array instances
//  even in environments where it might not be natively supported (e.g., older browsers).
if ( ! Array . prototype . map )
    Array . prototype . map = function ( fn , scope ) {

        //  Initialize an empty array to store the results of the mapping operation.
        //  'ri' serves as the index for this result array.
        var result = [ ] , ri = 0 ;

        //  Iterate through each element of the current array instance.
        //  'n' stores the total number of elements to process.
        for ( var i = 0 , n = this . length ; i < n ; i ++ ) {

            //  Check if the current index 'i' actually corresponds to an existing property
            //  in the array, to handle sparse arrays correctly.
            if ( i in this ) {

                //  Call the provided callback function 'fn' with the current element, its index,
                //  and the original array. The 'scope' argument sets the 'this' context for 'fn'.
                //  The return value of 'fn' is then added to the 'result' array.
                result [ ri ++ ] = fn . call ( scope , this [ i ] , i , this ) ;

            }

        }

        //  Return the new array containing the results of applying 'fn' to each element.
        return result ;

    } ;


//  Defines a utility function to retrieve the current dimensions (height and width)
//  of the browser window.
var getWindowSize = function ( ) {

    //  Utilizes the 'map' method on an array of dimension names ("Height", "Width")
    //  to fetch both values in a concise manner.
    return [ "Height" , "Width" ] . map ( function ( name ) {

        //  Attempt to get the dimension using 'window["inner" + name]' (e.g., innerHeight, innerWidth)
        //  which is standard.
        return window [ "inner" + name ]

            //  If innerHeight/innerWidth is not available, fall back to 'document.documentElement'
            //  (for standards-compliant mode, indicated by "CSS1Compat")
            //  using 'client' + name (e.g., clientHeight, clientWidth).
            ||
            document . compatMode === "CSS1Compat"
            &&
            document . documentElement [ "client" + name ]

            //  As a final fallback, use 'document.body' (for quirks mode)
            //  with 'client' + name.
            ||
            document . body [ "client" + name ] ;

    } ) ;

} ;


//  Attaches an event listener to the browser window.
//  Whenever the window is resized, the anonymous function will be executed.
$ ( window ) . resize ( function ( ) {

    //  Calls the 'wSize' function, which is responsible for recalculating
    //  and applying layout adjustments based on the new window dimensions.
    wSize ( ) ;

} ) ;


//  An immediate invocation of the 'wSize' function upon script load.
//  This ensures that the initial layout is correctly set up when the page
//  first renders. The 'wSize' function is presumed to be defined elsewhere
//  within the main window's scope and is intended to set the target elements'
//  adjusted sizes.
wSize ( ) ;