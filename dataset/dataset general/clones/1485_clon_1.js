/*
 * This is a Type I clone of the original JavaScript application code.
 * It maintains the exact same logical structure and functionality.
 * Only whitespace and comments have been altered significantly.
 * This file defines the core App functionality for a Chrome Extension.
 */

// Encapsulate the application within an Immediately Invoked Function Expression (IIFE)
// to prevent polluting the global scope and ensure 'window' context.
+function (window)
{

	// Enforce strict mode for cleaner, safer JavaScript code.
	'use strict'
	;


	// Define the application version. This constant remains unchanged.
	var VERSION	=	0.4
	;



	// The main application constructor function.
	// This function initializes the application state and sets up event listeners.
	var App	=	function	()
	{
		// Retrieve stored data from Chrome's local storage.
		// This callback function is bound to the 'this' context of the App instance.
		chrome.storage.local.get
		(
			{
				servers: {},
				main: 13,
				lastUpdate: 0,
				order: [],
				flare: 0,
				hide2: 0,
				serverTimestamp: 0,
				sortOrder: null
			},
			function	(data)
			{
				// Assign retrieved data to instance properties.
				this.servers	=	data.servers
				;
				this.main		=	data.main
				;
				this.flare		=	data.flare
				;
				this.hide2		=	data.hide2
				;

				// Add dynamic HTML elements to the DOM based on server data.
				this.addHTML()
				;

				// Set up an interval to periodically update time-related elements.
				// The callback is bound to the App instance.
				this.interval	=	window.setInterval(this.updateTime.bind(this), 1000)
				;


				// Check if there's a custom sort order and if the 'hide2' flag is not set.
				if	( data.sortOrder	!==	null &&	!this.hide2	)
				{
					// Detach the alert container to reorder its children.
					var $detach	=	$('.alert-container').detach()
					;

					// Reconstruct the sortOrder array with jQuery objects of the detached elements.
					for	( var i = 0 ; i < data.sortOrder.length ; i++ )
					{
						data.sortOrder[i]	=	$detach.find('#' + data.sortOrder[i])
						;
					}

					// Prepend a new alert container to the body and then populate it with the sorted elements.
					$('body').prepend('<div class="alert-container container-fluid"></div>').find('.alert-container').prepend(data.sortOrder)
					;
				}


				// Initialize the sortable functionality on the alert container.
				// This allows users to drag and drop server panels.
				$('.alert-container').sortable
				(
					{
						handle: '.handle',	// Selector for the drag handle.
						items: '.row'		// Selector for sortable items.
					}
				).on
				(
					'sortupdate',	// Event triggered after an item is dropped.
					function	()
					{
						var order	=	[]
						,	children	=	document.getElementsByClassName('alert-container')[0].children
						;

						// Populate the 'order' array with the IDs of the sorted elements.
						for	( var i = 0 ; i < children.length ; i++ )
						{
							order.push(children[i].id)
							;
						}

						// Save the new sort order to Chrome local storage.
						chrome.storage.local.set({sortOrder: order})
						;

						// Play any video elements present (likely alert animations).
						$.each($('video'), function	(i, vid)
						{
							vid.play()
							;
						})
						;
					}
				)
				;


				// Set up the click handler for the refresh button.
				$('#refresh').click
				(
					function	(e)
					{
						// Call the refresh method of the App instance.
						this.refresh()
						;

						// Prevent further propagation of the click event.
						e.stopImmediatePropagation()
						;
					}.bind(this) // Bind 'this' to the App instance.
				).attr	// Set attributes for the refresh button.
				(
					{
						title: 'Last updates<br>Client: ' + new Date(data.lastUpdate) + '<br>Server: ' + new Date(data.serverTimestamp),
						'data-tooltip': true
					}
				).tooltip()	// Initialize Bootstrap tooltip.
				;

				// Highlight the main server panel.
				$('.server-' + this.main).addClass('panel-info').removeClass('panel-default')
				;
			}.bind(this)	// Bind the callback function to the App instance.
		)
		;

		// Set up the click handler for the options button.
		$('#options').click
		(
			function	()
			{
				// Open the settings page in a new tab.
				chrome.tabs.create({ url: 'settings.html' })
				;
			}
		).attr('title', 'v' + VERSION)	// Set the tooltip title with the version number.
		.parent().find('[data-tooltip]').tooltip()	// Initialize tooltips for parent elements.
		;

		// Add a short delay before playing videos, potentially for DOM readiness or animation.
		window.setTimeout
		(
			function	()
			{
				$.each($('video'), function	(i, vid)
				{
					vid.play()
					;
				})
				;
			},
			550
		)
		;
	}
	;


	// Define the prototype methods and properties for the App class.
	App.prototype	=
	{
		// Default servers object (will be overwritten by stored data).
		servers: {},

		// Placeholder for the interval ID.
		interval: null,

		// Explicitly set the constructor property.
		constructor: App,


		/**
		 * Dynamically adds HTML elements for each server to the alert container.
		 */
		addHTML: function	()
		{
			// Iterate over each server in the 'servers' object.
			$.each(this.servers, function	(index, server)
			{
				// If 'hide2' is active and the server is not the main server, skip it.
				if	( this.hide2 && server.id	!==	this.main )
				{
					return
					;
				}

				var add	=	''
				; // Initialize an empty string for CSS class.

				// If this is the main server, add the 'in' class for a collapsed panel.
				if	( server.id	===	this.main )
				{
					add	=	' in'
					;
				}

				// Append the server panel HTML to the alert container.
				// This is a single, long string literal as required for Type I clone.
				$('.alert-container').append('<div class="row" id="server-' + server.id + '"><div class="col-xs-1"><button type="button" class="btn btn-default btn-lg handle"><span class="glyphicon glyphicon-align-justify"></span></button></div><div class="col-xs-11"><div class="panel panel-default server-' + server.id + '"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse"  href="#collapse' + server.id + '"><span class="server-name">' + server.name + '</span></a><span class="pull-right badge remaining"></span></h4><table class="table info text-center hide"><tbody><tr><td class="type"></td><td class="continent"></td></tr></tbody></table></div><div id="collapse' + server.id + '" class="panel-collapse collapse' + add + '"><div class="panel-body text-center"></div><table class="table"><tbody><tr><td class="remaining"></td><td class="type"></td><td class="continent"></td></tr></tbody></table></div></div></div></div>')
				;

				// Update the table content for the newly added server.
				this.updateTable(server)
				;
			}.bind(this))	// Ensure 'this' refers to the App instance.
			;
		},


		/**
		 * Updates the display information for a specific server.
		 * @param {object} server - The server object containing status and alert data.
		 */
		updateTable: function	(server)
		{
			// Cache the jQuery object for the specific server panel.
			var $server	=	$('.server-' + server.id)
			;

			// Check if the server status indicates an active alert (Status === 1).
			if	( server.Status	===	1 )
			{
				// Add success class, show info panel, and adjust handle height.
				$server.addClass('success')
				;
				$server.find('.info').removeClass('hide')
				;
				$server.find('.handle').css('height', '51px')
				;

				// Find the server name element.
				var video	=	$server.find('.server-name')
				;

				// If no video is present, add the alert animation video.
				if	( video.find('video').length	===	0 )
				{
					video.before('<video width="30" height="30" autoplay loop><source src="img/AlertAnim2.mp4" type="video/mp4"></video>').prev()[0].play()
					;
				}

				// Update the alert type display and initialize its tooltip.
				$server.find('.type').html(server.alert.type).attr
				(
					{
						//title: 'EXP Bonus: ' + server.alert.experience_bonus + '%', // Commented out in original.
						'data-tooltip': true
					}
				).tooltip({container: 'body'})
				;

				// Handle different alert types using a switch statement.
				switch	( server.alert.type )
				{
					case 'Territory':
						this.addType('territory', server)
						;
						break
						;
					case 'Bio':
					case 'Tech':
					case 'Amp':
						this.addType('facility', server)
						;
						break
						;
					default:
						// No specific action for other types.
						break
						;
				}

				// Update continent and remaining time display.
				$server.find('.continent').text(server.alert.zone)
				;
				$server.find('.remaining').removeClass('inactive')
				;

				// Update the time display for this specific server.
				this.updateTime(server)
				;
			}
			else
			{
				// If server status is not active (e.g., inactive or error).
				//$server.removeClass() // Commented out in original.
				$server.find('video').remove()
				;
				$server.find('.type').empty()
				;
				$server.find('.continent').empty()
				;
				$server.find('.panel-body').html('<a href="' + server.FullAlertLink + '" target="_blank">View all alerts for this server</a>')
				;
				$server.find('.remaining').addClass('inactive')
				;
				$server.find('.info').addClass('hide')
				;
				$server.find('.handle').css('height', 'auto')
				;
			}

			// Handle string-based status messages (e.g., 'error').
			if	( typeof server.Status	===	'string' )
			{
				// Capitalize the first letter of the status.
				$server.find('.remaining:not(".badge")').html(server.Status.charAt(0).toUpperCase() + server.Status.slice(1))
				;

				// If status contains 'error', add a danger class.
				if	( server.Status.indexOf('error')	!==	-1 )
				{
					$server.addClass('danger')
					;
				}
			}
		},


		/**
		 * Adds the territory control progress bars to the server panel.
		 * @param {object} server - The server object with alert data.
		 * @returns {Array} An array containing the row element, and faction percentages.
		 * @private
		 */
		_addTerritory: function	(server)
		{
			// Extract faction territory percentages.
			var vanu	=	server.alert.TerritoryVS
			,	tr		=	server.alert.TerritoryTR
			,	nc		=	server.alert.TerritoryNC
			,	count	=	100	-	nc	-	tr	// Calculate Vanu percentage based on total.
			,	row		=	$('#collapse' + server.id + ' > .panel-body').append('<div class="progress"><div class="progress-bar progress-bar-danger" style="width:' + tr  + '%">' + Math.floor(tr) + '%</div><div class="progress-bar progress-bar-info" style="width:' + nc  + '%">' + Math.floor(nc) + '%</div><div class="progress-bar progress-bar-purple" style="width:' +  count  + '%" >' + Math.floor(vanu) + '%</div></div>')
			;

			// Return the appended row element and faction percentages.
			return	[row, vanu, tr, nc]
			;
		},


		/**
		 * Adds specific alert type details (territory or facility) to the server panel.
		 * @param {string} which - The type of alert ('territory' or 'facility').
		 * @param {object} server - The server object with alert data.
		 */
		addType: function	(which, server)
		{
			var data
			;

			// Clear previous content in the panel body.
			$('#collapse' + server.id + ' > .panel-body').html('')
			;

			// Call the appropriate helper function based on the alert type.
			switch	( which )
			{
				case 'territory':
					data	=	this._addTerritory(server)
					;
					break
					;
				case 'facility':
					data	=	this._addFacility(server)
					;
					break
					;
				default:
					return
					;
					break
					; // This break is unreachable but kept for Type I clone.
			}

			var container	=	data[0]
			,	append		=	'Fair fight.'
			,	lead		=	4
			,	add			=	'text-info'
			;

			// Determine which faction is leading based on percentages.
			if	( data[3]	<	data[1] && data[2]	<	data[1] )
			{
				lead	=	0
				; // Vanu
				append	=	'Vanu is leading.'
				;
			}
			else if	( data[2]	<	data[3] && data[3]	>	data[1] )
			{
				lead	=	1
				; // NC
				append	=	'NC is leading.'
				;
			}
			else if	( data[2]	>	data[1] && data[3]	<	data[2] )
			{
				lead	=	2
				; // TR
				append	=	'TR is leading.'
				;
			}

			// If the leading faction matches the 'flare' setting, highlight the text.
			if	( this.flare	===	lead )
			{
				add	=	'text-success'
				;
			}

			// Append the leading faction message and a link to PS2Alerts.
			container.append('<div class="' + add + '">' + append + '<br><a href="' + server.FullAlertLink + '" target="_blank">View this alert live on PS2Alerts</a></div>')
			;
		},


		/**
		 * Adds facility control details for facility alerts.
		 * @param {object} server - The server object with alert data.
		 * @returns {Array} An array containing the row element, and faction facility counts.
		 * @private
		 */
		_addFacility: function	(server)
		{
			// Append a container for facilities and cache jQuery objects.
			var row			=	$('#collapse' + server.id + ' > .panel-body').append('<div class="facilities"></div>')
			,	$container	=	$('#collapse' + server.id + ' > .panel-body')
			,	$facilities	=	$container.find('.facilities')
			,	vanu		=	0
			,	tr			=	0
			,	nc			=	0
			;


			// Iterate over facilities in the server alert data.
			$.each(server.alert, function	(facility, status)
			{
				// Skip non-facility properties or null statuses.
				if	( facility	===	'dataID' || facility	===	'dataTimestamp' || facility	===	'resultID' || facility	===	'start' || facility	===	'type' || facility	===	'zone' || status	===	null || facility	===	'notified' )
				{
					return
					;
				}

				var add	=	'progress-bar-purple'
				; // Default color for Vanu.

				// Determine faction ownership and update counts.
				switch	( status )
				{
					case '1': // Vanu
						vanu++
						;
						break
						;
					case '2': // NC
						nc++
						;
						add	=	'progress-bar-info'
						;
						break
						;
					case '3': // TR
						tr++
						;
						add	=	'progress-bar-danger'
						;
						break
						;
					default:
						break
						;
				}

				// Append a facility block with its color and tooltip.
				$facilities.append('<div class="facility ' + add + '" data-tooltip="true" title="' + facility + ' (' + server.alert.type + ')">')
				;
			})
			;

			// Initialize tooltips for the newly added facilities.
			$facilities.find('[data-tooltip]').tooltip()
			;

			// Return the row element and faction facility counts.
			return	[row, vanu, tr, nc]
			;
		},


		/**
		 * Updates the remaining time display for a server or all servers.
		 * @param {object} [server] - The server object to update, or undefined to update all.
		 */
		updateTime: function	(server)
		{
			// If no specific server is provided, iterate and update all.
			if	( !server )
			{
				return	$.each(this.servers, function	(i, server)
				{
					this.updateTime(server)
					;
				}.bind(this))
				;
			}

			// Get the current timestamp.
			var current	=	Date.now()
			;

			// Only proceed if the server has an active alert.
			if	( server.Status	===	1 )
			{
				// Calculate the remaining time.
				var date	=	new Date(+server.alert.start	-	current)
				;

				// Adjust UTC hours based on alert type (2 hours for Territory/Global, 1 for others).
				if	( server.alert.type	===	'Territory' || server.alert.zone	===	'Global' )
				{
					date.setUTCHours(date.getUTCHours() + 2)
					;
				}
				else
				{
					date.setUTCHours(date.getUTCHours() + 1)
					;
				}

				// Format hours, minutes, and seconds.
				var h	=	date.getUTCHours()
				;
				var m	=	('0' + date.getUTCMinutes()).slice(-2)
				;
				var s	=	('0' + date.getUTCSeconds()).slice(-2)
				;

				// If there's still time remaining, update the display and background page badge.
				if	( h	<	2 && (h + +m + +s)	>	0 )
				{
					if	( server.id	===	this.main )
					{
						chrome.runtime.getBackgroundPage(function	(w)
						{
							w.alert.init(false, w.alert.updateBadge(server))
							;
						})
						;
					}
					return	$('.server-' + server.id + ' .remaining').html(h + 'h ' + m + 'm ' + s + 's')
					;
				}

				// If time runs out, mark the server as inactive and update its table.
				//chrome.runtime.getBackgroundPage(function(w) { // Commented out in original.
				//	w.alert.count--
				//	w.alert.updateIcon()
				//})
				server.Status	=	'INACTIVE'
				;
				//this.servers['s' + server.id].Status = 'INACTIVE' // Commented out in original.
				//chrome.storage.local.set({servers: this.servers}) // Commented out in original.
				this.updateTable(server)
				;
			}
		},


		/**
		 * Handles updates to a specific server's data.
		 * @param {object} server - The server object that has been updated.
		 */
		updated: function	(server)
		{
			// Simply call updateTable to refresh the display for the server.
			this.updateTable(server)
			;
		},


		/**
		 * Initiates a manual refresh of server data.
		 */
		refresh: function	()
		{
			var $e	=	$('#refresh')
			;

			// Disable the refresh button to prevent multiple rapid clicks.
			$e.attr('disabled', true)
			;

			// Request the background page to re-initialize alert data.
			chrome.runtime.getBackgroundPage(function	(w)
			{
				w.alert.init(true, function	()
				{
					// After refresh, update the tooltip with new timestamps.
					chrome.storage.local.get({lastUpdate: 0, serverTimestamp: 0}, function	(data)
					{
						$e.attr('title', new Date(data.lastUpdate) + '(' +new Date(data.serverTimestamp) + ')')
						;
					})
					;

					// Re-enable the refresh button after a delay (2 minutes).
					window.setTimeout(function	()
					{
						$e.removeAttr('disabled')
						;
					}, 120000)
					;
				})
				;
			})
			;
		}
	}
	;

	// Expose the App constructor to the global window object.
	window.App	=	App
	;
}(window)	// Pass the window object to the IIFE.

// Execute code when the DOM is fully loaded.
$.fn.ready(function	()
{
	// Instantiate the App, initializing the application.
	App	=	new App()
	;
})