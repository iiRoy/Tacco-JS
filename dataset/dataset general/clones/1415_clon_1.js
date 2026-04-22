/*
 * This file is an extension to jQuery UI selectable.
 * It provides scrolling functionality when selecting elements
 * outside the visible area of the container.
 *
 * Authored by László Károlyi.
 * Contact: http://linkedin.com/in/karolyi
 *
 * Distributed under the GPLv3 License.
 * License URL: http://opensource.org/licenses/GPL-3.0
 *
 * This software is free; you are permitted to redistribute and/or
 * modify it according to the terms of the GNU General Public License,
 * version 3, or any later version at your discretion.
 *
 * This software is provided "AS IS", without any express or implied warranty.
 * This includes, but is not limited to, the implied warranties of
 * MERCHANTABILITY and FITNESS FOR A PARTICULAR PURPOSE.
 * Refer to the GNU General Public License for comprehensive details.
 *
 * If you have not received a copy of the GNU General Public License,
 * please visit <http://www.gnu.org/licenses/>.
 */

/*global jQuery*/

( function ( $ ) {

  'use strict';

  $.widget( 'ui.selectableScroll', $.ui.selectable, {

    options: {
      // Specify an element here to use it for scrolling instead of the widget's own element.
      scrollElement: null,
      // Defines the proximity in pixels to the top/bottom edges
      // at which scrolling should commence during selection.
      scrollSnapX: 5,
      // Defines the proximity in pixels to the left/right edges
      // at which scrolling should commence during selection.
      scrollSnapY: 5,
      scrollAmount: 25, // Measured in pixels per scroll step.
      scrollIntervalTime: 100 // Interval in milliseconds for continuous scrolling.
    },

    /*
     * This function is a modified version of the original `_create` method.
     * Its primary addition is the inclusion of the element's relative positions.
     *
     * @returns {void} No explicit return value.
     */
    _create: function ( ) {

      this.element.addClass( 'ui-selectable' );

      this.dragged = false;

      this.helperClasses = [
        'no-top',
        'no-right',
        'no-bottom',
        'no-left'
      ];

      this.scrollElement = this.options.scrollElement || this.element;

      this.refresh( );

      this._mouseInit( );

      this.helper = $( '<div class="ui-selectable-helper"></div>' );

    },


    /*
     * Caches the child elements designated as 'selectees' based on the specified filter.
     * This method is crucial for updating the list of selectable items.
     *
     * @returns {void}
     */
    refresh: function ( ) {

      var elementOffset = this.scrollElement.offset( );

      var scrollLeft = this.scrollElement.prop( 'scrollLeft' );

      var scrollTop = this.scrollElement.prop( 'scrollTop' );

      this.selectees = $( this.options.filter, this.scrollElement[ 0 ] );

      this.selectees.addClass( 'ui-selectee' );

      this.selectees.each( function ( ) {

        var $element = $( this ),
            pos = $element.offset( );

        $.data( this, 'selectable-item', {
          element: this,
          $element: $element,
          left: pos.left,
          top: pos.top,
          right: pos.left + $element.outerWidth( ),
          bottom: pos.top + $element.outerHeight( ),
          // Relative positions calculated with respect to the element's 0,0 origin.
          relative: {
            left: pos.left - elementOffset.left + scrollLeft,
            top: pos.top - elementOffset.top + scrollTop,
            right: pos.left - elementOffset.left + scrollLeft + $element.outerWidth( ),
            bottom: pos.top - elementOffset.top + scrollTop + $element.outerHeight( )
          },
          startselected: false,
          selected: $element.hasClass( 'ui-selected' ),
          selecting: $element.hasClass( 'ui-selecting' ),
          unselecting: $element.hasClass( 'ui-unselecting' )
        } );

      } );

    },


    /*
     * Initiates the dragging process.
     * It calculates and stores the element's current scroll states
     * relative to its 0,0 offset at the beginning of a drag operation.
     *
     * @param {object} event - The mousedown event object that triggered the drag.
     * @returns {boolean} The return value of the parent's `_mouseStart` method.
     */
    _mouseStart: function ( event ) {

      var pos = this.scrollElement.offset( );

      if ( ( event.pageX > this.scrollElement.prop( 'clientWidth' ) + pos.left ) ||
           ( event.pageY > this.scrollElement.prop( 'clientHeight' ) + pos.top ) ) {

        return false;

      }

      var retValue = $.ui.selectable.prototype._mouseStart.call( this, event );

      this.lastDragEvent = null;

      this.scrollInfo = {
        // The element's 0,0 offset relative to the document element.
        elementOffset: this.scrollElement.offset( ),
        // The total scrollable width (visible width plus current scrollLeft).
        scrollWidth: this.scrollElement.prop( 'scrollWidth' ),
        // The total scrollable height (visible height plus current scrollTop).
        scrollHeight: this.scrollElement.prop( 'scrollHeight' ),
        // The visible width of the element, excluding scrollbars.
        elementWidth: this.scrollElement.prop( 'clientWidth' ),
        // The visible height of the element, excluding scrollbars.
        elementHeight: this.scrollElement.prop( 'clientHeight' )
      };

      // Drag start X position, relative to the element's 0.
      this.scrollInfo.dragStartXPos = event.pageX - this.scrollInfo.elementOffset.left +
                                      this.scrollElement.prop( 'scrollLeft' );

      // Drag start Y position, relative to the element's 0.
      this.scrollInfo.dragStartYPos = event.pageY - this.scrollInfo.elementOffset.top +
                                      this.scrollElement.prop( 'scrollTop' );

      this.scrollIntervalId = null;

      return retValue;

    },


    /*
     * Calculates and redraws the helper lasso.
     * Ensures the helper remains confined within the boundaries of the scrolled element.
     *
     * @param {object} options - An object containing the relative positions of the selected rectangle.
     * @returns {void}
     */
    _updateHelper: function ( options ) {

      var x1, y1, x2, y2; // Absolute pixel positions for the lasso helper.

      var lassoClassesArray = [ ];

      if ( options.x1 - options.scrollLeft < 0 ) {

        lassoClassesArray.push( 'no-left' );
        x1 = this.scrollInfo.elementOffset.left;

      } else {

        x1 = this.scrollInfo.elementOffset.left + options.x1 - options.scrollLeft;

      }

      if ( options.y1 - options.scrollTop < 0 ) {

        lassoClassesArray.push( 'no-top' );
        y1 = this.scrollInfo.elementOffset.top;

      } else {

        y1 = this.scrollInfo.elementOffset.top + options.y1 - options.scrollTop;

      }

      if ( options.x2 - options.scrollLeft > this.scrollInfo.elementWidth ) {

        lassoClassesArray.push( 'no-right' );
        x2 = this.scrollInfo.elementOffset.left + this.scrollInfo.elementWidth;

      } else {

        x2 = this.scrollInfo.elementOffset.left + options.x2 - options.scrollLeft;

      }

      if ( options.y2 - options.scrollTop > this.scrollInfo.elementHeight ) {

        lassoClassesArray.push( 'no-bottom' );
        y2 = this.scrollInfo.elementOffset.top + this.scrollInfo.elementHeight;

      } else {

        y2 = this.scrollInfo.elementOffset.top + options.y2 - options.scrollTop;

      }

      for ( var counter = 0; counter < this.helperClasses.length; counter++ ) {

        var className = this.helperClasses[ counter ];

        if ( $.inArray( className, lassoClassesArray ) !== -1 ) {

          this.helper.addClass( className );

        } else {

          this.helper.removeClass( className );

        }

      }

      this.helper.css( {
        left: x1,
        top: y1,
        width: x2 - x1,
        height: y2 - y1
      } );

    },


    /*
     * Determines if scrolling is necessary based on mouse position relative to element edges.
     * If the mouse cursor is close to the edges of the selectable area,
     * this function initiates a scroll action.
     *
     * @returns {object} An object containing the new `scrollLeft` and `scrollTop` values,
     *                   and a boolean indicating if continuous scrolling should be maintained.
     */
    _scrollIfNeeded: function ( options ) {

      var scrollLeft = this.scrollElement.prop( 'scrollLeft' );

      var scrollTop = this.scrollElement.prop( 'scrollTop' );

      var keepScrolling = false;

      // Scroll left if close to the left edge or beyond, and not at the leftmost scroll position.
      if ( this.lastDragEvent.pageX - this.scrollInfo.elementOffset.left < this.options.scrollSnapX && scrollLeft > 0 ) {

        scrollLeft = scrollLeft < this.options.scrollAmount ? 0 :
                     scrollLeft - this.options.scrollAmount;

        this.scrollElement.prop( 'scrollLeft', scrollLeft );

        keepScrolling = true;

      }

      // Scroll up if close to the top edge or beyond, and not at the topmost scroll position.
      if ( this.lastDragEvent.pageY - this.scrollInfo.elementOffset.top < this.options.scrollSnapY && scrollTop > 0 ) {

        scrollTop = scrollTop < this.options.scrollAmount ? 0 :
                    scrollTop - this.options.scrollAmount;

        this.scrollElement.prop( 'scrollTop', scrollTop );

        keepScrolling = true;

      }

      // Scroll right if close to the right edge or beyond, and not at the rightmost scroll position.
      if ( this.lastDragEvent.pageX - this.scrollInfo.elementOffset.left >
           this.scrollInfo.elementWidth - this.options.scrollSnapX &&
           this.scrollInfo.scrollWidth > scrollLeft + this.scrollInfo.elementWidth ) {

        scrollLeft = scrollLeft + this.options.scrollAmount > this.scrollInfo.scrollWidth - this.scrollInfo.elementWidth ?
                     this.scrollInfo.scrollWidth - this.scrollInfo.elementWidth :
                     scrollLeft + this.options.scrollAmount;

        this.scrollElement.prop( 'scrollLeft', scrollLeft );

        keepScrolling = true;

      }

      // Scroll down if close to the bottom edge or beyond, and not at the bottommost scroll position.
      if ( this.lastDragEvent.pageY - this.scrollInfo.elementOffset.top >
           this.scrollInfo.elementHeight - this.options.scrollSnapY &&
           this.scrollInfo.scrollHeight > scrollLeft + this.scrollInfo.elementHeight ) {

        scrollTop = scrollTop + this.options.scrollAmount > this.scrollInfo.scrollHeight - this.scrollInfo.elementHeight ?
                    this.scrollInfo.scrollHeight - this.scrollInfo.elementHeight :
                    scrollTop + this.options.scrollAmount;

        this.scrollElement.prop( 'scrollTop', scrollTop );

        keepScrolling = true;

      }

      return {
        scrollLeft: scrollLeft,
        scrollTop: scrollTop,
        keepScrolling: keepScrolling
      };

    },


    /*
     * Calculates a relative position with respect to the element's 0,0 offset.
     * This is derived from the original drag event's absolute coordinates.
     *
     * @param {object} options - An object containing the absolute X and Y positions (`x`, `y`).
     * @returns {object} An object containing the calculated relative X (`x`) and Y (`y`) positions.
     */
    _calcRelativePosition: function ( options ) {

      var relXPos = options.x - this.scrollInfo.elementOffset.left + options.scrollLeft;

      var relYPos = options.y - this.scrollInfo.elementOffset.top + options.scrollTop;

      return {
        x: relXPos,
        y: relYPos
      };

    },


    /*
     * Calculates the relative area positions based on the offset element.
     * This determines the bounding box for the current selection.
     *
     * @param {object} options - An object containing the relative X (`xPos`) and Y (`yPos`)
     *                           positions relative to the element's 0,0 origin.
     * @returns {object} An object containing the relative area coordinates:
     *                   `x1`, `y1` (top-left) and `x2`, `y2` (bottom-right).
     */
    _calcRelativeArea: function ( options ) {

      var relX1 = options.xPos < this.scrollInfo.dragStartXPos ? options.xPos : this.scrollInfo.dragStartXPos;

      var relY1 = options.yPos < this.scrollInfo.dragStartYPos ? options.yPos : this.scrollInfo.dragStartYPos;

      var relX2 = options.xPos > this.scrollInfo.dragStartXPos ? options.xPos : this.scrollInfo.dragStartXPos;

      var relY2 = options.yPos > this.scrollInfo.dragStartYPos ? options.yPos : this.scrollInfo.dragStartYPos;

      return {
        x1: relX1,
        y1: relY1,
        x2: relX2,
        y2: relY2
      };

    },


    /*
     * Updates the selection state of individual elements ('selectees').
     * It determines which elements fall within the current selection area
     * and applies appropriate UI classes ('ui-selecting', 'ui-selected', 'ui-unselecting').
     *
     * @param {object} options - The return value object from `_calcRelativeArea()`,
     *                           containing `x1`, `y1`, `x2`, `y2`.
     * @returns {void}
     */
    _updateSelectees: function ( options ) {

      var that = this;

      this.selectees.each( function ( ) {

        var selectee = $.data( this, 'selectable-item' ),
            hit = false;

        // Prevent the helper element itself from being selected if it's appended to the selectable.
        if ( !selectee || selectee.element === that.element[ 0 ] ) {
          return;
        }

        if ( that.options.tolerance === 'touch' ) {

          hit = ( !( selectee.relative.left > options.x2 ||
                      selectee.relative.right < options.x1 ||
                      selectee.relative.top > options.y2 ||
                      selectee.relative.bottom < options.y1 ) );

        } else if ( that.options.tolerance === 'fit' ) {

          hit = ( selectee.relative.left > options.x1 &&
                  selectee.relative.right < options.x2 &&
                  selectee.relative.top > options.y1 &&
                  selectee.relative.bottom < options.y2 );

        }

        if ( hit ) {
          // SELECT operation.
          if ( selectee.selected ) {
            selectee.$element.removeClass( 'ui-selected' );
            selectee.selected = false;
          }
          if ( selectee.unselecting ) {
            selectee.$element.removeClass( 'ui-unselecting' );
            selectee.unselecting = false;
          }
          if ( !selectee.selecting ) {
            selectee.$element.addClass( 'ui-selecting' );
            selectee.selecting = true;
            // Trigger the 'selecting' callback for selectable.
            that._trigger( 'selecting', that.lastDragEvent, {
              selecting: selectee.element
            } );
          }
        } else {
          // UNSELECT operation.
          if ( selectee.selecting ) {

            if ( ( that.lastDragEvent.metaKey || that.lastDragEvent.ctrlKey ) &&
                 selectee.startselected ) {

              selectee.$element.removeClass( 'ui-selecting' );
              selectee.selecting = false;
              selectee.$element.addClass( 'ui-selected' );
              selectee.selected = true;

            } else {

              selectee.$element.removeClass( 'ui-selecting' );
              selectee.selecting = false;

              if ( selectee.startselected ) {
                selectee.$element.addClass( 'ui-unselecting' );
                selectee.unselecting = true;
              }

              // Trigger the 'unselecting' callback for selectable.
              that._trigger( 'unselecting', that.lastDragEvent, {
                unselecting: selectee.element
              } );

            }

          }

          if ( selectee.selected ) {

            if ( !that.lastDragEvent.metaKey && !that.lastDragEvent.ctrlKey &&
                 !selectee.startselected ) {

              selectee.$element.removeClass( 'ui-selected' );
              selectee.selected = false;

              selectee.$element.addClass( 'ui-unselecting' );
              selectee.unselecting = true;

              // Trigger the 'unselecting' callback for selectable.
              that._trigger( 'unselecting', that.lastDragEvent, {
                unselecting: selectee.element
              } );

            }

          }

        }

      } );

    },


    /*
     * This function overrides the original `_mouseDrag` method.
     * It handles the continuous dragging process, including scrolling and UI updates.
     *
     * @param {object} event - The original mousemove event object.
     * @returns {boolean} Returns `false` to prevent default browser behavior,
     *                    consistent with the parent method's return.
     */
    _mouseDrag: function ( event ) {

      this.dragged = true;

      if ( this.options.disabled ) {
        return;
      }

      this.lastDragEvent = event;

      var scrollObj = this._scrollIfNeeded( );

      this._updateIntervals( {
        keepScrolling: scrollObj.keepScrolling
      } );

      this._updateUi( {
        doUpdateHelper: true
      } );

      return false;

    },


    /*
     * Performs the actual calculations and updates for element positions and states.
     * This method orchestrates the helper lasso, relative positions,
     * and selectee updates during a drag operation.
     *
     * @param {object} options - An object indicating whether the helper lasso should be updated (`doUpdateHelper`).
     * @returns {void}
     */
    _updateUi: function ( options ) {

      var scrollObj = this._scrollIfNeeded( {
        pageX: this.lastDragEvent.pageX,
        pageY: this.lastDragEvent.pageY
      } );

      var relativePos = this._calcRelativePosition( {
        x: this.lastDragEvent.pageX,
        y: this.lastDragEvent.pageY,
        scrollLeft: scrollObj.scrollLeft,
        scrollTop: scrollObj.scrollTop
      } );

      var relativeArea = this._calcRelativeArea( {
        xPos: relativePos.x,
        yPos: relativePos.y
      } );

      if ( options.doUpdateHelper ) {

        this._updateHelper( {
          scrollLeft: scrollObj.scrollLeft,
          scrollTop: scrollObj.scrollTop,
          x1: relativeArea.x1,
          y1: relativeArea.y1,
          x2: relativeArea.x2,
          y2: relativeArea.y2
        } );

      }

      this._updateSelectees( {
        x1: relativeArea.x1,
        y1: relativeArea.y1,
        x2: relativeArea.x2,
        y2: relativeArea.y2
      } );

    },


    /*
     * Manages the automatic scrolling interval.
     * If continuous scrolling is needed and not active, it starts the interval.
     * If scrolling is no longer needed but the interval is active, it clears it.
     *
     * @param {object} options - An object containing a boolean `keepScrolling`
     *                           to indicate whether the auto-scroll interval should be active.
     * @returns {void}
     */
    _updateIntervals: function ( options ) {

      var that = this;

      if ( options.keepScrolling && !this.scrollIntervalId ) {

        this.scrollIntervalId = setInterval( function ( ) {

          that._updateUi( {
            doUpdateHelper: false
          } );

        }, this.options.scrollIntervalTime );

      }

      if ( !options.keepScrolling && this.scrollIntervalId ) {
        this._clearIntervals( );
      }

    },


    /*
     * Clears the active auto-scroll interval, effectively stopping continuous scrolling.
     *
     * @returns {void}
     */
    _clearIntervals: function ( ) {

      // Stop any ongoing scrolling interval.
      if ( this.scrollIntervalId ) {
        clearInterval( this.scrollIntervalId );
      }

      this.scrollIntervalId = null;

    },


    /*
     * Extends the original `_mouseStop` event handler.
     * This version adds functionality to clear any active auto-scroll intervals
     * when the mouse dragging operation concludes.
     *
     * @param {object} event - The original mousestop event object.
     * @returns {boolean} The return value from the parent's `_mouseStop` method.
     */
    _mouseStop: function ( event ) {

      this._clearIntervals( );

      var retValue = $.ui.selectable.prototype._mouseStop.call( this, event );

      return retValue;

    }

  } );

} )( jQuery );