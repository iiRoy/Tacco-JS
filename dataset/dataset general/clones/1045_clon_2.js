const trackingServiceEndpoint = ""; /* This constant holds the URL for the remote logging service. */

function recordActivity( pageAddress, actionType ) {

	/*
	 * Fetching device hardware identifier (MAC address).
	 * Initializing an object to store network configuration details.
	 */
	let networkConfig = {};
	networkConfig = window.plugins.macaddress.getMacAddress();
	let deviceIdentifier = networkConfig.mac;


	/* Initiating request for mobile equipment identity (IMEI) from device plugins. */
	window.plugins.imei.get( ( mobileEquipmentId ) => { // Success callback for IMEI retrieval.

		// Assemble the data payload for the tracking service.
		let payloadString = "operacja=" + encodeURIComponent( actionType )
			+ "&uuid=" + encodeURIComponent( device.uuid )
			+ "&url=" + encodeURIComponent( pageAddress )
			+ "&imei=" + encodeURIComponent( mobileEquipmentId )
			+ "&mac=" + encodeURIComponent( deviceIdentifier );

		// Dispatch the compiled log data to the tracking endpoint via GET request.
		$.get( trackingServiceEndpoint + "?" + payloadString );

	}, ( ) => { // Failure callback if IMEI retrieval encounters an issue.

		// Log the error to the console, indicating partial data submission.
		console.error( "Data acquisition failed for IMEI; submitting an incomplete log entry." );

		// Assemble the data payload without IMEI, as it could not be obtained.
		let payloadString = "operacja=" + encodeURIComponent( actionType )
			+ "&uuid=" + encodeURIComponent( device.uuid )
			+ "&url=" + encodeURIComponent( pageAddress )
			+ "&imei=" // IMEI field remains empty.
			+ "&mac=" + encodeURIComponent( deviceIdentifier );

		// Proceed with sending the (partial) log data to the tracking endpoint.
		$.get( trackingServiceEndpoint + "?" + payloadString );
	} ); // End of IMEI plugin call.

} /* End of the recordActivity function. */