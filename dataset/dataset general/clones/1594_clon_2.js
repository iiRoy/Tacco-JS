function getElemByID ( elementIdentifier )
{
  return window.document.getElementById(elementIdentifier);
}

function initializeDefaultSettings ()
{
  window.localStorage.connectionHost = "example.mqtt.server";         // Default MQTT broker address for connection
  window.localStorage.hostPortNumber = 80;                            // Default port number for the broker
  window.localStorage.loginUser = "";                                 // User account for broker authentication, leave blank if not needed
  window.localStorage.accessKey = "";                                 // Password for broker authentication, leave blank if not needed
  window.localStorage.subscriptionPath = "/channel/broadcasts";       // Default MQTT topic for message subscription
  window.localStorage.reconnectionDelaySeconds = 15;                  // Interval in seconds before attempting to reconnect to broker
  window.localStorage.autoClearMessages = true;                       // Boolean flag to enable automatic message dismissal
  window.localStorage.messageDisplayDuration = 12;                    // How long in seconds a message notification should be displayed
}

function loadConfiguration ()
{
  console.info("Loading previous application settings.");
  if ( !window.localStorage.hasBeenSetup )
  {
    initializeDefaultSettings();
    window.localStorage.hasBeenSetup = true;
  }

  console.info("Retrieving configuration parameters from browser storage.");
  getElemByID("host_address_input").value = window.localStorage.connectionHost;
  getElemByID("port_number_field").value = window.localStorage.hostPortNumber;
  getElemByID("user_name_entry").value = window.localStorage.loginUser;
  getElemByID("passcode_input").value = window.localStorage.accessKey;
  getElemByID("reconnection_delay_field").value = window.localStorage.reconnectionDelaySeconds;
  getElemByID("subscription_topic_input").value = window.localStorage.subscriptionPath;
  getElemByID("auto_clear_checkbox").checked = JSON.parse(window.localStorage.autoClearMessages);
  getElemByID("message_duration_input").value = window.localStorage.messageDisplayDuration;
}

function persistCurrentSettings ()
{
  console.debug("Saving current form inputs to local storage.");

  window.localStorage.connectionHost = getElemByID("host_address_input").value;
  window.localStorage.hostPortNumber = getElemByID("port_number_field").value;
  window.localStorage.loginUser = getElemByID("user_name_entry").value;
  window.localStorage.accessKey = getElemByID("passcode_input").value;
  window.localStorage.reconnectionDelaySeconds = getElemByID("reconnection_delay_field").value;
  window.localStorage.subscriptionPath = getElemByID("subscription_topic_input").value;
  window.localStorage.autoClearMessages = getElemByID("auto_clear_checkbox").checked;
  window.localStorage.messageDisplayDuration = getElemByID("message_duration_input").value;
}

function commitAndExit ()
{
  persistCurrentSettings();
  // Close the current browser tab after saving
  chrome.tabs.getCurrent(function(currentTabReference) {
    chrome.tabs.remove(currentTabReference.id);
  });
}

function initializeApplication ()
{
  console.warn("Beginning application setup sequence.");
  loadConfiguration();
  window.document.querySelector('.save_button').addEventListener('mouseup', commitAndExit);
}

window.document.addEventListener('load', initializeApplication);