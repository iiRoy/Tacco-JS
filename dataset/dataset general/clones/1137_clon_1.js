/*
 * This script is responsible for managing cookies related to
 * e-hentai.org and exhentai.org domains.
 * It provides functionality to transfer specific cookies and
 * to delete a predefined set of cookies.
 */

function    setHentaiCookies (   )
{
    // Begin main cookie transfer function execution.
    // This function attempts to copy specific cookies from e-hentai to exhentai.
    try
    {
        // Retrieve all cookies associated with the '.e-hentai.org' domain.
        chrome.cookies.getAll(  {   domain: '.e-hentai.org'  }  ,   function (   got   )
        {
            // Iterate through the list of retrieved cookies.
            for (   var   i   =   0  ;   i   <   got.length  ;   i++   )
            {
                // Check if the current cookie's name contains 'ipb_' or 'uconfig'.
                // These are specific cookies that need to be transferred.
                if (   (   got[i].name.indexOf (   'ipb_'   )   !=   -1   )   ||   (   got[i].name.indexOf (   'uconfig'   )   !=   -1   )   )
                {
                    // Set the identified cookie for the '.exhentai.org' domain.
                    // The cookie's name, path, and value are preserved.
                    chrome.cookies.set (
                        {
                              url: 'http://exhentai.org/'
                            , domain: '.exhentai.org'
                            , name: got[i].name
                            , path: '/'
                            , value: got[i].value
                        }
                    )   ;
                }
            }
        }   )   ;

        // If the cookie transfer process completes without errors, return true.
        return   true   ;
    }
    catch   (   e   )
    {
        // If an error occurs during the process, catch it and return false.
        // The error object 'e' is available but not used here.
        return   false   ;
    }
}


/*
 * This section defines the message listener for the Chrome runtime.
 * It handles various requests from other parts of the extension.
 */
chrome.runtime.onMessage.addListener(
    function (   request   ,   sender   ,   sendResponse   )
    {
        // Handle the 'cookieDataSet' request.
        // This request triggers the setHentaiCookies function.
        if (   request   ==   'cookieDataSet'   )
        {
            // Send back a response indicating success or failure of cookie setting.
            sendResponse (   (   setHentaiCookies (   )   ?   'ok'   :   'Unable to set cookies'   )   )   ;
        }
        // Handle the 'deleteAllCookies' request.
        else   if (   request   ==   'deleteAllCookies'   )
        {
            // Remove a specific set of cookies from exhentai.org.
            chrome.cookies.remove (   {   name: "yay"   ,   url: "http://exhentai.org/"   }   ,   function (   )   {   }   )   ;
            chrome.cookies.remove (   {   name: "ipb_anonlogin"   ,   url: "http://exhentai.org/"   }   ,   function (   )   {   }   )   ;
            chrome.cookies.remove (   {   name: "ipb_member_id"   ,   url: "http://exhentai.org/"   }   ,   function (   )   {   }   )   ;
            chrome.cookies.remove (   {   name: "ipb_pass_hash"   ,   url: "http://exhentai.org/"   }   ,   function (   )   {   }   )   ;
            chrome.cookies.remove (   {   name: "ipb_session_id"   ,   url: "http://exhentai.org/"   }   ,   function (   )   {   }   )   ;

            // Remove the same set of cookies from e-hentai.org.
            chrome.cookies.remove (   {   name: "ipb_anonlogin"   ,   url: "http://e-hentai.org/"   }   ,   function (   )   {   }   )   ;
            chrome.cookies.remove (   {   name: "ipb_member_id"   ,   url: "http://e-hentai.org/"   }   ,   function (   )   {   }   )   ;
            chrome.cookies.remove (   {   name: "ipb_pass_hash"   ,   url: "http://e-hentai.org/"   }   ,   function (   )   {   }   )   ;
            chrome.cookies.remove (   {   name: "ipb_session_id"   ,   url: "http://e-hentai.org/"   }   ,   function (   )   {   }   )   ;

            // Respond to the sender after all cookies have been removed.
            sendResponse (   )   ;
        }
        // Handle the 'reload' request.
        else   if (   request   ==   'reload'   )
        {
            // Get the currently selected tab.
            chrome.tabs.getSelected (   null   ,   function (   tab   )
            {
                // Reload the identified tab.
                chrome.tabs.reload (   tab.id   )   ;
            }   )   ;
        }
    }
)   ;