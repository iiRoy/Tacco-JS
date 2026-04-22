/* Global configuration for asynchronous operation timeout duration. */
const asyncOpTimeoutDuration = 30000;
/* Collection of pending asynchronous requests. */
const pendingRequestsCollection = [];

/**
 * Initiates a new asynchronous command.
 * @param {string} resourcePath - The URL or path to the resource.
 * @param {(string|Function)} resultDestination - The ID of an HTML element or a callback function to handle the response.
 * @param {boolean} shouldRepeat - Flag indicating if the command should be re-executed after completion/timeout.
 * @param {any} postData - Data to be sent with a POST request.
 */
function createAsyncCommand(resourcePath, resultDestination, shouldRepeat, postData)
{
    /* Object to encapsulate details of the new asynchronous operation. */
    const currentRequest = {};
    /* Timestamp for when this request was initiated. */
    const initiationTime = new Date();
    currentRequest.requestURL = resourcePath;
    currentRequest.responseTarget = resultDestination;
    currentRequest.isRecurring = shouldRepeat;
    currentRequest.xhrObject = null;
    if (window.XMLHttpRequest) {
        /* Standard XMLHttpRequest for modern browsers. */
        currentRequest.xhrObject = new XMLHttpRequest();
        currentRequest.xhrObject.open("POST", currentRequest.requestURL, true);
        currentRequest.xhrObject.send(postData);
    } else if (window.ActiveXObject) {
        /* ActiveXObject for older Internet Explorer versions. */
        currentRequest.xhrObject = new ActiveXObject("Microsoft.XMLHTTP");
        if (currentRequest.xhrObject) {
            currentRequest.xhrObject.open("POST", currentRequest.requestURL, true);
            currentRequest.xhrObject.send(postData);
        }
    }
    currentRequest.lastInitiatedTimestamp = initiationTime.getTime();
    pendingRequestsCollection.push(currentRequest);
}

/**
 * Periodically checks the status of all pending asynchronous requests.
 */
function monitorAsyncOperations() {
	
    /* Temporary object to hold the current request being processed. */
    const currentMonitoredRequest = {};
    /* Current time to calculate elapsed duration. */
    const currentTime = new Date();
    let timeElapsed, loopIndex;
    /* Iterate through the collection of requests. */
    for (loopIndex = pendingRequestsCollection.length; loopIndex > 0; loopIndex--) {
        /* Retrieve the next request from the front of the queue. */
        currentMonitoredRequest = pendingRequestsCollection.shift();
        if (!currentMonitoredRequest) {
            /* Skip if the request object is invalid. */
            continue;
        }
        timeElapsed = currentTime.getTime() - currentMonitoredRequest.lastInitiatedTimestamp;
        if (currentMonitoredRequest.xhrObject.readyState === 4 && currentMonitoredRequest.xhrObject.status === 200) {
            /* Request completed successfully. */
            if (typeof(currentMonitoredRequest.responseTarget) === 'function') {
                /* If the target is a function, invoke it with the XML response. */
                currentMonitoredRequest.responseTarget(currentMonitoredRequest.xhrObject.responseXML.documentElement);
            } else if (typeof(currentMonitoredRequest.responseTarget) === 'string') {
                /* If the target is a string, update the inner HTML of the specified element. */
                document.getElementById(currentMonitoredRequest.responseTarget).innerHTML = currentMonitoredRequest.xhrObject.responseText;
            } 
            
            /* Terminate the XMLHttpRequest object. */
            currentMonitoredRequest.xhrObject.abort();
            currentMonitoredRequest.xhrObject = null;
            if (currentMonitoredRequest.isRecurring) {
                /* If set to repeat, re-initiate the command. */
                createAsyncCommand(currentMonitoredRequest.requestURL, currentMonitoredRequest.responseTarget, currentMonitoredRequest.isRecurring);
            }
            continue;
        }
        
        if (timeElapsed > asyncOpTimeoutDuration) {
            /* Request timed out. */
            if (typeof(currentMonitoredRequest.responseTarget) === 'function') {
                /* Invoke the callback with null to indicate failure. */
                currentMonitoredRequest.responseTarget(null);
            } else {
                /* Display a generic error message. */
                alert("Operation failed.\nConnection to device was lost.");
            }
            /* Terminate the XMLHttpRequest object. */
            currentMonitoredRequest.xhrObject.abort();
            currentMonitoredRequest.xhrObject = null;
            if (currentMonitoredRequest.isRecurring) {
                /* Re-initiate if it's a recurring command. */
                createAsyncCommand(currentMonitoredRequest.requestURL, currentMonitoredRequest.responseTarget, currentMonitoredRequest.isRecurring);
            }
            continue;
        }
        /* If not completed or timed out, push it back to the end of the queue. */
        pendingRequestsCollection.push(currentMonitoredRequest);
    }
    /* Schedule the next check after a short delay. */
    setTimeout("monitorAsyncOperations()", 10);
	
}

/**
 * Extracts a specific value from an XML document based on a tag name.
 * @param {Document} xmlDocumentData - The XML document to parse.
 * @param {string} tagName - The name of the XML tag whose value is to be retrieved.
 * @returns {string|null} The node value of the first matching tag, or null if not found or an error occurs.
 */
function retrieveXmlNodeValue(xmlDocumentData, tagName) {
	try {
		/* Attempt to get the element and its first child's node value. */
		if (xmlDocumentData.getElementsByTagName(tagName)[0].firstChild.nodeValue) {
			return xmlDocumentData.getElementsByTagName(tagName)[0].firstChild.nodeValue;
		} else {
			return null;
		}
	} catch (error) { 
        /* Return null on any error during extraction. */
        return null; 
    }
}

/* Initial call to start monitoring asynchronous operations after a short delay. */
setTimeout("monitorAsyncOperations()", 500);


/**
 * Renders the header section of the page.
 */
function constructPageHeader()
{
    /* Get the header container element. */
    const headerElement  = document.getElementById('Y');
    /* Set the inner HTML for the header, including navigation and branding. */
    headerElement.innerHTML = "<table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'><tr><td width='10%'><a class='hw' href='index.htm'><img src='home.gif' border='0'></a></td><td width='80%' align='center' ><a>"+HA[0]+"<br>"+HA[1]+"</a></td><td width='10%' align='right'><a href='http://wiki.smarthome.com/index.php?title=SmartLinc_Help' target='_blank'><img src = 'help.gif' border=0></a></td></tr></table>";
}

/**
 * Renders the footer section of the page.
 */
function constructPageFooter()
{
    /* Get the footer container element. */
    const footerElement  = document.getElementById('foot');
    /* Set the inner HTML for the footer, including navigation links. */
    footerElement.innerHTML = "<table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'><tr><td width='33%'><a href='rooms.htm'><img src = 'addroom.gif' border='0'></a></td><td width='34%' align='center'><a href='network.htm'><img src = 'settings.gif' border=0></a></td><td id ='RT' width='33%' align='right'>"+HA[2]+"</td></tr></table><br><br>";
}

/**
 * Renders a specialized footer for scene management.
 */
function constructSceneFooter()
{
    /* Get the footer container element. */
    const footerElement  = document.getElementById('foot');
    /* Set the inner HTML for the scene-specific footer. */
    footerElement.innerHTML = "<table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'><tr><td width='33%'><a onClick='gotoscenes()'><img src = 'addscene.gif' border=0></a></td><td width='34%' align='center'><a href='network.htm'> <img src = 'settings.gif' border=0></a></td><td id ='RT' width='33%' align='right'>"+HA[2]+"</td></tr></table><br><br>";
}

/**
 * Renders a specialized footer for room settings management.
 */
function constructRoomFooter()
{
    /* Get the footer container element. */
    const footerElement  = document.getElementById('foot');
    /* Set the inner HTML for the room-specific footer, including a save option. */
    footerElement.innerHTML = "<table width='100%' height='120px' border='0' cellpadding='4' cellspacing='0' class='handf'><tr><td width='33%'><a onClick='UpdateAllandgoback(0)'><u>Save</u></a></td><td width='34%' align='center'><a href='network.htm'> <img src = 'settings.gif' border=0></a></td><td id ='RT' width='33%' align='right'>"+HA[2]+"</td></tr></table><br><br>";
}

/**
 * Generates and displays scene control elements.
 * @param {number} sceneIndex - The index of the scene to control.
 */
function generateSceneControls(sceneIndex)
{
    /* Starting and ending indices for scene items. */
    const startIndex = 1;
    const endIndex = 16;     
    let iterationCounter;
    
    /* Variables for formatted string representations. */
    let stringValue = "00";
    let stringValueOne = "00";
    let stringValueTwo = "00";

    /* Array to hold image objects for control icons. */
    const controlImages = new Array(4);     

    /* Load control button images. */
    controlImages[0] = new Image();      
    controlImages[0].src = "on.gif";
    controlImages[1] = new Image();      
    controlImages[1].src = "off.gif";
    controlImages[2] = new Image();      
    controlImages[2].src = "bright.gif";
    controlImages[3] = new Image();      
    controlImages[3].src = "dim.gif";
    
    /* Get the main content container element. */
    const contentContainer  = document.getElementById('X');

    /* Display an iframe if HA[3] is not a wildcard. */
    if (HA[3] !== "*") {
        contentContainer.innerHTML = "<br><center><table width='1000'><tr><td width ='125'></td><td width='400'><iframe width='320px' height='240px'src='"+HA[3]+"' more attributes>Does Not support iframe</iframe></td></tr></table></center><br>";
    }

    let activeSceneCount = 0;
    /* Count active scenes based on MA[17]. */
    for (iterationCounter = 0; iterationCounter <= 15; iterationCounter++) {
        if (MA[17].charAt(iterationCounter) === 'f') {
            activeSceneCount++;
        }
    }
    /* If all scenes are inactive, set a default active scene. */
    if (activeSceneCount === 16) {
        MA[17] = "tfffffffffffffff";
    }

    /* Loop to generate scene control rows. */
    for (iterationCounter = startIndex; iterationCounter <= endIndex; iterationCounter++) {

        if (iterationCounter < 10) {
            stringValue = "0" + iterationCounter;
        }

        if (iterationCounter < 10) {
            stringValueOne = "0" + iterationCounter;
        } else {
            stringValueOne = iterationCounter;
        }

        stringValue = iterationCounter + ((sceneIndex - 1) * 16);

        if (sceneIndex < 10) {
            stringValueTwo = "0" + sceneIndex;
        } else {
            stringValueTwo = sceneIndex;
        }
        
        /* Only display controls for active and defined scenes. */
        if (MA[17].charAt(iterationCounter - 1) !== 'f' && MA[iterationCounter - 1] !== "" ) {

            contentContainer.innerHTML = contentContainer.innerHTML + "<div id='Line"+stringValueOne+"'><center><table width='1000' border='0' cellpadding='4 cellspacing='0'><tr><td width='100'><input type='image' id='c1"+stringValueOne+"'  class='sicons' value= &#8593 onclick=(createAsyncCommand('0?15" + stringValue + "=I=0'))></td><td width='100'><input type='image' id='c2"+stringValueOne+"' class='icons' value='ON ' onclick=(createAsyncCommand('0?11" + stringValue + "=I=0'))></td><td width='400' align='center'><span class='r01s'>"+MA[iterationCounter-1]+"</span></td><td width='150'><input type='image' id='c3"+stringValueOne+"' class='icons' value='OFF'onclick=(createAsyncCommand('0?13" + stringValue + "=I=0'))></td><td width='150'><input type='image' id='c4"+stringValueOne+"' class='sicons'  value=&#8595 onclick=(createAsyncCommand('0?16" + stringValue + "=I=0'))></td><td width='100'><a href='setup.htm?" + stringValueOne +"="+ stringValueTwo +"=F' class='set'>Settings</a></td></tr></table><center><br><br></div>";
        }

    }

    /* Loop to update control button images and visibility based on configuration. */
    for (iterationCounter = 1; iterationCounter <= 16; iterationCounter++) {
        let formattedIndex;
        if (iterationCounter < 10) { 
            formattedIndex = "0" + iterationCounter;
        } else {
            formattedIndex = iterationCounter;
        }
        
        if (MA[17].charAt(iterationCounter - 1) !== 'f') {   
            let targetElement;
            
            if (MA[16].charAt((iterationCounter - 1) * 4) === 'f') {
                targetElement = document.getElementById("c1" + formattedIndex);
                targetElement.style.display = "none";
            } else {
                targetElement = document.getElementById("c1" + formattedIndex);
                targetElement.src = controlImages[2].src;
            }
            
            if (MA[16].charAt((iterationCounter - 1) * 4 + 1) === 'f') {
                targetElement = document.getElementById("c2" + formattedIndex);
                targetElement.style.display = "none";
            } else {
                targetElement = document.getElementById("c2" + formattedIndex);
                targetElement.src = controlImages[0].src;
            }
        
            if (MA[16].charAt((iterationCounter - 1) * 4 + 2) === 'f') {
                targetElement = document.getElementById("c3" + formattedIndex);
                targetElement.style.display = "none";
            } else {
                targetElement = document.getElementById("c3" + formattedIndex);
                targetElement.src = controlImages[1].src;
            }
            
            if (MA[16].charAt((iterationCounter - 1) * 4 + 3) === 'f') {
                targetElement = document.getElementById("c4" + formattedIndex);
                targetElement.style.display = "none";
            } else {
                targetElement = document.getElementById("c4" + formattedIndex);
                targetElement.src = controlImages[3].src;
            }
        }
                
    }

    /* Initiate a command to update status and scroll to top. */
    // createAsyncCommand('rstatus.xml', updateLiveStatus);
    setTimeout(scrollToPageTop, 100);
}

/**
 * Updates the live status display from XML data.
 * @param {Document} xmlDocumentData - The XML document containing status information.
 */
function updateLiveStatus(xmlDocumentData)
{
    /* Update the 'RT' element with the value from the XML. */
    document.getElementById('RT').innerHTML = retrieveXmlNodeValue(xmlDocumentData, 'RT');
    /* Schedule the next status update. */
    setTimeout("createAsyncCommand('rstatus.xml', updateLiveStatus)", 10000);
}


/**
 * Scrolls the page to the top.
 */
function scrollToPageTop() {
    document.body.scrollTop = 0;
}