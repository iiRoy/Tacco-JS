( function ( scope ) { // Start of the self-executing anonymous function, defining a local scope.

  /*
   * Initialize the 'scope' object.
   * If 'scope' is undefined or null, it defaults to an empty object.
   * This ensures we always have a valid object to attach properties to.
   */
  scope = scope || { } ;


  // Verify if the browser environment supports Shadow DOM.
  // The presence of `window.WebKitShadowRoot` is used as an indicator.
  if ( ! window . WebKitShadowRoot )
  {
    // If Shadow DOM is not detected, log an error message to the console.
    console . error ( 'Shadow DOM support is required.' ) ;
    // And then, immediately exit from this function.
    return ;
  }

  // Create a reusable 'forEach' utility function for array-like objects.
  // This binds Array.prototype.forEach's 'this' to its 'call' method,
  // making it callable on non-array objects with a 'length' property.
  var forEach = Array . prototype . forEach . call . bind ( Array . prototype . forEach ) ;


  // Define the 'HTMLElementElement' constructor within the 'scope'.
  // This class represents the metadata for a custom HTML element.
  scope . HTMLElementElement = function ( name , tagName , declaration )
  {
    // Assign the custom element's name (e.g., 'my-element').
    this . name = name ;
    // Assign the tag name of the element it extends (e.g., 'div', 'button').
    this . extendsTagName = tagName ;
    // Bind the 'lifecycle' method to the provided 'declaration' context.
    // This ensures 'this' inside 'lifecycle' refers to the 'declaration' instance.
    this . lifecycle = this . lifecycle . bind ( declaration ) ;
  } ;


  // Define the prototype for 'HTMLElementElement' to add methods and properties.
  scope . HTMLElementElement . prototype =
  {
    // Establish the prototype chain to inherit from HTMLElement.
    // This uses the non-standard '__proto__' property for demonstration,
    // though Object.setPrototypeOf or Object.create are generally preferred.
    __proto__ : HTMLElement . prototype ,

    // The 'lifecycle' method processes the lifecycle callbacks provided in a dictionary.
    lifecycle : function ( dict )
    {
      // Assign 'created' callback, defaulting to 'nil' if not provided.
      this . created = dict . created || nil ;
      // Assign 'inserted' callback, defaulting to 'nil' if not provided.
      this . inserted = dict . inserted || nil ;
      // Assign 'attributeChanged' callback, defaulting to 'nil' if not provided.
      this . attributeChanged = dict . attributeChanged || nil ;

      // TODO: Consider implementing and supporting 'removed' lifecycle methods in the future.
      // this.removed = dict.removed || nil; // This line is currently commented out.
    }
  } ; // End of HTMLElementElement.prototype definition.


  // Define the 'Declaration' constructor, representing the definition of a custom element.
  scope . Declaration = function ( name , tagName )
  {
    // Create the prototype for the custom element's instances, inheriting from the extended tag's prototype.
    this . elementPrototype = Object . create ( this . prototypeFromTagName ( tagName ) ) ;
    // Create an instance of HTMLElementElement to hold the element's metadata.
    this . element = new scope . HTMLElementElement ( name , tagName , this ) ;
    // Generate the constructor function for the custom element.
    this . element . generatedConstructor = this . generateConstructor ( ) ;
    // Explicitly bind the 'morph' method to the current 'Declaration' instance.
    // This ensures 'this' always refers to the Declaration when 'morph' is called.
    this . morph = this . morph . bind ( this ) ;
  } ;


  // Define methods and properties for the 'Declaration' prototype.
  scope . Declaration . prototype =
  {
    // Generates a constructor function for the custom element.
    // This constructor will correctly set up the prototype chain.
    generateConstructor : function ( )
    {
      // Get the tag name that this custom element extends.
      var tagName = this . element . extendsTagName ;
      // Get the 'created' lifecycle callback from the declaration.
      var created = this . created ;

      // Define the 'extended' constructor function.
      var extended = function ( )
      {
        // Create a standard HTML element of the specified tagName.
        var element = document . createElement ( tagName ) ;
        // Set the prototype of the 'extended' constructor's prototype to that of the created element.
        extended . prototype . __proto__ = element . __proto__ ;
        // Set the prototype of the newly created element to the 'extended' constructor's prototype.
        element . __proto__ = extended . prototype ;
        // Invoke the 'created' lifecycle callback, binding 'this' to the new element.
        created . call ( element ) ;
      } ;

      // Set the prototype for the 'extended' constructor to the elementPrototype defined earlier.
      extended . prototype = this . elementPrototype ;
      // Return the generated constructor function.
      return extended ;
    } ,

    // Evaluates a script element's content within the context of the custom element instance.
    evalScript : function ( script )
    {
      // FIXME: Current implementation lacks support for loading external JavaScript files.
      // It only evaluates inline script content.
      Function ( script . textContent ) . call ( this . element ) ;
    } ,

    // Adds a template element to the declaration.
    addTemplate : function ( template )
    {
      this . template = template ;
    } ,

    // Morphs an existing element into a custom element instance.
    morph : function ( element )
    {
      // FIXME: Directly manipulating '__proto__' on each morph is not optimal
      // and can lead to performance issues or unexpected behavior.
      // A more robust approach might involve Object.setPrototypeOf or creating new instances.
      this . element . generatedConstructor . prototype . __proto__ = document . createElement ( this . element . extendsTagName ) ;
      element . __proto__ = this . element . generatedConstructor . prototype ;
      // Create a Shadow Root for the element.
      var shadowRoot = this . createShadowRoot ( element ) ;

      // If a 'created' lifecycle callback exists, fire it.
      this . created && this . created . call ( element , shadowRoot ) ;
      // If an 'inserted' lifecycle callback exists, fire it.
      this . inserted && this . inserted . call ( element , shadowRoot ) ;

      // Set up a MutationObserver to detect attribute changes if 'attributeChanged' callback is defined.
      if ( this . attributeChanged )
      {
        var observer = new WebKitMutationObserver ( function ( mutations )
        {
          // Iterate over each mutation record.
          mutations . forEach ( function ( m )
          {
            // Call the 'attributeChanged' callback with relevant details.
            this . attributeChanged ( m . attributeName , m . oldValue ,
                                      m . target . getAttribute ( m . attributeName ) ) ;
          } . bind ( this ) ) ; // Bind 'this' for the inner forEach callback.
        } . bind ( this ) ) ; // Bind 'this' for the MutationObserver callback.

        // TOOD: The specification is not entirely clear whether attribute changes
        // should be observed only on the custom element itself or any attribute
        // within its Shadow DOM subtree.
        observer . observe ( shadowRoot . host ,
        {
          // Observe attribute changes.
          attributes : true ,
          // Record the old value of changed attributes.
          attributeOldValue : true
        } ) ;
      }
    } ,

    // Creates a Shadow Root for the given element.
    createShadowRoot : function ( element )
    {
      // If no template is associated with this declaration, return undefined.
      if ( ! this . template )
      {
        return undefined ;
      }

      // Create a new WebKitShadowRoot for the element.
      var shadowRoot = new WebKitShadowRoot ( element ) ;
      // Set the 'host' property of the shadowRoot to the element itself.
      shadowRoot . host = element ;
      // Append cloned child nodes from the template into the shadowRoot.
      forEach ( this . template . childNodes , function ( node )
      {
        shadowRoot . appendChild ( node . cloneNode ( true ) ) ;
      } ) ;

      // Return the created shadowRoot.
      return shadowRoot ;
    } ,

    // Retrieves the prototype of a standard HTML element given its tag name.
    prototypeFromTagName : function ( tagName )
    {
      // Create a temporary element and get its prototype.
      return Object . getPrototypeOf ( document . createElement ( tagName ) ) ;
    }
  } ; // End of Declaration.prototype definition.


  // Define the 'DeclarationFactory' constructor.
  // This factory is responsible for creating 'Declaration' instances.
  scope . DeclarationFactory = function ( )
  {
    // Ensure the 'createDeclaration' method is always bound to this factory instance.
    this . createDeclaration = this . createDeclaration . bind ( this ) ;
  } ;


  // Define methods and properties for the 'DeclarationFactory' prototype.
  scope . DeclarationFactory . prototype =
  {
    // A callback function to be executed whenever a new Declaration instance is created.
    oncreate : null ,

    // Creates a Declaration instance based on an 'element' (e.g., an <element> tag).
    createDeclaration : function ( element )
    {
      // Extract the 'name' attribute, which is mandatory.
      var name = element . getAttribute ( 'name' ) ;
      if ( ! name )
      {
        // FIXME: Improve error messaging for user-friendliness.
        console . error ( 'name attribute is required.' ) ;
        return ;
      }
      // Extract the 'extends' attribute, also mandatory.
      var tagName = element . getAttribute ( 'extends' ) ;
      if ( ! tagName )
      {
        // FIXME: Allow extending any element, not just those with an 'extends' attribute.
        // FIXME: Improve error messaging.
        console . error ( 'extends attribute is required.' ) ;
        return ;
      }
      // Extract the 'constructor' attribute if provided.
      var constructorName = element . getAttribute ( 'constructor' ) ;
      // Create a new Declaration instance.
      var declaration = new scope . Declaration ( name , tagName , constructorName ) ;
      // If a constructor name is specified, expose the generated constructor globally.
      if ( constructorName )
      {
        window [ constructorName ] = declaration . element . generatedConstructor ;
      }

      // Evaluate any script tags found within the custom element's definition.
      forEach ( element . querySelectorAll ( 'script' ) , declaration . evalScript ,
                declaration ) ;
      // Find a template element and add it to the declaration if present.
      var template = element . querySelector ( 'template' ) ;
      template && declaration . addTemplate ( template ) ;
      // Execute the 'oncreate' callback, if defined, with the new declaration.
      this . oncreate && this . oncreate ( declaration ) ;
    }
  } ; // End of DeclarationFactory.prototype definition.


  // Define the 'Parser' constructor.
  // This class is responsible for parsing HTML strings to find custom element definitions.
  scope . Parser = function ( )
  {
    // Bind the 'parse' method to the current Parser instance.
    this . parse = this . parse . bind ( this ) ;
  } ;


  // Define methods and properties for the 'Parser' prototype.
  scope . Parser . prototype =
  {
    // A callback function to be invoked for each custom element definition found during parsing.
    onparse : null ,

    // Parses an HTML string to find custom element definitions.
    parse : function ( string )
    {
      // Create a temporary HTML document to parse the string.
      var doc = document . implementation . createHTMLDocument ( '' ) ;
      // Set the innerHTML of the temporary document's body.
      doc . body . innerHTML = string ;
      // Query for all 'element' tags (custom element definitions).
      forEach ( doc . querySelectorAll ( 'element' ) , function ( element )
      {
        // If 'onparse' callback is defined, invoke it with the found element.
        this . onparse && this . onparse ( element ) ;
      } , this ) ; // Bind 'this' for the forEach callback.
    }
  } ; // End of Parser.prototype definition.


  // Define the 'Loader' constructor.
  // This class handles loading external resources, such as component definitions.
  scope . Loader = function ( )
  {
    // Bind the 'start' method to the current Loader instance.
    this . start = this . start . bind ( this ) ;
  } ;


  // Define methods and properties for the 'Loader' prototype.
  scope . Loader . prototype =
  {
    // Callback function for successful loading of a declaration.
    onload : null ,
    // Callback function for errors during loading.
    onerror : null ,

    // Initiates the loading process by finding and loading component links.
    start : function ( )
    {
      // Find all <link rel="components"> elements in the document.
      forEach ( document . querySelectorAll ( 'link[rel=components]' ) , function ( link )
      {
        // Load the component definition from the link's href.
        this . load ( link . href ) ;
      } , this ) ; // Bind 'this' for the forEach callback.
    } ,

    // Loads a component definition from a given URL using XMLHttpRequest.
    load : function ( url )
    {
      // Create a new XMLHttpRequest object.
      var request = new XMLHttpRequest ( ) ;
      // Store a reference to the current loader instance.
      var loader = this ;

      // Open a GET request to the specified URL.
      request . open ( 'GET' , url ) ;
      // Define the callback for when the request has finished loading.
      request . onloadend = function ( )
      {
        // Check if the request was successful (status 2xx or 304).
        if ( request . status >= 200 && request . status < 300 || request . status === 304 )
        {
          // If successful, invoke the 'onload' callback with the response.
          loader . onload && loader . onload ( request . response ) ;
        }
        else
        {
          // If an error occurred, invoke the 'onerror' callback with status and request.
          loader . onerror && loader . onerror ( request . status , request ) ;
        }
      } ;
      // Send the XMLHttpRequest.
      request . send ( ) ;
    }
  } ; // End of Loader.prototype definition.


  // Define the main 'run' function to initialize the component loading and parsing process.
  scope . run = function ( )
  {
    // Create an instance of the Loader.
    var loader = new scope . Loader ( ) ;
    // Attach the loader's 'start' method to the DOMContentLoaded event.
    document . addEventListener ( 'DOMContentLoaded' , loader . start ) ;
    // Create an instance of the Parser.
    var parser = new scope . Parser ( ) ;
    // When the loader successfully loads content, pass it to the parser.
    loader . onload = parser . parse ;
    // Define an error handler for the loader.
    loader . onerror = function ( status , resp )
    {
      console . error ( "Unable to load component: Status " + status + " - " +
                        resp . statusText ) ;
    } ;

    // Create an instance of the DeclarationFactory.
    var factory = new scope . DeclarationFactory ( ) ;
    // When the parser finds an element, pass it to the factory to create a declaration.
    parser . onparse = factory . createDeclaration ;
    // When the factory creates a declaration, process it.
    factory . oncreate = function ( declaration )
    {
      // Find all elements in the document that match the custom element's definition
      // (e.g., <div is="my-element">).
      forEach (
        document . querySelectorAll ( declaration . element . extendsTagName +
                                      '[is=' + declaration . element . name + ']' ) ,
        declaration . morph ) ; // Morph these elements into custom element instances.
    } ;
  } ; // End of scope.run function.

  // If 'scope.runManually' is not explicitly set to true, automatically run the initialization.
  if ( ! scope . runManually )
  {
    scope . run ( ) ;
  }

  // Define a dummy 'nil' function, used as a default for optional callbacks.
  function nil ( ) { }

} ) ( window . __exported_components_polyfill_scope__ ) ; // Pass the global scope object to the IIFE.