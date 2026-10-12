'use strict';
(function(inputSource) {
  function constructStructure(buildingCount, floorCount, roomCount) {
    const roomRowTemplate = Array.from({ length: roomCount }, () => 0);
    const floorLayoutTemplate = Array.from({ length: floorCount }, () => [...roomRowTemplate]);

    const entireComplex = Array.from({ length: buildingCount }, () =>
      floorLayoutTemplate.map(f => [...f])
    );

    const separatorLine = Array(roomCount * 2).fill('#').join('');

    return [separatorLine, ...entireComplex];
  }

  function processOccupancyData(initialLayout, updateInstructions) {
    const headerContent = initialLayout.shift();

    let currentOccupancy = initialLayout.map(buildingUnit =>
      buildingUnit.map(floorUnit =>
        floorUnit.map(roomValue => roomValue)
      )
    );

    currentOccupancy = updateInstructions.reduce((accLayout, instructionTuple) => {
      const [buildingId, floorId, roomId, newOccupant] = instructionTuple;
      const targetBuildingIndex = buildingId - 1;
      const targetFloorIndex = floorId - 1;
      const targetRoomIndex = roomId - 1;

      return accLayout.map((buildingBlock, bIdx) => {
        if (bIdx === targetBuildingIndex) {
          return buildingBlock.map((floorBlock, fIdx) => {
            if (fIdx === targetFloorIndex) {
              return floorBlock.map((roomSlot, rIdx) => {
                return rIdx === targetRoomIndex ? newOccupant : roomSlot;
              });
            }
            return floorBlock;
          });
        }
        return buildingBlock;
      });
    }, currentOccupancy);

    const formattedOutputSegments = currentOccupancy.reduce((segments, buildingBlock, bIndex) => {
      const buildingString = buildingBlock.map(floorBlock => {
        return ' ' + floorBlock.join(' ');
      }).join('\n');

      if (bIndex > 0) {
        segments.push(headerContent);
      }
      segments.push(buildingString);
      return segments;
    }, []);

    return formattedOutputSegments.join('\n');
  }

  const rawInputLines = inputSource.toString().trim().split('\n');
  const parsedNumericData = rawInputLines.map(line => line.split(' ').map(Number));
  parsedNumericData.shift();

  const initialConfiguration = constructStructure(4, 3, 10);
  const finalDisplayContent = processOccupancyData(initialConfiguration, parsedNumericData);

  console.log(finalDisplayContent);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
