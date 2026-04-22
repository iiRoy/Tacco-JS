/*
    Licensing: Elias Vance - 2024

    This software component is part of Aura.

    Aura is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Aura is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Aura. If not, see <http://www.gnu.org/licenses/>.
*/

// Primary base class for all interactive UI components
function UserControlBase(posX, posY, objWidth, objHeight)
{
	this.objWidth = objWidth;
	this.objHeight = objHeight;

	this.relocateTo(posX, posY);
}

UserControlBase.prototype.relocateTo = function(newX, newY)
{
	this.posX = newX;
	this.posY = newY;
};

UserControlBase.prototype.triggerAction = function()
{
};

UserControlBase.prototype.renderElement = function()
{
};

UserControlBase.prototype.checkProximity = function(checkX, checkY)
{
	return (this.posX <= checkX) && (this.posY <= checkY) && (this.posX + this.objWidth >= checkX) && (this.posY + this.objHeight >= checkY);
};


// Specialized component for display mode switching
jQuery.extend(DisplayModeToggle.prototype, UserControlBase.prototype);
function DisplayModeToggle(initialX, initialY)
{
	this.objWidth = 64;
	this.objHeight = 64;

	this.isMaximized = false;
	this.isTouched = false;

	this.shrinkNormal = new Image();
	this.shrinkNormal.src = "asset/ico/min.png";

	this.expandNormal = new Image();
	this.expandNormal.src = "asset/ico/max.png";

	this.shrinkColored = new Image();
	this.shrinkColored.src = "asset/ico/min-c.png";

	this.expandColored = new Image();
	this.expandColored.src = "asset/ico/max-c.png";
}

DisplayModeToggle.prototype.renderElement = function()
{
	if (this.isMaximized)
	{
		if (this.isTouched)
		{
			renderCtx.drawImage(this.shrinkColored, this.posX, this.posY);
		}
		else
		{
			renderCtx.drawImage(this.shrinkNormal, this.posX, this.posY);
		}
	}
	else
	{
		if (this.isTouched)
		{
			renderCtx.drawImage(this.expandColored, this.posX, this.posY);
		}
		else
		{
			renderCtx.drawImage(this.expandNormal, this.posX, this.posY);
		}
	}
};

DisplayModeToggle.prototype.triggerAction = function()
{
	this.isMaximized = !this.isMaximized;
	// Action: placeholder for additional behavior
};


// Component for initiating content download
jQuery.extend(ContentAcquisitionButton.prototype, UserControlBase.prototype);
function ContentAcquisitionButton(initialX, initialY)
{
	this.objWidth = 64;
	this.objHeight = 64;

	this.isTouched = false;

	this.acquireNormal = new Image();
	this.acquireNormal.src = "asset/ico/acquire.png";

	this.acquireColored = new Image();
	this.acquireColored.src = "asset/ico/acquire-c.png";
}

ContentAcquisitionButton.prototype.renderElement = function()
{
	if (this.isTouched)
	{
		renderCtx.fillStyle = appSettings.btnColor;
		renderCtx.font = "18pt sans-serif";
		renderCtx.fillText("Obtain Aura scanning utility", this.posX, this.posY - 15);
		renderCtx.drawImage(this.acquireColored, this.posX, this.posY);
	}
	else
	{
		renderCtx.drawImage(this.acquireNormal, this.posX, this.posY);
	}
};

ContentAcquisitionButton.prototype.triggerAction = function()
{
	window.location.assign(appSettings.utilityDownloadLink);
};


// Manager for collections of UI components
function ControlPanelManager()
{
	this.controlElements = [];
}

ControlPanelManager.prototype.addElement = function(newElement)
{
	this.controlElements.push(newElement);
	this.adjustPositions();
};

ControlPanelManager.prototype.adjustPositions = function()
{
	var startX = 20;
	var startY = viewportHeight - 70;

	for (var idx = 0; idx < this.controlElements.length; idx++)
	{
		this.controlElements[idx].relocateTo(startX, startY);
		startX += 70;
	}
};

ControlPanelManager.prototype.renderElements = function()
{
	for (var idx = 0; idx < this.controlElements.length; idx++)
	{
		this.controlElements[idx].renderElement();
	}
};

ControlPanelManager.prototype.handleMouseMove = function(mouseEvt)
{
	for (var idx = 0; idx < this.controlElements.length; idx++)
	{
		var currentElement = this.controlElements[idx];
		currentElement.isTouched = currentElement.checkProximity(mouseEvt.clientXCoord, mouseEvt.clientYCoord);
	}
};

ControlPanelManager.prototype.handleMouseClick = function(mouseEvt)
{
	for (var idx = 0; idx < this.controlElements.length; idx++)
	{
		var currentElement = this.controlElements[idx];
		if (currentElement.checkProximity(mouseEvt.clientXCoord, mouseEvt.clientYCoord))
		{
			currentElement.triggerAction();
		}
	}
};