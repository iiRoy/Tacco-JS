( function ( ) {


  // Enforce strict mode for cleaner code and error handling.
  "use strict" ;

  /**
   * This internal helper function is responsible for emitting custom
   * DOM events on a specified HTML element. It handles cross-browser
   * compatibility for event creation.
   *
   * @param { HTMLElement } element    - The target DOM element where the event will be dispatched.
   * @param { String } eventName       - The name of the event to be emitted (e.g., "click", "custom:event").
   * @param { Object } [ data = {} ]   - Optional custom data payload to be attached to the event. Defaults to an empty object.
   * @private
   */
  function _emitEvent ( element , eventName , data )
  {
    var event ; // Declare event variable.

    // Check for standard event creation mechanism (W3C DOM Events).
    if ( document . createEvent )
    {
      event = document . createEvent( "HTMLEvents" ) ; // Create a generic HTML event.
      event . initEvent( eventName , true , true ) ; // Initialize the event: name, bubbles, cancelable.
    }
    // Fallback for older Internet Explorer versions (IE < 9).
    else
    {
      event = document . createEventObject( ) ; // Create a proprietary event object.
      event . eventType = eventName ; // Assign the event type.
    }

    // Attach additional properties to the event object for consistency.
    event . eventName = eventName ;
    event . data = data || { } ; // Ensure data is an object, even if not provided.

    // Dispatch the event using the appropriate method.
    if ( document . createEvent )
    {
      element . dispatchEvent( event ) ; // Standard dispatch method.
    }
    else
    {
      element . fireEvent( "on" + event . eventType , event ) ; // IE proprietary method.
    }
  } // End of _emitEvent function definition.


  /*
   * GitGraph Constructor Function
   * Initializes a new GitGraph instance with specified options,
   * setting up the canvas, rendering properties, and event listeners.
   *
   * @constructor
   *
   * @param { Object } options                                     - Configuration object for the GitGraph instance.
   * @param { String } [ options.elementId = "gitGraph" ]          - The DOM ID of the canvas container element.
   * @param { Template | String | Object } [ options.template ]    - Defines the visual template for the graph (e.g., "metro", custom object).
   * @param { String } [ options.author = "Sergio Flores <saxo-guy@epic.com>" ] - Default author string for new commits.
   * @param { String } [ options.mode = ( null | "compact" ) ]    - Display mode, e.g., "compact" to hide commit messages.
   * @param { HTMLElement } [ options.canvas ]                     - An optional pre-existing HTML canvas element to use.
   * @param { String } [ options.orientation = ( "vertical-reverse" | "horizontal" | "horizontal-reverse" ) ] - Graph layout orientation.
   *
   * @this GitGraph
   */
  function GitGraph ( options )
  {
    // Initialize options, ensuring it's an object.
    options = ( typeof options === "object" ) ? options : { } ;

    // Set instance properties with defaults or provided values.
    this . elementId = ( typeof options . elementId === "string" ) ? options . elementId : "gitGraph" ;
    this . author = ( typeof options . author === "string" ) ? options . author : "Sergio Flores <saxo-guy@epic.com>" ;

    // Template handling logic.
    if ( ( typeof options . template === "string" ) || ( typeof options . template === "object" ) )
    {
      this . template = this . newTemplate( options . template ) ; // Create new template from string/object.
    }
    else if ( options . template instanceof Template )
    {
      this . template = options . template ; // Use existing Template instance.
    }
    else
    {
      this . template = this . newTemplate( "metro" ) ; // Default to "metro" template.
    }

    // Set graph display mode.
    this . mode = options . mode || null ;
    if ( this . mode === "compact" )
    {
      this . template . commit . message . display = false ; // Hide commit messages in compact mode.
    }

    // Define margins and offsets based on template settings.
    this . marginX = this . template . commit . dot . size * 2 ;
    this . marginY = this . template . commit . dot . size * 2 ;
    this . offsetX = 0 ;
    this . offsetY = 0 ;

    // Configure graph orientation and adjust template spacing accordingly.
    switch ( options . orientation )
    {
      case "vertical-reverse" :
        this . template . commit . spacingY *= -1 ; // Reverse vertical spacing.
        this . orientation = "vertical-reverse" ;
        break ;
      case "horizontal" :
        this . template . commit . message . display = false ; // Hide messages for horizontal layouts.
        this . template . commit . spacingX = this . template . commit . spacingY ;
        this . template . branch . spacingY = this . template . branch . spacingX ;
        this . template . commit . spacingY = 0 ;
        this . template . branch . spacingX = 0 ;
        this . orientation = "horizontal" ;
        break ;
      case "horizontal-reverse" :
        this . template . commit . message . display = false ; // Hide messages for horizontal layouts.
        this . template . commit . spacingX = - this . template . commit . spacingY ; // Reverse horizontal spacing.
        this . template . branch . spacingY = this . template . branch . spacingX ;
        this . template . commit . spacingY = 0 ;
        this . template . branch . spacingX = 0 ;
        this . orientation = "horizontal-reverse" ;
        break ;
      default :
        this . orientation = "vertical" ; // Default orientation.
        break ;
    } // End of orientation switch.

    // Canvas initialization: get element by ID or use provided canvas.
    this . canvas = document . getElementById( this . elementId ) || options . canvas ;
    this . context = this . canvas . getContext( "2d" ) ; // Get 2D rendering context.

    // Setup for the tooltip layer.
    this . tooltip = document . createElement( "div" ) ;
    this . tooltip . className = "gitgraph-tooltip" ;
    this . tooltip . style . position = "fixed" ;
    this . tooltip . style . display = "none" ;

    // Append the tooltip div to the document body.
    document . body . appendChild( this . tooltip ) ;

    // Internal data structures for graph navigation and rendering.
    this . HEAD = null ; // Current active branch.
    this . branchs = [ ] ; // Array of all branches.
    this . commits = [ ] ; // Array of all commits.

    // Utility variables for rendering calculations.
    this . columnMax = 0 ; // Tracks maximum column index for layout.
    this . commitOffsetX = 0 ;
    this . commitOffsetY = 0 ;

    // Bind event listeners.
    var mouseMoveOptions = {
      handleEvent : this . hover , // Event handler for mouse movement.
      gitgraph : this // Reference to the GitGraph instance for the handler.
    } ;
    this . canvas . addEventListener( "mousemove" , mouseMoveOptions , false ) ; // Attach mousemove listener.

    // Re-render the graph when the window is resized to adjust canvas dimensions.
    window . onresize = this . render . bind( this ) ;
  } // End of GitGraph constructor.


  /**
   * Method: GitGraph.prototype.branch
   *
   * Creates and adds a new branch to the GitGraph instance.
   * This method typically creates a branch stemming from the current HEAD.
   *
   * @param { ( String | Object ) } options - Either the name of the new branch as a string,
   *                                          or an object containing branch configuration options.
   *
   * @see Branch
   * @this GitGraph
   *
   * @returns { Branch } A reference to the newly created Branch object.
   */
  GitGraph . prototype . branch = function ( options )
  {
    // Normalize options: if a string is provided, treat it as the branch name.
    if ( typeof options === "string" )
    {
      var name = options ; // Store the branch name.
      options = { } ; // Reinitialize options as an empty object.
      options . name = name ; // Assign the name property.
    }

    // Ensure options is an object, default if necessary.
    options = ( typeof options === "object" ) ? options : { } ;

    // Set the parent GitGraph instance and the parent branch (defaulting to HEAD).
    options . parent = this ;
    options . parentBranch = options . parentBranch || this . HEAD ;

    // Instantiate and add the new branch to the graph's collection.
    var branch = new Branch( options ) ;
    this . branchs . push( branch ) ;

    // Return the new branch for further operations.
    return branch ;
  } ;


  /**
   * Method: GitGraph.prototype.orphanBranch
   *
   * Creates a new branch that does not stem from any existing commit or branch.
   * This is useful for initial branches or detached work.
   *
   * @param { ( String | Object ) } options - Branch name or an options object for the new branch.
   *
   * @see Branch
   * @this GitGraph
   *
   * @returns { Branch } The newly created orphan Branch object.
   */
  GitGraph . prototype . orphanBranch = function ( options )
  {
    // Handle string option for branch name.
    if ( typeof options === "string" )
    {
      var name = options ;
      options = { } ;
      options . name = name ;
    }

    // Ensure options object.
    options = ( typeof options === "object" ) ? options : { } ;
    options . parent = this ; // Set the parent GitGraph.

    // Create and store the new orphan branch.
    var branch = new Branch( options ) ;
    this . branchs . push( branch ) ;

    // Return the fresh branch.
    return branch ;
  } ;


  /**
   * Method: GitGraph.prototype.commit
   *
   * Performs a commit operation on the currently active branch (HEAD).
   * This delegates the actual commit creation to the HEAD branch.
   *
   * @param { Object } options - Configuration options for the commit.
   *
   * @see Commit
   * @this GitGraph
   *
   * @returns { GitGraph } Returns the GitGraph instance itself, enabling method chaining.
   */
  GitGraph . prototype . commit = function ( options )
  {
    this . HEAD . commit( options ) ; // Delegate commit creation to the HEAD branch.

    // Allow chaining by returning the GitGraph instance.
    return this ;
  } ;


  /**
   * Method: GitGraph.prototype.newTemplate
   *
   * Factory method to create a new Template instance.
   *
   * @param { ( String | Object ) } options - Can be a string representing a predefined template name (e.g., "metro")
   *                                          or a configuration object to define a custom template.
   *
   * @returns { Template } A new Template object, either pre-configured or custom.
   */
  GitGraph . prototype . newTemplate = function ( options )
  {
    // If a string, retrieve a predefined template.
    if ( typeof options === "string" )
    {
      return new Template( ) . get( options ) ;
    }
    // Otherwise, create a new template using the provided object options.
    return new Template( options ) ;
  } ;


  /**
   * Method: GitGraph.prototype.render
   *
   * Redraws the entire GitGraph on the canvas. This involves:
   * 1. Adjusting for high-resolution displays (retina support).
   * 2. Calculating and resizing the canvas based on graph content.
   * 3. Clearing the canvas.
   * 4. Applying necessary transformations (margins, orientation).
   * 5. Rendering all branches and then all commits.
   *
   * @this GitGraph
   */
  GitGraph . prototype . render = function ( )
  {
    var backingStorePixelRatio ; // Variable to store the backing store pixel ratio.
    var scalingFactor ;          // Overall scaling factor for high-DPI displays.

    // Initialize scaling factor.
    scalingFactor = 1 ;

    // Detect and apply scaling for high-resolution (Retina) displays.
    if ( window . devicePixelRatio )
    {
      // Get the various vendor-prefixed backing store pixel ratios, default to 1.
      backingStorePixelRatio = this . context . webkitBackingStorePixelRatio ||
                               this . context . mozBackingStorePixelRatio ||
                               this . context . msBackingStorePixelRatio ||
                               this . context . oBackingStorePixelRatio ||
                               this . context . backingStorePixelRatio || 1 ;

      // Calculate the final scaling factor.
      scalingFactor *= window . devicePixelRatio / backingStorePixelRatio ;
    }

    // Calculate the required unscaled canvas resolution based on graph content.
    var unscaledResolution = {
      x : Math . abs( this . columnMax * this . template . branch . spacingX )
          + Math . abs( this . commitOffsetX )
          + this . marginX * 2 ,
      y : Math . abs( this . columnMax * this . template . branch . spacingY )
          + Math . abs( this . commitOffsetY )
          + this . marginY * 2
    } ;

    // If commit messages are displayed, allocate extra horizontal space.
    if ( this . template . commit . message . display )
    {
      unscaledResolution . x += 800 ; // Add fixed width for messages.
    }

    // Apply calculated dimensions to the canvas style (CSS pixels).
    this . canvas . style . width = unscaledResolution . x + "px" ;
    this . canvas . style . height = unscaledResolution . y + "px" ;

    // Set actual canvas dimensions, accounting for scaling factor (device pixels).
    this . canvas . width = unscaledResolution . x * scalingFactor ;
    this . canvas . height = unscaledResolution . y * scalingFactor ;

    // Apply the scaling transformation to the rendering context.
    this . context . scale( scalingFactor , scalingFactor ) ;

    // Clear the entire canvas before redrawing.
    this . context . clearRect( 0 , 0 , this . canvas . width , this . canvas . height ) ;

    // Apply initial translation for graph margins.
    this . context . translate( this . marginX , this . marginY ) ;

    // Adjust canvas origin for inverse orientations.
    if ( this . template . commit . spacingY > 0 )
    {
      this . context . translate( 0 , this . canvas . height - this . marginY * 2 ) ;
      this . offsetY = this . canvas . height - this . marginY * 2 ; // Update internal offset.
    }
    if ( this . template . commit . spacingX > 0 )
    {
      this . context . translate( this . canvas . width - this . marginX * 2 , 0 ) ;
      this . offsetX = this . canvas . width - this . marginX * 2 ; // Update internal offset.
    }

    // Render all branches. Iterate backwards to ensure proper layering if needed.
    for ( var i = this . branchs . length - 1 , branch ; !! ( branch = this . branchs [ i ] ) ; i-- )
    {
      branch . render ( ) ;
    }

    // Render all commits on top of branches.
    for ( var j = 0 , commit ; !! ( commit = this . commits [ j ] ) ; j++ )
    {
      commit . render ( ) ;
    }
  } ; // End of render method.


  /**
   * Method: GitGraph.prototype.hover
   *
   * Handles mouse movement events over the canvas to detect hovering
   * over commit dots and display tooltips/emit events.
   *
   * @param { MouseEvent } event - The DOM MouseEvent object.
   *
   * @self GitGraph
   */
  GitGraph . prototype . hover = function ( event )
  {
    var self = this . gitgraph ; // 'this' in event handler refers to mouseMoveOptions, so get gitgraph instance.
    var isOut = true ; // Flag to track if mouse is outside all commits.

    // Normalize offsetX/Y and x/y for cross-browser compatibility (e.g., Firefox).
    event . offsetX = event . offsetX ? event . offsetX : event . layerX ;
    event . offsetY = event . offsetY ? event . offsetY : event . layerY ;
    event . x = event . x ? event . x : event . clientX ;
    event . y = event . y ? event . y : event . clientY ;

    // --- Helper function to display the commit tooltip ---
    function showCommitTooltip ( )
    {
      self . tooltip . style . left = event . x + "px" ; // Set tooltip X position. (Note: potential scroll bug)
      self . tooltip . style . top = event . y + "px" ;  // Set tooltip Y position. (Note: potential scroll bug)
      self . tooltip . textContent = commit . sha1 + " - " + commit . message ; // Set tooltip content.
      self . tooltip . style . display = "block" ; // Make tooltip visible.
    }

    // --- Helper function to emit a custom mouseover event ---
    function emitMouseoverEvent ( )
    {
      var mouseoverEventOptions = {
        author  : commit . author ,
        message : commit . message ,
        date    : commit . date ,
        sha1    : commit . sha1
      } ;

      _emitEvent( self . canvas , "commit:mouseover" , mouseoverEventOptions ) ; // Dispatch custom event.
    }

    // Iterate through all commits to check for hover state.
    for ( var i = 0 , commit ; !! ( commit = this . gitgraph . commits [ i ] ) ; i-- )
    {
      // Calculate distances from commit center to mouse pointer.
      var distanceX = ( commit . x + self . offsetX + self . marginX - event . offsetX ) ;
      var distanceY = ( commit . y + self . offsetY + self . marginY - event . offsetY ) ;

      // Calculate Euclidean distance.
      var distanceBetweenCommitCenterAndMouse = Math . sqrt( Math . pow( distanceX , 2 ) + Math . pow( distanceY , 2 ) ) ;

      // Determine if the mouse is currently over this specific commit dot.
      var isOverCommit = distanceBetweenCommitCenterAndMouse < self . template . commit . dot . size ;

      if ( isOverCommit )
      {
        // If commit messages are hidden, display the tooltip.
        if ( ! self . template . commit . message . display )
        {
          showCommitTooltip( ) ;
        }

        // Emit mouseover event only if it's the first time hovering over this commit.
        if ( ! commit . isMouseover )
        {
          emitMouseoverEvent( ) ;
        }

        isOut = false ; // Mouse is over at least one commit.
        commit . isMouseover = true ; // Mark this commit as being hovered over.
      }
      else
      {
        commit . isMouseover = false ; // Mouse is no longer over this commit.
      }
    }

    // If the mouse is not over any commit, hide the tooltip.
    if ( isOut )
    {
      self . tooltip . style . display = "none" ;
    }
  } ; // End of hover method.


  // --------------------------------------------------------------------------------------------------
  // ------------------------------------ Branch Object Definition ------------------------------------
  // --------------------------------------------------------------------------------------------------

  /**
   * Branch Constructor
   * Represents a single branch within the GitGraph visualization.
   * Manages its own commits, rendering path, and properties like color and spacing.
   *
   * @constructor
   *
   * @param { Object } options                     - Configuration options for the new branch.
   * @param { GitGraph } options.parent            - A mandatory reference to the parent GitGraph instance.
   * @param { Branch } [ options.parentBranch ]    - The branch from which this new branch originates (if any).
   * @param { String } [ options.name = "no-name" ] - The name of the branch.
   *
   * @this Branch
   */
  function Branch ( options )
  {
    // Essential integrity check: ensure a valid GitGraph parent is provided.
    if ( options . parent instanceof GitGraph === false )
    {
      // If no valid parent, the branch cannot be created properly.
      return ;
    }

    // Initialize branch options, ensuring it's an object.
    options = ( typeof options === "object" ) ? options : { } ;

    // Assign core properties from options or defaults.
    this . parent = options . parent ;
    this . parentBranch = options . parentBranch ; // The branch this one might have forked from.
    this . name = ( typeof options . name === "string" ) ? options . name : "no-name" ;

    // Inherit context and template from the parent GitGraph.
    this . context = this . parent . context ;
    this . template = this . parent . template ;

    // Set line appearance properties, prioritizing branch-specific options then template defaults.
    this . lineWidth = options . lineWidth || this . template . branch . lineWidth ;
    this . lineDash = options . lineDash || this . template . branch . lineDash ;

    // Inherit spacing from the template.
    this . spacingX = this . template . branch . spacingX ;
    this . spacingY = this . template . branch . spacingY ;

    // Initialize dimensions and collections.
    this . size = 0 ;     // Number of commits on this branch.
    this . height = 0 ;   // Calculated height for rendering.
    this . width = 0 ;    // Calculated width for rendering.
    this . commits = [ ] ; // Array to hold all commits belonging to this branch.
    this . path = [ ] ;   // Stores points {x, y, type} defining the visual path of the branch line.

    // Calculate the column index for this branch, used for automatic positioning and coloring.
    this . column = 0 ;
    this . calculColumn ( ) ; // This method must be defined elsewhere (e.g., Branch.prototype).

    // Determine visual offsets based on the calculated column.
    this . offsetX = this . column * this . spacingX ;
    this . offsetY = this . column * this . spacingY ;

    // Set the branch color: custom option, template default, or auto-assigned from template colors array.
    this . color = options . color || this . template . branch . color || this . template . colors [ this . column ] ;

    // Automatically checkout this new branch, making it the active HEAD.
    this . checkout ( ) ; // This method must be defined elsewhere (e.g., Branch.prototype).
  } // End of Branch constructor.


  /**
   * Method: Branch.prototype.branch
   *
   * Creates a new branch that forks off from the current commit of *this* branch.
   *
   * @param { ( String | Object ) } options - Name of the new branch (string) or an options object.
   *
   * @see Branch
   * @this Branch
   *
   * @returns { Branch } The newly created Branch instance.
   */
  Branch . prototype . branch = function ( options )
  {
    // If options is a string, assume it's the branch name.
    if ( typeof options === "string" )
    {
      var name = options ;
      options = { } ;
      options . name = name ;
    }

    // Ensure options is an object.
    options = ( typeof options === "object" ) ? options : { } ;

    // Set the parent GitGraph instance and explicitly set *this* branch as the parent branch.
    options . parent = this . parent ;
    options . parentBranch = options . parentBranch || this ; // The new branch forks from 'this' branch.

    // Create the new branch and add it to the parent GitGraph's collection.
    var branch = new Branch( options ) ;
    this . parent . branchs . push( branch ) ;

    // Return the new branch object.
    return branch ;
  } ;


  /**
   * Method: Branch.prototype.render
   *
   * Draws the path of this branch on the canvas.
   * Uses the stored `path` array to draw lines or Bezier curves.
   *
   * @this Branch
   */
  Branch . prototype . render = function ( )
  {
    this . context . beginPath ( ) ; // Start a new path for drawing the branch line.

    // Iterate through all points in the branch's path.
    for ( var i = 0 , point ; !! ( point = this . path [ i ] ) ; i++ )
    {
      if ( point . type === "start" )
      {
        this . context . moveTo( point . x , point . y ) ; // Move to the starting point without drawing.
      }
      else
      {
        // Check if the branch merge style is 'bezier' for curved lines.
        if ( this . template . branch . mergeStyle === "bezier" )
        {
          var path = this . path [ i - 1 ] ; // Get the previous point for Bezier control points.

          this . context . bezierCurveTo(
            path . x - this . template . commit . spacingX / 2 , path . y - this . template . commit . spacingY / 2 ,
            point . x + this . template . commit . spacingX / 2 , point . y + this . template . commit . spacingY / 2 ,
            point . x , point . y
          ) ;
        }
        else
        {
          this . context . lineTo( point . x , point . y ) ; // Draw a straight line to the current point.
        }
      }
    }

    // Set line style properties.
    this . context . lineWidth = this . lineWidth ;
    this . context . strokeStyle = this . color ;

    // Apply line dashing if supported by the canvas context.
    if ( this . context . setLineDash !== undefined )
    {
      this . context . setLineDash( this . lineDash ) ; // Apply the dash pattern.
    }

    this . context . stroke ( ) ;   // Draw the path.
    this . context . closePath ( ) ; // Close the current path.
  } ; // End of render method.


  /**
   * Method: Branch.prototype.commit
   *
   * Adds a new commit to this branch. This method handles parsing commit options
   * and setting up the commit's properties before it is actually created.
   *
   * @param { ( String | Object ) } [ options ] - Either the commit message (string) or an options object.
   * @param { String } [ options.detailId ]     - Optional ID of a DOM element for commit details.
   *
   * @see Commit
   *
   * @this Branch
   */
  Branch . prototype . commit = function ( options )
  {
    // Normalize options: if a string, treat it as the commit message.
    if ( typeof ( options ) === "string" )
    {
      var message = options ;
      options = { message : message } ;
    }
    // If options is not an object, initialize it as an empty object.
    else if ( typeof ( options ) !== "object" )
    {
      options = { } ;
    }

    // Set default commit properties based on branch and template.
    options . arrowDisplay = this . template . arrow . active ; // Should arrows be displayed?
    options . branch = this ; // Reference to the parent branch.
    options . color = options . color || this . template . commit . color || this . template . colors [ this . column ] ; // Commit color.
    options . parent = this . parent ; // Reference to the parent GitGraph.
    options . parentCommit = options . parentCommit || this . commits . slice( -1 ) [ 0 ] ; // The commit this new commit is based on.

    // Special compact mode
} ) ( ) ;