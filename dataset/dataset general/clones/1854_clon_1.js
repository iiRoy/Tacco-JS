/*
 * This file defines the List object, which is responsible for managing
 * various aspects of task lists within the FASTASK application.
 * It handles operations such as reloading lists, creating new tasks,
 * performing searches, and managing list display.
 *
 * The List object relies on a global FASTASK object for context and
 * shared resources. Specifically, it uses `FASTASK.list_handler`
 * to refer to itself, which is crucial for handling events and callbacks
 * where the standard `this` context might be lost or changed.
 *
 * Additionally, it expects other global handler objects to be available,
 * including `url_handler`, `row_handler`, and `notif_handler`,
 * which facilitate URL manipulation, row-specific actions, and
 * notification display, respectively.
 *
 * Dependencies:
 * @requires jQuery: Specifically tested and confirmed compatible with
 *                   versions 1.4.0, 1.4.1, and 1.4.2.
 * @requires url.js: Provides functionality for URL parameter handling.
 * @requires row.js: Manages individual task row operations and rendering.
 * @requires notification.js: Used for displaying user notifications.
 */
function List () {
  // Stores the results received from AJAX calls.
  this.response = null;

  // Holds the request object from the last AJAX call.
  this.request = null;

  // Stores any error messages or objects from failed AJAX calls.
  this.error = null;

  // Defines the number of tasks to display per page in the main list view.
  this.main_per_page = 10;

  // A flag indicating whether the list of groups has been fetched/initialized.
  this.groups_list = false;

  // The current search query value entered by the user.
  this.search_val = '';

  // Stores the previous search query to avoid redundant searches.
  this.last_search_q = '';

  // Stores a custom date for planning tasks, if set.
  this.plan_custom = false;

  // Various timeout identifiers to manage asynchronous operations.
  this.search_timeout = false;
  this.refresh_timeout = false;
  this.resize_timeout = false;
  this.list_timeout = false;

  // Indicates if a list item is currently being edited.
  // [0, 0] typically means no item is being edited.
  this.editing = [0, 0];

  // Hash parameters used for navigation and state management.
  this.mainpage = null;
  this.group = null;
  this.type = null;


  /**
   * Sets the internal parameters of the List object based on provided values.
   * These parameters typically correspond to values extracted from the URL hash.
   *
   * @param {number} mainpage - The page number for the main task list.
   * @param {number} group    - The ID of the currently selected group.
   * @param {number} type     - An indicator for the currently active tab (e.g., inbox, today, completed).
   */
  this.set_params = function ( mainpage, group, type ) {
    this.mainpage = mainpage;
    this.group = group;
    this.type = type;
  };


  // --- Timeouts Helper Functions ---

  /**
   * Clears any active list and refresh timeouts.
   * This prevents unwanted list updates or refreshes from occurring.
   */
  this.clear_timeout = function () {
    if ( this.list_timeout ) {
      clearTimeout( this.list_timeout );
      clearTimeout( this.refresh_timeout );
    }
  };


  /**
   * Resets the list and refresh timeouts.
   * This typically happens after an action that might require the list to be
   * reloaded or regularly refreshed after a certain period.
   *
   * A `list_timeout` is set for a single, delayed list refresh,
   * and a `refresh_timeout` is set for continuous, periodic refreshing.
   */
  this.reset_timeout = function () {
    this.clear_timeout(); // Clear any existing timeouts first.

    this.list_timeout = setTimeout( function () {
      FASTASK.list_handler.get_lists(); // Reload lists after a short delay.
    }, FASTASK.constants.timeouts.changed );

    this.refresh_timeout = setInterval( this.refresh_all,
      FASTASK.constants.timeouts.refresh ); // Set up periodic refresh.
  };


  /**
   * Initiates a full refresh of all lists.
   * This function is typically called by the refresh interval.
   */
  this.refresh_all = function () {
    FASTASK.list_handler.get_lists();
  };

  // --- End timeouts helpers ---


  // --- Task Loading Helper Functions ---

  /**
   * Marks the list display as currently loading.
   * This function typically shows a visual indicator to the user.
   *
   * @returns {boolean} `true` if the loading state was successfully set (i.e.,
   *                    no editing in progress), `false` otherwise.
   */
  this.set_loading = function () {
    // If a list item is being edited, prevent setting loading state.
    if ( this.editing ) { return false; }

    // Show the loading overlay/indicator.
    FASTASK.constant.list.children( '.loading' ).show();

    return true;
  };


  /**
   * Unmarks the list display as loading.
   * This function typically hides the visual loading indicator.
   */
  this.unset_loading = function () {
    FASTASK.constants.list.children( '.loading' ).hide();
  };

  // --- End task loading helpers ---


  /**
   * Sets a custom planning date for tasks.
   * This value might be used when creating or modifying tasks to pre-fill
   * their due date or planning date.
   *
   * @param {string} val - The value representing the custom task due date.
   */
  this.plan = function ( val ) {
    this.plan_custom = val;
  };


  /**
   * Fetches the various lists (tasks, groups, counts) from the data source
   * and then initiates the building of the displayed lists.
   * This is a core function for updating the UI.
   */
  this.get_lists = function () {
    // Store internal data for processing and passing around.
    // This simulates an AJAX response structure.
    FASTASK.list_handler.response = {
      tasks: FASTASK.data.get_tasks(),
      groups: FASTASK.data.get_folders(),
      counts: [2, 0, 4, 12], // Example counts for different list types/tabs.
      pager: ''
    };

    // Build the actual HTML lists based on the fetched response data.
    FASTASK.list_handler.build_lists();

    // After lists are built, unload the loading indicator.
    FASTASK.list_handler.unset_loading();

    // Update the visual state of the active tabs.
    FASTASK.list_handler.update_active_tabs();
  };


  /**
   * Updates the visual appearance of the active tabs in the UI
   * to reflect the current `type` state of the List handler.
   */
  this.update_active_tabs = function () {
    $( '.tabs .icon', FASTASK.constants.list )
      .removeClass( 'active' ) // Remove 'active' class from all icons.
      .eq( FASTASK.list_handler.type ) // Select the icon corresponding to the current type.
      .addClass( 'active' ); // Add 'active' class to the selected icon.
  };


  /**
   * Builds the main task list and other related UI elements
   * based on the data stored in `this.response`.
   * This function dynamically generates and updates the HTML for the lists.
   */
  this.build_lists = function () {
    var i, k, html_task, html_text, pager; // Declare local variables.

    // Update the groups dropdown or display.
    this.update_groups();

    // Remove any existing "no tasks" messages.
    $( '.notasks', FASTASK.constants.list ).remove();

    // Clear existing content from the task table.
    $( '.table', FASTASK.constants.list )
      .children().remove().end() // Remove all child elements.
      .html( '' ); // Ensure it's completely empty.

    // Loop through each task in the response to build its HTML.
    for ( i in this.response.tasks ) {
      // Build the HTML for an individual task row.
      html_task = this.build_task_json( i );
      html_task.appendTo( FASTASK.constants.list.children( '.table' ) );

      // Specific styling for tasks in the "ASSIGNMENTS" type list.
      if ( 1 === this.type && this.response.tasks[i].group ) {
        html_text = html_task.children( '.text' );
        html_text.find( '.editable' ).width(
          html_text.width() - html_text.find( '.g' ).width() -
          this.ASSIGNMENT_EDITABLE_WIDTH_ADJUSTMENT );
        html_text.children( '.editable' ).css(
          'text-indent', ( html_text.children( '.g' ).width() +
            FASTASK.constants.pixels.assignmentindent ) + 'px' );
      }
    }

    // Update the pager element based on the response.
    pager = $( '.pager', FASTASK.constants.list );
    if ( pager.length > 0 ) {
      pager.remove(); // Remove existing pager if it exists.
    }
    // Append the new pager HTML and bind its click event.
    pager = $( this.response.pager ).appendTo( FASTASK.constants.list );
    pager.children( 'a' ).bind( 'click', handle_pager_main );

    // Update the small count numbers displayed on the tabs.
    for ( k in this.response.counts ) {
      $( '.tabs .c', FASTASK.constants.list ).eq( k )
        .html( this.response.counts[k] );
    }
  };


  /**
   * Constructs and returns a jQuery object representing a single task row
   * for the main task list, based on the provided task data.
   *
   * @param {number} i - The index of the task within `this.response.tasks`.
   * @returns {jQuery} A jQuery object representing the HTML structure of the task row.
   */
  this.build_task_json = function ( i ) {
    var task_group, html_text, j, html_followers, json_task, html_task;

    json_task = this.response.tasks[i]; // Get the specific task data.
    html_task = FASTASK.constants.templates.mainrow.clone(); // Clone the base template.

    // Handle 'is_done' status.
    if ( json_task.is_done ) {
      html_task.children( '.s' ).children( 'input' )
        .attr( 'checked', 'checked' );
      if ( this.type !== 3 ) { // If not in the 'completed' tab, add 'done' class.
        html_task.addClass( 'done' );
      }
    }
    // Bind click event for the 'is_done' checkbox.
    html_task.children( '.s' ).children( 'input' )
      .bind( 'click', handle_is_done );

    // Set priority class and bind click event.
    html_task.children( '.p' )
      .addClass( 'pri_' + json_task.priority )
      .bind( 'click', handle_priority );

    html_text = html_task.children( '.text' ); // Get the text container.

    // Handle task group display.
    if ( json_task.group ) {
      task_group = FASTASK.constants.templates.rowgroup.clone().attr( 'href', '#g=' +
        json_task.group.id )
        .html( json_task.group.name );
      // Special handling for 'ASSIGNMENTS' type (type 1).
      if ( this.type === 1 ) {
        task_group.html( task_group.html() + ': ' )
          .prependTo( html_text );
        html_text.addClass( 'nogroup' );
      } else {
        task_group
          .prependTo( html_task.children( '.text' )
            .children( '.editable' )
          );
        json_task.text = ': ' + json_task.text;
      }
    }

    // Append task text and bind click for editing.
    html_text.children( '.editable' )
      .append( json_task.text )
      .bind( 'click', FASTASK.row_handler.replace_html );

    // Bind click for links within the editable text.
    html_text.find( 'a' )
      .bind( 'click', handle_editable_click );

    // Handle due date display and editing.
    html_task.children( '.due' ).children( '.editable' )
      .html( json_task.due_out )
      .bind( 'click', FASTASK.row_handler.replace_html );

    // Handle followers display.
    html_followers = FASTASK.constants.templates.followers.clone();
    for ( j in json_task.followers ) {
      html_followers.find( 'input.u' +
        json_task.followers[j].id ).attr( 'checked', 'checked' );
    }
    html_followers.appendTo( html_task.children( '.followers' ) )
      .find( 'input' ).bind( 'click', handle_follow_action );

    // Handle delete button.
    html_task.children( '.del' )
      .children( 'input[name="task_id"]' ).val( json_task.id )
      .end()
      .children( 'input[name="user_id"]' ).val( json_task.user_id )
      .end()
      .children( 'a' ).bind( 'click', handle_delete );

    return html_task;
  };


  /**
   * Executes a search operation based on the current `this.search_val`.
   * This function makes an AJAX call to the server to retrieve search results.
   */
  this.do_search = function () {
    // Do not perform search if search value is undefined or empty.
    if ( undefined === this.search_val ||
      this.search_val.length <= 0 ) {
      return;
    }

    // Initiate the AJAX request.
    $.ajax( {
      type: 'GET',
      url: FASTASK.constants.paths.list +
        '?p=' + this.search_page + '&s=' + this.search_val,
      dataType: 'json',
      beforeSend: function () {
        // Show the searching indicator and set loading state.
        $( '.search-s', FASTASK.constants.list ).show();
        FASTASK.list_handler.set_loading();
      },
      error: function ( response, textStatus, error ) {
        // Remember the search query for comparison.
        FASTASK.list_handler.last_search_q = FASTASK
          .list_handler.search_val;

        // Unset loading state and hide search indicator.
        FASTASK.list_handler.unset_loading();
        $( '.search-s', FASTASK.constants.list ).hide();

        // Specific handling for 404 (Not Found) status, implying no results.
        if ( response.status === 404 ) {
          $( '.table', FASTASK.constants.list )
            .children().remove().end()
            .html( '' );
          FASTASK.constants.templates.notasks.insertBefore( $( '.table',
            FASTASK.constants.list ) );
          return false;
        }

        // Show a generic error message for other errors.
        FASTASK.notif_handler.add( 2, 'Error while searching' );
        return false;
      },
      success: function ( response, textStatus, request ) {
        // Remember the successful search query.
        FASTASK.list_handler.last_search_q = FASTASK
          .list_handler.search_val;

        // Hide search indicator and unset loading state.
        $( '.search-s', FASTASK.constants.list ).hide();
        FASTASK.list_handler.unset_loading();

        // Clear the previous list content.
        $( '.table', FASTASK.constants.list )
          .children().remove().end()
          .html( '' );

        // Store the response and request, then build the lists.
        FASTASK.list_handler.response = response;
        FASTASK.list_handler.request = request;
        FASTASK.list_handler.build_lists();

        // Update the title to indicate search results are being displayed.
        var url_g = '#t=' + FASTASK.list_handler.group,
          title_g = FASTASK.constants.titles_plain[4];
        $( '.title', FASTASK.constants.list )
          .html( '<a href="' + url_g + '">' +
            title_g + '</a>' );
      }
    } );
  };


  /**
   * Calculates the optimal number of tasks to display per page
   * based on the available height of the list container.
   */
  this.per_page = function () {
    // Calculate main tasks per page based on container height and row height.
    this.main_per_page = parseInt( ( ( FASTASK.constants.list.height() -
      FASTASK.constants.pixels.mainminus ) / FASTASK.constants.pixels.rowheight ), 10 );
  };


  /**
   * Handles window resizing events.
   * This function recalculates tasks per page, adjusts loading box sizes,
   * and triggers a list reload if the number of visible rows changes.
   */
  this.resize = function () {
    var reload = false; // Flag to determine if a list reload is needed.

    FASTASK.list_handler.per_page(); // Recalculate tasks per page.

    // Adjust the height of loading boxes to match their parent containers.
    $( '.loading' ).each( function () {
      $( this ).height( $( this ).parent().height() + 'px' );
    } );

    // Check if the main list table's height needs adjustment or if
    // the number of rows visible has changed, which might require a reload.
    if ( $( '.table', FASTASK.constants.list )
      .height() !== FASTASK.list_handler.main_per_page * FASTASK.constants.pixels.rowheight ) {
      $( '.table', FASTASK.constants.list )
        .height( FASTASK.list_handler.main_per_page * FASTASK.constants.pixels.rowheight );
      reload = true; // Set reload flag if height changed.
    }

    // If there's no last known hash, assume a reload is needed.
    if ( !FASTASK.url_handler.hash_last ) {
      reload = true;
    }

    // If a reload is necessary, fetch the lists again.
    if ( reload ) {
      FASTASK.list_handler.get_lists();
    }
  };


  /**
   * Updates the list of groups displayed in the main dropdown or sidebar.
   * If `groups` are provided, they are used; otherwise, it uses `this.response.groups`.
   *
   * @param {Array<Object>} [groups] - An optional array of group objects to display.
   */
  this.update_groups = function ( groups ) {
    // Use `this.response.groups` if no specific groups array is provided.
    if ( undefined === groups ) {
      groups = this.response.groups;
    }

    // Update the main title if no specific group is currently selected.
    if ( !this.group ) {
      $( '.title', $( '#main' ) )
        .html( FASTASK.constants.titles_html[this.type] );
    }

    // Remove any existing groups list before rebuilding.
    if ( this.groups_list ) {
      this.groups_list.remove();
    }

    // If no groups are available, simply return.
    if ( !groups || groups.length <= 0 ) {
      return;
    }

    var html_g, url_g, i, title_g; // Declare local variables.

    // Clone the groups template to start building the new list.
    this.groups_list = FASTASK.constants.templates.groups.clone();

    // Iterate through each group to create its HTML representation.
    for ( i in groups ) {
      url_g = '#g=' + groups[i].id;
      title_g = groups[i].name +
        ' (' + groups[i].num_tasks + ')';

      // Special handling if this group is the currently active one.
      if ( this.group && this.group === groups[i].id ) {
        url_g = '#t=' + this.group; // Change URL for active group to tab view.
        $( '.title', $( '#main' ) )
          .html( '<a href="' + url_g + '">' +
            title_g +
            '</a>' );
        title_g = FASTASK.constants.titles_plain[this.type]; // Use tab title.
      }

      // Create the HTML for the individual group item.
      html_g = FASTASK.constants.templates.group.clone();
      html_g.children( 'a' )
        .attr( 'href', url_g )
        .html( title_g );
      this.groups_list.append( html_g ); // Add to the list.
    }

    // Append the fully built groups list to the UI and bind click events.
    this.groups_list.appendTo( $( '.groups', FASTASK.constants.list ) );
    $( '.groups a' ).bind( 'click', handle_change_group );
  };


  /**************************************************************************/
  /*                                                                        */
  /*                       JQUERY EVENT HANDLERS                            */
  /*                                                                        */
  /* After this point, all functions are designed to be called directly     */
  /* or indirectly by jQuery event listeners, responding to user actions.   */
  /*                                                                        */
  /**************************************************************************/


  /**
   * Callback function for handling search input changes.
   * This function updates `list_handler.search_page` and manages search timeouts.
   * It prevents immediate searches and only triggers a search after a short delay
   * if the input value meets certain criteria.
   *
   * @param {Event} e - The event object from the input field.
   */
  handle_search_action = function ( e ) {
    FASTASK.list_handler.search_page = 1; // Reset search page to 1.
    clearTimeout( FASTASK.list_handler.search_timeout ); // Clear any pending search timeout.

    var search_val = $( this ).val(); // Get the current value from the search input.

    // If search value is too short.
    if ( search_val.length < FASTASK.constants.counts.searchmin ) {
      if ( search_val.length <= 0 ) {
        // If search box is empty and there was a previous search, reload lists.
        if ( FASTASK.list_handler.last_search_q.length > 0 ) {
          FASTASK.list_handler.get_lists();
        }
        FASTASK.list_handler.last_search_q = ''; // Clear last search query.
      }
      return true; // Exit, no search action needed.
    }

    // If the search query hasn't changed since the last executed search, do nothing.
    if ( FASTASK.list_handler.last_search_q === search_val ) {
      return true;
    }

    FASTASK.list_handler.clear_timeout(); // Clear list/refresh timeouts to prevent conflicts.

    // Set a timeout to perform the search after a small delay.
    FASTASK.list_handler.search_timeout = setTimeout( function () {
      FASTASK.list_handler.search_val = search_val; // Update the handler's search value.
      FASTASK.list_handler.do_search(); // Execute the search.
    }, FASTASK.constants.timeouts.search );
  };


  /**
   * Callback function for handling clicks on the main pager links.
   * This function updates the URL hash to reflect the new page number,
   * which in turn triggers a list reload or a search if a search is active.
   *
   * @returns {boolean} `false` to prevent the default link behavior.
   */
  handle_pager_main = function () {
    var page = parseInt( FASTASK.url_handler
      .get_url_param( FASTASK.constants.params.mainpage, $( this ).attr( 'href' ) ), 10 );

    // If a search is currently active, update search page and re-run search.
    if ( FASTASK.list_handler.last_search_q.length > 0 ) {
      FASTASK.list_handler.search_page = page;
      FASTASK.list_handler.last_search_q = list_handler.search_val; // This seems like a bug, should be FASTASK.list_handler.search_val
      FASTASK.list_handler.do_search();
    } else {
      // Otherwise, update the URL hash for the main page parameter.
      FASTASK.url_handler.url_update_hash( FASTASK.constants.params.mainpage, page );
    }
    return false; // Prevent default link navigation.
  };


  /**
   * Callback function for handling clicks on the task priority indicator.
   * This function initiates an update to the task's priority.
   *
   * @param {Event} e - The event object.
   * @returns {boolean} `false` to prevent any default action.
   */
  handle_priority = function ( e ) {
    FASTASK.row_handler.update_row( 'priority', $( this ) );
    return false;
  };


  /**
   * Callback function for handling clicks on the task 'is_done' checkbox.
   * This function initiates an update to the task's completion status.
   *
   * @param {Event} e - The event object.
   */
  handle_is_done = function ( e ) {
    FASTASK.row_handler.update_row( 'is_done', $( this ) );
  };


  /**
   * Callback function for handling clicks on the delete task button.
   * This function initiates the deletion of a task.
   *
   * @param {Event} e - The event object.
   * @returns {boolean} `false` to prevent any default action.
   */
  handle_delete = function ( e ) {
    FASTASK.row_handler.update_row( 'delete', $( this ) );
    return false;
  };


  /**
   * Callback function for handling clicks on the undelete task button.
   * This function initiates the undeletion (restoration) of a task.
   *
   * @param {Event} e - The event object.
   * @returns {boolean} `false` to prevent any default action.
   */
  handle_undelete = function ( e ) {
    FASTASK.row_handler.update_row( 'undelete', $( this ) );
    return false;
  };


  /**
   * Callback function for handling clicks on editable task elements.
   * This function either changes the group via URL hash or navigates
   * to an external URL if Ctrl key is not pressed.
   *
   * @param {Event} e - The event object.
   * @returns {boolean} `false` to prevent default link behavior if handled.
   */
  handle_editable_click = function ( e ) {
    // If the clicked element is a group link.
    if ( $( this ).hasClass( 'g' ) ) {
      var id = $( this ).attr( 'href' ).substr( 3 ); // Extract group ID.
      // Update URL hash to change the active group.
      FASTASK.url_handler.url_update_hash( FASTASK.constants.params.group, id, true );
      return false; // Prevent default link behavior.
    }
    // If Ctrl key is not pressed, navigate to the link's href.
    else if ( !e.ctrlKey ) {
      window.location.href = $( this ).attr( 'href' );
      return false; // Prevent default link behavior.
    }
  };