# Irfan Ali · GIS Developer resume

An interactive 3D map resume, built like an ArcGIS StoryMap. Scroll the story and a 3D globe ([ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/) `SceneView`) flies to each project:

- **ESNAD**: a live spatial auto-deduction demo (overlap check plus geometry difference computed in the browser with the ArcGIS geometry engine, on synthetic polygons)
- **KIDANA / Ministry of Hajj**: Mina, Makkah in 3D terrain
- **Riyadh**: client sites, airports, and NIC
- **Career path**: animated 3D great-circle arcs
- **Live layers**: real-time USGS earthquakes (GeoJSON feed) and the live ISS position

Other details: a topographic contour background generated with marching squares, a clickable attribute table, and a coordinates/altitude HUD.

**Live site:** https://erfaanali.github.io/gis-portfolio/

Plain HTML/CSS/JS with no build step. Deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`. No API keys needed: it uses Esri's public tile and elevation services.

The software-engineering portfolio is a separate site: https://erfaanali.github.io/Portfolio/
