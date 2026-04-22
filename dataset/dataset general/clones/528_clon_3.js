(function(runtimeWindow, EmberGlobal, jQueryLib){
  // Core module responsible for managing dynamic content loading and pagination.
  // Provides a set of mixins to integrate infinite scrolling functionality into Ember applications.
  var DynamicPager = {
    INITIAL_INDEX: 1,  // The starting page or batch index for data fetching.
    BATCH_SIZE:    25, // The default number of items to fetch in each batch.

    // Centralized configuration object for DOM selectors.
    // These selectors define which elements represent the scrollable viewport and its content.
    config: {
      outerContainerSelector: '.dynamic-pager-viewport', // The scrollable element (e.g., a div with overflow-y: scroll)
      innerContentSelector: '.dynamic-pager-content'    // The content element inside the viewport
    }
  };

  // Mixin for Ember Controllers to manage data fetching state and incoming data.
  DynamicPager.DataFetcherMixin = EmberGlobal.Mixin.create({
    fetchingInProgress: false, // Boolean flag to prevent concurrent data fetch requests.
    currentBatchIndex: DynamicPager.INITIAL_INDEX, // Tracks the index of the next batch to be fetched.
    itemsPerBatch: DynamicPager.BATCH_SIZE, // Configurable number of items per fetch operation.
    totalFetchedItems: 0, // Accumulator for the total number of items loaded so far.
    hasMoreData: true, // Indicates if there's potentially more data available on the server.

    // Actions defined for this mixin, callable from templates or other components.
    actions: {
      // Initiates the process of requesting the next segment of data.
      requestNextBatch: function(){
        // Prevent fetching if a request is already active or if all data has been loaded.
        if (this.get('fetchingInProgress') || !this.get('hasMoreData')) {
          return;
        }

        this.set('fetchingInProgress', true); // Set flag to indicate a fetch is in progress.
        // Delegate the actual data retrieval to the application's route or a service,
        // passing the current batch index and the desired batch size.
        this.get('target').send('initiateDataRetrieval', this.get('currentBatchIndex'), this.get('itemsPerBatch'));
      },

      // Callback action invoked after a batch of data has been successfully received.
      processFetchedBatch: function(retrievedItems, nextBatchIndex){
        this.set('fetchingInProgress', false); // Reset the fetching flag.

        // Validate the incoming data: if no items or an empty array, assume no more data.
        if (!retrievedItems || retrievedItems.length === 0) {
            this.set('hasMoreData', false);
            return;
        }

        // Add the newly retrieved items to the controller's content array.
        // This assumes the controller extends Ember.ArrayController or has a similar `pushObjects` method.
        this.pushObjects(retrievedItems);
        this.incrementProperty('totalFetchedItems', retrievedItems.length); // Update the total count.

        // Update the batch index for the subsequent data fetch.
        this.set('currentBatchIndex', nextBatchIndex);

        // If the number of items received is less than the requested batch size,
        // it suggests that we've reached the end of available data.
        if (retrievedItems.length < this.get('itemsPerBatch')) {
            this.set('hasMoreData', false);
        }
      }
    }
  });

  // Mixin for Ember Routes to define how data retrieval actions are handled.
  // These actions are typically overridden in specific application routes.
  DynamicPager.NavigationHandlerMixin = EmberGlobal.Mixin.create({
    actions: {
      // Placeholder action for initiating a data retrieval operation.
      // Routes should override this to implement their specific data fetching logic (e.g., AJAX call).
      initiateDataRetrieval: function(batchIndex, batchSize) {
        // Issue a warning if this action is not overridden, indicating a potential implementation gap.
        EmberGlobal.warn('DynamicPager: Route action `initiateDataRetrieval` must be overridden. Returning an empty promise.', false, { id: 'dynamic-pager.missing-initiate-data-retrieval' });
        // Return a resolved promise with an empty array to prevent errors, but this implies missing functionality.
        return EmberGlobal.RSVP.resolve([]);
      },
      // Placeholder action for retrieving a specific batch of data, identified by an arbitrary identifier.
      // This might be used for direct access to a particular page or segment.
      retrieveSpecificBatch: function(batchIdentifier) {
        // Warn if this action is not overridden.
        EmberGlobal.warn('DynamicPager: Route action `retrieveSpecificBatch` must be overridden. Returning an empty promise.', false, { id: 'dynamic-pager.missing-retrieve-specific-batch' });
        return EmberGlobal.RSVP.resolve([]);
      }
    }
  });

  // Mixin for Ember Components or Views to monitor scroll events and trigger data fetching.
  DynamicPager.DisplayMonitorMixin = EmberGlobal.Mixin.create({
    // Lifecycle hook: called when the component is inserted into the DOM.
    // Automatically sets up the scroll event listener.
    didInsertElement: function() {
      this._super(...arguments); // Call the parent class's didInsertElement if it exists.
      this.activateScrollMonitoring();
    },

    // Lifecycle hook: called when the component is about to be removed from the DOM.
    // Cleans up the scroll event listener to prevent memory leaks.
    willDestroyElement: function() {
      this.deactivateScrollMonitoring();
      this._super(...arguments); // Call the parent class's willDestroyElement if it exists.
    },

    // Attaches the scroll event listener to the designated outer container.
    activateScrollMonitoring: function(){
      const outerContainer = jQueryLib(DynamicPager.config.outerContainerSelector);
      // If the container element is not found, log a warning and disable monitoring.
      if (outerContainer.length === 0) {
        EmberGlobal.warn(`DynamicPager: Outer container selector "${DynamicPager.config.outerContainerSelector}" not found. Scroll monitoring disabled.`, false, { id: 'dynamic-pager.container-not-found' });
        return;
      }
      // Bind the `handleScrollEvent` method to the scroll event of the container,
      // ensuring the `this` context is correctly maintained.
      outerContainer.on('scroll.dynamicPager', EmberGlobal.run.bind(this, this.handleScrollEvent));
    },

    // Removes the scroll event listener from the outer container.
    deactivateScrollMonitoring: function(){
      jQueryLib(DynamicPager.config.outerContainerSelector).off('scroll.dynamicPager');
    },

    // Event handler for scroll events. Checks if the user has scrolled near the end.
    handleScrollEvent: function(){
      // Defensive check: If the component is being destroyed, clean up and exit.
      if (this.get('isDestroyed') || this.get('isDestroying')) {
        this.deactivateScrollMonitoring();
        return;
      }

      // If the user has scrolled to either the horizontal or vertical end, request more data.
      if (this.hasReachedHorizontalEnd() || this.hasReachedVerticalEnd()) {
        this.get('controller').send('requestNextBatch');
      }
    },

    // Determines if the scroll position is at or near the horizontal (rightmost) end.
    hasReachedHorizontalEnd: function(){
      const outerContainer = jQueryLib(DynamicPager.config.outerContainerSelector);
      const innerContent = jQueryLib(DynamicPager.config.innerContentSelector);

      // If either container is missing, we cannot determine scroll position.
      if (outerContainer.length === 0 || innerContent.length === 0) {
          return false;
      }

      const contentWidth = innerContent.width();
      const viewportWidth = outerContainer.width();
      const currentHorizontalOffset = outerContainer.scrollLeft();

      // If content is not wider than the viewport, there's no horizontal scroll.
      if (contentWidth <= viewportWidth) {
          return false;
      }

      // Calculate the maximum scrollable distance.
      const remainingHorizontalSpace = contentWidth - viewportWidth;

      // Do not trigger if at the very beginning of the scroll area.
      if (currentHorizontalOffset === 0) {
        return false;
      }

      // Return true if the current scroll offset is at or beyond the end threshold.
      // A small buffer might be added here for a "near-end" trigger.
      return currentHorizontalOffset >= remainingHorizontalSpace;
    },

    // Determines if the scroll position is at or near the vertical (bottommost) end.
    hasReachedVerticalEnd: function(){
      const outerContainer = jQueryLib(DynamicPager.config.outerContainerSelector);
      const innerContent = jQueryLib(DynamicPager.config.innerContentSelector);

      // If either container is missing, we cannot determine scroll position.
      if (outerContainer.length === 0 || innerContent.length === 0) {
          return false;
      }

      const contentHeight = innerContent.height();
      const viewportHeight = outerContainer.height();
      const currentVerticalOffset = outerContainer.scrollTop();

      // If content is not taller than the viewport, there's no vertical scroll.
      if (contentHeight <= viewportHeight) {
          return false;
      }

      // Calculate the maximum scrollable distance.
      const remainingVerticalSpace = contentHeight - viewportHeight;

      // Do not trigger if at the very beginning of the scroll area.
      if (currentVerticalOffset === 0) {
        return false;
      }

      // Return true if the current scroll offset is at or beyond the end threshold.
      return currentVerticalOffset >= remainingVerticalSpace;
    }
  });

  // Expose the DynamicPager module globally via the window object.
  runtimeWindow.DynamicPager = DynamicPager;
})(this, Ember, jQuery);