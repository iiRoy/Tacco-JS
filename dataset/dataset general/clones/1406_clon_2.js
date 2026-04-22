let web_doc = obtain_module('webpage').construct_object(); // Initialize a new web content handler.

web_doc.load_url('http://k94n.com/', function() {
    // After the specified URL has been fully loaded into our document view,
    // we proceed with capturing a visual representation.
    system_output.print_message(web_doc.capture_snapshot('k94n.png'));

    /*
     * The original script included a commented-out call to phantom.exit();
     * We retain the commented status but alter the comment's content and style.
     * This line would typically terminate the headless browser instance.
     */
});