import React, {useEffect, useRef} from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// TODO: Create 
const locationData = require('../../data/locations.sheet.json')
const geoData = []
for (let loc in locationData){
  let thisLoc = locationData[loc]
  geoData.push({
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [thisLoc.Lng, thisLoc.Lat]
    }
  })
}

let MapLibre2 = ({view, setMap, hideControls, showGeolocation}) => {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  if (!view){
    view = {
      zoom: 5,
      center: [-122.44, 37.77]
    }
  }

  useEffect(() => {
    if (mapContainer.current) {
      // Instantiate the map - heck yeah, it's free!
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current, // container id
        style: "https://files.sfchronicle.com/static-assets/tiles/pale-northam.json",
        center: view.center, // starting position [lng, lat]
        zoom: view.zoom, // starting zoom
        cooperativeGestures: true
      });
    }

    // Add a geojson source
    mapRef.current.on('load', () => {
      // Set the map as parent state so we can manipulate from there
      if (setMap){
        setMap(mapRef.current)
      }

      // Show controls (unless hidden)
      if (!hideControls){
        const nav = new maplibregl.NavigationControl({showCompass: false})
        mapRef.current.addControl(nav, 'top-right')
      }

      // Show geolocation only if requested
      if (showGeolocation){
        const geo = new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        })
        mapRef.current.addControl(geo, 'top-left')
      }

      // Add points
      mapRef.current.addSource('point-data', {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": geoData
        }
      })

      mapRef.current.addLayer({
        id: 'points-of-interest',
        source: 'point-data',
        type: 'circle',
        paint: {
          'circle-radius': 10,
          'circle-opacity': 0.5,
          'circle-color': "#666",
          'circle-stroke-width': 1,
          "circle-stroke-color": "#000"
        // Mapbox Style Specification paint properties
        },
        layout: {
        // Mapbox Style Specification layout properties
        }
      });
    })
  }, [])

  return (
    <div className="maplibre" ref={mapContainer} style={{width: "100%", height: "500px"}} />
  )
}

export default MapLibre2
