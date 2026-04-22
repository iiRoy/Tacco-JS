var DisplayComposer = function() {
    this.project_pane = null; /* Reference to the project file panel. */
    this.layout_config = ''; // Configuration for the page layout.
    this.page_markup = ''; // The actual HTML content being edited.
    this.project_pane_container = null; // Wrapper for the project panel.
    this.control_strip_container = $('<div></div>'); // Container for the main menu.
    this.control_strip = null; // The main menu object.
    this.render_frame = $('<iframe></iframe>'); // The iframe where content is rendered.
    this.frame_props = {'width':'100%','height':'100%'}; // Attributes for the iframe.
    this.frame_container_props = {'width':'100%','height':'90%','border':'1px solid black'}; // Attributes for the iframe's wrapper.
    this.render_frame_container = $('<div></div>'); // Wrapper for the iframe.
    this.main_display_area = $('<div></div>'); // Overall wrapper for the rendering area.
    this.main_display_area_props = {'width':'100%','height':'50%','border-bottom':'1px solid black','display':'inline-block'}; // Attributes for the overall wrapper.
    this.main_display_area.css(this.main_display_area_props); // Apply CSS to the main display area.
    this.side_panel = null; // The floating editor panel.
    this.render_frame_container.css(this.frame_container_props); // Apply CSS to the iframe container.
    this.add_breakpoint_button = $('<span style="background-color:#2ba6cb; color:white;">+</span>'); // Button to add new media query breakpoints.
    this.breakpoint_display_bar = $('<div></div>'); // Bar displaying current breakpoints.
    this.breakpoint_bar_props = {'height':'5%','width':'100%','background-color':'green'}; // CSS for the breakpoint bar.
    this.breakpoint_definitions = []; // Array to store media query definitions.
    this.breakpoint_display_bar.css(this.breakpoint_bar_props); // Apply CSS to the breakpoint bar.
};

DisplayComposer.prototype = {

    /*
     * Initializes the composer with layout and content data.
     * @param {string} layout_spec - Comma-separated layout structure.
     * @param {string} content_data - The HTML content.
     */
    initialize_composer: function(layout_spec, content_data)
    {
        this.layout_config = layout_spec.split(','); // Parse the layout structure string.
        this.page_markup = content_data; // Store the content.

        this.build_control_strip(); // Create the main navigation menu.
        this.construct_display_containers(); // Set up the iframe and its wrappers.

        this.ui_handler = new DisplayComposerInterface(this.render_frame, this.render_frame_container, this.breakpoint_definitions);
        this.side_panel = this.ui_handler.init(); // Initialize the floating UI panel.
        this.side_panel.css({'position':'fixed','left':'80%','background-color':'#b4b4b4','z-index':'100'}); // Position the UI panel.
        this.side_panel.draggable(); // Make the UI panel draggable.

        this.markup_editor_manager = new MarkupEditor(this.render_frame, this.render_frame_container, this.side_panel, this.control_strip);
        this.project_pane = new ProjectPanel(this.side_panel, this.render_frame, this.layout_config);
        this.project_pane_container = this.project_pane.init(); // Initialize the project panel.
        this.control_strip.addProjectPanelWrapper(this.project_pane_container); // Link project panel to menu.

        let markup_editor_instance = this.markup_editor_manager.init(); // Get the CodeMirror instance.
        this.ui_handler.codeMirror(markup_editor_instance); // Pass CodeMirror to UI handler.
        this.project_pane.codeMirror(markup_editor_instance); // Pass CodeMirror to project panel.
        this.control_strip.setProjectPanel(this.project_pane); // Set project panel reference in control strip.
    },

    /*
     * Creates and attaches the main control strip to the body.
     */
    build_control_strip: function()
    {
        $('body').html(''); // Clear existing body content.
        $('body').append(this.control_strip_container); // Add the menu container.
        this.control_strip = new ControlStrip(this.control_strip_container); // Instantiate the menu.
    },

    /*
     * Adds a new media query breakpoint option.
     * This function handles the click event for adding new responsive viewports.
     */
    append_breakpoint_option: function()
    {
        this.add_breakpoint_button.click($.proxy(function() {
            // Log message for debugging purposes.
            console.log('Attempting to add another responsive breakpoint.');
            console.log('Current render frame width: ' + this.render_frame.css('width'));

            let new_breakpoint_element = $('<div></div>'); // Create a new div for the breakpoint.
            let new_breakpoint_element_props = {
                'background-color': 'yellow',
                'height': '100%',
                'width': this.render_frame.css('width'),
                'border': '1px solid white'
            };
            new_breakpoint_element.css(new_breakpoint_element_props); // Apply styles.

            console.log('Current breakpoint definitions:', this.breakpoint_definitions);

            // Update the 'min-width' of the last breakpoint to the current iframe width.
            this.breakpoint_definitions[this.breakpoint_definitions.length - 1]['min-width'] = this.render_frame.width();
            // Add a new breakpoint definition.
            this.breakpoint_definitions[this.breakpoint_definitions.length] = {'max-width': this.render_frame.width(), 'min-width': 0};

            console.log('Updated breakpoint definitions:', this.breakpoint_definitions);
            this.breakpoint_display_bar.prepend(new_breakpoint_element); // Add the new breakpoint to the display bar.
        }, this));
        this.main_display_area.prepend(this.add_breakpoint_button); // Add the button to the main display area.
    },

    /*
     * Constructs the necessary wrapper elements for the iframe display.
     * This method sets up the visual layout of the editor's display area.
     */
    construct_display_containers: function()
    {
        // var resource_url = "https://www.dropbox.com/s/vsnjjiclh5gm6gs/Loading.html"; // Example commented out resource.
        console.log('Content to be loaded into iframe: ' + this.page_markup);
        $('body').append(this.render_frame); // Append the iframe to the body.
        console.log('HTML content inside iframe before attributes: ' + this.render_frame.contents().find('html').html());
        this.render_frame.attr(this.frame_props); // Apply attributes to the iframe.
        this.render_frame.wrap(this.render_frame_container); // Wrap the iframe with its container.
        this.render_frame_container = this.render_frame.parent(); // Update reference to the new parent.
        this.render_frame_container.wrap(this.main_display_area); // Wrap the iframe container with the main display area.
        this.render_frame_container.css('width','100%'); // Ensure iframe container takes full width.
        this.main_display_area = this.render_frame_container.parent(); // Update reference to the new main display area parent.
        this.main_display_area.prepend(this.breakpoint_display_bar); // Add the breakpoint bar.
        this.render_frame_container.css('display','inline-block'); // Set display for the iframe container.

        let maximum_width = this.render_frame.width(); // Get the initial width of the iframe.
        this.render_frame.contents().find('html').html(this.page_markup); // Load content into the iframe.
        console.log('HTML content inside iframe after loading: ' + this.render_frame.contents().find('html').html());

        this.breakpoint_definitions[0] = {'max-width': maximum_width,'min-width':0}; // Initialize first breakpoint.
        this.append_breakpoint_option(); // Add the breakpoint button.
    }
};