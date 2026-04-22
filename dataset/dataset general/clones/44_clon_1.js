/**
 * This JavaScript file contains the main application logic for a survey management system.
 * It leverages Ember.js for structuring the application and jQuery for DOM manipulation
 * and AJAX requests.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 *
 * This is a Type I clone of an existing codebase, meaning its functionality is
 * identical, but its whitespace and comments have been extensively modified
 * to create a visually distinct, yet logically equivalent, version.
 */
( function ($) {

  // Ensure the DOM is fully loaded before initializing the Ember application.
  $( document ).ready( function () {

    // Initialize the Ember application instance.
    App = Ember.Application.create();

    /*
     * Application-wide helper functions.
     * These functions provide utility features for the UI.
     */
    App.adjustDetailsViewHeight = function () {
      // Calculate the delta based on whether a textarea is visible.
      // This helps in dynamically adjusting UI element heights.
      var delta = $( 'div.description textarea:visible' ).length > 0 ? 420 : 350;

      // Set the height of the survey questions container.
      $( 'div.survey-questions' ).css( 'height', $( window ).height() - delta );
    }; // End of adjustDetailsViewHeight function.

    // --- Model Definitions ---
    // Define the 'Survey' model using Ember.Object.
    App.Survey = Ember.Object.extend( {
      Id: '', // Unique identifier for the survey.
      Name: '', // Name of the survey.
      Description: '', // Detailed description of the survey.
      Slug: '', // URL-friendly slug for the survey.
      Questions: [], // Array to hold survey questions.

      // Computed property to generate the public URL for the survey.
      createUrl: function () {
        var slug = this.get( 'Slug' ); // Retrieve the slug.
        if ( !slug ) {
          return null; // Return null if slug is not available.
        }

        // Construct the full URL.
        return baseUrl + "/" + slug;
      }.property( 'Slug' ), // This property depends on 'Slug'.

      // Computed property to generate the summary URL for the survey.
      createSummaryUrl: function () {
        var slug = this.get( 'Slug' ); // Get the survey slug.
        if ( !slug ) {
          return null; // No slug, no summary URL.
        }

        // Build the summary URL.
        return baseUrl + "/summary/" + slug;
      }.property( 'Slug' ), // This property depends on 'Slug'.

      // Computed property to get the value used for sorting surveys.
      sortValue: function () {
        return this.get( 'Name' ); // Surveys are sorted by their name.
      }.property( 'Name' ) // This property depends on 'Name'.
    } ); // End of App.Survey definition.

    // Define available question types.
    App.QuestionTypes = [ 'Text', 'Boolean', 'Scale' ];

    // --- Controller Definitions ---
    // Main controller for managing a collection of surveys.
    App.surveysController = Ember.ArrayController.create( {
      content: [], // The array holding all survey objects.

      // Adds a new survey to the collection in a sorted manner.
      add: function (survey) {
        var length = this.get( 'length' ), // Current number of surveys.
            idx; // Index where the new survey should be inserted.

        // Find the correct insertion point using binary search.
        idx = this.binarySearch( survey.get( 'sortValue' ), 0, length );
        this.insertAt( idx, survey ); // Insert the survey.
      },

      // Performs a binary search to find the insertion point for a new survey.
      binarySearch: function (value, low, high) {
        var mid, midValue;

        if ( low === high ) {
          return low;
        }

        mid = low + Math.floor( ( high - low ) / 2 ); // Calculate middle index.
        midValue = this.objectAt( mid ).get( 'sortValue' ); // Get sort value of middle object.

        if ( value > midValue ) {
          // Search in the upper half.
          return this.binarySearch( value, mid + 1, high );
        } else if ( value < midValue ) {
          // Search in the lower half.
          return this.binarySearch( value, low, mid );
        }

        return mid; // Value found at mid.
      }, // End of binarySearch.

      // Removes a survey from the collection.
      remove: function (survey) {
        this.removeObject( survey );
      }, // End of remove.

      // Creates and adds a new, empty survey to the list.
      newSurvey: function () {
        var newSurvey = {
          Id: '',
          Name: 'Your New Survey',
          Slug: '',
          Description: '',
          Questions: []
        };

        // Create an Ember Survey object and add it.
        this.add( App.Survey.create( newSurvey ) );
      }, // End of newSurvey.

      // Handles the deletion of a survey.
      deleteSurvey: function () {
        var survey = App.selectedSurveyController.content;

        // Confirm deletion with the user.
        if ( survey && confirm( '\' ' + survey.Name + '\'\n\r\n\rAre you sure you want to delete this survey?' ) ) {

          this.remove( survey ); // Remove from local collection.
          App.selectedSurveyController.set( 'content', null ); // Clear selection.

          // If the survey has an ID, it exists on the server, so delete via AJAX.
          if ( survey.Id ) {
            $.ajax( {
              url: '/api/surveys/' + survey.Id,
              type: 'DELETE',
              success: function (response) {
                /* Deletion successful on server. No further action needed here. */
              },
              error: function (jqXHR, textStatus, errorThrown) {
                alert( 'Unexpected Error: ' + jqXHR.statusText ); // Inform user of error.
              }
            } );
          }
        }
      }, // End of deleteSurvey.

      // Loads all surveys from the API.
      loadSurveys: function () {
        var self = this; // Capture 'this' for use in callbacks.

        $.ajax( {
          url: '/api/surveys',
          success: function (data) {
            var surveys = data; // Raw survey data from API.
            // Map raw data to Ember Survey objects.
            surveys = surveys.map( function (item) {
              return self.createSurveyFromJSON( item );
            } );
          },

          error: function (jqXHR, textStatus, errorThrown) {
            alert( 'Unexpected Error: ' + jqXHR.statusText ); // Display error message.
          }
        } );
      }, // End of loadSurveys.

      // Creates an Ember Survey object from a JSON representation.
      createSurveyFromJSON: function (json) {
        // Transform raw question data into a more usable format.
        json.Questions = json.Questions.map( function (question, index) {
          return {
            id: question.Id,
            description: question.Description,
            type: App.QuestionTypes[ question.Type ],
            index: question.Index
          };
        } );

        var survey = App.Survey.create( json ); // Create the Ember survey object.
        this.add( survey ); // Add it to the controller's content.

        return survey; // Return the created survey.
      }, // End of createSurveyFromJSON.

      // Saves a survey (either new or existing) to the server.
      saveSurvey: function (survey) {
        // If no survey is provided, use the currently selected one.
        if ( !survey ) {
          survey = App.selectedSurveyController.get( 'content' );
        }

        // Validate survey name.
        if ( !survey.Name || 0 === survey.Name.length ) {
          alert( 'Survey name cannot be empty. Changes will not be saved until you specify a survey name.' );
        } else {
          // Prepare data for AJAX request.
          var content = { Id: survey.Id, Name: survey.Name, Description: survey.Description, Questions: survey.Questions };

          $.ajax( {
            url: '/api/surveys/' + survey.Id,
            type: survey.Id ? 'PUT' : 'POST', // Use PUT for update, POST for create.
            data: content,
            success: function (response) {
              // If it was a new survey, set its ID.
              if ( !survey.Id ) {
                survey.set( 'Id', response.Id );
              }

              survey.set( 'Slug', response.Slug ); // Update the slug.

              // Update questions with server-generated IDs/data.
              var questions = response.Questions.map( function (question, index) {
                return {
                  id: question.Id,
                  description: question.Description,
                  type: App.QuestionTypes[ question.Type ],
                  index: question.Index
                };
              } );

              survey.set( 'Questions', questions ); // Update the questions array.
            },
            error: function (jqXHR, textStatus, errorThrown) {
              alert( 'Unexpected Error: ' + jqXHR.statusText ); // Show error.
            }
          } );
        }
      } // End of saveSurvey.
    } ); // End of App.surveysController.

    // Load initial surveys when the application starts.
    App.surveysController.loadSurveys();

    // Controller to manage the currently selected survey.
    App.selectedSurveyController = Ember.Object.create( {
      content: null // Initially no survey is selected.
    } ); // End of App.selectedSurveyController.

    // --- View Definitions ---

    // View for deleting a question.
    App.DeleteQuestionView = Ember.View.extend( {
      classNames: [ 'delete-question-view' ], // CSS class for styling.

      // Handles click events on the delete button.
      click: function () {
        if ( confirm( 'Are you sure you want to delete this question?' ) ) {
          var question = this.get( 'content' ); // The question to be deleted.
          var survey = this.getPath( 'contentView.content' ); // The parent survey.
          survey.get( 'Questions' ).removeObject( question ); // Remove question from survey.

          App.surveysController.saveSurvey( survey ); // Save changes to the survey.
        }
      }, // End of click handler.

      // Handles touchEnd events (for mobile compatibility).
      touchEnd: function () {
        this.click(); // Delegate to the click handler.
      }
    } ); // End of App.DeleteQuestionView.

    // Generic editable field view.
    App.EditField = Ember.View.extend( {
      tagName: 'span', // Rendered as a span element.
      templateName: this.templateName ? this.templateName : 'edit-field', // Template to use.
      isMultiline: false, // Flag for multiline input.
      required: true, // Whether the field is required.
      previousValue: "", // Stores the value before editing for potential rollback.

      // Validates the current value of the field.
      isValid: function () {
        return ( !this.required || ( this.value && this.value.length > 0 ) );
      },

      // Handles double-click events to activate editing mode.
      doubleClick: function () {
        this.previousValue = this.value; // Store current value.
        this.set( 'isEditing', true ); // Enter editing mode.
        App.adjustDetailsViewHeight(); // Adjust UI height as needed.
        return false; // Prevent default double-click behavior.
      }, // End of doubleClick.

      // Handles touchEnd events, providing double-tap functionality.
      touchEnd: function () {
        var touchTime = new Date(); // Current touch timestamp.

        // Check for double-tap within 250ms.
        if ( this._lastTouchTime && touchTime - this._lastTouchTime < 250 ) {
          this.doubleClick(); // Treat as double-click.
          this._lastTouchTime = null; // Reset.
        } else {
          this._lastTouchTime = touchTime; // Store first tap time.
        }

        return false; // Prevent zooming on mobile.
      }, // End of touchEnd.

      // Handles focus-out events, saving or reverting changes.
      focusOut: function () {
        if ( !this.isValid() ) {
          this.set( 'value', this.previousValue ); // Revert if invalid.
        } else {
          App.surveysController.saveSurvey(); // Save changes if valid.
        }

        this.set( 'isEditing', false ); // Exit editing mode.
      }, // End of focusOut.

      // Handles key-up events, especially for Enter and Escape keys.
      keyUp: function (evt) {
        if ( this.isValid() ) {
          this.$( 'input:first' ).removeClass( 'input-validation-error' ); // Remove error styling.
        }

        switch ( evt.keyCode ) {
          case 13: // Enter key.
            if ( !this.isValid() ) {
              this.$( 'input:first' ).addClass( 'input-validation-error' ).focus(); // Show error and re-focus.
            }
            else {
              this.set( 'isEditing', false ); // Exit editing.
              App.surveysController.saveSurvey(); // Save changes.
            }

            break; // Exit switch.
          case 27: // Escape key.
            this.set( 'value', this.previousValue ); // Revert value.
            this.set( 'isEditing', false ); // Exit editing.
            break; // Exit switch.
        }
      } // End of keyUp.
    } ); // End of App.EditField.

    // Custom Ember.Select component with focus on insertion.
    App.SelectField = Ember.Select.extend( {
      didInsertElement: function () {
        this.$( ).focus(); // Focus the select element when inserted.
      }
    } ); // End of App.SelectField.

    // Custom Ember.TextField component with focus on insertion.
    App.TextField = Ember.TextField.extend( {
      didInsertElement: function () {
        this.$( ).focus(); // Focus the text input when inserted.
      }
    } ); // End of App.TextField.

    // Custom Ember.TextArea component with focus and height adjustment on insertion.
    App.TextArea = Ember.TextArea.extend( {
      didInsertElement: function () {
        App.adjustDetailsViewHeight(); // Adjust UI height.
        this.$( ).focus(); // Focus the textarea when inserted.
      }
    } ); // End of App.TextArea.

    // --- Handlebars Helpers ---

    // Register a Handlebars helper for editable fields.
    Ember.Handlebars.registerHelper( 'editable', function (path, options) {
      options.hash.valueBinding = path; // Bind the value.
      // Render the App.EditField view.
      return Ember.Handlebars.helpers.view.call( this, App.EditField, options );
    } ); // End of 'editable' helper.

    // Register a Handlebars helper for buttons.
    Ember.Handlebars.registerHelper( 'button', function (options) {
      var hash = options.hash;

      if ( !hash.target ) {
        hash.target = "App.surveysController"; // Default target for buttons.
      }

      // Render the Ember.Button view.
      return Ember.Handlebars.helpers.view.call( this, Ember.Button, options );
    } ); // End of 'button' helper.

    // View for displaying an individual survey in a list.
    App.SurveyListView = Ember.View.extend( {
      classNameBindings: [ 'isSelected' ], // Dynamically apply 'isSelected' class.

      // Handles click events on a survey list item.
      click: function (item) {
        var content = this.get( 'content' ); // The survey object for this view.
        $( '.more' ).hide(); // Hide all 'more' menus.
        $( 'li.more', item.currentTarget ).show(); // Show 'more' menu for current item.
        App.selectedSurveyController.set( 'content', content ); // Set this survey as selected.
      }, // End of click handler.

      // Handles touchEnd events (for mobile compatibility).
      touchEnd: function () {
        this.click(); // Delegate to the click handler.
      },

      // Computed property to determine if this survey is currently selected.
      isSelected: function () {
        var selectedItem = App.selectedSurveyController.get( 'content' ), // Get selected survey.
            content = this.get( 'content' ); // Get this view's survey.

        if ( content === selectedItem ) { return true; } // Return true if they match.
      }.property( 'App.selectedSurveyController.content' ) // Depends on the selected survey.
    } ); // End of App.SurveyListView.

    // View for displaying details of a selected survey.
    App.SurveyDetailsView = Ember.View.extend( {
      contentBinding: 'App.selectedSurveyController.content', // Binds to the selected survey.
      classNames: [ 'surveyInfo' ], // CSS class for styling.

      // Adds a new question to the current survey.
      addQuestion: function () {
        var questions = this.getPath( 'content.Questions' ); // Get questions array.
        // Add a new default question.
        questions.pushObject( { id: '', description: 'Your New Question', type: App.QuestionTypes[ 0 ], index: questions.length + 1 } );
      }, // End of addQuestion.

      // Called when the view's element is inserted into the DOM.
      didInsertElement: function () {
        App.adjustDetailsViewHeight(); // Adjust UI height.
      }, // End of didInsertElement.

      // Observer that fixes question indexes whenever the 'content.Questions' property changes.
      fixQuestionsIndexes: function (sender, property, questions) {
        if ( questions ) {
          // Sort questions by their current index.
          questions.sort( function (a, b) {
            return a.index - b.index;
          } );

          // Reassign sequential indexes.
          $.each( questions, function (index) {
            this.index = index + 1;
          } );
        }
      }.observes( 'content.Questions' ) // This observer watches 'content.Questions'.
    } ); // End of App.SurveyDetailsView.

    // Custom Ember.View to act as a link.
    Ember.Link = Ember.View.extend( {
      classNames: [ 'ember-link' ], // CSS class.
      tagName: 'a', // Render as an anchor tag.
      href: '#', // Default href.
      target: 'parentView', // Default target.
      value: '', // Value for the link.
      attributeBindings: [ 'href', 'target', 'value' ] // Bind these attributes.
    } ); // End of Ember.Link.

    // Event listener for window resize to adjust UI height.
    $( window ).resize( function (e) {
      App.adjustDetailsViewHeight(); // Re-adjust height on resize.
    } ); // End of window resize handler.

  } ); // End of document.ready.

} )( jQuery ) // Pass jQuery into the immediately invoked function.