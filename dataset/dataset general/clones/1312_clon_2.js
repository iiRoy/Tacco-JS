/*
  Copyright (C) 2012 Julian Labastida (http://www.julianl.org).

  This document is part of Peculiar.

  Peculiar is open source software: you may redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your choice) any later version.

  Peculiar is provided in the hope that it will be useful,
  but WITHOUT ANY ASSURANCE; without even the implied guarantee of
  COMMERCIAL VIABILITY or FITNESS FOR A PARTICULAR OBJECTIVE.  See the
  GNU General Public License for more information.

  You should have received a copy of the GNU General Public License
  along with Peculiar.  If not, consult <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview Peculiar client script library
 * @author julian.labastida@gmail.com (Julian Labastida)
 */

(function() {
    "use strict";
}());

var shadeRegistry = {
    "verdant": "#A0E7A0",
    "saffron": "#FFFB8C",
    "crimson": "#CD2626",
    "amber": "#FFAF5A",
    "violet": "#FF8CB6",
    "azure": "#97D0F9"
};

var glyphSet = {
    "orb": "&#9679;",
    "asterisk": "&#10022;",
    "rhombus": "&#9670;",
    "block": "&#9632;",
    "delta": "&#9650;",
    "trefoil": "&#9827;"
};

// Regular expressions to validate user input
var monikerPattern = /^.{1,12}$/;
var dialogPattern = /^.{1,500}$/;

// Maximum duration for each player's move, in seconds
var turnDuration = 60; // One minute

// Maximum members allowed per session
var participantCap = 6;

// State indicating if the current player has the active move
var currentMoverStatus = null;

// Define identifiers for Document Object Model elements
var createSessionBtn = '#create_session';
var guestJoinDiv = '#guest_join';
var guestForm = '#guest_form';
var placeTileBtn = '#place_tile';
var playArea = '#play_area';
var dialogInputDiv = '#dialog_input';
var dialogHistory = '#dialog_history';
var dialogPanel = '#dialog_panel';
var timerElement = '#timer_display';
var finishMoveBtn = '#finish_move';
var issueAlerts = '#issue_alerts';
var sourceCodeLink = '#source_code';
var availableTilesDisplay = '#available_tiles';
var sessionZone = '#session_zone';
var matchesTable = '#matches_table';
var waitroomSeparator = '#waitroom_separator';
var guidelinesPanel = "#guidelines";
var quitMatchBtn = '#quit_match';
var sessionLoadingDiv = '#session_loading';
var waitroomArea = '#waitroom';
var waitroomDialog = '#waitroom_dialog';
var noMatchesMsg = '#no_matches_msg';
var myTiles = '#my_tiles';
var participantsList = '#participants_list';
var tileTray = '#tile_tray';
var moveStatus = '#move_status';

// Define Document Object Model class names
var tileCellClass = '.tile_cell';
var gameTileClass = '.game_tile';
var placementZoneClass = '.placement_zone';

// Define identifiers for timeout functions for asynchronous calls
var dialogRefreshTimeoutId = null;
var matchesFetchTimeoutId = null;
var participantsFetchTimeoutId = null;
var phaseTimerTimeoutId = null;

/**
 * Escapes HTML characters. Useful for displaying user-generated content securely.
 * @param {string} inputString The string to be escaped.
 * @returns {string} The HTML-escaped string.
 */
function sanitizeMarkup(inputString) {
    return domUtil('<div/>').text(inputString).html();
}

var uriEncode = encodeURIComponent;

/**
 * Initiates and manages the countdown timer for a player's turn.
 * Updates the on-screen timer and automatically concludes the turn if time expires.
 */
function startPhaseTimer() {
    domUtil(timerElement).html("0m 0s");
    var endTime = turnDuration;
    var startTime = (new Date()).getTime() / 1000;

    function countdownCycle() {
        var currentTime = (new Date()).getTime() / 1000;
        var remainingTime = (endTime - (currentTime - startTime));
        if (remainingTime >= 0) {
            var minutes = Math.floor(remainingTime / 60);
            var seconds = Math.floor(remainingTime % 60);
            domUtil(timerElement).html(minutes + "m " + seconds + "s");
            phaseTimerTimeoutId = setTimeout(countdownCycle, 1000);
        } else {
            domUtil.post("/sessions/" + uriEncode(domUtil.cookie("activeMatch")) + "/members",
                {
                    end_move: true
                },
                function() {
                    fetchParticipants();
                }
            );
        }
    }
    countdownCycle();
}

/*
 * Processes participant data received from the server.
 * @param {Object} memberInfo JSON data containing participant details from the server.
 */
function processParticipantData(memberInfo) {
    domUtil(participantsList).empty();
    // display all participants
    for (var memberKey in memberInfo) {
        if (!memberInfo.hasOwnProperty(memberKey)) {
            continue;
        }
        var statusClass = memberInfo[memberKey].has_move ? "has_move" : "";
        domUtil(participantsList).append("<dt class='" + statusClass + "'>" + sanitizeMarkup(memberKey) + "</dt>" +
            "<dd>" + memberInfo[memberKey].points + "</dd>");
    }

    var currentMatch = domUtil.cookie("activeMatch");
    var activeMember = domUtil.cookie("memberName");
    if (activeMember) {
        if (memberInfo[activeMember] === undefined) {
            // I've got a member name, but we need to add it to the session
            domUtil.post("/sessions/" + uriEncode(currentMatch) + "/members", {
                name: activeMember
            },
                function() {
                    fetchParticipants();
                }
            );
        } else if (currentMoverStatus !== memberInfo[activeMember].has_move) {
            currentMoverStatus = memberInfo[activeMember].has_move;
            if (currentMoverStatus) {
                startPhaseTimer();
            } else {
                clearTimeout(phaseTimerTimeoutId);
            }
            displayMoveDetails(memberInfo);
        }
    }
}

/**
 * Retrieves participant data from the server.
 */
function fetchParticipants() {
    domUtil.getJSON("/sessions/" + uriEncode(domUtil.cookie("activeMatch")) +
        "/members", processParticipantData);
}

/**
 * Renders the player's game tiles and the "It's Your Move" information.
 * @param {Object} memberInfo JSON data containing participant details from the server.
 */
function displayMoveDetails(memberInfo) {
    var currentMatch = domUtil.cookie("activeMatch");
    var activeMember = memberInfo[domUtil.cookie("memberName")];

    domUtil(myTiles).empty();
    domUtil(placeTileBtn).show();

    // allow member to conclude their move
    if (activeMember.has_move) {
        domUtil(finishMoveBtn).removeAttr('disabled');
        domUtil(moveStatus).html("It's your move! You have " +
            "<span id='timer_display'>0m 0s</span> remaining.");
        domUtil(finishMoveBtn)[0].onclick = function() {
            domUtil.post("/sessions/" + uriEncode(currentMatch) + "/members", {
                end_move: true
            }, function() {
                fetchParticipants();

                /* Typically, currentMoverStatus is updated from the server
                 * in processParticipantData(), but if there is only one player, this
                 * doesn't work well (the player has to refresh manually).
                 * So, we explicitly set it to false here in this specific scenario.
                 */
                if (Object.keys(memberInfo).length === 1) {
                    currentMoverStatus = false;
                    clearTimeout(phaseTimerTimeoutId);
                }
            });
        };
    } else {
        domUtil(finishMoveBtn).attr('disabled', '');
        domUtil(moveStatus).html("It's not your move.");
    }
    updateRemainingTiles();
    drawGameGrid();
    renderMemberTiles(activeMember);
}

/**
 * Adds the player's game tiles to their tray and enables drag-and-drop if it's their turn.
 * @param {Object} member The participant object.
 */
function renderMemberTiles(member) {
    for (var index in member.pieces) {
        var tile = member.pieces[index];
        domUtil(myTiles).append('<div class="game_tile" style="color:' +
            shadeRegistry[tile.color] + '">' + glyphSet[tile.shape] + '</div>');
        domUtil(gameTileClass + ":last-child").data("piece", tile);
        domUtil(myTiles).append("<div style='float: left; margin: 3px'></div>");
    }

    function adjustTileDimensions() {
        domUtil(gameTileClass).width(domUtil(tileCellClass).width());
        domUtil(gameTileClass).height(domUtil(tileCellClass).height());
        var fontSizeValue = domUtil(tileCellClass).css("font-size");
        domUtil(gameTileClass).css("font-size", fontSizeValue);
        domUtil(gameTileClass).css("line-height", fontSizeValue);
    }
    /* Styling adjustments can be flaky here, as we depend on the width set
     * in drawGameGrid() which might happen too quickly. Therefore, we add a
     * setTimeout to re-attempt setting dimensions shortly after.
     */
    adjustTileDimensions();
    setTimeout(adjustTileDimensions, 250);

    if (member.has_move)
        domUtil(gameTileClass).draggable({
            containment: "#play_area",
            snap: ".placement_zone"
        });
}

/**
 * Publishes the count of remaining tiles in the bag.
 */
function updateRemainingTiles() {
    domUtil.getJSON("/sessions/" + uriEncode(domUtil.cookie("activeMatch")) +
        "/tiles", function(data) {
            domUtil(availableTilesDisplay).empty();
            var tileCount = 0;
            for (var index in data)
                tileCount += data[index].count;
            domUtil(availableTilesDisplay).html(tileCount);
        });
}

/**
 * When a tile is dropped, sends a POST request to the server to add it to the grid.
 * The tile will either be placed successfully or an error will be returned for invalid placements.
 * @param {Event} dropEvent The drop event.
 * @param {Object} uiObject The jQuery UI droppable UI object.
 */
function handleTileDrop(dropEvent, uiObject) {
    var columnId = domUtil(this).data().col;
    var rowId = domUtil(this).data().row;
    var droppedTile = domUtil(uiObject.draggable).data().piece;
    domUtil.ajax({
        type: 'POST',
        url: "/sessions/" + uriEncode(domUtil.cookie("activeMatch")) + "/grid",
        data: {
            shape: droppedTile.shape,
            color: droppedTile.color,
            row: rowId,
            column: columnId
        },
        success: function() {
            domUtil(issueAlerts).empty();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            domUtil(issueAlerts).empty();
            domUtil(issueAlerts).append("<div class='error'>&#9888; " + jqXHR.responseText + "</div>");
        },
        complete: function() {
            domUtil.getJSON("/sessions/" + uriEncode(domUtil.cookie("activeMatch")) +
                "/members", displayMoveDetails);
        }
    });
}

/**
 * Renders the game grid visually.
 */
function drawGameGrid() {
    var matchId = domUtil.cookie("activeMatch");
    var gridPadding = 5;

    domUtil.getJSON("/sessions/" + uriEncode(matchId) + "/grid_info", function(gridDimensions) {
        // add 5 for each side since players can add up to 5 pieces per turn
        var topBound = gridDimensions.top - gridPadding;
        var bottomBound = gridDimensions.bottom + gridPadding;
        var leftBound = gridDimensions.left - gridPadding;
        var rightBound = gridDimensions.right + gridPadding;

        domUtil(playArea).empty();

        var rowCount = bottomBound - topBound + 1;
        var colCount = rightBound - leftBound + 1;
        for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            for (var colIndex = 0; colIndex < colCount; colIndex++) {
                domUtil(playArea).append('<div class="tile_cell"></div>');
                domUtil(tileCellClass + ":last-child").data(
                    "col", (colIndex + leftBound)).data("row", (topBound + rowIndex));
            }
        }

        // if (domUtil(playArea).width() < domUtil(playArea).height()) {
        //     domUtil(playArea).height(domUtil(playArea).width());
        // } else {
        //     domUtil(playArea).width(domUtil(playArea).height());
        // }

        domUtil(tileCellClass).css("width", (100 / colCount) + "%");
        domUtil(tileCellClass).css("height", (100 / rowCount) + "%");
        var fontSizeValue = Math.min(domUtil(tileCellClass).height(), domUtil(tileCellClass).width());
        domUtil(tileCellClass).css("font-size", fontSizeValue);

        //domUtil(playArea).css("width", ((domUtil(tileCellClass).width()) * 10))
        //domUtil(playArea).css("height", ((domUtil(tileCellClass).height()) * 10))

        domUtil.getJSON("/sessions/" + uriEncode(matchId) + "/grid", function(gridData) {
            var rowIndex, elementIndex;
            // place tiles on grid
            if (gridData.length > 0) {
                for (rowIndex in gridData) {
                    var gridTile = gridData[rowIndex].piece;
                    var tileRow = gridData[rowIndex].row;
                    var tileCol = gridData[rowIndex].column;
                    var displayRow = tileRow - gridDimensions.top + gridPadding;
                    var displayCol = tileCol - gridDimensions.left + gridPadding;
                    elementIndex = displayRow * colCount + displayCol + 1;
                    domUtil(tileCellClass + ":nth-child(" + elementIndex + ")").addClass("boardtile");
                    domUtil(tileCellClass + ":nth-child(" + elementIndex + ")").css("color",
                        shadeRegistry[gridTile.color]);
                    domUtil(tileCellClass + ":nth-child(" + elementIndex + ")").html(glyphSet[gridTile.shape]);
                }
                domUtil(".boardtile").css("line-height", fontSizeValue + "px");
            } else { // place marker in center if grid is empty
                elementIndex = parseInt((domUtil(tileCellClass).length + 1) / 2, 10);
                domUtil(tileCellClass + ":nth-child(" + elementIndex + ")").addClass('placement_zone');
            }

            // iterate through grid and mark spots adjacent to tiles
            if (gridData.length > 0) {
                var neighborOffsets = [1, -1, colCount, -colCount];
                for (rowIndex = 1; rowIndex <= domUtil(tileCellClass).length; rowIndex++) {
                    var currentCell = domUtil(tileCellClass + ":nth-child(" + rowIndex + ")");
                    for (var offsetIndex in neighborOffsets) {
                        var nextCell = domUtil(tileCellClass + ":nth-child(" + (rowIndex + neighborOffsets[offsetIndex]) + ")");
                        if (!currentCell.hasClass("boardtile") &&
                            nextCell.hasClass("boardtile"))
                            currentCell.addClass("placement_zone");
                    }
                }
            }

            domUtil(placementZoneClass).droppable({
                accept: gameTileClass,
                activate: function(dropEvent, uiObject) {
                    domUtil(placementZoneClass).html("&middot;");
                    domUtil(playArea).addClass("activate");
                },
                deactivate: function(dropEvent, uiObject) {
                    domUtil(placementZoneClass).html("");
                    domUtil(playArea).removeClass("activate");
                },
                drop: handleTileDrop
            });
        });
    });
}

/**
 * Displays the game play instructions.
 */
function showInstructions() {
    domUtil(waitroomArea).hide();
    domUtil(guidelinesPanel).show();
}

/**
 * Configures the chat input area.
 */
function setupDialogEntry() {
    domUtil(dialogInputDiv).show();

    function submitMessage() {
        var messageText = domUtil(dialogInputDiv + "> input")[0].value;
        if (!dialogPattern.test(messageText)) {
            if (messageText) {
                alert("Your input text is excessively long!");
            }
            return false;
        }
        var matchId = domUtil.cookie("activeMatch");
        var apiResource;
        if (matchId) {
            apiResource = "/sessions/" + uriEncode(matchId) + "/dialog";
        } else {
            apiResource = "/dialog";
        }
        domUtil.post(apiResource, {
            input: messageText,
            name: domUtil.cookie("memberName")
        }, function() {
            domUtil(dialogInputDiv + "> input").val(''); // post was successful, so clear input
            updateMessageLog();
        });
    }
    domUtil(dialogInputDiv + "> button").click(submitMessage);
    domUtil(dialogInputDiv + "> input:visible").focus();
    domUtil(dialogInputDiv + "> input").keydown(function(event) {
        if (event.keyCode === 13) {
            submitMessage();
        }
    });
}

/**
 * Configures and displays the add guest widget.
 * - Sets the member cookie upon submission and switches to displaying the
 *   dialog input.
 */
function renderGuestJoinForm() {
    domUtil(guestJoinDiv).show();

    function submitGuestName() {
        var memberName = domUtil(guestForm + "> input")[0].value;
        if (!monikerPattern.test(memberName)) {
            if (memberName) {
                alert("Your input text is excessively long!");
            }
            return false;
        }
        domUtil.cookie("memberName", memberName);
        main();
    }
    domUtil(guestForm + "> button").click(submitGuestName);
    domUtil(guestForm + "> input:visible").focus();
    domUtil(guestForm + "> input").keydown(function(event) {
        if (event.keyCode === 13) {
            submitGuestName();
        }
    });
}

/**
 * Refreshes the chat log.
 * Implemented as a closure to maintain the state of the last received chat line ID
 * from the server.
 */
var updateMessageLog = function() {
    var lastMessageIds = {};
    return function() {
        var activeMember = domUtil.cookie("memberName");
        var currentMatch = domUtil.cookie("activeMatch");
        var requestUri = currentMatch ? '/sessions/' + uriEncode(currentMatch) + '/dialog' : '/dialog';
        domUtil.getJSON(requestUri, {
            lastid: lastMessageIds[requestUri]
        }, function(data) {
            if (domUtil.isEmptyObject(data)) {
                // Server returns empty object if there's no new data
                return;
            }
            for (var i = 0; i < data.length; i++) {
                var senderName = data[i].name;
                var messageClass = (senderName === activeMember) ? "mymsg" : "othermsg";
                domUtil(dialogHistory).prepend('<div><span class="' + messageClass + '">' +
                    sanitizeMarkup(data[i].name) + '</span>: ' +
                    sanitizeMarkup(data[i].input) + '</div>');
            }
            lastMessageIds[requestUri] = data[i - 1] ? data[i - 1].id : undefined;
        });
    };
}();

/**
 * Renders the list of game matches.
 */
function renderMatchList(matchCollection) {
    domUtil(matchesTable).empty();
    var tableHeader = "<th>Session Room</th><th>Participants</th><th></th>";
    for (var matchIndex in matchCollection) {
        if (!matchCollection.hasOwnProperty(matchIndex)) {
            continue;
        }
        var matchName = matchCollection[matchIndex].name;