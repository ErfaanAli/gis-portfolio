/* 3D scene: ArcGIS Maps SDK for JavaScript 4.30 SceneView, driven by scroll.
   Esri tile, elevation and OSM building services are public, so no API key is needed. */
(function () {
  const $ = (id) => document.getElementById(id);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  const nf = new Intl.NumberFormat("en-US");

  // ---------------------------------------------------------------- data
  // eye: optional explicit camera [lon, lat, z, tilt] for globe and country-scale views.
  //      "sunlit" puts the camera over the day side with the terminator in view.
  // light: "fixed" (camera-relative), "now" (real sun position), or local solar hour.
  const CHAPTERS = {
    intro:      { name: "Arabian Peninsula", coord: [45.0792, 23.8859], view: { center: [46, 23], zoom: 2.6, tilt: 0, heading: 0 }, eye: [46, 20, 17500000, 0], layers: ["clients"], light: "fixed", orbit: "globe" },
    profile:    { name: "Kingdom of Saudi Arabia", coord: [45.0792, 23.8859], view: { center: [44.2, 23.0], zoom: 5.2, tilt: 32, heading: 0 }, eye: [44.5, 9.5, 2300000, 34], layers: ["clients"], light: "fixed" },
    esnad:      { name: "Arabian Shield, license demo", coord: [41.23, 23.505], view: { center: [41.235, 23.5], zoom: 11.1, tilt: 66, heading: 22 }, layers: ["licenses"], light: 9, enter: "deduction" },
    enterprise: { name: "Riyadh, north", coord: [46.64, 24.765], view: { center: [46.6405, 24.7635], zoom: 15.2, tilt: 70, heading: 320 }, layers: ["clients", "buildings"], light: 15.5, orbit: "heading" },
    kidana:     { name: "Mina, Makkah", coord: [39.8933, 21.4133], view: { center: [39.8933, 21.4133], zoom: 14.2, tilt: 68, heading: 60 }, layers: ["clients"], light: 7.6, orbit: "heading" },
    riyadh:     { name: "King Khalid International Airport", coord: [46.6988, 24.9576], view: { center: [46.7, 24.958], zoom: 12.8, tilt: 58, heading: 350 }, layers: ["clients", "buildings"], light: 16 },
    cls:        { name: "Kingdom of Saudi Arabia, CLS coverage", coord: [45.0792, 23.8859], view: { center: [44.6, 23.2], zoom: 5, tilt: 42, heading: 0 }, eye: [45, 6.5, 2500000, 38], layers: ["coverage"], light: "fixed" },
    intellyct:  { name: "Vaughan, Ontario, Canada", coord: [-79.5083, 43.8361], view: { center: [-79.5275, 43.796], zoom: 14.6, tilt: 66, heading: 335 }, layers: ["career", "buildings"], light: 15.5, orbit: "heading" },
    nasfia:     { name: "Sydney, Australia", coord: [151.2093, -33.8688], view: { center: [151.2095, -33.8635], zoom: 15, tilt: 70, heading: 195 }, layers: ["career", "buildings"], light: 8.5, orbit: "heading" },
    career:     { name: "Karachi to Sydney, Canada, Riyadh", coord: [67.0011, 24.8607], view: { center: [75, 15], zoom: 2.3, tilt: 0, heading: 0 }, eye: [78, 12, 17000000, 0], layers: ["career"], light: "fixed", enter: "arcs", orbit: "globe" },
    skills:     { name: "Riyadh", coord: [46.6744, 24.7114], view: { center: [46.6744, 24.7114], zoom: 15, tilt: 72, heading: 300 }, layers: ["clients", "buildings"], light: 16.5, orbit: "heading" },
    live:       { name: "Global, live feeds", coord: null, view: { center: [55, 18], zoom: 2.1, tilt: 0, heading: 0 }, eye: "sunlit", layers: ["quakes", "iss"], light: "now", orbit: "globe" },
    education:  { name: "FAST-NUCES, Karachi", coord: [67.2647, 24.8569], view: { center: [67.2647, 24.8569], zoom: 15, tilt: 62, heading: 20 }, layers: ["career", "buildings"], light: 9 },
    contact:    { name: "Riyadh, Saudi Arabia", coord: [46.6753, 24.7136], view: { center: [46.6753, 24.7136], zoom: 11.4, tilt: 62, heading: 330 }, layers: ["clients"], light: 17, orbit: "heading" },
  };
  const ORDER = Object.keys(CHAPTERS);

  // City-level, approximate positions.
  const CLIENTS = [
    { ObjectID: 1, name: "ESNAD", full: "ESNAD · Saudi Mining Services Company", city: "Riyadh", lon: 46.64, lat: 24.77, work: "Mining license GIS portal, spatial auto deduction engine, ArcGIS Enterprise HA/DR" },
    { ObjectID: 2, name: "MIMR", full: "Ministry of Industry and Mineral Resources", city: "Riyadh", lon: 46.668, lat: 24.69, work: "Digital mining license issuance" },
    { ObjectID: 3, name: "KIDANA", full: "Ministry of Hajj · KIDANA", city: "Mina, Makkah", lon: 39.8933, lat: 21.4133, work: "KIDANA Permits: holy-site land allocation with approval workflows" },
    { ObjectID: 4, name: "Ministry of Culture", full: "Ministry of Culture", city: "Riyadh", lon: 46.7, lat: 24.65, work: "GIS delivery" },
    { ObjectID: 5, name: "SDAIA", full: "Saudi Data & AI Authority", city: "Riyadh", lon: 46.625, lat: 24.725, work: "GIS delivery" },
    { ObjectID: 6, name: "NIC", full: "National Information Center", city: "Riyadh HQ · service used Kingdom-wide", lon: 46.735, lat: 24.705, work: "Caller Location Service: 4 s to 0.44 ms" },
    { ObjectID: 7, name: "Riyadh Airports", full: "Riyadh Airports · King Khalid International", city: "Riyadh", lon: 46.6988, lat: 24.9576, work: "Airport GIS maps and layers" },
    { ObjectID: 8, name: "RCU", full: "Royal Commission for AlUla (RCU)", city: "AlUla", lon: 37.9232, lat: 26.6085, work: "GIS project for the Royal Commission for AlUla" },
  ];
  const PLACES = [
    { ObjectID: 1, name: "Karachi", full: "Karachi, Pakistan", city: "2018 – 2021", lon: 67.0011, lat: 24.8607, work: "Ficiali: web apps, REST and SOAP APIs" },
    { ObjectID: 2, name: "Intellyct · Vaughan", full: "Vaughan, Ontario, Canada", city: "Mar – Sep 2023", lon: -79.5083, lat: 43.8361, work: "Intellyct: .NET Core microservices, Kafka, Azure Service Bus (remote)" },
    { ObjectID: 6, name: "Nasfia · Sydney", full: "Sydney, Australia", city: "Sep 2021 – Feb 2023", lon: 151.2093, lat: -33.8688, work: "Nasfia: Azure cloud platforms and CRM products" },
    { ObjectID: 3, name: "Riyadh", full: "Riyadh, Saudi Arabia", city: "2023 – present", lon: 46.6753, lat: 24.7136, work: "Geotech Overseas, then ESNAD: Senior GIS Developer" },
    { ObjectID: 5, name: "Jeddah", full: "Jeddah, Saudi Arabia", city: "Open to roles", lon: 39.1925, lat: 21.4858, work: "Available for GIS roles in Jeddah as well as Riyadh" },
    { ObjectID: 4, name: "FAST-NUCES", full: "FAST-NUCES Karachi campus", city: "2016 – 2020", lon: 67.2647, lat: 24.8569, work: "BS Computer Science" },
  ];

  // Main cities served by the Caller Location Service (it covers the whole Kingdom).
  const NIC = [46.735, 24.705];
  const CLS_CITIES = [
    ["Riyadh", 46.6753, 24.7136], ["Jeddah", 39.1925, 21.4858], ["Makkah", 39.8262, 21.4225], ["Madinah", 39.6142, 24.4686],
    ["Dammam", 50.1033, 26.4207], ["Tabuk", 36.5662, 28.3835], ["Abha", 42.5053, 18.2164], ["Jazan", 42.5511, 16.8892],
    ["Hail", 41.6907, 27.5114], ["Buraidah", 43.975, 26.326], ["Najran", 44.1277, 17.5656], ["Sakaka", 40.2064, 29.9697],
    ["Arar", 41.0381, 30.9753], ["Al Bahah", 41.4677, 20.0129],
  ].map(([name, lon, lat], i) => ({ ObjectID: i + 1, name, full: name, city: "Caller Location Service coverage", lon, lat, work: "Served by the NIC Caller Location Service" }));

  // Synthetic license polygons (clockwise rings, WGS84).
  const EXISTING = [
    { id: "ML-2041", ring: [[41.10, 23.62], [41.22, 23.63], [41.23, 23.54], [41.12, 23.52], [41.10, 23.62]] },
    { id: "ML-2057", ring: [[41.26, 23.60], [41.36, 23.58], [41.34, 23.48], [41.25, 23.50], [41.26, 23.60]] },
    { id: "ML-2112", ring: [[41.14, 23.47], [41.24, 23.46], [41.22, 23.38], [41.13, 23.40], [41.14, 23.47]] },
  ];
  const APPLICATION = { id: "APP-3308", ring: [[41.18, 23.57], [41.30, 23.565], [41.29, 23.44], [41.17, 23.455], [41.18, 23.57]] };

  const USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
  const ISS_URL = "https://api.wheretheiss.at/v1/satellites/25544";
  const OSM_BUILDINGS = "https://basemaps3d.arcgis.com/arcgis/rest/services/OpenStreetMap3D_Buildings_v1/SceneServer";

  const fmtLat = (v) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? "N" : "S"}`;
  const fmtLon = (v) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? "E" : "W"}`;
  const ago = (ms) => {
    const m = Math.round((Date.now() - ms) / 60000);
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
  };

  // ------------------------------------------------- live feeds (story cards)
  // These fill the story cards even if the 3D map can't load.
  let currentChapter = null;
  let issTimer = 0;
  let issHook = null;
  let quakesFetched = false;

  async function fetchQuakeStats() {
    if (quakesFetched) return;
    quakesFetched = true;
    try {
      const res = await fetch(USGS_URL);
      const data = await res.json();
      const feats = data.features || [];
      const strongest = feats.reduce((a, f) => (!a || f.properties.mag > a.properties.mag ? f : a), null);
      $("quakeCount").textContent = nf.format(feats.length);
      $("quakeMax").textContent = strongest
        ? `Strongest: M${strongest.properties.mag.toFixed(1)}, ${strongest.properties.place}, ${ago(strongest.properties.time)}`
        : "No events in the feed right now.";
    } catch (e) {
      quakesFetched = false;
      $("quakeMax").textContent = "Feed unavailable right now.";
    }
  }

  async function pollIss() {
    try {
      const res = await fetch(ISS_URL);
      const d = await res.json();
      $("issPos").textContent = `${fmtLat(d.latitude).replace(/\.(\d{2})\d+/, ".$1")}, ${fmtLon(d.longitude).replace(/\.(\d{2})\d+/, ".$1")}`;
      $("issMeta").textContent = `${nf.format(Math.round(d.altitude))} km up, ${nf.format(Math.round(d.velocity))} km/h, updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
      if (issHook) issHook(d);
    } catch (e) {
      $("issMeta").textContent = "Position feed unavailable right now.";
    }
  }

  let issWanted = false; // layer toggle state, set by the map
  function syncIssPolling() {
    const want = currentChapter === "live" || issWanted;
    if (want && !issTimer) { pollIss(); issTimer = setInterval(pollIss, 5000); }
    if (!want && issTimer) { clearInterval(issTimer); issTimer = 0; }
  }

  // ------------------------------------------------------------ map setup
  const listeners = [];
  window.Story && window.Story.onChange((id) => {
    currentChapter = id;
    if (id === "live") fetchQuakeStats();
    syncIssPolling();
    listeners.forEach((fn) => fn(id));
  });

  function fail(err) {
    if (err) console.warn("3D map unavailable:", err);
    $("mapLoading").classList.add("done");
    $("mapFallback").hidden = false;
    $("layerPanel").hidden = true;
    document.querySelector(".statusbar").hidden = true;
    $("locChip").hidden = true;
    $("replayDeduction").hidden = true;
  }
  window.__mapFailed = fail;

  if (typeof window.require !== "function") { fail("ArcGIS SDK did not load"); return; }
  if (window.require.on) window.require.on("error", fail);

  window.require([
    "esri/Map", "esri/views/SceneView", "esri/Basemap", "esri/Ground",
    "esri/layers/TileLayer", "esri/layers/ElevationLayer", "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer", "esri/layers/GeoJSONLayer", "esri/Graphic",
    "esri/geometry/Point", "esri/geometry/Polygon", "esri/geometry/Polyline",
    "esri/geometry/geometryEngine", "esri/core/reactiveUtils",
  ], (EsriMap, SceneView, Basemap, Ground, TileLayer, ElevationLayer, GraphicsLayer,
      FeatureLayer, GeoJSONLayer, Graphic, Point, Polygon, Polyline, geometryEngine, reactiveUtils) => {

    const AGO = "https://services.arcgisonline.com/ArcGIS/rest/services/";
    const tile = (path) => new TileLayer({ url: AGO + path + "/MapServer" });
    const basemaps = {
      imagery: new Basemap({ id: "imagery", title: "Imagery", baseLayers: [tile("World_Imagery")], referenceLayers: [tile("Reference/World_Boundaries_and_Places")] }),
      topo: new Basemap({ id: "topo", title: "Topographic", baseLayers: [tile("World_Topo_Map")] }),
      dark: new Basemap({ id: "dark", title: "Dark", baseLayers: [tile("Canvas/World_Dark_Gray_Base")], referenceLayers: [tile("Canvas/World_Dark_Gray_Reference")] }),
    };

    const map = new EsriMap({
      basemap: basemaps.imagery,
      ground: new Ground({ layers: [new ElevationLayer({ url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer" })] }),
    });

    const view = new SceneView({
      container: "map",
      map,
      qualityProfile: isMobile ? "low" : "medium",
      camera: { position: { longitude: 46, latitude: 12, z: 26000000 }, tilt: 0, heading: 0 },
      environment: {
        lighting: { type: "virtual" },
        atmosphereEnabled: true,
        starsEnabled: true,
      },
      popup: { dockEnabled: false, dockOptions: { buttonEnabled: false } },
      ui: { components: isMobile ? ["attribution", "zoom"] : ["attribution", "zoom", "compass", "navigation-toggle"] },
    });
    view.ui.move(isMobile ? ["zoom"] : ["zoom", "compass", "navigation-toggle"], "bottom-right");

    const sr = { wkid: 4326 };
    const lineSym = (color, size, style) => ({
      type: "line-3d",
      symbolLayers: [{ type: "line", size, material: { color }, cap: "round", join: "round", ...(style ? { pattern: { type: "style", style } } : {}) }],
    });

    // ------------------------------------------------- animation ticker
    const tickers = new Set();
    let tickRaf = 0;
    function tick(now) {
      tickers.forEach((fn) => fn(now));
      tickRaf = tickers.size ? requestAnimationFrame(tick) : 0;
    }
    const addTicker = (fn) => { tickers.add(fn); if (!tickRaf) tickRaf = requestAnimationFrame(tick); };
    const removeTicker = (fn) => tickers.delete(fn);

    // Great-circle path lifted off the surface, as [lon, lat, z] vertices.
    function greatCircle(a, b, n, lift, maxLift) {
      const rad = Math.PI / 180;
      const vec = ([lon, lat]) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
      const A = vec(a), B = vec(b);
      const omega = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
      const peak = Math.min(omega * 6371000 * lift, maxLift);
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const s1 = Math.sin((1 - t) * omega) / Math.sin(omega), s2 = Math.sin(t * omega) / Math.sin(omega);
        const x = s1 * A[0] + s2 * B[0], y = s1 * A[1] + s2 * B[1], z = s1 * A[2] + s2 * B[2];
        pts.push([Math.atan2(y, x) / rad, Math.asin(z) / rad, 2000 + Math.sin(Math.PI * t) * peak]);
      }
      return pts;
    }

    // A short bright segment that travels along each path, on a loop.
    function makeFlow(layer, arcs, { period, len, symbol }) {
      const heads = arcs.map(() => new Graphic({ symbol }));
      let last = 0, on = false;
      const step = (now) => {
        if (now - last < 33) return;
        last = now;
        arcs.forEach((a, i) => {
          const t = (now / period + a.phase) % 1;
          const k = Math.floor(t * (a.pts.length - 1 - len));
          heads[i].geometry = new Polyline({ paths: [a.pts.slice(k, k + len + 1)], hasZ: true, spatialReference: sr });
        });
      };
      return {
        start() { if (reduced || on) return; on = true; layer.addMany(heads); addTicker(step); },
        stop() { if (!on) return; on = false; removeTicker(step); layer.removeMany(heads); },
      };
    }

    // ------------------------------------------------------ point layers
    const pointSymbol = (color) => ({
      type: "point-3d",
      symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color }, outline: { color: "white", size: 1.5 }, size: 11 }],
      verticalOffset: { screenLength: 38, maxWorldLength: 30000, minWorldLength: 30 },
      callout: { type: "line", size: 1, color: [255, 255, 255, 0.9], border: { color: [0, 0, 0, 0.35] } },
    });
    const labelInfo = [{
      labelExpressionInfo: { expression: "$feature.name" },
      labelPlacement: "above-center",
      symbol: {
        type: "label-3d",
        symbolLayers: [{ type: "text", material: { color: "white" }, halo: { color: [5, 10, 12, 0.85], size: 1.4 }, font: { family: "IBM Plex Sans", weight: "bold" }, size: 10 }],
      },
    }];
    const pointLayer = (rows, color, title) => new FeatureLayer({
      title,
      source: rows.map((r) => new Graphic({
        geometry: new Point({ longitude: r.lon, latitude: r.lat }),
        attributes: { ObjectID: r.ObjectID, name: r.name, full: r.full, city: r.city, work: r.work },
      })),
      objectIdField: "ObjectID",
      fields: [
        { name: "ObjectID", type: "oid" }, { name: "name", type: "string" }, { name: "full", type: "string" },
        { name: "city", type: "string" }, { name: "work", type: "string" },
      ],
      geometryType: "point",
      spatialReference: sr,
      elevationInfo: { mode: "relative-to-scene" },
      screenSizePerspectiveEnabled: false,
      renderer: { type: "simple", symbol: pointSymbol(color) },
      labelingInfo: labelInfo,
      outFields: ["*"],
      popupTemplate: { title: "{full}", content: "<p>{work}</p><p style='opacity:.7;font-size:12px'>{city}</p>" },
      visible: false,
    });

    const clientsLayer = pointLayer(CLIENTS, "#4da3ff", "Client sites");
    const placesLayer = pointLayer(PLACES, "#8bd3a0", "Career path");
    const arcsLayer = new GraphicsLayer({ title: "Career arcs", elevationInfo: { mode: "absolute-height" }, visible: false });
    const licLayer = new GraphicsLayer({ title: "License demo", elevationInfo: { mode: "on-the-ground" }, visible: false });
    const issLayer = new GraphicsLayer({ title: "ISS", elevationInfo: { mode: "absolute-height" }, visible: false });
    const clsFlowLayer = new GraphicsLayer({ title: "CLS lookups", elevationInfo: { mode: "absolute-height" }, visible: false });
    let quakesLayer = null;

    const ksaLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0",
      definitionExpression: "ISO = 'SA'",
      title: "CLS coverage, Saudi Arabia",
      elevationInfo: { mode: "on-the-ground" },
      renderer: { type: "simple", symbol: { type: "polygon-3d", symbolLayers: [{ type: "fill", material: { color: [139, 211, 160, 0.3] }, outline: { color: [139, 211, 160, 1], size: 2.2 } }] } },
      popupTemplate: { title: "Caller Location Service", content: "Used across the whole Kingdom of Saudi Arabia." },
      visible: false,
    });
    const clsCitiesLayer = pointLayer(CLS_CITIES, "#8bd3a0", "CLS cities");
    clsCitiesLayer.renderer = {
      type: "simple",
      symbol: { type: "point-3d", symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color: [139, 211, 160, 0.95] }, outline: { color: "white", size: 1.2 }, size: 8 }] },
    };

    // OpenStreetMap buildings, drawn as plain white massing with sketch edges.
    // The SceneLayer module and the layer itself load on first use, so the opening view stays light.
    let buildingsLayer = null, buildingsRequested = false;
    function ensureBuildings() {
      if (buildingsRequested) return;
      buildingsRequested = true;
      window.require(["esri/layers/SceneLayer"], (SceneLayer) => {
        buildingsLayer = new SceneLayer(BUILDINGS);
        buildingsLayer.visible = state.buildings;
        map.add(buildingsLayer, map.layers.indexOf(licLayer) + 1);
      });
    }
    const BUILDINGS = {
      url: OSM_BUILDINGS,
      title: "OpenStreetMap 3D buildings",
      popupEnabled: false,
      renderer: {
        type: "simple",
        symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill", material: { color: [232, 237, 242], colorMixMode: "replace" }, edges: { type: "solid", color: [25, 38, 50, 0.55], size: 0.6 } }] },
      },
      visible: false,
    };

    // Graticule every 15°, floated just above the terrain so it stays crisp.
    const gratLayer = new GraphicsLayer({ title: "Graticule", elevationInfo: { mode: "absolute-height" }, maxScale: 9000000, visible: true });
    (function buildGraticule() {
      const Z = 15000;
      const add = (path, color, size, style) => gratLayer.add(new Graphic({
        geometry: new Polyline({ paths: [path], hasZ: true, spatialReference: sr }),
        symbol: lineSym(color, size, style),
      }));
      for (let lon = -180; lon < 180; lon += 15) {
        const path = [];
        for (let lat = -84; lat <= 84; lat += 3) path.push([lon, lat, Z]);
        add(path, [200, 218, 235, lon === 0 ? 0.42 : 0.2], lon === 0 ? 1 : 0.6);
      }
      const parallel = (lat) => { const p = []; for (let lon = -180; lon <= 180; lon += 3) p.push([lon, lat, Z]); return p; };
      for (let lat = -75; lat <= 75; lat += 15) add(parallel(lat), [200, 218, 235, lat === 0 ? 0.42 : 0.2], lat === 0 ? 1 : 0.6);
      add(parallel(23.4364), [139, 211, 160, 0.5], 0.8, "dash");  // Tropic of Cancer
      add(parallel(-23.4364), [139, 211, 160, 0.5], 0.8, "dash"); // Tropic of Capricorn
    })();

    map.addMany([ksaLayer, licLayer, gratLayer, arcsLayer, clsFlowLayer, placesLayer, clsCitiesLayer, clientsLayer, issLayer]);

    // Earthquakes as columns: height and colour follow magnitude.
    function ensureQuakes() {
      if (quakesLayer) return quakesLayer;
      quakesLayer = new GeoJSONLayer({
        url: USGS_URL,
        title: "Earthquakes (USGS)",
        copyright: "USGS",
        elevationInfo: { mode: "on-the-ground" },
        outFields: ["mag", "place", "time"],
        renderer: {
          type: "simple",
          symbol: {
            type: "point-3d",
            symbolLayers: [{ type: "object", resource: { primitive: "cylinder" }, anchor: "bottom", width: 64000, depth: 64000, height: 100000, material: { color: [255, 150, 90, 0.92] } }],
          },
          visualVariables: [
            { type: "size", field: "mag", axis: "height", stops: [{ value: 2.5, size: 30000 }, { value: 4.5, size: 170000 }, { value: 6, size: 550000 }, { value: 7.5, size: 1500000 }] },
            { type: "size", axis: "width-and-depth", useSymbolValue: true },
            { type: "color", field: "mag", stops: [{ value: 2.5, color: [255, 209, 102, 0.9] }, { value: 4.5, color: [255, 140, 80, 0.92] }, { value: 6.5, color: [255, 70, 70, 0.95] }] },
          ],
        },
        popupTemplate: {
          title: "M{mag}, {place}",
          content: (f) => `<p>${new Date(f.graphic.attributes.time).toUTCString()}</p><p style="opacity:.7;font-size:12px">USGS GeoJSON feed</p>`,
        },
        visible: false,
      });
      map.add(quakesLayer, 0);
      return quakesLayer;
    }

    // ---------------------------------------------------- career arcs
    const KARACHI = [67.0011, 24.8607];
    const ARCS = [
      { to: [151.2093, -33.8688], dashed: false, phase: 0 },   // Nasfia, Sydney
      { to: [-79.5083, 43.8361], dashed: true, phase: 0.35 },  // Intellyct, remote
      { to: [46.6753, 24.7136], dashed: false, phase: 0.7 },   // relocation to Riyadh
    ].map((a) => ({ ...a, pts: greatCircle(KARACHI, a.to, 120, 0.12, 1400000) }));
    const careerFlow = makeFlow(arcsLayer, ARCS, { period: 3600, len: 9, symbol: lineSym([240, 255, 245, 1], 4.5) });
    let arcAnim = 0;
    function drawArcs() {
      cancelAnimationFrame(arcAnim);
      careerFlow.stop();
      arcsLayer.removeAll();
      const graphics = ARCS.map((a) => {
        const g = new Graphic({ symbol: lineSym([139, 211, 160, 0.85], 2.2, a.dashed ? "dash" : null) });
        arcsLayer.add(g);
        return g;
      });
      const setProgress = (p) => ARCS.forEach((a, i) => {
        const k = Math.max(2, Math.round(a.pts.length * p));
        graphics[i].geometry = new Polyline({ paths: [a.pts.slice(0, k)], hasZ: true, spatialReference: sr });
      });
      if (reduced) { setProgress(1); return; }
      const start = performance.now(), dur = 2200;
      const frame = (now) => {
        const p = Math.min(1, (now - start) / dur);
        setProgress(1 - Math.pow(1 - p, 3));
        if (p < 1) arcAnim = requestAnimationFrame(frame);
        else if (state.career) careerFlow.start();
      };
      arcAnim = requestAnimationFrame(frame);
    }

    // ------------------------------------- CLS: lookups converging on NIC
    const SPOKES = CLS_CITIES.filter((c) => c.name !== "Riyadh").map((c, i) => ({
      pts: greatCircle([c.lon, c.lat], NIC, 48, 0.16, 110000),
      phase: (i * 0.381) % 1,
    }));
    SPOKES.forEach((s) => clsFlowLayer.add(new Graphic({
      geometry: new Polyline({ paths: [s.pts], hasZ: true, spatialReference: sr }),
      symbol: lineSym([139, 211, 160, 0.75], 1.5),
    })));
    const clsFlow = makeFlow(clsFlowLayer, SPOKES, { period: 2600, len: 6, symbol: lineSym([225, 255, 235, 1], 3) });

    // ------------------------------------------------ layer visibility
    const LAYERS = {
      clients: () => [clientsLayer],
      licenses: () => [licLayer],
      career: () => [placesLayer, arcsLayer],
      coverage: () => [ksaLayer, clsCitiesLayer, clsFlowLayer],
      buildings: () => (buildingsLayer ? [buildingsLayer] : []),
      quakes: () => [ensureQuakes()],
      iss: () => [issLayer],
    };
    const state = { clients: false, licenses: false, coverage: false, career: false, buildings: false, quakes: false, iss: false };
    const boxes = Array.from(document.querySelectorAll("[data-layer]"));

    function applyLayers() {
      for (const key of Object.keys(state)) {
        if (key === "quakes" && !state.quakes && !quakesLayer) continue;
        if (key === "buildings" && state.buildings) ensureBuildings();
        LAYERS[key]().forEach((l) => { l.visible = state[key]; });
      }
      boxes.forEach((b) => { b.checked = b.dataset.layer === "graticule" ? gratLayer.visible : state[b.dataset.layer]; });
      if (state.career) { if (!arcsLayer.graphics.length) drawArcs(); else careerFlow.start(); } else careerFlow.stop();
      if (state.coverage) clsFlow.start(); else clsFlow.stop();
      issWanted = state.iss;
      syncIssPolling();
    }
    boxes.forEach((b) => b.addEventListener("change", () => {
      if (b.dataset.layer === "graticule") { gratLayer.visible = b.checked; return; }
      state[b.dataset.layer] = b.checked;
      if (b.dataset.layer === "licenses" && b.checked && !licLayer.graphics.length) runDeduction();
      applyLayers();
    }));

    // ------------------------------------------- basemap switcher
    document.querySelectorAll("[data-basemap]").forEach((btn) => btn.addEventListener("click", () => {
      map.basemap = basemaps[btn.dataset.basemap];
      document.querySelectorAll("[data-basemap]").forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
    }));
    if (window.innerWidth >= 1200) $("layerPanel").open = true;

    // ------------------------------------------------- sun and shadows
    const SUN_DAY = Date.UTC(2026, 2, 20); // equinox: even light in both hemispheres
    const slider = $("sunSlider"), sunLabel = $("sunLabel");
    const hhmm = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
    function setLight(spec, lon) {
      if (spec === "fixed") {
        view.environment.lighting = { type: "virtual", directShadowsEnabled: false };
        sunLabel.textContent = "fixed light";
        return;
      }
      const date = spec === "now" ? new Date() : new Date(SUN_DAY + (spec - lon / 15) * 3600000);
      view.environment.lighting = { type: "sun", date, directShadowsEnabled: !isMobile && spec !== "now", cameraTrackingEnabled: false };
      if (spec === "now") sunLabel.textContent = "now, UTC " + date.toISOString().slice(11, 16);
      else { sunLabel.textContent = hhmm(spec) + " local solar"; slider.value = spec; }
    }
    slider.addEventListener("input", () => { if (view.center) setLight(Number(slider.value), view.center.longitude); });

    // ------------------------------------- spatial auto-deduction demo
    const poly = (ring) => new Polygon({ rings: [ring], spatialReference: sr });
    const volume = (h, c, edge) => ({
      type: "polygon-3d",
      symbolLayers: [{ type: "extrude", size: h, material: { color: c }, edges: { type: "solid", color: edge, size: 1.4 } }],
    });
    const tag = (text, color = "white") => ({
      type: "point-3d",
      symbolLayers: [{ type: "text", text, material: { color }, halo: { color: [0, 0, 0, 0.85], size: 1.2 }, font: { family: "IBM Plex Mono", weight: "bold" }, size: 9.5 }],
      verticalOffset: { screenLength: 60, maxWorldLength: 9000, minWorldLength: 2600 },
      callout: { type: "line", size: 0.8, color: [255, 255, 255, 0.75] },
    });

    const existing = EXISTING.map((e) => poly(e.ring));
    const appGeom = poly(APPLICATION.ring);
    const union = geometryEngine.union(existing);
    const overlapGeom = geometryEngine.intersect(appGeom, union);
    const resultGeom = geometryEngine.difference(appGeom, union);
    const km2 = (g) => geometryEngine.geodesicArea(g, "square-kilometers");
    const conflicts = existing.filter((g) => geometryEngine.intersects(appGeom, g)).length;
    const appArea = km2(appGeom), overlapArea = km2(overlapGeom), resultArea = km2(resultGeom);

    // Extrusion heights in metres. Exaggerated so the volumes read from 40 km up.
    const HEIGHT = { existing: 900, applied: 1300, overlap: 2200, result: 1500 };
    const SYM = {
      existing: (h) => volume(h, [236, 214, 170, 0.5], [255, 240, 205, 0.95]),
      applied: (h) => volume(h, [255, 255, 255, 0.22], [255, 255, 255, 0.9]),
      overlap: (h) => volume(h, [255, 70, 70, 0.72], [255, 170, 170, 1]),
      result: (h) => volume(h, [77, 163, 255, 0.62], [185, 220, 255, 1]),
    };
    const existingGraphics = EXISTING.flatMap((e, i) => [
      new Graphic({ geometry: existing[i], symbol: SYM.existing(HEIGHT.existing) }),
      new Graphic({ geometry: existing[i].centroid, symbol: tag(e.id, "#f3e2bd") }),
    ]);
    const appVolume = new Graphic({ geometry: appGeom });
    const appGraphics = [
      appVolume,
      new Graphic({ geometry: new Polyline({ paths: [APPLICATION.ring], spatialReference: sr }), symbol: lineSym("white", 2, "dash") }),
      new Graphic({ geometry: appGeom.centroid, symbol: tag(APPLICATION.id) }),
    ];
    const overlapGraphic = new Graphic({ geometry: overlapGeom });
    const resultVolume = new Graphic({ geometry: resultGeom });
    const resultGraphics = [resultVolume, new Graphic({ geometry: resultGeom.centroid, symbol: tag(APPLICATION.id + " adjusted", "#d6e9ff") })];

    const steps = Array.from(document.querySelectorAll("#deductionSteps li"));
    let deductionRun = 0;
    let deductionTimers = [];
    function grow(graphic, make, to, run, dur = 900) {
      if (reduced) { graphic.symbol = make(to); return; }
      const t0 = performance.now();
      const frame = (now) => {
        if (run !== deductionRun) return;
        const p = Math.min(1, (now - t0) / dur);
        graphic.symbol = make(Math.max(1, to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(frame);
      };
      graphic.symbol = make(1);
      requestAnimationFrame(frame);
    }
    function runDeduction() {
      const run = ++deductionRun;
      deductionTimers.forEach(clearTimeout);
      deductionTimers = [];
      const at = (ms, fn) => deductionTimers.push(setTimeout(() => run === deductionRun && fn(), reduced ? 0 : ms));
      steps.forEach((s) => s.classList.remove("on", "done"));
      $("overlapOut").textContent = "";
      $("resultOut").textContent = "";
      licLayer.removeAll();
      licLayer.addMany(existingGraphics);

      at(700, () => {
        licLayer.addMany(appGraphics);
        grow(appVolume, SYM.applied, HEIGHT.applied, run);
        steps[0].classList.add("on", "done");
      });
      at(2100, () => {
        licLayer.add(overlapGraphic);
        grow(overlapGraphic, SYM.overlap, HEIGHT.overlap, run);
        steps[1].classList.add("on", "done");
        $("overlapOut").textContent = `${conflicts} licenses intersect, ${overlapArea.toFixed(1)} km² in conflict`;
      });
      at(3900, () => {
        licLayer.removeMany([...appGraphics, overlapGraphic]);
        licLayer.addMany(resultGraphics);
        grow(resultVolume, SYM.result, HEIGHT.result, run);
        steps[2].classList.add("on", "done");
        const trimmed = (overlapArea / appArea) * 100;
        $("resultOut").textContent = `${resultArea.toFixed(1)} of ${appArea.toFixed(1)} km² granted, ${trimmed.toFixed(0)}% trimmed`;
      });
    }
    $("replayDeduction").addEventListener("click", () => {
      state.licenses = true;
      applyLayers();
      flyTo("esnad");
      runDeduction();
    });

    // ------------------------------------- ISS: position, nadir line, track
    const issGraphic = new Graphic({
      symbol: { type: "point-3d", symbolLayers: [{ type: "icon", resource: { primitive: "kite" }, material: { color: "white" }, outline: { color: "#8bd3a0", size: 2 }, size: 16 }] },
      popupTemplate: { title: "International Space Station", content: "Position refreshed every 5 seconds from api.wheretheiss.at" },
    });
    const trailGraphic = new Graphic({ symbol: lineSym([139, 211, 160, 0.8], 2) });
    const nadirGraphic = new Graphic({ symbol: lineSym([255, 255, 255, 0.7], 1, "short-dot") });
    const trail = [[]];
    issHook = (d) => {
      const pt = [d.longitude, d.latitude, d.altitude * 1000];
      const seg = trail[trail.length - 1];
      const prev = seg[seg.length - 1];
      if (prev && Math.abs(prev[0] - pt[0]) > 180) trail.push([pt]); // crossed the antimeridian
      else seg.push(pt);
      while (trail.reduce((n, s) => n + s.length, 0) > 120) { trail[0].shift(); if (!trail[0].length) trail.shift(); }
      issGraphic.geometry = new Point({ longitude: pt[0], latitude: pt[1], z: pt[2] });
      nadirGraphic.geometry = new Polyline({ paths: [[[pt[0], pt[1], 0], pt]], hasZ: true, spatialReference: sr });
      const paths = trail.filter((s) => s.length > 1);
      if (paths.length) trailGraphic.geometry = new Polyline({ paths, hasZ: true, spatialReference: sr });
      if (!issLayer.graphics.includes(issGraphic)) issLayer.addMany([nadirGraphic, issGraphic]);
      if (paths.length && !issLayer.graphics.includes(trailGraphic)) issLayer.add(trailGraphic, 0);
    };

    // --------------------------------------------------- camera + orbit
    let orbitFrame = 0;
    let userTookOver = false;
    function stopOrbit() { cancelAnimationFrame(orbitFrame); orbitFrame = 0; }
    function startOrbit(mode) {
      stopOrbit();
      if (!mode || reduced || userTookOver) return;
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(now - last, 50);
        last = now;
        if (!view.interacting && !view.animation) {
          if (mode === "globe") {
            const cam = view.camera.clone();
            cam.position.longitude -= dt * 0.004;
            view.camera = cam;
          } else {
            view.goTo({ center: view.center, heading: view.camera.heading + dt * 0.003, tilt: view.camera.tilt }, { animate: false }).catch(() => {});
          }
        }
        orbitFrame = requestAnimationFrame(step);
      };
      orbitFrame = requestAnimationFrame(step);
    }
    ["drag", "mouse-wheel", "double-click", "key-down"].forEach((evt) => view.on(evt, () => { userTookOver = true; stopOrbit(); }));

    function flyTo(id) {
      const ch = CHAPTERS[id];
      stopOrbit();
      const opts = reduced ? { animate: false } : { maxDuration: 4500, easing: "in-out-coast-quadratic" };
      let eye = ch.eye;
      if (eye === "sunlit") {
        const d = new Date();
        const subsolar = -((d.getUTCHours() + d.getUTCMinutes() / 60) - 12) * 15;
        eye = [((subsolar + 55 + 540) % 360) - 180, 14, 16500000, 0];
      }
      const target = eye
        ? { position: new Point({ longitude: eye[0], latitude: eye[1], z: eye[2] }), tilt: eye[3], heading: 0 }
        : ch.view;
      view.goTo(target, opts)
        .then(() => { if (currentChapter === id) startOrbit(ch.orbit); })
        .catch(() => {});
    }

    function setChip(name, coord, no) {
      $("locName").textContent = name;
      $("locCoord").textContent = coord ? `${fmtLat(coord[1])} · ${fmtLon(coord[0])}` : "Real time · WGS 84";
      if (no != null) $("locNo").textContent = String(no).padStart(2, "0");
    }

    let ready = false;
    function onChapter(id) {
      const ch = CHAPTERS[id];
      if (!ch) return;
      setChip(ch.name, ch.coord, ORDER.indexOf(id));
      if (!ready) return;
      userTookOver = false;
      view.closePopup && view.closePopup();
      Object.keys(state).forEach((k) => { state[k] = ch.layers.includes(k) && !(k === "buildings" && isMobile); });
      applyLayers();
      setLight(ch.light, ch.view.center[0]);
      document.querySelectorAll("#clientTable tr.selected").forEach((r) => r.classList.remove("selected"));
      flyTo(id);
      if (ch.enter === "deduction") runDeduction();
      if (ch.enter === "arcs") drawArcs();
    }
    listeners.push(onChapter);

    // ---------------------------------------- client table → map
    document.querySelectorAll("#clientTable tbody tr").forEach((row) => {
      const go = () => {
        const c = CLIENTS.find((x) => x.ObjectID === Number(row.dataset.oid));
        if (!c || !ready) return;
        document.querySelectorAll("#clientTable tr.selected").forEach((r) => r.classList.remove("selected"));
        row.classList.add("selected");
        state.clients = true;
        state.buildings = !isMobile;
        applyLayers();
        setLight(15.5, c.lon);
        stopOrbit();
        userTookOver = true;
        setChip(c.full, [c.lon, c.lat]);
        const location = new Point({ longitude: c.lon, latitude: c.lat });
        view.goTo({ center: [c.lon, c.lat], zoom: 14, tilt: 62, heading: 0 }, reduced ? { animate: false } : { maxDuration: 3500 })
          .then(() => view.openPopup({ title: c.full, content: `<p>${c.work}</p><p style="opacity:.7;font-size:12px">${c.city} · approximate location</p>`, location }))
          .catch(() => {});
      };
      row.addEventListener("click", go);
      row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });

    // ----------------------------------------------------- status bar
    const hud = { lat: $("hudLat"), lon: $("hudLon"), elev: $("hudElev"), scale: $("hudScale"), alt: $("hudAlt"), hdg: $("hudHdg"), tilt: $("hudTilt") };
    let hovering = false;
    // Coarse terrain tiles return a no-data sentinel, so reject anything off the planet.
    const fmtElev = (z) => (Number.isFinite(z) && Math.abs(z) < 12000 ? `${nf.format(Math.round(z))} m` : "-");
    const setPoint = (p) => {
      if (!p) return;
      hud.lat.textContent = fmtLat(p.latitude);
      hud.lon.textContent = fmtLon(p.longitude);
      hud.elev.textContent = fmtElev(p.z);
    };
    reactiveUtils.watch(() => view.camera, (cam) => {
      if (!cam) return;
      const z = cam.position.z;
      hud.alt.textContent = z >= 10000 ? `${nf.format(Math.round(z / 1000))} km` : `${nf.format(Math.round(z))} m`;
      hud.hdg.textContent = `${Math.round(((cam.heading % 360) + 360) % 360)}°`;
      hud.tilt.textContent = `${Math.round(cam.tilt)}°`;
      hud.scale.textContent = view.scale ? `1:${nf.format(Math.round(view.scale))}` : "-";
      if (!hovering) setCenter();
    });
    // view.center carries no terrain height, so sample the ground for it.
    function setCenter() {
      const c = view.center;
      if (!c) return;
      let z = NaN;
      try { const s = view.groundView.elevationSampler.queryElevation(c); z = s ? s.z : NaN; } catch (e) { /* sampler not ready */ }
      hud.lat.textContent = fmtLat(c.latitude);
      hud.lon.textContent = fmtLon(c.longitude);
      hud.elev.textContent = fmtElev(z);
    }
    let pending = null;
    view.on("pointer-move", (e) => {
      if (pending) { pending = e; return; }
      pending = e;
      requestAnimationFrame(() => {
        const p = view.toMap({ x: pending.x, y: pending.y });
        pending = null;
        hovering = !!p;
        setPoint(p);
      });
    });
    view.on("pointer-leave", () => { hovering = false; setCenter(); });

    // ------------------------------------------------------- ready
    view.when(() => {
      ready = true;
      const done = () => $("mapLoading").classList.add("done");
      reactiveUtils.whenOnce(() => !view.updating).then(done);
      setTimeout(done, 9000);
      if (currentChapter) onChapter(currentChapter);
    }, fail);
  });
})();
