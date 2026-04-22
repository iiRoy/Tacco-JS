// This file contains the core logic for the jQuery ajaxPager plugin.
// It was initially inspired by Twitter Bootstrap and incorporates various code snippets.
// Version: 0.8
// Source: http://twitter.github.com/cutterbl/ajaxPager

// Copyright (c) 2010 - 2015 Cutters Crossing.
// This software is licensed under the GNU General Public License v2.
// You may obtain a copy of the License at: http://www.gnu.org/licenses/gpl-2.0.html
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ---------------------------------------------------------------------

( function( $ ) {

  // Define the ajaxPager plugin function.
  $.fn.ajaxPager = function( options ) {

    // Check if a specific method is being called.
    if ( $.ajaxPager.methods[options] ) {
      return $.ajaxPager.methods[options].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    }

    // If options is an object or undefined, initialize the plugin.
    else if ( typeof options === 'object' || ! options ) {
      return $.ajaxPager.methods.init.apply( this, arguments );
    }

    // If the method does not exist, throw an error.
    else {
      $.error( 'Method ' + options + ' does not exist on jQuery.ajaxPager' );
    }

    // These variables are declared but not used in this scope,
    // they are likely intended for internal use within the plugin's methods.
    var settings = {};
    var privatevars = {};
    var handlers = {};
    var getAccessor = null;
    var makeRequest = null;
    var changePage = null;
    var mask = null;
    var unmask = null;
  };


  // Publicly accessible default settings for the plugin.
  $.fn.ajaxPager.defaults = {
    position        : 'top', // Where to place the pager bar: 'top', 'bottom', or 'both'.
    classes         : '',    // Additional CSS classes for the pager bar.
    stripedrows     : false, // Not used directly in this snippet, but part of defaults.
    loadtext        : 'Loading...', // Text to display when content is loading.
    page            : 1,     // Current page number.
    limit           : 25,    // Number of records per page.
    limitdd         : true,  // Whether to show a dropdown for page limits.
    limitoptions    : [25, 50, 75, 100], // Available limit options.
    sortcolumn      : null,  // Column currently being sorted.
    sortdir         : 'asc', // Sort direction: 'asc' or 'desc'.
    sortby          : {},    // Object defining sortable columns (e.g., { 'id': 'ID', 'name': 'Name' }).
    searchtext      : null,  // Current search query.

    ajaxoptions     : {      // Settings for the AJAX request.
      url           : '',    // URL to fetch data from.
      type          : 'POST',// HTTP method.
      data          : {},    // Additional data to send with the request.
      dataType      : 'json' // Expected data type of the response.
    },

    reader          : {      // Defines how to read data from the AJAX response.
      success       : 'success',    // Key for success status.
      message       : 'message',    // Key for message.
      totalpages    : 'totalpages', // Key for total pages.
      totalrecords  : 'totalrecords', // Key for total records.
      root          : ''            // Key for the array of data records.
    },

    params          : {      // Defines parameter names sent in the AJAX request.
      start         : 'start', // Parameter for start index.
      limit         : 'limit', // Parameter for limit.
      page          : 'page',  // Parameter for page number.
      sort          : 'sort',  // Parameter for sort column.
      dir           : 'dir',   // Parameter for sort direction.
      search        : 'search' // Parameter for search query.
    },

    renderoutput    : null,  // Custom function to render the output.

    listeners       : {      // Callback functions for various events.
      init          : null,
      render        : null,
      preprocess    : null,
      beforeload    : null,
      load          : null,
      destroy       : null
    }
  };

  // Private variables for the plugin instance.
  $.fn.ajaxPager.privatevars = {
    dataloaded  : false,
    rendered    : false,
    totalpages  : 12,
    totalrecords: 293,
    firstrecord : 0,
    lastrecord  : 0,
    pagers      : null
  };

  // Main methods and internal functions of the ajaxPager plugin.
  $.ajaxPager = {

    methods: {

      // Initialize the plugin on selected elements.
      init: function( options ) {
        // Merge default options with user-provided options.
        var options = options || {};
        settings = $.extend( true, {}, $.fn.ajaxPager.defaults, options );
        handlers = $.ajaxPager.handlers;
        getAccessor = $.ajaxPager._getAccessor;
        makeRequest = $.ajaxPager._makeRequest;
        changePage = $.ajaxPager._changePage;
        mask = $.ajaxPager._maskContent;
        unmask = $.ajaxPager._unmaskContent;

        return this.each( function() {
          var $self = $( this ), // The jQuery object for the current element.
              data = $self.data( 'ajaxPager' ); // Retrieve existing data or undefined.

          // Setup custom event bindings for the element.
          $self.bind( 'optionchange.ajaxPager', handlers.optionChangeHandler );
          $self.bind( 'pagechange.ajaxPager', handlers.pageChangeHandler );
          $self.bind( 'firstpage.ajaxPager', handlers.firstPageHandler );
          $self.bind( 'previouspage.ajaxPager', handlers.previousPageHandler );
          $self.bind( 'nextpage.ajaxPager', handlers.nextPageHandler );
          $self.bind( 'lastpage.ajaxPager', handlers.lastPageHandler );
          $self.bind( 'init.ajaxPager', handlers.initHandler );
          $self.bind( 'render.ajaxPager', handlers.renderHandler );
          $self.bind( 'beforeload.ajaxPager', handlers.beforeLoadHandler );
          $self.bind( 'load.ajaxPager', handlers.loadHandler );
          $self.bind( 'destroy.ajaxPager', handlers.destroyHandler );

          // Build the pager UI bar.
          var barUI = $.ajaxPager._buildPagerBar( settings );
          // Wrap the content and add a class.
          $self.wrap( '<div class="ajaxPagerContainer" />' ).addClass( 'pagingContent' );

          // Position the pager bar based on settings.
          switch ( settings.position ) {
            case "both":
              $self.before( barUI ).after( barUI );
              break;
            case "top":
              $self.before( barUI );
              break;
            case "bottom":
              $self.after( barUI );
              break;
          }

          // If no plugin data exists, initialize it.
          if ( ! data ) {
            $self.data( 'ajaxPager', $.extend( {}, $.fn.ajaxPager.privatevars, {
              target    : $self,
              pagers    : $( '.pagingbar', $self.parent() ),
              origcontent: $( this ).html() // Store original content to restore on destroy.
            } ) );
          }
          // console.log('data init ', $self.data('ajaxPager')); // Debugging line.

          // Trigger initial events.
          $self.trigger( 'init' ).trigger( 'render' );
        } );
      },

      // Destroy the plugin instance and restore the element to its original state.
      destroy: function() {

        return this.each( function() {
          var $self = $( this ),
              data = $self.data( 'ajaxPager' );

          // Call custom destroy listener if provided.
          if ( settings.listeners.destroy && typeof settings.listeners.destroy === 'function' ) {
            settings.listeners.destroy.call( $self, 'destroy' );
          }

          // Unbind all custom events.
          $self.unbind( '.ajaxPager' );
          // Unbind click handlers from pager navigation links.
          $( 'a.paging-nav', data.pagers ).unbind( 'click' );
          // Unbind filter links if sortby is not empty.
          if ( ! $.isEmptyObject( settings.sortby ) ) {
            $( 'a.paging-filter', data.pagers ).unbind( 'click' );
          }
          // Unbind limit links if limit dropdown is enabled.
          if ( settings.limitdd ) {
            $( 'a.paging-limit', data.pagers ).unbind( 'click' );
          }
          // Unbind form submit and input keypress handlers.
          $( '.navbar-form', data.pagers ).unbind( 'submit' );
          $( '.navbar-form input', data.pagers ).unbind( 'keypress' );

          // Restore original HTML content.
          $self.html( data.origcontent );
          // Remove pager bars.
          data.pagers.remove();
          // Unwrap the container and remove the paging class.
          $self.unwrap().removeClass( 'pagingContent' );
          // Remove plugin data from the element.
          $self.removeData( 'ajaxPager' );
        } );
      },

      // Get or set plugin options.
      option: function( options ) {
        var orig = $.extend( {}, settings ); // Store original settings for comparison.
        var $self = $( this );

        // If options is an object, extend current settings.
        if ( typeof options === 'object' ) {
          settings = $.extend( true, settings, options );
        }
        // If two arguments, set a specific option.
        else if ( arguments.length === 2 ) {
          settings[arguments[0]] = arguments[1];
        }
        // If one argument, return the value of that option.
        else {
          return settings[arguments[0]];
        }

        // Trigger 'optionchange' event for each modified option.
        $.each( orig, function( ind, el ) {
          if ( settings[ind] !== el ) {
            $self.trigger( 'optionchange', [ind, el, settings[ind]] );
          }
        } )
        return; // Return nothing if setting options.
      },

      // Reload the current page data.
      reload: function() {
        var $self = $( this ),
            data = $( this ).data( 'ajaxPager' ); // Get plugin data.
        // Make a new request for the current page.
        $.ajaxPager._makeRequest.call( $self, settings.page );
      }
    },

    // Event handlers for internal and custom events.
    handlers: {

      // Handles changes to plugin options.
      optionChangeHandler: function( event, option, oldvalue, newvalue ) {
        var $self = $( this ),
            data = $( this ).data( 'ajaxPager' );

        switch ( option ) {
          case "page":
            // Prevent setting page beyond total pages if data is loaded and rendered.
            if ( newvalue > data.totalpages && ( data.rendered && data.dataloaded ) ) {
              settings.page = oldvalue; // Revert page to old value.
              // Update the input field with the old page number.
              $( 'form[name="jump"] input[name="page"]', data.pagers ).val( oldvalue );
              $.error( 'You have tried to set a \"page\" beyond the number of available pages' );
            } else {
              $self.trigger( 'pagechange', newvalue ); // Trigger page change event.
            }
            break;
          case "classes":
            // Add new classes to the pager if not already present.
            var pagers = data.pagers;
            if ( ! pagers.hasClass( newvalue ) ) {
              pagers.addClass( newvalue );
            }
            break;
          case "searchtext":
            // If search text changes, reset to the first page.
            $self.trigger( 'pagechange', 1 );
            break;
        }
      },

      // Handles form submission for jumping to a specific page.
      jumpFormHandler: function( event ) {
        event.preventDefault(); // Prevent default form submission.
        var $pager = $( '.pagingContent', $( this ).closest( '.pagingbar' ).parent() );
        var val = $( 'input[name="page"]', $( this ) ).val(); // Get page number from input.
        $pager.ajaxPager( 'option', 'page', val ); // Set the new page option.
        return false;
      },

      // Handles page change events.
      pageChangeHandler: function( event, page ) {
        var $self = $( this ),
            data = $( this ).data( 'ajaxPager' );

        var newpage = page;
        // Adjust newpage to stay within bounds (1 to totalpages).
        switch ( page ) {
          case 1:
            newpage = 1;
            break;
          case data.totalpages:
            newpage = data.totalpages;
            break;
          default:
            break;
        }
        // console.log('in page change to page ', page) // Debugging line.
        $.ajaxPager._makeRequest.call( $( this ), newpage ); // Make the AJAX request.
      },

      // Handles clicks on sort filter links.
      filterLinkHandler: function( event ) {
        event.preventDefault();
        var $pager = event.data.el, // The pager element.
            action = $( this ).attr( 'rel' ), // The sort column name.
            icon = $( 'i', $( 'a[rel="' + action + '"]' ) ), // The icon for the clicked link.
            diricon = icon.attr( 'class' ), // Current icon class (for sort direction).
            data = $pager.data( 'ajaxPager' ),
            sortby = $( '.paging-filter', data.pagers ), // All sort filter links.
            newicon = 'icon-arrow-down'; // Default new icon.

        // Reset all sort icons.
        $( 'i', sortby ).removeClass( 'icon-arrow-up' ).removeClass( 'icon-arrow-down' ).removeClass( 'icon-' ).addClass( 'icon-' );

        settings.sortcolumn = action; // Set the new sort column.
        // Determine new sort direction based on current icon.
        if ( diricon === 'icon-arrow-up' ) {
          settings.sortdir = 'desc';
          newicon = 'icon-arrow-down';
        } else if ( diricon === 'icon-arrow-down' ) {
          settings.sortdir = 'asc';
          newicon = 'icon-arrow-up';
        } else {
          settings.sortdir = 'desc'; // Default to descending if no icon.
        }
        icon.removeClass( 'icon-' ).addClass( newicon ); // Update the clicked link's icon.
        $( 'li.dropdown.open' ).removeClass( 'open' ); // Close any open dropdowns.
        // console.log(settings.sortcolumn, settings.sortdir); // Debugging line.
        $.ajaxPager._makeRequest.call( $pager, settings.page ); // Reload data with new sort.
        return false;
      },

      // Handles clicks on limit option links.
      limitLinkHandler: function( event ) {
        event.preventDefault();
        var $pager = event.data.el,
            action = $( this ).attr( 'rel' ), // The limit value.
            newlimit = $( this ).text(), // The text content (which is the limit value).
            icon = $( 'i', $( 'a[rel="' + action + '"]' ) ), // The icon for the clicked link.
            diricon = icon.attr( 'class' ), // Current icon class.
            data = $pager.data( 'ajaxPager' ),
            limitby = $( '.paging-limit', data.pagers ); // All limit links.

        settings.limit = newlimit; // Set the new page limit.
        // Reset all limit icons.
        $( 'i', limitby ).removeClass( 'icon-chevron-right' ).removeClass( 'icon-' ).addClass( 'icon-' );
        icon.removeClass( 'icon-' ).addClass( 'icon-chevron-right' ); // Set icon for the selected limit.
        $( 'li.dropdown.open' ).removeClass( 'open' ); // Close any open dropdowns.
        // console.log(settings.sortcolumn, settings.sortdir); // Debugging line.
        $.ajaxPager._makeRequest.call( $pager, settings.page ); // Reload data with new limit.
        return false;
      },

      // Handles clicks on navigation links (first, previous, next, last).
      navLinkHandler: function( event ) {
        event.preventDefault();
        var $pager = event.data.el,
            action = $( this ).attr( 'rel' ); // The navigation action.
        if ( ! $( this ).hasClass( 'disabled' ) ) {
          $pager.trigger( action + 'page' ); // Trigger the corresponding page event.
        }
        return false;
      },

      // Handles 'firstpage' event.
      firstPageHandler: function( event ) {
        $( this ).trigger( 'optionchange', ['page', settings.page, 1] ); // Change page to 1.
      },

      // Handles 'previouspage' event.
      previousPageHandler: function( event ) {
        $( this ).trigger( 'optionchange', ['page', settings.page, settings.page - 1] ); // Change page to previous.
      },

      // Handles 'lastpage' event.
      lastPageHandler: function( event ) {
        var $self = $( this ),
            data = $( this ).data( 'ajaxPager' );
        $( this ).trigger( 'optionchange', ['page', settings.page, data.totalpages] ); // Change page to last.
      },

      // Handles 'nextpage' event.
      nextPageHandler: function( event ) {
        $( this ).trigger( 'optionchange', ['page', settings.page, settings.page + 1] ); // Change page to next.
      },

      // Handles 'init' event.
      initHandler: function() {
        var $self = $( this );
        if ( settings.listeners.init && typeof settings.listeners.init === 'function' ) {
          settings.listeners.init.call( $self, 'init' ); // Call custom init listener.
        }
      },

      // Handles 'render' event, setting up UI bindings.
      renderHandler: function( event ) {
        var $self = $( this ),
            data = $( this ).data( 'ajaxPager' );
        if ( settings.listeners.render && typeof settings.listeners.render === 'function' ) {
          settings.listeners.render.call( $self, 'render' ); // Call custom render listener.
        }
        // Setup UI bindings after rendering.
        $( 'a.paging-nav', data.pagers ).bind( 'click', { el: $self }, handlers.navLinkHandler );
        $( '.navbar-form', data.pagers ).bind( 'submit', handlers.jumpFormHandler );
        $( '.navbar-form input', data.pagers ).bind( 'keypress', function( e ) {
          c = e.which ? e.which : e.keyCode;
          if ( c === 13 ) { // If Enter key is pressed.
            e.preventDefault();
            var form = $( this ).parent();
            form.trigger( 'submit' ); // Trigger form submission.
            return false;
          }
          return true;
        } );
        // Bind sort filter links if sortby is defined.
        if ( ! $.isEmptyObject( settings.sortby ) ) {
          $( 'a.paging-filter', data.pagers ).bind( 'click', { el: $self }, handlers.filterLinkHandler );
        }
        // Bind limit links if limit dropdown is enabled.
        if ( settings.limitdd ) {
          $( 'a.paging-limit', data.pagers ).bind( 'click', { el: $self }, handlers.limitLinkHandler );
        }
        $self.data( 'ajaxPager', $.extend( data, { rendered: true } ) ); // Mark as rendered.
        // console.log('in render ', $self.data('ajaxPager')); // Debugging line.
        $self.trigger( 'pagechange', settings.page ); // Trigger initial page load.
      },

      // Handles 'beforeload' event.
      beforeLoadHandler: function( event ) {
        var $self = $( this );
        if ( settings.listeners.beforeload && typeof settings.listeners.beforeload === 'function' ) {
          settings.listeners.beforeload.call( $self, 'beforeload' ); // Call custom beforeload listener.
        }
      },

      // Handles 'load' event.
      loadHandler: function( event ) {
        var $self = $( this );
        if ( settings.listeners.load && typeof settings.listeners.load === 'function' ) {
          settings.listeners.load.call( $self, 'load' ); // Call custom load listener.
        }
      }
    },

    // Internal function to build the pager HTML bar.
    _buildPagerBar: function( settings ) {
      var ui = '<div class="pagingbar ajaxPager' + ( ( settings.classes.length > 0 ) ? ( ' ' + settings.classes ) : '' ) + '">'
                 + '<div class="pagingbar-inner">'
                   + '<div class="container">'
                     + '<div class="nav-collapse">'
                       + '<ul class="nav nav-pills">'
                         + '<li><a href="#first" class="paging-nav" rel="first">|&#171;</a></li>'
                         + '<li class="divider-vertical"></li>'
                         + '<li><a href="#previous" class="paging-nav" rel="previous">&#171;</a></li>'
                         + '<li class="divider-vertical"></li>'
                       + '</ul>'
                       + '<form name="jump" class="navbar-form pull-left">'
                         + '<strong>Page</strong> <input type="text" name="page" value="0" style="width:25px;" /> <strong>of <span class="total-pages">0</span></strong>'
                       + '</form>'
                       + '<ul class="nav nav-pills">'
                         + '<li class="divider-vertical"></li>'
                         + '<li><a href="#next" class="paging-nav" rel="next">&#187;</a></li>'
                         + '<li class="divider-vertical"></li>'
                         + '<li><a href="#last" class="paging-nav" rel="last">&#187;|</a></li>'
                         + '<li class="divider-vertical"></li>';
      // Add limit dropdown if enabled.
      if ( settings.limitdd ) {
        ui += '<li class="dropdown">'
            + '<a class="dropdown-toggle" data-toggle="dropdown" href="#">Limit<b class="caret"></b></a>'
              + '<ul class="dropdown-menu">';
        for ( var i = 0; i < settings.limitoptions.length; i++ ) {
          ui += '<li><a href="#limit-' + settings.limitoptions[i] + '" class="paging-limit" rel="' + settings.limitoptions[i] + '"><i class="icon-' + ( ( settings.limitoptions[i] === settings.limit ) ? 'chevron-right' : '' ) + '"></i>' + settings.limitoptions[i] + '</a></li>';
        }
        ui += '</ul>'
            + '</li>'
            + '<li class="divider-vertical"></li>';
      }
      // Add sort by dropdown if sortable columns are defined.
      if ( ! $.isEmptyObject( settings.sortby ) ) {
        ui += '<li class="dropdown">'
                + '<a class="dropdown-toggle" data-toggle="dropdown" href="#">Sort By<b class="caret"></b></a>'
                  + '<ul class="dropdown-menu">';
        for ( var i in settings.sortby ) {
          ui += '<li><a href="#filter-' + i + '" class="paging-filter" rel="' + i + '">';
          if ( settings.sortcolumn && i === settings.sortcolumn ) {
            if ( settings.sortdir === 'asc' ) {
              ui += '<i class="icon-arrow-up"></i> ';
            } else if ( settings.sortcolumn && settings.sortdir === 'desc' ) {
              ui += '<i class="icon-arrow-down"></i> ';
            }
          } else {
            ui += '<i class="icon-"></i> ';
          }
          ui += settings.sortby[i] + '</a>';
        }
        ui += '</ul>'
            + '</li>'
            + '<li class="divider-vertical"></li>';
      }
      ui += '</ul>'
           + '<span class="pull-right navbar-text pagingbar-counts" style="margin-right:20px;">'
             + '<strong>View <span class="first-record">0</span> - <span class="last-record">0</span> of <span class="record-count">0</span></strong>'
           + '</span>'
         + '</div>'
       + '</div>'
     + '</div>'
   + '</div>';
      return ui;
    },

    // Masks the content of the element with a loading indicator.
    _maskContent: function( label ) {
      var $self = $( this );
      $self.append( '<div class="component-backdrop fade in" />' ).addClass( 'masked' );
      if ( label !== undefined ) {
        var maskMsgDiv = $( '<div class="mask-msg alert alert-info" style="display:none;"></div>' );
        maskMsgDiv.append( '<div>' + label + '</div>' );
        $self.append( maskMsgDiv );

        // Calculate and set center position for the message.
        maskMsgDiv.css( "top", Math.round( $self.height() / 2 - ( maskMsgDiv.height() - parseInt( maskMsgDiv.css( "padding-top" ) ) - parseInt( maskMsgDiv.css( "padding-bottom" ) ) ) / 2 ) + "px" );
        maskMsgDiv.css( "left", Math.round( $self.width() / 2 - ( maskMsgDiv.width() - parseInt( maskMsgDiv.css( "padding-left" ) ) - parseInt( maskMsgDiv.css( "padding-right" ) ) ) / 2 ) + "px" );

        maskMsgDiv.show();
      }
    },

    // Unmasks the content, removing the loading indicator.
    _unmaskContent: function() {
      var $self = $( this );
      $( 'div.component-backdrop,div.mask-msg', $self ).remove(); // Remove backdrop and message.
      $self.removeClass( 'masked' ); // Remove the 'masked' class.
      // console.log('let\'s unmask this thing',$('div.component-backdrop', $self)); // Debugging line.
    },

    // Updates the pager UI based on the current page, total pages, and total records.
    _changePage: function( page, totalpages, totalrecords ) {
      var $self = $( this ),
          data = $( this ).data( 'ajaxPager' );

      data = $.extend( data, { totalpages: totalpages, totalrecords: totalrecords } );

      // Enable/disable navigation links based on current page.
      switch ( page ) {
        case 1:
          // Disable first and previous links on the first page.
          $( 'a.paging-nav[rel="first"], a.paging-nav[rel="previous"]', data.pagers ).addClass( 'disabled' );
          // If only one page, disable next and last as well.
          if ( data.totalpages !== 1 ) {
            $( 'a.paging-nav[rel="next"], a.paging-nav[rel="last"]', data.pagers ).removeClass( 'disabled' );
          } else {
            $( 'a.paging-nav[rel="next"], a.paging-nav[rel="last"]', data.pagers ).addClass( 'disabled' );
          }
          break;
        case data.totalpages:
          // Disable next and last links on the last page.
          $( 'a.paging-nav[rel="first"], a.paging-nav[rel="previous"]', data.pagers ).removeClass( 'disabled' );
          $( 'a.paging-nav[rel="next"], a.paging-nav[rel="last"]', data.pagers ).addClass( 'disabled' );
          break;
        default:
          // Enable all navigation links on intermediate pages.
          $( 'a.paging-nav[rel="first"], a.paging-nav[rel="previous"]', data.pagers ).removeClass( 'disabled' );
          $( 'a.paging-nav[rel="next"], a.paging-nav[rel="last"]', data.pagers ).removeClass( 'disabled' );
          break;
      }
      settings.page = page; // Update current page in settings.

      var count = ( page * settings.limit );
      // Calculate first and last record numbers.
      data = $.extend( data, {
        firstrecord: ( ( settings.limit * ( page - 1 ) ) + 1 ),
        lastrecord : ( count > data.totalrecords ) ? data.totalrecords : count
      } );
      $self.data( 'ajaxPager', data ); // Update plugin data.
      // console.log('after some sets ', $self.data('ajaxPager')); // Debugging line.

      // Update displayed counts and page numbers in the UI.
      $( '.pagingbar-counts .first-record', data.pagers ).html( data.firstrecord );
      $( '.pagingbar-counts .last-record', data.pagers ).html( data.lastrecord );
      $( '.pagingbar-counts .record-count', data.pagers ).html( data.totalrecords );
      $( '.navbar-form .total-pages', data.pagers ).html( data.totalpages );

      $( 'form[name="jump"] input[name="page"]', data.pagers ).val( page ); // Update jump page input.
    },

    // Internal function to make an AJAX request to fetch data.
    _makeRequest: function( page ) {
      var $self = $( this ),
          req = $.extend( {}, settings.ajaxoptions ), // Clone ajaxoptions to avoid modifying original.
          tmp = {}, // Temporary object (currently unused in this snippet).
          opts = settings, // Reference to current settings.
          acc = getAccessor, // Reference to _getAccessor (currently undefined).
          cp = changePage, // Reference to _changePage.
          u = unmask, // Reference to _unmaskContent.
          data = $self.data( 'ajaxPager' ), // Plugin data.
          target = data.target; // The target element.