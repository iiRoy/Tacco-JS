/*
 * Presentation content scanning utility for HTML presentation frameworks (e.g., based on jQuery).
 * @author A. Developer, https://github.com/adeveloper
 */
( function( jq, presenter ) {
	let docElem = jq( document );
	let displayPanel;

	/*
	 * Future enhancements:
	 *  - Move inline styling to dedicated stylesheets.
	 *  - Simplify logic and structure for better clarity.
	 */

	let finderOptions = 'finder';

	/*
	 * Default configuration for the content finder module.
	 */
	let configDefaults = {
		pageHeaderSelectors: 'section h1, section h2, section h3, section h4',
		enableNavigation: true,
		panel : {
			attachTo: 'body',
			panelId: 'slide_finder_panel',
			baseStyle: {
				position: 'fixed',
				top: '0',
				left: '0',
				background: 'none',
				border: 'none',
				padding: '0.6em',
				'font-size': '13pt',
				'z-index': '15',
				overflow: 'auto'
			},
			resultsDisplayStyle : {
				background: '#fff',
				border: '1px solid #999',
				'border-left': 'none',
				'border-top': 'none'
			}
		},
		tip: {
			display: true,
			tipId: 'slide_finder_tip',
			message: "(Press 'S' to begin searching)",
			tipStyle: {
				'font-style': 'italic',
				color: '#111',
				background: '#fff',
				opacity: '0.6',
				padding: '0.3em'
			}
		},
		queryField : {
			fieldId: 'slide_finder_query',
			idleStyle: {
				outline: 'none',
				width: '3.5em'
			},
			activeStyle: {
				outline: 'none',
				width: 'auto'
			}
		},
		output : {
			outputId: 'slide_finder_results',
			itemClass: 'foundItem',
			matchCountStyle: 'font-style: italic; font-size: 85%; color: #777;'
		},
		keyBindings : {
			activateFinder: 83, // 's' key
			deactivateFinder : 27, // 'esc' key
			jumpToResult : 13 // 'enter' key
		}
	};
	// Expose content finder configuration within the presentation framework's global defaults
	jq[ presenter ].config[ finderOptions ] = {};
	jq.extend( true, jq[ presenter ].config[ finderOptions ], configDefaults );

	/*
	 * Removes the content finder interface from the display.
	 */
	function clearFinderDisplay() {
		docElem.off( '.presentationscanner' );
		if ( displayPanel ) {
			displayPanel.remove();
		}
		jq( '#' + configDefaults.panel.panelId ).remove();
	}


	/*
	 * Displays and initializes the content finder interface.
	 */
	function initiateFinder( userOptions ) {
		let tipElement, queryElement, resultsElement;

		let currentConfig = jq.extend( true, jq[ presenter ].config[ finderOptions ], userOptions );

		/*
		 * Ensure no prior instances are active and re-initialize if necessary.
		 */
		clearFinderDisplay();


		/*
		 * Initialize the main container panel.
		 */
		displayPanel = jq( '<div id="' + currentConfig.panel.panelId + '" />' )
			.css( currentConfig.panel.baseStyle )
			.on( 'focusin', function() {
				if ( tipElement ) {
					tipElement.remove();
					tipElement = null;
				}
				queryElement.css( currentConfig.queryField.activeStyle );
			})
			.on( 'focusout', function() {
				queryElement.removeAttr( 'placeholder' );
				if ( !resultsElement.html() ) {
					queryElement.css( currentConfig.queryField.idleStyle );
					displayPanel.css( currentConfig.panel.baseStyle );
				}
			});


		/*
		 * Add a helpful tip message.
		 */
		if ( currentConfig.tip.display ) {
			tipElement = jq( '<div id="' + currentConfig.tip.tipId + '">' + currentConfig.tip.message + '</div>' )
				.css( currentConfig.tip.tipStyle )
				.appendTo( displayPanel );
		}


		/*
		 * Initialize the search input field.
		 */
		queryElement = jq( '<input id="' + currentConfig.queryField.fieldId + '" type="search" results="5" autocomplete="on" placeholder="Locate content..." />' )
			.css( currentConfig.queryField.idleStyle )
			/*
			 * Handle user input events for the search box.
			 */
			.on( 'keyup keydown keypress', function( evt ) {
				/*
				 * Prevent event propagation from the search box to avoid interfering with regular presentation navigation.
				 */
				evt.stopPropagation();

				/*
				 * Process only on keyup events for search logic.
				 */
				if ( evt.type !== 'keyup' ) {
					return;
				}

				/*
				 * Execute search and display results.
				 */
				let queryText = jq( this ).val();
				let resultLinks = [];
				if ( queryText.length ) {
					let searchPattern = new RegExp( queryText, 'img' );
					jq( '.presentation-page' ).each( function( idx, node ) {
						let pageElement = jq( this );
						let matches = pageElement.text().match( searchPattern );
						if ( matches || idx === parseInt( queryText, 10 ) ) {
							let pageTitle = "", matchDetails = "", itemStyle = "";

							let parentPage = pageElement.parent().closest( '.presentation-page' );

							if ( !parentPage.length ) {
								itemStyle = 'margin: 0.7em 0 0;'
								// Display title for top-level pages
								pageTitle = pageElement.children( currentConfig.pageHeaderSelectors ).first().text();
								if ( pageTitle.length > 28 ) {
									pageTitle = pageTitle.substring( 0, 25 ) + "...";
								}
							} else {
								// Indent for nested pages in the results list
								itemStyle += 'margin: 0 0 0 0.8em;';
							}

							if ( matches ) {
								matchDetails = [ '(', matches.length, ' match', ( matches.length > 1 ? 'es' : '' ), ')' ].join( '' );
							} else {
								matchDetails = '(page #' + idx + ')';
							}

							resultLinks.push( [
								'<div class="', currentConfig.output.itemClass, '" style="', itemStyle ,'">',
									'<a id="found_item_', idx , '" href="#', this.id ,'"><span style="font-weight: bold;">', pageTitle, '</span>', ( pageTitle ? '<br>' : '' ), '#', this.id , '</a> ',
									'<span style="', currentConfig.output.matchCountStyle,'">', matchDetails, '</span>',
								'</div>'
								].join( '' )
							);
						}
					});

					if ( !resultLinks.length ) {
						resultLinks.push( '(no items found)' );
					}
				}
				let outputContent = resultLinks.join( '' );
				displayPanel.css( outputContent ? currentConfig.panel.resultsDisplayStyle : currentConfig.panel.baseStyle );
				displayPanel.css( { 'max-height': jq( window ).height() } );

				resultsElement.html( outputContent );


				/*
				 * Navigate to the first search result. (Default = ENTER)
				 */
				let keyCodeVal = evt.keyCode || evt.which;
				if ( keyCodeVal === currentConfig.keyBindings.jumpToResult ) {
					resultsElement.find( 'a:first' ).trigger( 'click' );
				}

				/*
				 * Deactivate the search field to resume normal keyboard navigation. (Default = ESC)
				 */
				else if ( keyCodeVal === currentConfig.keyBindings.deactivateFinder ) {
					jq( this ).blur();
				}
			})
			/*
			 * Clear results when the "empty input" icon in search field is clicked.
			 */
			.on( 'click', function() {
				if ( !jq( this ).val().length ) {
					resultsElement.empty();
				}
			})
			.appendTo( displayPanel );


		/*
		 * Set focus on the search field. (Default = 's')
		 */
		docElem.on( 'keyup.presentationscanner', function( evt ) {
			let keyCodeVal = evt.keyCode || evt.which;
			if ( keyCodeVal === currentConfig.keyBindings.activateFinder ) {
				queryElement.removeAttr( 'placeholder' );
				queryElement.focus();
			}
		})
		/*
		 * Clear search results if a click occurs outside the search container.
		 */
		.on( 'click', function( evt ) {
			if ( !jq( evt.target ).closest( '#' + currentConfig.panel.panelId ).length ) {
				queryElement.val( '' ).trigger( 'click' );
				displayPanel.trigger( 'focusout' );
			}
		});


		/*
		 * Initialize the results display area.
		 */
		resultsElement = jq( '<div id="' + currentConfig.output.outputId + '" />' )
			.on( 'click', 'a', function() {
				if ( currentConfig.enableNavigation ) {
					// Navigate the presentation when clicking a result link using the framework's 'navigate' function.
					// This approach helps maintain presentation state more reliably in some setups.
					let index = this.id.match( /\d*$/ )[ 0 ];
					jq[ presenter ]( 'navigate', parseInt( index, 10 ) );
					return false;
				}
			})
			.on( 'keyup keydown keypress', 'a', function( evt ) {
				let keyCodeVal = evt.keyCode || evt.which;
				if ( keyCodeVal && keyCodeVal != 13 && keyCodeVal != 32 ) {
					// If a key other than ENTER or SPACE is pressed, allow normal processing.
					return;
				}

				// Prevent event propagation from results to avoid conflicts with presentation navigation.
				evt.stopPropagation();

				// Act only on keyup events.
				if ( evt.type !== 'keyup' ) {
					return;
				}

				// Simulate a click on keyup. This might not work universally without 'enableNavigation'.
				// For a more robust solution without 'navigate', one might simulate a real mouse click.
				jq( this ).trigger( 'click' );
				return false;
			})
			/*
			 * Hide results if ESC is pressed while results are focused.
			 */
			.on( 'keyup', function( evt ) {
				let keyCodeVal = evt.keyCode || evt.which;
				if ( keyCodeVal === currentConfig.keyBindings.deactivateFinder ) {
					queryElement.val( '' ).trigger( 'click' );
					displayPanel.trigger( 'focusout' );
				}
			})
			.appendTo( displayPanel );

		/*
		 * Adjust scrollbar visibility if window is resized.
		 */
		jq( window ).on( 'resize', function() {
			displayPanel.css( { 'max-height': jq( window ).height() } );
		});

		/*
		 * Add the content finder panel to the document.
		 */
		displayPanel.appendTo( currentConfig.panel.attachTo );
	}


	/*
	 * Extend the presentation framework with finder functionalities.
	 */
	jq[ presenter ]( 'extendModule', 'initiateFinder', initiateFinder );
	jq[ presenter ]( 'extendModule', 'clearFinderDisplay', clearFinderDisplay );

	/*
	 * Initialize the content finder on presentation initialization by default.
	 */
	docElem.on( 'presentation.initialize', initiateFinder );

	jq( function() {
		// Inherit the font-family from the first presentation page for visual consistency.
		jq.extend( true, jq.presentation.config.finder.panel.baseStyle, { 'font-family' : jq( '.presentation-page:first' ).css( 'font-family' ) } );
	});

})( jQuery, 'presentation' );