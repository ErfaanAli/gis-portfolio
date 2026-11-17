/* 3D StoryMap: ArcGIS Maps SDK for JavaScript 4.30 SceneView driven by scroll.
   Esri raster tile services and World Elevation are public, so no API key is needed. */
(function () {
  const $ = (id) => document.getElementById(id);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  const nf = new Intl.NumberFormat("en-US");

  // ---------------------------------------------------------------- data
  const CHAPTERS = {
    intro:     { name: "Arabian Peninsula", coord: [45.0792, 23.8859], view: { center: [46, 23], zoom: 2.6, tilt: 0, heading: 0 }, layers: ["clients"], orbit: "globe" },
    profile:   { name: "Kingdom of Saudi Arabia", coord: [45.0792, 23.8859], view: { center: [44.2, 23.0], zoom: 5.2, tilt: 32, heading: 0 }, layers: ["clients"] },
    esnad:     { name: "Arabian Shield · license demo", coord: [41.23, 23.505], view: { center: [41.235, 23.47], zoom: 10.6, tilt: 58, heading: 12 }, layers: ["licenses"], enter: "deduction" },
    kidana:    { name: "Mina, Makkah", coord: [39.8933, 21.4133], view: { center: [39.8933, 21.4133], zoom: 14.2, tilt: 68, heading: 60 }, layers: ["clients"], orbit: "heading" },
    riyadh:    { name: "Riyadh", coord: [46.6753, 24.7136], view: { center: [46.68, 24.8], zoom: 10.4, tilt: 58, heading: 350 }, layers: ["clients"] },
    cls:       { name: "Kingdom of Saudi Arabia · CLS coverage", coord: [45.0792, 23.8859], view: { center: [44.6, 23.6], zoom: 5, tilt: 38, heading: 0 }, layers: ["coverage"] },
    intellyct: { name: "Vaughan, Ontario, Canada", coord: [-79.5083, 43.8361], view: { center: [-79.45, 43.75], zoom: 9.6, tilt: 55, heading: 340 }, layers: ["career"], orbit: "heading" },
    nasfia:    { name: "Sydney, Australia", coord: [151.2093, -33.8688], view: { center: [151.21, -33.86], zoom: 12.2, tilt: 62, heading: 20 }, layers: ["career"], orbit: "heading" },
    career:    { name: "Karachi → Sydney → Canada → Riyadh", coord: [67.0011, 24.8607], view: { center: [75, 15], zoom: 2.3, tilt: 0, heading: 0 }, layers: ["career"], enter: "arcs", orbit: "globe" },
    skills:    { name: "Riyadh", coord: [46.6753, 24.7136], view: { center: [46.6753, 24.7136], zoom: 12.3, tilt: 72, heading: 300 }, layers: ["clients"], orbit: "heading" },
    live:      { name: "Global · live feeds", coord: null, view: { center: [55, 18], zoom: 2.1, tilt: 0, heading: 0 }, layers: ["quakes", "iss"], orbit: "globe" },
    education: { name: "FAST-NUCES, Karachi", coord: [67.2647, 24.8569], view: { center: [67.2647, 24.8569], zoom: 13.4, tilt: 55, heading: 20 }, layers: ["career"] },
    contact:   { name: "Riyadh, Saudi Arabia", coord: [46.6753, 24.7136], view: { center: [46.6753, 24.7136], zoom: 11, tilt: 62, heading: 330 }, layers: ["clients"], orbit: "heading" },
  };

  // City-level, approximate positions.
  const CLIENTS = [
    { ObjectID: 1, name: "ESNAD", full: "ESNAD · Saudi Mining Services Company", city: "Riyadh", lon: 46.64, lat: 24.77, work: "Mining license GIS portal, spatial auto deduction engine, ArcGIS Enterprise HA/DR" },
    { ObjectID: 2, name: "MIMR", full: "Ministry of Industry and Mineral Resources", city: "Riyadh", lon: 46.668, lat: 24.69, work: "Digital mining license issuance" },
    { ObjectID: 3, name: "KIDANA", full: "Ministry of Hajj · KIDANA", city: "Mina, Makkah", lon: 39.8933, lat: 21.4133, work: "KIDANA Permits: holy-site land allocation with approval workflows" },
    { ObjectID: 4, name: "Ministry of Culture", full: "Ministry of Culture", city: "Riyadh", lon: 46.7, lat: 24.65, work: "GIS delivery" },
    { ObjectID: 5, name: "SDAIA", full: "Saudi Data & AI Authority", city: "Riyadh", lon: 46.625, lat: 24.725, work: "GIS delivery" },
    { ObjectID: 6, name: "NIC", full: "National Information Center", city: "Riyadh HQ · service used Kingdom-wide", lon: 46.735, lat: 24.705, work: "Caller Location Service: 4 s → 0.44 ms" },
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

  // Major cities served by the Caller Location Service (it covers the whole Kingdom).
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
        ? `Strongest: M${strongest.properties.mag.toFixed(1)} · ${strongest.properties.place} · ${ago(strongest.properties.time)}`
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
      $("issMeta").textContent = `${nf.format(Math.round(d.altitude))} km up · ${nf.format(Math.round(d.velocity))} km/h · updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
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
    document.querySelector(".hud").hidden = true;
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
      qualityProfile: isMobile ? "low" : "high",
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

    // ------------------------------------------------------ layers
    const sr = { wkid: 4326 };
    const pointSymbol = (color) => ({
      type: "point-3d",
      symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color }, outline: { color: "white", size: 1.5 }, size: 12 }],
      verticalOffset: { screenLength: 34, maxWorldLength: 30000, minWorldLength: 30 },
      callout: { type: "line", size: 1.2, color: [255, 255, 255, 0.85], border: { color: [0, 0, 0, 0.35] } },
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
    let quakesLayer = null;

    const ksaLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0",
      definitionExpression: "ISO = 'SA'",
      title: "CLS coverage · Saudi Arabia",
      elevationInfo: { mode: "on-the-ground" },
      renderer: { type: "simple", symbol: { type: "polygon-3d", symbolLayers: [{ type: "fill", material: { color: [139, 211, 160, 0.28] }, outline: { color: [139, 211, 160, 1], size: 2 } }] } },
      popupTemplate: { title: "Caller Location Service", content: "Used across the whole Kingdom of Saudi Arabia." },
      visible: false,
    });
    const clsCitiesLayer = pointLayer(CLS_CITIES, "#8bd3a0", "CLS cities");
    clsCitiesLayer.renderer = {
      type: "simple",
      symbol: { type: "point-3d", symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color: [139, 211, 160, 0.95] }, outline: { color: "white", size: 1.2 }, size: 8 }] },
    };

    map.addMany([ksaLayer, licLayer, arcsLayer, placesLayer, clsCitiesLayer, clientsLayer, issLayer]);

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
          symbol: { type: "point-3d", symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color: [255, 93, 93, 0.72] }, outline: { color: [255, 210, 190, 0.9], size: 0.8 }, size: 6 }] },
          visualVariables: [{ type: "size", field: "mag", stops: [{ value: 2.5, size: 4 }, { value: 5, size: 12 }, { value: 7.5, size: 32 }] }],
        },
        popupTemplate: {
          title: "M{mag} · {place}",
          content: (f) => `<p>${new Date(f.graphic.attributes.time).toUTCString()}</p><p style="opacity:.7;font-size:12px">Live from the USGS GeoJSON feed</p>`,
        },
        visible: false,
      });
      map.add(quakesLayer, 0);
      return quakesLayer;
    }

    const LAYERS = {
      clients: () => [clientsLayer],
      licenses: () => [licLayer],
      career: () => [placesLayer, arcsLayer],
      coverage: () => [ksaLayer, clsCitiesLayer],
      quakes: () => [ensureQuakes()],
      iss: () => [issLayer],
    };
    const state = { clients: false, licenses: false, coverage: false, career: false, quakes: false, iss: false };
    const boxes = Array.from(document.querySelectorAll("[data-layer]"));

    function applyLayers() {
      for (const key of Object.keys(state)) {
        if (key === "quakes" && !state.quakes && !quakesLayer) continue;
        LAYERS[key]().forEach((l) => { l.visible = state[key]; });
      }
      boxes.forEach((b) => { b.checked = state[b.dataset.layer]; });
      issWanted = state.iss;
      syncIssPolling();
    }
    boxes.forEach((b) => b.addEventListener("change", () => {
      state[b.dataset.layer] = b.checked;
      if (b.dataset.layer === "career" && b.checked && !arcsLayer.graphics.length) drawArcs();
      if (b.dataset.layer === "licenses" && b.checked && !licLayer.graphics.length) runDeduction();
      applyLayers();
    }));

    // ------------------------------------------- basemap switcher
    document.querySelectorAll("[data-basemap]").forEach((btn) => btn.addEventListener("click", () => {
      map.basemap = basemaps[btn.dataset.basemap];
      document.querySelectorAll("[data-basemap]").forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
    }));
    if (window.innerWidth >= 1200) $("layerPanel").open = true;

    // ------------------------------------- spatial auto-deduction demo
    const poly = (ring) => new Polygon({ rings: [ring], spatialReference: sr });
    const fill = (c, o, w = 1.5) => ({ type: "polygon-3d", symbolLayers: [{ type: "fill", material: { color: c }, outline: { color: o, size: w } }] });
    const tag = (text, color = "white") => ({ type: "point-3d", symbolLayers: [{ type: "text", text, material: { color }, halo: { color: [0, 0, 0, 0.8], size: 1.2 }, font: { family: "IBM Plex Mono", weight: "bold" }, size: 9 }] });

    const existing = EXISTING.map((e) => poly(e.ring));
    const appGeom = poly(APPLICATION.ring);
    const union = geometryEngine.union(existing);
    const overlapGeom = geometryEngine.intersect(appGeom, union);
    const resultGeom = geometryEngine.difference(appGeom, union);
    const km2 = (g) => geometryEngine.geodesicArea(g, "square-kilometers");
    const conflicts = existing.filter((g) => geometryEngine.intersects(appGeom, g)).length;
    const appArea = km2(appGeom), overlapArea = km2(overlapGeom), resultArea = km2(resultGeom);

    const existingGraphics = EXISTING.flatMap((e, i) => [
      new Graphic({ geometry: existing[i], symbol: fill([245, 225, 185, 0.22], [255, 240, 205, 1], 2) }),
      new Graphic({ geometry: existing[i].centroid, symbol: tag(e.id, "#f0dcb4") }),
    ]);
    const appGraphics = [
      new Graphic({ geometry: appGeom, symbol: fill([255, 255, 255, 0.1], [0, 0, 0, 0], 0) }),
      new Graphic({
        geometry: new Polyline({ paths: [APPLICATION.ring], spatialReference: sr }),
        symbol: { type: "line-3d", symbolLayers: [{ type: "line", material: { color: "white" }, size: 2, pattern: { type: "style", style: "dash" } }] },
      }),
      new Graphic({ geometry: appGeom.centroid, symbol: tag(APPLICATION.id) }),
    ];
    const overlapGraphic = new Graphic({ geometry: overlapGeom, symbol: fill([255, 60, 60, 0.6], [255, 110, 110, 1]) });
    const resultGraphics = [
      new Graphic({ geometry: resultGeom, symbol: fill([77, 163, 255, 0.5], [150, 200, 255, 1], 2.5) }),
      new Graphic({ geometry: resultGeom.centroid, symbol: tag(APPLICATION.id + " ✓", "#cfe5ff") }),
    ];

    const steps = Array.from(document.querySelectorAll("#deductionSteps li"));
    let deductionRun = 0;
    let deductionTimers = [];
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
        steps[0].classList.add("on", "done");
      });
      at(1900, () => {
        licLayer.add(overlapGraphic);
        steps[1].classList.add("on", "done");
        $("overlapOut").textContent = `${conflicts} licenses intersect · ${overlapArea.toFixed(1)} km² in conflict`;
      });
      at(3300, () => {
        licLayer.removeMany([...appGraphics, overlapGraphic]);
        licLayer.addMany(resultGraphics);
        steps[2].classList.add("on", "done");
        const trimmed = (overlapArea / appArea) * 100;
        $("resultOut").textContent = `${resultArea.toFixed(1)} of ${appArea.toFixed(1)} km² granted · ${trimmed.toFixed(0)}% trimmed`;
      });
    }
    $("replayDeduction").addEventListener("click", () => {
      state.licenses = true;
      applyLayers();
      flyTo("esnad");
      runDeduction();
    });

    // ---------------------------------------------------- career arcs
    function greatCircle(a, b, n = 120) {
      const rad = Math.PI / 180;
      const vec = ([lon, lat]) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
      const A = vec(a), B = vec(b);
      const omega = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
      const peak = Math.min(omega * 6371000 * 0.12, 1400000);
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const s1 = Math.sin((1 - t) * omega) / Math.sin(omega), s2 = Math.sin(t * omega) / Math.sin(omega);
        const x = s1 * A[0] + s2 * B[0], y = s1 * A[1] + s2 * B[1], z = s1 * A[2] + s2 * B[2];
        pts.push([Math.atan2(y, x) / rad, Math.asin(z) / rad, 2000 + Math.sin(Math.PI * t) * peak]);
      }
      return pts;
    }
    const ARCS = [
      { from: [67.0011, 24.8607], to: [151.2093, -33.8688], dashed: false }, // Nasfia, Sydney
      { from: [67.0011, 24.8607], to: [-79.5083, 43.8361], dashed: true },  // Intellyct, remote
      { from: [67.0011, 24.8607], to: [46.6753, 24.7136], dashed: false },  // relocation
    ].map((a) => ({ ...a, pts: greatCircle(a.from, a.to) }));
    const arcSymbol = (dashed) => ({
      type: "line-3d",
      symbolLayers: [{ type: "line", size: 3, material: { color: [139, 211, 160, 0.95] }, cap: "round", join: "round", ...(dashed ? { pattern: { type: "style", style: "dash" } } : {}) }],
    });
    let arcAnim = 0;
    function drawArcs() {
      cancelAnimationFrame(arcAnim);
      arcsLayer.removeAll();
      const graphics = ARCS.map((a) => {
        const g = new Graphic({ symbol: arcSymbol(a.dashed) });
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
      };
      arcAnim = requestAnimationFrame(frame);
    }

    // -------------------------------------------------- ISS live point
    const issGraphic = new Graphic({
      symbol: {
        type: "point-3d",
        symbolLayers: [
          { type: "icon", resource: { primitive: "kite" }, material: { color: "white" }, outline: { color: "#8bd3a0", size: 2 }, size: 16 },
        ],
      },
      popupTemplate: { title: "International Space Station", content: "Live position, refreshed every 5 seconds from api.wheretheiss.at" },
    });
    const trailGraphic = new Graphic({ symbol: { type: "line-3d", symbolLayers: [{ type: "line", size: 2, material: { color: [139, 211, 160, 0.7] } }] } });
    const trail = [[]];
    issHook = (d) => {
      const pt = [d.longitude, d.latitude, d.altitude * 1000];
      const seg = trail[trail.length - 1];
      const prev = seg[seg.length - 1];
      if (prev && Math.abs(prev[0] - pt[0]) > 180) trail.push([pt]); // crossed the antimeridian
      else seg.push(pt);
      while (trail.reduce((n, s) => n + s.length, 0) > 120) { trail[0].shift(); if (!trail[0].length) trail.shift(); }
      issGraphic.geometry = new Point({ longitude: pt[0], latitude: pt[1], z: pt[2] });
      const paths = trail.filter((s) => s.length > 1);
      if (paths.length) trailGraphic.geometry = new Polyline({ paths, hasZ: true, spatialReference: sr });
      if (!issLayer.graphics.includes(issGraphic)) issLayer.add(issGraphic);
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
      view.goTo(ch.view, opts)
        .then(() => { if (currentChapter === id) startOrbit(ch.orbit); })
        .catch(() => {});
    }

    function setChip(name, coord) {
      $("locName").textContent = name;
      $("locCoord").textContent = coord ? `${fmtLat(coord[1])} · ${fmtLon(coord[0])}` : "REAL-TIME · WGS84";
    }

    let ready = false;
    function onChapter(id) {
      const ch = CHAPTERS[id];
      if (!ch) return;
      setChip(ch.name, ch.coord);
      if (!ready) return;
      userTookOver = false;
      view.closePopup && view.closePopup();
      Object.keys(state).forEach((k) => { state[k] = ch.layers.includes(k); });
      applyLayers();
      document.querySelectorAll("#clientTable tr.selected").forEach((r) => r.classList.remove("selected"));
      flyTo(id);
      if (ch.enter === "deduction") runDeduction();
      if (ch.enter === "arcs") drawArcs();
      else if (ch.layers.includes("career") && !arcsLayer.graphics.length) drawArcs();
    }
    listeners.push(onChapter);

    // ---------------------------------------- attribute table → map
    document.querySelectorAll("#clientTable tbody tr").forEach((row) => {
      const go = () => {
        const c = CLIENTS.find((x) => x.ObjectID === Number(row.dataset.oid));
        if (!c || !ready) return;
        document.querySelectorAll("#clientTable tr.selected").forEach((r) => r.classList.remove("selected"));
        row.classList.add("selected");
        state.clients = true;
        applyLayers();
        stopOrbit();
        userTookOver = true;
        setChip(c.full, [c.lon, c.lat]);
        const location = new Point({ longitude: c.lon, latitude: c.lat });
        view.goTo({ center: [c.lon, c.lat], zoom: 13, tilt: 60, heading: 0 }, reduced ? { animate: false } : { maxDuration: 3500 })
          .then(() => view.openPopup({ title: c.full, content: `<p>${c.work}</p><p style="opacity:.7;font-size:12px">${c.city} · approximate location</p>`, location }))
          .catch(() => {});
      };
      row.addEventListener("click", go);
      row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });

    // ------------------------------------------------------------ HUD
    const hud = { lat: $("hudLat"), lon: $("hudLon"), alt: $("hudAlt"), hdg: $("hudHdg"), tilt: $("hudTilt") };
    let hovering = false;
    const setLatLon = (p) => { if (p) { hud.lat.textContent = fmtLat(p.latitude); hud.lon.textContent = fmtLon(p.longitude); } };
    reactiveUtils.watch(() => view.camera, (cam) => {
      if (!cam) return;
      const z = cam.position.z;
      hud.alt.textContent = z >= 10000 ? `${nf.format(Math.round(z / 1000))} km` : `${nf.format(Math.round(z))} m`;
      hud.hdg.textContent = `${Math.round(((cam.heading % 360) + 360) % 360)}°`;
      hud.tilt.textContent = `${Math.round(cam.tilt)}°`;
      if (!hovering && view.center) setLatLon(view.center);
    });
    let pending = null;
    view.on("pointer-move", (e) => {
      if (pending) { pending = e; return; }
      pending = e;
      requestAnimationFrame(() => {
        const p = view.toMap({ x: pending.x, y: pending.y });
        pending = null;
        hovering = !!p;
        setLatLon(p);
      });
    });
    view.on("pointer-leave", () => { hovering = false; if (view.center) setLatLon(view.center); });

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
