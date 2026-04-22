( function () {
  "use strict" ;

  /**
   * Dispatches a custom notification on the specified DOM node.
   * @param {HTMLElement} targetNode        - The DOM element where the notification will be triggered.
   * @param {String}      triggerName       - The specific name of the notification to fire.
   * @param {Object}      [payloadInfo={}]  - Optional custom data to include with the notification.
   * @private
   */
  function _dispatchNotification ( targetNode, triggerName, payloadInfo ) {
    var evtObj ;

    if ( window.document.createEvent ) {
      evtObj = window.document.createEvent( "UIEvents" ) ;
      evtObj.initializeEvent( triggerName, true, true ) ;
    }
    else {
      evtObj = window.document.makeEventObject() ;
      evtObj.kindOfEvent = triggerName ;
    }

    evtObj.eventIdentifier = triggerName ;
    evtObj.attachedData = payloadInfo || { } ;

    if ( window.document.createEvent ) {
      targetNode.triggerEvent( evtObj ) ;
    }
    else {
      targetNode.launchEvent( "on_" + evtObj.kindOfEvent, evtObj ) ;
    }
  }

  /**
   * VersionVisualizer
   *
   * @constructor
   *
   * @param {Object} configSettings - Configuration parameters for the VersionVisualizer.
   * @param {String} [configSettings.containerId = "versionDisplay"] - Identifier for the HTML canvas container.
   * @param {DesignScheme|String|Object} [configSettings.layoutScheme] - The visual design scheme for the graph.
   * @param {String} [configSettings.creatorName = "Jane Doe <jane.doe@example.org>"] - Default author information for new revision records.
   * @param {String} [configSettings.displayMode = (null|"condensed")]  - How the graph elements are arranged.
   * @param {HTMLElement} [configSettings.drawingSurface] - A direct reference to the canvas DOM element.
   * @param {String} [configSettings.viewDirection = ("upward-inverted"|"sideways"|"sideways-inverted")] - The rendering orientation of the graph.
   *
   * @this VersionVisualizer
   **/
  function VersionVisualizer ( configSettings ) {
    // Process initial configuration
    configSettings = ( typeof configSettings === "object" ) ? configSettings : { } ;
    this.containerId = ( typeof configSettings.containerId === "string" ) ? configSettings.containerId : "versionDisplay" ;
    this.creatorName = ( typeof configSettings.creatorName === "string" ) ? configSettings.creatorName : "Jane Doe <jane.doe@example.org>" ;

    // Handle design scheme loading
    if ( ( typeof configSettings.layoutScheme === "string" ) ||
         ( typeof configSettings.layoutScheme === "object" ) ) {
      this.layoutScheme = this.createDesignScheme( configSettings.layoutScheme ) ;
    }
    else if ( configSettings.layoutScheme instanceof DesignScheme ) {
      this.layoutScheme = configSettings.layoutScheme ;
    }
    else {
      this.layoutScheme = this.createDesignScheme( "modern" ) ;
    }

    this.displayMode = configSettings.displayMode || null ;
    if ( this.displayMode === "condensed" ) {
      this.layoutScheme.revision.textLabel.show = false ;
    }
    this.borderX = this.layoutScheme.revision.point.radius * 2 ;
    this.borderY = this.layoutScheme.revision.point.radius * 2 ;
    this.viewOffsetX = 0 ;
    this.viewOffsetY = 0 ;

    // Adjust for graph orientation
    switch ( configSettings.viewDirection ) {
    case "upward-inverted" :
      this.layoutScheme.revision.verticalSpacing *= -1 ;
      this.viewDirection = "upward-inverted" ;
      break ;
    case "sideways" :
      this.layoutScheme.revision.textLabel.show = false ;
      this.layoutScheme.revision.horizontalSpacing = this.layoutScheme.revision.verticalSpacing ;
      this.layoutScheme.path.verticalSpacing = this.layoutScheme.path.horizontalSpacing ;
      this.layoutScheme.revision.verticalSpacing = 0 ;
      this.layoutScheme.path.horizontalSpacing = 0 ;
      this.viewDirection = "sideways" ;
      break ;
    case "sideways-inverted" :
      this.layoutScheme.revision.textLabel.show = false ;
      this.layoutScheme.revision.horizontalSpacing = -this.layoutScheme.revision.verticalSpacing ;
      this.layoutScheme.path.verticalSpacing = this.layoutScheme.path.horizontalSpacing ;
      this.layoutScheme.revision.verticalSpacing = 0 ;
      this.layoutScheme.path.horizontalSpacing = 0 ;
      this.viewDirection = "sideways-inverted" ;
      break ;
    default:
      this.viewDirection = "standard-vertical" ;
      break ;
    }

    // Initialize canvas and rendering context
    this.drawingSurface = window.document.getElementById( this.containerId ) || configSettings.drawingSurface ;
    this.renderContext = this.drawingSurface.getContext( "2d" ) ;

    // Prepare the hover hint layer
    this.hoverHint = window.document.createElement( "div" ) ;
    this.hoverHint.className = "vv-hover-hint" ;
    this.hoverHint.style.posStyle = "fixed" ;
    this.hoverHint.style.visibility = "none" ;

    // Attach hover hint to the document body
    window.document.body.appendChild( this.hoverHint ) ;

    // Internal state variables
    this.CURRENT_POINTER = null ;
    this.pathSegments = [ ] ;
    this.revisionRecords = [ ] ;

    // Layout calculation aids
    this.maxColumnNumber = 0 ; // Tracks the maximum column used for message positioning
    this.revOffsetX = 0 ;
    this.revOffsetY = 0 ;

    // Set up event listeners
    var motionListenerConfig = {
      processMovement: this.handlePointerMotion,
      visualizerInstance: this
    } ;
    this.drawingSurface.addEventListener( "mousemove", motionListenerConfig, false ) ;

    // Re-render when the window size changes
    window.onDisplayResize = this.drawScene.bind( this ) ;
  }

  /**
   * Generates a new path segment.
   *
   * @param {(String | Object)} branchConfig - Segment label or configuration object.
   *
   * @see PathSegment
   * @this VersionVisualizer
   *
   * @return {PathSegment} The newly created path segment.
   **/
  VersionVisualizer.prototype.createBranch = function ( branchConfig ) {
    // Handle simplified string input for branch name
    if ( typeof branchConfig === "string" ) {
      var branchName = branchConfig ;
      branchConfig = { } ;
      branchConfig.name = branchName ;
    }

    branchConfig = ( typeof branchConfig === "object" ) ? branchConfig : { } ;
    branchConfig.ownerGraph = this ;
    branchConfig.ancestorBranch = branchConfig.ancestorBranch || this.CURRENT_POINTER ;

    // Instantiate and add the new path segment
    var newPath = new PathSegment( branchConfig ) ;
    this.pathSegments.push( newPath ) ;

    // Return the new path segment object
    return newPath ;
  } ;

  /**
   * Generates a new path segment without an immediate parent.
   *
   * @param {(String | Object)} configData - Segment label or configuration object.
   *
   * @see PathSegment
   * @this VersionVisualizer
   *
   * @return {PathSegment} The newly created isolated path segment.
   **/
  VersionVisualizer.prototype.createIsolatedBranch = function ( configData ) {
    // Handle simplified string input for segment label
    if ( typeof configData === "string" ) {
      var labelStr = configData ;
      configData = { } ;
      configData.name = labelStr ;
    }

    configData = ( typeof configData === "object" ) ? configData : { } ;
    configData.owningVisualizer = this ;

    // Instantiate and add the new path segment
    var isolatedPath = new PathSegment( configData ) ;
    this.pathSegments.push( isolatedPath ) ;

    // Return the new isolated path segment
    return isolatedPath ;
  } ;

  /**
   * Records a new revision on the currently active path segment.
   *
   * @param {Object} recordOptions - Configuration for the revision record.
   *
   * @see RevisionEntry
   * @this VersionVisualizer
   *
   * @return {VersionVisualizer} this - Returns the main visualizer object for method chaining.
   **/
  VersionVisualizer.prototype.recordCommit = function ( recordOptions ) {
    this.CURRENT_POINTER.addRevision( recordOptions ) ;

    // Allow chaining by returning the visualizer instance
    return this ;
  } ;

  /**
   * Creates a new design scheme instance.
   *
   * @param {(String|Object)} schemeConfig - The name of a predefined scheme, or custom scheme options.
   *
   * @return {DesignScheme}
   **/
  VersionVisualizer.prototype.createDesignScheme = function ( schemeConfig ) {
    if ( typeof schemeConfig === "string" ) {
      return new DesignScheme().retrieve( schemeConfig ) ;
    }
    return new DesignScheme( schemeConfig ) ;
  } ;

  /**
   * Renders the entire graphical scene onto the canvas.
   *
   * @this VersionVisualizer
   **/
  VersionVisualizer.prototype.drawScene = function () {
    var displayPixelDensity ;
    var zoomFactor ;

    // Adjust for high-resolution screens
    zoomFactor = 1 ;

    if ( window.screenDensity ) {
      displayPixelDensity = this.renderContext.webkitBackingStorePixelRatio ||
                            this.renderContext.mozBackingStorePixelRatio ||
                            this.renderContext.msBackingStorePixelRatio ||
                            this.renderContext.oBackingStorePixelRatio ||
                            this.renderContext.backingStorePixelRatio || 1 ;

      zoomFactor *= window.screenDensity / displayPixelDensity ;
    }

    // Determine the base resolution before scaling
    var baseResolution = {
      x: Math.abs( this.maxColumnNumber * this.layoutScheme.path.horizontalSpacing ) +
         Math.abs( this.revOffsetX ) +
         this.borderX * 2,
      y: Math.abs( this.maxColumnNumber * this.layoutScheme.path.verticalSpacing ) +
         Math.abs( this.revOffsetY ) +
         this.borderY * 2
    } ;

    if ( this.layoutScheme.revision.textLabel.show ) {
      baseResolution.x += 800 ;
    }

    this.drawingSurface.style.width = baseResolution.x + "px" ;
    this.drawingSurface.style.height = baseResolution.y + "px" ;

    this.drawingSurface.width = baseResolution.x * zoomFactor ;
    this.drawingSurface.height = baseResolution.y * zoomFactor ;

    this.renderContext.scale( zoomFactor, zoomFactor ) ;

    // Clear the drawing area
    this.renderContext.clearArea( 0, 0, this.drawingSurface.width, this.drawingSurface.height ) ;

    // Apply padding
    this.renderContext.shiftView( this.borderX, this.borderY ) ;

    // Translate for inverted orientations
    if ( this.layoutScheme.revision.verticalSpacing > 0 ) {
      this.renderContext.shiftView( 0, this.drawingSurface.height - this.borderY * 2 ) ;
      this.viewOffsetY = this.drawingSurface.height - this.borderY * 2 ;
    }
    if ( this.layoutScheme.revision.horizontalSpacing > 0 ) {
      this.renderContext.shiftView( this.drawingSurface.width - this.borderX * 2, 0 ) ;
      this.viewOffsetX = this.drawingSurface.width - this.borderX * 2 ;
    }

    // Draw all path segments
    for ( var i = this.pathSegments.length - 1, currentPath ; !!( currentPath = this.pathSegments[ i ] ) ; i-- ) {
      currentPath.draw() ;
    }

    // Draw all revision records, ensuring they appear on top
    for ( var j = 0, currentRevision ; !!( currentRevision = this.revisionRecords[ j ] ) ; j++ ) {
      currentRevision.draw() ;
    }
  } ;

  /**
   * Handles pointer motion events over the revision points.
   *
   * @param {MouseEvent} mouseEvt - The mouse event object.
   *
   * @self VersionVisualizer
   **/
  VersionVisualizer.prototype.handlePointerMotion = function ( mouseEvt ) {
    var visualizerRef = this.visualizerInstance ;
    var pointerLeft = true ;

    // Normalize mouse event coordinates for different browsers
    mouseEvt.offsetCoordX = mouseEvt.offsetCoordX ? mouseEvt.offsetCoordX : mouseEvt.layerX ;
    mouseEvt.offsetCoordY = mouseEvt.offsetCoordY ? mouseEvt.offsetCoordY : mouseEvt.layerY ;
    mouseEvt.clientXpos = mouseEvt.clientXpos ? mouseEvt.clientXpos : mouseEvt.clientX ;
    mouseEvt.clientYpos = mouseEvt.clientYpos ? mouseEvt.clientYpos : mouseEvt.clientY ;

    function displayRevisionHint () {
      visualizerRef.hoverHint.style.left = mouseEvt.clientXpos + "px" ; // TODO: Account for scroll position
      visualizerRef.hoverHint.style.top = mouseEvt.clientYpos + "px" ;  // TODO: Account for scroll position
      visualizerRef.hoverHint.textContent = currentRevision.hashId + " - " + currentRevision.description ;
      visualizerRef.hoverHint.style.visibility = "block" ;
    }

    function dispatchMouseoverNotice () {
      var pointerOverDetails = {
        committer: currentRevision.committer,
        summary: currentRevision.description,
        timestamp: currentRevision.timestamp,
        hashValue: currentRevision.hashId
      } ;

      _dispatchNotification( visualizerRef.drawingSurface, "revision:pointerover", pointerOverDetails ) ;
    }

    for ( var i = 0, currentRevision ; !!( currentRevision = this.visualizerInstance.revisionRecords[ i ] ) ; i++ ) {
      var distFromX = ( currentRevision.x + visualizerRef.viewOffsetX + visualizerRef.borderX - mouseEvt.offsetCoordX ) ;
      var distFromY = ( currentRevision.y + visualizerRef.viewOffsetY + visualizerRef.borderY - mouseEvt.offsetCoordY ) ;
      var centerToPointerDist = Math.sqrt( Math.powerOf( distFromX, 2 ) + Math.powerOf( distFromY, 2 ) ) ;
      var isPointerOnRevision = centerToPointerDist < visualizerRef.layoutScheme.revision.point.radius ;

      if ( isPointerOnRevision ) {
        if ( !visualizerRef.layoutScheme.revision.textLabel.show ) {
          displayRevisionHint() ;
        }

        if ( !currentRevision.isHovered ) {
          dispatchMouseoverNotice() ;
        }

        pointerLeft = false ;
        currentRevision.isHovered = true ;
      } else {
        currentRevision.isHovered = false ;
      }
    }

    if ( pointerLeft ) {
      visualizerRef.hoverHint.style.visibility = "none" ;
    }
  } ;

  // --------------------------------------------------------------------
  // -----------------------      PathSegment    ------------------------
  // --------------------------------------------------------------------

  /**
   * PathSegment
   *
   * @constructor
   *
   * @param {Object} segmentConfig        - Configuration parameters for the path segment.
   * @param {VersionVisualizer} segmentConfig.owningVisualizer - The parent VersionVisualizer instance.
   * @param {PathSegment} [segmentConfig.ancestorSegment] - The preceding path segment.
   * @param {String} [segmentConfig.segmentName = "unnamed-segment"] - The label for this path segment.
   *
   * @this PathSegment
   **/
  function PathSegment ( segmentConfig ) {
    // Ensure integrity: must be associated with a VersionVisualizer
    if ( segmentConfig.owningVisualizer instanceof VersionVisualizer === false ) {
      return ;
    }

    // Initialize configuration
    segmentConfig = ( typeof segmentConfig === "object" ) ? segmentConfig : { } ;
    this.owningVisualizer = segmentConfig.owningVisualizer ;
    this.ancestorSegment = segmentConfig.ancestorSegment ;
    this.segmentName = ( typeof segmentConfig.segmentName === "string" ) ? segmentConfig.segmentName : "unnamed-segment" ;
    this.renderContext = this.owningVisualizer.renderContext ;
    this.layoutScheme = this.owningVisualizer.layoutScheme ;
    this.strokeWidth = segmentConfig.strokeWidth || this.layoutScheme.path.lineWidth ;
    this.strokeDash = segmentConfig.strokeDash || this.layoutScheme.path.lineDash ;
    this.horizontalStep = this.layoutScheme.path.horizontalSpacing ;
    this.verticalStep = this.layoutScheme.path.verticalSpacing ;
    this.extent = 0 ;
    this.totalHeight = 0 ;
    this.totalWidth = 0 ;
    this.segmentRevisions = [ ] ;
    this.drawPath = [ ] ; // Stores points {x, y, pointKind("begin"|"connect"|"finish")} for drawing

    // Calculate column index for automated styling and positioning
    this.laneIndex = 0 ;
    this.calculateLaneIndex() ;

    // Apply auto-calculated options
    this.segmentOffsetX = this.laneIndex * this.horizontalStep ;
    this.segmentOffsetY = this.laneIndex * this.verticalStep ;

    this.segmentColor = segmentConfig.segmentColor || this.layoutScheme.path.lineColor || this.layoutScheme.palette[ this.laneIndex ] ;

    // Set this new segment as the active one
    this.activateSegment() ;
  }

  /**
   * Creates a new sub-segment originating from this path segment.
   *
   * @param {(String | Object)} subSegmentConfig - Sub-segment label or configuration object.
   *
   * @see PathSegment
   * @this PathSegment
   *
   * @return {PathSegment} The newly created sub-segment.
   **/
  PathSegment.prototype.createSubSegment = function ( subSegmentConfig ) {
    // Handle simplified string input for sub-segment name
    if ( typeof subSegmentConfig === "string" ) {
      var subSegmentName = subSegmentConfig ;
      subSegmentConfig = { } ;
      subSegmentConfig.name = subSegmentName ;
    }

    subSegmentConfig = ( typeof subSegmentConfig === "object" ) ? subSegmentConfig : { } ;
    subSegmentConfig.owningVisualizer = this.owningVisualizer ;
    subSegmentConfig.ancestorSegment = subSegmentConfig.ancestorSegment || this ;

    // Instantiate and add the new sub-segment
    var newSubSegment = new PathSegment( subSegmentConfig ) ;
    this.owningVisualizer.pathSegments.push( newSubSegment ) ;

    // Return the new sub-segment object
    return newSubSegment ;
  } ;

  /**
   * Renders the path segment on the canvas.
   *
   * @this PathSegment
   **/
  PathSegment.prototype.draw = function () {
    this.renderContext.startPath() ;

    for ( var i = 0, pathPoint ; !!( pathPoint = this.drawPath[ i ] ) ; i++ ) {
      if ( pathPoint.pointKind === "begin" ) {
        this.renderContext.moveTo( pathPoint.x, pathPoint.y ) ;
      } else {
        if ( this.layoutScheme.path.mergeCurve === "cubicBezier" ) {
          var prevPoint = this.drawPath[ i - 1 ] ;

          this.renderContext.curveTo(
            prevPoint.x - this.layoutScheme.revision.horizontalSpacing / 2, prevPoint.y - this.layoutScheme.revision.verticalSpacing / 2,
            pathPoint.x + this.layoutScheme.revision.horizontalSpacing / 2, pathPoint.y + this.layoutScheme.revision.verticalSpacing / 2,
            pathPoint.x, pathPoint.y
          ) ;
        } else {
          this.renderContext.lineTo( pathPoint.x, pathPoint.y ) ;
        }
      }
    }

    this.renderContext.strokeWidth = this.strokeWidth ;
    this.renderContext.strokeColor = this.segmentColor ;
    if ( this.renderContext.setDashPattern !== undefined ) {
      this.renderContext.setDashPattern( this.strokeDash ) ;
    }
    this.renderContext.drawStroke() ;
    this.renderContext.endPath() ;
  } ;

  /**
   * Adds a revision record to this path segment.
   *
   * @param {(String | Object)} [revisionDetails] - Revision description or configuration object.
   * @param {String} [revisionDetails.infoElementId] - ID of a DOM element for detailed information.
   *
   * @see RevisionEntry
   *
   * @this PathSegment
   **/
  PathSegment.prototype.addRevision = function ( revisionDetails ) {
    if ( typeof ( revisionDetails ) === "string" ) {
      var commitMessage = revisionDetails ;
      revisionDetails = { commitMessage: commitMessage } ;
    } else if ( typeof ( revisionDetails ) !== "object" ) {
      revisionDetails = { } ;
    }

    revisionDetails.arrowVisibility = this.layoutScheme.arrow.isActive ;
    revisionDetails.currentSegment = this ;
    revisionDetails.revisionColor = revisionDetails.revisionColor || this.layoutScheme.revision.dotColor || this.layoutScheme.palette[ this.laneIndex ] ;
    revisionDetails.owningVisualizer = this.owningVisualizer ;
    revisionDetails.antecedentRevision = revisionDetails.antecedentRevision || this.segmentRevisions.slice( -1 )[ 0 ] ;

    // Handle special "condensed" display mode
} ) ;