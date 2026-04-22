/*
 * Core configuration and utility functions for the Ditto web application.
 * This file handles page routing, content rendering, and UI element initialization.
 */

var ditto =
{
  // Identifiers for key DOM elements on the page
  content_id:          "#content",
  sidebar_id:          "#sidebar",
  edit_id:             "#edit",
  back_to_top_id:      "#back_to_top",
  loading_id:          "#loading",
  error_id:            "#error",


  // Feature toggles for displaying UI components
  sidebar:             true,
  edit_button:         true,
  back_to_top_button:  true,
  save_progress:       true, /* Retains reading progress */

  // The main entry point function for initialization
  run:                 initialize
};


// HTML snippet for the Disqus comment section
var disqusCode = '<h3>留言</h3><div id="disqus_thread"></div>';


// Array to store menu items, typically for navigation
var menu = new Array();


/**
 * Main initialization function for the application.
 * Sets up various UI components and event handlers.
 */
function initialize()
{
  // Set up the sidebar if enabled in the configuration
  if (ditto.sidebar)
  {
    init_sidebar_section();
  }

  // Initialize the 'back to top' button functionality
  if (ditto.back_to_top_button)
  {
    init_back_to_top_button();
  }

  // Set up the edit button if it's configured to be displayed
  if (ditto.edit_button)
  {
    init_edit_button();
  }


  // Initialize the page routing mechanism
  router();
  // Attach an event listener for hash changes to trigger routing
  $(window).on('hashchange', router);
}


/*
 * Initializes the sidebar section by loading content from a file,
 * processing it with 'marked', and setting up navigation buttons.
 */
function init_sidebar_section()
{
  $.get(ditto.sidebar_file, function(data)
  {
    // Render the fetched markdown data into the sidebar element
    $(ditto.sidebar_id).html(marked(data));

    // Initialize the content array for navigation
    var menuOL = $(ditto.sidebar_id + ' ol');
    menuOL.attr('start', 0); // Set the 'start' attribute for ordered list

    // Populate the 'menu' array with anchor links from the sidebar
    menuOL.find('li a').map(function()
    {
      menu.push(this.href.slice(this.href.indexOf('#')));
    });

    // Event handler for the 'pageup' button
    $('#pageup').on('click', function()
    {
      for (var i = 0; i < menu.length; i++)
      {
        if (location.hash === '') break; // Break if hash is empty
        if (menu[i] === location.hash) break; // Break if current hash matches menu item
      }
      // Navigate to the previous menu item
      location.hash = menu[i - 1];
    });

    // Event handler for the 'pagedown' button
    $('#pagedown').on('click', function()
    {
      for (var i = 0; i < menu.length; i++)
      {
        if (location.hash === '') break; // Stop if no hash
        if (menu[i] === location.hash) break; // Stop if match found
      }
      // Navigate to the next menu item
      location.hash = menu[i + 1];
    });
  }, "text")
  .fail(function()
  {
    // Alert the user if the sidebar file cannot be loaded
    alert("Opps! can't find the sidebar file to display!");
  });
}


/*
 * Sets up the 'back to top' button functionality.
 * Makes the button visible and attaches a click event to scroll to the page top.
 */
function init_back_to_top_button()
{
  // Display the back to top button
  $(ditto.back_to_top_id).show();

  // Attach a click event listener to the button
  $(ditto.back_to_top_id).on("click", function()
  {
    // Animate the scroll position to the very top of the page
    $("html body").animate({
      scrollTop: 0
    }, 200); // Animation duration: 200 milliseconds
  });
}


/**
 * Initializes the edit button, making it visible and
 * setting up its click handler to open the source file.
 */
function init_edit_button()
{
  // Check if the base URL is configured
  if (ditto.base_url === null)
  {
    // Alert the user about the missing base_url configuration
    alert("Error! You didn't set 'base_url' when calling ditto.run()!");
  }
  else
  {
    // Show the edit button
    $(ditto.edit_id).show();

    // Attach a click event handler to the edit button
    $(ditto.edit_id).on("click", function()
    {
      // Get the current hash and format it for the URL
      var hash = location.hash.replace("#", "/");

      // If hash is empty, use the default index file
      if (hash === "")
      {
        hash = "/" + ditto.index.replace(".md", "");
      }

      // Open the corresponding markdown file in a new window
      window.open(ditto.base_url + hash + ".md");
      /*
       * Using window.open is preferred over redirecting (location.href = ...)
       * to maintain proper browser history state for the user.
       */
    });
  }
}


/*
 * Replaces a predefined set of special symbols in a given text string
 * with underscores. This is typically used to create HTML-safe IDs.
 * @param {string} text - The input string to process.
 * @returns {string} The string with symbols replaced by underscores.
 */
function replace_symbols(text)
{
  // Perform the replacement using a regular expression
  return text.replace(/[&\/\\#,+=()$~%.'":*?<>{}\ \]\[]/g, "_");
}


/**
 * Creates a clickable linkage for a list item (`li_tag`) that,
 * when clicked, scrolls to a corresponding header and highlights it.
 * @param {jQuery} li_tag - The jQuery object for the list item.
 * @param {number} header_level - The HTML header level (e.g., 1 for h1, 2 for h2).
 */
function li_create_linkage(li_tag, header_level)
{
  // Generate an HTML-safe ID from the list item's text content
  html_safe_tag = replace_symbols(li_tag.text());

  // Assign the generated ID to the list item
  li_tag.attr("id", html_safe_tag);

  // Add a class for styling purposes
  li_tag.attr("class", "link");

  // Attach a click event listener to the newly created list item
  $(ditto.content_id + " li#" + li_tag.attr("id")).click(function()
  {
    // Find the corresponding header element based on its level and ID
    var header = $(
      ditto.content_id + " h" + header_level + "." + li_tag.attr("id")
    );

    // Animate the scroll position to bring the header into view
    $('html, body').animate({
      scrollTop: header.offset().top
    }, 200); // Scroll animation duration

    // Store the original text color of the header for later restoration
    original_color = header.css("color");

    // Animate the header's color to highlight it
    header.animate({ color: "#ED1C24", }, 500, function()
    {
      // After highlighting, animate the color back to its original state
      $(this).animate({color: original_color}, 2500); // Revert animation duration
    });
  });
}


/*
 * Generates page anchors and a table of contents (TOC)
 * by associating list items with corresponding header elements.
 * This enables smooth scrolling and highlighting functionality.
 */
function create_page_anchors()
{
  // Iterate through header levels (h1, h2, h3, h4)
  for (var i = 1; i <= 4; i++)
  {
    // Collect all headers of the current level
    var headers = [];
    $('#content h' + i).map(function()
    {
      headers.push($(this).text()); // Store header text
      // Add a class to the header for identification
      $(this).addClass(replace_symbols($(this).text()));
      // Assign a unique ID to the header element
      this.id = 'h' + i + '-' + replace_symbols($(this).text());
    });

    // If it's an H2 header and there are headers found, create a TOC
    if ((i === 2) && headers.length !== 0)
    {
      // Create an ordered list element for the Table of Contents
      var ul_tag = $('<ol></ol>')
        .insertAfter('#content h1') // Insert after the first H1
        .addClass("content-toc")    // Add a CSS class
        .attr('id', 'content-toc'); // Assign an ID to the TOC

      // For each H2 header found, create a list item in the TOC
      for (var j = 0; j < headers.length; j++)
      {
        var li_tag = $('<li></li>').text(headers[j]);
        ul_tag.append(li_tag); // Append the list item to the TOC
        li_create_linkage(li_tag, i); // Make the list item clickable
      }
    }
  }
}


/*
 * Normalizes relative image paths within the content area.
 * Converts relative paths (e.g., "./image.jpg") to absolute paths
 * based on the current URL's hash.
 */
function normalize_paths()
{
  // Process all image elements within the content area
  $(ditto.content_id + " img").map(function()
  {
    var src = $(this).attr("src").replace("./", ""); // Clean up "./" prefix

    // Check if the image source is not an absolute HTTP/HTTPS URL
    if ($(this).attr("src").slice(0, 5) !== "http")
    {
      var url = location.hash.replace("#", ""); // Get the URL hash, remove '#'

      // Split the URL path and extract the base directory
      url = url.split("/");
      var base_dir = url.slice(0, url.length - 1).toString();

      // Set the 'src' attribute to the normalized (absolute) path
      $(this).attr("src", base_dir + "/" + src);
    }
  });
}


/*
 * Displays the error message element.
 * Also logs a message to the console for debugging purposes.
 */
function show_error()
{
  console.log("SHOW ERORR!"); // Log to console
  $(ditto.error_id).show();    // Make the error element visible
}


/**
 * Displays a loading indicator and clears the main content area.
 * Initiates an animation loop for the loading indicator.
 * @returns {number} The interval ID, which can be used with `clearInterval`.
 */
function show_loading()
{
  $(ditto.loading_id).show();    // Show the loading spinner/indicator
  $(ditto.content_id).html("");  // Clear any existing content

  /*
   * Set up an interval to animate the loading indicator (fade in/out).
   * This loop continues indefinitely until `clearInterval` is explicitly called.
   */
  var loading = setInterval(function()
  {
    $(ditto.loading_id).fadeIn(1000).fadeOut(1000); // Fade in for 1s, fade out for 1s
  }, 2000); // Repeat every 2 seconds

  return loading; // Return the interval ID for external control
}


/*
 * The main routing function. It determines the content to load based on the URL hash,
 * fetches and renders markdown, updates page title, and initializes dynamic elements
 * like anchors, code highlighting, and Disqus comments.
 */
function router()
{
  var path = location.hash.replace("#", "./"); // Derive path from URL hash

  // Check if progress saving is enabled and the menu progress has changed
  if (ditto.save_progress && store.get('menu-progress') !== location.hash)
  {
    store.set('menu-progress', location.hash); // Save current hash as menu progress
    store.set('page-progress', 0);             // Reset page scroll progress
  }

  // Determine the default page if the hash is empty
  if (location.pathname === "/index.html")
  {
    path = location.pathname.replace("index.html", ditto.index);
    normalize_paths(); // Normalize image paths for the default page
  }
  else if (path === "")
  {
    path = window.location + ditto.index; // Use window.location with default index
    normalize_paths(); // Ensure paths are correct
  }
  else
  {
    path = path + ".md"; // Append .md extension for markdown files
  }

  // Temporarily disable the scroll event listener to prevent interference
  // This is done to avoid modifying the 'perc' variable prematurely.
  $(window).off('scroll');

  // Fetch the markdown content and render it
  var loading = show_loading(); // Display loading indicator
  $.get(path, function(data)
  {
    $(ditto.error_id).hide(); // Hide any error messages
    // Render markdown data and append Disqus comment section
    $(ditto.content_id).html(marked(data) + disqusCode);

    // Update the document title based on the content's main heading
    if ($(ditto.content_id + " h1").text() === ditto.document_title)
    {
      document.title = ditto.document_title; // Use configured document title
    }
    else
    {
      document.title = $(ditto.content_id + " h1").text() + " - " + ditto.document_title;
    }

    normalize_paths();      // Re-normalize image paths after content is loaded
    create_page_anchors();  // Create clickable anchors and TOC

    // Apply code highlighting to all 'code' blocks within the content
    $('#content code').map(function()
    {
      Prism.highlightElement(this); // Use Prism.js for syntax highlighting
    });

    // Immediately Invoked Function Expression (IIFE) for Disqus comments
    (function()
    {
      // Configure Disqus variables as per their documentation
      window.disqus_shortname = 'es6';
      window.disqus_identifier = (location.hash ? location.hash.replace("#", "") : 'READEME');
      window.disqus_title = $(ditto.content_id + " h1").text();
      window.disqus_url = 'http://es6.ruanyifeng.com/' + (location.hash ? location.hash.replace("#", "") : 'README');

      // Another IIFE to dynamically load the Disqus embed script
      (function()
      {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = 'http://' + window.disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
      })();
    })();

    // Retrieve saved page scroll progress if saving is enabled
    var perc = ditto.save_progress ? store.get('page-progress') || 0 : 0;

    // Restore scroll position if a hash is present or progress was saved
    if (location.hash !== '' || Boolean(perc))
    {
      if (!Boolean(perc))
      {
        // If no specific progress, scroll to the top of the content area
        $('html, body').animate({
          scrollTop: $('#content').offset().top
        }, 200);
      }
      else
      {
        // Scroll to the saved percentage of the page height
        $('html, body').animate({
          scrollTop: ($('body').height()-$(window).height())*perc
        }, 200);
      }
    }

    // Adjust visibility of 'pageup' navigation button
    if (location.hash === '' || location.hash === menu[0])
    {
      $('#pageup').css('display', 'none'); // Hide if at the first item
    }
    else
    {
      $('#pageup').css('display', 'inline-block'); // Show otherwise
    }

    // Adjust visibility of 'pagedown' navigation button
    if (location.hash === menu[(menu.length - 1)])
    {
      $('#pagedown').css('display', 'none'); // Hide if at the last item
    }
    else
    {
      $('#pagedown').css('display', 'inline-block'); // Show otherwise
    }

    // IIFE for scroll progress indicator and saving
    (function()
    {
      var $w = $(window);              // jQuery wrapped window object
      var $prog2 = $('.progress-indicator-2'); // Progress bar element
      var wh = $w.height();            // Window height
      var h = $('body').height();      // Document body height
      var sHeight = h - wh;            // Total scrollable height

      // Attach a scroll event listener to the window
      $w.on('scroll', function()
      {
        // Calculate scroll percentage, clamped between 0 and 1
        var perc = Math.max(0, Math.min(1, $w.scrollTop() / sHeight));
        updateProgress(perc); // Update the progress bar
      });

      // Inner function to update the visual progress bar and save progress
      function updateProgress(perc)
      {
        $prog2.css({width: perc * 100 + '%'}); // Set width of progress bar
        ditto.save_progress && store.set('page-progress', perc); // Save progress if enabled
      }
    }());

  }) // End of $.get success callback
  .fail(function()
  {
    show_error(); // Display error if markdown fetching fails
  })
  .always(function()
  {
    clearInterval(loading);       // Stop the loading indicator animation
    $(ditto.loading_id).hide();   // Hide the loading element
  });
}