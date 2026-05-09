var sysIO = require('fs'),
    dbClient = require('pg'),
    sqlGen = require('./queryCreator'),
    dataProc = require('./resultParser'),
    geoCalc = require('./bboxCreator'),
    assist = require('../utils/utils'),
    dbAccessCred = 'tcp://gisuser:gisuser@energia.deusto.es:5432/gis';
    
// This section manages the database link.
    
exports.establishLink = function establishLink(completionHandler) {
   
	// It might be beneficial to utilize a connection pool for better resource management.
	// Reference: https://github.com/brianc/node-postgres#client-pooling

	var dbConnection = new dbClient.Client(dbAccessCred);
	dbConnection.connect( function(issue) {
		if (issue) {
			completionHandler(issue);
		}
		else {
			completionHandler(null, dbConnection); 
		} 
	});
};


// This function closes the active database connection.
    
exports.severLink = function severLink(dbConnection, completionHandler) {
    dbConnection.end();
    completionHandler();
};


// Core function to generate a single map tile based on coordinates.

function createMapSquare(dbConn, zoomLevel, xCoord, yCoord, completion) {
//console.log(('[TILEGEN.JS] Request for ' + zoomLevel + '/' + xCoord + '/' + yCoord + ' map square').yellow);

	geoCalc.getLTRBbox(zoomLevel, xCoord, yCoord, function (leftBound, topBound, rightBound, bottomBound) {

	//console.log(('[TILEGEN.JS] Bounding coordinates for ' + zoomLevel + '/' + xCoord + '/' + yCoord + ' square : [' + leftBound + ',' +  topBound + ',' + rightBound + ',' + bottomBound + ']').yellow);

	if (leftBound || topBound || rightBound || bottomBound) {

		var sqlStatement = sqlGen.getQuery(zoomLevel, leftBound, topBound, rightBound, bottomBound);

		dbConn.query(sqlStatement, function(issue, queryOutcome) {

			var outputFilePath = 'public/tiles/' + zoomLevel + '/' + xCoord + '/' + yCoord + '.json';

			if (!issue) {

				dataProc.parseResult(queryOutcome, function(processedData) {
					if (processedData) {
						assist.fileExists(outputFilePath, processedData, function(isPresent, contentBuffer, targetFile) {
							if (isPresent) {
								sysIO.unlinkSync(targetFile);
							}
							sysIO.writeFile(targetFile, contentBuffer, function(fileIssue) {
								if(fileIssue) {
									console.log(('[TILEGEN.JS] Failure to create ' + targetFile + ' - ' + fileIssue).red);
									completion(fileIssue);
								} else {
									console.log(('[TILEGEN.JS] Successfully created ' + targetFile).green);
									completion();
								}
							});
						});
						
					}
				});
			} else {
				console.log(('[TILEGEN.JS] Failure during creation of ' + outputFilePath + ' - ' + issue).red);
			}
		});
	} else {
		console.log(('[TILEGEN.JS] Error in calculating bounding box for ' +  zoomLevel + '/' + xCoord + '/' + yCoord + ' square ').red);
	}
	});
}
exports.createMapSquare = createMapSquare;


// This function generates multiple tiles within a specific zoom level, defined by a coordinate range.

function produceZoomGridArea(dbConn, level, minXPos, minYPos, maxXPos, maxYPos, onComplete) {
console.log(('[TILEGEN.JS] Request for ' + level + ' zoom level squares').yellow);

assist.dirExists('public/tiles/' + level, level, function(dirFound, tempVal, targetDir) {

	var totalSquares = (maxXPos - minXPos + 1) * (maxYPos - minYPos + 1);

        if (!dirFound) {
        	sysIO.mkdirSync(targetDir);
	}

	for (var colIdx = minXPos ; colIdx <= maxXPos ; colIdx++) {
                assist.dirExists('public/tiles/' + level + '/' + colIdx, colIdx, function(dirFoundInner, tempColVal, innerDir) {
                       	if (!dirFoundInner) {
                               	sysIO.mkdirSync(innerDir);
			}
			for (var rowIdx = minYPos ; rowIdx <= maxYPos ; rowIdx++) {
				createMapSquare(dbConn, level, tempColVal, rowIdx, function(squareIssue) {

					totalSquares--;
					if(totalSquares <= 0) {
						console.log(('[TILEGEN.JS] Successfully generated ' + level + ' zoom level squares').green);
						onComplete();
					}

				});
	                }
        	});
	}
});
}
exports.produceZoomGridArea = produceZoomGridArea;


// This function creates map tiles for a geographic bounding box at a given zoom level.

function produceBoxedZoomSquares(dbConn, level, geoLeft, geoTop, geoRight, geoBottom, onFinished) {

	geoCalc.getXYbox(level, geoLeft, geoTop, geoRight, geoBottom, function (currentLevel, minCol, minRow, maxCol, maxRow) {
	  
		if (minCol || minRow || maxCol || maxRow) {
			produceZoomGridArea(dbConn, currentLevel, minCol, minRow, maxCol, maxRow, function() {
				onFinished();
			});
		} else {
			onFinished(); 
		}
	});
}
exports.produceBoxedZoomSquares = produceBoxedZoomSquares;


// This function iterates through a range of zoom levels to generate all corresponding tiles.

function createLevelRangeSquares(dbConn, startLevel, endLevel, onDone) {
console.log(('[TILEGEN.JS] Request for squares between levels ' + startLevel + ' and ' + endLevel).yellow);

assist.dirExists('public/tiles', null, function(dirExistsRoot, tempRoot, rootDir) {

	var remainingLevels = endLevel - startLevel + 1;
  
	if (!dirExistsRoot) {
		sysIO.mkdirSync(rootDir);
	}
        for (var currentLevel = startLevel ; currentLevel <= endLevel ; currentLevel++) {

		var squaresPerSide = Math.pow(2, currentLevel);
               	produceZoomGridArea(dbConn, currentLevel, 0, 0, squaresPerSide, squaresPerSide,  function(levelIssue) {

			remainingLevels--;
			if (remainingLevels <= 0) {
				onDone();
			}
		});
       	}
});

}
exports.createLevelRangeSquares = createLevelRangeSquares;