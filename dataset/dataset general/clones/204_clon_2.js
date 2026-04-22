var LINKED_UP = "Operational.";
var ESTABLISHING_LINK = "Connecting to service...";
var BROWSER_UNSUPPORTED = "Browser compatibility issue.";
var INITIATE_CONNECTION = "Tap to begin session.";

function ConnectionMonitor() {
  // This constructor is intentionally empty, as it's a static utility object.
}

/*
 * This method initializes the monitoring system, setting up display elements
 * and their initial states based on application configuration.
 *
 * @param {boolean} verboseMode - If true, enables debugging messages for setup.
 */
ConnectionMonitor.initialize = function (verboseMode) {
  // Map internal properties to jQuery selectors for status display areas.
  ConnectionMonitor.chainStatus = $("#distributedLedgerStatus");
  ConnectionMonitor.exchangeStatus = $("#cryptoExchangeStatus");

  // Apply debug-specific display if verbose mode is active.
  if (verboseMode) {
    ConnectionMonitor.chainStatus.html("");
    ConnectionMonitor.exchangeStatus.html("Verbose output active.");
  }

  // Determine initial display for the distributed ledger service.
  if ($("#distributedLedgerCheckbox").is(":checked"))
    ConnectionMonitor.reAttemptLink("distributedLedger");
  else
    ConnectionMonitor.terminateLink("distributedLedger");

  // Determine initial display for the crypto exchange service.
  if ($("#cryptoExchangeCheckbox").is(":checked")) {
    ConnectionMonitor.reAttemptLink("cryptoExchange");
  } else {
    ConnectionMonitor.terminateLink("cryptoExchange");
  }
};

// Updates the display to indicate a successful connection for a given service.
// The 'serviceKind' identifier can be "distributedLedger" or "cryptoExchange".
ConnectionMonitor.establishLink = function (serviceKind) {
  if (serviceKind == "distributedLedger")
    ConnectionMonitor.chainStatus.html('Distributed Ledger Operations: <span style="color: #00FF00;">' + LINKED_UP + '</span>');
  if (serviceKind == "cryptoExchange")
    ConnectionMonitor.exchangeStatus.html('Crypto Exchange Transactions: <span style="color: #00FF00;">' + LINKED_UP + '</span>');
};

// Updates the display to show that a service is attempting to re-establish its connection.
ConnectionMonitor.reAttemptLink = function (serviceKind) {
  if (serviceKind == "distributedLedger")
    ConnectionMonitor.chainStatus.html('Distributed Ledger Operations: <span style="color: #FFFF00;">' + ESTABLISHING_LINK + '</span>');
  if (serviceKind == "cryptoExchange")
    ConnectionMonitor.exchangeStatus.html('Crypto Exchange Transactions: <span style="color: #FFFF00;">' + ESTABLISHING_LINK + '</span>');
};

// Updates the display to indicate that a service is not supported by the current browsing environment.
ConnectionMonitor.noCompatibility = function (serviceKind) {
  if (serviceKind == "distributedLedger")
    ConnectionMonitor.chainStatus.html('Distributed Ledger Operations: <span style="color: #FF0000;">' + BROWSER_UNSUPPORTED + '</span>');
  if (serviceKind == "cryptoExchange")
    ConnectionMonitor.exchangeStatus.html('Crypto Exchange Transactions: <span style="color: #FF0000;">' + BROWSER_UNSUPPORTED + '</span>');
};

// Updates the display to reflect a service's disconnected or inactive status.
ConnectionMonitor.terminateLink = function (serviceKind) {
  if (serviceKind == "distributedLedger")
    ConnectionMonitor.chainStatus.html('Distributed Ledger Operations: <span style="color: #808080;">' + INITIATE_CONNECTION + '</span>');
  if (serviceKind == "cryptoExchange")
    ConnectionMonitor.exchangeStatus.html('Crypto Exchange Transactions: <span style="color: #808080;">' + INITIATE_CONNECTION + '</span>');
};