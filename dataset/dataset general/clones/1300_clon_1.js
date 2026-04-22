/*
 * This is a JavaScript bookmarklet designed to redirect the current browser tab
 * to the corresponding page on nbviewer.ipython.org, based on the URL's format.
 *
 * It supports GitHub Gist URLs, GitHub repository .ipynb file URLs,
 * and direct HTTPS/HTTP links to .ipynb files.
 *
 * This version is a Type I clone, meaning all functional code elements
 * (identifiers, operators, expressions, and statements) are preserved exactly.
 * Only whitespace (indentation, spacing, newlines) and comments have been
 * extensively modified to create a visually distinct but functionally identical output.
 */
javascript:  // The standard bookmarklet prefix, preserved as is.
date = new Date ( ) ;   // Create a new Date object; its timestamp will be used for unique window naming.

// Define the base URL for the nbviewer service.
url_root   =   'http://nbviewer.ipython.org/' ;


url = null ;   // Initialize the 'url' variable, which will store the final nbviewer URL.

/**
 * Regular expression to detect and parse GitHub Gist URLs.
 * It captures the unique Gist ID.
 * Example: https://gist.github.com/username/gist_id or https://gist.github.com/gist_id
 */
gist_re = /^https?:\/\/gist\.github\.com\/(?:\w+\/)?([a-f0-9]+)$/ ;

// Regular expression to detect and parse GitHub repository URLs pointing to .ipynb files.
// It captures the repository path and the filename.
// Example: https://github.com/owner/repo/blob/branch/path/to/notebook.ipynb
github_re = /^https:\/\/(github\.com\/.*\/)blob\/(.*\.ipynb)$/ ;

/*
 * Regular expression to detect and parse direct HTTPS links to .ipynb files.
 * This is a more general pattern for HTTPS.
 */
https_re = /^https:\/\/(.*\.ipynb)$/ ;


// Regular expression to detect and parse direct HTTP links to .ipynb files.
// A general pattern for HTTP links.
http_re = /^http:\/\/(.*\.ipynb)$/ ;

// Retrieve the current browser window's full URL.
loc = location . href ;

// Begin the conditional logic to determine the appropriate nbviewer URL based on 'loc'.
if  (  gist_re . test ( loc )  )
{
    // If the current URL matches a Gist pattern...
    gist  =  gist_re . exec ( loc ) ;   // ...extract the Gist ID.

    // Construct the nbviewer URL for the Gist.
    url  =  url_root  +  gist [ 1 ] ;
}
else
    if  (  github_re . test ( loc )  )
    {
        // Otherwise, if it matches a GitHub repository .ipynb file pattern...
        path  =  github_re . exec ( loc ) ;   // ...extract the relevant parts of the path.

        // Construct the nbviewer URL for the GitHub file, using 'raw.' prefix.
        url  =  url_root  +  'urls/raw.'  +  path [ 1 ]  +  path [ 2 ] ;
    }
    else
        if  (  https_re . test ( loc )  )
        {
            // Otherwise, if it's a direct HTTPS .ipynb link...
            path  =  https_re . exec ( loc ) ;   // ...extract the path to the notebook.

            // Construct the nbviewer URL for the HTTPS file.
            url  =  url_root  +  'urls/'  +  path [ 1 ] ;
        }
        else
            if  (  http_re . test ( loc )  )
            {   // Finally, if it's a direct HTTP .ipynb link...
                path  =  http_re . exec ( loc ) ;   // ...extract the path.

                // Construct the nbviewer URL for the HTTP file.
                url  =  url_root  +  'url/'  +  path [ 1 ] ;
            }

// After evaluating all possible URL patterns, check if a valid 'url' was generated.
if ( url )
{
    // If 'url' is not null, open it in a new browser window.
    // The window name includes the current timestamp to ensure uniqueness.
    void ( window . open ( url , 'nbviewer'  +  date . getTime ( ) ) ) ;
}

// End of the bookmarklet's executable code.