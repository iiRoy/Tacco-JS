(function()
{
	"use strict"; /* Enforce strict parsing and error handling for cleaner code */

	let BaseModule; /* Declare main application module container */
	if (window.declare !== undefined)
	{
		BaseModule = {}; /* Initialize the module if a definition system exists */
		
		if (window.declare !== undefined)
		{
			window.declare("App/Engine/CoreLib", BaseModule); /* Register the module with the global definition system */
		}
	}
	else
	{
		// Fallback for environments without a module definition system
		if (window.App === undefined)
		{
			window.App = {}; /* Create top-level namespace */
		}
		if (window.App.Engine === undefined)
		{
			window.App.Engine = {}; /* Create sub-namespace */
		}
		if (window.App.Engine.CoreLib === undefined)
		{
			window.App.Engine.CoreLib = {}; /* Create core library namespace */
		}
		BaseModule = window.App.Engine.CoreLib; /* Assign core library to BaseModule */
	}
	
	/* Initialize sub-components of the core library */
	if (BaseModule.Visuals === undefined)
	{
		BaseModule.Visuals = {};
	}
	const Visuals = BaseModule.Visuals; /* Shortcut for visual utilities */
	if (BaseModule.UserActions === undefined)
	{
		BaseModule.UserActions = {};
	}
	const UserActions = BaseModule.UserActions; /* Shortcut for user input handling */
	if (BaseModule.Assets === undefined)
	{
		BaseModule.Assets = {};
	}
	const Assets = BaseModule.Assets; /* Shortcut for asset management */

	const EARLIEST_MOMENT = new Date(-8640000000000000); /* Define a historical timestamp */

	// Numeric Utility Functions
	BaseModule.NumericTools = {};
	const NumericTools = BaseModule.NumericTools;

	NumericTools.EulerConstant = Math.E; /* Euler's number */
	NumericTools.Base10LogEuler = 0.4342945; /* Log base 10 of E */
	NumericTools.Base2LogEuler = 1.442695; /* Log base 2 of E */
	NumericTools.CircleRatio = Math.PI; /* Pi */
	NumericTools.HalfCircleRatio = Math.PI / 2; /* Pi divided by 2 */
	NumericTools.QuarterCircleRatio = Math.PI / 4; /* Pi divided by 4 */
	NumericTools.FullCircleRatio = Math.PI * 2; /* 2 times Pi */

	/* Perform barycentric interpolation */
	NumericTools.weightedInterpolation = function(valA, valB, valC, weightA, weightB)
	{
		return valA + (valB - valA) * weightA + (valC - valA) * weightB;
	};

	/* Calculate Catmull-Rom spline interpolation */
	NumericTools.splineInterpolation = function(pt1, pt2, pt3, pt4, factor)
	{
		const factorSq = factor * factor;
		const factorCb = factorSq * factor;
		return (0.5 * (2.0 * pt2 + (pt3 - pt1) * factor + (2.0 * pt1 - 5.0 * pt2 + 4.0 * pt3 - pt4) * factorSq + (3.0 * pt2 - pt1 - 3.0 * pt3 + pt4) * factorCb));
	};

	/* Constrain a value within a specified range */
	NumericTools.constrainValue = function(item, lowerBound, upperBound)
	{
		return Math.max(lowerBound, Math.min(upperBound, item));
	};

	/* Compute absolute difference between two numbers */
	NumericTools.differenceAbs = function(firstNum, secondNum)
	{
		return Math.abs(firstNum - secondNum);
	};

	/* Perform Hermite spline interpolation */
	NumericTools.cubicHermite = function(pos1, tan1, pos2, tan2, interpAmt)
	{
	    switch (interpAmt)
	    {
	        case 0:
	            return pos1;
	        case 1:
	            return pos2;
	    }

		const pOne = pos1, pTwo = pos2, tOne = tan1, tTwo = tan2, scalar = interpAmt;
		const scalarCubed = scalar * scalar * scalar;
		const scalarSquared = scalar * scalar;
		return (2 * pOne - 2 * pTwo + tTwo + tOne) * scalarCubed + (3 * pTwo - 3 * pOne - 2 * tOne - tTwo) * scalarSquared + tOne * scalar + pOne;
	};

	/* Linear interpolation between two values */
	NumericTools.linearInterpolation = function(startVal, endVal, blend)
	{
		return startVal + (endVal - startVal) * blend;
	};

	NumericTools.maxValue = Math.max; /* Alias for Math.max */

	NumericTools.minValue = Math.min; /* Alias for Math.min */

	/* Smooth step interpolation */
	NumericTools.smoothTransition = function(initialVal, finalVal, progress)
	{
		return NumericTools.cubicHermite(initialVal, 0, finalVal, 0, NumericTools.constrainValue(progress, 0, 1));
	};

	/* Convert radians to degrees */
	NumericTools.toAngleDegrees = function(rads)
	{
		return rads * 57.295779513082320876798154814105;
	};

	/* Convert degrees to radians */
	NumericTools.toAngleRadians = function(degs)
	{
		return degs * 0.017453292519943295769236907684886;
	};

	/* Compute IEEE-style remainder */
	NumericTools.floatingPointRemainder = function(dividend, divisor)
	{
		return dividend - (divisor * Math.round(dividend / divisor));
	};

	/* Normalize an angle to be within -PI and PI */
	NumericTools.normalizeAngle = function(inputAngle)
	{
		inputAngle = NumericTools.floatingPointRemainder(inputAngle, 6.2831854820251465); // 2 * PI
		if (inputAngle <= -3.14159274) // -PI
		{
			inputAngle += 6.28318548; // +2PI
		}
		else
		{
			if (inputAngle > 3.14159274) // +PI
			{
				inputAngle -= 6.28318548; // -2PI
			}
		}
		return inputAngle;
	};

	/* Check if a value is a power of two */
	NumericTools.checkPowerOfTwo = function(testValue)
	{
		return (testValue > 0) && ((testValue & (testValue - 1)) === 0);
	};

	// 2D Point Structure
	BaseModule.Coord2D = function(coordX, coordY)
	{
		this.coordX = coordX;
		this.coordY = coordY;
	};
	const Coord2D = BaseModule.Coord2D;

	Coord2D.origin = new Coord2D(0, 0); /* Static zero point */

	/* Add another coordinate to this one */
	Coord2D.prototype.sum = function(anotherCoord)
	{
		return new Coord2D(this.coordX + anotherCoord.coordX, this.coordY + anotherCoord.coordY);
	};

	/* Subtract another coordinate from this one */
	Coord2D.prototype.difference = function(anotherCoord)
	{
		return new Coord2D(this.coordX - anotherCoord.coordX, this.coordY - anotherCoord.coordY);
	};

	/* Multiply this coordinate by another (component-wise) */
	Coord2D.prototype.scaleBy = function(anotherCoord)
	{
		return new Coord2D(this.coordX * anotherCoord.coordX, this.coordY * anotherCoord.coordY);
	};

	/* Divide this coordinate by another (component-wise) */
	Coord2D.prototype.divideBy = function(anotherCoord)
	{
		return new Coord2D(this.coordX / anotherCoord.coordX, this.coordY / anotherCoord.coordY);
	};

	/* Check if this coordinate is equal to another object */
	Coord2D.prototype.isEqualTo = function(otherObject)
	{
		return (otherObject instanceof Coord2D) && (this.coordX === otherObject.coordX) && (this.coordY === otherObject.coordY);
	};

	/* Get string representation of the coordinate */
	Coord2D.prototype.toText = function()
	{
		return "{x:" + this.coordX.toString() + " y:" + this.coordY.toString() + "}";
	};

	// Rectangle Structure
	BaseModule.AreaShape = function(posX, posY, extentX, extentY)
	{
		this.posX = posX;
		this.posY = posY;
		this.extentX = extentX;
		this.extentY = extentY;
	};
	const AreaShape = BaseModule.AreaShape;

	AreaShape.voidShape = new AreaShape(0, 0, 0, 0); /* Static empty rectangle */

	/* Check if this rectangle is equal to another object */
	AreaShape.prototype.isEqual = function(targetObj)
	{
		return (targetObj instanceof AreaShape) && (this.posX === targetObj.posX) && (this.posY === targetObj.posY) && (this.extentX === targetObj.extentX) && (this.extentY === targetObj.extentY);
	};

	/* Check if this rectangle includes a point or another rectangle */
	AreaShape.prototype.includes = function()
	{
		if (arguments.length === 1)
		{
			const checkVal = arguments[0];
			if (checkVal instanceof Coord2D)
			{
				return (this.posX <= checkVal.coordX) && (checkVal.coordX < this.posX + this.extentX) && (this.posY <= checkVal.coordY) && (checkVal.coordY < this.posY + this.extentY);
			}
			else if (checkVal instanceof AreaShape)
			{
				return (this.posX <= checkVal.posX) && (checkVal.posX + checkVal.extentX <= this.posX + this.extentX) && (this.posY <= checkVal.posY) && (checkVal.posY + checkVal.extentY <= this.posY + this.extentY);
			}
			return false;
		}
		const checkX = arguments[0];
		const checkY = arguments[1];
		return (this.posX <= checkX) && (checkX < this.posX + this.extentX) && (this.posY <= checkY) && (checkY < this.posY + this.extentY);
	};

	/* Reposition the rectangle's top-left corner */
	AreaShape.prototype.reposition = function()
	{
		if (arguments.length === 1)
		{
			const moveAmount = arguments[0];
			this.posX = moveAmount.coordX;
			this.posY = moveAmount.coordY;
		}
		else
		{
			const moveX = arguments[0];
			const moveY = arguments[1];
			this.posX = moveX;
			this.posY = moveY;
		}
	};

	/* Get the center point of the rectangle */
	AreaShape.prototype.getMidpoint = function()
	{
		return new Coord2D(this.posX + (this.extentX / 2), this.posY + (this.extentY / 2));
	};

	/* Expand the rectangle's dimensions */
	AreaShape.prototype.expandBy = function(horzExpand, vertExpand)
	{
		this.posX -= horzExpand;
		this.posY -= vertExpand;
		this.extentX += horzExpand * 2;
		this.extentY += vertExpand * 2;
	};

	/* Check if the rectangle is empty */
	AreaShape.prototype.isVoid = function()
	{
		return (this.extentX === 0) && (this.extentY === 0) && (this.posX === 0) && (this.posY === 0);
	};

	/* Get string description of the rectangle */
	AreaShape.prototype.describe = function()
	{
		return "{x:" + this.posX + " y:" + this.posY + " width:" + this.extentX + " height:" + this.extentY + "}";
	};

	/* Check for intersection with another rectangle */
	AreaShape.prototype.overlapsWith = function(otherShape)
	{
		return otherShape.getLeftEdge() < this.getRightEdge() && this.getLeftEdge() < otherShape.getRightEdge() && otherShape.getTopEdge() < this.getBottomEdge() && this.getTopEdge() < otherShape.getBottomEdge();
	};

	/* Create a new rectangle that is the union of two others */
	AreaShape.combineShapes = function(shapeA, shapeB)
	{
		const unionX = Math.min(shapeA.posX, shapeB.posX);
		const unionY = Math.min(shapeA.posY, shapeB.posY);
		return new AreaShape(unionX, unionY, Math.max(shapeA.getRightEdge(), shapeB.getRightEdge()) - unionX, Math.max(shapeA.getBottomEdge(), shapeB.getBottomEdge()) - unionY);
	};

	/* Get the X-coordinate of the left edge */
	AreaShape.prototype.getLeftEdge = function()
	{
		return this.posX;
	};

	/* Get the X-coordinate of the right edge */
	AreaShape.prototype.getRightEdge = function()
	{
		return this.posX + this.extentX;
	};

	/* Get the Y-coordinate of the top edge */
	AreaShape.prototype.getTopEdge = function()
	{
		return this.posY;
	};

	/* Get the Y-coordinate of the bottom edge */
	AreaShape.prototype.getBottomEdge = function()
	{
		return this.posY + this.extentY;
	};

	// 2D Vector Structure
	BaseModule.Vec2D = function(componentX, componentY)
	{
		if (componentY === undefined)
		{
			componentY = componentX;
		}

		this.componentX = componentX;
		this.componentY = componentY;
	};
	const Vec2D = BaseModule.Vec2D;

	Vec2D.zeroVector = new Vec2D(0); /* Vector with zero components */
	Vec2D.oneVector = new Vec2D(1); /* Vector with one for all components */
	Vec2D.xAxisVector = new Vec2D(1, 0); /* Unit vector along X-axis */
	Vec2D.yAxisVector = new Vec2D(0, 1); /* Unit vector along Y-axis */

	/* Return a new vector with components negated */
	Vec2D.prototype.getNegative = function()
	{
		return new Vec2D(-this.componentX, -this.componentY);
	};

	/* Check if this vector is identical to another object */
	Vec2D.prototype.isSameAs = function(otherVec)
	{
	    return (otherVec instanceof Vec2D) && (otherVec.componentX === this.componentX) && (otherVec.componentY === this.componentY);
	};

	/* Add another vector to this one */
	Vec2D.prototype.addVector = function(vecToAdd)
	{
		return new Vec2D(this.componentX + vecToAdd.componentX, this.componentY + vecToAdd.componentY);
	};

	/* Multiply this vector by a scalar or another vector */
	Vec2D.prototype.scaleVector = function(scalarOrVec)
	{
		if (typeof scalarOrVec === "number")
		{
			return new Vec2D(this.componentX * scalarOrVec, this.componentY * scalarOrVec);
		}
		return new Vec2D(this.componentX * scalarOrVec.componentX, this.componentY * scalarOrVec.componentY);
	};

	/* Divide this vector by a scalar or another vector */
	Vec2D.prototype.divideVector = function(divisorOrVec)
	{
		if (typeof divisorOrVec === "number")
		{
			return new Vec2D(this.componentX / divisorOrVec, this.componentY / divisorOrVec);
		}
		return new Vec2D(this.componentX / divisorOrVec.componentX, this.componentY / divisorOrVec.componentY);
	};

	/* Calculate the Euclidean distance between two vectors */
	Vec2D.calcDistance = function(vecA, vecB)
	{
		const diffX = vecA.componentX - vecB.componentX, diffY = vecA.componentY - vecB.componentY;
		return Math.sqrt((diffX * diffX) + (diffY * diffY));
	};

	/* Calculate the squared Euclidean distance between two vectors */
	Vec2D.calcDistanceSq = function(vecOne, vecTwo)
	{
		const deltaX = vecOne.componentX - vecTwo.componentX, deltaY = vecOne.componentY - vecTwo.componentY;
		return (deltaX * deltaX) + (deltaY * deltaY);
	};

	/* Reflect an incident vector across a normal vector */
	Vec2D.reflectVector = function(incidentVec, normalVec)
	{
		const reflectedVec = new Vec2D(0, 0);
		const dotProductFactor = 2.0 * ((incidentVec.componentX * normalVec.componentX) + (incidentVec.componentY * normalVec.componentY));
		reflectedVec.componentX = incidentVec.componentX - (normalVec.componentX * dotProductFactor);
		reflectedVec.componentY = incidentVec.componentY - (normalVec.componentY * dotProductFactor);
		return reflectedVec;
	};

	/* Get the magnitude (length) of the vector */
	Vec2D.prototype.getLength = function()
	{
		return Math.sqrt((this.componentX * this.componentX) + (this.componentY * this.componentY));
	};

	/* Get the squared magnitude of the vector */
	Vec2D.prototype.getLengthSq = function()
	{
		return (this.componentX * this.componentX) + (this.componentY * this.componentY);
	};

	/* Return a new vector with the maximum components of two vectors */
	Vec2D.getMaxComponents = function(vFirst, vSecond)
	{
		return new Vec2D(vFirst.componentX > vSecond.componentX ? vFirst.componentX : vSecond.componentX, vFirst.componentY > vSecond.componentY ? vFirst.componentY : vSecond.componentY);
	};

	/* Return a new vector with the minimum components of two vectors */
	Vec2D.getMinComponents = function(vInitial, vFinal)
	{
		return new Vec2D(vInitial.componentX < vFinal.componentX ? vInitial.componentX : vFinal.componentX, vInitial.componentY < vFinal.componentY ? vInitial.componentY : vFinal.componentY);
	};

	/* Normalize this vector to have a length of 1 */
	Vec2D.prototype.makeUnit = function()
	{
		const inverseLength = 1.0 / Math.sqrt((this.componentX * this.componentX) + (this.componentY * this.componentY));
		this.componentX *= inverseLength;
		this.componentY *= inverseLength;
	};

	/* Perform barycentric interpolation on vectors */
	Vec2D.weightedVectorInterpolation = function(vtxA, vtxB, vtxC, wgtA, wgtB)
	{
		return new Vec2D(NumericTools.weightedInterpolation(vtxA.componentX, vtxB.componentX, vtxC.componentX, wgtA, wgtB), NumericTools.weightedInterpolation(vtxA.componentY, vtxB.componentY, vtxC.componentY, wgtA, wgtB));
	};

	/* Perform Catmull-Rom spline interpolation on vectors */
	Vec2D.splineVectorInterpolation = function(pnt1, pnt2, pnt3, pnt4, interpFactor)
	{
		return new Vec2D(NumericTools.splineInterpolation(pnt1.componentX, pnt2.componentX, pnt3.componentX, pnt4.componentX, interpFactor), NumericTools.splineInterpolation(pnt1.componentY, pnt2.componentY, pnt3.componentY, pnt4.componentY, interpFactor));
	};

	/* Constrain vector components within min/max bounds */
	Vec2D.constrainVector = function(inputVec, minBounds, maxBounds)
	{
		return new Vec2D(NumericTools.constrainValue(inputVec.componentX, minBounds.componentX, maxBounds.componentX), NumericTools.constrainValue(inputVec.componentY, minBounds.componentY, maxBounds.componentY));
	};

	/* Linear interpolation between two vectors */
	Vec2D.linearVectorInterpolation = function(startVec, endVec, blendFactor)
	{
		return new Vec2D(NumericTools.linearInterpolation(startVec.componentX, endVec.componentX, blendFactor), NumericTools.linearInterpolation(startVec.componentY, endVec.componentY, blendFactor));
	};

	/* Smooth step interpolation between two vectors */
	Vec2D.smoothVectorTransition = function(beginVec, finalVec, progression)
	{
		return new Vec2D(NumericTools.smoothTransition(beginVec.componentX, finalVec.componentX, progression), NumericTools.smoothTransition(beginVec.componentY, finalVec.componentY, progression));
	};

	/* Apply a transformation matrix to a vector or array of vectors */
	Vec2D.applyTransformation = function()
	{
		switch (arguments.length)
		{
			case 2:
			    return new Vec2D((arguments[0].componentX * arguments[1]._11) + (arguments[0].componentY * arguments[1]._21) + arguments[1]._41, (arguments[0].componentX * arguments[1]._12) + (arguments[0].componentY * arguments[1]._22) + arguments[1]._42);
			case 3:
				return Vec2D_applyTransformationMulti(arguments[0], 0, arguments[1], arguments[2], 0, arguments[0].length);
			case 6:
				return Vec2D_applyTransformationMulti(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
		}
	};

	/* Internal helper for transforming multiple vectors */
	function Vec2D_applyTransformationMulti (srcArr, srcIdx, transMat, destArr, destIdx, count)
	{
		for (let idx = 0; idx < count; idx++) {
			const currentPos = srcArr[srcIdx + idx];
			const targetPos = destArr[destIdx + idx];
			targetPos.componentX = (currentPos.componentX * transMat._11) + (currentPos.componentY * transMat._21) + transMat._41;
			targetPos.componentY = (currentPos.componentX * transMat._12) + (currentPos.componentY * transMat._22) + transMat._42;
			destArr[destIdx + idx] = targetPos;
		}
	}

	/* Apply a transformation matrix to a normal vector */
	Vec2D.applyNormalTransformation = function(inputNormal, transformMatrix)
	{
		return new Vec2D((inputNormal.componentX * transformMatrix._11) + (inputNormal.componentY * transformMatrix._21), (inputNormal.componentX * transformMatrix._12) + (inputNormal.componentY * transformMatrix._22));
	};

	// 4x4 Matrix Structure
	BaseModule.Mat4x4 = function (_11, _12, _13, _14, _21, _22, _23, _24, _31, _32, _33, _34, _41, _42, _43, _44)
	{
		this._11 = _11;
		this._12 = _12;
		this._13 = _13;
		this._14 = _14;

		this._21 = _21;
		this._22 = _22;
		this._23 = _23;
		this._24 = _24;

		this._31 = _31;
		this._32 = _32;
		this._33 = _33;
		this._34 = _34;

		this._41 = _41;
		this._42 = _42;
		this._43 = _43;
		this._44 = _44;
	};
	const Mat4x4 = BaseModule.Mat4x4;

	Mat4x4.unitMatrix = new Mat4x4(1, 0, 0, 0,
									 0, 1, 0, 0,
									 0, 0, 1, 0,
									 0, 0, 0, 1); /* Identity matrix */

	/* Add two matrices together */
	Mat4x4.addMatrices = function(matA, matB)
	{
		const resultMatrix = new Mat4x4(
		matA._11 + matB._11,
		matA._12 + matB._12
);
};
}());