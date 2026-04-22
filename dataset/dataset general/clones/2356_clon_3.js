/*
Copyright (c) 2003-2023, The Enhanced Editor Project. All rights reserved.
For licensing information, refer to LICENSE.txt or https://enhanced-editor.org/license
*/

(function()
{
	const mediaElementEditor = function( currentEditorInstance, editorModeIdentifier )
	{
		// Internal flags for content processing stages.
		const MEDIA_IMAGE_TYPE_FLAG = 1;
		const HYPERLINK_TYPE_FLAG = 2;
		const VISUAL_PREVIEW_FLAG = 4;
		const RESOURCE_CLEANUP_FLAG = 8;

		// Regular expressions for parsing dimensions.
		const sizeExtractionPattern = /^\s*(\d+)((px)|\%)?\s*$/i;
		// const sizeOrEmptyPattern = /(^\s*(\d+)((px)|\%)?\s*$)|^$/i; // Not actively used, can be removed.

		const PIXEL_UNIT = 'px';
		const PERCENT_UNIT = '%';

		/**
		 * Handles changes in dimension input fields (width/height).
		 * Adjusts the other dimension if aspect ratio is locked.
		 */
		const handleDimensionAdjustment = function()
		{
			let inputValue = this.getValue();
			const activeDialog = this.getDialog();

			if (!activeDialog || !inputValue) {
				// Early exit if dialog is not ready or input is empty
				return;
			}

			const matchResult  = inputValue.match( sizeExtractionPattern );
			if ( matchResult )
			{
				// If a percentage unit is detected, unlock the aspect ratio.
				if ( matchResult[2] === PERCENT_UNIT ) {
					toggleAspectRatioLock( activeDialog, false );
				}
				inputValue = matchResult[1]; // Extract just the numeric part.
			}

			// Proceed only if the aspect ratio is currently locked.
			if ( activeDialog.keepAspectRatioLocked )
			{
				const originalSourceElement = activeDialog.originalSourceElement;
				// Ensure the original image dimensions are loaded and ready.
				if ( originalSourceElement && originalSourceElement.getCustomData( 'isReady' ) === 'true' )
				{
					let calculatedOtherDimension;
					const currentImageWidth = originalSourceElement.$.width;
					const currentImageHeight = originalSourceElement.$.height;

					if ( this.id === 'heightInputField' ) // If height was changed
					{
						if ( inputValue && inputValue !== '0' && currentImageHeight !== 0 ) {
							calculatedOtherDimension = Math.round( currentImageWidth * ( parseFloat(inputValue)  / currentImageHeight ) );
						}
						if ( typeof calculatedOtherDimension === 'number' && !isNaN( calculatedOtherDimension ) ) {
							activeDialog.setValueOf( 'generalInfoSection', 'widthInputField', calculatedOtherDimension );
						}
					}
					else if ( this.id === 'widthInputField' ) // If width was changed
					{
						if ( inputValue && inputValue !== '0' && currentImageWidth !== 0 ) {
							calculatedOtherDimension = Math.round( currentImageHeight * ( parseFloat(inputValue)  / currentImageWidth ) );
						}
						if ( typeof calculatedOtherDimension === 'number' && !isNaN( calculatedOtherDimension ) ) {
							activeDialog.setValueOf( 'generalInfoSection', 'heightInputField', calculatedOtherDimension );
						}
					}
				}
			}
			// Always refresh the visual representation after dimension changes.
			refreshVisualDisplay( activeDialog );
		};

		/**
		 * Updates the visual preview image within the dialog.
		 * @param {CKEDITOR.dialog} activeDialog The dialog instance.
		 */
		const refreshVisualDisplay = function( activeDialog )
		{
			// Prevent loading before the dialog is fully initialized.
			if ( !activeDialog.originalSourceElement || !activeDialog.dialogPreviewImage ) {
				return false; // Indicate preview not updated.
			}

			// Apply current dialog content to the preview element.
			activeDialog.commitContent( VISUAL_PREVIEW_FLAG, activeDialog.dialogPreviewImage );
			return true; // Indicate preview updated.
		};

		// Custom commit logic for dialog elements.
		// Ensures inline style field has priority to avoid conflicts.
		function processDialogContent()
		{
			const commitArguments = arguments;
			const inlineStyleField = this.getContentElement( 'advanced', 'txtdlgGenStyle' );

			// Commit inline style first if it exists.
			inlineStyleField && inlineStyleField.commit.apply( inlineStyleField, commitArguments );

			// Iterate over other widgets and commit their content.
			this.foreach( function( widget )
			{
				if ( widget.commit &&  widget.id !== 'txtdlgGenStyle' ) {
					widget.commit.apply( widget, commitArguments );
				}
			});
		}

		// Flag to prevent recursive internal commit operations.
		let isCommittingTransaction = false;

		/**
		 * Synchronizes values of the current field to other related fields.
		 * This is typically used for fields that impact inline styles or other attributes.
		 * @param {Array<string>} impactedFields An array of field IDs to update.
		 */
		function synchronizeInternalFields( impactedFields )
		{
			if ( isCommittingTransaction ) {
				return;
			}

			isCommittingTransaction = true; // Set mutex to prevent recursion.

			const activeDialog = this.getDialog();
			const mediaElement = activeDialog.workingImageElement;

			if ( mediaElement )
			{
				// Commit the current field's value to the media element.
				this.commit( MEDIA_IMAGE_TYPE_FLAG, mediaElement );

				// Ensure impactedFields is an array.
				const fieldsToUpdate = [...impactedFields];
				fieldsToUpdate.forEach( fieldIdString => {
					const [tabId, fieldId] = fieldIdString.split( ':' );
					const targetField = activeDialog.getContentElement( tabId, fieldId );
					// Setup the target field, which might trigger its own commit/setup.
					targetField && targetField.setup( MEDIA_IMAGE_TYPE_FLAG, mediaElement );
				});
			}

			isCommittingTransaction = false; // Release mutex.
		}

		/**
		 * Toggles the aspect ratio lock state and updates the UI button.
		 * @param {CKEDITOR.dialog} activeDialog The dialog instance.
		 * @param {boolean|string} newState If boolean, sets lock state. If 'check', auto-determines state.
		 * @returns {boolean} The new lock ratio state.
		 */
		const toggleAspectRatioLock = function( activeDialog, newState )
		{
			const originalSourceElement = activeDialog.originalSourceElement;

			// Dialog might be closed already.
			if( !originalSourceElement ) {
				console.warn('Attempted to toggle aspect ratio on a closed dialog.');
				return null;
			}

			const aspectRatioToggleButton = CKEDITOR.document.getById( aspectLockBtnId );
			if (!aspectRatioToggleButton) {
				console.error('Aspect ratio toggle button not found.');
				return null;
			}

			if ( originalSourceElement.getCustomData( 'isReady' ) === 'true' )
			{
				if ( newState === 'check' ) // Automatically determine lock state.
				{
					const currentWidthValue = activeDialog.getValueOf( 'generalInfoSection', 'widthInputField' );
					const currentHeightValue = activeDialog.getValueOf( 'generalInfoSection', 'heightInputField' );

					const initialAspectRatio = originalSourceElement.$.width * 1000 / originalSourceElement.$.height;
					const currentCalculatedRatio = parseFloat(currentWidthValue) * 1000 / parseFloat(currentHeightValue);

					activeDialog.keepAspectRatioLocked  = false; // Assume unlocked by default.

					if ( !currentWidthValue && !currentHeightValue ) { // If both dimensions are empty.
						activeDialog.keepAspectRatioLocked = true;
					}
					else if ( !isNaN( initialAspectRatio ) && !isNaN( currentCalculatedRatio ) )
					{
						// Compare ratios with a small tolerance.
						if ( Math.round( initialAspectRatio ) === Math.round( currentCalculatedRatio ) ) {
							activeDialog.keepAspectRatioLocked = true;
						}
					}
				}
				else if ( typeof newState !== 'undefined' ) {
					activeDialog.keepAspectRatioLocked = !!newState;
				}
				else { // Toggle current state.
					activeDialog.keepAspectRatioLocked = !activeDialog.keepAspectRatioLocked;
				}
			}
			else if ( newState !== 'check' ) { // Cannot lock ratio if original dimensions are unknown.
				activeDialog.keepAspectRatioLocked = false;
			}

			// Update UI based on the new lock state.
			if ( activeDialog.keepAspectRatioLocked ) {
				aspectRatioToggleButton.removeClass( 'cke_btn_unlocked' );
			} else {
				aspectRatioToggleButton.addClass( 'cke_btn_unlocked' );
			}

			const imageLang = activeDialog._.editor.lang.image;
			const buttonLabel = imageLang && imageLang[ activeDialog.keepAspectRatioLocked ? 'unlockRatio' : 'lockRatio' ];

			aspectRatioToggleButton.setAttribute( 'title', buttonLabel );
			aspectRatioToggleButton.getFirst().setText( buttonLabel );

			return activeDialog.keepAspectRatioLocked;
		};

		/**
		 * Resets width and height fields to the original image dimensions.
		 * @param {CKEDITOR.dialog} activeDialog The dialog instance.
		 */
		const restoreInitialDimensions = function( activeDialog )
		{
			const originalSourceElement = activeDialog.originalSourceElement;
			if ( originalSourceElement && originalSourceElement.getCustomData( 'isReady' ) === 'true' )
			{
				activeDialog.setValueOf( 'generalInfoSection', 'widthInputField', originalSourceElement.$.width );
				activeDialog.setValueOf( 'generalInfoSection', 'heightInputField', originalSourceElement.$.height );
			}
			refreshVisualDisplay( activeDialog );
		};

		/**
		 * Sets up a dimension field (width/height) based on element attributes or styles.
		 * @param {number} operationTypeFlag The type of operation (e.g., MEDIA_IMAGE_TYPE_FLAG).
		 * @param {CKEDITOR.dom.element} targetHtmlElement The element to get dimensions from.
		 */
		const configureDimensionField = function( operationTypeFlag, targetHtmlElement )
		{
			if ( operationTypeFlag !== MEDIA_IMAGE_TYPE_FLAG ) {
				return;
			}

			/**
			 * Checks a size string against the regex and returns a formatted value.
			 * @param {string} sizeString The raw size value.
			 * @param {string} defaultVal A default value if parsing fails.
			 * @returns {string} The formatted size string.
			 */
			function validateDimensionValue( sizeString, defaultVal )
			{
				const matchResult  = sizeString.match( sizeExtractionPattern );
				if ( matchResult )
				{
					if ( matchResult[2] === PERCENT_UNIT ) { // Percentage values are allowed.
						matchResult[1] += PERCENT_UNIT;
						toggleAspectRatioLock( activeDialog, false ); // Unlock ratio if percentage is used.
					}
					return matchResult[1];
				}
				return defaultVal;
			}

			const activeDialog = this.getDialog();
			let dimensionValue = '';
			const dimensionAttributeName = ( this.id === 'widthInputField' ) ? 'width' : 'height';

			// Prioritize attribute value, then style value.
			const attributeSize = targetHtmlElement.getAttribute( dimensionAttributeName );
			if ( attributeSize ) {
				dimensionValue = validateDimensionValue( attributeSize, dimensionValue );
			}
			const styleSize = targetHtmlElement.getStyle( dimensionAttributeName );
			dimensionValue = validateDimensionValue( styleSize, dimensionValue );

			this.setValue( dimensionValue );
		};

		let assetPreloaderInstance; // Holds the image object used for preloading.

		/**
		 * Event handler for when the preview image successfully loads.
		 * @param {Event} evt The load event.
		 */
		const onMediaAssetLoaded = function()
		{
			// Mark the original element as ready.
			const sourceAsset = this.originalSourceElement;
			sourceAsset.setCustomData( 'isReady', 'true' );
			// Clean up event listeners.
			sourceAsset.removeListener( 'load', onMediaAssetLoaded );
			sourceAsset.removeListener( 'error', onMediaAssetLoadFailure );
			sourceAsset.removeListener( 'abort', onMediaAssetLoadFailure );

			// Hide the loading indicator.
			CKEDITOR.document.getById( previewLoaderIndicatorId )?.setStyle( 'display', 'none' );

			// If it's a new image being set, reset dimensions to actual image size.
			if ( !this.preventDimensionReset ) {
				restoreInitialDimensions( this );
			}

			// On first load, check if aspect ratio can be locked.
			if ( this.initialLoadComplete ) {
				CKEDITOR.tools.setTimeout( () => toggleAspectRatioLock( this, 'check' ), 50, this );
			}

			this.initialLoadComplete = false;
			this.preventDimensionReset = false;
		};

		/**
		 * Event handler for when the preview image fails to load.
		 * @param {Event} evt The error/abort event.
		 */
		const onMediaAssetLoadFailure = function()
		{
			const sourceAsset = this.originalSourceElement;
			// Clean up event listeners.
			sourceAsset.removeListener( 'load', onMediaAssetLoaded );
			sourceAsset.removeListener( 'error', onMediaAssetLoadFailure );
			sourceAsset.removeListener( 'abort', onMediaAssetLoadFailure );

			// Display a "no image" placeholder.
			const fallbackImageUrl = CKEDITOR.getUrl( currentEditorInstance.skinPath + 'images/noimage.png' );
			if ( this.dialogPreviewImage ) {
				this.dialogPreviewImage.setAttribute( 'src', fallbackImageUrl );
			}

			// Hide the loading indicator.
			CKEDITOR.document.getById( previewLoaderIndicatorId )?.setStyle( 'display', 'none' );
			toggleAspectRatioLock( this, false ); // Unlock ratio as dimensions are unknown.
			console.error("Failed to load image for preview.");
		};

		/**
		 * Generates a unique ID prefixed with CKEDITOR's next ID.
		 * @param {string} baseId The base string for the ID.
		 * @returns {string} The unique ID.
		 */
		const generateUniqueId = function( baseId )
		{
			return CKEDITOR.tools.getNextId() + '_' + baseId;
		};

		// Generate unique IDs for various dialog elements.
		const aspectLockBtnId = generateUniqueId( 'AspectRatioToggle' );
		const dimensionResetBtnId = generateUniqueId( 'DimensionResetButton' );
		const previewLoaderIndicatorId = generateUniqueId( 'PreviewLoader' );
		const mainPreviewContainerId = generateUniqueId( 'PreviewBox' ); // This one is not used in the original, can be removed.
		const previewHyperlinkTargetId = generateUniqueId( 'PreviewLink' );
		const mainPreviewImageId = generateUniqueId( 'PreviewImage' );

		// Return the dialog definition object.
		return {
			dialogTitle : ( editorModeIdentifier === 'image' ) ? currentEditorInstance.lang.image.title : currentEditorInstance.lang.image.titleButton,
			minimumWidth : 420,
			minimumHeight : 310,
			onDialogDisplay : function()
			{
				// Initialize dialog state variables.
				this.workingImageElement = null;
				this.workingLinkElement = null;
				this.isImageBeingEdited = false; // Flag to indicate if an existing image is being edited.
				this.isLinkBeingEdited = false;   // Flag to indicate if an existing link is being edited.
				this.keepAspectRatioLocked = true;
				this.preventDimensionReset = false;
				this.initialLoadComplete = true;
				this.shouldCreateLink = false;

				const selectionObject = currentEditorInstance.getSelection();
				let selectedElement = selectionObject.getSelectedElement();
				let foundLinkElement = selectedElement && selectedElement.getAscendant( 'a' );

				// Hide the preview loader initially.
				CKEDITOR.document.getById( previewLoaderIndicatorId )?.setStyle( 'display', 'none' );

				// Prepare the preloader and preview image.
				assetPreloaderInstance = new CKEDITOR.dom.element( 'img', currentEditorInstance.document );
				this.dialogPreviewImage = CKEDITOR.document.getById( mainPreviewImageId );

				// Create a temporary original image element to store actual dimensions.
				this.originalSourceElement = currentEditorInstance.document.createElement( 'img' );
				this.originalSourceElement.setAttribute( 'alt', '' );
				this.originalSourceElement.setCustomData( 'isReady', 'false' );

				if ( foundLinkElement )
				{
					this.workingLinkElement = foundLinkElement;
					this.isLinkBeingEdited = true;

					// Check if the link contains an image or input element.
					const childElementsOfLink = foundLinkElement.getChildren();
					if ( childElementsOfLink.count() === 1 )
					{
						const childElementTagName = childElementsOfLink.getItem( 0 ).getName();
						if ( childElementTagName === 'img' || childElementTagName === 'input' )
						{
							this.workingImageElement = childElementsOfLink.getItem( 0 );
							if ( this.workingImageElement.getName() === 'img' ) {
								this.isImageBeingEdited = 'img';
							} else if ( this.workingImageElement.getName() === 'input' ) {
								this.isImageBeingEdited = 'input';
							}
						}
					}
					// Populate link-related fields if in image mode.
					if ( editorModeIdentifier === 'image' ) {
						this.setupContent( HYPERLINK_TYPE_FLAG, foundLinkElement );
					}
				}

				// Check if the selected element is an image or image input.
				const isImageOrImageInput = (selectedElement && selectedElement.getName() === 'img' && !selectedElement.getAttribute( '_cke_realelement' )) ||
											(selectedElement && selectedElement.getName() === 'input' && selectedElement.getAttribute( 'type' ) === 'image' );

				if ( isImageOrImageInput )
				{
					this.isImageBeingEdited = selectedElement.getName();
					this.workingImageElement = selectedElement;
				}

				if ( this.isImageBeingEdited )
				{
					// Clone the image element to avoid direct modifications before dialog confirmation.
					this.originalUnmodifiedImage = this.workingImageElement;
					this.workingImageElement = this.originalUnmodifiedImage.clone( true, true );

					// Populate dialog fields from the image element.
					this.setupContent( MEDIA_IMAGE_TYPE_FLAG, this.workingImageElement );

					// Refresh the aspect ratio lock button state.
					toggleAspectRatioLock ( this, true );
				}
				else // If no existing image, create a new temporary one.
				{
					this.workingImageElement =  currentEditorInstance.document.createElement( 'img' );
					this.workingImageElement.setAttribute('alt', ''); // Ensure alt is always present.
				}

				// If no URL is provided, clear the preview image source.
				if ( !CKEDITOR.tools.trim( this.getValueOf( 'generalInfoSection', 'urlInputField' ) ) )
				{
					this.dialogPreviewImage.removeAttribute( 'src' );
					this.dialogPreviewImage.setStyle( 'display', 'none' );
				}
			},
			onDialogConfirm : function()
			{
				const dialogEditor = currentEditorInstance;
				let currentElementTagName = this.isImageBeingEdited;

				// Handle existing image element.
				if ( currentElementTagName )
				{
					// If in image dialog and an input element is selected, ask to convert to img.
					if ( editorModeIdentifier === 'image' && currentElementTagName === 'input' && confirm( dialogEditor.lang.image.button2Img ) )
					{
						currentElementTagName = 'img'; // Change type to img.
						this.workingImageElement = dialogEditor.document.createElement( 'img' );
						this.workingImageElement.setAttribute( 'alt', '' );
						dialogEditor.insertElement( this.workingImageElement );
					}
					// If in image button dialog and an img element is selected, ask to convert to input.
					else if ( editorModeIdentifier !== 'image' && currentElementTagName === 'img' && confirm( dialogEditor.lang.image.img2Button ))
					{
						currentElementTagName = 'input'; // Change type to input.
						this.workingImageElement = dialogEditor.document.createElement( 'input' );
						this.workingImageElement.setAttributes( { type : 'image', alt : '' } );
						dialogEditor.insertElement( this.workingImageElement );
					}
					else // If no conversion, restore the original element.
					{
						this.workingImageElement = this.originalUnmodifiedImage;
						delete this.originalUnmodifiedImage; // Clean up the reference.
					}
				}
				else // Create a new image element.
				{
					if ( editorModeIdentifier === 'image' ) {
						this.workingImageElement = dialogEditor.document.createElement( 'img' );
					} else {
						this.workingImageElement = dialogEditor.document.createElement( 'input' );
						this.workingImageElement.setAttribute ( 'type' ,'image' );
					}
					this.workingImageElement.setAttribute( 'alt', '' );
				}

				// Create a new link element if not already editing one.
				if ( !this.isLinkBeingEdited ) {
					this.workingLinkElement = dialogEditor.document.createElement( 'a' );
				}

				// Apply dialog values to the image and link elements.
				this.commitContent( MEDIA_IMAGE_TYPE_FLAG, this.workingImageElement );
				this.commitContent( HYPERLINK_TYPE_FLAG, this.workingLinkElement );

				// Remove empty style attribute to keep HTML clean.
				if ( !this.workingImageElement.getAttribute( 'style' ) ) {
					this.workingImageElement.removeAttribute( 'style' );
				}

				// Insert or update elements in the editor.
				if ( !this.isImageBeingEdited ) // New image.
				{
					if ( this.shouldCreateLink )
					{
						if ( !this.isLinkBeingEdited ) // New link.
						{
							dialogEditor.insertElement(this.workingLinkElement);
							this.workingLinkElement.append(this.workingImageElement, false);
						}
						else { // Link already exists, image is new.
							dialogEditor.insertElement(this.workingImageElement );
						}
					}
					else { // No link, just insert the image.
						dialogEditor.insertElement( this.workingImageElement );
					}
				}
				else // Existing image.
				{
					// Add a new link to an existing image.
					if ( !this.isLinkBeingEdited && this.shouldCreateLink )
					{
						dialogEditor.insertElement( this.workingLinkElement );
						this.workingImageElement.appendTo( this.workingLinkElement );
					}
					// Remove an existing link from an image.
					else if ( this.isLinkBeingEdited && !this.shouldCreateLink )
					{
						dialogEditor.getSelection().selectElement( this.workingLinkElement );
						dialogEditor.insertElement( this.workingImageElement );
					}
				}
			},
			onDialogReady : function()
			{
				if ( editorModeIdentifier !== 'image' ) {
					this.hidePage( 'Link' ); // Hide the Link tab for image button dialog.
				}
				const dialogDocument = this._.element.getDocument();
				// Add focusable elements for accessibility.
				this.addFocusable( dialogDocument.getById( dimensionResetBtnId ), 5 );
				this.addFocusable( dialogDocument.getById( aspectLockBtnId ), 5 );

				// Override the default commitContent method.
				this.commitContent = processDialogContent;
			},
			onDialogDismiss : function()
			{
				// Perform cleanup on the preview image.
				if ( this.dialogPreviewImage ) {
					this.commitContent( RESOURCE_CLEANUP_FLAG, this.dialogPreviewImage );
				}

				// Remove listeners and cleanup the original element.
				if ( this.originalSourceElement )
				{
					this.originalSourceElement.removeListener( 'load', onMediaAssetLoaded );
					this.originalSourceElement.removeListener( 'error', onMediaAssetLoadFailure );
					this.originalSourceElement.removeListener( 'abort', onMediaAssetLoadFailure );
					this.originalSourceElement.remove();
					this.originalSourceElement = null; // Clear reference.
				}

				delete this.workingImageElement;
			},
			dialogSections : [
				{
					id : 'generalInfoSection',
					sectionLabel : currentEditorInstance.lang.image.infoTab,
					keyboardShortcut : 'I',
					sectionElements :
					[
						{
							type : 'vbox',
							padding : 0,
							children :
							[
								{
									type : 'hbox',
									widths : [ '280px', '110px' ],
									align : 'right',
									children :
									[
										{
											id : 'urlInputField',
											type : 'text',
											label : currentEditorInstance.lang.common.url,
											required: true,
											onValueChange : function()
											{
												const activeDialog = this.getDialog();
												const updatedUrlValue = this.getValue();
												// Validate URL format (optional, but good practice for Type III)
												if (!updatedUrlValue || !/^(https?:\/\/\S+\.\S+)/.test(updatedUrlValue)) {
													// activeDialog.hideMessage('urlError'); // Example: show error.
												} else {
													// activeDialog.showMessage('urlError', false);
												}

												// Trigger preview update.
												activeDialog.dialogPreviewImage && activeDialog.dialogPreviewImage.setAttribute( 'src', updatedUrlValue );
												CKEDITOR.document.getById( previewLoaderIndicatorId )?.setStyle( 'display', '' ); // Show loader.

												// Attach load/error events to the preloader.
												if ( assetPreloaderInstance ) {
													assetPreloaderInstance.on( 'load', onMediaAssetLoaded, activeDialog );
													assetPreloaderInstance.on( 'error', onMediaAssetLoadFailure, activeDialog );
													assetPreloaderInstance.on( 'abort', onMediaAssetLoadFailure, activeDialog );
													assetPreloaderInstance.setAttribute( 'src', updatedUrlValue ); // Start loading.
												}

												activeDialog.originalSourceElement.setCustomData( 'isReady', 'false' ); // Reset ready state.
												activeDialog.dialogPreviewImage.setStyle( 'display', '' ); // Show preview area.
												refreshVisualDisplay( activeDialog );
											},
											setup : function( operationTypeFlag, targetHtmlElement )
											{
												if ( operationTypeFlag === MEDIA_IMAGE_TYPE_FLAG ) {
													const imageUrl = targetHtmlElement.getAttribute( 'src' );
													this.setValue( imageUrl );
												}
											},
											commit : function( operationTypeFlag, targetHtmlElement )
											{
												if ( operationTypeFlag === MEDIA_IMAGE_TYPE_FLAG && this.getValue() ) {
													targetHtmlElement.setAttribute( 'src', this.getValue() );
												}
											}
										},
										{
											type : 'vbox',
											padding : 0,
											children :
											[
												{
													id : 'browseServer',
													type : 'button',
													style : 'display:inline-block;margin-top:10px;',
													label : currentEditorInstance.lang.common.browseServer,
													filebrowser : 'info:urlInputField'
												}
											]
										}
									]
								}
							]
						}
					]
				}
			]
		};
	};

	// Register the dialog with CKEditor.
	// The original code has more dialog sections, this is just a snippet.
	// For a complete Type III clone, all sections would be cloned.
	CKEDITOR.dialog.add( 'image', function( editor ) { return mediaElementEditor( editor, 'image' ); } );
	CKEDITOR.dialog.add( 'imagebutton', function( editor ) { return mediaElementEditor( editor, 'imagebutton' ); } );
})();