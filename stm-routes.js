// ==UserScript==
// @name           IITC plugin: STM bus routes highlight
// @category       Layer
// @version        1.1.0
// @description    Highlight full STM route on click, using remote GeoJSON
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper() {
  'use strict';

  if (typeof window.plugin !== 'function') window.plugin = function () {};
  window.plugin.stmRoutes = {};
  var self = window.plugin.stmRoutes;

  self.layerGroup = null;
  self.routesById = {};      // route_id → segments
  self.activeRouteId = null; // currently highlighted route

  // GeoJSON hosted on GitHub pages
  self.geoJsonUrl = 'https://johnincog.github.io/iitc-plugins/stm_routes.geojson';

  // Extract route ID and name
  self.getRouteId = p => p.route_id || p.route_short_name || p.NO_LIG || '';
  self.getRouteName = p => p.route_long_name || p.route_name || p.NOM_LIG || '';

  // Reset previously highlighted route
  self.clearHighlight = function () {
    if (self.activeRouteId && self.routesById[self.activeRouteId]) {
      self.routesById[self.activeRouteId].forEach(layer => {
        try {
          layer.setStyle({
            color: '#0072bc',
            weight: 2,
            opacity: 0.8
          });
        } catch (err) {
          console.error('reset highlight error', err);
        }
      });
    }
    self.activeRouteId = null;
  };

  // Highlight every segment belonging to the route
  self.highlightRoute = function (routeId) {
    if (!routeId || !self.routesById[routeId]) return;

    self.clearHighlight();
    self.activeRouteId = routeId;

    self.routesById[routeId].forEach(layer => {
      try {
        layer.setStyle({
          color: '#ffcc00',
          weight: 4,
          opacity: 1
        });
      } catch (err) {
        console.error('highlight route error', err);
      }
    });
  };

  // Render the STM lines
  self.render = function (geojson) {
    // Remove old layer group if it exists
    if (self.layerGroup) {
      try {
        window.map.removeLayer(self.layerGroup);
      } catch (e) {}
    }

    self.layerGroup = L.layerGroup();
    self.routesById = {};
    self.activeRouteId = null;

    var routesLayer = L.geoJson(geojson, {
      style: () => ({
        color: '#0072bc',
        weight: 2,
        opacity: 0.8
      }),

      onEachFeature: function (feature, layer) {
        var p = feature.properties || {};
        var routeId = self.getRouteId(p);
        var routeName = self.getRouteName(p);

        if (routeId) {
          if (!self.routesById[routeId]) self.routesById[routeId] = [];
          self.routesById[routeId].push(layer);
        }

        var title = (routeId || '') + (routeName ? ' ' + routeName : '');

        layer.bindPopup(
          '<b>' + (title || 'STM route') + '</b><br>' +
          '<small>STM Open Data</small>'
        );

        layer.on('click', function () {
          self.highlightRoute(routeId);
          layer.openPopup();
        });
      }
    });

    self.layerGroup.addLayer(routesLayer);

    try {
      window.addLayerGroup('STM Routes (Local)', self.layerGroup, true);
    } catch (e) {
      console.error('STM addLayerGroup error', e);
      window.map.addLayer(self.layerGroup);
    }
  };

  // Load the remote GeoJSON
  self.load = function () {
    fetch(self.geoJsonUrl)
      .then(r => r.json())
      .then(data => self.render(data))
      .catch(err => console.error('STM load error', err));
  };

  function setup() {
    self.load();
  }

  window.bootPlugins = window.bootPlugins || [];
  window.bootPlugins.push(setup);

  if (window.iitcLoaded) setup();
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper.toString() + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);
