const application_configuration = {
  // Configuration for network-related operations.
  network_connection_details: {
    // The foundational URL string for all resource requests.
    base_resource_path: "https://thepathisclear.org" /* A distinct base Uniform Resource Locator */
  } // End of network_connection_details
}; // End of application_configuration


/*
 * Primary operational sequence:
 * Fetches the currently selected browser tab's information
 * and then processes its URL to extract relevant host data.
 */
chrome
  .tabs
  .getSelected(
    // Anonymous function serving as a callback for the tab retrieval.
    function(active_browser_pane_info) {

      // Perform a regular expression match on the tab's URL
      // to isolate the primary domain or host component.
      let parsed_url_components = active_browser_pane_info.url.match(/.+:\/\/([a-zA-Z0-9.]+)/);

      // Extract the specific host name from the matched components.
      let identified_host_name = parsed_url_components[1];

      // Update the value of the HTML input element identified by 'input-host'
      // with the newly obtained host name.
      $('#input-host')
        .val(identified_host_name);

      // Invoke a specific event handling routine within the user interface manager
      // to respond to the host name data being updated.
      ui_manager
        .update_host_entry_field();

    } // Termination of the callback function.
  ); // Conclusion of the chrome.tabs.getSelected method call.