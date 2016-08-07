goog.provide('ol.geom.flat.splice');


/**
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} stride Stride.
 * @param {number} start Start index
 * @param {number} deleteCount Number of coordinates to remove
 * @param {Array.<ol.Coordinate>=} opt_newCoordinates New coordinates.
 * @return {Array.<ol.Coordinate>} Any deleted coordinates. Will have the same length as `deleteCount`
 */
ol.geom.flat.splice.coordinates = function(flatCoordinates, stride, start, deleteCount, opt_newCoordinates) {
  var newCoordinates = [];
  if (opt_newCoordinates) {
    ol.geom.flat.deflate.coordinates(newCoordinates, 0, opt_newCoordinates, stride);
  }
  var spliceArgs = [start * stride, deleteCount * stride].concat(newCoordinates);
  var flatRemoved = Array.prototype.splice.apply(flatCoordinates, spliceArgs);
  var removed = ol.geom.flat.inflate.coordinates(flatRemoved, 0, flatRemoved.length, stride);
  return removed;
};

/**
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} stride Stride.
 * @param {Array.<number>} ends Ends.
 * @param {Array.<number>} start Start index (must be length == 2)
 * @param {number} deleteCount Number of coordinates to remove
 * @param {Array.<ol.Coordinate>=} opt_newCoordinates New coordinates.
 * @return {Array.<ol.Coordinate>} Any deleted coordinates. Will have the same length as `deleteCount`
 */
ol.geom.flat.splice.coordinatess = function(flatCoordinates, stride, ends, start, deleteCount, opt_newCoordinates) {
  goog.DEBUG && console.assert(start.length == 2, 'start should be of length 2');
  var lineString = start[0];
  var startIndex = start[1];
  var startInFlatCoordinates = lineString > 0 ? ends[lineString - 1] / stride : 0;
  deleteCount = Math.min((ends[lineString] - startInFlatCoordinates - startIndex * stride) / stride, deleteCount);
  var removed = ol.geom.flat.splice.coordinates(flatCoordinates, stride, startInFlatCoordinates + startIndex, deleteCount, opt_newCoordinates)
  var coordDiff = (opt_newCoordinates ? opt_newCoordinates.length : 0) - deleteCount;
  var endsDiff = coordDiff * stride;
  for (var i = lineString; i < ends.length; i++) {
    ends[i] += endsDiff;
  }
  return removed;
};
