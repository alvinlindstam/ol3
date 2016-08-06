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
