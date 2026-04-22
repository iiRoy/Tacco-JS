/*!
 * jq.stableHeaderGrid. The jQuery stableHeaderGrid extension
 *
 * Copyright (c) 2013 Mark Malek
 * http://fixedheadertable.com
 *
 * Permitted under MIT
 * http://www.opensource.org/licenses/mit-license.php
 *
 * http://docs.jquery.com/Plugins/Authoring
 * jQuery extension authoring guidelines
 *
 * First release : October 2009
 * Version number : 1.3
 * Published: May 9th, 2011
 *
 *
 * all visual dimensioning (breadth, height) is specified in pixels (px)
 */

(function( jQueryAlias ) {

  jQueryAlias.fn.stableHeaderGrid = function( operationType ) {

    // default plugin configuration settings
    var initialConfig = {
      panelWidth: '100%',
      panelHeight: '100%',
      styleSchemeClass: 'sgh-standard',
      borderJoin: true,
      lockedColumnsCount: 0, // number of columns fixed at the start
      legacyLockedColumn: false, // For previous compatibility
      canSort: false,
      displayAutomatically: true, // conceal grid after its generation
      hasFooterSection: false, // display bottom section
      duplicateHeaderForFooter: false, // copy top section and apply as bottom section
      adjustSizeAutomatically: false, // resize grid if its containing element changes dimensions
      onCreationComplete: null // post-plugin-initialization callback
    };

    var currentOptions = {};

    // exposed interface methods
    var publicAPI = {

      initializeGrid: function( userSettings ) {
        currentOptions = jQueryAlias.extend( {}, initialConfig, userSettings );

        // iterate through all the DOM components this extension is bound to
        return this.each(function() {
          var currentElementJq = jQueryAlias( this ); // reference to the jQuery version of the current DOM item

          if ( auxiliary._isGridElement( currentElementJq ) ) {
            publicAPI.prepareStructure.apply( this, Array.prototype.slice.call( arguments, 1 ) );
            jQueryAlias.isFunction( currentOptions.onCreationComplete ) && currentOptions.onCreationComplete.call( this );
          } else {
            jQueryAlias.error( 'Incorrect table mark-up detected' );
          }
        });
      },

      /*
       * Establish grid framework for fixed top sections and optional bottom sections
       */
      prepareStructure: function() {
        var currentElementJq      = jQueryAlias( this ),
            currentElementDom     = this,
            headerSectionJq       = currentElementJq.find( 'thead' ),
            footerSectionJq       = currentElementJq.find( 'tfoot' ),
            footerSectionHeight   = 0,
            containerWrapperJq,
            headerDivJq,
            bodyDivJq,
            lockedBodyDivJq,
            effectiveWidthNoScrollbar;

        currentOptions.initialTable = jQueryAlias( this ).clone();
        currentOptions.includeCellPadding = auxiliary._isCellPaddingPartofWidth();
        currentOptions.scrollBarWidth = auxiliary._getScrollbarDimension();
        currentOptions.styleSchemeClassName = currentOptions.styleSchemeClass;

        if ( currentOptions.panelWidth.search( '%' ) > -1 ) {
            effectiveWidthNoScrollbar = currentElementJq.parent().width() - currentOptions.scrollBarWidth;
        } else {
            effectiveWidthNoScrollbar = currentOptions.panelWidth - currentOptions.scrollBarWidth;
        }

        currentElementJq.css({
          width: effectiveWidthNoScrollbar
        });


        if ( !currentElementJq.closest( '.grid-display-container' ).length ) {
          currentElementJq.addClass( 'grid-element' );
          currentElementJq.wrap( '<div class="grid-display-container"></div>' );
        }

        containerWrapperJq = currentElementJq.closest( '.grid-display-container' );

        if ( currentOptions.legacyLockedColumn == true && currentOptions.lockedColumnsCount <= 0 ) {
          currentOptions.lockedColumnsCount = 1;
        }

        if ( currentOptions.lockedColumnsCount > 0 && containerWrapperJq.find( '.grid-locked-panel' ).length == 0 ) {
          currentElementJq.wrap( '<div class="grid-locked-body"></div>' );

          jQueryAlias( '<div class="grid-locked-panel"></div>' ).prependTo( containerWrapperJq );

          lockedBodyDivJq = containerWrapperJq.find( '.grid-locked-body' );
        }

        containerWrapperJq.css({
          width: currentOptions.panelWidth,
          height: currentOptions.panelHeight
        })
          .addClass( currentOptions.styleSchemeClassName );

        if ( !currentElementJq.hasClass( 'grid-initialized' ) ) {
          currentElementJq.wrap( '<div class="grid-body-section"></div>' );
        }

        bodyDivJq = currentElementJq.closest( '.grid-body-section' );

        var tableProperties = auxiliary._retrieveTableProperties( currentElementJq );

        auxiliary._configureClonedElement( bodyDivJq, tableProperties );

        if ( !currentElementJq.hasClass( 'grid-initialized' ) ) {
          if ( currentOptions.lockedColumnsCount > 0 ) {
            headerDivJq = jQueryAlias( '<div class="grid-header-section"><table class="grid-element"></table></div>' ).prependTo( lockedBodyDivJq );
          } else {
            headerDivJq = jQueryAlias( '<div class="grid-header-section"><table class="grid-element"></table></div>' ).prependTo( containerWrapperJq );
          }

          headerDivJq.find( 'table.grid-element' )
            .addClass( currentOptions.initialTable.attr( 'class' ) )
            .attr( 'style', currentOptions.initialTable.attr( 'style' ) );

          headerSectionJq.clone().appendTo( headerDivJq.find( 'table' ) );
        } else {
          headerDivJq = containerWrapperJq.find( 'div.grid-header-section' );
        }

        auxiliary._configureClonedElement( headerDivJq, tableProperties );

        currentElementJq.css({
          'margin-top': -headerDivJq.outerHeight( true )
        });

        /*
         * Verify for bottom section presence
         * Configure bottom section if existing
         */
        if ( currentOptions.hasFooterSection == true ) {
          auxiliary._configureGridFooter( currentElementJq, currentElementDom, tableProperties );

          if ( !footerSectionJq.length ) {
            footerSectionJq = containerWrapperJq.find( 'div.grid-footer-section table' );
          }

          footerSectionHeight = footerSectionJq.outerHeight( true );
        }

        var bodyContentHeight = containerWrapperJq.height() - headerSectionJq.outerHeight( true ) - footerSectionHeight - tableProperties.border;

        bodyDivJq.css({
          'height': bodyContentHeight
        });

        currentElementJq.addClass( 'grid-initialized' );

        if ( typeof( currentOptions.alternateRowClass ) !== 'undefined' ) {
          publicAPI.alternateRows.apply( currentElementDom );
        }

        if ( currentOptions.lockedColumnsCount > 0 ) {
          auxiliary._configureLockedColumn( currentElementJq, currentElementDom, tableProperties );
        }

        if ( !currentOptions.displayAutomatically ) {
          containerWrapperJq.hide();
        }

        auxiliary._attachScrollEvents( bodyDivJq, tableProperties );

        return currentElementDom;
      },

      /*
       * Adjust the grid dimensions
       * Incomplete - functionality not yet implemented
       */
      adjustDimensions: function() {
        var currentElementDom = this;
        return currentElementDom;
      },

      /*
       * Apply CSS class to alternating rows
       */
      alternateRows: function( customClass ) {
        var currentElementJq = jQueryAlias( this ),
        targetClass  = ( typeof( customClass ) !== 'undefined' ) ? customClass : currentOptions.alternateRowClass;

        currentElementJq.closest( '.grid-display-container' )
          .find( 'tbody tr:odd:not(:hidden)' )
          .addClass( targetClass );
      },

      /*
       * Show a hidden stableHeaderGrid grid
       */
      revealGrid: function( durationOrEffect, effectDuration, callbackFunc ) {
        var currentElementJq  = jQueryAlias( this ),
            currentElementDom   = this,
            containerWrapperJq  = currentElementJq.closest( '.grid-display-container' );

        // User supplied display time without a specific effect
        if ( typeof( durationOrEffect ) !== 'undefined' && typeof( durationOrEffect ) === 'number' ) {
          containerWrapperJq.show( durationOrEffect, function() {
            jQueryAlias.isFunction( effectDuration ) && effectDuration.call( this );
          });

          return currentElementDom;

        } else if ( typeof( durationOrEffect ) !== 'undefined' && typeof( durationOrEffect ) === 'string' &&
          typeof( effectDuration ) !== 'undefined' && typeof( effectDuration ) === 'number' ) {
          // User supplied display time with an effect

          containerWrapperJq.show( durationOrEffect, effectDuration, function() {
            jQueryAlias.isFunction( callbackFunc ) && callbackFunc.call( this );
          });

          return currentElementDom;

        }

        currentElementJq.closest( '.grid-display-container' )
          .show();
        jQueryAlias.isFunction( durationOrEffect ) && durationOrEffect.call( this );

        return currentElementDom;
      },

      /*
       * Conceal a stableHeaderGrid grid
       */
      concealGrid: function( durationOrEffect, effectDuration, callbackFunc ) {
        var currentElementJq    = jQueryAlias( this ),
            currentElementDom   = this,
            containerWrapperJq  = currentElementJq.closest( '.grid-display-container' );

        // User supplied display time without a specific effect
        if ( typeof( durationOrEffect ) !== 'undefined' && typeof( durationOrEffect ) === 'number' ) {
          containerWrapperJq.hide( durationOrEffect, function() {
            jQueryAlias.isFunction( callbackFunc ) && callbackFunc.call( this );
          });

          return currentElementDom;
        } else if ( typeof( durationOrEffect ) !== 'undefined' && typeof( durationOrEffect ) === 'string' &&
          typeof( effectDuration ) !== 'undefined' && typeof( effectDuration ) === 'number' ) {

          containerWrapperJq.hide( durationOrEffect, effectDuration, function() {
            jQueryAlias.isFunction( callbackFunc ) && callbackFunc.call( this );
          });

          return currentElementDom;
        }

        currentElementJq.closest( '.grid-display-container' )
          .hide();

        jQueryAlias.isFunction( callbackFunc ) && callbackFunc.call( this );

        return currentElementDom;
      },

      /*
       * Terminate stableHeaderGrid and revert grid to its initial condition
       */
      removeGrid: function() {
        var currentElementJq  = jQueryAlias( this ),
            currentElementDom = this,
            containerWrapperJq = currentElementJq.closest( '.grid-display-container' );

        currentElementJq.insertBefore( containerWrapperJq )
          .removeAttr( 'style' )
          .append( containerWrapperJq.find( 'tfoot' ) )
          .removeClass( 'grid-element grid-initialized' )
          .find( '.grid-cell-placeholder' )
          .remove();

        containerWrapperJq.remove();

        return currentElementDom;
      }

    };

    // internal utility methods
    var auxiliary = {

      /*
       * returns boolean
       * True if both a thead and tbody are present.
       */
      _isGridElement: function( targetObjectJq ) {
        var currentTarget   = targetObjectJq,
            isActualTable   = currentTarget.is( 'table' ),
            hasHeadElement  = currentTarget.find( 'thead' ).length > 0,
            hasBodyElement  = currentTarget.find( 'tbody' ).length > 0;

        if ( isActualTable && hasHeadElement && hasBodyElement ) {
          return true;
        }

        return false;

      },

      /*
       * returns void
       * attach scroll event listeners
       */
      _attachScrollEvents: function( scrollableElementJq ) {
        var currentScrollElement  = scrollableElementJq,
            parentContainerJq     = currentScrollElement.closest( '.grid-display-container' ),
            headerCloneJq         = currentScrollElement.siblings( '.grid-header-section' ),
            footerCloneJq         = currentScrollElement.siblings( '.grid-footer-section' );

        currentScrollElement.bind( 'scroll', function() {
          if ( currentOptions.lockedColumnsCount > 0 ) {
            var lockedSectionsJq = parentContainerJq.find( '.grid-locked-panel' );

            lockedSectionsJq.find( '.grid-body-section table' )
              .css({
                  'margin-top': -currentScrollElement.scrollTop()
              });
          }

          headerCloneJq.find( 'table' )
            .css({
              'margin-left': -this.scrollLeft
            });

          if ( currentOptions.hasFooterSection || currentOptions.duplicateHeaderForFooter ) {
            footerCloneJq.find( 'table' )
              .css({
                'margin-left': -this.scrollLeft
              });
          }
        });
      },

      /*
       * returns void
       */
      _adjustHeightStyling: function( elementToAdjustJq, gridDimensions ) {
        if ( currentOptions.includeCellPadding ) {
          elementToAdjustJq.css({
            'height': elementToAdjustJq.height() + gridDimensions.border
          });
        } else {
          elementToAdjustJq.css({
            'height': elementToAdjustJq.parent().height() + gridDimensions.border
          });
        }
      },

      /*
       * returns void
       */
      _adjustWidthStyling: function( elementToAdjustJq, gridDimensions, explicitWidth ) {
        if ( currentOptions.includeCellPadding ) {
          elementToAdjustJq.each( function() {
            jQueryAlias( this ).css({
              'width': explicitWidth == undefined ? jQueryAlias( this ).width() + gridDimensions.border : explicitWidth + gridDimensions.border
            });
          });
        } else {
          elementToAdjustJq.each( function() {
            jQueryAlias( this ).css({
              'width': explicitWidth == undefined ? jQueryAlias( this ).parent().width() + gridDimensions.border : explicitWidth + gridDimensions.border
            });
          });
        }

      },

      /*
       * returns void
       */
      _configureLockedColumn: function( mainTableJq, mainTableDom, gridDimensions ) {
        var currentMainTable      = mainTableJq,
            outerContainerJq      = currentMainTable.closest( '.grid-display-container' ),
            lockedContentAreaJq   = outerContainerJq.find( '.grid-locked-body' ),
            lockedPanelJq         = outerContainerJq.find( '.grid-locked-panel' ),
            headPanelJq           = jQueryAlias( '<div class="grid-header-section"><table class="grid-element"><thead><tr></tr></thead></table></div>' ),
            bodyPanelJq           = jQueryAlias( '<div class="grid-body-section"><table class="grid-element"><tbody></tbody></table></div>' ),
            footPanelJq           = jQueryAlias( '<div class="grid-footer-section"><table class="grid-element"><tfoot><tr></tr></tfoot></table></div>' ),
            contentAreaBreadth    = outerContainerJq.width(),
            contentAreaHeight     = lockedContentAreaJq.find( '.grid-body-section' ).height() - currentOptions.scrollBarWidth,
            initialHeaderCellsJq,
            initialBodyCellsJq,
            lockedPanelBreadth,
            newTableRowJq,
            initialBodyCellSelector;

        headPanelJq.find( 'table.grid-element' ).addClass( currentOptions.initialTable.attr( 'class' ) );
        bodyPanelJq.find( 'table.grid-element' ).addClass( currentOptions.initialTable.attr( 'class' ) );
        footPanelJq.find( 'table.grid-element' ).addClass( currentOptions.initialTable.attr( 'class' ) );

        initialHeaderCellsJq = lockedContentAreaJq.find( '.grid-header-section thead tr > *:lt(' + currentOptions.lockedColumnsCount + ')' );
        lockedPanelBreadth = currentOptions.lockedColumnsCount * gridDimensions.border;
        initialHeaderCellsJq.each( function() {
          lockedPanelBreadth += jQueryAlias( this ).outerWidth( true );
        });

        // Correct cell heights
        auxiliary._adjustHeightStyling( initialHeaderCellsJq, gridDimensions );
        auxiliary._adjustWidthStyling( initialHeaderCellsJq, gridDimensions );

        var columnWidthArray = [];
        initialHeaderCellsJq.each( function() {
          columnWidthArray.push( jQueryAlias( this ).width() );
        });

        initialBodyCellSelector = 'tbody tr > *:not(:nth-child(n+' + ( currentOptions.lockedColumnsCount + 1 ) + '))';
        initialBodyCellsJq = lockedContentAreaJq.find( initialBodyCellSelector )
          .each( function( cellIndex ) {
            auxiliary._adjustHeightStyling( jQueryAlias( this ), gridDimensions );
            auxiliary._adjustWidthStyling( jQueryAlias( this ), gridDimensions, columnWidthArray[ cellIndex % currentOptions.lockedColumnsCount ] );
          });

        // duplicate header
        headPanelJq.appendTo( lockedPanelJq )
          .find( 'tr' )
          .append( initialHeaderCellsJq.clone() );

        bodyPanelJq.appendTo( lockedPanelJq )
          .css({
            'margin-top': -1,
            'height': contentAreaHeight + gridDimensions.border
          });

        initialBodyCellsJq.each( function( cellIndex ) {
          if ( cellIndex % currentOptions.lockedColumnsCount == 0 ) {
            newTableRowJq = jQueryAlias( '<tr></tr>' ).appendTo( bodyPanelJq.find( 'tbody' ) );

            if ( currentOptions.alternateRowClass && jQueryAlias( this ).parent().hasClass( currentOptions.alternateRowClass ) ) {
              newTableRowJq.addClass( currentOptions.alternateRowClass );
            }
          }

          jQueryAlias( this ).clone()
            .appendTo( newTableRowJq );
        });

        // establish width of fixed column container
        lockedPanelJq.css({
          'height': 0,
          'width': lockedPanelBreadth
        });


        // attach mousewheel interactions
        var maximumScrollPosition = lockedPanelJq.find( '.grid-body-section .grid-element' ).height() - lockedPanelJq.find( '.grid-body-section' ).height();
        lockedPanelJq.find( '.grid-body-section .grid-element' ).bind( 'mousewheel', function( eventObject, scrollDelta, deltaXcoord, deltaYcoord ) {
          if ( deltaYcoord == 0 ) {
            return;
          }
          var topPosition = parseInt( jQueryAlias( this ).css( 'marginTop' ), 10 ) + ( scrollDelta > 0 ? 120 : -120 );
          if ( topPosition > 0 ) {
            topPosition = 0;
          }
          if ( topPosition < -maximumScrollPosition ) {
            topPosition = -maximumScrollPosition;
          }
          jQueryAlias( this ).css( 'marginTop', topPosition );
          lockedContentAreaJq.find( '.grid-body-section' ).scrollTop( -topPosition ).scroll();
          return false;
        });


        // establish width of main content table container
        lockedContentAreaJq.css({
          'width': contentAreaBreadth
        });

        // configure duplicated bottom section with fixed column
        if ( currentOptions.hasFooterSection == true || currentOptions.duplicateHeaderForFooter == true ) {
          var initialFooterCellsJq = lockedContentAreaJq.find( '.grid-footer-section tr > *:lt(' + currentOptions.lockedColumnsCount + ')' ),
              footerBreadth;

          auxiliary._adjustHeightStyling( initialFooterCellsJq, gridDimensions );
          footPanelJq.appendTo( lockedPanelJq )
            .find( 'tr' )
            .append( initialFooterCellsJj.clone() );
          // Set (visible width) of footPanelJq div to the table's width (this accounts for footers with a colspan attribute)
          // The previous line of code was incomplete in the original, so this comment is also incomplete.
        }
      },

      /*
       * Determines table properties such as border and padding.
       * returns object with table properties
       */
      _retrieveTableProperties: function( targetTableJq ) {
        var tableBorder = 0,
            tablePadding = 0,
            headerProperties = {},
            bodyProperties = {},
            footerProperties = {};

        if ( currentOptions.borderJoin == true ) {
          tableBorder = 1;
        }

        // Retrieve border and padding from the first data cell
        targetTableJq.find( 'th, td' ).each( function() {
          tablePadding = ( parseInt( jQueryAlias( this ).css( 'padding-left' ), 10 ) + parseInt( jQueryAlias( this ).css( 'padding-right' ), 10 ) );
          return false;
        });

        return {
          border: tableBorder,
          padding: tablePadding,
          headerProps: headerProperties,
          bodyProps: bodyProperties,
          footerProps: footerProperties
        };
      },

      /*
       * Configures a cloned table element by setting its attributes and styles.
       * returns void
       */
      _configureClonedElement: function( clonedContainerJq, gridDimensions ) {
        var newTableElementJq = clonedContainerJq.find( 'table' ),
            originalTableJq   = currentOptions.initialTable;

        newTableElementJq
          .attr( 'class', originalTableJq.attr( 'class' ) )
          .attr( 'style', originalTableJq.attr( 'style' ) );

        if ( currentOptions.borderJoin == true ) {
          newTableElementJq.css({
            'border-collapse': 'collapse'
          });
        }

        // Clone cell specific styles
        newTableElementJq.find( 'th, td' ).each( function() {
          var currentCell = jQueryAlias( this );
          currentCell.addClass( 'grid-cell-placeholder' ); // Mark as a cloned cell
          auxiliary._adjustWidthStyling( currentCell, gridDimensions );
          auxiliary._adjustHeightStyling( currentCell, gridDimensions );
        });
      },

      /*
       * Sets up the table's footer section, either by cloning the existing footer
       * or by duplicating the header if specified.
       * returns void
       */
      _configureGridFooter: function( mainTableJq, mainTableDom, gridDimensions ) {
        var outerContainerJq  = mainTableJq.closest( '.grid-display-container' ),
            footerSectionJq   = mainTableJq.find( 'tfoot' ),
            footerDivJq;

        if ( !footerSectionJq.length ) {
          if ( currentOptions.duplicateHeaderForFooter == true ) {
            footerSectionJq = currentOptions.initialTable.find( 'thead' );
          } else {
            return; // No footer found or specified
          }
        }

        footerDivJq = jQueryAlias( '<div class="grid-footer-section"><table class="grid-element"></table></div>' ).appendTo( outerContainerJq );
        footerDivJq.find( 'table.grid-element' )
          .addClass( currentOptions.initialTable.attr( 'class' ) )
          .attr( 'style', currentOptions.initialTable.attr( 'style' ) );
        footerSectionJq.clone().appendTo( footerDivJq.find( 'table' ) );

        auxiliary._configureClonedElement( footerDivJq, gridDimensions );
      },

      /*
       * Checks if browser's box model includes padding in width calculations.
       * returns boolean
       */
      _isCellPaddingPartofWidth: function() {
        var element = jQueryAlias( '<div style="width:50px;height:50px;padding:10px;position:absolute;top:-1000px;left:-1000px;"></div>' );
        element.appendTo( 'body' );
        var boxSizing = ( element.width() == 50 );
        element.remove();
        return boxSizing;
      },

      /*
       * Calculates the width of the browser's scrollbar.
       * returns number (pixels)
       */
      _getScrollbarDimension: function() {
        var scrollDiv = document.createElement( 'div' );
        scrollDiv.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;';
        document.body.appendChild( scrollDiv );
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild( scrollDiv );
        return scrollbarWidth;
      }
    };

    // If a method call is requested
    if ( publicAPI[ operationType ] ) {
      return publicAPI[ operationType ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    } else if ( typeof operationType === 'object' || ! operationType ) {
      // If no method is specified, or a settings object is passed, initialize the plugin
      return publicAPI.initializeGrid.apply( this, arguments );
    } else {
      // If an invalid method is called
      jQueryAlias.error( 'Method ' +  operationType + ' does not exist on jQuery.stableHeaderGrid' );
    }

  };

})( jQuery );