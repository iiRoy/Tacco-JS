(function () {
  const commState = {
    networkAddress: null,
    channelPort: 80,
    clientIdentity: null,
    connectionEstablished: false,
    transmitEngaged: false,
    secretKeyDigest: null,
    keySetFromExisting: false,
    connectionManager: {},
    reconnectAttempts: 0,
    reconnectTimer: null,
    inputLog: [],
    logPointer: 0,
    pendingTransmissions: {},
    transmissionSequence: 1,
    lastAliasUpdate: 0,
    lastDataPoint: 0,
    initialBottomMargin: null, // Not used in provided snippet, but declared
    interfaceClosed: false,
    visualAlertPermitted: true,
    alertStateActive: false,
    alertSequenceTimer: null,
    defaultDisplayLink: "<loading board name>",
    currentDisplayLink: "<loading board name>",
    participantIdentifier: null,
    initialLaunch: true,
    launchDelayTimer: null,
    authenticationRequired: false // Not used in provided snippet, but declared
  };

  const domComposer = {
    makeElement(tag, attributes = {}, childNodes = []) {
      const element = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'textContent') {
          element.textContent = value;
        } else if (key === 'className') {
          element.className = value;
        } else if (key === 'listeners') {
          Object.entries(value).forEach(([eventType, handler]) => {
            element.addEventListener(eventType, handler, false);
          });
        } else {
          element.setAttribute(key, value);
        }
      });
      childNodes.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
      return element;
    },
    clearChildren(parent) {
      for (; parent.firstChild;) {
        parent.removeChild(parent.firstChild);
      }
    },
    retrieveElement(id) {
      return document.getElementById(id);
    }
  };

  class CommunicateInterface {
    constructor() {
      commState.networkAddress = window.__chattrrHost;
      commState.channelPort = window.__chattrrPort ? parseInt(window.__chattrrPort, 10) : 80;
      commState.clientIdentity = window.__userToken;

      this.commandHandlers = this.setupCommandHandlers();
      this.messageHandlers = this.setupMessageHandlers();
    }

    // --- Core Operations ---
    transmitData(payload) {
      if (commState.connectionManager.activeLink && commState.connectionManager.activeLink.connected) {
        commState.connectionManager.activeLink.send(JSON.stringify(payload));
      }
    }

    receiveData(rawPayload) {
      const messageObject = JSON.parse(rawPayload);

      const handlersInOrder = [
        ['closing', this.messageHandlers.get('closing')],
        ['passwordFailed', this.messageHandlers.get('passwordFailed')],
        ['url', this.messageHandlers.get('urlUpdate')],
        ['userId', this.messageHandlers.get('userIdUpdate')],
        ['flash', this.messageHandlers.get('flashSetting')],
        ['language', this.messageHandlers.get('languageSetting')],
        ['count', this.messageHandlers.get('userCountUpdate')],
        ['urls', this.messageHandlers.get('popularUrlsUpdate')],
        ['users', this.messageHandlers.get('activeUsersUpdate')]
      ];

      let processed = false;
      for (const [key, handler] of handlersInOrder) {
        if (messageObject[key] !== undefined) {
          handler.call(this, messageObject);
          processed = true;
          if (key === 'closing' || key === 'passwordFailed') break;
        }
      }

      if (!messageObject.msg) {
        return;
      }
      this.renderMessageToDisplay(messageObject);
    }

    // --- Message Processing Handlers ---
    setupMessageHandlers() {
      const handlers = new Map();
      handlers.set('closing', (data) => {
        if (commState.connectionManager.activeLink) {
          commState.connectionManager.activeLink.disconnect();
        }
        if (commState.reconnectTimer) {
          clearInterval(commState.reconnectTimer);
        }
        commState.reconnectTimer = setInterval(() => this.initiateConnections(), 2000);
        this.displaySystemNotification(
          "Service terminating. Awaiting reconnection."
        );
      });

      handlers.set('passwordFailed', (data) => {
        if (commState.secretKeyDigest && !commState.keySetFromExisting) {
          this.sendAuthenticationRequest(commState.secretKeyDigest);
          commState.keySetFromExisting = true;
        } else {
          this.requestSecretKey();
        }
      });

      handlers.set('urlUpdate', (data) => { commState.currentDisplayLink = data.url; });
      handlers.set('userIdUpdate', (data) => {
        commState.participantIdentifier = data.userId;
        commState.initialLaunch = true;
        if (commState.launchDelayTimer) {
          clearTimeout(commState.launchDelayTimer);
        }
        commState.launchDelayTimer = setTimeout(() => {
          commState.initialLaunch = false;
        }, 5000);
      });
      handlers.set('flashSetting', (data) => { commState.visualAlertPermitted = data.flash === true; });
      handlers.set('languageSetting', (data) => { this.updateLanguageSelection(data); });
      handlers.set('userCountUpdate', (data) => { this.presentLurkerInfo(data); });
      handlers.set('popularUrlsUpdate', (data) => { this.writePopularLinksToView(data); });
      handlers.set('activeUsersUpdate', (data) => { this.showActiveParticipants(data); });
      return handlers;
    }

    displaySystemNotification(messageText) {
      this.receiveData(JSON.stringify({
        source: "system",
        seqId: 0,
        timestamp: new Date().getTime(),
        msg: messageText
      }));
    }

    requestSecretKey() {
      this.displaySystemNotification("Kindly provide your secret key.");
      const inputElement = domComposer.retrieveElement("comm_input_area");
      inputElement.style.display = "none";

      const parentContainer = domComposer.retrieveElement("comm_input_container");
      const secretField = domComposer.makeElement("input", {
        type: "password",
        id: "comm_secret_field",
        listeners: {
          keypress: (evt) => {
            if (evt.which === 13) {
              parentContainer.removeChild(secretField);
              inputElement.style.display = "";
              if (commState.connectionManager.activeLink && commState.connectionManager.activeLink.connected) {
                commState.secretKeyDigest = Crypto.SHA256(secretField.value);
                this.sendAuthenticationRequest(commState.secretKeyDigest);
              } else {
                this.displaySystemNotification("Cannot transmit authentication while disconnected.");
              }
              inputElement.focus();
            }
          }
        }
      });
      parentContainer.appendChild(secretField);
      secretField.focus();
    }

    updateLanguageSelection(dataPayload) {
      const langSelector = domComposer.retrieveElement("comm_lang_selector");
      const targetLang = dataPayload.language;
      const optionsArray = Array.from(langSelector.options);
      let i = 0;
      while (i < optionsArray.length) {
        if (optionsArray[i].value === targetLang) {
          optionsArray[i].selected = true;
          break;
        }
        i++;
      }
    }

    presentLurkerInfo(dataPayload) {
      const displayZone = domComposer.retrieveElement("comm_top_display");
      domComposer.clearChildren(displayZone);

      const infoSpan = domComposer.makeElement("span", { textContent: dataPayload.count + " Observers on " });
      const boardLink = domComposer.makeElement("a", {
        textContent: commState.currentDisplayLink,
        href: `http://${commState.networkAddress}:${commState.channelPort}/log/${encodeURIComponent(commState.currentDisplayLink)}?offset=0`,
        target: "_blank"
      });

      displayZone.appendChild(infoSpan);
      displayZone.appendChild(boardLink);
    }

    showActiveParticipants(dataPayload) {
      const infoDisplay = domComposer.retrieveElement("comm_info_body");
      domComposer.clearChildren(infoDisplay);

      const participantMap = dataPayload.users;
      Object.keys(participantMap).forEach(alias => {
        const row = domComposer.makeElement("tr", { className: "comm_info_row" });
        const idCell = domComposer.makeElement("td", { className: "comm_info_row_id", textContent: participantMap[alias] });
        const aliasCell = domComposer.makeElement("td", { className: "comm_info_row_alias", textContent: alias });

        row.appendChild(idCell);
        row.appendChild(aliasCell);
        infoDisplay.appendChild(row);
      });
    }

    writePopularLinksToView(dataPayload) {
      const infoDisplay = domComposer.retrieveElement("comm_info_body");
      domComposer.clearChildren(infoDisplay);

      dataPayload.urls.forEach(linkInfo => {
        const row = domComposer.makeElement("tr", { className: "comm_info_row" });
        const userCountCell = domComposer.makeElement("td", {
          className: "comm_info_row_count",
          textContent: linkInfo[1]
        });
        const linkCell = domComposer.makeElement("td", { className: "comm_info_row_link" });
        const hyperlink = domComposer.makeElement("a", {
          className: "comm_info_row_link_item",
          href: linkInfo[0],
          textContent: linkInfo[0],
          target: "_blank"
        });

        linkCell.appendChild(hyperlink);
        row.appendChild(userCountCell);
        row.appendChild(linkCell);
        infoDisplay.appendChild(row);
      });
    }

    renderMessageToDisplay(msgData) {
      const parentContainer = domComposer.retrieveElement("comm_output_wrap");
      if (!parentContainer) return;

      const tableBody = domComposer.retrieveElement("comm_output_body");
      const rowContainer = domComposer.makeElement("tr", { className: "comm_data_entry" });

      const aliasCell = domComposer.makeElement("td", { className: "comm_alias_cell", textContent: msgData.name });
      const idCell = domComposer.makeElement("td", { className: "comm_id_cell", textContent: msgData.id });
      const timeCell = domComposer.makeElement("td", {
        className: "comm_time_cell",
        textContent: new Date(msgData.time).toLocaleTimeString(),
        title: new Date(msgData.time).toLocaleDateString()
      });
      const contentCell = domComposer.makeElement("td", { className: "comm_content_cell" });

      if (commState.pendingTransmissions[msgData.seq]) {
        delete commState.pendingTransmissions[msgData.seq];
      }

      this.injectMessageContent(contentCell, msgData.msg);
      if (msgData.origMsg) {
        contentCell.title = msgData.origMsg;
        contentCell.className += " comm_translated_content";
      }

      const isAtBottom = (parentContainer.scrollHeight - parentContainer.clientHeight) <
        (parentContainer.scrollTop + 5);

      tableBody.appendChild(rowContainer);
      rowContainer.appendChild(aliasCell);
      rowContainer.appendChild(idCell);
      rowContainer.appendChild(timeCell);
      rowContainer.appendChild(contentCell);

      if (isAtBottom) {
        parentContainer.scrollTop = parentContainer.scrollHeight - parentContainer.clientHeight;
      }
      if (!commState.initialLaunch && (msgData.id !== 0) && (msgData.id !== commState.participantIdentifier)) {
        commState.alertStateActive = true;
        this.activateTitleAlert(false);
      }
    }

    injectMessageContent(targetElement, messageContent) {
      linkify(messageContent, {
        callback: (textChunk, linkHref) => {
          let childNode;
          if (linkHref) {
            childNode = domComposer.makeElement("a", {
              href: linkHref,
              target: "_blank",
              textContent: this.formatLinkDisplay(textChunk),
              title: textChunk
            });
          } else {
            childNode = domComposer.makeElement("span", {
              textContent: this.formatTextSegments(textChunk)
            });
          }
          targetElement.appendChild(childNode);
        }
      });
    }

    formatLinkDisplay(rawLink) {
      return rawLink.length > 30 ?
        `${rawLink.substring(0, 15)}\u2026${rawLink.substring(rawLink.length - 15)}` :
        rawLink;
    }

    formatTextSegments(rawText) {
      const segmentProcessor = (parts) => {
        if (parts.length === 0) return "";
        const [head, ...tail] = parts;
        return this.breakLongWords(head) + (tail.length > 0 ? " " + segmentProcessor(tail) : "");
      };
      return segmentProcessor(rawText.split(' '));
    }

    breakLongWords(wordFragment) {
      let result = "";
      let remaining = wordFragment;
      while (remaining.length > 0) {
        if (remaining.length > 20) {
          result += remaining.substring(0, 10) + "\u200B";
          remaining = remaining.substring(10);
        } else if (remaining.length > 10) {
          result += remaining.substring(0, 10) + "\u200B";
          remaining = remaining.substring(10);
        } else {
          result += remaining;
          remaining = "";
        }
      }
      return result;
    }

    activateTitleAlert(hasFlashed) {
      if (commState.visualAlertPermitted && commState.alertStateActive && !commState.alertSequenceTimer) {
        commState.alertSequenceTimer = setTimeout(() => {
          commState.alertSequenceTimer = null;
          document.title = "*!" + (hasFlashed ? document.title.substring(2) : document.title);
          commState.alertSequenceTimer = setTimeout(() => {
            commState.alertSequenceTimer = null;
            document.title = "* " + document.title.substring(2);
            this.activateTitleAlert(true);
          }, 1000);
        }, hasFlashed ? 1000 : (10 * 1000));
      } else if (!commState.alertStateActive) {
        clearTimeout(commState.alertSequenceTimer);
        if ((document.title.substring(0, 2) === "*!") || (document.title.substring(0, 2) === "* ")) {
          document.title = document.title.substring(2);
        }
      }
    }

    engageTransmitInterface() {
      if (commState.transmitEngaged) return;
      commState.transmitEngaged = true;

      const performTransmission = () => {
        const inputField = domComposer.retrieveElement("comm_input_area");
        const inputText = inputField.value;
        if (inputText.trim().length === 0) return;

        let dataPacket = {};
        let sendContent = true;
        let dispatchMessage = true;

        let commandHandled = false;
        for (const [pattern, handler] of this.commandHandlers.entries()) {
          const match = inputText.match(pattern);
          if (match) {
            const handlerName = handler.name;
            handler.call(this, dataPacket, inputText, match);
            commandHandled = true;
            sendContent = handlerName !== 'terminateInterface' && handlerName !== 'clearDisplay' && handlerName !== 'showGuidance' && handlerName !== 'setAuthentication';
            dispatchMessage = handlerName !== 'clearDisplay' && handlerName !== 'showGuidance';
            break;
          }
        }

        if (!commandHandled) {
          this.captureMessageContent(dataPacket, inputText);
        }

        if (sendContent) {
          const currentSequence = commState.transmissionSequence;
          commState.transmissionSequence += 1;
          dataPacket.seq = currentSequence;
          dataPacket.msg = inputText;
          commState.pendingTransmissions[currentSequence] = dataPacket;
        }

        commState.inputLog.push(dataPacket);
        commState.logPointer = commState.inputLog.length;

        if (dispatchMessage) {
          this.transmitData(dataPacket);
        }

        if (!sendContent) {
          dataPacket.msg = inputText;
        }
        inputField.value = "";
        inputField.focus();
      };

      const sendButton = domComposer.retrieveElement("comm_send_action");
      const inputArea = domComposer.retrieveElement("comm_input_area");

      document.body.addEventListener("mousemove", () => { commState.alertStateActive = false; }, false);
      sendButton.addEventListener("click", performTransmission, false);

      inputArea.addEventListener("keydown", (evt) => {
        commState.alertStateActive = false;
        if (evt.key === "ArrowUp") {
          if (commState.logPointer > 0) {
            commState.logPointer -= 1;
            inputArea.value = commState.inputLog[commState.logPointer].msg;
          }
          evt.preventDefault();
        } else if (evt.key === "ArrowDown") {
          if (commState.logPointer < commState.inputLog.length - 1) {
            commState.logPointer += 1;
            inputArea.value = commState.inputLog[commState.logPointer].msg;
          } else if (commState.logPointer === commState.inputLog.length - 1) {
            commState.logPointer += 1;
            inputArea.value = "";
          }
          evt.preventDefault();
        }
        evt.stopPropagation();
      }, false);

      inputArea.addEventListener("keyup", (evt) => { evt.stopPropagation(); }, false);
      inputArea.addEventListener("keypress", (evt) => {
        if (evt.which === 13) {
          performTransmission();
          evt.preventDefault();
        }
        evt.stopPropagation();
      }, false);
    }

    // --- Command Handlers ---
    setupCommandHandlers() {
      const handlers = new Map();
      handlers.set(/^set name:/, this.processAliasChange);
      handlers.set(/^\/nick /, this.processAliasChange);
      handlers.set(/^\/quit/, this.terminateInterface);
      handlers.set(/^\/exit/, this.terminateInterface);
      handlers.set(/^\/close/, this.terminateInterface);
      handlers.set(/^\/clear/, this.clearDisplay);
      handlers.set(/^\/reload/, this.refreshWindow);
      handlers.set(/^\/force/, this.forceDisplayLink);
      handlers.set(/^set history depth:/, this.adjustHistoryDepth);
      handlers.set(/^\/depth/, this.adjustHistoryDepth);
      handlers.set(/^\/help/, this.showGuidance);
      handlers.set(/^\/users/, this.requestParticipantList);
      handlers.set(/^\/minbs /, this.setMinimumBoardSize);
      handlers.set(/^\/maxbs /, this.setMaximumBoardSize);
      handlers.set(/^\/flash /, this.setVisualAlertStatus);
      handlers.set(/^\/password/, this.setAuthentication);
      return handlers;
    }

    processAliasChange(dataBag, rawInput, match) {
      const nowTime = new Date().getTime();
      if (nowTime - commState.lastAliasUpdate > 10000) {
        dataBag.name = rawInput.substring(match[0].length).trim().substring(0, 16);
        commState.lastAliasUpdate = nowTime;
      } else {
        this.displaySystemNotification(
          "Alias update restricted to once every 10 seconds. Exercise patience!"
        );
      }
    }

    adjustHistoryDepth(dataBag, rawInput, match) {
      const depthText = rawInput.substring(match[0].length).trim();
      if (depthText) {
        let depthValue = parseInt(depthText, 10);
        if (!isNaN(depthValue) && (depthValue >= 0)) {
          depthValue = Math.min(depthValue, 20);
          dataBag.historyCount = depthValue;
        }
      }
    }

    terminateInterface() {
      const chatContainer = domComposer.retrieveElement("chattrr_container");
      if (chatContainer) {
        domComposer.clearChildren(chatContainer);
        chatContainer.remove();
      }
      commState.interfaceClosed = true;
      if (commState.connectionManager.activeLink) {
        commState.connectionManager.activeLink.disconnect();
      }
      if (commState.reconnectTimer) {
        clearInterval(commState.reconnectTimer);
      }
      if (commState.alertSequenceTimer) {
        clearTimeout(commState.alertSequenceTimer);
      }
      document.title = document.title.replace(/^\*[\!\s]/, '');
    }

    clearDisplay() {
      const tableBody = domComposer.retrieveElement("comm_output_body");
      domComposer.clearChildren(tableBody);
      commState.inputLog = [];
      commState.logPointer = 0;
    }

    refreshWindow() {
      window.location.reload();
    }

    forceDisplayLink(dataBag) {
      dataBag.force = true;
    }

    showGuidance() {
      this.displaySystemNotification("Available commands: /nick, /quit, /clear, /reload, /depth, /help, /users, /minbs, /maxbs, /flash, /password.");
    }

    requestParticipantList(dataBag) {
      dataBag.users = true;
    }

    setMinimumBoardSize(dataBag, rawInput, match) {
      const sizeText = rawInput.substring(match[0].length).trim();
      const sizeValue = parseInt(sizeText, 10);
      if (!isNaN(sizeValue) && sizeValue >= 0) {
        dataBag.minbs = sizeValue;
      }
    }

    setMaximumBoardSize(dataBag, rawInput, match) {
      const sizeText = rawInput.substring(match[0].length).trim();
      const sizeValue = parseInt(sizeText, 10);
      if (!isNaN(sizeValue) && sizeValue >= 0) {
        dataBag.maxbs = sizeValue;
      }
    }

    setVisualAlertStatus(dataBag, rawInput, match) {
      const statusText = rawInput.substring(match[0].length).trim().toLowerCase();
      if (statusText === 'on' || statusText === 'true') {
        dataBag.flash = true;
      } else if (statusText === 'off' || statusText === 'false') {
        dataBag.flash = false;
      }
    }

    setAuthentication() {
      this.displaySystemNotification("Please use '/password [your new password]' to set.");
    }

    sendAuthenticationRequest(key) {
      this.transmitData({ pass: key });
    }

    captureMessageContent(dataBag, messageText) {
      dataBag.msg = messageText;
    }
  }

  const clientInstance = new CommunicateInterface();

  commState.initiateConnections = () => {
    if (commState.connectionManager.activeLink) {
      commState.connectionManager.activeLink.disconnect();
      delete commState.connectionManager.activeLink;
    }
    const connectURL = `http://${commState.networkAddress}:${commState.channelPort}`;
    commState.connectionManager.activeLink = io.connect(connectURL, { 'force new connection': true });

    commState.connectionManager.activeLink.on('connect', () => {
      if (commState.reconnectTimer) {
        clearInterval(commState.reconnectTimer);
        commState.reconnectTimer = null;
      }
      commState.reconnectAttempts = 0;
      if (!commState.connectionEstablished) {
        clientInstance.displaySystemNotification("Connected to service.");
        commState.connectionEstablished = true;
      } else {
        clientInstance.displaySystemNotification("Reconnected to service.");
      }
      if (commState.secretKeyDigest) {
        clientInstance.sendAuthenticationRequest(commState.secretKeyDigest);
      }
    });

    commState.connectionManager.activeLink.on('message', (data) => {
      clientInstance.receiveData(data);
    });

    commState.connectionManager.activeLink.on('disconnect', () => {
      clientInstance.displaySystemNotification("Disconnected from service.");
      if (!commState.reconnectTimer) {
        commState.reconnectTimer = setInterval(() => {
          commState.reconnectAttempts += 1;
          clientInstance.displaySystemNotification(`Attempting reconnection (${commState.reconnectAttempts})...`);
          commState.initiateConnections();
        }, 5000);
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    commState.initiateConnections();
    clientInstance.engageTransmitInterface();
  });
})();