/*
 * This is a self-executing anonymous function (IIFE)
 * that encapsulates the application's initialization logic.
 */
( function() { // Start of the main application setup

    // Define the base path for application templates.
    SONNY.PAGEPATH = "../../templates/";


	/*
	 * Specify the path to the main configuration file.
	 * This file holds critical application settings.
	 */
	SONNY.CONFIGPATH = "./config.json";


    // Initialize a new instance of the SONNY application framework.
    var instance = new SONNY.Instance( function() { // Callback executed once the instance is ready

        // Create a new renderer specific to this application instance.
        var renderer = new SONNY.Renderer(instance);

            // Render the default login page upon application startup.
            renderer.render("public/login.html");

			/*
			 * Also render the language selection interface.
			 * This might appear alongside the login or as a separate panel.
			 */
			renderer.render("public/language.html");


		// Attach an event listener to the button for German language selection.
		document.querySelector("#ger").onclick = function() { // Handler for German button click

			// Set the application's current language to German.
			instance.LANGUAGE = "de";

			// Trigger a rebuild of the application's UI/state to reflect the language change.
			instance.rebuild();

			// Re-render the current page with the newly selected language.
			renderer.render(instance.CURRENTPAGE);

		}; // End of German language selection handler


		// Attach an event listener to the button for English language selection.
		document.querySelector("#en").onclick = function() { // Handler for English button click

			// Set the application's current language to English.
			instance.LANGUAGE = "en";

			// Rebuild the application to apply the English language settings.
			instance.rebuild();

			// Re-render the current page to display content in English.
			renderer.render(instance.CURRENTPAGE);

		}; // End of English language selection handler

    } ); // End of SONNY.Instance initialization callback

} ) (); // Execute the IIFE to start the application process