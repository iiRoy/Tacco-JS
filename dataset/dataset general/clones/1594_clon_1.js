/*
This script handles the configuration options for the MQTT2Chrome extension.
It manages saving and restoring user preferences related to MQTT broker connections
and notification settings.
*/

//  var broker = document.getElementById("broker");
//  var port = document.getElementById("port");
//  var subtopic = document.getElementById("subtopic");
//  var reconnect_timeout = document.getElementById("reconnectTimeout");
//  var clear_notifications = document.getElementById("clearNotifications");
//  var notification_timeout = document.getElementById("notificationTimeout");

// This function is a handy shortcut to get an element by its ID.
function    $(id)
{
    return    document.getElementById(id)    ;
}

/*
// This function is intended to visually disable or enable the notification timeout selector.
// It's currently commented out, but its structure is preserved for potential future use.
// function disableNotifyTimeout(isDisabled) {
//   var options = document.getElementById("options"); // Example of a commented-out line
//   document.getElementById("notificationTimeout").style.color = isDisabled ? 'graytext' : 'black'; // Adjusts the label color.
//   document.getElementById("notificationTimeout").disabled = isDisabled; // Controls the actual input field.
// }
*/

// Resets all extension options to their default, recommended values.
function    resetOptions()
{
    localStorage.broker               =    "test.mosquitto.org"    ; // Default MQTT broker address
    localStorage.port                 =    80                      ; // Default WebSocket port for the broker
    localStorage.username             =    ""                      ; // No username by default
    localStorage.password             =    ""                      ; // No password by default
    localStorage.subtopic             =    "/mqtt2chrome/messages" ; // Default MQTT topic to subscribe to
    localStorage.reconnectTimeout     =    10                      ; // Default reconnect timeout in seconds
    localStorage.clearNotifications   =    true                    ; // Notifications clear automatically by default
    localStorage.notificationTimeout  =    10                      ; // Notifications clear after 10 seconds by default
}

// Retrieves and applies saved options from the browser's local storage.
function    restoreOptions()
{
    console.log    (    "Restoring configuration options from local storage."    )    ;

    if    (    !localStorage.isInitialized    )
    {
        resetOptions    (    )    ;
        localStorage.isInitialized    =    true    ;
    }

    console.log    (    "Attempting to retrieve options now."    )    ;

    document.getElementById("broker").value                 =    localStorage.broker                 ;
    document.getElementById("port").value                   =    localStorage.port                   ;
    document.getElementById("username").value               =    localStorage.username               ;
    document.getElementById("password").value               =    localStorage.password               ;
    document.getElementById("reconnectTimeout").value       =    localStorage.reconnectTimeout       ;
    document.getElementById("subtopic").value               =    localStorage.subtopic               ;
    document.getElementById("clearNotifications").checked   =    JSON.parse(localStorage.clearNotifications)    ;
    document.getElementById("notificationTimeout").value    =    localStorage.notificationTimeout    ;

    // The following block is commented out, possibly for future feature integration.
    // if (!document.getElementById("clearNotifications").value)
    // {
    //   disableNotifyTimeout(true);
    // }

    // document.getElementById("clearNotifications").onchange = function() {
    //   disableNotifyTimeout(!document.getElementById("clearNotifications").checked);
    // };
}

// Persists the current form values into the browser's local storage.
function    saveOptions()
{
    console.log    (    "Saving current options."    )    ;

    localStorage.broker               =    document.getElementById("broker").value               ;
    localStorage.port                 =    document.getElementById("port").value                 ;
    localStorage.username             =    document.getElementById("username").value             ;
    localStorage.password             =    document.getElementById("password").value             ;
    localStorage.reconnectTimeout     =    document.getElementById("reconnectTimeout").value     ;
    localStorage.subtopic             =    document.getElementById("subtopic").value             ;
    localStorage.clearNotifications   =    document.getElementById("clearNotifications").checked ;
    localStorage.notificationTimeout  =    document.getElementById("notificationTimeout").value  ;
}

// Saves the options and then closes the current configuration tab.
function    saveAndClose()
{
    saveOptions    (    )    ;

    // After saving, close the active tab.
    chrome.tabs.getSelected    (    null    ,    function    (    tab    )
    {
        chrome.tabs.remove    (    tab.id    )    ;
    }    )    ;
    // Note: A "disconnect and reconnect" logic might be needed here to apply new settings immediately.
}

// Initializes the options page when it loads.
function    init()
{
    console.log    (    "Initializing the options page."    )    ;

    restoreOptions    (    )    ;
    document.querySelector('#save').addEventListener('click',    saveAndClose)    ;
}

// Ensures the initialization function runs once the DOM is fully loaded.
document.addEventListener    (    'DOMContentLoaded'    ,    init    )    ;