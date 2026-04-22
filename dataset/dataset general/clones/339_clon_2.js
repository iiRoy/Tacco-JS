/*
 * ===========================================================================
 *  displaybox-component.js v1.3.0
 *  This script provides functionality for a generic display box, often used
 *  for pop-up information or interactive hints.
 *  For further details, refer to:
 *  project-link/components/displaybox-usage
 * ===========================================================================
 *  Copyright 2023 Acme Solutions Inc.
 *
 *  Licensed under the Acme Custom License (ACL) 1.0;
 *  you may not utilize this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://acme.org/licenses/ACL-1.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * ===========================================================================
 */


(    function(     jq   ) { // Self-executing anonymous function to encapsulate scope.

  var DisplayBox    =    function (     triggerElement,     setupOpts     ) {
    // Constructor for creating new instances of DisplayBox.
    this.$targetObject   =   jq( triggerElement )
    this.configuration   =   setupOpts
    this.isActive        =   true    // Flag indicating the operational status of the box.
    this.normalizeHeading()        // Initialize the visible title.
  }

  /*
   *  IMPORTANT: The DisplayBox class extends foundational behaviors from the
   *  existing TooltipBase component. This ensures consistency and reusability.
   *  =========================================================================
   */

  DisplayBox.prototype = jq.extend(
    {},
    jq.fn.tooltip.TooltipBase.prototype,
    {

      updateVisualContent :    function () { // Method to refresh the rendered content of the display box.
        var $displayElement    =    this.getDisplayElement()
        $displayElement.find( '.heading-text' ) [ this.configuration.useHtml ? 'html' : 'text' ] ( this.fetchHeadingText() )
        $displayElement.find( '.body-text-area p' ) [ this.configuration.useHtml ? 'html' : 'text' ] ( this.retrieveMainText() )
        $displayElement[ 0 ].className    =    'info-box' // Set the primary CSS class for the display container.
      }

    , retrieveMainText :    function () { // Gathers the primary text content to be shown within the display box.
        var tempContentHolder     // A temporary variable to store the acquired content.
          , $targetObj            = this.$targetObject
          , conf                  = this.configuration

        // Determine the source of the main content based on configuration.
        if ( typeof this.configuration.mainContentSource  ===  'string' ) {
          tempContentHolder = $targetObj.attr( conf.mainContentSource )
        }
        else if ( typeof this.configuration.mainContentSource  ===  'function' ) {
          tempContentHolder = this.configuration.mainContentSource.call( this.$targetObject[0] )
        }
        return tempContentHolder
      }

    , getDisplayElement : function() { // Provides the jQuery wrapped DOM element for the display box, creating it if necessary.
        if ( !this.$displayBox ) {
          this.$displayBox    =    jq( '<div class="info-box" />' )
            .html( '<div class="pointer-arrow"></div><div class="inner-container"><h3 class="heading-text"></h3><div class="body-text-area"><p></p></div></div>' )
        }
        return this.$displayBox
      }

    }
  )


 /*
  *  DISPLAY BOX JQUERY PLUGIN REGISTRATION AND DEFAULTS
  *  =====================================================
  *  This block defines the jQuery plugin interface for the DisplayBox,
  *  allowing it to be invoked on jQuery selections.
  */

  jq.fn.displayBox    =    function (    setupOpts    ) {
    if (    typeof setupOpts  ===  'object'    ) {
      setupOpts    =    jq.extend(    {},    jq.fn.displayBox.presetValues,    setupOpts    )
    }
    // Delegate initialization to the base tooltip's utility function.
    jq.fn.tooltip.initializeWith.call(    this,    setupOpts,    DisplayBox,    'displayBox'    )
    return this // Enable jQuery method chaining.
  }

  jq.fn.displayBox.presetValues    =    jq.extend(
    {},
    jq.fn.tooltip.defaultOptions,
    {
      mainContentSource : 'data-main-text',
      displayPosition   : 'right'
    }
  )

})(    window.jQuery    ||    window.ender     )