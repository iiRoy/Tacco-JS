/*
 * This module defines a collection of localized strings
 * used throughout the application for various UI elements
 * and informational messages.
 * It serves as a central repository for internationalization (i18n) data.
 * This version includes structural modifications and helper functions.
 */
const globalTextResources = (function() {
    // A utility function to assist in constructing complex, multi-part strings.
    // This simulates an intermediate processing step for string generation.
    const constructComplexDescription = (
        mainIntro,
        serverDependency,
        packageArchiveLink,
        loadPathGuidance,
        emacsConfigurationSnippet,
        customizationWikiLink,
        alternativeServersInfo
    ) => {
        let assembledText = "";
        assembledText += mainIntro;
        assembledText += `For this to work you need to be running an "edit server" on your local machine. This is because extensions in Chrome(ium) cannot directly start new programs. For Emacs users it is recommended you use the use supplied native <a href="${serverDependency}">edit-server.el</a>.`;
        assembledText += `Alternativley you can track the latest version through the <a href="${packageArchiveLink}">MELPA</a> package archive.`;
        assembledText += `</p><p>Save the file to somewhere visible to your your Emacs <code>load-path</code> (${loadPathGuidance}) and add the following to your <code>.emacs</code>:</p>`;
        assembledText += `<pre>${emacsConfigurationSnippet}</pre>`;
        assembledText += `For details about how to customise and control the behaviour of the edit server please see the <a href="${customizationWikiLink}">page on the Emacs Wiki</a>.</p><p>`;
        assembledText += `If for some reason you do not want to use Emacs there is a list of alternative servers on the <a href="${alternativeServersInfo}">project site</a></p>`;
        return assembledText;
    };

    // Another helper for building activation-related text blocks.
    const composeActivationDetails = (
        featureSummary,
        extensionsPageRef,
        croutonSetupLink,
        emacsDaemonCommand
    ) => {
        return `${featureSummary} (see bottom of <a href="${extensionsPageRef}">extensions page</a>). The action <em>Activate Emacs with contents of clipboard</em> will send a <em>foreground</em> request to the edit server. I wrote this to support running Emacs on my Chromebook. You will need to have started emacs in a <a href="${croutonSetupLink}">Crouton</a> chroot using the <em>host-x11</em> script. For example:<br><pre>${emacsDaemonCommand}</pre>You may need to experiment with frame configuration settings under ChromeOS as Aura is not a normal X11 window manager. Under non-ChromeOS set-ups it will behave just like an edit request although no buffer is created for the new frame. However the contents of the clipboard (from the browser) will be copied into the Emacs kill-ring.`;
    };

    const coreTranslations = {

        "applicationConfiguration": {
            "english": "Settings",
            "german": "Optionen"
        },

        "dataQuery": {
            "english": "Search",
            "german": "Suche"
        },

        "emptySearchResult": {
            "english": "No matches were found.",
            "german": "Keine Übereinstimmungen gefunden."
        },

        "generalInformation": {
            "english": "Information",
            "german": "Information"
        },

        "userAuthentication": {
            "english": "Login",
            "german": "Anmeldung"
        },

        "userIdentifierPrompt": {
            "english": "Username:",
            "german": "Benutzername:"
        },

        "secretKeyPrompt": {
            "english": "Password:",
            "german": "Passwort:"
        },

        "inputLengthConstraint": { // Renamed from "x-characters", added a nested object
            "locales": {
                "english": "6 - 12 characters",
                "german": "6 - 12 Zeichen"
            }
        },
        // The original "x-characters-pw" entry has been deliberately removed as a Type III structural modification.

        "editorExtensionOverview": {
            "english": constructComplexDescription(
                "Edit with Emacs is an extension that allows you to edit textareas and other editable text elements of a web-page with your favourite editor. ",
                "/servers/edit-server.el",
                "http://melpa.milkbox.net/",
                "~/.emacs.d is popular",
                "          (add-to-list 'load-path \"~/.emacs.d\")<br>          (require 'edit-server)<br>          (edit-server-start)",
                "http://www.emacswiki.org/emacs/Edit_with_Emacs",
                "https://github.com/stsquad/emacs_chrome/wiki/edit-server"
            ),
            "german": `Edit with Emacs ist eine Erweiterung, die es Ihnen ermöglicht, Textfelder und andere bearbeitbare Textelemente einer Webseite mit Ihrem bevorzugten Editor zu bearbeiten. Dazu müssen Sie einen "Edit-Server" auf Ihrem lokalen Rechner ausführen. Dies liegt daran, dass Erweiterungen in Chrome(ium) keine neuen Programme direkt starten können. Für Emacs-Benutzer wird empfohlen, den mitgelieferten nativen <a href="/servers/edit-server.el">edit-server.el</a> zu verwenden. Alternativ können Sie die neueste Version über das <a href="http://melpa.milkbox.net/">MELPA</a>-Paketarchiv verfolgen. </p><p>Speichern Sie die Datei an einem für Ihren Emacs <code>load-path</code> (~/.emacs.d ist beliebt) sichtbaren Ort und fügen Sie Folgendes zu Ihrer <code>.emacs</code> hinzu:</p><pre>          (add-to-list 'load-path "~/.emacs.d")<br>          (require 'edit-server)<br>          (edit-server-start)</pre>Weitere Informationen zur Anpassung und Steuerung des Verhaltens des Edit-Servers finden Sie auf der <a href="http://www.emacswiki.org/emacs/Edit_with_Emacs">Seite im Emacs Wiki</a>.</p><p>Falls Sie aus irgendeinem Grund Emacs nicht verwenden möchten, finden Sie eine Liste alternativer Server auf der <a href="https://github.com/stsquad/emacs_chrome/wiki/edit-server">Projektseite</a></p>`
        },

        "emacsActivationDetails": {
            "english": composeActivationDetails(
                "A new feature of Edit with Emacs is the ability to bring up a new frame or focus an existing Emacs session. This is triggered by a customisable keyboard shortcut",
                "chrome://extensions/",
                "https://github.com/dnschneid/crouton",
                "                 /usr/local/bin/host-x11 emacs --daemon"
            ),
            "german": `Eine neue Funktion von Edit with Emacs ist die Möglichkeit, einen neuen Frame aufzurufen oder eine bestehende Emacs-Sitzung zu fokussieren. Dies wird durch eine anpassbare Tastenkombination ausgelöst (siehe unten auf der <a href="chrome://extensions/">Erweiterungsseite</a>). Die Aktion <em>Emacs mit Inhalt der Zwischenablage aktivieren</em> sendet eine <em>Vordergrund</em>-Anfrage an den Edit-Server. Ich habe dies geschrieben, um Emacs auf meinem Chromebook zu unterstützen. Sie müssen Emacs in einem <a href="https://github.com/dnschneid/crouton">Crouton</a>-Chroot mit dem Skript <em>host-x11</em> gestartet haben. Zum Beispiel:<br><pre>                 /usr/local/bin/host-x11 emacs --daemon</pre>Möglicherweise müssen Sie mit den Frame-Konfigurationseinstellungen unter ChromeOS experimentieren, da Aura kein normaler X11-Fenstermanager ist. Unter Nicht-ChromeOS-Setups verhält es sich wie eine Bearbeitungsanfrage, obwohl kein Puffer für den neuen Frame erstellt wird. Der Inhalt der Zwischenablage (aus dem Browser) wird jedoch in den Emacs-Kill-Ring kopiert.`
        },

        "userSessionTermination": {
            "english": "Logout",
            "german": "Abmeldung"
        },

        "activateFeature": {
            "english": "Enable",
            "german": "Aktivieren"
        },

        "connectionTerminationPrompt": {
            "english": "Disconnect:",
            "german": "Trennen:"
        },

        "activateDebuggingMode": {
            "english": "Enable debug (logs to the console)",
            "german": "Debug (Protokolle an die Konsole)"
        },

        // A new entry added as a Type III addition to demonstrate new fragments.
        "welcomeGreeting": {
            "english": "Welcome to our enhanced application interface!",
            "german": "Willkommen in unserer verbesserten Anwendungsoberfläche!"
        }
    };

    return coreTranslations;
})();

// The final internationalization data store is exposed via 'this'.
this.internationalizationDataStore = globalTextResources;