goog.provide('ol.test.interaction.Snap');

describe('ol.interaction.Snap', function() {

  describe('constructor', function() {

    it('can be constructed without arguments', function() {
      var instance = new ol.interaction.Snap();
      expect(instance).to.be.an(ol.interaction.Snap);
    });

  });

  describe('handleEvent_', function() {
    var target, map;

    var width = 360;
    var height = 180;

    var simulateEvt;

    beforeEach(function(done) {
      target = document.createElement('div');

      var style = target.style;
      style.position = 'absolute';
      style.left = '-1000px';
      style.top = '-1000px';
      style.width = width + 'px';
      style.height = height + 'px';
      document.body.appendChild(target);

      map = new ol.Map({
        target: target,
        view: new ol.View({
          projection: 'EPSG:4326',
          center: [0, 0],
          resolution: 1
        })
      });

      map.on('postrender', function() {
        done();
      });

      simulateEvt = function(pixel, snapInteraction) {
        var event = {
          pixel: pixel,
          coordinate: map.getCoordinateFromPixel(pixel),
          map: map
        };
        ol.interaction.Snap.handleEvent_.call(snapInteraction, event);
        return event;
      };
    });

    afterEach(function() {
      goog.dispose(map);
      document.body.removeChild(target);
    });

    it('can handle XYZ coordinates', function() {
      var point = new ol.Feature(new ol.geom.Point([0, 0, 123]));
      var snapInteraction = new ol.interaction.Snap({
        features: new ol.Collection([point])
      });
      snapInteraction.setMap(map);

      var event = simulateEvt([width / 2, height / 2], snapInteraction);
      // check that the coordinate is in XY and not XYZ
      expect(event.coordinate).to.eql([0, 0]);
    });

    describe('with LineString and Point', function() {
      var lineString, point, features, midPixel;
      beforeEach(function() {
        midPixel = [width / 2, height / 2];

        lineString = new ol.Feature(new ol.geom.LineString([
          map.getCoordinateFromPixel([(width / 2) - 40, height / 2]),
          map.getCoordinateFromPixel([(width / 2) + 40, height / 2])
        ]));

        point = new ol.Feature(new ol.geom.Point(
            map.getCoordinateFromPixel([width / 2, (height / 2) - 1])));

        features = new ol.Collection([point, lineString]);

      });

      describe('and different tolerances', function() {
        var snapInteraction;
        beforeEach(function() {
          snapInteraction = new ol.interaction.Snap({
            features: features,
            pixelTolerance: 5,
            vertexPixelTolerance: 10
          });
          snapInteraction.setMap(map);
        });

        it('snaps within normal tolerance for segment', function() {
          var pixel = [(width / 2) + 20, (height / 2) + 5];
          var event = simulateEvt(pixel, snapInteraction);

          var snapped = [pixel[0], pixel[1] - 5];
          expect(event.pixel).to.eql(snapped);
          expect(event.coordinate).to.eql(map.getCoordinateFromPixel(snapped));
        });

        it('doesn\'t snap outside normal tolerance for segment', function() {
          var pixel = [(width / 2) + 20, (height / 2) + 7];
          event = simulateEvt(pixel, snapInteraction);

          expect(event.pixel).to.eql(pixel);
          expect(event.coordinate).to.eql(map.getCoordinateFromPixel(pixel));

        });

        it('snaps to vertice within the tolerance', function() {
          var pixel = [(width / 2) + 35, (height / 2) + 7];
          event = simulateEvt(pixel, snapInteraction);

          var endPixel = [(width / 2) + 40, height / 2];
          expect(event.pixel).to.eql(endPixel);
          expect(event.coordinate).to.eql(map.getCoordinateFromPixel(endPixel));

        });

        it('prioritizes vertices', function() {
          var pixel = [(width / 2), (height / 2) + 5];
          var event = simulateEvt(pixel, snapInteraction);

          var snapped = [width / 2, (height / 2) - 1];
          expect(event.pixel).to.eql(snapped);
          expect(event.coordinate).to.eql(map.getCoordinateFromPixel(snapped));
        });

      });

      describe('and zero vertexPixelTolerance', function() {
        var snapInteraction;
        beforeEach(function() {
          snapInteraction = new ol.interaction.Snap({
            features: features,
            vertexPixelTolerance: 0
          });
          snapInteraction.setMap(map);
        });

        it('does not snap to nearby vertex', function() {
          var pixel = [(width / 2) + 38, (height / 2) + 1];
          var event = simulateEvt(pixel, snapInteraction);

          var snapped = [(width / 2) + 38, (height / 2)];
          expect(event.pixel).to.eql(snapped);
          expect(event.coordinate).to.eql(map.getCoordinateFromPixel(snapped));
        });

      });

    });

  });

});

goog.require('ol.Collection');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.geom.Point');
goog.require('ol.geom.LineString');
goog.require('ol.interaction.Snap');
