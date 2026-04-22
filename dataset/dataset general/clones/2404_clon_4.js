const NETWORK_ENDPOINT = "ws://0.0.0.0:61614/stomp";
const ACCESS_IDENTIFIER = "guest";
const SECRET_PASSPHRASE = "guest";

const FOE_ACTION_MARKUP = `
    <button id="foeRockOption" name="rock" disabled="disabled">Rock</button>
    <button id="foePaperOption" name="paper" disabled="disabled">Paper</button>
    <button id="foeScissorsOption" name="scissors" disabled="disabled">Scissors</button>
`;

const APPLICATION_MESSAGES = {
    NO_WEBSOCKET_SUPPORT: "Your web browser lacks WebSocket functionality. This application cannot operate correctly.",
    FOE_AWAITING: "<p>Your opponent is awaiting your action. Make your selection!</p>",
    PLAYER_AWAITING: "<p>Awaiting opponent's decision...</p>",
    GAME_CONCLUSION: "<p>Outcome:</p>",
    LINK_ESTABLISHED_LOG: (endpoint) => `Communication link established with ${endpoint}`,
    INCOMING_TRANSMISSION_LOG: (content) => `Incoming data: ${content}`,
    OUTGOING_TRANSMISSION_LOG: (item) => `Outgoing data: ${item}`,
    LINK_TERMINATED_LOG: "Communication link terminated...",
    LINK_FAILURE_LOG: (details) => `Communication link failure: ${details}`
};

const FOE_CHOICE_MAPPING = {
    "rock": "foeRockOption",
    "paper": "foePaperOption",
    "scissors": "foeScissorsOption"
};

class MatchController {
    constructor() {
        this.stompConnection = null;
        this.playerMoveSubmitted = false;
        this.opponentMoveSubmitted = false;
        this.incomingChannel = "";
        this.outgoingChannel = "";
        this.opponentVisualSelectionId = "";

        // UI Element References
        this.userAliasInput = document.getElementById("myName");
        this.rivalAliasInput = document.getElementById("opponentName");
        this.commenceButton = document.getElementById("goBtn");
        this.guidanceDisplay = document.getElementById("instructions");
        this.aliasEntrySection = document.getElementById("nameFields");
        this.userActionSection = document.getElementById("buttons");
        this.rivalActionSectionContainer = document.getElementById("opponentsButtons");

        this.userRockOption = document.getElementById("rockBtn");
        this.userPaperOption = document.getElementById("paperBtn");
        this.userScissorsOption = document.getElementById("scissorsBtn");

        this.initializeEventHandlers();
    }

    initializeEventHandlers() {
        document.addEventListener("DOMContentLoaded", () => this.verifyBrowserCapabilities());
        this.commenceButton.addEventListener("click", () => this.initiateSession());
        this.userRockOption.addEventListener("click", (event) => this.handleUserAction(event.target));
        this.userPaperOption.addEventListener("click", (event) => this.handleUserAction(event.target));
        this.userScissorsOption.addEventListener("click", (event) => this.handleUserAction(event.target));
    }

    verifyBrowserCapabilities() {
        if (!window.WebSocket) {
            this.aliasEntrySection.style.visibility = "hidden";
            this.guidanceDisplay.style.visibility = "visible";
            this.guidanceDisplay.innerHTML = APPLICATION_MESSAGES.NO_WEBSOCKET_SUPPORT;
        }
    }

    initiateSession() {
        this.userAliasInput.setAttribute("disabled", "disabled");
        this.rivalAliasInput.setAttribute("disabled", "disabled");
        this.commenceButton.setAttribute("disabled", "disabled");

        this.guidanceDisplay.style.visibility = "visible";
        this.userActionSection.style.visibility = "visible";

        this.outgoingChannel = `/queue/${this.rivalAliasInput.value}`;
        this.incomingChannel = `/queue/${this.userAliasInput.value}`;

        this.establishNetworkLink();
    }

    establishNetworkLink() {
        this.stompConnection = Stomp.client(NETWORK_ENDPOINT);
        this.stompConnection.connect(ACCESS_IDENTIFIER, SECRET_PASSPHRASE,
            () => this.onLinkEstablished(),
            (error) => this.onLinkFailure(error)
        );
    }

    onLinkEstablished() {
        console.log(APPLICATION_MESSAGES.LINK_ESTABLISHED_LOG(NETWORK_ENDPOINT));
        this.stompConnection.subscribe(this.incomingChannel, (transmission) => {
            console.log(APPLICATION_MESSAGES.INCOMING_TRANSMISSION_LOG(transmission.body));
            this.opponentMoveSubmitted = true;
            if (!this.playerMoveSubmitted) {
                this.rivalActionSectionContainer.style.visibility = "hidden";
                this.guidanceDisplay.innerHTML = APPLICATION_MESSAGES.FOE_AWAITING;
            } else {
                this.guidanceDisplay.innerHTML = APPLICATION_MESSAGES.GAME_CONCLUSION;
                this.terminateNetworkLink();
            }
            this.rivalActionSectionContainer.innerHTML = FOE_ACTION_MARKUP;
            this.opponentVisualSelectionId = FOE_CHOICE_MAPPING[transmission.body];
            document.getElementById(this.opponentVisualSelectionId).style.backgroundColor = "yellow";
        });
        console.log(`Subscribed to ${this.incomingChannel}`);
    }

    onLinkFailure(errorDetails) {
        console.log(APPLICATION_MESSAGES.LINK_FAILURE_LOG(errorDetails));
    }

    handleUserAction(selectedElement) {
        this.stompConnection.send(this.outgoingChannel, {}, selectedElement.name);
        this.playerMoveSubmitted = true;
        console.log(APPLICATION_MESSAGES.OUTGOING_TRANSMISSION_LOG(selectedElement.name));

        selectedElement.style.backgroundColor = "orange";
        this.userRockOption.setAttribute("disabled", "disabled");
        this.userPaperOption.setAttribute("disabled", "disabled");
        this.userScissorsOption.setAttribute("disabled", "disabled");

        if (this.opponentMoveSubmitted) {
            this.rivalActionSectionContainer.style.visibility = "visible";
            this.guidanceDisplay.innerHTML = APPLICATION_MESSAGES.GAME_CONCLUSION;
            this.terminateNetworkLink();
        } else {
            this.guidanceDisplay.innerHTML = APPLICATION_MESSAGES.PLAYER_AWAITING;
        }
    }

    terminateNetworkLink() {
        this.stompConnection.disconnect(() => {
            console.log(APPLICATION_MESSAGES.LINK_TERMINATED_LOG);
        });
    }
}

new MatchController();