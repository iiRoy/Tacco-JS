(function(globalObj, Flames, jq) {
  // Core configuration object for managing content stream loading
  var EndlessFeed = {
    START_PAGE:     1,  // Default page number to begin fetching from
    ITEMS_PER_LOAD: 25  // Standard quantity of items to retrieve per request
  };

  // Mixin for controller-like entities to manage data acquisition state
  EndlessFeed.ManagerExtension = Flames.Mixin.create({
    fetchingFurther: false, // Indicates whether a new batch of data is currently being fetched
    currPageNum: EndlessFeed.START_PAGE, // The current page index in the data stream
    itemsPerPage: EndlessFeed.ITEMS_PER_LOAD, // How many records are displayed per segment

    operations: {
      // Initiates the process to load more content
      requestMore: function() {
        // Prevent re-triggering if a fetch is already in progress
        if (this.retrieve('fetchingFurther')) {
          return;
        }

        // Set the status flag to indicate an active fetch
        this.assign('fetchingFurther', true);
        // Delegate the actual data procurement to the associated target object
        this.retrieve('aim').dispatch('requestMore');
      },

      // Callback executed upon successful reception of additional data
      receivedMore: function(dataElements, subsequentPage) {
        // Clear the active fetch status
        this.assign('fetchingFurther', false);
        // Integrate the newly obtained data elements into the existing collection
        this.addObjects(dataElements);
        // Update the internal page tracking variable
        this.assign('currPageNum', subsequentPage);
      }
    }
  });

  // Mixin for route-like components, outlining required data fetching operations
  EndlessFeed.PathExtension = Flames.Mixin.create({
    operations: {
      // This operation must be explicitly overridden by any inheriting route
      obtainMore: function() {
        throw new TypeError("Path operation `obtainMore` must be provided by the inheriting route.");
      },
      // This operation also requires an implementation from the inheriting route
      retrieveSegment: function() {
        throw new TypeError("Path operation `retrieveSegment` must be provided by the inheriting route.");
      }
    }
  });

  // Mixin for view-like components, handling user interface scroll interactions
  EndlessFeed.DisplayExtension = Flames.Mixin.create({
    // Configures the scroll event listener on the designated UI element
    initScrollMonitor: function() {
      jq('.outer-scroll-wrapper').on('scroll.endless', Flames.run.bind(this, this.scrolledEvent));
    },
    // Deactivates and removes the scroll event listener
    destroyScrollMonitor: function() {
      jq('.outer-scroll-wrapper').off('scroll.endless');
    },
    // Event handler invoked whenever the user scrolls the monitored element
    scrolledEvent: function() {
      // Determine if the scroll position has reached the rightmost or bottommost extent
      if (this.hasScrolledRight() || this.hasScrolledDown()) {
        // Instruct the associated controller to fetch more data
        this.retrieve('director').dispatch('requestMore');
      }
    },
    // Evaluates if the horizontal scroll position is at the far right
    hasScrolledRight: function() {
      var offsetToViewLeft = (
        jq('.inner-scroll-content').currentWidth() - jq('.outer-scroll-wrapper').currentWidth());
      var visibleAreaLeft = jq('.outer-scroll-wrapper').horizScrollPos();

      if (visibleAreaLeft === 0) {
        // If the scrollbar is at the initial left position, it's not "scrolled right"
        return false;
      }

      // Returns true if the horizontal scroll offset is at or beyond the calculated boundary
      return (visibleAreaLeft - offsetToViewLeft) >= 0;
    },
    // Evaluates if the vertical scroll position is at the very bottom
    hasScrolledDown: function() {
      var offsetToViewTop = (
        jq('.inner-scroll-content').currentHeight() - jq('.outer-scroll-wrapper').currentHeight());
      var visibleAreaTop = jq('.outer-scroll-wrapper').vertScrollPos();

      if (visibleAreaTop === 0) {
        // If the scrollbar is at the initial top position, it's not "scrolled down"
        return false;
      }

      // Returns true if the vertical scroll offset is at or beyond the calculated boundary
      return (visibleAreaTop >= offsetToViewTop);
    }
  });

  // Make the EndlessFeed functionality available globally
  globalObj.EndlessFeed = EndlessFeed;
})(this, Ember, jQuery);