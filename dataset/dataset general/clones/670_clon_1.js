( function ($) {
// This file is an extension for jqGrid, providing functionality for form editing Grid Data.
// It was originally developed by Tony Tomov (tony@trirand.com) and is available at http://trirand.com/blog/.
// The code is dual licensed under the MIT and GPL licenses.
// Please refer to the following URLs for license details:
// MIT License: http://www.opensource.org/licenses/mit-license.php
// GPL License: http://www.gnu.org/licenses/gpl-2.0.html
//
// Global variables that may be used by this script include xmlJsonClass, jQuery, and $.
//
var rp_ge = {}; // An object to store runtime parameters for grid editing.


$.jgrid.extend( {

  searchGrid : function (p) {
    p = $.extend( true, { // Deep merge for search options
      recreateFilter:    false,
      drag:              true,
      sField:            'searchField',
      sValue:            'searchString',
      sOper:             'searchOper',
      sFilter:           'filters',
      // The 'loadDefaults' option enables loading default filters from the grid's postData,
      // specifically for the Multiple Search feature.
      loadDefaults:      true,
      beforeShowSearch:  null,
      afterShowSearch:   null,
      onInitializeSearch:null,
      afterRedraw:       null,
      closeAfterSearch:  false,
      closeAfterReset:   false,
      closeOnEscape:     false,
      multipleSearch:    false, // Controls if multiple search rules are allowed
      multipleGroup:     false, // Controls if multiple search rule groups are allowed
      // The 'cloneSearchRowOnAdd' option is currently commented out.
      // cloneSearchRowOnAdd: true,
      top:               0,
      left:              0,
      jqModal:           true,
      modal:             false,
      resize:            true,
      width:             450,
      height:            'auto',
      dataheight:        'auto',
      showQuery:         false, // Displays the generated query string
      errorcheck:        true,
      // Options for search operators (sopt array).
      // If you need to modify or remove the order of operators,
      // do so within the 'sopt' array definition.
      // Example: ['eq','ne','lt','le','gt','ge','bw','bn','in','ni','ew','en','cn','nc'],
      sopt:              null,
      stringResult:      undefined, // Determines if the filter result is a string
      onClose:           null,
      onSearch:          null,
      onReset:           null,
      toTop:             true,
      overlay:           30,
      columns:           [],
      tmplNames:         null,
      tmplFilters:       null,
      // Template label for translations (will be loaded from a language file later).
      tmplLabel:         ' Template: ',
      showOnLoad:        false, // Whether to show the search dialog on load
      layer:             null
    }, $.jgrid.search, p || {});

    // Iterate over each selected grid element
    return this.each( function () {
      var $t = this; // Reference to the current grid instance

      // Exit if the grid is not initialized
      if ( ! $t.grid ) {
        return;
      }

      var fid         = "fbox_" + $t.p.id,
          showFrm     = true,
          IDs         = {
            themodal:    'searchmod' + fid,
            modalhead:   'searchhd' + fid,
            modalcontent:'searchcnt' + fid,
            scrollelm:   fid
          },
          // Retrieve default filters from postData, if available
          defaultFilters = $t.p.postData[p.sFilter];

      // If default filters are a string, parse them into an object
      if ( typeof(defaultFilters) === "string" ) {
        defaultFilters = $.jgrid.parse(defaultFilters);
      }

      // If 'recreateFilter' is true, remove any existing modal before proceeding
      if ( p.recreateFilter === true ) {
        $( "#" + IDs.themodal ).remove();
      }

      // Helper function to display the filter dialog
      function showFilter() {
        var formElement = $( "#" + fid );
        // Execute 'beforeShowSearch' callback if defined
        if ( $.isFunction(p.beforeShowSearch) ) {
          showFrm = p.beforeShowSearch(formElement);
          // Ensure showFrm is true if the callback returns undefined
          if ( typeof(showFrm) === "undefined" ) {
            showFrm = true;
          }
        }

        // If 'showFrm' is true, display the modal
        if ( showFrm ) {
          $.jgrid.viewModal( "#" + IDs.themodal, {
            gbox:    "#gbox_" + fid,
            jqm:     p.jqModal,
            modal:   p.modal,
            overlay: p.overlay,
            toTop:   p.toTop
          });
          // Execute 'afterShowSearch' callback if defined
          if ( $.isFunction(p.afterShowSearch) ) {
            p.afterShowSearch(formElement);
          }
        }
      }

      // Check if the modal already exists
      if ( $( "#" + IDs.themodal ).html() !== null ) {
        showFilter(); // If it exists, just show it
      } else {
        // If the modal doesn't exist, create it
        var fil = $( "<div><div id='" + fid + "' class='searchFilter' style='overflow:auto'></div></div>" )
          .insertBefore( "#gview_" + $t.p.id ),
          align   = "left", // Default alignment for buttons
          butleft = "";     // Styles for left-aligned buttons

        // Adjust alignment for RTL grids
        if ( $t.p.direction == "rtl" ) {
          align   = "right";
          butleft = " style='text-align:left'";
          fil.attr( "dir", "rtl" );
        }

        // Execute 'onInitializeSearch' callback if defined
        if ( $.isFunction(p.onInitializeSearch) ) {
          p.onInitializeSearch( $( "#" + fid ) );
        }

        var columns = $.extend( [], $t.p.colModel ), // Clone column model
            // Define search button HTML
            bS      = "<a href='javascript:void(0)' id='" + fid + "_search' class='fm-button ui-state-default ui-corner-all fm-button-icon-right ui-reset'><span class='ui-icon ui-icon-search'></span>" + p.Find + "</a>",
            // Define reset button HTML
            bC      = "<a href='javascript:void(0)' id='" + fid + "_reset' class='fm-button ui-state-default ui-corner-all fm-button-icon-left ui-search'><span class='ui-icon ui-icon-arrowreturnthick-1-w'></span>" + p.Reset + "</a>",
            bQ      = "", // Query button HTML
            tmpl    = "", // Template selection HTML
            colnm,        // Column name for default filter
            found   = false, // Flag to indicate if a searchable column was found
            bt,           // Button table HTML
            cmi     = -1; // Column model index

        // Add query button if showQuery is true
        if ( p.showQuery ) {
          bQ = "<a href='javascript:void(0)' id='" + fid + "_query' class='fm-button ui-state-default ui-corner-all fm-button-icon-left'><span class='ui-icon ui-icon-comment'></span>Query</a>";
        }

        // Process columns if no specific columns are provided in p.columns
        if ( ! p.columns.length ) {
          $.each( columns, function (i, n) {
            // Set label if not already defined
            if ( ! n.label ) {
              n.label = $t.p.colNames[i];
            }
            // Find the first searchable column if no default filter is set
            if ( ! found ) {
              var searchable   = (typeof n.search === 'undefined') ? true : n.search,
                  hidden       = (n.hidden === true),
                  ignoreHiding = (n.searchoptions && n.searchoptions.searchhidden === true);

              if ( (ignoreHiding && searchable) || (searchable && ! hidden) ) {
                found = true;
                colnm = n.index || n.name;
                cmi   = i;
              }
            }
          });
        } else {
          // Use provided columns if specified
          columns = p.columns;
        }

        // Handle old behavior for default filters or single search mode
        if ( (! defaultFilters && colnm) || p.multipleSearch === false ) {
          var cmop = "eq"; // Default operator
          // Determine operator from column search options or global sopt
          if ( cmi >= 0 && columns[cmi].searchoptions && columns[cmi].searchoptions.sopt ) {
            cmop = columns[cmi].searchoptions.sopt[0];
          } else if ( p.sopt && p.sopt.length ) {
            cmop = p.sopt[0];
          }
          // Set default filters for single search
          defaultFilters = { "groupOp": "AND", rules: [{ "field": colnm, "op": cmop, "data": "" }] };
        }

        found = false; // Reset 'found' flag for template check

        // Build template selection dropdown if templates are available
        if ( p.tmplNames && p.tmplNames.length ) {
          found = true;
          tmpl  = p.tmplLabel;
          tmpl += "<select class='ui-template'>";
          tmpl += "<option value='default'>Default</option>";
          $.each( p.tmplNames, function (i, n) {
            tmpl += "<option value='" + i + "'>" + n + "</option>";
          });
          tmpl += "</select>";
        }

        // Construct the button table HTML
        bt = "<table class='EditTable' style='border:0px none;margin-top:5px' id='" + fid + "_2'><tbody><tr><td colspan='2'><hr class='ui-widget-content' style='margin:1px'/></td></tr><tr><td class='EditButton' style='text-align:" + align + "'>" + bC + tmpl + "</td><td class='EditButton' " + butleft + ">" + bQ + bS + "</td></tr></tbody></table>";

        // Initialize jqFilter plugin on the filter div
        $( "#" + fid ).jqFilter({
          columns:     columns,
          filter:      p.loadDefaults ? defaultFilters : null,
          showQuery:   p.showQuery,
          errorcheck:  p.errorcheck,
          sopt:        p.sopt,
          groupButton: p.multipleGroup,
          ruleButtons: p.multipleSearch,
          afterRedraw: p.afterRedraw,
          _gridsopt:   $.jgrid.search.odata,
          onChange:    function (sp) {
            if ( this.p.showQuery ) {
              $('.query', this).html( this.toUserFriendlyString() );
            }
          },
          direction:   $t.p.direction
        });

        fil.append(bt); // Append buttons to the filter container

        // Bind change event for template selection
        if ( found && p.tmplFilters && p.tmplFilters.length ) {
          $( ".ui-template", fil ).bind( 'change', function (e) {
            var curtempl = $(this).val();
            if ( curtempl == "default" ) {
              $( "#" + fid ).jqFilter( 'addFilter', defaultFilters );
            } else {
              $( "#" + fid ).jqFilter( 'addFilter', p.tmplFilters[parseInt(curtempl, 10)] );
            }
            return false;
          });
        }

        // If multipleGroup is enabled, multipleSearch should also be true
        if ( p.multipleGroup === true ) {
          p.multipleSearch = true;
        }

        // Re-run onInitializeSearch callback if defined
        if ( $.isFunction(p.onInitializeSearch) ) {
          p.onInitializeSearch( $( "#" + fid ) );
        }

        p.gbox = "#gbox_" + fid; // Set gbox property

        // Create the modal dialog, handling optional layer
        if ( p.layer ) {
          $.jgrid.createModal( IDs, fil, p, "#gview_" + $t.p.id, $( "#gbox_" + $t.p.id )[0], "#" + p.layer, { position: "relative" } );
        } else {
          $.jgrid.createModal( IDs, fil, p, "#gview_" + $t.p.id, $( "#gbox_" + $t.p.id )[0] );
        }

        // Bind click event for the query button
        if ( bQ ) {
          $( "#" + fid + "_query" ).bind( 'click', function (e) {
            $( ".queryresult", fil ).toggle(); // Toggle visibility of query result
            return false;
          });
        }

        // Backward compatibility: infer stringResult from multipleSearch if undefined
        if ( p.stringResult === undefined ) {
          p.stringResult = p.multipleSearch;
        }

        // Bind click event for the search button
        $( "#" + fid + "_search" ).bind( 'click', function () {
          var fl      = $( "#" + fid ),
              sdata   = {},
              res,
              filters = fl.jqFilter( 'filterData' ); // Get filter data

          // Perform error checking if enabled
          if ( p.errorcheck ) {
            fl[0].hideError();
            if ( ! p.showQuery ) {
              fl.jqFilter( 'toSQLString' ); // Generate SQL string for validation
            }
            if ( fl[0].p.error ) {
              fl[0].showError(); // Show errors if any
              return false;
            }
          }

          // Format search data based on stringResult option
          if ( p.stringResult ) {
            try {
              // Attempt to use xmlJsonClass or JSON.stringify to convert filters to string
              res = xmlJsonClass.toJson( filters, '', '', false );
            } catch (e) {
              try {
                res = JSON.stringify( filters );
              } catch (e2) {
                // Fallback if both fail
              }
            }
            if ( typeof(res) === "string" ) {
              sdata[p.sFilter] = res;
              $.each( [p.sField, p.sValue, p.sOper], function () {
                sdata[this] = "";
              });
            }
          } else {
            if ( p.multipleSearch ) {
              sdata[p.sFilter] = filters;
              $.each( [p.sField, p.sValue, p.sOper], function () {
                sdata[this] = "";
              });
            } else {
              // For single search, extract individual field, value, and operator
              sdata[p.sField] = filters.rules[0].field;
              sdata[p.sValue] = filters.rules[0].data;
              sdata[p.sOper]  = filters.rules[0].op;
              sdata[p.sFilter] = "";
            }
          }

          $t.p.search = true; // Set search flag on grid
          $.extend( $t.p.postData, sdata ); // Update grid's postData with search parameters

          // Execute 'onSearch' callback if defined
          if ( $.isFunction(p.onSearch) ) {
            p.onSearch();
          }

          // Trigger grid reload
          $( $t ).trigger( "reloadGrid", [{ page: 1 }] );

          // Close dialog after search if option is enabled
          if ( p.closeAfterSearch ) {
            $.jgrid.hideModal( "#" + IDs.themodal, { gb: "#gbox_" + $t.p.id, jqm: p.jqModal, onClose: p.onClose } );
          }
          return false;
        });

        // Bind click event for the reset button
        $( "#" + fid + "_reset" ).bind( 'click', function () {
          var sdata = {},
              fl    = $( "#" + fid );

          $t.p.search = false; // Reset search flag on grid

          // Clear search parameters in postData
          if ( p.multipleSearch === false ) {
            sdata[p.sField] = sdata[p.sValue] = sdata[p.sOper] = "";
          } else {
            sdata[p.sFilter] = "";
          }

          fl[0].resetFilter(); // Reset the filter UI

          // Reset template selection if templates were used
          if ( found ) {
            $( ".ui-template", fil ).val( "default" );
          }

          $.extend( $t.p.postData, sdata ); // Update grid's postData

          // Execute 'onReset' callback if defined
          if ( $.isFunction(p.onReset) ) {
            p.onReset();
          }

          // Trigger grid reload
          $( $t ).trigger( "reloadGrid", [{ page: 1 }] );
          return false;
        });

        showFilter(); // Display the newly created filter dialog

        // Add hover effect to form buttons
        $( ".fm-button:not(.ui-state-disabled)", fil ).hover(
          function () {
            $(this).addClass( 'ui-state-hover' );
          },
          function () {
            $(this).removeClass( 'ui-state-hover' );
          }
        );
      }
    });
  },

  // Function to handle editing a grid row (add or edit)
  editGridRow : function (rowid, p) {
    p = $.extend( true, { // Merge default options with user-provided options
      top:                0,
      left:               0,
      width:              300,
      height:             'auto',
      dataheight:         'auto',
      modal:              false,
      overlay:            30,
      drag:               true,
      resize:             true,
      url:                null,
      mtype:              "POST",
      clearAfterAdd:      true,
      closeAfterEdit:     false,
      reloadAfterSubmit:  true,
      onInitializeForm:   null,
      beforeInitData:     null,
      beforeShowForm:     null,
      afterShowForm:      null,
      beforeSubmit:       null,
      afterSubmit:        null,
      onclickSubmit:      null,
      afterComplete:      null,
      onclickPgButtons:   null,
      afterclickPgButtons:null,
      editData:           {},
      recreateForm:       false,
      jqModal:            true,
      closeOnEscape:      false,
      addedrow:           "first", // Position to add new rows
      topinfo:            '',
      bottominfo:         '',
      saveicon:           [],
      closeicon:          [],
      savekey:            [false, 13], // Save on Enter key
      navkeys:            [false, 38, 40], // Navigate with Up/Down arrows
      checkOnSubmit:      false, // Check for changes before submitting
      checkOnUpdate:      false, // Check for changes on update
      _savedData:         {}, // Stores initial data for change detection
      processing:         false, // Flag to indicate if form is being processed
      onClose:            null,
      ajaxEditOptions:    {},
      serializeEditData:  null,
      viewPagerButtons:   true
    }, $.jgrid.edit, p || {} );

    // Store parameters for this grid instance
    rp_ge[$(this)[0].p.id] = p;

    return this.each( function () {
      var $t = this; // Reference to the grid object

      // Exit if grid is not initialized or rowid is missing
      if ( ! $t.grid || ! rowid ) {
        return;
      }

      var gID              = $t.p.id,
          frmgr            = "FrmGrid_" + gID,
          frmtb            = "TblGrid_" + gID,
          IDs              = {
            themodal:    'editmod' + gID,
            modalhead:   'edithd' + gID,
            modalcontent:'editcnt' + gID,
            scrollelm:   frmgr
          },
          // Assign callbacks from parameters
          onBeforeShow     = $.isFunction(rp_ge[$t.p.id].beforeShowForm) ? rp_ge[$t.p.id].beforeShowForm : false,
          onAfterShow      = $.isFunction(rp_ge[$t.p.id].afterShowForm) ? rp_ge[$t.p.id].afterShowForm : false,
          onBeforeInit     = $.isFunction(rp_ge[$t.p.id].beforeInitData) ? rp_ge[$t.p.id].beforeInitData : false,
          onInitializeForm = $.isFunction(rp_ge[$t.p.id].onInitializeForm) ? rp_ge[$t.p.id].onInitializeForm : false,
          copydata         = null,
          showFrm          = true,
          maxCols          = 1,
          maxRows          = 0,
          postdata, // Data to be sent to the server
          extpost,  // Extended post data (e.g., text for select options)
          newData,
          diff;

      // Determine caption based on 'new' rowid
      if ( rowid === "new" ) {
        rowid    = "_empty";
        p.caption = rp_ge[$t.p.id].addCaption;
      } else {
        p.caption = rp_ge[$t.p.id].editCaption;
      }

      // If 'recreateForm' is true and the modal exists, remove it
      if ( p.recreateForm === true && $( "#" + IDs.themodal ).html() !== null ) {
        $( "#" + IDs.themodal ).remove();
      }

      var closeovrl = true; // Flag to control overlay closing

      // If checkOnUpdate and jqModal are true, but not modal, keep overlay open
      if ( p.checkOnUpdate && p.jqModal && ! p.modal ) {
        closeovrl = false;
      }

      // Function to collect data from the form elements
      function getFormData() {
        $( "#" + frmtb + " > tbody > tr > td > .FormElement" ).each( function (i) {
          var celm = $( ".customelement", this ); // Check for custom elements

          if ( celm.length ) {
            var elem = celm[0],
                nm   = $(elem).attr('name');

            // Handle custom_value for custom elements
            $.each( $t.p.colModel, function (i, n) {
              if ( this.name === nm && this.editoptions && $.isFunction(this.editoptions.custom_value) ) {
                try {
                  postdata[nm] = this.editoptions.custom_value( $( "#" + $.jgrid.jqID(nm), "#" + frmtb ), 'get' );
                  if ( postdata[nm] === undefined ) {
                    throw "e1"; // Custom error for undefined value
                  }
                } catch (e) {
                  // Display appropriate error message
                  if ( e === "e1" ) {
                    $.jgrid.info_dialog( jQuery.jgrid.errors.errcap, "function 'custom_value' " + $.jgrid.edit.msg.novalue, jQuery.jgrid.edit.bClose );
                  } else {
                    $.jgrid.info_dialog( jQuery.jgrid.errors.errcap, e.message, jQuery.jgrid.edit.bClose );
                  }
                }
                return true; // Continue to next element
              }
            });
          } else {
            // Handle standard form elements based on type
            switch ( $(this).get(0).type ) {
              case "checkbox":
                if ( $(this).is(":checked") ) {
                  postdata[this.name] = $(this).val();
                } else {
                  var ofv = $(this).attr("offval"); // Get 'off' value for checkbox
                  postdata[this.name] = ofv;
                }
              break;
              case "select-one":
                postdata[this.name] = $("option:selected", this).val();
                extpost[this.name]  = $("option:selected", this).text();
              break;
              case "select-multiple":
                postdata[this.name] = $(this).val();
                if ( postdata[this.name] ) {
                  postdata[this.name] = postdata[this.name].join(",");
                } else {
                  postdata[this.name] = "";
                }
                var selectedText = [];
                $("option:selected", this).each(
                  function (i, selected) {
                    selectedText[i] = $(selected).text();
                  }
                );
                extpost[this.name] = selectedText.join(",");
              break;
              case "password":
              case "text":
              case "textarea":
              case "button":
                postdata[this.name] = $(this).val();
              break;
            }
            // HTML encode data if autoencode is enabled
            if ( $t.p.autoencode ) {
              postdata[this.name] = $.jgrid.htmlEncode(postdata[this.name]);
            }
          }
        });
        return true; // Data collected successfully
      }

      // Function to create form data elements based on colModel
      function createData(rowid, obj, tb, maxcols) {
        var nm, hc, trdata, cnt = 0, tmp, dc, elc, retpos = [], ind = false,
            // Template for a single table data pair (caption and data)
            tdtmpl = "<td class='CaptionTD'>&#160;</td><td class='DataTD'>&#160;</td>",
            tmpl   = "",
            i; // Loop counter

        // Build the full row template with multiple td pairs
        for ( i = 1; i <= maxcols; i++ ) {
          tmpl += tdtmpl;
        }

        // Get row index if not adding a new row
        if ( rowid != '_empty' ) {
          ind = $(obj).jqGrid("getInd", rowid);
        }

        // Iterate through each column model to create form elements
        $(obj.p.colModel).each( function (i) {
          nm = this.name;
          // Determine if the field should be hidden
          if ( this.editrules && this.editrules.edithidden === true ) {
            hc = false; // Explicitly shown even if hidden
          } else {
            hc = this.hidden === true ? true : false;
          }
          dc = hc ? "style='display:none'" : ""; // Display style for hidden fields

          // Process editable columns that are not 'cb', 'subgrid', or 'rn'
          if ( nm !== 'cb' && nm !== 'subgrid' && this.editable === true && nm !== 'rn' ) {
            if ( ind === false ) {
              tmp = ""; // Empty for new rows
            } else {
              // Get data for existing rows
              if ( nm == obj.p.ExpandColumn && obj.p.treeGrid === true ) {
                tmp = $("td:eq(" + i + ")", obj.rows[ind]).text();
              } else {
                try {
                  tmp = $.unformat( $("td:eq(" + i + ")", obj.rows[ind]), { rowId: rowid, colModel: this }, i );
                } catch (_) {
                  // Fallback for unformat errors
                  tmp = (this.edittype && this.edittype == "textarea") ? $("td:eq(" + i + ")", obj.rows[ind]).text() : $("td:eq(" + i + ")", obj.rows[ind]).html();
                }
                // Clear out empty/non-breaking space values
                if ( ! tmp || tmp == "&nbsp;" || tmp == "&#160;" || (tmp.length == 1 && tmp.charCodeAt(0) == 160) ) {
                  tmp = '';
                }
              }
            }

            // Extend edit options and form options
            var opt    = $.extend( {}, this.editoptions || {}, { id: nm, name: nm } ),
                frmopt = $.extend( {}, { elmprefix: '', elmsuffix: '', rowabove: false, rowcontent: '' }, this.formoptions || {} ),
                rp     = parseInt(frmopt.rowpos, 10) || cnt + 1, // Row position
                cp     = parseInt( (parseInt(frmopt.colpos, 10) || 1) * 2, 10 ); // Column position

            // Apply defaultValue for new rows
            if ( rowid == "_empty" && opt.defaultValue ) {
              tmp = $.isFunction(opt.defaultValue) ? opt.defaultValue() : opt.defaultValue;
            }

            // Set default edittype if not specified
            if ( ! this.edittype ) {
              this.edittype = "text";
            }

            // HTML decode data if autoencode is enabled
            if ( $t.p.autoencode ) {
              tmp = $.jgrid.htmlDecode(tmp);
            }

            // Create the actual form element
            elc = $.jgrid.createEl( this.edittype, opt, tmp, false, $.extend( {}, $.jgrid.ajaxOptions, obj.p.ajaxSelectOptions || {} ) );

            // Special handling for empty checkbox/select values
            if ( tmp === "" && this.edittype == "checkbox" ) {
              tmp = $(elc).attr("offval");
            }
            if ( tmp === "" && this.edittype == "select" ) {
              tmp = $("option:eq(0)", elc).text();
            }

            // Store initial data for change detection
            if ( rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate ) {
              rp_ge[$t.p.id]._savedData[nm] = tmp;
            }

            $(elc).addClass("FormElement"); // Add base class

            // Add UI-widget classes for text/textarea
            if ( this.edittype == 'text' || this.edittype == 'textarea' ) {
              $(elc).addClass("ui-widget-content ui-corner-all");
            }

            trdata = $(tb).find("tr[rowpos=" + rp + "]"); // Find existing row

            // Insert rowabove content if specified
            if ( frmopt.rowabove ) {
              var newdata = $( "<tr><td class='contentinfo' colspan='" + (maxcols * 2) + "'>" + frmopt.rowcontent + "</td></tr>" );
              $(tb).append(newdata);
              newdata[0].rp = rp;
            }

            // Create a new row if it doesn't exist
            if ( trdata.length === 0 ) {
              trdata = $( "<tr " + dc + " rowpos='" + rp + "'></tr>" ).addClass("FormData").attr("id", "tr_" + nm);
              $(trdata).append(tmpl);
              $(tb).append(trdata);
              trdata[0].rp = rp;
            }

            // Set caption and append element to the row
            $("td:eq(" + (cp - 2) + ")", trdata[0]).html( typeof frmopt.label === 'undefined' ? obj.p.colNames[i] : frmopt.label );
            $("td:eq(" + (cp - 1) + ")", trdata[0]).append(frmopt.elmprefix).append(elc).append(frmopt.elmsuffix);
            retpos[cnt] = i; // Store column index
            cnt++; // Increment counter for number of editable fields
          }
        });

        // Add hidden row for row ID if there are editable fields
        if ( cnt > 0 ) {
          var idrow = $( "<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='" + (maxcols * 2 - 1) + "' class='DataTD'><input class='FormElement' id='id_g' type='text' name='" + obj.p.id + "_id' value='" + rowid + "'/></td></tr>" );
          idrow[0].rp = cnt + 999;
          $(tb).append(idrow);
          // Store row ID for change detection
          if ( rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate ) {
            rp_ge[$t.p.id]._savedData[obj.p.id + "_id"] = rowid;
          }
        }
        return retpos;
      }

      // Function to fill form elements with data for the given rowid
      function fillData(rowid, obj, fmid) {
        var nm, cnt = 0, tmp, fld, opt, vl, vlc;

        // Initialize _savedData for change detection
        if ( rp_ge[$t.p.id].checkOnSubmit || rp_ge[$t.p.id].checkOnUpdate ) {
          rp_ge[$t.p.id]._savedData = {};
          rp_ge[$t.p.id]._savedData[obj.p.id + "_id"] = rowid;
        }

        var cm = obj.p.colModel; // Get column model

        // Handle '_empty' row (new row)
        if ( rowid == '_empty' ) {
          $(cm).each( function (i) {
            nm  = this.name;
            opt = $.extend( {}, this.editoptions || {} );
            fld = $( "#" + $.jgrid.jqID(nm), "#" + fmid ); // Find form field

            if ( fld && fld.length && fld[0] !== null ) {
              vl = ""; // Default empty value
              if ( opt.defaultValue ) {
                vl = $.isFunction(opt.defaultValue) ? opt.defaultValue() : opt.defaultValue;

                if ( fld[0].type == 'checkbox' ) {
                  vlc = vl.toLowerCase();
                  if ( vlc.search(/(false|0|no|off|undefined)/i) < 0 && vlc !== "" ) {
                    fld[0].checked       = true;
                    fld[0].defaultChecked = true;
                    fld[0].value         = vl;
                  } else {
                    fld[0].checked = false;
                  }