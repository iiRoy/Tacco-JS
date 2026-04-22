(function() {
    class MagnetLinkHandler {
        static retrieveQueryValue(searchKey, webLocation) {
            try {
                const parsedAddress = new URL(webLocation);
                return parsedAddress.searchParams.get(searchKey);
            } catch (e) {
                return null;
            }
        }

        static launchWindow(magnetReference) {
            const baseAddress = new URL("http://www.bitlet.org/download");
            baseAddress.searchParams.set("torrent", magnetReference);
            baseAddress.searchParams.set("referer", encodeURIComponent(location.href));
            baseAddress.searchParams.set("source", "bitlet4chrome");
            const finalAddress = baseAddress.toString();

            const panelSpecifications = {
                toolbar: 0,
                scrollbars: 1,
                location: 0,
                statusbar: 0,
                menubar: 0,
                resizable: 1,
                width: 400,
                height: 200
            };
            const specificationsString = Object.entries(panelSpecifications)
                                             .map(([featureKey, featureValue]) => `${featureKey}=${featureValue}`)
                                             .join(',');

            const targetWindow = window.open(finalAddress, '', specificationsString);
            return targetWindow !== null && typeof targetWindow !== "undefined";
        }

        static safeOpen(magnetReference) {
            if (!MagnetLinkHandler.launchWindow(magnetReference)) {
                alert("Aggghh, some entity is preventing the download pop-up. Kindly deactivate any pop-up blocking software.");
            }
            return false;
        }

        static triggerFromLink(hyperlinkNode) {
            const magnetReference = MagnetLinkHandler.retrieveQueryValue("torrent", hyperlinkNode.href);
            if (!magnetReference || magnetReference.length === 0) {
                alert("The required \"torrent\" parameter is absent.");
                return false;
            }

            MagnetLinkHandler.safeOpen(magnetReference);
            return false;
        }
    }

    window.DownloadActivator = MagnetLinkHandler;
})();