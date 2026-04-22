!function(jQ) {

  // Extend jQuery prototype to include our new branch navigation utility
  jQ.fn.branchNav = function(config) {

    // Set up configuration defaults for the navigation
    /* The available settings encompass:
     *  - unfurlGlyph: Default character for an expanded node (e.g., '▼').
     *  - foldGlyph: Default character for a collapsed node (e.g., '►').
     *  - initialUnfurledRoutes: If no persistent state is found, this string dictates initial expansion (default '').
     *      Use 'all' to show all children.
     *      Use '' to collapse the entire structure.
     *      To open the first child and the second child of the first child, use '0/1'.
     *  - singleBranchMode: If true, only one branch can be open at a time (default false).
     *  - displayMotion: The animation speed for transitions (default 'slow').
     */

    if(!config) config = {};
    var baseSettings = {
      unfurlGlyph           : '&#9660;',
      foldGlyph             : '&#9658;',
      initialUnfurledRoutes : '',
      singleBranchMode      : false,
      displayMotion         : 'slow'
    };
    var opts = {};
    jQ.extend(opts, baseSettings, config);

    // Capture the current expansion state of the tree structure
    jQ.fn.storeBranches = function() {
      var routes = [],
          currentRoute = [],
          unfurledSections = jQ(this).find('li span.unfurled'),
          prevLevel = null;
      for(var k = 0; k < unfurledSections.length; k++) {
        var currentDepth = jQ(unfurledSections[k]).parents('ul').length - 1;
        if((prevLevel == null && currentDepth > 0) || (currentDepth > prevLevel && currentDepth - prevLevel > 1))
          continue;
        var elementPosition = jQ(unfurledSections[k]).parent().prevAll().length;
        if(prevLevel == null) {
          currentRoute = [elementPosition];
        } else if(currentDepth < prevLevel) {
          routes.push(currentRoute.join('/'));
          var depthDifference = prevLevel - currentDepth;
          currentRoute.splice(currentRoute.length - depthDifference - 1, depthDifference + 1);
          currentRoute.push(elementPosition);
        } else if(currentDepth == prevLevel) {
          routes.push(currentRoute.join('/'));
          currentRoute.splice(currentRoute.length - 1, 1);
          currentRoute.push(elementPosition);
        } else if(currentDepth > prevLevel) {
          currentRoute.push(elementPosition);
        }
        prevLevel = currentDepth;
      }
      routes.push(currentRoute.join('/'));
      // Persist the state to a browser cookie
      var storageID = this.data('storageIdentifier');
      if(!storageID) storageID = 'branch-data';
      try { jQ.cookie(storageID, routes.join(',')); }
      catch(err) {}
    };

    // Reconstruct the tree's expansion based on stored "path" data
    jQ.fn.retrieveBranches = function() {
      var storedRoutes = null;
      var storageID = this.data('storageIdentifier');
      if(!storageID) storageID = 'branch-data';
      try { storedRoutes = jQ.cookie(storageID); }
      catch(err) {}
      if(!storedRoutes) storedRoutes = opts.initialUnfurledRoutes;
      if(storedRoutes == 'all') {
        jQ(this).find('span.branch-indicator').unfurlNode();
      } else {
        var routeList = storedRoutes.split(',');
        for(var m = 0; m < routeList.length; m++) {
          var singleRoute = routeList[m].split('/'),
              currentElement = jQ(this);
          for(var n = 0; n < singleRoute.length; n++) {
            currentElement = jQ(currentElement.children('li')[singleRoute[n]]);
            currentElement.children('span.branch-indicator').unfurlNode();
            currentElement = currentElement.children('ul');
          }
        }
      }
    };

    // Expand the entire branch structure (animation fix by @stecb adapted)
    jQ.fn.unfurl = function(motionEffect) {
      motionEffect = (motionEffect == 'none') ? undefined : (!motionEffect) ? opts.displayMotion : motionEffect;
      // Locate all first-child '.branch-indicator.folded' elements (open ones are already visible)
      var targetElements = jQ(this).find('.branch-indicator.folded:first-child');
      // Children of these '.branch-indicator.folded' elements must be opened without animation (crucial for height calculation)
      targetElements.siblings('ul').find('.branch-indicator.folded').unfurlNode(undefined);
      // Now, the first-child elements can be opened with the specified animation (height is now known)
      targetElements.unfurlNode(motionEffect);
    };

    // Collapse the entire branch structure
    jQ.fn.fold = function(motionEffect) {
      motionEffect = (motionEffect == 'none') ? undefined : (!motionEffect) ? opts.displayMotion : motionEffect;
      jQ(this).find('.branch-indicator').foldNode(motionEffect);
    };

    // Open a specific node
    jQ.fn.unfurlNode = function(motionEffect) {
      if(jQ(this).hasClass('branch-indicator')) {
        jQ(this).parent().children('ul').show(motionEffect);
        jQ(this).removeClass('folded').addClass('unfurled').html(opts.unfurlGlyph);
      }
    };

    // Close a specific node
    jQ.fn.foldNode = function(motionEffect) {
      if(jQ(this).hasClass('branch-indicator')) {
        jQ(this).parent().children('ul').hide(motionEffect);
        jQ(this).removeClass('unfurled').addClass('folded').html(opts.foldGlyph);
      }
    };

    // Handler for clicks on the branch indicator
    jQ.fn.handleIndicatorClick = function() {
      var clickedIndicator = jQ(this);
      if(clickedIndicator.hasClass('branch-indicator')) {
        clickedIndicator[clickedIndicator.hasClass('unfurled') ? 'foldNode' : 'unfurlNode'](opts.displayMotion);
        if(opts.singleBranchMode) clickedIndicator.closest('li').siblings().children('span.branch-indicator').foldNode(opts.displayMotion);
      }
    };

    for(var idx = 0; idx < this.length; idx++) {
      if(this[idx].tagName === 'UL') { // Check if the element is an unordered list
        // Construct the hierarchical view
        jQ(this[idx]).find('li').has('ul').prepend('<span class="branch-indicator folded" style="cursor:pointer;">' + opts.foldGlyph + '</span>');
        jQ(this[idx]).find('ul').hide();
        // Restore previous expansion state from storage
        jQ(this[idx]).retrieveBranches();
        // Attach click listener for the arrow-like indicators
        jQ(this[idx]).find('li > span.branch-indicator').on('click', {rootElement : this[idx]}, function(ev) {
          jQ(this).handleIndicatorClick();
          jQ(ev.data.rootElement).storeBranches();
        });
        // Attach click listener for custom 'branch-action' buttons
        jQ(this[idx]).find('li .branch-action').on('click', {rootElement : this[idx]}, function(ev) {
          var targetArrow = jQ(this).closest('li').children('span.branch-indicator');
          targetArrow.handleIndicatorClick();
          jQ(ev.data.rootElement).storeBranches();
        });
      }
    }
  };

}(jQuery);