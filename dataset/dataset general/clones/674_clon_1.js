/*
 * Global Configuration Variables
 * These variables control the behavior of the AJAX polling mechanism.
 */
var timeOutMS = 30000; // Milliseconds before an AJAX request is considered timed out
var ajaxList = new Array(); // Array to hold pending AJAX requests

/**
 * Initializes and sends a new AJAX command.
 * This function creates a new AJAX request object, configures it, and adds it
 * to the global list of active AJAX requests for polling.
 *
 * @param {string} url       The URL to which the request is sent.
 * @param {function|string} container The target for the response. Can be a function to
 *                                    process XML, or a string ID of an HTML element
 *                                    to update its innerHTML with the response text.
 * @param {boolean} repeat   If true, the command will be re-issued after completion.
 * @param {string} data      The data string to send with a POST request.
 */
function newAJAXCommand(
    url,
    container,
    repeat,
    data
)
{
    // Create a new object to encapsulate the AJAX request details
    var newAjax = new Object();

    // Record the current time to track the request's age
    var theTimer = new Date();

    // Assign properties to the new AJAX object
    newAjax.url = url;
    newAjax.container = container;
    newAjax.repeat = repeat;
    newAjax.ajaxReq = null; // Initialize the XMLHttpRequest object placeholder

    // Check for browser's XMLHttpRequest capabilities
    if (window.XMLHttpRequest) {
        // Modern browsers: Use XMLHttpRequest
        newAjax.ajaxReq = new XMLHttpRequest();
        newAjax.ajaxReq.open(
            "POST",
            newAjax.url,
            true
        );
        newAjax.ajaxReq.send(data);
    }
    else if (window.ActiveXObject) {
        // IE6, IE5: Use ActiveXObject for older IE versions
        newAjax.ajaxReq = new ActiveXObject("Microsoft.XMLHTTP");
        if (newAjax.ajaxReq) {
            newAjax.ajaxReq.open(
                "POST",
                newAjax.url,
                true
            );
            newAjax.ajaxReq.send(data);
        }
    }

    // Store the timestamp when this request was initiated
    newAjax.lastCalled = theTimer.getTime();

    // Add the new AJAX request object to the global list
    ajaxList.push(newAjax);
}

/**
 * Periodically polls active AJAX requests.
 * This function iterates through the `ajaxList`, checks the status of each request,
 * handles completed requests (success or timeout), and re-queues repeating requests.
 * It uses setTimeout to call itself repeatedly.
 */
function pollAJAX()
{
    // Object to hold the current AJAX request being processed
    var curAjax = new Object();

    // Get the current time for timeout calculations
    var theTimer = new Date();

    var elapsed, // Time elapsed since the request was last called
        i;       // Loop counter

    // Iterate through the ajaxList from end to beginning.
    // We use shift() inside the loop, so iterating backwards with length is robust.
    // Note: ajaxList.shift() removes the first element, so iterating `i > 0` and shifting
    // means we process all elements that were present at the start of the loop.
    for (i = ajaxList.length; i > 0; i--)
    {
        // Get the next AJAX request from the front of the queue
        curAjax = ajaxList.shift();

        // Skip if for some reason the item is null (shouldn't happen with push/shift)
        if (!curAjax) {
            continue;
        }

        // Calculate elapsed time for timeout check
        elapsed = theTimer.getTime() - curAjax.lastCalled;

        // Check if the AJAX request has completed successfully
        if (curAjax.ajaxReq.readyState == 4 && curAjax.ajaxReq.status == 200) {
            // Request completed successfully
            // Check if the container is a function (callback)
            if (typeof (curAjax.container) == 'function') {
                curAjax.container(curAjax.ajaxReq.responseXML.documentElement);
            }
            // Check if the container is a string (element ID)
            else if (typeof (curAjax.container) == 'string') {
                document.getElementById(curAjax.container).innerHTML = curAjax.ajaxReq.responseText;
            }

            // Abort and nullify the request to free up resources
            curAjax.ajaxReq.abort();
            curAjax.ajaxReq = null;

            // If the request is set to repeat, re-issue the command
            if (curAjax.repeat) {
                newAJAXCommand(
                    curAjax.url,
                    curAjax.container,
                    curAjax.repeat
                );
            }
            continue; // Move to the next request in the list
        }

        // Check if the AJAX request has timed out
        if (elapsed > timeOutMS) {
            // Request timed out
            if (typeof (curAjax.container) == 'function') {
                curAjax.container(null); // Call callback with null to indicate failure
            }
            else {
                // Display a generic alert for timeout
                alert("Command failed.\nConnection to SmartLinc was lost.");
            }

            // Abort and nullify the request
            curAjax.ajaxReq.abort();
            curAjax.ajaxReq = null;

            // If repeating, re-issue the command even on timeout
            if (curAjax.repeat) {
                newAJAXCommand(
                    curAjax.url,
                    curAjax.container,
                    curAjax.repeat
                );
            }
            continue; // Move to the next request
        }

        // If the request is still pending and not timed out, push it back to the list
        ajaxList.push(curAjax);
    }

    // Schedule the next poll after a short delay
    setTimeout("pollAJAX()", 10);
}

/**
 * Extracts the text value of a specified XML tag from an XML document.
 *
 * @param {Document} xmlData The XML document object.
 * @param {string} field     The name of the XML tag whose value is to be extracted.
 * @returns {string|null} The node value of the first child of the specified tag, or null if not found or an error occurs.
 */
function getXMLValue(xmlData, field)
{
    try {
        // Attempt to get the element by tag name, its first child, and its node value
        if (xmlData.getElementsByTagName(field)[0].firstChild.nodeValue) {
            return xmlData.getElementsByTagName(field)[0].firstChild.nodeValue;
        }
        else {
            return null; // Return null if the node value is empty or not found
        }
    }
    catch (err) {
        // Catch any errors (e.g., tag not found, no firstChild) and return null
        return null;
    }
}

// Initial call to start the AJAX polling mechanism after a delay
setTimeout("pollAJAX()", 500);


/**
 * Generates and inserts the header HTML content into the element with ID 'Y'.
 * Uses global array HA for dynamic content.
 */
function MakeHeader()
{
    var Obj = document.getElementById('Y'); // Get the target element

    // Set the innerHTML with the header table structure
    Obj.innerHTML = "<table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'><tr><td width='10%'><a class='hw' href='index.htm'><img src='home.gif' border='0'></a></td><td width='80%' align='center' ><a>" + HA[0] + "<br>" + HA[1] + "</a></td><td width='10%' align='right'><a href='http://wiki.smarthome.com/index.php?title=SmartLinc_Help' target='_blank'><img src = 'help.gif' border=0></a></td></tr></table>"
}

/**
 * Generates and inserts the standard footer HTML content into the element with ID 'foot'.
 * Uses global array HA for dynamic content.
 */
function MakeFooter()
{
    var Obj = document.getElementById('foot'); // Get the target element

    // Set the innerHTML with the footer table structure
    Obj.innerHTML = "<table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'><tr><td width='33%'><a href='rooms.htm'><img src = 'addroom.gif' border='0'></a></td><td width='34%' align='center'><a href='network.htm'><img src = 'settings.gif' border=0></a></td><td id ='RT' width='33%' align='right'>" + HA[2] + "</td></tr></table><br><br>"
}

/**
 * Generates and inserts a specific footer HTML content for scenes into the element with ID 'foot'.
 * Uses global array HA for dynamic content.
 */
function MakeSFooter()
{
    var Obj = document.getElementById('foot'); // Get the target element

    // Set the innerHTML with the scene-specific footer table structure
    Obj.innerHTML = "<table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'><tr><td width='33%'><a onClick='gotoscenes()'><img src = 'addscene.gif' border=0></a></td><td width='34%' align='center'><a href='network.htm'> <img src = 'settings.gif' border=0></a></td><td id ='RT' width='33%' align='right'>" + HA[2] + "</td></tr></table><br><br>"
}

/**
 * Generates and inserts another specific footer HTML content for rooms/settings into the element with ID 'foot'.
 * Uses global array HA for dynamic content.
 */
function MakeRFooter()
{
    var Obj = document.getElementById('foot'); // Get the target element

    // Set the innerHTML with the room/settings-specific footer table structure
    Obj.innerHTML = "<table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'><tr><td width='33%'><a onClick='UpdateAllandgoback(0)'><u>Save</u></a></td><td width='34%' align='center'><a href='network.htm'> <img src = 'settings.gif' border=0></a></td><td id ='RT' width='33%' align='right'>" + HA[2] + "</td></tr></table><br><br>"
}

/**
 * Generates and inserts scene control elements into the element with ID 'X'.
 * This function dynamically creates buttons and displays based on global arrays MA and HA.
 *
 * @param {number} j An index or identifier used in constructing element IDs and AJAX commands.
 */
function MakeSceneControl(j)
{
    var start = 1;      // Starting index for scene elements
    var iend = 16;      // Ending index for scene elements
    var i;              // Loop counter

    var vstr = "00";    // String for formatted index
    var vstr1 = "00";   // Another string for formatted index
    var vstr2 = "00";   // Yet another string for formatted index

    // Array to pre-load image objects for button icons
    var imgs = new Array(4);

    imgs[0] = new Image();
    imgs[0].src = "on.gif";
    imgs[1] = new Image();
    imgs[1].src = "off.gif";
    imgs[2] = new Image();
    imgs[2].src = "bright.gif";
    imgs[3] = new Image();
    imgs[3].src = "dim.gif";


    var Obj = document.getElementById('X'); // Get the target element for scene controls

    // Check if HA[3] contains a valid iframe source and insert an iframe if so
    if (HA[3] != "*") {
        Obj.innerHTML = "<br><center><table width='1000'><tr><td width ='125'></td><td width='400'><iframe width='320px' height='240px'src='" + HA[3] + "' more attributes>Does Not support iframe</iframe></td></tr></table></center><br>";
    }

    // Count 'f' characters in MA[17] and adjust if all are 'f'
    var count = 0;
    for (i = 0; i <= 15; i++) {
        if (MA[17].charAt(i) == 'f') {
            count++;
        }
    }
    if (count == 16) {
        MA[17] = "tfffffffffffffff"; // Reset MA[17] if all are 'f'
    }


    // Loop to generate individual scene control rows
    for (i = start; i <= iend; i++)
    {
        // Format vstr for single-digit numbers
        if (i < 10) {
            vstr = "0" + i;
        }

        // Format vstr1 for single-digit numbers
        if (i < 10) {
            vstr1 = "0" + i;
        }
        else {
            vstr1 = i;
        }

        // Calculate vstr based on current loop index and 'j' parameter
        vstr = i + ((j - 1) * 16);

        // Format vstr2 for single-digit numbers
        if (j < 10) {
            vstr2 = "0" + j;
        }
        else {
            vstr2 = j;
        }

        // Only generate control if MA[17] character is not 'f' and MA[i-1] is not empty
        if (MA[17].charAt(i - 1) != 'f' && MA[i - 1] != "")
        {
            // Append HTML for a scene control row
            Obj.innerHTML = Obj.innerHTML + "<div id='Line" + vstr1 + "'><center><table width='1000' border='0' cellpadding='4 cellspacing='0'><tr><td width='100'><input type='image' id='c1" + vstr1 + "'  class='sicons' value= &#8593 onclick=(newAJAXCommand('0?15" + vstr + "=I=0'))></td><td width='100'><input type='image' id='c2" + vstr1 + "' class='icons' value='ON ' onclick=(newAJAXCommand('0?11" + vstr + "=I=0'))></td><td width='400' align='center'><span class='r01s'>" + MA[i - 1] + "</span></td><td width='150'><input type='image' id='c3" + vstr1 + "' class='icons' value='OFF'onclick=(newAJAXCommand('0?13" + vstr + "=I=0'))></td><td width='150'><input type='image' id='c4" + vstr1 + "' class='sicons'  value=&#8595 onclick=(newAJAXCommand('0?16" + vstr + "=I=0'))></td><td width='100'><a href='setup.htm?" + vstr1 + "=" + vstr2 + "=F' class='set'>Settings</a></td></tr></table><center><br><br></div>"
        }
    }

    // Loop to dynamically set image sources and display properties for buttons
    for (i = 1; i <= 16; i++)
    {
        // Format vstr1 for single-digit numbers
        if (i < 10) {
            vstr1 = "0" + i;
        }
        else {
            vstr1 = i;
        }

        // Only process if MA[17] character is not 'f'
        if (MA[17].charAt(i - 1) != 'f')
        {
            var target; // Placeholder for the target HTML element

            // Check MA[16] for bright button (c1) visibility and image
            if (MA[16].charAt((i - 1) * 4) == 'f') {
                target = document.getElementById("c1" + vstr1);
                target.style.display = "none";
            }
            else {
                target = document.getElementById("c1" + vstr1);
                target.src = imgs[2].src; // Set to bright image
            }

            // Check MA[16] for ON button (c2) visibility and image
            if (MA[16].charAt((i - 1) * 4 + 1) == 'f') {
                target = document.getElementById("c2" + vstr1);
                target.style.display = "none";
            }
            else {
                target = document.getElementById("c2" + vstr1);
                target.src = imgs[0].src; // Set to ON image
            }

            // Check MA[16] for OFF button (c3) visibility and image
            if (MA[16].charAt((i - 1) * 4 + 2) == 'f') {
                target = document.getElementById("c3" + vstr1);
                target.style.display = "none";
            }
            else {
                target = document.getElementById("c3" + vstr1);
                target.src = imgs[1].src; // Set to OFF image
            }

            // Check MA[16] for dim button (c4) visibility and image
            if (MA[16].charAt((i - 1) * 4 + 3) == 'f') {
                target = document.getElementById("c4" + vstr1);
                target.style.display = "none";
            }
            else {
                target = document.getElementById("c4" + vstr1);
                target.src = imgs[3].src; // Set to dim image
            }
        }
    }

    // Schedule a scroll to the top of the page after a short delay
    setTimeout(_scrollToTop, 100);
}

/**
 * Callback function to update the status label ('RT') with XML data.
 * It also schedules the next AJAX call to 'rstatus.xml' for continuous updates.
 *
 * @param {Document} xmlData The XML document received from the AJAX request.
 */
function UpdateStatusL(xmlData)
{
    // Update the innerHTML of the element with ID 'RT' using data from XML
    document.getElementById('RT').innerHTML = getXMLValue(xmlData, 'RT');

    // Schedule the next status update after 10 seconds
    setTimeout(
        "newAJAXCommand('rstatus.xml', UpdateStatusL)",
        10000
    );
}


/**
 * Scrolls the document body to the top.
 */
function _scrollToTop()
{
    document.body.scrollTop = 0; // Set scroll position to 0
}