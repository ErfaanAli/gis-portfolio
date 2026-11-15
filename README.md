# Irfan Ali · GIS Developer resume

A resume laid out as a scrolling story beside a 3D scene ([ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/) 4.30 `SceneView`). The map moves to each project as you scroll:

- **ESNAD, mining licenses**: a spatial auto-deduction demo. Overlap and the adjusted geometry are computed in the browser with the ArcGIS geometry engine and drawn as extruded volumes on the terrain. The polygons are synthetic.
- **ESNAD, ArcGIS Enterprise**: isometric diagram of the HA/DR topology, with Riyadh in 3D buildings.
- **KIDANA / Ministry of Hajj**: Mina, Makkah on 3D terrain with sun shadows.
- **NIC Caller Location Service**: Kingdom-wide coverage with flow lines into Riyadh.
- **Career path**: great-circle arcs from Karachi, with 3D city views for Sydney and Vaughan.
- **Live feeds**: USGS earthquakes as columns scaled by magnitude, the ISS at its real altitude, and the current day/night line.

Map controls: basemap switch, layer toggles, a time-of-day slider for sun and shadows, and a status bar with coordinates, ground elevation, scale, heading and tilt.

**Live site:** https://erfaanali.github.io/gis-portfolio/

Plain HTML/CSS/JS with no build step. Deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`. No API keys: it uses Esri's public tile, elevation and OpenStreetMap 3D building services.

The software-engineering portfolio is a separate site: https://erfaanali.github.io/Portfolio/
