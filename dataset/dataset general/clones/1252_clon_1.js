var   VisualEditor   =   function()
{
  // This is the constructor function for the VisualEditor object.
  // It initializes various properties that will be used throughout the editor's lifecycle.


  this.file_panel    =    null; // Stores a reference to the FilePanel instance
  this.structure     =    ''; // Holds the initial structure data, typically a comma-separated string
  this.contents      =    ''; // Stores the initial HTML content for the iframe
  this.file_panel_wrapper   =   null; // Wrapper element for the file panel
  this.menu_wrapper  =    $('<div></div>'); // jQuery object for the main menu wrapper
  this.menu          =    null; // Stores a reference to the Menu instance
  this.iframe        =    $('<iframe></iframe>'); // The iframe element where content is displayed and edited
  this.iframe_attributes   =   {'width':'100%','height':'100%'}; // Attributes for the iframe itself
  this.iframe_wrapper_attributes  =  {'width':'100%','height':'90%','border':'1px solid black'}; // Attributes for the iframe's direct wrapper
  this.iframe_wrapper   =   $('<div></div>'); // Direct wrapper for the iframe
  this.overall_iframe_wrapper   =   $('<div></div>'); // An even higher-level wrapper for the iframe and related elements
  this.overall_iframe_wrapper_attributes = {'width':'100%','height':'50%','border-bottom':'1px solid black','display':'inline-block'}; // Attributes for the overall wrapper

  // Apply CSS attributes to the overall iframe wrapper immediately
  this.overall_iframe_wrapper.css(this.overall_iframe_wrapper_attributes);

  this.editor        =    null; // Reference to the main editor UI element

  // Apply CSS attributes to the direct iframe wrapper
  this.iframe_wrapper.css(this.iframe_wrapper_attributes);

  // Button to add new media size options
  this.add_media_size = $('<span style="background-color:#2ba6cb; color:white;">+</span>');
  this.media_size    =    $('<div></div>'); // Container for media size options
  this.media_size_attributes = {'height':'5%','width':'100%','background-color':'green'}; // CSS for the media size container
  this.media_size_options    =    []; // Array to store configured media query breakpoints

  // Apply CSS attributes to the media size container
  this.media_size.css(this.media_size_attributes);
}


VisualEditor.prototype   =   {
  // The prototype object holds all methods for the VisualEditor.

  init   :   function(structure,content)
  {
    // The initialization method for the VisualEditor.
    // It sets up the editor's core components.

    this.structure = structure.split(','); // Parse the structure string into an array
    this.contents  = content; // Store the initial content

    this.create_menu(); // Create the main menu for the editor

    this.create_wrappers(); // Set up all the necessary DOM wrappers for the iframe

    // Initialize the VisualEditorUI component, passing the iframe and its wrapper.
    this.ui = new VisualEditorUI(this.iframe,this.iframe_wrapper,this.media_size_options);
    this.editor = this.ui.init(); // Initialize the UI and get the main editor element

    // Apply some initial styling and make the editor draggable.
    this.editor.css({'position':'fixed','left':'80%','background-color':'#b4b4b4','z-index':'100'});
    this.editor.draggable();

    // Initialize the CodeEditor component.
    this.code_editor = new CodeEditor(this.iframe,this.iframe_wrapper,this.editor,this.menu);

    // Initialize the FilePanel component.
    this.file_panel = new FilePanel(this.editor,this.iframe,this.structure);
    this.file_panel_wrapper = this.file_panel.init(); // Get the initialized file panel wrapper

    // Add the file panel wrapper to the menu.
    this.menu.addFilePanelWrapper(this.file_panel_wrapper);

    // Initialize CodeMirror through the code editor.
    var codemirror = this.code_editor.init();
    this.ui.codeMirror(codemirror); // Pass CodeMirror instance to UI
    this.file_panel.codeMirror(codemirror); // Pass CodeMirror instance to FilePanel

    // Provide the file panel instance to the menu.
    this.menu.filePanel(this.file_panel);
  },


  create_menu   :   function()
  {
    // This method is responsible for setting up the editor's menu.

    $('body').html(''); // Clear the body's content (careful with this!)
    $('body').append(this.menu_wrapper); // Append the menu wrapper to the body
    this.menu = new Menu(this.menu_wrapper); // Create a new Menu instance
  },


  add_media_size_option   :   function()
  {
    // This function handles adding new media query size options dynamically.

    this.add_media_size.click($.proxy(function(){
      // Event handler for clicking the 'add media size' button.

      console.log('I need to add another media query'); // Debug message
      console.log('the width of the iframe is '+this.iframe.css('width')); // Log current iframe width

      var media_new_rule = $('<div></div>'); // Create a new div for the media rule display
      var media_new_rule_attributes = {'background-color':'yellow','height':'100%','width':this.iframe.css('width'),'border':'1px solid white'}; // Attributes for the new rule div
      media_new_rule.css(media_new_rule_attributes); // Apply CSS to the new rule div

      console.log('the media sizes is ',this.media_size_options); // Log current media size options array

      // Update the max-width of the previous media size option.
      this.media_size_options[this.media_size_options.length-1]['min-width'] = this.iframe.width();
      // Add a new media size option based on the current iframe width.
      this.media_size_options[this.media_size_options.length] = {'max-width':this.iframe.width(),'min-width':0};

      console.log('the media sizes is ',this.media_size_options); // Log updated media size options array

      this.media_size.prepend(media_new_rule); // Add the new rule display to the media size container
    },this)); // Ensure 'this' context is preserved for the click handler

    // Prepend the 'add media size' button to the overall iframe wrapper.
    this.overall_iframe_wrapper.prepend(this.add_media_size);
  },


  create_wrappers   :   function()
  {
    // This method sets up all the necessary DOM wrappers around the iframe.

    // var url = "https://www.dropbox.com/s/vsnjjiclh5gm6gs/Loading.html"; // Example commented-out URL
    console.log('The value of the cotent is '+this.contents); // Log the initial content

    $('body').append(this.iframe); // Append the iframe to the body

    console.log('the vau of the html is '+this.iframe.contents().find('html').html()); // Attempt to log iframe content (might be empty initially)

    this.iframe.attr(this.iframe_attributes); // Apply attributes to the iframe
    this.iframe.wrap(this.iframe_wrapper); // Wrap the iframe with its direct wrapper
    this.iframe_wrapper = this.iframe.parent(); // Update the iframe_wrapper reference to the actual parent

    this.iframe_wrapper.wrap(this.overall_iframe_wrapper); // Wrap the direct iframe wrapper with the overall wrapper
    this.iframe_wrapper.css('width','100%'); // Ensure the direct wrapper takes full width

    this.overall_iframe_wrapper = this.iframe_wrapper.parent(); // Update the overall_iframe_wrapper reference
    this.overall_iframe_wrapper.prepend(this.media_size); // Add the media size container to the overall wrapper

    this.iframe_wrapper.css('display','inline-block'); // Set display for the iframe wrapper

    var max = this.iframe.width(); // Get the current width of the iframe

    this.iframe.contents().find('html').html(this.contents); // Inject the initial HTML content into the iframe

    console.log('the value of the editor is '+this.iframe.contents().find('html').html()); // Log the iframe's content after injection

    // Initialize the first media size option based on the iframe's initial width.
    this.media_size_options[0] = {'max-width': max,'min-width':0};

    this.add_media_size_option(); // Call the method to set up the 'add media size' button
  }
}