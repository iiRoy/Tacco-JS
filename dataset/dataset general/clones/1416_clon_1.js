/*
 * This script is responsible for setting up a context menu item
 * within a Chrome browser extension.
 *
 * It allows users to "Pin" images directly to Pinterest by right-clicking.
 * This is a Type I clone, meaning all identifiers and logic are preserved,
 * with only whitespace and comments altered for visual differentiation.
 */


// This function is the core logic for initializing or refreshing
// the custom context menu entries for the extension.
function        refreshMenu    (    )
{

        // As a first step, we ensure that no previous context menu items
        // created by this extension are present. This prevents duplicates
        // if the function is called multiple times during the extension's lifecycle.
        chrome.contextMenus.removeAll    (    )    ;


        // Now, we proceed to create a new context menu item.
        // The details of this menu item are defined in the object literal below.
        var     imageMenu    =    chrome.contextMenus.create    (    {

                // The 'title' property defines the text that will be displayed
                // to the user in the context menu.
                "title"    :    "Pin It!"    ,

                // The 'contexts' array specifies when this menu item should be visible.
                // In this case, it will only appear when the user right-clicks on an 'image'.
                "contexts"    :    [    "image"    ]    ,
                "onclick"    :    function    (    info    ,    tab    )
                {

                        // When the menu item is clicked, this function executes.
                        // The 'info' object contains detailed information about the clicked element,
                        // such as its source URL (srcUrl).
                        console.log    (    info    )    ;

                        // The 'tab' object provides information about the current browser tab
                        // where the click event occurred, including its URL and title.
                        console.log    (    tab    )    ;


                        // We construct the base URL for Pinterest's "Pin It!" bookmarklet.
                        var     pinUrl    =    "http://pinterest.com/pin/create/bookmarklet/"    ;

                        // Parameters are appended to the base URL to specify the image and source page.
                        // 'media': The URL of the image being pinned, escaped for URL safety.
                        // 'url': The URL of the webpage the image originated from, also escaped.
                        // 'alt': A static placeholder for alternative text.
                        // 'title': A static placeholder for the pin's title.
                        // Note: The original code had a commented-out section for tab.title, which remains commented.
                        pinUrl     +=     "?media="     +     escape    (    info.srcUrl    )     +     "&url="     +     escape    (    tab.url    )     +     "&alt=alt&title=foo"    ;    // Original comment: + escape(tab.title);

                        // Another parameter is added to explicitly state that the content is not a video.
                        pinUrl     +=     "&is_video=false&"    ;


                        // Finally, a new browser window is opened.
                        // This window navigates to the constructed 'pinUrl', allowing the user
                        // to complete the pinning process on Pinterest.
                        // The window is configured with specific dimensions and features.
                        window.open    (    pinUrl    ,    "pin"    +    (    new    Date    )    .getTime    (    )    ,    "status=no,resizable=no,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=635,height=290,left=0,top=0"    )    ;
                }
        }    )    ;
}


// After defining the 'refreshMenu' function, it is immediately called.
// This ensures that the context menu item is created and available
// as soon as the extension script is loaded and executed.
refreshMenu    (    )    ;