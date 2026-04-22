window.IndividualCardComponent = Backbone.View.extend(
  // This component is responsible for displaying a single individual's details.
  // It extends Backbone.View to provide structure and event handling.
  {
    /**
     * @property {string} cardMarkup - The Underscore.js template string used to render
     *                                 the individual's information within the view.
     *                                 It includes a button for removal and displays
     *                                 the individual's name and role.
     */
    cardMarkup: _.template(
      '<div class="card-panel">' +
      '  <!-- Action button for removing this individual entry -->' +
      '  <button class="btn btn-sm btn-danger pull-right" id="remove-entity-btn" title="Click to remove this record">Dismiss</button>' +
      '  <div class="entity-details">' +
      '    <strong class="entity-name-display"><%= entityName %></strong>' +
      '    <span class="text-muted"> / <%= occupationalRole %></span>' +
      '  </div>' +
      '  <!-- Optional: Add more details here if needed -->' +
      '</div>'
    ),

    /**
     * @property {string} containerElement - Defines the HTML tag name for the view's root element.
     *                                       This will be created by Backbone and assigned to `this.el`.
     */
    containerElement: 'li',

    /**
     * @property {Object} userInteractions - A hash of DOM events and corresponding callback methods.
     *                                        This maps user actions to view logic.
     */
    userInteractions: {
      // Binds a click event on the element with ID 'remove-entity-btn' to the 'terminateEntry' method.
      'click #remove-entity-btn': 'terminateEntry'
    },

    /**
     * @method initialize
     * @description Constructor method for the view. Called when a new instance is created.
     *              Useful for initial setup, binding events, or logging.
     * @param {Object} options - Initialization options passed to the view.
     */
    initialize: function(options) {
      // Log the creation of this component for debugging purposes.
      console.log(`IndividualCardComponent created for model ID: ${this.model ? this.model.id : 'N/A'}`);
      // Ensure the model is properly bound if it changes (though for this simple case, it's static)
      // this.listenTo(this.model, 'change', this.populateAndDisplay);
    },

    /**
     * @method populateAndDisplay
     * @description Renders the component's template with the model's data
     *              and updates the view's root HTML element.
     * @returns {IndividualCardComponent} Returns the view instance for chaining.
     */
    populateAndDisplay: function() {
      // Guard clause: Check if a model is available to prevent rendering errors.
      if (!this.model) {
        console.error("No data model provided to IndividualCardComponent. Cannot render.");
        this.$el.empty().append('<div class="alert alert-warning">Data for this entry is missing.</div>');
        return this;
      }

      // Convert the Backbone model into a plain JavaScript object for template consumption.
      const processedModelData = this.model.toJSON();

      // Generate the HTML content using the template and the prepared data.
      const renderedContent = this.cardMarkup(processedModelData);

      // Update the view's root element with the generated HTML.
      // this.$el is a cached jQuery object for this.el.
      this.$el.html(renderedContent);

      // For demonstration, add a dynamic class based on some model attribute
      if (processedModelData.isActive === false) {
        this.$el.addClass('inactive-entry');
      }

      console.debug(`Component successfully rendered for: ${processedModelData.entityName}`);

      // Return the view instance for method chaining.
      return this;
    },

    /**
     * @method terminateEntry
     * @description Handles the removal of the individual card component from the DOM
     *              and destroys its associated Backbone model.
     * @param {jQuery.Event} domEvt - The DOM event object triggered by the user interaction.
     */
    terminateEntry: function(domEvt) {
      // Prevent the default action of the event (e.g., navigating if it's an anchor tag).
      domEvt.preventDefault();

      // Introduce a user confirmation step to prevent accidental deletions.
      const userConfirmed = window.confirm("Are you certain you wish to remove this individual's record?");

      if (userConfirmed) {
        console.info(`User confirmed removal for model ID: ${this.model.id}`);

        // Animate the removal of the DOM element for a smoother user experience.
        this.$el.fadeOut(300, () => {
          // Once the fade-out animation is complete, remove the element from the DOM.
          this.$el.remove();

          // Destroy the associated Backbone model. This will trigger a 'destroy' event
          // on the model and potentially sync with a server if configured.
          this.model.destroy({
            wait: true, // Wait for server response before removing from collection
            success: () => console.log(`Model ID ${this.model.id} successfully destroyed.`),
            error: (model, response) => console.error(`Failed to destroy model ID ${model.id}: ${response.statusText}`)
          });

          // Optional: Trigger a custom event on the parent view or global event bus
          // to notify other parts of the application about the removal.
          // Backbone.trigger('individual:removed', this.model.id);
        });

      } else {
        // Log if the user cancels the deletion process.
        console.log(`Removal of model ID ${this.model.id} cancelled by user.`);
      }
    }
  }
);