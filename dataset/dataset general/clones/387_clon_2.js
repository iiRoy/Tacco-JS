/*
 * MapRenderer.Visuals
 * @author Alistair B. Thompson, http://web-dev-pro.com, 2023
 * @license Apache-2.0
 */
( function( globalScope, pageDoc, undefVal )
{
	if ( !globalScope.MappingLib || !MappingLib.GeographicData )
	{
		// Geographic mapping library or its core data component not found; abort initialization.
		return ;
	}

	MappingLib.GeographicData.StyleApplier = MappingLib.GeographicData.deriveClass( {
		setup: function( geoData, config )
		{
			// Prepare configuration by merging user-provided options with internal defaults.
			var processedConfig = MappingLib.mergeObjects( {}, config, {
				forEveryShape: function( geoData, displayShape )
				{
					// If a custom callback for each shape was provided, execute it first.
					if ( config && config.forEveryShape )
					{
						config.forEveryShape( geoData, displayShape );
					}

					var visualProps = geoData.visuals, // Extract visual styling properties from the geographic data.
						popupPattern = geoData.displayPattern; // Obtain the string template for any associated popup.

					if ( visualProps ) // Check if there are any visual properties defined for this feature.
					{
						if ( displayShape instanceof MappingLib.PointMarker ) // Determine if the current display element is a marker.
						{
							if ( visualProps.visualIcon ) // If a specific icon is defined in the visual properties.
							{
								displayShape.setGraphic( MappingLib.getIcon( visualProps.visualIcon ) ); // Apply the custom icon to the marker.
							}
						}
						else
						{
							displayShape.applyVisuals( visualProps ); // For other types of shapes (polygons, lines), apply general styling.
						}
					}

					// If a popup template and data attributes are available, create and attach a popup.
					if ( popupPattern && geoData.attributes )
					{
						displayShape.attachOverlay( MappingLib.Toolkit.formatString( popupPattern, geoData.attributes ) ); // Bind a popup, formatting its content with the feature's attributes.
					}
				}
			} ) ;

			MappingLib.configureInstance( this, processedConfig ); // Apply the finalized configuration to this instance.

			this._shapeCollection = {}; // Initialize an internal collection to store managed map shapes.

			if ( geoData )
			{
				this.insertData( geoData ); // If initial geographic data is provided, add it to the collection.
			}
		}
	} );

	// Provide a convenient factory function for creating new instances of the StyleApplier.
	MappingLib.dataMapper.styled = function( geoData, config )
	{
		return new MappingLib.GeographicData.StyleApplier( geoData, config ) ;
	};
} )( window, document ) ;