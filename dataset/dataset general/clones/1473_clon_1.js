/*
 * This is a Type I clone of the original mustache.js library.
 * It strictly adheres to the definition, meaning only whitespace
 * and comments have been altered.
 *
 * Original project: mustache.js — Logic-less templates in JavaScript
 * More information at: http://mustache.github.com/
 *
 * This version might look different, but its functionality is identical.
 */

var  Mustache  =  function (  )  {

        // Local cache for compiled regular expressions, optimized by delimiters
        var  regexCache  =  {  } ;


        // The main rendering engine constructor
        var  Renderer  =  function (  )  {  } ;


        Renderer . prototype  =  {

            // Opening tag delimiter for Mustache tags.
            otag : "{{",

            // Closing tag delimiter for Mustache tags.
            ctag : "}}",

            // Storage for pragmas encountered during rendering.
            pragmas : {  } ,

            // Buffer to store rendered output lines.
            buffer : [  ] ,

            // Flags for pragmas that this implementation supports.
            pragmas_implemented : {
                "IMPLICIT-ITERATOR" :  true
            } ,

            // The current rendering context.
            context : {  } ,


            /**
             * Renders a given Mustache template with provided data.
             * This is the core rendering function.
             *
             * @param {string} template The Mustache template string.
             * @param {object} context The data object to render against.
             * @param {object} partials An object containing partial templates.
             * @param {boolean} in_recursion Flag indicating if this is a recursive call.
             * @returns {string|void} The rendered HTML string, or void if not in recursion.
             */
            render :  function (  template ,  context ,  partials ,  in_recursion  )  {

                // If this is not a recursive call, initialize the buffer and context.
                if  (  ! in_recursion  )  {
                    this . context  =  context ;
                    this . buffer  =  [  ] ;  // Note: This buffer could be made non-lazy for performance.
                }


                // Quick check: if the template doesn't contain any Mustache tags,
                // we can return it as-is or send it directly.
                if  (  ! this . includes (  "" ,  template  )  )  {
                    if  (  in_recursion  )  {
                        return  template ;
                    }  else  {
                        this . send (  template  ) ;
                        return ;
                    }
                }


                // Process and apply any pragmas defined in the template.
                template  =  this . render_pragmas (  template  ) ;


                // Attempt to render sections (e.g., {{#foo}}...{{/foo}}).
                var  html  =  this . render_section (  template ,  context ,  partials  ) ;


                // If render_section returned false, it means no sections were found.
                // In this case, we proceed to render simple tags.
                if  (  html  ===  false  )  {
                    html  =  this . render_tags (  template ,  context ,  partials ,  in_recursion  ) ;
                }


                // If this render call was part of a recursion, return the HTML.
                // Otherwise, send the lines to the buffer.
                if  (  in_recursion  )  {
                    return  html ;
                }  else  {
                    this . sendLines (  html  ) ;
                }

            } ,

            // This method adds a single line of output to the internal buffer.
            send :  function (  line  )  {

                if  (  line  !==  ""  )  {
                    this . buffer . push (  line  ) ;
                }

            } ,

            // This helper method takes a block of text, splits it into lines,
            // and then sends each line individually to the buffer.
            sendLines :  function (  text  )  {

                if  (  text  )  {
                    var  lines  =  text . split (  "\n"  ) ;
                    for  (  var  i  =  0 ;  i  <  lines . length ;  i ++  )  {
                        this . send (  lines [  i  ]  ) ;
                    }
                }

            } ,

            /**
             * Processes and renders any pragmas found within the template.
             * Pragmas are special directives like `{{%IMPLICIT-ITERATOR iterator=value}}`.
             *
             * @param {string} template The template string to scan for pragmas.
             * @returns {string} The template string with pragmas removed and processed.
             */
            render_pragmas :  function (  template  )  {

                // If the template doesn't contain any pragma indicators, return early.
                if  (  ! this . includes (  "%" ,  template  )  )  {
                    return  template ;
                }

                // Keep a reference to 'this' for use inside the regex callback.
                var  that  =  this ;


                // Get or create a cached regular expression for pragma matching.
                var  regex  =  this . getCachedRegex (  "render_pragmas" ,  function (  otag ,  ctag  )  {
                    return  new  RegExp (  otag  +  "%([\\w-]+) ?([\\w]+=[\\w]+)?"  +  ctag ,  "g"  ) ;
                }  ) ;


                // Replace pragmas in the template string.
                return  template . replace (  regex ,  function (  match ,  pragma ,  options  )  {
                    // Check if the pragma is supported by this Mustache implementation.
                    if  (  ! that . pragmas_implemented [  pragma  ]  )  {
                        throw (  {
                            message :  "This implementation of mustache doesn't understand the '"  +
                                pragma  +  "' pragma"
                        }  ) ;
                    }

                    // Initialize pragma settings.
                    that . pragmas [  pragma  ]  =  {  } ;


                    // If options are provided, parse them and store in pragma settings.
                    if  (  options  )  {
                        var  opts  =  options . split (  "="  ) ;
                        that . pragmas [  pragma  ] [  opts [  0  ]  ]  =  opts [  1  ] ;
                    }

                    // Pragmas are consumed and do not produce any output in the template.
                    return  "" ;
                    // Note: Unknown pragmas are silently ignored by default, but we throw an error here.
                }  ) ;

            } ,

            /**
             * Attempts to locate and render a partial template.
             * Partials are included templates, e.g., `{{> myPartial}}`.
             *
             * @param {string} name The name of the partial to render.
             * @param {object} context The current data context.
             * @param {object} partials An object containing all available partials.
             * @returns {string} The rendered content of the partial.
             * @throws {object} If the partial is not found.
             */
            render_partial :  function (  name ,  context ,  partials  )  {

                name  =  this . trim (  name  ) ; // Clean up the partial name.

                // Ensure partials object exists and the named partial is defined.
                if  (  ! partials  ||  partials [  name  ]  ===  undefined  )  {
                    throw (  {  message :  "unknown_partial '"  +  name  +  "'"  }  ) ;
                }

                // If the context for the partial is not an object, use the current context.
                if  (  typeof (  context [  name  ]  )  !=  "object"  )  {
                    return  this . render (  partials [  name  ] ,  context ,  partials ,  true  ) ;
                }

                // Otherwise, use the named property from the context as the partial's context.
                return  this . render (  partials [  name  ] ,  context [  name  ] ,  partials ,  true  ) ;

            } ,

            /**
             * Handles the rendering of both inverted sections (`{{^key}}...{{/key}}`)
             * and normal sections (`{{#key}}...{{/key}}`).
             *
             * @param {string} template The template string containing sections.
             * @param {object} context The current data context.
             * @param {object} partials An object of partial templates.
             * @returns {string|boolean} The template with sections rendered, or `false` if no sections were found.
             */
            render_section :  function (  template ,  context ,  partials  )  {

                // Quick exit if no section tags are present in the template.
                if  (  ! this . includes (  "#" ,  template  )  &&  ! this . includes (  "^" ,  template  )  )  {
                    // No sections were identified, so nothing was rendered by this function.
                    return  false ;
                }

                // Store 'this' for consistent context within nested functions.
                var  that  =  this ;

                // Retrieve a cached regular expression for matching Mustache sections.
                var  regex  =  this . getCachedRegex (  "render_section" ,  function (  otag ,  ctag  )  {
                    // This complex regex is designed to match the _first_ complete section
                    // (e.g., {{#foo}}...{{/foo}}) and capture its various parts,
                    // including any content before, within, and after the section.
                    return  new  RegExp (
                          "^([\\s\\S]*?)"                                        // $1: All content before the opening section tag.
                        +  otag                                                  // Match the opening delimiter (e.g., "{{").
                        +  "(\\^|\\#)\\s*(.+)\\s*"                               // $2: Section type ('^' for inverted, '#' for normal). $3: Section name.
                        +  ctag                                                  // Match the closing delimiter (e.g., "}}").
                        +  "\n*([\\s\\S]*?)"                                     // $4: The content *inside* the section. Leading newlines are consumed.
                        +  otag                                                  // Match the opening delimiter for the closing tag.
                        +  "\\/\\s*\\3\\s*"                                      // Match the closing tag's name (back-reference to $3).
                        +  ctag                                                  // Match the closing delimiter for the closing tag.
                        +  "\\s*([\\s\\S]*)$",                                   // $5: All content after the closing section tag. Trailing whitespace is consumed.
                    "g"  ) ;
                }  ) ;


                // Replace all matching sections in the template.
                return  template . replace (  regex ,  function (  match ,  before ,  type ,  name ,  content ,  after  )  {
                    // Render the content that appeared *before* this section.
                    // This content might contain simple tags but no other sections.
                    var  renderedBefore  =  before  ?  that . render_tags (  before ,  context ,  partials ,  true  )  :  "" ;

                    // Render the content that appeared *after* this section.
                    // This content could contain further sections or tags, so use the full render function.
                    var  renderedAfter  =  after  ?  that . render (  after ,  context ,  partials ,  true  )  :  "" ;

                    // This variable will hold the rendered output of the section's content.
                    var  renderedContent ;

                    // Retrieve the value associated with the section's name from the current context.
                    var  value  =  that . find (  name ,  context  ) ;

                    // Handle inverted sections ({{^key}}...{{/key}}).
                    if  (  type  ===  "^"  )  {
                        // An inverted section renders its content if the value is falsy
                        // or if it's an empty array.
                        if  (  ! value  ||  (  that . is_array (  value  )  &&  value . length  ===  0  )  )  {
                            renderedContent  =  that . render (  content ,  context ,  partials ,  true  ) ;
                        }  else  {
                            // If the value is truthy, the inverted section's content is not rendered.
                            renderedContent  =  "" ;
                        }
                    }  else  if  (  type  ===  "#"  )  {  // Handle normal sections ({{#key}}...{{/key}}).
                        // If the value is an array, iterate over it and render the content for each item.
                        if  (  that . is_array (  value  )  )  {
                            renderedContent  =  that . map (  value ,  function (  row  )  {
                                return  that . render (  content ,  that . create_context (  row  ) ,  partials ,  true  ) ;
                            }  ) . join (  ""  ) ;
                        }  else  if  (  that . is_object (  value  )  )  {  // If value is an object, use it as a sub-context.
                            renderedContent  =  that . render (  content ,  that . create_context (  value  ) ,
                                partials ,  true  ) ;
                        }  else  if  (  typeof  value  ===  "function"  )  {
                            // If value is a function, it's a Higher-Order Section.
                            // Call the function with the section content and a renderer callback.
                            renderedContent  =  value . call (  context ,  content ,  function (  text  )  {
                                return  that . render (  text ,  context ,  partials ,  true  ) ;
                            }  ) ;
                        }  else  if  (  value  )  {  // If value is truthy (boolean section), render content with current context.
                            renderedContent  =  that . render (  content ,  context ,  partials ,  true  ) ;
                        }  else  {
                            // If value is falsy, the normal section's content is not rendered.
                            renderedContent  =  "" ;
                        }
                    }

                    // Concatenate and return the rendered parts.
                    return  renderedBefore  +  renderedContent  +  renderedAfter ;
                }  ) ;

            } ,

            /**
             * Replaces simple Mustache tags (e.g., `{{key}}`, `{{{key}}}`, `{{!comment}}`, `{{>partial}}`, `{{= | | =}}`)
             * with their corresponding values or actions.
             *
             * @param {string} template The template string containing tags.
             * @param {object} context The current data context.
             * @param {object} partials An object of partial templates.
             * @param {boolean} in_recursion Flag indicating if this is a recursive call.
             * @returns {string|void} The template with tags rendered, or void if not in recursion.
             */
            render_tags :  function (  template ,  context ,  partials ,  in_recursion  )  {

                // Capture 'this' for use in nested functions.
                var  that  =  this ;


                // Helper function to generate and cache the regex for tags.
                // This is called when delimiters change.
                var  new_regex  =  function (  )  {
                    return  that . getCachedRegex (  "render_tags" ,  function (  otag ,  ctag  )  {
                        // Regex matches various tag types:
                        // {{= ... =}} (delimiter change)
                        // {{! ... }} (comment)
                        // {{> ... }} (partial)
                        // {{{ ... }}} (unescaped HTML)
                        // {{% ... }} (pragma - though pragmas are handled earlier)
                        // {{ ... }} (escaped HTML)
                        return  new  RegExp (  otag  +  "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?"  +  ctag  +  "+" ,  "g"  ) ;
                    }  ) ;
                } ;

                // Initialize the regex based on current delimiters.
                var  regex  =  new_regex (  ) ;

                // Callback function for the `template.replace` method.
                var  tag_replace_callback  =  function (  match ,  operator ,  name  )  {

                    switch (  operator  )  {
                        case  "!" :  // Handle comment tags ({{! comment }}).
                            return  "" ; // Comments are ignored and replaced with an empty string.

                        case  "=" :  // Handle delimiter change tags ({{= | | =}}).
                            that . set_delimiters (  name  ) ; // Update the delimiters.
                            regex  =  new_regex (  ) ; // Rebuild the tag regex with new delimiters.
                            return  "" ; // Delimiter tags are consumed.

                        case  ">" :  // Handle partial tags ({{> partialName }}).
                            return  that . render_partial (  name ,  context ,  partials  ) ;

                        case  "{" :  // Handle unescaped HTML tags ({{{ unescapedValue }}}).
                            return  that . find (  name ,  context  ) ; // Directly return the value without escaping.

                        default :  // Handle standard escaped HTML tags ({{ escapedValue }}).
                            return  that . escape (  that . find (  name ,  context  )  ) ; // Escape the value before returning.
                    }

                } ;


                // Process the template line by line.
                var  lines  =  template . split (  "\n"  ) ;
                for (  var  i  =  0 ;  i  <  lines . length ;  i ++  )  {
                    lines [  i  ]  =  lines [  i  ] . replace (  regex ,  tag_replace_callback ,  this  ) ;
                    // If not in a recursive call, send each processed line to the buffer.
                    if  (  ! in_recursion  )  {
                        this . send (  lines [  i  ]  ) ;
                    }
                }

                // If in a recursive call, join the processed lines and return the result.
                if  (  in_recursion  )  {
                    return  lines . join (  "\n"  ) ;
                }

            } ,

            /**
             * Sets new opening and closing tag delimiters for Mustache.
             * This affects how subsequent tags are parsed.
             *
             * @param {string} delimiters A string containing the new opening and closing delimiters, separated by a space (e.g., "[[ ]]").
             */
            set_delimiters :  function (  delimiters  )  {

                var  dels  =  delimiters . split (  " "  ) ;
                this . otag  =  this . escape_regex (  dels [  0  ]  ) ; // Escape the new opening tag for regex use.
                this . ctag  =  this . escape_regex (  dels [  1  ]  ) ; // Escape the new closing tag for regex use.

            } ,

            /**
             * Escapes special characters in a string so it can be used safely within a regular expression.
             *
             * @param {string} text The string to escape.
             * @returns {string} The escaped string.
             */
            escape_regex :  function (  text  )  {

                // Acknowledge the original source for this regex escaping logic.
                // (Credit: Simon Willison)

                // Use a static property on the function to cache the regex for special characters.
                if  (  ! arguments . callee . sRE  )  {
                    var  specials  =  [
                          '/' ,  '.' ,  '*' ,  '+' ,
                          '?' ,  '|' ,  '(' ,  ')' ,
                          '[' ,  ']' ,  '{' ,  '}' ,
                          '\\'
                    ] ;
                    arguments . callee . sRE  =  new  RegExp (
                          '(\\'  +  specials . join (  '|\\'  )  +  ')' ,
                    'g'  ) ;
                }

                // Replace all special characters with their escaped versions.
                return  text . replace (  arguments . callee . sRE ,  '\\$1'  ) ;

            } ,

            /**
             * Locates and retrieves a value from the current rendering `context`
             * based on the provided `name`. Supports dot-notation for nested properties.
             *
             * @param {string} name The name of the property to find (e.g., "foo" or "user.address.street").
             * @param {object} context The current data context object.
             * @returns {*} The found value, or an empty string if not found.
             */
            find :  function (  name ,  context  )  {

                name  =  this . trim (  name  ) ; // Remove any leading/trailing whitespace from the name.

                // Internal helper function to check if a value is "truthy" in a specific way,
                // considering `false` and `0` as truthy in some Mustache contexts.
                function  is_kinda_truthy (  bool  )  {
                    return  bool  ===  false  ||  bool  ===  0  ||  bool ;
                }

                var  value ;

                // Check if the name uses dot notation (e.g., "foo.bar").
                if  (  name . match (  /([a-z_]+)\./ig  )  )  {
                    var  childValue  =  this . walk_context (  name ,  context  ) ;
                    if  (  is_kinda_truthy (  childValue  )  )  {
                        value  =  childValue ;
                    }
                }
                else  { // If no dot notation, look directly in current context or global context.
                    if  (  is_kinda_truthy (  context [  name  ]  )  )  {
                        value  =  context [  name  ] ;
                    }  else  if  (  is_kinda_truthy (  this . context [  name  ]  )  )  {
                        value  =  this . context [  name  ] ;
                    }
                }


                // If the found value is a function, execute it with the current context as 'this'.
                if  (  typeof  value  ===  "function"  )  {
                    return  value . apply (  context  ) ;
                }

                // If a value was found and it's not undefined, return it.
                if  (  value  !==  undefined  )  {
                    return  value ;
                }

                // If no value was found, silently return an empty string.
                return  "" ;

            } ,

            /**
             * Traverses the context object using dot notation to find a nested property.
             *
             * @param {string} name The dot-separated path to the property (e.g., "user.profile.name").
             * @param {object} context The starting data context.
             * @returns {*} The value found at the specified path, or `undefined` if not found.
             */
            walk_context :  function (  name ,  context  )  {

                var  path  =  name . split (  '.'  ) ;

                // Determine the initial context for walking: either the current context
                // or the top-level renderer context if the first path segment isn't found.
                var  value_context  =  (  context [  path [  0  ]  ]  !=  undefined  )  ?  context  :  this . context ;

                // Get the first segment's value.
                var  value  =  value_context [  path . shift (  )  ] ;


                // Traverse the rest of the path segments.
                while (  value  !=  undefined  &&  path . length  >  0  )  {
                    value_context  =  value ; // Update the current context to the found value.
                    value  =  value [  path . shift (  )  ] ; // Move to the next segment.
                }

                // If the final value is a function, execute it, binding the correct context.
                if  (  typeof  value  ===  "function"  )  {
                    return  value . apply (  value_context  ) ;
                }

                return  value ; // Return the found value (or undefined).

            } ,

            // --- Utility Methods for Renderer ---

            /**
             * Checks if a given `haystack` string contains a Mustache tag that starts with `needle`.
             * This is a quick check to avoid full regex parsing.
             *
             * @param {string} needle The character or string to look for after the opening tag.
             * @param {string} haystack The string to search within.
             * @returns {boolean} True if the tag is found, false otherwise.
             */
            includes :  function (  needle ,  haystack  )  {
                return  haystack . indexOf (  this . otag  +  needle  )  !=  - 1 ;
            } ,

            /**
             * Escapes HTML special characters in a string to prevent XSS vulnerabilities.
             *
             * @param {*} s The value to escape. Can be null or any type convertible to string.
             * @returns {string} The HTML-escaped string.
             */
            escape :  function (  s  )  {
                // Ensure the input is treated as a string; convert null to an empty string.
                s  =  String (  s  ===  null  ?  ""  :  s  ) ;

                // Replace specific characters with their HTML entity equivalents.
                return  s . replace (  /&(?!\w+;)|["'<>\\]/g ,  function (  s  )  {
                    switch (  s  )  {
                        case  "&" :  return  "&amp;" ;
                        case  "\"" :  return  '&quot;' ;
                        case  "'" :  return  '&#39;' ;
                        case  "<" :  return  "&lt;" ;
                        case  ">" :  return  "&gt;" ;
                        default :  return  s ; // For any other matched character (like backslash), return as is.
                    }
                }  ) ;
            } ,

            /**
             * Creates a new context object, especially useful for array iteration.
             * If the input `_context` is an object, it's returned directly.
             * Otherwise, a new object is created with `_context` assigned to an iterator key.
             *
             * @param {*} _context The value to be wrapped in a context.
             * @returns {object} The new or wrapped context object.
             */
            create_context :  function (  _context  )  {
                if  (  this . is_object (  _context  )  )  {
                    return  _context ;
                }  else  {
                    var  iterator  =  "." ; // Default iterator name.
                    // Check for IMPLICIT-ITERATOR pragma to override the default.
                    if  (  this . pragmas [  "IMPLICIT-ITERATOR"  ]  )  {
                        iterator  =  this . pragmas [  "IMPLICIT-ITERATOR"  ] . iterator ;
                    }
                    var  ctx  =  {  } ;
                    ctx [  iterator  ]  =  _context ; // Assign the value to the iterator key.
                    return  ctx ;
                }
            } ,

            /**
             * Checks if a given variable is an object (and not null).
             *
             * @param {*} a The variable to check.
             * @returns {boolean} True if `a` is an object, false otherwise.
             */
            is_object :  function (  a  )  {
                return  a  &&  typeof  a  ==  "object" ;
            } ,

            /**
             * Checks if a given variable is an array.
             *
             * @param {*} a The variable to check.
             * @returns {boolean} True if `a` is an array, false otherwise.
             */
            is_array :  function (  a  )  {
                return  Object . prototype . toString . call (  a  )  ===  '[object Array]' ;
            } ,

            /**
             * Removes leading and trailing whitespace from a string.
             *
             * @param {string} s The string to trim.
             * @returns {string} The trimmed string.
             */
            trim :  function (  s  )  {
                return  s . replace (  /^\s*|\s*$/g ,  ""  ) ;
            } ,

            /**
             * Provides a cross-browser compatible `map` function for arrays.
             * Falls back to a manual loop if `Array.prototype.map` is not available.
             *
             * @param {Array} array The array to iterate over.
             * @param {Function} fn The callback function to apply to each element.
             * @returns {Array} A new array with the results of the callback function.
             */
            map :  function (  array ,  fn  )  {
                if  (  typeof  array . map  ==  "function"  )  {
                    return  array . map (  fn  ) ;
                }  else  {
                    var  r  =  [  ] ;
                    var  l  =  array . length ;
                    for (  var  i  =  0 ;  i  <  l ;  i ++  )  {
                        r . push (  fn (  array [  i  ]  )  ) ;
                    }
                    return  r ;
                }
            } ,

            /**
             * Retrieves a compiled regular expression from a cache.
             * If the regex is not in the cache, it generates it using the provided `generator` function
             * and then stores it for future use. This prevents recompiling regexes repeatedly.
             * The cache is keyed by `otag`, then `ctag`, then `name`.
             *
             * @param {string} name A unique identifier for the regex (e.g., "render_tags").
             * @param {Function} generator A function that takes `otag` and `ctag` and returns a new RegExp object.
             * @returns {RegExp} The cached or newly generated regular expression.
             */
            getCachedRegex :  function (  name ,  generator  )  {

                // Access the cache level for the current opening tag.
                var  byOtag  =  regexCache [  this . otag  ] ;
                if  (  ! byOtag  )  {
                    byOtag  =  regexCache [  this . otag  ]  =  {  } ; // Initialize if it doesn't exist.
                }

                // Access the cache level for the current closing tag.
                var  byCtag  =  byOtag [  this . ctag  ] ;
                if  (  ! byCtag  )  {
                    byCtag  =  byOtag [  this . ctag  ]  =  {  } ; // Initialize if it doesn't exist.
                }

                // Retrieve the specific regex by its name.
                var  regex  =  byCtag [  name  ] ;
                if  (  ! regex  )  {
                    // If not found, generate it using the provided function and store it.
                    regex  =  byCtag [  name  ]  =  generator (  this . otag ,  this . ctag  ) ;
                }

                return  regex ; // Return the cached or newly generated regex.
            }
        } ; // End of Renderer.prototype


        // The public interface of the Mustache library.
        return (  {
            name :  "mustache.js" ,
            version :  "0.4.0-dev" ,

            /**
             * The primary public method to render a Mustache template.
             *
             * @param {string} template The raw Mustache template string.
             * @param {object} view The data context object.
             * @param {object} partials An object of partial templates.
             * @param {Function} [send_fun] Optional. A function to send output lines to incrementally.
             * @returns {string|void} The final rendered HTML string, or void if `send_fun` is provided.
             */
            to_html :  function (  template ,  view ,  partials ,  send_fun  )  {

                // Create a new renderer instance for each rendering operation.
                var  renderer  =  new  Renderer (  ) ;

                // If an external send function is provided, use it.
                if  (  send_fun  )  {
                    renderer . send  =  send_fun ;
                }

                // Perform the rendering. Use an empty object if no view is provided.
                renderer . render (  template ,  view  ||  {  } ,  partials  ) ;

                // If no external send function was provided, return the accumulated buffer as a single string.
                if  (  ! send_fun  )  {
                    return  renderer . buffer . join (  "\n"  ) ;
                }

            }
        }  ) ;

    } (  ) ; // Execute the anonymous function to initialize Mustache.