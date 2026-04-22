/*
 * Application Core Module - Manages user interface interactions and data persistence.
 * This module is responsible for orchestrating the main view components and
 * interacting with various external libraries for data management and rendering.
 */
define([
  'jquery',
  'underscore',
  'backbone',
  'dropbox', // Dropbox API client
  'dropboxdatastore', // Backbone integration for Dropbox Datastore
  'marked', // Markdown parser
  'models/draft', // NoteModel
  'collections/drafts', // NoteCollection
  'views/draft', // EntryItemView
  'bootstrap' // UI framework
], function($, _, Backbone, DropboxClient, DatastoreWrapper, markdownRenderer, NoteModel, NoteCollection, EntryItemView) {

  // Main application view component
  const MainApplicationPortal = Backbone.View.extend({

    // Binds the view to the entire document body
    el: 'body',

    /**
     * Initializes the application, setting up authentication,
     * caching DOM elements, and binding event listeners.
     * @returns {void}
     */
    initiateAppProcess: function() {
      // Establish connection to the cloud service provider
      this.authProvider = Backbone.DropboxDatastore.client;
      const logoutText = '<i class="fa fa-sign-out"></i> Disconnect'; // Helper for button text

      // Check if the user is already authenticated
      if (this.authProvider.isAuthenticated()) {
        // Retrieve all existing records from the cloud storage
        NoteCollection.fetch();
        const instanceRef = this; // Capture 'this' for callback context

        // Configure the synchronization button for logout
        this.$("#cloudSyncButton")
          .html(logoutText)
          .attr("data-action", "sign-out") // Use data attribute instead of ID
          .off('click') // Ensure no duplicate handlers
          .on('click', function() {
            instanceRef.performLogout();
          });
      } else {
        // If not authenticated, ensure the sync button initiates authentication
        this.$("#cloudSyncButton")
          .html('<i class="fa fa-cloud"></i> Connect Dropbox')
          .attr("data-action", "authenticate")
          .off('click')
          .on('click', _.bind(this.initiateCloudSync, this)); // Bind context explicitly
      }

      // Initialize the identifier for the currently active note
      this.activeEntryIdentifier = null;

      // Cache frequently accessed DOM elements for performance
      this.$mainNavElement = $(".app-header-bar");
      this.$sidePanelContainer = $("#sidebar-panel");
      this.$entryListingArea = $("#noteEntryList");

      this.$noteTitleInput = $("#entry-title-field");
      this.$noteContentTextarea = $("#entry-content-field");
      this.$statusMessageDisplay = $("#app-notification-area");

      this.$renderOutputArea = $("#preview-pane");
      this.$renderedTitleSpan = $("#preview-title-display");
      this.$renderedContentDiv = $("#preview-body-content");

      // Set up listeners for changes in the note collection
      this.listenTo(NoteCollection, "add", this.addEntryToDisplay);
      this.listenTo(NoteCollection, "remove", this.updateCurrentEntryId);
      this.listenTo(NoteCollection, "reset", this.populateAllEntriesView); // Listen for reset too

      // Perform initial rendering and display updates
      this.populateAllEntriesView();
      this.updateLivePreview();

      // Set initial focus if no active entry
      if (!this.activeEntryIdentifier) {
        this.$noteTitleInput.focus();
      }
    },

    // Defines DOM events and their corresponding handler methods
    events: {
      // Global keyboard shortcuts
      "keydown": "handleGlobalKeyPress",

      // Sidebar interactions
      "click .toggle-panel-button": "toggleSidePanel",
      "click .item-entry": "openSelectedEntry",

      // Editor interactions
      "focus #editor-container": "handleEditorFocus",
      "blur #editor-container": "handleEditorBlur",
      "keyup #entry-title-field, #entry-content-field": "updateLivePreview", // Combined keyup
      "click #saveEntryButton": "persistCurrentEntry",
      "click #deleteEntryButton": "removeCurrentEntry",
      "click #createNewEntryButton": "startNewEntry",
      "click #cloudSyncButton[data-action='authenticate']": "initiateCloudSync",
      "click #cloudSyncButton[data-action='sign-out']": "performLogout"
    },

    /**
     * Handles user logout from Dropbox.
     * @returns {void}
     */
    performLogout: function() {
      if (this.authProvider.isAuthenticated()) {
        this.authProvider.signOut({
          mustInvalidate: true
        }); // Invalidate token on sign out
        window.location.reload(); // Reload the application
      } else {
        this.displayMessage("Not currently connected to Dropbox.", "warning");
      }
    },

    /**
     * Initiates Dropbox authentication flow if not already authenticated.
     * @returns {void}
     */
    initiateCloudSync: function() {
      if (!this.authProvider.isAuthenticated()) {
        this.authProvider.authenticate();
        this.displayMessage("Attempting to connect to Dropbox...", "info");
      } else {
        this.displayMessage("Already connected to Dropbox.", "info");
      }
    },

    /**
     * Restores navigation bar opacity when editor loses focus.
     * @returns {void}
     */
    handleEditorBlur: function() {
      this.$mainNavElement.css("opacity", "1.0");
    },

    /**
     * Hides the sidebar and reduces navigation bar opacity when editor gains focus.
     * @returns {void}
     */
    handleEditorFocus: function() {
      this.concealSidePanel();
      this.$mainNavElement.animate({
        "opacity": "0.3"
      }, 200); // Smoother animation
    },

    /**
     * Handles global keyboard shortcuts, primarily Ctrl-key combinations.
     * @param {Event} keyEvent - The keyboard event object.
     * @returns {void}
     */
    handleGlobalKeyPress: function(keyEvent) {
      // Check for Ctrl key (or Cmd on Mac)
      if (keyEvent.ctrlKey || keyEvent.metaKey) {
        switch (keyEvent.keyCode) {
          case 83: // Ctrl+S (Save)
            keyEvent.preventDefault(); // Prevent browser's save dialog
            this.persistCurrentEntry();
            break;
          case 76: // Ctrl+L (Toggle List)
            keyEvent.preventDefault();
            this.toggleSidePanel();
            break;
          case 68: // Ctrl+D (Delete)
            keyEvent.preventDefault();
            this.removeCurrentEntry();
            break;
          case 78: // Ctrl+N (New)
            keyEvent.preventDefault();
            this.startNewEntry();
            break;
          default:
            // Do nothing for other Ctrl key combinations
            break;
        }
      }
    },

    /**
     * Attaches Vim-like keyboard navigation to the sidebar list.
     * @returns {void}
     */
    activateKeyboardNavigation: function() {
      let currentSelectedIndex = -1;
      const listItems = this.$entryListingArea.children();

      // Early exit if no items are present
      if (listItems.length === 0) {
        return;
      }

      // Helper to update selection
      const updateSelection = (newIndex) => {
        if (currentSelectedIndex >= 0 && currentSelectedIndex < listItems.length) {
          $(listItems[currentSelectedIndex]).removeClass("is-active");
        }
        currentSelectedIndex = newIndex;
        if (currentSelectedIndex >= 0 && currentSelectedIndex < listItems.length) {
          $(listItems[currentSelectedIndex]).addClass("is-active").focus(); // Add focus for accessibility
        }
      };

      // Initial selection if list is not empty
      if (listItems.length > 0) {
        updateSelection(0);
      }

      // Use keydown to prevent default browser behavior
      this.$el.on("keydown.vim", (e) => { // Namespace event for easy detachment
        switch (e.keyCode) {
          case 74: // 'j' - move down
            e.preventDefault();
            if (currentSelectedIndex < listItems.length - 1) {
              updateSelection(currentSelectedIndex + 1);
            }
            break;
          case 75: // 'k' - move up
            e.preventDefault();
            if (currentSelectedIndex > 0) {
              updateSelection(currentSelectedIndex - 1);
            } else if (currentSelectedIndex === 0) { // Allow moving off the top to -1
              updateSelection(-1);
            }
            break;
          case 79: // 'o' - open selected item
            e.preventDefault();
            if (currentSelectedIndex >= 0 && currentSelectedIndex < listItems.length) {
              $(listItems[currentSelectedIndex]).trigger('click');
            }
            break;
          case 27: // Escape - deselect
            e.preventDefault();
            updateSelection(-1);
            this.deactivateKeyboardNavigation(); // Detach on escape
            break;
        }
      });
    },

    /**
     * Detaches Vim-like keyboard navigation from the sidebar list.
     * @returns {void}
     */
    deactivateKeyboardNavigation: function() {
      this.$entryListingArea.find(".is-active").removeClass("is-active");
      this.$el.off("keydown.vim"); // Use namespaced event to remove only these handlers
    },

    /**
     * Updates the currently active entry identifier.
     * If no ID is provided, clears the active identifier.
     * @param {string|null} [entryId=""] - The ID of the new active entry, or null to clear.
     * @returns {void}
     */
    updateCurrentEntryId: function(entryId = null) {
      if (entryId && entryId.id) { // If a model is passed, get its ID
        this.activeEntryIdentifier = entryId.id;
      } else if (typeof entryId === 'string') { // If just an ID string
        this.activeEntryIdentifier = entryId;
      } else { // If nothing or invalid
        this.activeEntryIdentifier = null;
      }
    },

    /**
     * Deletes the currently selected note after user confirmation.
     * @returns {void}
     */
    removeCurrentEntry: function() {
      if (!this.activeEntryIdentifier) {
        this.displayMessage("No note is currently selected for deletion.", "warning");
        return; // Guard clause
      }

      if (confirm("Are you absolutely sure you want to permanently delete this note?")) {
        const targetNote = NoteCollection.get(this.activeEntryIdentifier);
        if (targetNote) {
          targetNote.destroy(); // Triggers 'remove' event which calls updateCurrentEntryId
          this.startNewEntry(); // Open a blank editor after deletion
          this.displayMessage("Note successfully deleted.", "success");
        } else {
          this.displayMessage("Could not find the note to delete.", "error");
        }
      } else {
        this.displayMessage("Deletion cancelled.", "info");
      }
    },

    /**
     * Clears the editor and prepares for a new note.
     * @returns {void}
     */
    startNewEntry: function() {
      this.concealSidePanel();
      this.loadEntryIntoEditor(null); // Pass null to clear fields
      this.updateLivePreview();
      this.$noteTitleInput.focus();
      this.updateCurrentEntryId(null); // Clear the active ID
      this.displayMessage("Ready for a new note.", "info");
    },

    /**
     * Opens a selected note from the list into the editor.
     * @param {Event} event - The click event object.
     * @returns {void}
     */
    openSelectedEntry: function(event) {
      this.concealSidePanel();
      const clickedElement = $(event.currentTarget); // Use currentTarget for delegated events
      const entryId = clickedElement.data("cid"); // Get the data-cid attribute
      if (entryId) {
        this.activeEntryIdentifier = entryId;
        const selectedNote = NoteCollection.get(entryId);
        if (selectedNote) {
          this.loadEntryIntoEditor(selectedNote);
          this.updateLivePreview();
          this.displayMessage(`Opened note: "${selectedNote.get('entryTitle')}"`, "info");
        } else {
          this.displayMessage("Error: Selected note not found in collection.", "error");
        }
      } else {
        this.displayMessage("Error: Could not determine note ID.", "error");
      }
    },

    /**
     * Displays the sidebar panel and activates keyboard navigation.
     * @returns {void}
     */
    displaySidePanel: function() {
      const selfRef = this;
      selfRef.$sidePanelContainer.animate({
        "margin-left": 0,
        "display": "block"
      }, 50, function() {
        selfRef.$noteTitleInput.blur(); // Blur editor inputs
        selfRef.$noteContentTextarea.blur();
        selfRef.activateKeyboardNavigation(); // Activate vim-like keys
      });
    },

    /**
     * Hides the sidebar panel and deactivates keyboard navigation.
     * @returns {void}
     */
    concealSidePanel: function() {
      this.$sidePanelContainer.animate({
        "margin-left": "-250px"
      }, 100, () => { // Use arrow function for correct 'this' context
        this.deactivateKeyboardNavigation();
      });
    },

    /**
     * Prepends a single note view to the list of notes.
     * @param {NoteModel} noteItem - The note model to add.
     * @returns {void}
     */
    addEntryToDisplay: function(noteItem) {
      const itemView = new EntryItemView({
        model: noteItem
      });
      this.$entryListingArea.prepend(itemView.render().el);
    },

    /**
     * Renders all notes from the collection into the sidebar.
     * Clears existing list before populating.
     * @returns {void}
     */
    populateAllEntriesView: function() {
      this.$entryListingArea.empty(); // Clear existing entries
      NoteCollection.each(this.addEntryToDisplay, this);
    },

    /**
     * Toggles the visibility of the sidebar panel.
     * @returns {void}
     */
    toggleSidePanel: function() {
      // Check current margin-left property to determine visibility state
      if (this.$sidePanelContainer.css("margin-left") === "-250px") {
        this.displaySidePanel();
      } else {
        this.concealSidePanel();
      }
    },

    /**
     * Updates the live preview pane with content from the editor.
     * @returns {void}
     */
    updateLivePreview: function() {
      this.$renderedTitleSpan.html(this.$noteTitleInput.val() || "Untitled Note"); // Default title
      const rawContent = this.$noteContentTextarea.val();
      this.$renderedContentDiv.html(markdownRenderer(rawContent));
    },

    /**
     * Extracts current title and body content from the editor fields.
     * @returns {object} An object containing the note's title and content.
     */
    getCurrentEditorAttributes: function() {
      return {
        entryTitle: this.$noteTitleInput.val().trim(),
        entryContent: this.$noteContentTextarea.val()
      };
    },

    /**
     * Saves the current note from the editor, either creating a new one or updating an existing one.
     * @returns {void}
     */
    persistCurrentEntry: function() {
      let currentNote, feedbackMsg;
      const editorData = this.getCurrentEditorAttributes();

      // Guard against empty title, which is often mandatory
      if (!editorData.entryTitle) {
        this.displayMessage("Note title cannot be empty.", "error");
        this.$noteTitleInput.focus();
        return;
      }

      // Check if an existing note is being edited
      if (this.activeEntryIdentifier) {
        currentNote = NoteCollection.get(this.activeEntryIdentifier);
        if (currentNote) {
          currentNote.set(editorData);
        } else {
          // Fallback: If ID exists but model isn't in collection, create new
          currentNote = new NoteModel(editorData);
          this.activeEntryIdentifier = null; // Clear ID to ensure it's treated as new
        }
      } else {
        // Create a brand new note
        currentNote = new NoteModel(editorData);
      }

      // Validate the note model before saving
      if (currentNote.isValid()) {
        NoteCollection.create(currentNote, {
          wait: true, // Wait for server response before adding to collection
          success: (model) => {
            this.updateCurrentEntryId(model.id); // Update ID after successful creation/update
            feedbackMsg = "Note saved successfully.";
            this.displayMessage(feedbackMsg, "success");
            // If it was a new note, focus back on the editor
            if (!this.activeEntryIdentifier) {
              this.$noteTitleInput.focus();
            }
          },
          error: (model, response) => {
            feedbackMsg = `Failed to save note: ${response.message || 'Unknown error'}`;
            this.displayMessage(feedbackMsg, "error");
          }
        });
      } else {
        feedbackMsg = currentNote.validationError || "Validation failed.";
        this.displayMessage(feedbackMsg, "error");
      }
    },

    /**
     * Displays a temporary notification message to the user.
     * @param {string} messageText - The message content.
     * @param {string} [type="info"] - The type of message (e.g., "success", "error", "warning", "info").
     * @returns {void}
     */
    displayMessage: function(messageText, type = "info") {
      const messageClass = `alert-${type}`;
      this.$statusMessageDisplay
        .text(messageText)
        .removeClass("alert-success alert-error alert-warning alert-info") // Clear previous types
        .addClass(messageClass)
        .fadeIn(200)
        .delay(1500) // Display longer than original
        .fadeOut(600, () => {
          this.$statusMessageDisplay.removeClass(messageClass); // Remove class after fade out
        });
    },

    /**
     * Loads a given note model's data into the editor fields.
     * If no note is provided, clears the editor fields.
     * @param {NoteModel|null} noteInstance - The note model to load, or null to clear.
     * @returns {void}
     */
    loadEntryIntoEditor: function(noteInstance) {
      if (!noteInstance) {
        this.$noteTitleInput.val("");
        this.$noteContentTextarea.val("");
      } else {
        this.$noteTitleInput.val(noteInstance.get('entryTitle'));
        this.$noteContentTextarea.val(noteInstance.get('entryContent'));
      }
    }

  });

  return MainApplicationPortal; // Export the main application view

});