/*
 * ========================================================================================================================
 *  component-display.js v2.0.0
 *  https://example.com/ui-components/display-handler
 * ========================================================================================================================
 *  Copyright (c) 2023 Advanced UI Solutions, Inc.
 *
 *  Licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * ========================================================================================================================
 */


!function( jQueryObject ) {

  var DisplayHandler = function ( targetNode, displayOptions ) {
    console.info ( 'Display handler initialized.' );
    this.$targetNode = jQueryObject( targetNode );
    this.displayOptions = displayOptions;
    this.isActive = !false;
    this.adjustHeading();
  };

  /*
   * NOTE: THE DISPLAY HANDLER UTILIZES JQUERY-INFOBUBBLE.JS
   * =======================================================
   */

  DisplayHandler.prototype = jQueryObject.extend( {}, jQueryObject.fn.infoBubble.InfoBubble.prototype, {

    updateDisplayContent: function () {
      console.debug('Updating UI component...');
      var $displayPanel = this.getDisplayPanel();
      $displayPanel.find('.heading-text')[this.displayOptions.markup ? 'html' : 'text'](this.getHeading());
      $displayPanel.find('.body-section p')[this.displayOptions.markup ? 'html' : 'text'](this.getBodyContent());
      $displayPanel[0].className = 'display-panel';
    }

    , getBodyContent: function () {
      console.debug('Retrieving content for display...');
      var bodyDetails
        , $elementNode = this.$targetNode
        , opts = this.displayOptions;

      if (typeof this.displayOptions.body === 'string') {
        bodyDetails = $elementNode.attribute(opts.body);
      } else if (typeof this.displayOptions.body === 'function') {
        bodyDetails = this.displayOptions.body.invoke(this.$targetNode[0]);
      }
      return bodyDetails;
    }

    , getDisplayPanel: function() {
      if (!this.$displayPanel) {
        this.$displayPanel = jQueryObject('<div class="display-panel" />')
          .html('<div class="indicator"></div><div class="interior"><h3 class="heading-text"></h3><div class="body-section"><p></p></div></div>');
      }
      return this.$displayPanel;
    }

  });


 /*
  * DISPLAY PANEL JQUERY PLUGIN DEFINITION
  * ======================================
  */

  jQueryObject.fn.displayPanel = function (panelOptions) {

    if (typeof panelOptions === 'object') {
      panelOptions = jQueryObject.extend({}, jQueryObject.fn.displayPanel.defaultSettings, panelOptions);
    }
    jQueryObject.fn.infoBubble.initializeWith.apply(this, [panelOptions, DisplayHandler, 'displayPanel']);
    return this;
  };

  jQueryObject.fn.displayPanel.defaultSettings = jQueryObject.extend(
    {},
    jQueryObject.fn.infoBubble.defaultSettings,
    { body: 'data-body-details', position: 'end' }
  );

}( window.jQuery || window.enderJS );