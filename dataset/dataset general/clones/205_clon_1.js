/*
 * This script segment is dedicated to enhancing user experience by automatically collapsing
 * navigation elements in the secondary content area once they have been activated or used.
 * It's designed to keep the interface tidy and focused.
 */

// The jQuery document ready function ensures that this code executes only after
// the entire Document Object Model (DOM) is fully loaded and parsed.
$(   function  (  )
{
    // We utilize event delegation on the 'body' element to efficiently capture click events
    // on all current and future '.ui-collapsible-content' elements within '.content-secondary'.
    // This is a robust way to handle dynamic content without re-binding events.
    $(  'body'  )  .  delegate  (   '.content-secondary .ui-collapsible-content'  ,  'click'  ,  function  (  )
        {
            // When such an element is clicked, we programmatically trigger its 'collapse' event.
            // This effectively closes the collapsible content, achieving the desired UI behavior.
            $(  this  )  .  trigger  (  "collapse"  )  ;
        }
    )  ;
}  )  ;


// This section focuses on dynamically displaying the current version of jQuery Mobile (jQM)
// on the webpage. This is often useful for debugging or informational purposes.
$(  document  )  .  bind  (  'pageinit'  ,  function  (  )
{
    // Attempt to retrieve the jQuery Mobile version. If it's undefined, default to "dev".
    var  version  =  $.mobile.version  ||  "dev"  ,

        // Split the version string into its components, typically by hyphens.
        words     =  version  .  split  (  "-"  )  ,

        // Extract the primary version number (e.g., "1.4.5").
        ver       =  words[  0  ]  ,

        // Determine the version suffix (e.g., "beta", "rc1", or "Final" if none).
        str       =  (  words[  1  ]  ||  "Final"  )  ,

        // Initialize the HTML string that will be displayed, starting with the primary version.
        html      =  ver  ;


    // Check if the suffix string contains "rc" (indicating a release candidate).
    if  (  str  .  indexOf  (  "rc"  )  ==  -1  )
    {
        // If it's not a release candidate, capitalize only the first letter of the suffix.
        str  =  str  .  charAt  (  0  )  .  toUpperCase  (  )  +  str  .  slice  (  1  )  ;
    }
    else
    {
        // If it *is* a release candidate, convert the entire suffix to uppercase and remove any periods.
        str  =  str  .  toUpperCase  (  )  .  replace  (  "."  ,  ""  )  ;
    }

    // If both a jQuery Mobile version is available AND a suffix has been determined,
    // append the formatted suffix to the HTML string within bold tags.
    if  (  $.mobile.version  &&  str  )
    {
        html  +=  "  <b>"  +  str  +  "</b>"  ;
    }

    // Finally, locate the paragraph element with the class 'jqm-version' and update its content
    // with the fully formatted jQuery Mobile version string.
    $(  "p.jqm-version"  )  .  html  (  html  )  ;
}  )  ;



/**
 * This comprehensive conditional block is designed to address compatibility issues
 * when jQuery Mobile documentation (or any jQM project) is accessed directly from
 * the local file system or via certain browser extensions/widgets.
 * It primarily aims to correct navigation links and disable AJAX if necessary.
 */
if  (
       location  .  protocol  .  substr  (  0  ,  4  )   ===  'file'
    || location  .  protocol  .  substr  (  0  ,  11  )  ===  '*-extension'
    || location  .  protocol  .  substr  (  0  ,  6  )   ===  'widget'
)
{

    // Define a utility function that modifies specific types of navigation links.
    // Its purpose is to ensure that directory links correctly point to 'index.html'
    // when browsing locally, as web servers typically handle this automatically.
    var  fixLinks  =  function  (  )
    {
        // Select all anchor tags whose 'href' attribute ends with '/', or is '.' or '..'.
        // Crucially, we exclude links explicitly marked with 'rel="external"' as these
        // are expected to navigate outside the local context.
        $(  "a[href$='/'],  a[href='.'],  a[href='..']"  )  .  not  (  "[rel='external']"  )  .  each  (  function  (  )
            {
                // For each matched link, we modify its 'href'.
                // We remove any trailing slash and then append '/index.html' to it.
                this  .  href  =  $(  this  )  .  attr  (  "href"  )  .  replace  (  /\/$/  ,  ""  )  +  "/index.html"  ;
            }
        )  ;
    }  ;

    // Execute the 'fixLinks' function once the DOM is ready for the initial page load.
    $(  fixLinks  )  ;

    // Bind the 'fixLinks' function to jQuery Mobile's 'pagecreate' event.
    // This ensures that links are corrected not only on the initial page but also
    // for any subsequent pages loaded dynamically via AJAX.
    $(  document  )  .  bind  (  'pagecreate'  ,  fixLinks  )  ;


    // Perform a synchronous AJAX request to the current directory ('.').
    // This is a quick test to determine if AJAX functionality is available and working
    // in the current local browsing environment.
    $.ajax  (  {
        url     :  '.'  ,         // The URL to request (current directory).
        async   :  false  ,       // Make this a synchronous request; the browser will block until it completes.
        isLocal :  true           // Explicitly indicate that this is a local request.
    }  )  .  error  (  function  (  )
    {
        // If the AJAX request fails, it strongly suggests that AJAX is not supported
        // or is encountering security restrictions in the local file system context.
        // In this scenario, we must disable jQuery Mobile's AJAX-based navigation.
        $(  document  )  .  bind  (  "mobileinit"  ,  function  (  )
            {
                // Set jQuery Mobile's global 'ajaxEnabled' flag to 'false'.
                // This prevents jQM from attempting AJAX navigation.
                $.mobile.ajaxEnabled  =  false  ;

                // Create a new 'div' element to serve as a warning message.
                // It's styled as a footer with a specific theme ('ui-bar-e')
                // and includes a custom data attribute for identification.
                var  message  =  $(  '<div>'  ,  {
                    'class'             :  "ui-footer ui-bar-e"  ,
                    style               :  "overflow: auto; padding:10px 15px;"  ,
                    'data-ajax-warning' :  true
                }  )  ;

                // Populate the warning message with user-friendly text, explaining the issue
                // and providing potential solutions or links to help resources.
                message
                    .  append  (  "<h3>Note: Navigation may not work if viewed locally</h3>"  )
                    .  append  (  "<p>The AJAX-based navigation used throughout the jQuery Mobile docs may need to be viewed on a web server to work in certain browsers. If you see an error message when you click a link, try a different browser or <a href='https://github.com/jquery/jquery-mobile/wiki/Downloadable-Docs-Help'>view help</a>.</p>"  )  ;

                // Bind to jQuery Mobile's 'pagecreate' event. This ensures that the warning
                // message is appended to every new page that is initialized, informing the user
                // consistently about the AJAX limitation.
                $(  document  )  .  bind  (  "pagecreate"  ,  function  (  event  )
                    {
                        $(  event  .  target  )  .  append  (  message  )  ;
                    }
                )  ;
            }
        )  ;
    }  )  ;
}