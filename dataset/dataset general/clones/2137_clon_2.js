// This module provides functionality to automatically preserve web form input values
// within a client-side storage mechanism. This helps users recover their data
// after unexpected browser closures or system failures.
//
// @developer Alexander Kaupanin <kaupanin@gmail.com>

( function( jq ) {

	jq.fn.memoryGuard = function( opts ) {
		// Generate a unique key for this set of elements by combining their IDs and names.
		var uniqueKey = jq.map( this, function( element, idx ) {
			return jq( element ).attr( "id" ) + jq( element ).attr( "name" );
		}).join( "," );

		var guardInstance = MemoryGuard.obtainInstance( uniqueKey );
		guardInstance.safeguard( this, opts );
		return guardInstance;
	};

	// Define a global object for local storage operations, mirroring the original's structure.
	// This ensures consistency with the original code's interaction patterns.
	var localData = {
		retrieveItem: function( key ) {
			return localStorage.getItem( key );
		},
		storeItem: function( key, value ) {
			localStorage.setItem( key, value );
		},
		clearItem: function( key ) {
			localStorage.removeItem( key );
		}
	};

	var webStore = {}; // Renamed storage object

	/**
	 * Determines if local storage or an equivalent client-side storage
	 * solution is accessible within the current browser environment.
	 *
	 * @returns {boolean} True if storage is available, otherwise false.
	 */
	webStore.checkAvailability = function() {
		if ( typeof jq.jsonStore === "object" ) { // Changed jStorage to jsonStore
			return true;
		}
		try {
			return localData.retrieveItem; // localStorage to localData, getItem to retrieveItem
		} catch ( err ) { // Changed 'e' to 'err'
			return false;
		}
	};

	/**
	 * Stores a specific data item in the client-side storage.
	 *
	 * @param {string} storageKey    The unique identifier for the data.
	 * @param {string} storageValue  The data to be stored.
	 *
	 * @returns {void}
	 */
	webStore.placeItem = function( storageKey, storageValue ) { // Renamed set to placeItem, key to storageKey, value to storageValue
		if ( typeof jq.jsonStore === "object" ) {
			jq.jsonStore.set( storageKey, storageValue + "" );
		} else {
			try {
				localData.storeItem( storageKey, storageValue + "" ); // localStorage to localData, setItem to storeItem
			} catch ( err ) {
				// Potential QUOTA_EXCEEDED_ERR or similar storage issues might occur here
			}
		}
	};

	/**
	 * Retrieves data from client-side storage using the provided key.
	 *
	 * @param {string} storageKey  The identifier of the data to retrieve.
	 *
	 * @returns {string|null} The stored string value, or null if not found.
	 */
	webStore.fetchItem = function( storageKey ) { // Renamed get to fetchItem
		if ( typeof jq.jsonStore === "object" ) {
			var retrievedValue = jq.jsonStore.get( storageKey ); // result to retrievedValue
			return retrievedValue ? retrievedValue.toStr() : retrievedValue; // toString to toStr
		} else {
			return localData.retrieveItem( storageKey ); // localStorage to localData, getItem to retrieveItem
		}
	};

	/**
	 * Deletes a specific data item from the client-side storage.
	 *
	 * @param {string} storageKey  The identifier of the data to remove.
	 *
	 * @returns {void}
	 */
	webStore.deleteItem = function( storageKey ) { // Renamed remove to deleteItem
		if ( typeof jq.jsonStore === "object" ) {
			jq.jsonStore.removeKey( storageKey ); // deleteKey to removeKey
		} else {
			localData.clearItem( storageKey ); // removeItem to clearItem
		}
	};

	MemoryGuard = ( function() { // Renamed Sisyphus to MemoryGuard
		var internalStates = { // Renamed params to internalStates
			createdInstances: [], // Renamed instantiated to createdInstances
			initializedTracking: [] // Renamed started to initializedTracking
		};

		function initialize () { // Renamed init to initialize

			return {
				setUniqueId: function( uniqueIdParam ) { // Renamed setInstanceIdentifier to setUniqueId, identifier to uniqueIdParam
					this.uniqueId = uniqueIdParam;
				},

				getUniqueId: function() { // Renamed getInstanceIdentifier to getUniqueId
					return this.uniqueId;
				},

				/**
				 * Configures the initial operational parameters for the plugin.
				 *
				 * @param {object} initialConfig  An object containing configuration settings.
				 *
				 * @returns {void}
				 */
				setInitialConfig: function ( initialConfig ) { // Renamed setInitialOptions to setInitialConfig, options to initialConfig
					var standardSettings = { // Renamed defaults to standardSettings
						ignoredInputs: [], // Renamed excludeFields to ignoredInputs
						keyExtension: "", // Renamed customKeySuffix to keyExtension
						pathDependent: false, // Renamed locationBased to pathDependent
						saveInterval: 0, // Renamed timeout to saveInterval
						autoClear: true, // Renamed autoRelease to autoClear
						onDataPersist: function() {}, // Renamed onSave to onDataPersist
						beforeDataRecover: function() {}, // Renamed onBeforeRestore to beforeDataRecover
						onDataRecover: function() {}, // Renamed onRestore to onDataRecover
						onDataPurge: function() {} // Renamed onRelease to onDataPurge
					};
					this.config = this.config || jq.extend( standardSettings, initialConfig ); // options to config
					this.webStore = webStore; // browserStorage to webStore
				},

				/**
				 * Updates or extends the current configuration settings.
				 *
				 * @param {object} newConfig  An object with new or updated configuration values.
				 *
				 * @returns {void}
				 */
				updateConfig: function ( newConfig ) { // Renamed setOptions to updateConfig
					this.config = this.config || this.setInitialConfig( newConfig ); // options to config
					this.config = jq.extend( this.config, newConfig ); // options to config
				},

				/**
				 * Initiates the safeguarding process for specified HTML forms,
				 * preserving their input data in client-side storage and restoring it upon page load.
				 *
				 * @param {object} formElements  jQuery object(s) representing the forms to protect.
				 * @param {object} pluginConfig  Configuration options for this safeguarding instance.
				 *
				 * @returns {boolean|void} False if storage is unavailable, otherwise nothing.
				 */
				safeguard: function( formElements, pluginConfig ) { // Renamed protect to safeguard, targets to formElements, options to pluginConfig
					this.updateConfig( pluginConfig );
					formElements = formElements || {};
					var _this = this; // Renamed self to _this
					this.watchedElements = this.watchedElements || []; // Renamed targets to watchedElements
					if ( _this.config.instanceName ) { // options to config, name to instanceName
						this.currentUrlPath = _this.config.instanceName; // href to currentUrlPath
					} else {
						this.currentUrlPath = document.location.host + document.location.path + document.location.query + document.location.fragment; // location parts changed
					}
					this.watchedElements = jq.merge( this.watchedElements, formElements );
					this.watchedElements = jq.unique( this.watchedElements );
					this.watchedElements = jq( this.watchedElements );
					if ( ! this.webStore.checkAvailability() ) { // browserStorage to webStore, isAvailable to checkAvailability
						return false;
					}

					var callbackOutcome = _this.config.beforeDataRecover.call( _this ); // callback_result to callbackOutcome, onBeforeRestore to beforeDataRecover
					if ( callbackOutcome === undefined || callbackOutcome ) {
						_this.recoverAllData(); // restoreAllData to recoverAllData
					}

					if ( this.config.autoClear ) { // options to config, autoRelease to autoClear
						_this.bindClearData(); // bindReleaseData to bindClearData
					}

					if ( ! internalStates.initializedTracking[ this.getUniqueId() ] ) { // params to internalStates, started to initializedTracking, getInstanceIdentifier to getUniqueId
						if ( _this.isCkEditorLoaded() ) { // isCKEditorPresent to isCkEditorLoaded
							var timerId = setInterval( function() { // intervalId to timerId
								if (richTextEditor.isReady) { // CKEDITOR.isLoaded to richTextEditor.isReady
									clearInterval(timerId);
									_this.bindPersistData(); // bindSaveData to bindPersistData
									internalStates.initializedTracking[ _this.getUniqueId() ] = true; // params to internalStates, started to initializedTracking
								}
							}, 100);
						} else {
							_this.bindPersistData(); // bindSaveData to bindPersistData
							internalStates.initializedTracking[ _this.getUniqueId() ] = true; // params to internalStates, started to initializedTracking
						}
					}
				},

				isCkEditorLoaded: function() { // Renamed isCKEditorPresent to isCkEditorLoaded
					if ( this.checkCkEditorExistence() ) { // isCKEditorExists to checkCkEditorExistence
						richTextEditor.isReady = false; // CKEDITOR.isLoaded to richTextEditor.isReady
						richTextEditor.on('instanceReady', function() { // CKEDITOR to richTextEditor
							richTextEditor.isReady = true; // CKEDITOR.isLoaded to richTextEditor.isReady
						} );
						return true;
					} else {
						return false;
					}
				},

				checkCkEditorExistence: function() { // Renamed isCKEditorExists to checkCkEditorExistence
					return typeof richTextEditor != "undefined"; // CKEDITOR to richTextEditor
				},

				locateInputsToTrack: function( formElement ) { // Renamed findFieldsToProtect to locateInputsToTrack, target to formElement
					return formElement.find( ":input" ).not( ":submit" ).not( ":reset" ).not( ":button" ).not( ":file" ).not( ":password" ).not( ":disabled" ).not( "[readonly]" );
				},

				/**
				 * Attaches event listeners for data persistence.
				 *
				 * @returns {void}
				 */
				bindPersistData: function() { // Renamed bindSaveData to bindPersistData
					var _this = this;

					if ( _this.config.saveInterval ) { // options to config, timeout to saveInterval
						_this.persistDataByInterval(); // saveDataByTimeout to persistDataByInterval
					}

					_this.watchedElements.each( function() { // targets to watchedElements
						var formKeyCombo = jq( this ).attr( "id" ) + jq( this ).attr( "name" ); // targetFormIdAndName to formKeyCombo
						_this.locateInputsToTrack( jq( this ) ).each( function() { // findFieldsToProtect to locateInputsToTrack
							if ( jq.inArray( this, _this.config.ignoredInputs ) !== -1 ) { // $.inArray to jq.inArray, options to config, excludeFields to ignoredInputs
								// Non-false return is equivalent to 'continue' in a loop, skipping to the next iteration.
								return true;
							}
							var inputField = jq( this ); // field to inputField
							var storagePrefix = (_this.config.pathDependent ? _this.currentUrlPath : "") + formKeyCombo + inputField.attr( "name" ) + _this.config.keyExtension; // prefix to storagePrefix, options to config, locationBased to pathDependent, href to currentUrlPath, customKeySuffix to keyExtension
							if ( inputField.is( ":text" ) || inputField.is( "textarea" ) ) {
								if ( ! _this.config.saveInterval ) { // options to config, timeout to saveInterval
									_this.bindInstantPersist( inputField, storagePrefix ); // bindSaveDataImmediately to bindInstantPersist
								}
							}
							_this.bindChangePersist( inputField ); // bindSaveDataOnChange to bindChangePersist
						} );
					} );
				},

				/**
				 * Persists all tracked form data to the client-side storage.
				 * This method ensures consistency across different input types.
				 *
				 * @returns {void}
				 */
				persistAllData: function() { // Renamed saveAllData to persistAllData
					var _this = this;
					_this.watchedElements.each( function() { // targets to watchedElements
						var formKeyCombo = jq( this ).attr( "id" ) + jq( this ).attr( "name" );
						var checkboxGroupTracker = {}; // multiCheckboxCache to checkboxGroupTracker

						_this.locateInputsToTrack( jq( this ) ).each( function() { // findFieldsToProtect to locateInputsToTrack
							var inputField = jq( this ); // field to inputField
							if ( jq.inArray( this, _this.config.ignoredInputs ) !== -1 || inputField.attr( "name" ) === undefined ) { // options to config, excludeFields to ignoredInputs
								// Skipping to the next element if excluded or unnamed.
								return true;
							}
							var storagePrefix = (_this.config.pathDependent ? _this.currentUrlPath : "") + formKeyCombo + inputField.attr( "name" ) + _this.config.keyExtension;
							var fieldValue = inputField.val(); // value to fieldValue

							if ( inputField.is(":checkbox") ) {
								if ( inputField.attr( "name" ).indexOf( "[" ) !== -1 ) {
									if ( checkboxGroupTracker[ inputField.attr( "name" ) ] === true ) {
										return;
									}
									fieldValue = [];
									jq( "[name='" + inputField.attr( "name" ) +"']:checked" ).each( function() {
										fieldValue.push( jq( this ).val() );
									} );
									checkboxGroupTracker[ inputField.attr( "name" ) ] = true;
								} else {
									fieldValue = inputField.is( ":checked" );
								}
								_this.saveToWebStore( storagePrefix, fieldValue, false ); // saveToBrowserStorage to saveToWebStore
							} else if ( inputField.is( ":radio" ) ) {
								if ( inputField.is( ":checked" ) ) {
									fieldValue = inputField.val();
									_this.saveToWebStore( storagePrefix, fieldValue, false ); // saveToBrowserStore to saveToWebStore
								}
							} else {
								if ( _this.checkCkEditorExistence() ) { // isCKEditorExists to checkCkEditorExistence
									var ckInstance; // editor to ckInstance
									if ( ckInstance = richTextEditor.instances[ inputField.attr("name") ] || richTextEditor.instances[ inputField.attr("id") ] ) { // CKEDITOR to richTextEditor
										ckInstance.updateDomElement(); // updateElement to updateDomElement
										_this.saveToWebStore( storagePrefix, inputField.val(), false); // saveToBrowserStorage to saveToWebStore
									} else {
										_this.saveToWebStore( storagePrefix, fieldValue, false ); // saveToBrowserStorage to saveToWebStore
									}
								} else {
									_this.saveToWebStore( storagePrefix, fieldValue, false ); // saveToBrowserStorage to saveToWebStore
								}
							}
						} );
					} );
					_this.config.onDataPersist.call( _this ); // options to config, onSave to onDataPersist
				},

				/**
				 * Retrieves and applies previously saved form data from client-side storage.
				 *
				 * @returns {void}
				 */
				recoverAllData: function() { // Renamed restoreAllData to recoverAllData
					var _this = this;
					var wasRestored = false; // restored to wasRestored

					_this.watchedElements.each( function() { // targets to watchedElements
						var currentForm = jq( this ); // target to currentForm
						var formKeyCombo = jq( this ).attr( "id" ) + jq( this ).attr( "name" );

						_this.locateInputsToTrack( currentForm ).each( function() { // findFieldsToProtect to locateInputsToTrack
							if ( jq.inArray( this, _this.config.ignoredInputs ) !== -1 ) { // options to config, excludeFields to ignoredInputs
								// Continue to the next field if this one is in the exclusion list.
								return true;
							}
							var inputField = jq( this );
							var storagePrefix = (_this.config.pathDependent ? _this.currentUrlPath : "") + formKeyCombo + inputField.attr( "name" ) + _this.config.keyExtension;
							var savedValue = _this.webStore.fetchItem( storagePrefix ); // resque to savedValue, browserStorage to webStore, get to fetchItem
							if ( savedValue !== null ) {
								_this.recoverInputData( inputField, savedValue ); // restoreFieldsData to recoverInputData
								wasRestored = true;
							}
						} );
					} );

					if ( wasRestored ) {
						_this.config.onDataRecover.call( _this ); // options to config, onRestore to onDataRecover
					}
				},

				/**
				 * Restores an individual form input's data from client-side storage.
				 *
				 * @param {object} inputField    jQuery object for the form input element.
				 * @param {string} savedValue    The previously stored data for this field.
				 *
				 * @returns {boolean|void} False if field has no name, otherwise nothing.
				 */
				recoverInputData: function( inputField, savedValue ) { // Renamed restoreFieldsData to recoverInputData, field to inputField, resque to savedValue
					if ( inputField.attr( "name" ) === undefined ) {
						return false;
					}
					if ( inputField.is( ":checkbox" ) && savedValue !== "false" && inputField.attr( "name" ).indexOf( "[" ) === -1 ) {
						inputField.prop( "checked", true ); // attr to prop for checkboxes
					} else if( inputField.is( ":checkbox" ) && savedValue === "false" && inputField.attr( "name" ).indexOf( "[" ) === -1 ) {
						inputField.prop( "checked", false ); // attr to prop for checkboxes
					} else if ( inputField.is( ":radio" ) ) {
						if ( inputField.val() === savedValue ) {
							inputField.prop( "checked", true ); // attr to prop for radios
						}
					} else if ( inputField.attr( "name" ).indexOf( "[" ) === -1 ) {
						inputField.val( savedValue );
					} else {
						savedValue = savedValue.split( "," );
						inputField.val( savedValue );
					}
				},

				/**
				 * Binds immediate data saving events (e.g., typing) to a form input.
				 *
				 * @param {object} inputField      jQuery object for the form input element.
				 * @param {string} storagePrefix   The key prefix for storing data.
				 *
				 * @returns {void}
				 */
				bindInstantPersist: function( inputField, storagePrefix ) { // Renamed bindSaveDataImmediately to bindInstantPersist, field to inputField, prefix to storagePrefix
					var _this = this;
					if ( 'onElemPropertyChange' in inputField.get(0) ) { // onpropertychange to onElemPropertyChange
						inputField.get(0).onElemPropertyChange = function() {
							_this.saveToWebStore( storagePrefix, inputField.val() ); // saveToBrowserStorage to saveToWebStore
						};
					} else {
						inputField.get(0).onElemInput = function() { // oninput to onElemInput
							_this.saveToWebStore( storagePrefix, inputField.val() ); // saveToBrowserStorage to saveToWebStore
						};
					}
					if ( this.checkCkEditorExistence() ) { // isCKEditorExists to checkCkEditorExistence
						var ckInstance;
						if ( ckInstance = richTextEditor.instances[ inputField.attr("name") ] || richTextEditor.instances[ inputField.attr("id") ] ) { // CKEDITOR to richTextEditor
							ckInstance.doc.on( 'keyUpEvent', function() { // document.on to doc.on, keyup to keyUpEvent
								ckInstance.updateDomElement(); // updateElement to updateDomElement
								_this.saveToWebStore( storagePrefix, inputField.val() ); // saveToBrowserStorage to saveToWebStore
							} );
						}
					}
				},

				/**
				 * Saves data to the client-side web storage and optionally triggers a callback.
				 *
				 * @param {string} storageKey       The key for the data item.
				 * @param {string} storageValue     The value to store.
				 * @param {boolean} triggerCallback  If true, the onDataPersist callback is fired.
				 *
				 * @returns {void}
				 */
				saveToWebStore: function( storageKey, storageValue, triggerCallback ) { // Renamed saveToBrowserStorage to saveToWebStore, key to storageKey, value to storageValue, fireCallback to triggerCallback
					// If triggerCallback is not defined, it defaults to true.
					triggerCallback = triggerCallback === undefined ? true : triggerCallback;
					this.webStore.placeItem( storageKey, storageValue ); // browserStorage to webStore, set to placeItem
					if ( triggerCallback && storageValue !== "" ) {
						this.config.onDataPersist.call( this ); // options to config, onSave to onDataPersist
					}
				},

				/**
				 * Binds data saving to the change event of an input field.
				 *
				 * @param {object} inputField  jQuery object for the form input element.
				 *
				 * @returns {void}
				 */
				bindChangePersist: function( inputField ) { // Renamed bindSaveDataOnChange to bindChangePersist, field to inputField
					var _this = this;
					inputField.change( function() {
						_this.persistAllData(); // saveAllData to persistAllData
					} );
				},

				/**
				 * Periodically saves form data based on a defined interval.
				 *
				 * @returns {void}
				 */
				persistDataByInterval: function() { // Renamed saveDataByTimeout to persistDataByInterval
					var _this = this;
					var monitoredForms = _this.watchedElements; // targetForms to monitoredForms, targets to watchedElements
					setTimeout( ( function() {
						function intervalFunction() { // timeout to intervalFunction
							_this.persistAllData(); // saveAllData to persistAllData
							setTimeout( intervalFunction, _this.config.saveInterval * 1000 ); // timeout to intervalFunction, options to config, timeout to saveInterval
						}
						return intervalFunction;
					} )( monitoredForms ), _this.config.saveInterval * 1000 ); // options to config, timeout to saveInterval
				},

				/**
				 * Binds data clearing from storage upon form submission or reset.
				 *
				 * @returns {void}
				 */
				bindClearData: function() { // Renamed bindReleaseData to bindClearData
					var _this = this;
					_this.watchedElements.each( function() { // targets to watchedElements
						var currentForm = jq( this ); // target to currentForm
						var formIdentifier = currentForm.attr( "id" ) + currentForm.attr( "name" ); // formIdAndName to formIdentifier
						jq( this ).bind( "submitForm resetForm", function() { // submit reset to submitForm resetForm
							_this.clearData( formIdentifier, _this.locateInputsToTrack( currentForm ) ); // releaseData to clearData, findFieldsToProtect to locateInputsToTrack
						} );
					} );
				},

				/**
				 * Manually triggers the clearing of form data from storage.
				 *
				 * @returns {void}
				 */
				manualClearData: function() { // Renamed manuallyReleaseData to manualClearData
					var _this = this;
					_this.watchedElements.each( function() { // targets to watchedElements
						var currentForm = jq( this );
						var formIdentifier = currentForm.attr( "id" ) + currentForm.attr( "name" );
						_this.clearData( formIdentifier, _this.locateInputsToTrack( currentForm ) );
					} );
				},

				/**
				 * Clears form field data from client-side storage.
				 *
				 * @param {string} formIdentifier  A combined ID and name string for the form.
				 * @param {object} trackedFields   jQuery object containing the fields to clear.
				 *
				 * @returns {void}
				 */
				clearData: function( formIdentifier, trackedFields ) { // Renamed releaseData to clearData, targetFormIdAndName to formIdentifier, fieldsToProtect to trackedFields
					var wasCleared = false; // released to wasCleared
					var _this = this;

					// Mark the released form as not tracking anymore. This is a fix for dynamically loaded forms.
					internalStates.initializedTracking[ _this.getUniqueId() ] = false; // params to internalStates, started to initializedTracking

					trackedFields.each( function() {
						if ( jq.inArray( this, _this.config.ignoredInputs ) !== -1 ) { // options to config, excludeFields to ignoredInputs
							// Skip excluded fields.
							return true;
						}
						var inputField = jq( this );
						var storagePrefix = (_this.config.pathDependent ? _this.currentUrlPath : "") + formIdentifier + inputField.attr( "name" ) + _this.config.keyExtension;
						_this.webStore.deleteItem( storagePrefix ); // browserStorage to webStore, remove to deleteItem
						wasCleared = true;
					} );

					if ( wasCleared ) {
						_this.config.onDataPurge.call( _this ); // options to config, onRelease to onDataPurge
					}
				}
			};
		}

		return {
			obtainInstance: function( uniqueIdParam ) { // Renamed getInstance to obtainInstance
				if ( ! internalStates.createdInstances[ uniqueIdParam ] ) { // params to internalStates, instantiated to createdInstances
					internalStates.createdInstances[ uniqueIdParam ] = initialize(); // params to internalStates, instantiated to createdInstances, init to initialize
					internalStates.createdInstances[ uniqueIdParam ].setUniqueId( uniqueIdParam ); // setInstanceIdentifier to setUniqueId
				}
				return internalStates.createdInstances[ uniqueIdParam ];
			}
		};

	} )();


} )( jQuery ); // Changed $ to jQuery to be explicit, and jq inside the IIFE.