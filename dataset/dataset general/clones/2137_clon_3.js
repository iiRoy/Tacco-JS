( function( lib ) {

	/**
	 * jQuery plugin for resilient form data handling.
	 * Enables automatic saving and restoration of form input values to browser storage.
	 *
	 * @param {object} initSettings - Initial configuration for the data manager.
	 * @returns {object} The form data persistence manager instance.
	 */
	lib.fn.formResilience = function( initSettings ) {
		// Generate a distinct identifier for this group of elements.
		// Combines IDs and names of the selected elements to create a unique key.
		const elementKey = Array.prototype.map.call( this, function( domElement ) {
			const $el = lib( domElement );
			return $el.prop( "id" ) + $el.prop( "name" );
		}).join( '|' ); // Using a different separator.

		const dataManager = FormPersistenceManager.getManager( elementKey );
		dataManager.enablePersistence( this, initSettings );
		return dataManager;
	};

	/**
	 * Utility object for interacting with browser storage mechanisms (localStorage, jStorage).
	 * Abstracts the storage implementation details.
	 */
	const browserStorageHandler = {
		/**
		 * Verifies if a suitable browser storage mechanism is accessible.
		 * @returns {boolean} True if storage is available, false otherwise.
		 */
		checkAvailability: function() {
			if ( typeof lib.jStorage === "object" ) {
				return true;
			}
			try {
				// Attempt to use localStorage; will throw an error if not available or security restricted.
				const testKey = '__storage_test__';
				localStorage.setItem( testKey, testKey );
				localStorage.removeItem( testKey );
				return true;
			} catch ( e ) {
				// Catch security errors or full storage.
				console.warn( "Browser storage not available:", e );
				return false;
			}
		},

		/**
		 * Stores a piece of data in the active browser storage.
		 * @param {string} dataKey - The unique key for the data.
		 * @param {*} dataValue - The value to store. Converted to string.
		 */
		storeData: function( dataKey, dataValue ) {
			if ( !dataKey || dataValue === undefined ) {
				console.warn( "Attempted to store invalid data: key or value missing." );
				return;
			}
			const stringifiedValue = String( dataValue ); // Ensure value is a string.

			if ( typeof lib.jStorage === "object" ) {
				lib.jStorage.set( dataKey, stringifiedValue );
			} else {
				try {
					localStorage.setItem( dataKey, stringifiedValue );
				} catch ( e ) {
					// Handle QUOTA_EXCEEDED_ERR or other storage-related issues.
					console.error( "Failed to save data to localStorage for key '" + dataKey + "':", e );
				}
			}
		},

		/**
		 * Retrieves data from the active browser storage using its key.
		 * @param {string} dataKey - The key of the data to retrieve.
		 * @returns {string|null} The retrieved data as a string, or null if not found.
		 */
		fetchData: function( dataKey ) {
			if ( !dataKey ) {
				console.warn( "Attempted to fetch data with an empty key." );
				return null;
			}
			let storedResult = null;
			if ( typeof lib.jStorage === "object" ) {
				storedResult = lib.jStorage.get( dataKey );
				return ( storedResult !== null && storedResult !== undefined ) ? String( storedResult ) : null;
			} else {
				storedResult = localStorage.getItem( dataKey );
				return ( storedResult !== null && storedResult !== undefined ) ? String( storedResult ) : null;
			}
		},

		/**
		 * Deletes data from the active browser storage by its key.
		 * @param {string} dataKey - The key of the data to remove.
		 */
		deleteData: function( dataKey ) {
			if ( !dataKey ) {
				console.warn( "Attempted to delete data with an empty key." );
				return;
			}
			if ( typeof lib.jStorage === "object" ) {
				lib.jStorage.deleteKey( dataKey );
			} else {
				localStorage.removeItem( dataKey );
			}
		}
	};

	/**
	 * FormPersistenceManager Module (Singleton Pattern)
	 * Manages the saving and restoring of form data for resilience.
	 */
	const FormPersistenceManager = ( function() {
		// Private static registry for manager instances.
		const instanceRegistry = new Map();
		const activeTimers = new Map(); // To track interval IDs for timed saving.

		/**
		 * Private constructor for the FormPersistenceManager.
		 * @param {string} managerLabel - A unique identifier for this manager instance.
		 */
		function ManagerConstructor( managerLabel ) {
			this.instanceLabel = managerLabel;
			this.currentOptions = {};
			this.targetForms = lib(); // jQuery collection of forms under management.
			this.dataStore = browserStorageHandler;
			this.pageContextURI = ''; // Stores the current page URI or custom name for location-based storage.

			// Default configuration settings.
			const defaultSettings = {
				excludedFields: new Array(), // Array of DOM elements to exclude.
				keySuffix: '', // Custom string appended to storage keys.
				locationDependent: false, // Whether storage keys should include the page URI.
				saveDelayMs: 0, // Delay in milliseconds for timed saving (0 means no timed saving).
				autoClearOnSubmission: true, // Automatically clear stored data on form submit/reset.
				onDataSaved: function() {},
				onBeforeDataRestore: function() {},
				onDataRestored: function() {},
				onDataCleared: function() {}
			};

			// Initialize options with defaults.
			this.currentOptions = lib.extend( {}, defaultSettings );
		}

		ManagerConstructor.prototype = {
			/**
			 * Assigns a unique label to this manager instance.
			 * @param {string} label - The label string.
			 */
			setLabel: function( label ) {
				this.instanceLabel = label;
			},

			/**
			 * Retrieves the unique label of this manager instance.
			 * @returns {string} The instance label.
			 */
			getLabel: function() {
				return this.instanceLabel;
			},

			/**
			 * Configures the manager with provided settings, merging them with existing options.
			 * @param {object} newSettings - New configuration options.
			 */
			updateConfiguration: function( newSettings ) {
				if ( !this.currentOptions ) { // Ensure defaults are set if this is the first configuration.
					this.currentOptions = lib.extend( {}, ManagerConstructor.prototype.currentOptions );
				}
				lib.extend( this.currentOptions, newSettings );
			},

			/**
			 * Activates the persistence mechanism for the specified forms.
			 * @param {object} formElements - jQuery object representing the forms to protect.
			 * @param {object} settings - Configuration options for this activation.
			 */
			enablePersistence: function( formElements, settings ) {
				this.updateConfiguration( settings );

				if ( !formElements || formElements.length === 0 ) {
					console.warn( "No form elements provided for persistence activation." );
					return;
				}

				// Determine the context URI/name for storage keys.
				this.pageContextURI = this.currentOptions.name || window.location.href;

				// Add new forms to the managed collection, ensuring uniqueness.
				this.targetForms = this.targetForms.add( formElements ).unique();

				// Check if browser storage is available before proceeding.
				if ( !this.dataStore.checkAvailability() ) {
					console.warn( "Browser storage not available. Persistence disabled." );
					return;
				}

				const selfRef = this; // Capture 'this' for use in callbacks.

				// Execute pre-restoration callback. If it returns false, skip restoration.
				const preRestoreResult = selfRef.currentOptions.onBeforeDataRestore.call( selfRef );
				if ( preRestoreResult === undefined || preRestoreResult !== false ) {
					selfRef.repopulateForms();
				}

				// If automatic clearing is enabled, attach handlers for form submission/reset.
				if ( selfRef.currentOptions.autoClearOnSubmission ) {
					selfRef.attachReleaseHandlers();
				}

				// Only start data saving mechanisms once per instance.
				if ( !activeTimers.has( selfRef.getLabel() ) ) { // Using activeTimers map instead of a boolean flag.
					// Handle CKEditor initialization delay.
					if ( selfRef.hasRichTextEditor() ) {
						let editorCheckInterval = setInterval( function() {
							// Assuming CKEDITOR.isLoaded is set to true by an instanceReady event listener.
							// This needs to be set up in hasRichTextEditor or externally.
							if ( window.CKEDITOR && window.CKEDITOR.isLoaded ) {
								clearInterval( editorCheckInterval );
								selfRef.setupSaveTriggers();
								activeTimers.set( selfRef.getLabel(), true ); // Mark as started.
							}
						}, 150 ); // Check every 150ms.
					} else {
						selfRef.setupSaveTriggers();
						activeTimers.set( selfRef.getLabel(), true ); // Mark as started.
					}
				}
			},

			/**
			 * Checks for CKEditor presence and sets up a global flag for readiness.
			 * @returns {boolean} True if CKEditor is detected.
			 */
			hasRichTextEditor: function() {
				if ( typeof window.CKEDITOR !== "undefined" ) {
					// Ensure CKEDITOR.isLoaded is available and initially false until an instance is ready.
					if ( !window.CKEDITOR.isLoaded ) {
						window.CKEDITOR.isLoaded = false;
						window.CKEDITOR.on( 'instanceReady', function() {
							window.CKEDITOR.isLoaded = true;
						} );
					}
					return true;
				}
				return false;
			},

			/**
			 * Identifies form fields that should be protected by the persistence mechanism.
			 * Excludes common non-input fields and disabled/readonly ones.
			 * @param {object} currentForm - The jQuery object of the form.
			 * @returns {object} jQuery collection of persistable fields.
			 */
			getPersistableFields: function( currentForm ) {
				return currentForm.find( "input, textarea, select" )
					.not( ":submit, :reset, :button, :file, :password, :disabled, [readonly]" );
			},

			/**
			 * Sets up event listeners for saving form data.
			 */
			setupSaveTriggers: function() {
				const selfRef = this;

				// If a save delay is configured, schedule periodic saving.
				if ( selfRef.currentOptions.saveDelayMs > 0 ) {
					selfRef.scheduleTimedPersistence();
				}

				selfRef.targetForms.each( function() {
					const $currentForm = lib( this );
					const formKeySegment = $currentForm.prop( "id" ) + $currentForm.prop( "name" );

					selfRef.getPersistableFields( $currentForm ).each( function() {
						const $field = lib( this );
						// Skip if this field is explicitly excluded.
						if ( selfRef.currentOptions.excludedFields.includes( this ) ) {
							return true; // Continue to next iteration.
						}

						const storageKeyPrefix = selfRef._generateStorageKey( formKeySegment, $field.prop( "name" ) );

						// For text inputs and textareas, bind immediate saving if no timeout is set.
						if ( $field.is( ":text" ) || $field.is( "textarea" ) ) {
							if ( selfRef.currentOptions.saveDelayMs === 0 ) {
								selfRef.monitorInputChanges( $field, storageKeyPrefix );
							}
						}
						// For all other change-sensitive fields (select, radio, checkbox), bind to 'change' event.
						selfRef.handleFormElementChanges( $field );
					} );
				} );
			},

			/**
			 * Generates the full storage key for a form field.
			 * @param {string} formIdentifier - Identifier for the form.
			 * @param {string} fieldName - The name attribute of the field.
			 * @returns {string} The complete storage key.
			 * @private
			 */
			_generateStorageKey: function( formIdentifier, fieldName ) {
				let key = '';
				if ( this.currentOptions.locationDependent ) {
					key += this.pageContextURI;
				}
				key += formIdentifier;
				key += fieldName;
				key += this.currentOptions.keySuffix;
				return key;
			},


			/**
			 * Persists all current form data to browser storage.
			 * This method ensures all field types are handled correctly.
			 */
			persistFormData: function() {
				const selfRef = this;
				selfRef.targetForms.each( function() {
					const $currentForm = lib( this );
					const formKeySegment = $currentForm.prop( "id" ) + $currentForm.prop( "name" );
					const multiCheckboxTracker = new Map(); // To prevent saving multi-checkbox values multiple times.

					selfRef.getPersistableFields( $currentForm ).each( function() {
						const $field = lib( this );
						// Skip excluded fields or fields without a name.
						if ( selfRef.currentOptions.excludedFields.includes( this ) || !$field.prop( "name" ) ) {
							return true; // Continue to next field.
						}

						const fieldStorageKey = selfRef._generateStorageKey( formKeySegment, $field.prop( "name" ) );
						let fieldValue = $field.val(); // Default value.

						if ( $field.is( ":checkbox" ) ) {
							// Handle checkbox groups (e.g., name="options[]")
							if ( $field.prop( "name" ).includes( "[]" ) ) {
								if ( multiCheckboxTracker.has( $field.prop( "name" ) ) ) {
									return true; // Already processed this group.
								}
								fieldValue = [];
								lib( "[name='" + $field.prop( "name" ) + "']:checked", $currentForm ).each( function() {
									fieldValue.push( lib( this ).val() );
								} );
								multiCheckboxTracker.set( $field.prop( "name" ), true ); // Mark group as processed.
							} else {
								fieldValue = $field.prop( "checked" ); // Single checkbox value is boolean.
							}
							selfRef.commitToStorage( fieldStorageKey, fieldValue, false ); // Don't fire onSave for each checkbox.
						} else if ( $field.is( ":radio" ) ) {
							if ( $field.is( ":checked" ) ) {
								fieldValue = $field.val();
								selfRef.commitToStorage( fieldStorageKey, fieldValue, false );
							}
						} else {
							// Handle CKEditor content if present.
							if ( selfRef.hasRichTextEditor() ) {
								const editorInstance = window.CKEDITOR.instances[ $field.prop( "name" ) ] || window.CKEDITOR.instances[ $field.prop( "id" ) ];
								if ( editorInstance ) {
									editorInstance.updateElement(); // Ensure editor content is synced back to the textarea.
									selfRef.commitToStorage( fieldStorageKey, $field.val(), false );
								} else {
									selfRef.commitToStorage( fieldStorageKey, fieldValue, false );
								}
							} else {
								selfRef.commitToStorage( fieldStorageKey, fieldValue, false );
							}
						}
					} );
				} );
				// Execute the general save callback after all data is processed.
				selfRef.currentOptions.onDataSaved.call( selfRef );
			},

			/**
			 * Restores form data from browser storage.
			 */
			repopulateForms: function() {
				const selfRef = this;
				let anyDataRestored = false;

				selfRef.targetForms.each( function() {
					const $currentForm = lib( this );
					const formKeySegment = $currentForm.prop( "id" ) + $currentForm.prop( "name" );

					selfRef.getPersistableFields( $currentForm ).each( function() {
						const $field = lib( this );
						// Skip excluded fields.
						if ( selfRef.currentOptions.excludedFields.includes( this ) ) {
							return true; // Continue to next field.
						}

						const fieldStorageKey = selfRef._generateStorageKey( formKeySegment, $field.prop( "name" ) );
						const storedValue = selfRef.dataStore.fetchData( fieldStorageKey );

						if ( storedValue !== null ) {
							selfRef.applyFieldValues( $field, storedValue );
							anyDataRestored = true;
						}
					} );
				} );

				if ( anyDataRestored ) {
					selfRef.currentOptions.onDataRestored.call( selfRef );
				}
			},

			/**
			 * Applies a retrieved value to a specific form field.
			 * @param {object} targetField - The jQuery object of the field.
			 * @param {string} retrievedValue - The value to apply.
			 */
			applyFieldValues: function( targetField, retrievedValue ) {
				const fieldName = targetField.prop( "name" );
				if ( !fieldName ) {
					return; // Field must have a name.
				}

				if ( targetField.is( ":checkbox" ) ) {
					if ( fieldName.includes( "[]" ) ) {
						// For multi-checkboxes (array-like values).
						const valuesArray = retrievedValue.split( ',' );
						targetField.prop( "checked", valuesArray.includes( targetField.val() ) );
					} else {
						// Single checkbox.
						targetField.prop( "checked", retrievedValue === "true" );
					}
				} else if ( targetField.is( ":radio" ) ) {
					targetField.prop( "checked", targetField.val() === retrievedValue );
				} else if ( targetField.is( "select[multiple]" ) ) {
					// For multi-selects.
					targetField.val( retrievedValue.split( ',' ) );
				} else {
					// For text inputs, textareas, single selects.
					targetField.val( retrievedValue );
				}
				targetField.trigger( 'change' ); // Trigger change event after setting value.
			},

			/**
			 * Binds immediate data saving to input events for text fields.
			 * @param {object} inputField - The jQuery object of the text input/textarea.
			 * @param {string} storageId - The storage key for this field.
			 */
			monitorInputChanges: function( inputField, storageId ) {
				const selfRef = this;

				// Use 'input' event for modern browsers, 'propertychange' for older IE.
				inputField.on( 'input propertychange', function() {
					selfRef.commitToStorage( storageId, lib( this ).val() );
				} );

				// If CKEditor is active for this field, bind its keyup event.
				if ( selfRef.hasRichTextEditor() ) {
					const editorInstance = window.CKEDITOR.instances[ inputField.prop( "name" ) ] || window.CKEDITOR.instances[ inputField.prop( "id" ) ];
					if ( editorInstance ) {
						editorInstance.document.on( 'keyup', function() {
							editorInstance.updateElement(); // Sync editor content to textarea.
							selfRef.commitToStorage( storageId, inputField.val() );
						} );
					}
				}
			},

			/**
			 * Commits a value to browser storage and optionally triggers the save callback.
			 * @param {string} keyToStore - The key for the storage entry.
			 * @param {*} valueToStore - The value to be stored.
			 * @param {boolean} [triggerCallback=true] - Whether to fire the onDataSaved callback.
			 */
			commitToStorage: function( keyToStore, valueToStore, triggerCallback = true ) {
				if ( !keyToStore || valueToStore === undefined ) {
					console.warn( "Cannot commit to storage: invalid key or value." );
					return;
				}
				this.dataStore.storeData( keyToStore, valueToStore );
				if ( triggerCallback && ( valueToStore !== '' || ( Array.isArray(valueToStore) && valueToStore.length > 0 ) ) ) {
					this.currentOptions.onDataSaved.call( this );
				}
			},

			/**
			 * Binds data saving to the 'change' event for relevant form elements.
			 * @param {object} formField - The jQuery object of the form element.
			 */
			handleFormElementChanges: function( formField ) {
				const selfRef = this;
				formField.on( 'change', function() {
					selfRef.persistFormData(); // Re-save all data on change for non-text fields.
				} );
			},

			/**
			 * Initiates periodic saving of form data based on the configured delay.
			 */
			scheduleTimedPersistence: function() {
				const selfRef = this;
				const delay = selfRef.currentOptions.saveDelayMs;

				if ( delay <= 0 ) {
					return; // No timed persistence if delay is zero or negative.
				}

				// Clear any existing timer for this instance before setting a new one.
				if ( activeTimers.has( selfRef.getLabel() ) && typeof activeTimers.get( selfRef.getLabel() ) === 'number' ) {
					clearInterval( activeTimers.get( selfRef.getLabel() ) );
				}

				const timerId = setInterval( function() {
					selfRef.persistFormData();
				}, delay );

				activeTimers.set( selfRef.getLabel(), timerId ); // Store the interval ID.
			},

			/**
			 * Attaches event listeners to forms to clear persisted data on submit or reset.
			 */
			attachReleaseHandlers: function() {
				const selfRef = this;
				selfRef.targetForms.each( function() {
					const $currentForm = lib( this );
					const formKeySegment = $currentForm.prop( "id" ) + $currentForm.prop( "name" );

					$currentForm.on( "submit reset", function() {
						selfRef.clearPersistentData( formKeySegment, selfRef.getPersistableFields( $currentForm ) );
					} );
				} );
			},

			/**
			 * Manually triggers the clearing of all persisted data for the managed forms.
			 */
			forceReleaseData: function() {
				const selfRef = this;
				selfRef.targetForms.each( function() {
					const $currentForm = lib( this );
					const formKeySegment = $currentForm.prop( "id" ) + $currentForm.prop( "name" );
					selfRef.clearPersistentData( formKeySegment, selfRef.getPersistableFields( $currentForm ) );
				} );
			},

			/**
			 * Clears persisted form data from browser storage.
			 * @param {string} formSegmentId - The identifier for the form.
			 * @param {object} fieldsToClear - jQuery object of fields whose data needs to be cleared.
			 */
			clearPersistentData: function( formSegmentId, fieldsToClear ) {
				let dataWasCleared = false;
				const selfRef = this;

				// Stop timed saving for this instance.
				if ( activeTimers.has( selfRef.getLabel() ) && typeof activeTimers.get( selfRef.getLabel() ) === 'number' ) {
					clearInterval( activeTimers.get( selfRef.getLabel() ) );
					activeTimers.delete( selfRef.getLabel() ); // Remove from active timers.
				}

				fieldsToClear.each( function() {
					const $field = lib( this );
					// Skip excluded fields.
					if ( selfRef.currentOptions.excludedFields.includes( this ) ) {
						return true; // Continue to next field.
					}

					const fieldStorageKey = selfRef._generateStorageKey( formSegmentId, $field.prop( "name" ) );
					selfRef.dataStore.deleteData( fieldStorageKey );
					dataWasCleared = true;
				} );

				if ( dataWasCleared ) {
					selfRef.currentOptions.onDataCleared.call( selfRef );
				}
			}
		};

		return {
			/**
			 * Public method to get a singleton instance of the FormPersistenceManager.
			 * Creates a new instance if one doesn't exist for the given label.
			 * @param {string} uniqueLabel - A unique label to identify the manager instance.
			 * @returns {object} The FormPersistenceManager instance.
			 */
			getManager: function( uniqueLabel ) {
				if ( !uniqueLabel ) {
					console.error( "A unique label is required to retrieve a FormPersistenceManager instance." );
					return null;
				}
				if ( !instanceRegistry.has( uniqueLabel ) ) {
					instanceRegistry.set( uniqueLabel, new ManagerConstructor( uniqueLabel ) );
				}
				return instanceRegistry.get( uniqueLabel );
			}
		};
	})(); // End of FormPersistenceManager IIFE.

})( jQuery ); // Pass jQuery as 'lib'