/*
 *  Basic messaging utility leveraging browser's local storage.
 *  @author CyberSage <https://github.com/CyberSage>
 */
const SignalBroadcaster = function()
{
  this._persistentKeyIdent = 'comm_signal'; // The key used for local storage entries
  this._operationalStatus = this.checkPersistenceSupport(); // Verifies if local storage is available
  this._instanceToken = this.createUniqueInstanceToken(); // Generates a unique identifier for this broadcaster
  this.setupEventHooks(); // Initializes the event listeners
};

/*
 *  Retrieves the current unique instance token.
 *  @return Text
 */
SignalBroadcaster.prototype.obtainInstanceToken = function()
{
  return this._instanceToken;
};

/*
 *  Determines if browser's local storage is functional.
 *  @return Boolean
 */
SignalBroadcaster.prototype.checkPersistenceSupport = function()
{
  return typeof window.localStorage !== 'undefined' && window.localStorage;
};

/*
 *  Checks if the SignalBroadcaster is ready to operate.
 *  @return Boolean
 */
SignalBroadcaster.prototype.queryOperationalStatus = function()
{
  return this._operationalStatus;
};

/*
 *  Generates a random alphanumeric string for the instance token.
 *  @param Number tokenLength = 8 (optional length of the token)
 *  @return Text | Boolean (false if not operational)
 */
SignalBroadcaster.prototype.createUniqueInstanceToken = function(tokenLength)
{
  if (!this.queryOperationalStatus())
    { return false; }

  if (!tokenLength)
    { tokenLength = 8; }

  let generatedTag = '';
  const permittedSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let charIndex = 0; charIndex < tokenLength; ++charIndex)
    {
      generatedTag += permittedSymbols.charAt(Math.floor(Math.random() * permittedSymbols.length));
    }

  return generatedTag;
};

/*
 *  Attaches a listener for local storage changes.
 *  @return void | Boolean (false if not operational)
 */
SignalBroadcaster.prototype.setupEventHooks = function()
{
  if (!this.queryOperationalStatus())
    { return false; }

  const selfRef = this;

  window.addEventListener('storage', function(triggeredEvent) {
    // The triggeredEvent object directly contains the relevant properties in vanilla JS
    if (triggeredEvent.key === selfRef._persistentKeyIdent)
      {
        selfRef.processStorageChange(JSON.parse(triggeredEvent.newValue));
      }
  });
};

/*
 *  Manages incoming changes from the local storage event.
 *  @param Record incomingSignal
 */
SignalBroadcaster.prototype.processStorageChange = function(incomingSignal)
{
  switch (incomingSignal.signalType)
  {
    case 'media_state_update':
      this.manageMediaStateUpdate(incomingSignal);
      break;
  }
};

/*
 *  Stores data in local storage, triggering a browser storage event.
 *  @param Text signalType (the type of signal to send)
 *  @param Record payload (the data associated with the signal)
 *  @return Boolean (true on success, false on failure)
 */
SignalBroadcaster.prototype.dispatchSignal = function(signalType, payload)
{
  if (!this.queryOperationalStatus())
    { return false; }

  const outputSignal = {
    'origin_tag': this.obtainInstanceToken(),
    'action_type': signalType,
    'action_payload': payload,
    'timestamp_utc': Math.floor(Date.now() / 1000)
  };

  try {
    window.localStorage.setItem(this._persistentKeyIdent, JSON.stringify(outputSignal));
  }
  catch (err) {
    console.warn('Broadcasting issue:', err);
    return false;
  }

  return true;
};

/* Custom Signal Handlers */

/*
 *  Processes updates related to media playback status.
 *  @param Record mediaEventData
 *  @return void
 */
SignalBroadcaster.prototype.manageMediaStateUpdate = function(mediaEventData)
{
  if (mediaEventData.origin_tag !== this.obtainInstanceToken())
  {
    if (mediaEventData.action_payload.status === 'active')
    {
      // Another instance entered 'active' state; current media player should halt.
      audioPlayerInstance.haltPlayback();
    }
  }
};