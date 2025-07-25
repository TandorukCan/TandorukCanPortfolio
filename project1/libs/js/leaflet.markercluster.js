!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t(exports)
    : "function" == typeof define && define.amd
    ? define(["exports"], t)
    : t(
        (((e = e || self).Leaflet = e.Leaflet || {}),
        (e.Leaflet.markercluster = {}))
      );
})(this, function (e) {
  "use strict";
  var t = (L.MarkerClusterGroup = L.FeatureGroup.extend({
    options: {
      maxClusterRadius: 80,
      iconCreateFunction: null,
      clusterPane: L.Marker.prototype.options.pane,
      spiderfyOnEveryZoom: !1,
      spiderfyOnMaxZoom: !0,
      showCoverageOnHover: !0,
      zoomToBoundsOnClick: !0,
      singleMarkerMode: !1,
      disableClusteringAtZoom: null,
      removeOutsideVisibleBounds: !0,
      animate: !0,
      animateAddingMarkers: !1,
      spiderfyShapePositions: null,
      spiderfyDistanceMultiplier: 1,
      spiderLegPolylineOptions: { weight: 1.5, color: "#222", opacity: 0.5 },
      chunkedLoading: !1,
      chunkInterval: 200,
      chunkDelay: 50,
      chunkProgress: null,
      polygonOptions: {},
    },
    initialize: function (e) {
      L.Util.setOptions(this, e),
        this.options.iconCreateFunction ||
          (this.options.iconCreateFunction = this._defaultIconCreateFunction),
        (this._featureGroup = L.featureGroup()),
        this._featureGroup.addEventParent(this),
        (this._nonPointGroup = L.featureGroup()),
        this._nonPointGroup.addEventParent(this),
        (this._inZoomAnimation = 0),
        (this._needsClustering = []),
        (this._needsRemoving = []),
        (this._currentShownBounds = null),
        (this._queue = []),
        (this._childMarkerEventHandlers = {
          dragstart: this._childMarkerDragStart,
          move: this._childMarkerMoved,
          dragend: this._childMarkerDragEnd,
        });
      var t = L.DomUtil.TRANSITION && this.options.animate;
      L.extend(this, t ? this._withAnimation : this._noAnimation),
        (this._markerCluster = t
          ? L.MarkerCluster
          : L.MarkerClusterNonAnimated);
    },
    addLayer: function (e) {
      if (e instanceof L.LayerGroup) return this.addLayers([e]);
      if (!e.getLatLng)
        return (
          this._nonPointGroup.addLayer(e),
          this.fire("layeradd", { layer: e }),
          this
        );
      if (!this._map)
        return (
          this._needsClustering.push(e),
          this.fire("layeradd", { layer: e }),
          this
        );
      if (this.hasLayer(e)) return this;
      this._unspiderfy && this._unspiderfy(),
        this._addLayer(e, this._maxZoom),
        this.fire("layeradd", { layer: e }),
        this._topClusterLevel._recalculateBounds(),
        this._refreshClustersIcons();
      var t = e,
        i = this._zoom;
      if (e.__parent) for (; t.__parent._zoom >= i; ) t = t.__parent;
      return (
        this._currentShownBounds.contains(t.getLatLng()) &&
          (this.options.animateAddingMarkers
            ? this._animationAddLayer(e, t)
            : this._animationAddLayerNonAnimated(e, t)),
        this
      );
    },
    removeLayer: function (e) {
      return e instanceof L.LayerGroup
        ? this.removeLayers([e])
        : (e.getLatLng
            ? this._map
              ? e.__parent &&
                (this._unspiderfy &&
                  (this._unspiderfy(), this._unspiderfyLayer(e)),
                this._removeLayer(e, !0),
                this.fire("layerremove", { layer: e }),
                this._topClusterLevel._recalculateBounds(),
                this._refreshClustersIcons(),
                e.off(this._childMarkerEventHandlers, this),
                this._featureGroup.hasLayer(e) &&
                  (this._featureGroup.removeLayer(e),
                  e.clusterShow && e.clusterShow()))
              : (!this._arraySplice(this._needsClustering, e) &&
                  this.hasLayer(e) &&
                  this._needsRemoving.push({ layer: e, latlng: e._latlng }),
                this.fire("layerremove", { layer: e }))
            : (this._nonPointGroup.removeLayer(e),
              this.fire("layerremove", { layer: e })),
          this);
    },
    addLayers: function (n, s) {
      if (!L.Util.isArray(n)) return this.addLayer(n);
      var o,
        a = this._featureGroup,
        h = this._nonPointGroup,
        l = this.options.chunkedLoading,
        u = this.options.chunkInterval,
        _ = this.options.chunkProgress,
        d = n.length,
        p = 0,
        c = !0;
      if (this._map) {
        var f = new Date().getTime(),
          m = L.bind(function () {
            var e = new Date().getTime();
            for (
              this._map && this._unspiderfy && this._unspiderfy();
              p < d;
              p++
            ) {
              if (l && p % 200 == 0) {
                var t = new Date().getTime() - e;
                if (u < t) break;
              }
              if ((o = n[p]) instanceof L.LayerGroup)
                c && ((n = n.slice()), (c = !1)),
                  this._extractNonGroupLayers(o, n),
                  (d = n.length);
              else if (o.getLatLng) {
                if (
                  !this.hasLayer(o) &&
                  (this._addLayer(o, this._maxZoom),
                  s || this.fire("layeradd", { layer: o }),
                  o.__parent && 2 === o.__parent.getChildCount())
                ) {
                  var i = o.__parent.getAllChildMarkers(),
                    r = i[0] === o ? i[1] : i[0];
                  a.removeLayer(r);
                }
              } else h.addLayer(o), s || this.fire("layeradd", { layer: o });
            }
            _ && _(p, d, new Date().getTime() - f),
              p === d
                ? (this._topClusterLevel._recalculateBounds(),
                  this._refreshClustersIcons(),
                  this._topClusterLevel._recursivelyAddChildrenToMap(
                    null,
                    this._zoom,
                    this._currentShownBounds
                  ))
                : setTimeout(m, this.options.chunkDelay);
          }, this);
        m();
      } else
        for (var e = this._needsClustering; p < d; p++)
          (o = n[p]) instanceof L.LayerGroup
            ? (c && ((n = n.slice()), (c = !1)),
              this._extractNonGroupLayers(o, n),
              (d = n.length))
            : o.getLatLng
            ? this.hasLayer(o) || e.push(o)
            : h.addLayer(o);
      return this;
    },
    removeLayers: function (e) {
      var t,
        i,
        r = e.length,
        n = this._featureGroup,
        s = this._nonPointGroup,
        o = !0;
      if (!this._map) {
        for (t = 0; t < r; t++)
          (i = e[t]) instanceof L.LayerGroup
            ? (o && ((e = e.slice()), (o = !1)),
              this._extractNonGroupLayers(i, e),
              (r = e.length))
            : (this._arraySplice(this._needsClustering, i),
              s.removeLayer(i),
              this.hasLayer(i) &&
                this._needsRemoving.push({ layer: i, latlng: i._latlng }),
              this.fire("layerremove", { layer: i }));
        return this;
      }
      if (this._unspiderfy) {
        this._unspiderfy();
        var a = e.slice(),
          h = r;
        for (t = 0; t < h; t++)
          (i = a[t]) instanceof L.LayerGroup
            ? (this._extractNonGroupLayers(i, a), (h = a.length))
            : this._unspiderfyLayer(i);
      }
      for (t = 0; t < r; t++)
        (i = e[t]) instanceof L.LayerGroup
          ? (o && ((e = e.slice()), (o = !1)),
            this._extractNonGroupLayers(i, e),
            (r = e.length))
          : i.__parent
          ? (this._removeLayer(i, !0, !0),
            this.fire("layerremove", { layer: i }),
            n.hasLayer(i) &&
              (n.removeLayer(i), i.clusterShow && i.clusterShow()))
          : (s.removeLayer(i), this.fire("layerremove", { layer: i }));
      return (
        this._topClusterLevel._recalculateBounds(),
        this._refreshClustersIcons(),
        this._topClusterLevel._recursivelyAddChildrenToMap(
          null,
          this._zoom,
          this._currentShownBounds
        ),
        this
      );
    },
    clearLayers: function () {
      return (
        this._map ||
          ((this._needsClustering = []),
          (this._needsRemoving = []),
          delete this._gridClusters,
          delete this._gridUnclustered),
        this._noanimationUnspiderfy && this._noanimationUnspiderfy(),
        this._featureGroup.clearLayers(),
        this._nonPointGroup.clearLayers(),
        this.eachLayer(function (e) {
          e.off(this._childMarkerEventHandlers, this), delete e.__parent;
        }, this),
        this._map && this._generateInitialClusters(),
        this
      );
    },
    getBounds: function () {
      var e = new L.LatLngBounds();
      this._topClusterLevel && e.extend(this._topClusterLevel._bounds);
      for (var t = this._needsClustering.length - 1; 0 <= t; t--)
        e.extend(this._needsClustering[t].getLatLng());
      return e.extend(this._nonPointGroup.getBounds()), e;
    },
    eachLayer: function (e, t) {
      var i,
        r,
        n,
        s = this._needsClustering.slice(),
        o = this._needsRemoving;
      for (
        this._topClusterLevel && this._topClusterLevel.getAllChildMarkers(s),
          r = s.length - 1;
        0 <= r;
        r--
      ) {
        for (i = !0, n = o.length - 1; 0 <= n; n--)
          if (o[n].layer === s[r]) {
            i = !1;
            break;
          }
        i && e.call(t, s[r]);
      }
      this._nonPointGroup.eachLayer(e, t);
    },
    getLayers: function () {
      var t = [];
      return (
        this.eachLayer(function (e) {
          t.push(e);
        }),
        t
      );
    },
    getLayer: function (t) {
      var i = null;
      return (
        (t = parseInt(t, 10)),
        this.eachLayer(function (e) {
          L.stamp(e) === t && (i = e);
        }),
        i
      );
    },
    hasLayer: function (e) {
      if (!e) return !1;
      var t,
        i = this._needsClustering;
      for (t = i.length - 1; 0 <= t; t--) if (i[t] === e) return !0;
      for (t = (i = this._needsRemoving).length - 1; 0 <= t; t--)
        if (i[t].layer === e) return !1;
      return (
        !(!e.__parent || e.__parent._group !== this) ||
        this._nonPointGroup.hasLayer(e)
      );
    },
    zoomToShowLayer: function (e, t) {
      var i = this._map;
      "function" != typeof t && (t = function () {});
      var r = function () {
        (!i.hasLayer(e) && !i.hasLayer(e.__parent)) ||
          this._inZoomAnimation ||
          (this._map.off("moveend", r, this),
          this.off("animationend", r, this),
          i.hasLayer(e)
            ? t()
            : e.__parent._icon &&
              (this.once("spiderfied", t, this), e.__parent.spiderfy()));
      };
      e._icon && this._map.getBounds().contains(e.getLatLng())
        ? t()
        : e.__parent._zoom < Math.round(this._map._zoom)
        ? (this._map.on("moveend", r, this), this._map.panTo(e.getLatLng()))
        : (this._map.on("moveend", r, this),
          this.on("animationend", r, this),
          e.__parent.zoomToBounds());
    },
    onAdd: function (e) {
      var t, i, r;
      if (((this._map = e), !isFinite(this._map.getMaxZoom())))
        throw "Map has no maxZoom specified";
      for (
        this._featureGroup.addTo(e),
          this._nonPointGroup.addTo(e),
          this._gridClusters || this._generateInitialClusters(),
          this._maxLat = e.options.crs.projection.MAX_LATITUDE,
          t = 0,
          i = this._needsRemoving.length;
        t < i;
        t++
      )
        ((r = this._needsRemoving[t]).newlatlng = r.layer._latlng),
          (r.layer._latlng = r.latlng);
      for (t = 0, i = this._needsRemoving.length; t < i; t++)
        (r = this._needsRemoving[t]),
          this._removeLayer(r.layer, !0),
          (r.layer._latlng = r.newlatlng);
      (this._needsRemoving = []),
        (this._zoom = Math.round(this._map._zoom)),
        (this._currentShownBounds = this._getExpandedVisibleBounds()),
        this._map.on("zoomend", this._zoomEnd, this),
        this._map.on("moveend", this._moveEnd, this),
        this._spiderfierOnAdd && this._spiderfierOnAdd(),
        this._bindEvents(),
        (i = this._needsClustering),
        (this._needsClustering = []),
        this.addLayers(i, !0);
    },
    onRemove: function (e) {
      e.off("zoomend", this._zoomEnd, this),
        e.off("moveend", this._moveEnd, this),
        this._unbindEvents(),
        (this._map._mapPane.className = this._map._mapPane.className.replace(
          " leaflet-cluster-anim",
          ""
        )),
        this._spiderfierOnRemove && this._spiderfierOnRemove(),
        delete this._maxLat,
        this._hideCoverage(),
        this._featureGroup.remove(),
        this._nonPointGroup.remove(),
        this._featureGroup.clearLayers(),
        (this._map = null);
    },
    getVisibleParent: function (e) {
      for (var t = e; t && !t._icon; ) t = t.__parent;
      return t || null;
    },
    _arraySplice: function (e, t) {
      for (var i = e.length - 1; 0 <= i; i--)
        if (e[i] === t) return e.splice(i, 1), !0;
    },
    _removeFromGridUnclustered: function (e, t) {
      for (
        var i = this._map,
          r = this._gridUnclustered,
          n = Math.floor(this._map.getMinZoom());
        n <= t && r[t].removeObject(e, i.project(e.getLatLng(), t));
        t--
      );
    },
    _childMarkerDragStart: function (e) {
      e.target.__dragStart = e.target._latlng;
    },
    _childMarkerMoved: function (e) {
      if (!this._ignoreMove && !e.target.__dragStart) {
        var t = e.target._popup && e.target._popup.isOpen();
        this._moveChild(e.target, e.oldLatLng, e.latlng),
          t && e.target.openPopup();
      }
    },
    _moveChild: function (e, t, i) {
      (e._latlng = t), this.removeLayer(e), (e._latlng = i), this.addLayer(e);
    },
    _childMarkerDragEnd: function (e) {
      var t = e.target.__dragStart;
      delete e.target.__dragStart,
        t && this._moveChild(e.target, t, e.target._latlng);
    },
    _removeLayer: function (e, t, i) {
      var r = this._gridClusters,
        n = this._gridUnclustered,
        s = this._featureGroup,
        o = this._map,
        a = Math.floor(this._map.getMinZoom());
      t && this._removeFromGridUnclustered(e, this._maxZoom);
      var h,
        l = e.__parent,
        u = l._markers;
      for (
        this._arraySplice(u, e);
        l && (l._childCount--, (l._boundsNeedUpdate = !0), !(l._zoom < a));

      )
        t && l._childCount <= 1
          ? ((h = l._markers[0] === e ? l._markers[1] : l._markers[0]),
            r[l._zoom].removeObject(l, o.project(l._cLatLng, l._zoom)),
            n[l._zoom].addObject(h, o.project(h.getLatLng(), l._zoom)),
            this._arraySplice(l.__parent._childClusters, l),
            l.__parent._markers.push(h),
            (h.__parent = l.__parent),
            l._icon && (s.removeLayer(l), i || s.addLayer(h)))
          : (l._iconNeedsUpdate = !0),
          (l = l.__parent);
      delete e.__parent;
    },
    _isOrIsParent: function (e, t) {
      for (; t; ) {
        if (e === t) return !0;
        t = t.parentNode;
      }
      return !1;
    },
    fire: function (e, t, i) {
      if (t && t.layer instanceof L.MarkerCluster) {
        if (
          t.originalEvent &&
          this._isOrIsParent(t.layer._icon, t.originalEvent.relatedTarget)
        )
          return;
        e = "cluster" + e;
      }
      L.FeatureGroup.prototype.fire.call(this, e, t, i);
    },
    listens: function (e, t) {
      return (
        L.FeatureGroup.prototype.listens.call(this, e, t) ||
        L.FeatureGroup.prototype.listens.call(this, "cluster" + e, t)
      );
    },
    _defaultIconCreateFunction: function (e) {
      var t = e.getChildCount(),
        i = " marker-cluster-";
      return (
        (i += t < 10 ? "small" : t < 100 ? "medium" : "large"),
        new L.DivIcon({
          html: "<div><span>" + t + "</span></div>",
          className: "marker-cluster" + i,
          iconSize: new L.Point(40, 40),
        })
      );
    },
    _bindEvents: function () {
      var e = this._map,
        t = this.options.spiderfyOnMaxZoom,
        i = this.options.showCoverageOnHover,
        r = this.options.zoomToBoundsOnClick,
        n = this.options.spiderfyOnEveryZoom;
      (t || r || n) &&
        this.on("clusterclick clusterkeypress", this._zoomOrSpiderfy, this),
        i &&
          (this.on("clustermouseover", this._showCoverage, this),
          this.on("clustermouseout", this._hideCoverage, this),
          e.on("zoomend", this._hideCoverage, this));
    },
    _zoomOrSpiderfy: function (e) {
      var t = e.layer,
        i = t;
      if (
        "clusterkeypress" !== e.type ||
        !e.originalEvent ||
        13 === e.originalEvent.keyCode
      ) {
        for (; 1 === i._childClusters.length; ) i = i._childClusters[0];
        i._zoom === this._maxZoom &&
        i._childCount === t._childCount &&
        this.options.spiderfyOnMaxZoom
          ? t.spiderfy()
          : this.options.zoomToBoundsOnClick && t.zoomToBounds(),
          this.options.spiderfyOnEveryZoom && t.spiderfy(),
          e.originalEvent &&
            13 === e.originalEvent.keyCode &&
            this._map._container.focus();
      }
    },
    _showCoverage: function (e) {
      var t = this._map;
      this._inZoomAnimation ||
        (this._shownPolygon && t.removeLayer(this._shownPolygon),
        2 < e.layer.getChildCount() &&
          e.layer !== this._spiderfied &&
          ((this._shownPolygon = new L.Polygon(
            e.layer.getConvexHull(),
            this.options.polygonOptions
          )),
          t.addLayer(this._shownPolygon)));
    },
    _hideCoverage: function () {
      this._shownPolygon &&
        (this._map.removeLayer(this._shownPolygon),
        (this._shownPolygon = null));
    },
    _unbindEvents: function () {
      var e = this.options.spiderfyOnMaxZoom,
        t = this.options.showCoverageOnHover,
        i = this.options.zoomToBoundsOnClick,
        r = this.options.spiderfyOnEveryZoom,
        n = this._map;
      (e || i || r) &&
        this.off("clusterclick clusterkeypress", this._zoomOrSpiderfy, this),
        t &&
          (this.off("clustermouseover", this._showCoverage, this),
          this.off("clustermouseout", this._hideCoverage, this),
          n.off("zoomend", this._hideCoverage, this));
    },
    _zoomEnd: function () {
      this._map &&
        (this._mergeSplitClusters(),
        (this._zoom = Math.round(this._map._zoom)),
        (this._currentShownBounds = this._getExpandedVisibleBounds()));
    },
    _moveEnd: function () {
      if (!this._inZoomAnimation) {
        var e = this._getExpandedVisibleBounds();
        this._topClusterLevel._recursivelyRemoveChildrenFromMap(
          this._currentShownBounds,
          Math.floor(this._map.getMinZoom()),
          this._zoom,
          e
        ),
          this._topClusterLevel._recursivelyAddChildrenToMap(
            null,
            Math.round(this._map._zoom),
            e
          ),
          (this._currentShownBounds = e);
      }
    },
    _generateInitialClusters: function () {
      var e = Math.ceil(this._map.getMaxZoom()),
        t = Math.floor(this._map.getMinZoom()),
        i = this.options.maxClusterRadius,
        r = i;
      "function" != typeof i &&
        (r = function () {
          return i;
        }),
        null !== this.options.disableClusteringAtZoom &&
          (e = this.options.disableClusteringAtZoom - 1),
        (this._maxZoom = e),
        (this._gridClusters = {}),
        (this._gridUnclustered = {});
      for (var n = e; t <= n; n--)
        (this._gridClusters[n] = new L.DistanceGrid(r(n))),
          (this._gridUnclustered[n] = new L.DistanceGrid(r(n)));
      this._topClusterLevel = new this._markerCluster(this, t - 1);
    },
    _addLayer: function (e, t) {
      var i,
        r,
        n = this._gridClusters,
        s = this._gridUnclustered,
        o = Math.floor(this._map.getMinZoom());
      for (
        this.options.singleMarkerMode && this._overrideMarkerIcon(e),
          e.on(this._childMarkerEventHandlers, this);
        o <= t;
        t--
      ) {
        i = this._map.project(e.getLatLng(), t);
        var a = n[t].getNearObject(i);
        if (a) return a._addChild(e), void (e.__parent = a);
        if ((a = s[t].getNearObject(i))) {
          var h = a.__parent;
          h && this._removeLayer(a, !1);
          var l = new this._markerCluster(this, t, a, e);
          n[t].addObject(l, this._map.project(l._cLatLng, t)), (a.__parent = l);
          var u = (e.__parent = l);
          for (r = t - 1; r > h._zoom; r--)
            (u = new this._markerCluster(this, r, u)),
              n[r].addObject(u, this._map.project(a.getLatLng(), r));
          return h._addChild(u), void this._removeFromGridUnclustered(a, t);
        }
        s[t].addObject(e, i);
      }
      this._topClusterLevel._addChild(e), (e.__parent = this._topClusterLevel);
    },
    _refreshClustersIcons: function () {
      this._featureGroup.eachLayer(function (e) {
        e instanceof L.MarkerCluster && e._iconNeedsUpdate && e._updateIcon();
      });
    },
    _enqueue: function (e) {
      this._queue.push(e),
        this._queueTimeout ||
          (this._queueTimeout = setTimeout(
            L.bind(this._processQueue, this),
            300
          ));
    },
    _processQueue: function () {
      for (var e = 0; e < this._queue.length; e++) this._queue[e].call(this);
      (this._queue.length = 0),
        clearTimeout(this._queueTimeout),
        (this._queueTimeout = null);
    },
    _mergeSplitClusters: function () {
      var e = Math.round(this._map._zoom);
      this._processQueue(),
        this._zoom < e &&
        this._currentShownBounds.intersects(this._getExpandedVisibleBounds())
          ? (this._animationStart(),
            this._topClusterLevel._recursivelyRemoveChildrenFromMap(
              this._currentShownBounds,
              Math.floor(this._map.getMinZoom()),
              this._zoom,
              this._getExpandedVisibleBounds()
            ),
            this._animationZoomIn(this._zoom, e))
          : this._zoom > e
          ? (this._animationStart(), this._animationZoomOut(this._zoom, e))
          : this._moveEnd();
    },
    _getExpandedVisibleBounds: function () {
      return this.options.removeOutsideVisibleBounds
        ? L.Browser.mobile
          ? this._checkBoundsMaxLat(this._map.getBounds())
          : this._checkBoundsMaxLat(this._map.getBounds().pad(1))
        : this._mapBoundsInfinite;
    },
    _checkBoundsMaxLat: function (e) {
      var t = this._maxLat;
      return (
        void 0 !== t &&
          (e.getNorth() >= t && (e._northEast.lat = 1 / 0),
          e.getSouth() <= -t && (e._southWest.lat = -1 / 0)),
        e
      );
    },
    _animationAddLayerNonAnimated: function (e, t) {
      if (t === e) this._featureGroup.addLayer(e);
      else if (2 === t._childCount) {
        t._addToMap();
        var i = t.getAllChildMarkers();
        this._featureGroup.removeLayer(i[0]),
          this._featureGroup.removeLayer(i[1]);
      } else t._updateIcon();
    },
    _extractNonGroupLayers: function (e, t) {
      var i,
        r = e.getLayers(),
        n = 0;
      for (t = t || []; n < r.length; n++)
        (i = r[n]) instanceof L.LayerGroup
          ? this._extractNonGroupLayers(i, t)
          : t.push(i);
      return t;
    },
    _overrideMarkerIcon: function (e) {
      return (e.options.icon = this.options.iconCreateFunction({
        getChildCount: function () {
          return 1;
        },
        getAllChildMarkers: function () {
          return [e];
        },
      }));
    },
  }));
  L.MarkerClusterGroup.include({
    _mapBoundsInfinite: new L.LatLngBounds(
      new L.LatLng(-1 / 0, -1 / 0),
      new L.LatLng(1 / 0, 1 / 0)
    ),
  }),
    L.MarkerClusterGroup.include({
      _noAnimation: {
        _animationStart: function () {},
        _animationZoomIn: function (e, t) {
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(
            this._currentShownBounds,
            Math.floor(this._map.getMinZoom()),
            e
          ),
            this._topClusterLevel._recursivelyAddChildrenToMap(
              null,
              t,
              this._getExpandedVisibleBounds()
            ),
            this.fire("animationend");
        },
        _animationZoomOut: function (e, t) {
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(
            this._currentShownBounds,
            Math.floor(this._map.getMinZoom()),
            e
          ),
            this._topClusterLevel._recursivelyAddChildrenToMap(
              null,
              t,
              this._getExpandedVisibleBounds()
            ),
            this.fire("animationend");
        },
        _animationAddLayer: function (e, t) {
          this._animationAddLayerNonAnimated(e, t);
        },
      },
      _withAnimation: {
        _animationStart: function () {
          (this._map._mapPane.className += " leaflet-cluster-anim"),
            this._inZoomAnimation++;
        },
        _animationZoomIn: function (n, s) {
          var o,
            a = this._getExpandedVisibleBounds(),
            h = this._featureGroup,
            e = Math.floor(this._map.getMinZoom());
          (this._ignoreMove = !0),
            this._topClusterLevel._recursively(a, n, e, function (e) {
              var t,
                i = e._latlng,
                r = e._markers;
              for (
                a.contains(i) || (i = null),
                  e._isSingleParent() && n + 1 === s
                    ? (h.removeLayer(e),
                      e._recursivelyAddChildrenToMap(null, s, a))
                    : (e.clusterHide(),
                      e._recursivelyAddChildrenToMap(i, s, a)),
                  o = r.length - 1;
                0 <= o;
                o--
              )
                (t = r[o]), a.contains(t._latlng) || h.removeLayer(t);
            }),
            this._forceLayout(),
            this._topClusterLevel._recursivelyBecomeVisible(a, s),
            h.eachLayer(function (e) {
              e instanceof L.MarkerCluster || !e._icon || e.clusterShow();
            }),
            this._topClusterLevel._recursively(a, n, s, function (e) {
              e._recursivelyRestoreChildPositions(s);
            }),
            (this._ignoreMove = !1),
            this._enqueue(function () {
              this._topClusterLevel._recursively(a, n, e, function (e) {
                h.removeLayer(e), e.clusterShow();
              }),
                this._animationEnd();
            });
        },
        _animationZoomOut: function (e, t) {
          this._animationZoomOutSingle(this._topClusterLevel, e - 1, t),
            this._topClusterLevel._recursivelyAddChildrenToMap(
              null,
              t,
              this._getExpandedVisibleBounds()
            ),
            this._topClusterLevel._recursivelyRemoveChildrenFromMap(
              this._currentShownBounds,
              Math.floor(this._map.getMinZoom()),
              e,
              this._getExpandedVisibleBounds()
            );
        },
        _animationAddLayer: function (e, t) {
          var i = this,
            r = this._featureGroup;
          r.addLayer(e),
            t !== e &&
              (2 < t._childCount
                ? (t._updateIcon(),
                  this._forceLayout(),
                  this._animationStart(),
                  e._setPos(this._map.latLngToLayerPoint(t.getLatLng())),
                  e.clusterHide(),
                  this._enqueue(function () {
                    r.removeLayer(e), e.clusterShow(), i._animationEnd();
                  }))
                : (this._forceLayout(),
                  i._animationStart(),
                  i._animationZoomOutSingle(
                    t,
                    this._map.getMaxZoom(),
                    this._zoom
                  )));
        },
      },
      _animationZoomOutSingle: function (t, i, r) {
        var n = this._getExpandedVisibleBounds(),
          s = Math.floor(this._map.getMinZoom());
        t._recursivelyAnimateChildrenInAndAddSelfToMap(n, s, i + 1, r);
        var o = this;
        this._forceLayout(),
          t._recursivelyBecomeVisible(n, r),
          this._enqueue(function () {
            if (1 === t._childCount) {
              var e = t._markers[0];
              (this._ignoreMove = !0),
                e.setLatLng(e.getLatLng()),
                (this._ignoreMove = !1),
                e.clusterShow && e.clusterShow();
            } else
              t._recursively(n, r, s, function (e) {
                e._recursivelyRemoveChildrenFromMap(n, s, i + 1);
              });
            o._animationEnd();
          });
      },
      _animationEnd: function () {
        this._map &&
          (this._map._mapPane.className = this._map._mapPane.className.replace(
            " leaflet-cluster-anim",
            ""
          )),
          this._inZoomAnimation--,
          this.fire("animationend");
      },
      _forceLayout: function () {
        L.Util.falseFn(document.body.offsetWidth);
      },
    }),
    (L.markerClusterGroup = function (e) {
      return new L.MarkerClusterGroup(e);
    });
  var i = (L.MarkerCluster = L.Marker.extend({
    options: L.Icon.prototype.options,
    initialize: function (e, t, i, r) {
      L.Marker.prototype.initialize.call(
        this,
        i ? i._cLatLng || i.getLatLng() : new L.LatLng(0, 0),
        { icon: this, pane: e.options.clusterPane }
      ),
        (this._group = e),
        (this._zoom = t),
        (this._markers = []),
        (this._childClusters = []),
        (this._childCount = 0),
        (this._iconNeedsUpdate = !0),
        (this._boundsNeedUpdate = !0),
        (this._bounds = new L.LatLngBounds()),
        i && this._addChild(i),
        r && this._addChild(r);
    },
    getAllChildMarkers: function (e, t) {
      e = e || [];
      for (var i = this._childClusters.length - 1; 0 <= i; i--)
        this._childClusters[i].getAllChildMarkers(e, t);
      for (var r = this._markers.length - 1; 0 <= r; r--)
        (t && this._markers[r].__dragStart) || e.push(this._markers[r]);
      return e;
    },
    getChildCount: function () {
      return this._childCount;
    },
    zoomToBounds: function (e) {
      for (
        var t,
          i = this._childClusters.slice(),
          r = this._group._map,
          n = r.getBoundsZoom(this._bounds),
          s = this._zoom + 1,
          o = r.getZoom();
        0 < i.length && s < n;

      ) {
        s++;
        var a = [];
        for (t = 0; t < i.length; t++) a = a.concat(i[t]._childClusters);
        i = a;
      }
      s < n
        ? this._group._map.setView(this._latlng, s)
        : n <= o
        ? this._group._map.setView(this._latlng, o + 1)
        : this._group._map.fitBounds(this._bounds, e);
    },
    getBounds: function () {
      var e = new L.LatLngBounds();
      return e.extend(this._bounds), e;
    },
    _updateIcon: function () {
      (this._iconNeedsUpdate = !0), this._icon && this.setIcon(this);
    },
    createIcon: function () {
      return (
        this._iconNeedsUpdate &&
          ((this._iconObj = this._group.options.iconCreateFunction(this)),
          (this._iconNeedsUpdate = !1)),
        this._iconObj.createIcon()
      );
    },
    createShadow: function () {
      return this._iconObj.createShadow();
    },
    _addChild: function (e, t) {
      (this._iconNeedsUpdate = !0),
        (this._boundsNeedUpdate = !0),
        this._setClusterCenter(e),
        e instanceof L.MarkerCluster
          ? (t || (this._childClusters.push(e), (e.__parent = this)),
            (this._childCount += e._childCount))
          : (t || this._markers.push(e), this._childCount++),
        this.__parent && this.__parent._addChild(e, !0);
    },
    _setClusterCenter: function (e) {
      this._cLatLng || (this._cLatLng = e._cLatLng || e._latlng);
    },
    _resetBounds: function () {
      var e = this._bounds;
      e._southWest && ((e._southWest.lat = 1 / 0), (e._southWest.lng = 1 / 0)),
        e._northEast &&
          ((e._northEast.lat = -1 / 0), (e._northEast.lng = -1 / 0));
    },
    _recalculateBounds: function () {
      var e,
        t,
        i,
        r,
        n = this._markers,
        s = this._childClusters,
        o = 0,
        a = 0,
        h = this._childCount;
      if (0 !== h) {
        for (this._resetBounds(), e = 0; e < n.length; e++)
          (i = n[e]._latlng),
            this._bounds.extend(i),
            (o += i.lat),
            (a += i.lng);
        for (e = 0; e < s.length; e++)
          (t = s[e])._boundsNeedUpdate && t._recalculateBounds(),
            this._bounds.extend(t._bounds),
            (i = t._wLatLng),
            (r = t._childCount),
            (o += i.lat * r),
            (a += i.lng * r);
        (this._latlng = this._wLatLng = new L.LatLng(o / h, a / h)),
          (this._boundsNeedUpdate = !1);
      }
    },
    _addToMap: function (e) {
      e && ((this._backupLatlng = this._latlng), this.setLatLng(e)),
        this._group._featureGroup.addLayer(this);
    },
    _recursivelyAnimateChildrenIn: function (e, n, t) {
      this._recursively(
        e,
        this._group._map.getMinZoom(),
        t - 1,
        function (e) {
          var t,
            i,
            r = e._markers;
          for (t = r.length - 1; 0 <= t; t--)
            (i = r[t])._icon && (i._setPos(n), i.clusterHide());
        },
        function (e) {
          var t,
            i,
            r = e._childClusters;
          for (t = r.length - 1; 0 <= t; t--)
            (i = r[t])._icon && (i._setPos(n), i.clusterHide());
        }
      );
    },
    _recursivelyAnimateChildrenInAndAddSelfToMap: function (t, i, r, n) {
      this._recursively(t, n, i, function (e) {
        e._recursivelyAnimateChildrenIn(
          t,
          e._group._map.latLngToLayerPoint(e.getLatLng()).round(),
          r
        ),
          e._isSingleParent() && r - 1 === n
            ? (e.clusterShow(), e._recursivelyRemoveChildrenFromMap(t, i, r))
            : e.clusterHide(),
          e._addToMap();
      });
    },
    _recursivelyBecomeVisible: function (e, t) {
      this._recursively(
        e,
        this._group._map.getMinZoom(),
        t,
        null,
        function (e) {
          e.clusterShow();
        }
      );
    },
    _recursivelyAddChildrenToMap: function (r, n, s) {
      this._recursively(
        s,
        this._group._map.getMinZoom() - 1,
        n,
        function (e) {
          if (n !== e._zoom)
            for (var t = e._markers.length - 1; 0 <= t; t--) {
              var i = e._markers[t];
              s.contains(i._latlng) &&
                (r &&
                  ((i._backupLatlng = i.getLatLng()),
                  i.setLatLng(r),
                  i.clusterHide && i.clusterHide()),
                e._group._featureGroup.addLayer(i));
            }
        },
        function (e) {
          e._addToMap(r);
        }
      );
    },
    _recursivelyRestoreChildPositions: function (e) {
      for (var t = this._markers.length - 1; 0 <= t; t--) {
        var i = this._markers[t];
        i._backupLatlng &&
          (i.setLatLng(i._backupLatlng), delete i._backupLatlng);
      }
      if (e - 1 === this._zoom)
        for (var r = this._childClusters.length - 1; 0 <= r; r--)
          this._childClusters[r]._restorePosition();
      else
        for (var n = this._childClusters.length - 1; 0 <= n; n--)
          this._childClusters[n]._recursivelyRestoreChildPositions(e);
    },
    _restorePosition: function () {
      this._backupLatlng &&
        (this.setLatLng(this._backupLatlng), delete this._backupLatlng);
    },
    _recursivelyRemoveChildrenFromMap: function (e, t, i, r) {
      var n, s;
      this._recursively(
        e,
        t - 1,
        i - 1,
        function (e) {
          for (s = e._markers.length - 1; 0 <= s; s--)
            (n = e._markers[s]),
              (r && r.contains(n._latlng)) ||
                (e._group._featureGroup.removeLayer(n),
                n.clusterShow && n.clusterShow());
        },
        function (e) {
          for (s = e._childClusters.length - 1; 0 <= s; s--)
            (n = e._childClusters[s]),
              (r && r.contains(n._latlng)) ||
                (e._group._featureGroup.removeLayer(n),
                n.clusterShow && n.clusterShow());
        }
      );
    },
    _recursively: function (e, t, i, r, n) {
      var s,
        o,
        a = this._childClusters,
        h = this._zoom;
      if ((t <= h && (r && r(this), n && h === i && n(this)), h < t || h < i))
        for (s = a.length - 1; 0 <= s; s--)
          (o = a[s])._boundsNeedUpdate && o._recalculateBounds(),
            e.intersects(o._bounds) && o._recursively(e, t, i, r, n);
    },
    _isSingleParent: function () {
      return (
        0 < this._childClusters.length &&
        this._childClusters[0]._childCount === this._childCount
      );
    },
  }));
  L.Marker.include({
    clusterHide: function () {
      var e = this.options.opacity;
      return this.setOpacity(0), (this.options.opacity = e), this;
    },
    clusterShow: function () {
      return this.setOpacity(this.options.opacity);
    },
  }),
    (L.DistanceGrid = function (e) {
      (this._cellSize = e),
        (this._sqCellSize = e * e),
        (this._grid = {}),
        (this._objectPoint = {});
    }),
    (L.DistanceGrid.prototype = {
      addObject: function (e, t) {
        var i = this._getCoord(t.x),
          r = this._getCoord(t.y),
          n = this._grid,
          s = (n[r] = n[r] || {}),
          o = (s[i] = s[i] || []),
          a = L.Util.stamp(e);
        (this._objectPoint[a] = t), o.push(e);
      },
      updateObject: function (e, t) {
        this.removeObject(e), this.addObject(e, t);
      },
      removeObject: function (e, t) {
        var i,
          r,
          n = this._getCoord(t.x),
          s = this._getCoord(t.y),
          o = this._grid,
          a = (o[s] = o[s] || {}),
          h = (a[n] = a[n] || []);
        for (
          delete this._objectPoint[L.Util.stamp(e)], i = 0, r = h.length;
          i < r;
          i++
        )
          if (h[i] === e) return h.splice(i, 1), 1 === r && delete a[n], !0;
      },
      eachObject: function (e, t) {
        var i,
          r,
          n,
          s,
          o,
          a,
          h = this._grid;
        for (i in h)
          for (r in (o = h[i]))
            for (n = 0, s = (a = o[r]).length; n < s; n++)
              e.call(t, a[n]) && (n--, s--);
      },
      getNearObject: function (e) {
        var t,
          i,
          r,
          n,
          s,
          o,
          a,
          h,
          l = this._getCoord(e.x),
          u = this._getCoord(e.y),
          _ = this._objectPoint,
          d = this._sqCellSize,
          p = null;
        for (t = u - 1; t <= u + 1; t++)
          if ((n = this._grid[t]))
            for (i = l - 1; i <= l + 1; i++)
              if ((s = n[i]))
                for (r = 0, o = s.length; r < o; r++)
                  (a = s[r]),
                    ((h = this._sqDist(_[L.Util.stamp(a)], e)) < d ||
                      (h <= d && null === p)) &&
                      ((d = h), (p = a));
        return p;
      },
      _getCoord: function (e) {
        var t = Math.floor(e / this._cellSize);
        return isFinite(t) ? t : e;
      },
      _sqDist: function (e, t) {
        var i = t.x - e.x,
          r = t.y - e.y;
        return i * i + r * r;
      },
    }),
    (L.QuickHull = {
      getDistant: function (e, t) {
        var i = t[1].lat - t[0].lat;
        return (
          (t[0].lng - t[1].lng) * (e.lat - t[0].lat) + i * (e.lng - t[0].lng)
        );
      },
      findMostDistantPointFromBaseLine: function (e, t) {
        var i,
          r,
          n,
          s = 0,
          o = null,
          a = [];
        for (i = t.length - 1; 0 <= i; i--)
          (r = t[i]),
            0 < (n = this.getDistant(r, e)) &&
              (a.push(r), s < n && ((s = n), (o = r)));
        return { maxPoint: o, newPoints: a };
      },
      buildConvexHull: function (e, t) {
        var i = [],
          r = this.findMostDistantPointFromBaseLine(e, t);
        return r.maxPoint
          ? (i = (i = i.concat(
              this.buildConvexHull([e[0], r.maxPoint], r.newPoints)
            )).concat(this.buildConvexHull([r.maxPoint, e[1]], r.newPoints)))
          : [e[0]];
      },
      getConvexHull: function (e) {
        var t,
          i = !1,
          r = !1,
          n = !1,
          s = !1,
          o = null,
          a = null,
          h = null,
          l = null,
          u = null,
          _ = null;
        for (t = e.length - 1; 0 <= t; t--) {
          var d = e[t];
          (!1 === i || d.lat > i) && (i = (o = d).lat),
            (!1 === r || d.lat < r) && (r = (a = d).lat),
            (!1 === n || d.lng > n) && (n = (h = d).lng),
            (!1 === s || d.lng < s) && (s = (l = d).lng);
        }
        return (
          (u = r !== i ? ((_ = a), o) : ((_ = l), h)),
          [].concat(
            this.buildConvexHull([_, u], e),
            this.buildConvexHull([u, _], e)
          )
        );
      },
    }),
    L.MarkerCluster.include({
      getConvexHull: function () {
        var e,
          t,
          i = this.getAllChildMarkers(),
          r = [];
        for (t = i.length - 1; 0 <= t; t--) (e = i[t].getLatLng()), r.push(e);
        return L.QuickHull.getConvexHull(r);
      },
    }),
    L.MarkerCluster.include({
      _2PI: 2 * Math.PI,
      _circleFootSeparation: 25,
      _circleStartAngle: 0,
      _spiralFootSeparation: 28,
      _spiralLengthStart: 11,
      _spiralLengthFactor: 5,
      _circleSpiralSwitchover: 9,
      spiderfy: function () {
        if (this._group._spiderfied !== this && !this._group._inZoomAnimation) {
          var e,
            t = this.getAllChildMarkers(null, !0),
            i = this._group._map.latLngToLayerPoint(this._latlng);
          this._group._unspiderfy(),
            (e = (this._group._spiderfied = this)._group.options
              .spiderfyShapePositions
              ? this._group.options.spiderfyShapePositions(t.length, i)
              : t.length >= this._circleSpiralSwitchover
              ? this._generatePointsSpiral(t.length, i)
              : ((i.y += 10), this._generatePointsCircle(t.length, i))),
            this._animationSpiderfy(t, e);
        }
      },
      unspiderfy: function (e) {
        this._group._inZoomAnimation ||
          (this._animationUnspiderfy(e), (this._group._spiderfied = null));
      },
      _generatePointsCircle: function (e, t) {
        var i,
          r,
          n =
            (this._group.options.spiderfyDistanceMultiplier *
              this._circleFootSeparation *
              (2 + e)) /
            this._2PI,
          s = this._2PI / e,
          o = [];
        for (n = Math.max(n, 35), o.length = e, i = 0; i < e; i++)
          (r = this._circleStartAngle + i * s),
            (o[i] = new L.Point(
              t.x + n * Math.cos(r),
              t.y + n * Math.sin(r)
            )._round());
        return o;
      },
      _generatePointsSpiral: function (e, t) {
        var i,
          r = this._group.options.spiderfyDistanceMultiplier,
          n = r * this._spiralLengthStart,
          s = r * this._spiralFootSeparation,
          o = r * this._spiralLengthFactor * this._2PI,
          a = 0,
          h = [];
        for (i = h.length = e; 0 <= i; i--)
          i < e &&
            (h[i] = new L.Point(
              t.x + n * Math.cos(a),
              t.y + n * Math.sin(a)
            )._round()),
            (n += o / (a += s / n + 5e-4 * i));
        return h;
      },
      _noanimationUnspiderfy: function () {
        var e,
          t,
          i = this._group,
          r = i._map,
          n = i._featureGroup,
          s = this.getAllChildMarkers(null, !0);
        for (
          i._ignoreMove = !0, this.setOpacity(1), t = s.length - 1;
          0 <= t;
          t--
        )
          (e = s[t]),
            n.removeLayer(e),
            e._preSpiderfyLatlng &&
              (e.setLatLng(e._preSpiderfyLatlng), delete e._preSpiderfyLatlng),
            e.setZIndexOffset && e.setZIndexOffset(0),
            e._spiderLeg && (r.removeLayer(e._spiderLeg), delete e._spiderLeg);
        i.fire("unspiderfied", { cluster: this, markers: s }),
          (i._ignoreMove = !1),
          (i._spiderfied = null);
      },
    }),
    (L.MarkerClusterNonAnimated = L.MarkerCluster.extend({
      _animationSpiderfy: function (e, t) {
        var i,
          r,
          n,
          s,
          o = this._group,
          a = o._map,
          h = o._featureGroup,
          l = this._group.options.spiderLegPolylineOptions;
        for (o._ignoreMove = !0, i = 0; i < e.length; i++)
          (s = a.layerPointToLatLng(t[i])),
            (r = e[i]),
            (n = new L.Polyline([this._latlng, s], l)),
            a.addLayer(n),
            (r._spiderLeg = n),
            (r._preSpiderfyLatlng = r._latlng),
            r.setLatLng(s),
            r.setZIndexOffset && r.setZIndexOffset(1e6),
            h.addLayer(r);
        this.setOpacity(0.3),
          (o._ignoreMove = !1),
          o.fire("spiderfied", { cluster: this, markers: e });
      },
      _animationUnspiderfy: function () {
        this._noanimationUnspiderfy();
      },
    })),
    L.MarkerCluster.include({
      _animationSpiderfy: function (e, t) {
        var i,
          r,
          n,
          s,
          o,
          a,
          h = this,
          l = this._group,
          u = l._map,
          _ = l._featureGroup,
          d = this._latlng,
          p = u.latLngToLayerPoint(d),
          c = L.Path.SVG,
          f = L.extend({}, this._group.options.spiderLegPolylineOptions),
          m = f.opacity;
        for (
          void 0 === m &&
            (m =
              L.MarkerClusterGroup.prototype.options.spiderLegPolylineOptions
                .opacity),
            c
              ? ((f.opacity = 0),
                (f.className =
                  (f.className || "") + " leaflet-cluster-spider-leg"))
              : (f.opacity = m),
            l._ignoreMove = !0,
            i = 0;
          i < e.length;
          i++
        )
          (r = e[i]),
            (a = u.layerPointToLatLng(t[i])),
            (n = new L.Polyline([d, a], f)),
            u.addLayer(n),
            (r._spiderLeg = n),
            c &&
              ((o = (s = n._path).getTotalLength() + 0.1),
              (s.style.strokeDasharray = o),
              (s.style.strokeDashoffset = o)),
            r.setZIndexOffset && r.setZIndexOffset(1e6),
            r.clusterHide && r.clusterHide(),
            _.addLayer(r),
            r._setPos && r._setPos(p);
        for (
          l._forceLayout(), l._animationStart(), i = e.length - 1;
          0 <= i;
          i--
        )
          (a = u.layerPointToLatLng(t[i])),
            ((r = e[i])._preSpiderfyLatlng = r._latlng),
            r.setLatLng(a),
            r.clusterShow && r.clusterShow(),
            c &&
              (((s = (n = r._spiderLeg)._path).style.strokeDashoffset = 0),
              n.setStyle({ opacity: m }));
        this.setOpacity(0.3),
          (l._ignoreMove = !1),
          setTimeout(function () {
            l._animationEnd(), l.fire("spiderfied", { cluster: h, markers: e });
          }, 200);
      },
      _animationUnspiderfy: function (e) {
        var t,
          i,
          r,
          n,
          s,
          o,
          a = this,
          h = this._group,
          l = h._map,
          u = h._featureGroup,
          _ = e
            ? l._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
            : l.latLngToLayerPoint(this._latlng),
          d = this.getAllChildMarkers(null, !0),
          p = L.Path.SVG;
        for (
          h._ignoreMove = !0,
            h._animationStart(),
            this.setOpacity(1),
            i = d.length - 1;
          0 <= i;
          i--
        )
          (t = d[i])._preSpiderfyLatlng &&
            (t.closePopup(),
            t.setLatLng(t._preSpiderfyLatlng),
            delete t._preSpiderfyLatlng,
            (o = !0),
            t._setPos && (t._setPos(_), (o = !1)),
            t.clusterHide && (t.clusterHide(), (o = !1)),
            o && u.removeLayer(t),
            p &&
              ((s = (n = (r = t._spiderLeg)._path).getTotalLength() + 0.1),
              (n.style.strokeDashoffset = s),
              r.setStyle({ opacity: 0 })));
        (h._ignoreMove = !1),
          setTimeout(function () {
            var e = 0;
            for (i = d.length - 1; 0 <= i; i--) (t = d[i])._spiderLeg && e++;
            for (i = d.length - 1; 0 <= i; i--)
              (t = d[i])._spiderLeg &&
                (t.clusterShow && t.clusterShow(),
                t.setZIndexOffset && t.setZIndexOffset(0),
                1 < e && u.removeLayer(t),
                l.removeLayer(t._spiderLeg),
                delete t._spiderLeg);
            h._animationEnd(),
              h.fire("unspiderfied", { cluster: a, markers: d });
          }, 200);
      },
    }),
    L.MarkerClusterGroup.include({
      _spiderfied: null,
      unspiderfy: function () {
        this._unspiderfy.apply(this, arguments);
      },
      _spiderfierOnAdd: function () {
        this._map.on("click", this._unspiderfyWrapper, this),
          this._map.options.zoomAnimation &&
            this._map.on("zoomstart", this._unspiderfyZoomStart, this),
          this._map.on("zoomend", this._noanimationUnspiderfy, this),
          L.Browser.touch || this._map.getRenderer(this);
      },
      _spiderfierOnRemove: function () {
        this._map.off("click", this._unspiderfyWrapper, this),
          this._map.off("zoomstart", this._unspiderfyZoomStart, this),
          this._map.off("zoomanim", this._unspiderfyZoomAnim, this),
          this._map.off("zoomend", this._noanimationUnspiderfy, this),
          this._noanimationUnspiderfy();
      },
      _unspiderfyZoomStart: function () {
        this._map && this._map.on("zoomanim", this._unspiderfyZoomAnim, this);
      },
      _unspiderfyZoomAnim: function (e) {
        L.DomUtil.hasClass(this._map._mapPane, "leaflet-touching") ||
          (this._map.off("zoomanim", this._unspiderfyZoomAnim, this),
          this._unspiderfy(e));
      },
      _unspiderfyWrapper: function () {
        this._unspiderfy();
      },
      _unspiderfy: function (e) {
        this._spiderfied && this._spiderfied.unspiderfy(e);
      },
      _noanimationUnspiderfy: function () {
        this._spiderfied && this._spiderfied._noanimationUnspiderfy();
      },
      _unspiderfyLayer: function (e) {
        e._spiderLeg &&
          (this._featureGroup.removeLayer(e),
          e.clusterShow && e.clusterShow(),
          e.setZIndexOffset && e.setZIndexOffset(0),
          this._map.removeLayer(e._spiderLeg),
          delete e._spiderLeg);
      },
    }),
    L.MarkerClusterGroup.include({
      refreshClusters: function (e) {
        return (
          e
            ? e instanceof L.MarkerClusterGroup
              ? (e = e._topClusterLevel.getAllChildMarkers())
              : e instanceof L.LayerGroup
              ? (e = e._layers)
              : e instanceof L.MarkerCluster
              ? (e = e.getAllChildMarkers())
              : e instanceof L.Marker && (e = [e])
            : (e = this._topClusterLevel.getAllChildMarkers()),
          this._flagParentsIconsNeedUpdate(e),
          this._refreshClustersIcons(),
          this.options.singleMarkerMode &&
            this._refreshSingleMarkerModeMarkers(e),
          this
        );
      },
      _flagParentsIconsNeedUpdate: function (e) {
        var t, i;
        for (t in e)
          for (i = e[t].__parent; i; )
            (i._iconNeedsUpdate = !0), (i = i.__parent);
      },
      _refreshSingleMarkerModeMarkers: function (e) {
        var t, i;
        for (t in e)
          (i = e[t]),
            this.hasLayer(i) && i.setIcon(this._overrideMarkerIcon(i));
      },
    }),
    L.Marker.include({
      refreshIconOptions: function (e, t) {
        var i = this.options.icon;
        return (
          L.setOptions(i, e),
          this.setIcon(i),
          t && this.__parent && this.__parent._group.refreshClusters(this),
          this
        );
      },
    }),
    (e.MarkerClusterGroup = t),
    (e.MarkerCluster = i),
    Object.defineProperty(e, "__esModule", { value: !0 });
});
