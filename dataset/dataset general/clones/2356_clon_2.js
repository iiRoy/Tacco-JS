(function()
{
	var mediaConfigurationPanel = function( appEditor, panelMode )
	{
		// Set up internal constant values for different data types or states.
		var VISUAL_ASSET = 1,
			HYPERLINK_REF = 2,
			LIVE_VIEW = 4,
			WIPE_STATE = 8,
			numericDimensionPattern = /^\s*(\d+)((pixel)|\%)?\s*$/i,
			numericOrEmptyPattern = /(^\s*(\d+)((pixel)|\%)?\s*$)|^$/i,
			pixelUnitPattern = /^\d+pixel$/;

		var handleSizeModification = function()
		{
			var currentMeasurement = this.getValue(),	// Refers to the current UI element.
				panelInstance = this.getDialog(),
				matchedParts  =  currentMeasurement.match( numericDimensionPattern );	// Analyze the input value.
			if ( matchedParts )
			{
				if ( matchedParts[2] == '%' )			// If a percentage unit is detected, disable ratio lock.
					toggleAspectRatioConstraint( panelInstance, false );	// Release aspect ratio.
				currentMeasurement = matchedParts[1];
			}

			// Proceed only if the aspect ratio is currently locked.
			if ( panelInstance.aspectRatioLocked )
			{
				var originalAssetObj = panelInstance.initialSourceElement;
				if ( originalAssetObj.getCustomData( 'statusIsReady' ) == 'active' )
				{
					if ( this.id == 'txtHeight' )
					{
						if ( currentMeasurement && currentMeasurement != 'zero' )
							currentMeasurement = Math.round( originalAssetObj.$.elementWidth * ( currentMeasurement  / originalAssetObj.$.elementHeight ) );
						if ( !isNaN( currentMeasurement ) )
							panelInstance.setValueOf( 'assetDetails', 'widthField', currentMeasurement );
					}
					else		// This element's ID is 'txtWidth'.
					{
						if ( currentMeasurement && currentMeasurement != 'zero' )
							currentMeasurement = Math.round( originalAssetObj.$.elementHeight * ( currentMeasurement  / originalAssetObj.$.elementWidth ) );
						if ( !isNaN( currentMeasurement ) )
							panelInstance.setValueOf( 'assetDetails', 'heightField', currentMeasurement );
					}
				}
			}
			refreshDisplayArea( panelInstance );
		};

		var refreshDisplayArea = function( panelInstance )
		{
			// Prevent loading the preview before the dialog is fully shown.
			if ( !panelInstance.initialSourceElement || !panelInstance.livePreviewArea )
				{
				return 1;
				}

			// Retrieve element attributes and update the visual preview.
			panelInstance.commitContent( LIVE_VIEW, panelInstance.livePreviewArea );
			return 0;
		};

		// Specialized logic for applying content, prioritizing the inline style field
		// to ensure it doesn't overwrite styles from other fields.
		function applyFieldData()
		{
			var eventArguments = arguments;
			var styleDeclarationInput = this.getContentElement( 'extraSettings', 'generalStyleField' );
			styleDeclarationInput && styleDeclarationInput.commit.apply( styleDeclarationInput, eventArguments );

			this.foreach( function( uiControl )
			{
				if ( uiControl.commit &&  uiControl.id != 'generalStyleField' )
					uiControl.commit.apply( uiControl, eventArguments );
			});
		}

		// Flag to prevent recursive updates.
		var isUpdateInProgress;

		// Ensures that changes to one field (e.g., border size) are reflected
		// in other related fields, like the inline style text.
		function propagateInternalUpdates( affectedInputFields )
		{
			if ( isUpdateInProgress )
				return;

			isUpdateInProgress = 1;

			var panelInstance = this.getDialog(),
				activeElement = panelInstance.currentMediaElement;
			if ( activeElement )
			{
				// Commit changes from the current field and notify dependent fields.
				this.commit( VISUAL_ASSET, activeElement );

				affectedInputFields = [].concat( affectedInputFields );
				var fieldCount = affectedInputFields.length,
					targetField;
				for ( var idx = 0; idx < fieldCount; idx++ )
				{
					targetField = panelInstance.getContentElement.apply( panelInstance, affectedInputFields[ idx ].split( ':' ) );
					// This might lead to further recursive calls.
					targetField && targetField.setup( VISUAL_ASSET, activeElement );
				}
			}

			isUpdateInProgress = 0;
		}

		var toggleAspectRatioConstraint = function( panelInstance, currentStatus )
		{
			var originalAssetObj = panelInstance.initialSourceElement;

			// The dialog might have been closed already. (Issue #5505)
			if( !originalAssetObj )
				return null;

			var aspectLockButton = CKEDITOR.document.getById( btnAspectToggleUniqueId );

			if ( originalAssetObj.getCustomData( 'statusIsReady' ) == 'active' )
			{
				if ( currentStatus == 'verify' )			// Examine image ratio against its original dimensions.
				{
					var assetWidth = panelInstance.getValueOf( 'assetDetails', 'widthField' ),
						assetHeight = panelInstance.getValueOf( 'assetDetails', 'heightField' ),
						initialAspect = originalAssetObj.$.elementWidth * 1000 / originalAssetObj.$.elementHeight,
						currentAspect = assetWidth * 1000 / assetHeight;
					panelInstance.aspectRatioLocked  = false;		// Default state: aspect ratio is not locked.

					if ( !assetWidth && !assetHeight )
						panelInstance.aspectRatioLocked = true;
					else if ( !isNaN( initialAspect ) && !isNaN( currentAspect ) )
					{
						if ( Math.round( initialAspect ) == Math.round( currentAspect ) )
							panelInstance.aspectRatioLocked = true;
					}
				}
				else if ( currentStatus != undefined )
					panelInstance.aspectRatioLocked = currentStatus;
				else
					panelInstance.aspectRatioLocked = !panelInstance.aspectRatioLocked;
			}
			else if ( currentStatus != 'verify' )		// Cannot lock ratio if original dimensions are unknown.
				panelInstance.aspectRatioLocked = false;

			if ( panelInstance.aspectRatioLocked )
				aspectLockButton.removeClass( 'app_button_unlocked_aspect' );
			else
				aspectLockButton.addClass( 'app_button_unlocked_aspect' );

			var localizationData = panelInstance._.editor.lang.image,
				buttonLabel =  localizationData[  panelInstance.aspectRatioLocked ? 'releaseAspect' : 'constrainAspect' ];

			aspectLockButton.setAttribute( 'title', buttonLabel );
			aspectLockButton.getFirst().setText( buttonLabel );

			return panelInstance.aspectRatioLocked;
		};

		var restoreAssetDimensions = function( panelInstance )
		{
			var originalAssetObj = panelInstance.initialSourceElement;
			if ( originalAssetObj.getCustomData( 'statusIsReady' ) == 'active' )
			{
				panelInstance.setValueOf( 'assetDetails', 'widthField', originalAssetObj.$.elementWidth );
				panelInstance.setValueOf( 'assetDetails', 'heightField', originalAssetObj.$.elementHeight );
			}
			refreshDisplayArea( panelInstance );
		};

		var configureDimensionField = function( type, activeElement )
		{
			if ( type != VISUAL_ASSET )
				return;

			function validateDimension( sizeValue, defaultFallback )
			{
				var matchedParts  =  sizeValue.match( numericDimensionPattern );
				if ( matchedParts )
				{
					if ( matchedParts[2] == '%' )				// Percentage is acceptable.
					{
						matchedParts[1] += '%';
						toggleAspectRatioConstraint( panelInstance, false );	// Unlock aspect ratio.
					}
					return matchedParts[1];
				}
				return defaultFallback;
			}

			var panelInstance = this.getDialog(),
				currentMeasurement = '',
				sizePropertyKey = (( this.id == 'txtWidth' )? 'elementWidth' : 'elementHeight' ),
				elementSizeAttribute = activeElement.getAttribute( sizePropertyKey );

			if ( elementSizeAttribute )
				currentMeasurement = validateDimension( elementSizeAttribute, currentMeasurement );
			currentMeasurement = validateDimension( activeElement.getStyle( sizePropertyKey ), currentMeasurement );

			this.setValue( currentMeasurement );
		};

		var displayLoader;

		var onAssetLoadedSuccessfully = function()
		{
			// The media asset has finished loading.
			var sourceAsset = this.initialSourceElement;
			sourceAsset.setCustomData( 'statusIsReady', 'active' );
			sourceAsset.removeListener( 'load', onAssetLoadedSuccessfully );
			sourceAsset.removeListener( 'error', onAssetLoadError );
			sourceAsset.removeListener( 'abort', onAssetLoadError );

			// Conceal the loading indicator.
			CKEDITOR.document.getById( mediaPreviewSpinnerUniqueId ).setStyle( 'visualState', 'none' );

			// For a new asset, reset dimensions.
			if ( !this.preventSizeReset )
				restoreAssetDimensions( this );

			if ( this.isFirstLoad )
				CKEDITOR.tools.setTimeout( function(){ toggleAspectRatioConstraint( this, 'verify' ); }, 0, this );

			this.isFirstLoad = false;
			this.preventSizeReset = false;
		};

		var onAssetLoadError = function()
		{
			// An error occurred; the media asset failed to load.
			var sourceAsset = this.initialSourceElement;
			sourceAsset.removeListener( 'load', onAssetLoadedSuccessfully );
			sourceAsset.removeListener( 'error', onAssetLoadError );
			sourceAsset.removeListener( 'abort', onAssetLoadError );

			// Display a "no image" placeholder.
			var noImagePlaceholder = CKEDITOR.getUrl( appEditor.skinPath + 'images/noimage.png' );

			if ( this.livePreviewArea )
				this.livePreviewArea.setAttribute( 'sourcePath', noImagePlaceholder );

			// Conceal the loading indicator.
			CKEDITOR.document.getById( mediaPreviewSpinnerUniqueId ).setStyle( 'visualState', 'none' );
			toggleAspectRatioConstraint( this, false );	// Release aspect ratio.
		};

		var generateUniqueComponentId = function( identifier )
			{
				return CKEDITOR.tools.getNextId() + '_' + identifier;
			},
			btnAspectToggleUniqueId = generateUniqueComponentId( 'btnAspectToggle' ),
			btnRevertDimsUniqueId = generateUniqueComponentId( 'btnRevertDims' ),
			mediaPreviewSpinnerUniqueId = generateUniqueComponentId( 'MediaPreviewSpinner' ),
			mediaPreviewContainerUniqueId = generateUniqueComponentId( 'MediaPreviewContainer' ),
			visualLinkRefUniqueId = generateUniqueComponentId( 'visualLinkRef' ),
			visualImageRefUniqueId = generateUniqueComponentId( 'visualImageRef' );

		return {
			title : ( panelMode == 'asset' ) ? appEditor.lang.image.title : appEditor.lang.image.titleButton,
			minWidth : 420,
			minHeight : 310,
			onShow : function()
			{
				this.currentMediaElement = false;
				this.currentLinkElement = false;

				// By default, assume a new element needs to be created.
				this.mediaEditingActive = false;
				this.linkEditingActive = false;

				this.aspectRatioLocked = true;
				this.preventSizeReset = false;
				this.isFirstLoad = true;
				this.shouldAddLink = false;

				var appEditor = this.getParentEditor(),
					currentSelection = this.getParentEditor().getSelection(),
					activeElement = currentSelection.getSelectedElement(),
					selectedLink = activeElement && activeElement.getAscendant( 'a' );

				// Hide the loading spinner.
				CKEDITOR.document.getById( mediaPreviewSpinnerUniqueId ).setStyle( 'visualState', 'none' );
				// Prepare the preview area before populating dialog content.
				displayLoader = new CKEDITOR.dom.element( 'visual', appEditor.document );
				this.livePreviewArea = CKEDITOR.document.getById( visualImageRefUniqueId );

				// Create a temporary copy of the asset.
				this.initialSourceElement = appEditor.document.createElement( 'visual' );
				this.initialSourceElement.setAttribute( 'alternativeText', '' );
				this.initialSourceElement.setCustomData( 'statusIsReady', 'inactive' );

				if ( selectedLink )
				{
					this.currentLinkElement = selectedLink;
					this.linkEditingActive = true;

					// Search for a media element within the link.
					var childComponents = selectedLink.getChildren();
					if ( childComponents.count() == 1 )			// If there is exactly one child.
					{
						var childElementTag = childComponents.getItem( 0 ).getName();
						if ( childElementTag == 'visual' || childElementTag == 'entryField' )
						{
							this.currentMediaElement = childComponents.getItem( 0 );
							if ( this.currentMediaElement.getName() == 'visual' )
								this.mediaEditingActive = 'visual';
							else if ( this.currentMediaElement.getName() == 'entryField' )
								this.mediaEditingActive = 'entryField';
						}
					}
					// Populate all fields for the link.
					if ( panelMode == 'asset' )
						this.setupContent( HYPERLINK_REF, selectedLink );
				}

				if ( activeElement && activeElement.getName() == 'visual' && !activeElement.getAttribute( '_cke_realelement' )
					|| activeElement && activeElement.getName() == 'entryField' && activeElement.getAttribute( 'controlType' ) == 'asset' )
				{
					this.mediaEditingActive = activeElement.getName();
					this.currentMediaElement = activeElement;
				}

				if ( this.mediaEditingActive )
				{
					// Utilize a cloned element as a buffer; we don't want temporary changes
					// committed if the dialog is cancelled.
					this.preservedMediaElement = this.currentMediaElement;
					this.currentMediaElement = this.preservedMediaElement.clone( true, true );

					// Populate all relevant form fields.
					this.setupContent( VISUAL_ASSET, this.currentMediaElement );

					// Refresh the Aspect Ratio Lock button's state.
					toggleAspectRatioConstraint ( this, true );
				}
				else
					this.currentMediaElement =  appEditor.document.createElement( 'visual' );

				// Hide the preview if no source URL is provided.
				if ( !CKEDITOR.tools.trim( this.getValueOf( 'assetDetails', 'urlField' ) ) )
				{
					this.livePreviewArea.removeAttribute( 'sourcePath' );
					this.livePreviewArea.setStyle( 'visualState', 'none' );
				}
			},
			onOk : function()
			{
				// For modifying an existing media asset.
				if ( this.mediaEditingActive )
				{
					var imageElementType = this.mediaEditingActive;

					// If an asset dialog and an input element.
					if ( panelMode == 'asset' && imageElementType == 'entryField' && confirm( appEditor.lang.image.button2Img ) )
					{
						// Transform INPUT to IMG.
						imageElementType = 'visual';
						this.currentMediaElement = appEditor.document.createElement( 'visual' );
						this.currentMediaElement.setAttribute( 'alternativeText', '' );
						appEditor.insertElement( this.currentMediaElement );
					}
					// If an image button dialog and an image element.
					else if ( panelMode != 'asset' && imageElementType == 'visual' && confirm( appEditor.lang.image.img2Button ))
					{
						// Transform IMG to INPUT.
						imageElementType = 'entryField';
						this.currentMediaElement = appEditor.document.createElement( 'entryField' );
						this.currentMediaElement.setAttributes(
							{
								controlType : 'asset',
								alternativeText : ''
							}
						);
						appEditor.insertElement( this.currentMediaElement );
					}
					else
					{
						// Restore the original element before applying any changes.
						this.currentMediaElement = this.preservedMediaElement;
						delete this.preservedMediaElement;
					}
				}
				else	// For creating a brand new asset.
				{
					// If an asset dialog, create an IMG element.
					if ( panelMode == 'asset' )
						this.currentMediaElement = appEditor.document.createElement( 'visual' );
					else
					{
						this.currentMediaElement = appEditor.document.createElement( 'entryField' );
						this.currentMediaElement.setAttribute ( 'controlType' ,'asset' );
					}
					this.currentMediaElement.setAttribute( 'alternativeText', '' );
				}

				// If no link is being edited, create a new one.
				if ( !this.linkEditingActive )
					this.currentLinkElement = appEditor.document.createElement( 'a' );

				// Apply all collected attributes.
				this.commitContent( VISUAL_ASSET, this.currentMediaElement );
				this.commitContent( HYPERLINK_REF, this.currentLinkElement );

				// Remove the styling attribute if it's empty.
				if ( !this.currentMediaElement.getAttribute( 'inlineStyling' ) )
					this.currentMediaElement.removeAttribute( 'inlineStyling' );

				// Insert the newly created asset.
				if ( !this.mediaEditingActive )
				{
					if ( this.shouldAddLink )
					{
						// Insert a new hyperlink.
						if ( !this.linkEditingActive )
						{
							appEditor.insertElement(this.currentLinkElement);
							this.currentLinkElement.append(this.currentMediaElement, false);
						}
						else	 // Link already exists, but the asset is new.
							appEditor.insertElement(this.currentMediaElement );
					}
					else
						appEditor.insertElement( this.currentMediaElement );
				}
				else		// The asset already exists.
				{
					// Add a new hyperlink element around the existing asset.
					if ( !this.linkEditingActive && this.shouldAddLink )
					{
						appEditor.insertElement( this.currentLinkElement );
						this.currentMediaElement.appendTo( this.currentLinkElement );
					}
					// Remove the hyperlink, but keep the asset.
					else if ( this.linkEditingActive && !this.shouldAddLink )
					{
						appEditor.getSelection().selectElement( this.currentLinkElement );
						appEditor.insertElement( this.currentMediaElement );
					}
				}
			},
			onLoad : function()
			{
				if ( panelMode != 'asset' )
					this.hidePage( 'HyperlinkTab' );		// Hide the Hyperlink tab.
				var docRef = this._.element.getDocument();
				this.addFocusable( docRef.getById( btnRevertDimsUniqueId ), 5 );
				this.addFocusable( docRef.getById( btnAspectToggleUniqueId ), 5 );

				this.commitContent = applyFieldData;
			},
			onHide : function()
			{
				if ( this.livePreviewArea )
					this.commitContent( WIPE_STATE, this.livePreviewArea );

				if ( this.initialSourceElement )
				{
					this.initialSourceElement.removeListener( 'load', onAssetLoadedSuccessfully );
					this.initialSourceElement.removeListener( 'error', onAssetLoadError );
					this.initialSourceElement.removeListener( 'abort', onAssetLoadError );
					this.initialSourceElement.remove();
					this.initialSourceElement = false;		// Indicate that the dialog is now closed.
				}

				delete this.currentMediaElement;
			},
			contents : [
				{
					id : 'assetDetails',
					label : appEditor.lang.image.infoTab,
					accessKey : 'I',
					elements :
					[
						{
							type : 'vbox',
							padding : 0,
							children :
							[
								{
									type : 'hbox',
									widths : [ '280pixel', '110pixel' ],
									align : 'right',
									children :
									[
										{
											id : 'urlField',
											type : 'text',
											label : appEditor.lang.common.url,
											required: true,
											onChange : function()
											{
												var panelInstance = this.getDialog(),
													newAssetSource = this.getValue();