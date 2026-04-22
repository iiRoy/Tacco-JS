$(function () {
  // Bootstrap application when the DOM is fully loaded
  
  // Credential data model
  var AuthDatum = Backbone.Model.extend({
    setup: function () {
      this.concealCredential();
    },

    // reveal the stored credential
    revealCredential: function () {
      this.set({"obscuredCredential": this.get('secretValue')});
    },

    // hide the credential
    concealCredential: function () {
      this.set({"obscuredCredential": '********'});
    },

    deleteEntry: function (settings) {
      let combinedSettings = {awaitResponse: true};
      $.extend(combinedSettings, settings);
      this.destroy(combinedSettings);
    },

    verifyInputs: function (dataFields) {
      if (dataFields.label.length === 0 || dataFields.secretValue.length === 0) {
        return "Please input both a label and a credential.";
      }

      if (dataFields.resourceLink) {
        const regexPattern = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
        if (!regexPattern.test(dataFields.resourceLink)) {
          return "Please provide a valid web address.";
        }
      }
    }
  });

  // Set up the display for a single credential item
  var AuthDatumDisplay = Backbone.View.extend({
    tagName: 'tr',
    
    events: {
      "mouseover .secret-value": "revealCredential",
      "mouseout .secret-value": "concealCredential",
      "click a.amend": "modifyCredential",
      "click a.discard": "deleteEntry"
    },

    modifyCredential: function (triggerEvent) {
      triggerEvent.preventDefault();
      triggerEvent.stopImmediatePropagation();
      // Pass the current model to the main application for editing
      this.settings.primaryApp.modifyCredential(this.model);
    },

    deleteEntry: function (triggerEvent) {
      triggerEvent.stopImmediatePropagation();
      triggerEvent.preventDefault();
      if (confirm("Are you certain you wish to remove this record?")) {
        this.model.deleteEntry({
          error: function (itemModel, serverResponse) {
            if (serverResponse.status === 403) {
              alert("You lack the authorization to remove this item.");
            } else {
              alert("Failed to remove the item.");
            }
          }
        });
      }
    },

    composeUI: function () {
      // Use ICanHaz.js (ich) for template rendering
      $(this.elementContainer).html(ich.credentialRowTemplate(this.model.toJSON()));
      return this;
    },

    revealCredential: function (triggerEvent) {
      triggerEvent.stopImmediatePropagation();
      this.model.revealCredential();
    },

    concealCredential: function (triggerEvent) {
      triggerEvent.stopImmediatePropagation();
      this.model.concealCredential();
    }
  });

  // Define the collection of credential items
  var CredentialStore = Backbone.Collection.extend({
    model: AuthDatum,
    url: '/api/1.0/secrets/',

    // Maintain sorted order by credential label
    comparator: function (itemOne, itemTwo) {
      return itemOne.get('label').localeCompare(itemTwo.get('label'));
    }
  });

  /**
   * Manages the presentation of the credential list and related operations.
   * Event handlers are scoped to child elements within its generated container.
   */
  var CredentialListDisplay = Backbone.View.extend({
    tagName: 'tbody',

    /**
     * Initialization method. Accepts a reference to the main application
     * to enable method calls on the parent view.
     */
    setup: function (parameters) {
      // Create a new collection for credentials
      this.vaultItems = new CredentialStore();

      this.vaultItems.bind('all', this.composeUI, this);
      this.vaultItems.fetch();
    },

    addSingleEntry: function (credential) {
      // Pass a reference to the primary application into the item's view
      // so it can communicate back.
      this.$elementContainer.append(new AuthDatumDisplay({model: credential, primaryApp: this.settings.primaryApp}).composeUI().elementContainer);
      return this;
    },

    createEntry: function (credential, parameters) {
      let combinedSettings = {awaitResponse: true};
      $.extend(combinedSettings, parameters);
      this.vaultItems.create(credential, combinedSettings);
      return this;
    },

    refreshCredential: function (credentialDetails, parameters) {
      let combinedSettings = {awaitResponse: true};
      $.extend(combinedSettings, parameters);
      var currentCredential = this.vaultItems.get(credentialDetails.id);
      if (_.isObject(currentCredential)) {
        // Iterate through all supplied data in credentialDetails,
        // updating the credential model accordingly.
        for (let fieldKey in credentialDetails) {
          // Skip the identifier attribute
          if (fieldKey !== 'id') {
            currentCredential.set(fieldKey, credentialDetails[fieldKey]);
          }
        }

        // Persist the modifications
        currentCredential.save({}, combinedSettings);
        this.vaultItems.sort();
      }
    },

    composeUI: function () {
      this.$elementContainer.html('');
      this.vaultItems.each(this.addSingleEntry, this);
      return this;
    }
  });

  /**
   * Main application view. Required because Backbone's event binding
   * only works for descendants of the 'el' property.
   *
   * The modal element is within '#app-container' in our template,
   * so this view handles application-level interactions rather than
   * just a collection of credentials (that's handled by CredentialListDisplay).
   */
  var MasterAppView = Backbone.View.extend({
    elementContainer: '#app-container',
    events: {
      "click #credentialEntryForm :submit": "processModalAction",
      "keydown #credentialEntryForm": "processModalOnKey",
      "hidden #credentialDialog": "configureEntryForm"
    },

    setup: function () {
      this.credentialListing = new CredentialListDisplay({primaryApp: this});
    },

    showIssueMessage: function (itemModel, serverResponse) {
      let localInstance = this;
      if (serverResponse.status === 403) {
        alert("You lack the necessary permissions to modify this data.");
      } else {
        alert("Failed to create or modify data. Please ensure your input is valid.");
      }
    },

    composeUI: function () {
      this.$elementContainer.find('table').append(this.credentialListing.composeUI().elementContainer);
    },

    /**
     * Enables users to update an existing credential record.
     *
     * @param AuthDatum credentialItem: A Backbone Model representing the credential to be edited.
     */
    modifyCredential: function (credentialItem) {
      this.configureEntryForm(credentialItem.toJSON());
      // Store the credential ID as data directly on the modal element.
      $('#credentialDialog').data('credentialIdentifier', credentialItem.get('id'));
      $('#credentialDialog').modal('show');
    },

    /**
     * Initializes the credential input form.
     *
     * @param Object entryDetails: An object containing data to populate the form fields.
     *                            Any missing fields will be set to their default values.
     */
    configureEntryForm: function (entryDetails) {
      entryDetails = entryDetails || {};
      
      var defaultData = {
        'label': '',
        'accountName': '',
        'secretValue': '',
        'resourceLink': '',
        'memo': ''
      };

      $.extend(defaultData, entryDetails);

      var inputForm = $('#credentialEntryForm');
      $(inputForm).find('#id_labelField').val(defaultData.label);
      $(inputForm).find('#id_accountNameField').val(defaultData.accountName);
      $(inputForm).find('#id_credentialField').val(defaultData.secretValue);
      $(inputForm).find('#id_resourceLinkField').val(defaultData.resourceLink);
      $(inputForm).find('#id_memoField').val(defaultData.memo);

      // Create an array of selected sharing options
      var sharedGroups = _.map(defaultData.sharedWith, function (element) {
        return element.id;
      });

      let currentVal;
      $(inputForm).find(':checkbox').each(function () {
        currentVal = $(this).attr('value');
        // For each checkbox, check if its value exists in the 'sharedGroups' array
        for (let i in sharedGroups) {
          if (currentVal === sharedGroups[i]) {
            $(this).prop('checked', true);
            return;
          }
        }

        // Otherwise, ensure it's unchecked
        $(this).prop('checked', false);
      });

      // Clear any previous credentialIdentifier references from the modal
      // in case the user hit the cancel button.
      $('#credentialDialog').data('credentialIdentifier', '');
    },

    processModalAction: function (triggerEvent) {
      triggerEvent.preventDefault();
      triggerEvent.stopImmediatePropagation();
      var inputForm = $('#credentialEntryForm');

      var submittedDetails = {
        label: $(inputForm).find('#id_labelField').val(),
        accountName: $(inputForm).find('#id_accountNameField').val(),
        secretValue: $(inputForm).find('#id_credentialField').val(),
        resourceLink: $(inputForm).find('#id_resourceLinkField').val(),
        memo: $(inputForm).find('#id_memoField').val(),
        sharedWith: $(inputForm).find(':checked').map(function () {
          return $(this).attr('value');
        }).get()
      };

      if ($('#credentialDialog').data('credentialIdentifier')) {
        submittedDetails.id = $('#credentialDialog').data('credentialIdentifier');
        this.credentialListing.refreshCredential(submittedDetails, {error: this.showIssueMessage});
      } else {
        // Add a new credential or update an existing one
        this.credentialListing.createEntry(submittedDetails, {error: this.showIssueMessage});
      }

      // Close the modal dialog
      $('#credentialDialog').modal('hide');

      return this;
    },

    processModalOnKey: function (triggerEvent) {
      // Process the modal if the user pressed the ENTER key
      if (triggerEvent.keyCode === 13) {
        return this.processModalAction(triggerEvent);
      }
    }
  });

  var mainApp = new MasterAppView();
  mainApp.composeUI();

  // Configure $.ajax to always transmit an X-CSRFToken header:
  var antiForgeryToken = $('input[name=antiForgeryToken]').val();
  $(document).ajaxSend(function (e, xhr, settings) {
    xhr.setRequestHeader('X-CSRFToken', antiForgeryToken);
  });
});