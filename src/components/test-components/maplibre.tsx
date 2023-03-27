import React, {useEffect, useRef} from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

let MapLibre = ({view, setMap, hideControls, showGeolocation}) => {
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
    })
  }, [])

  return (
    <div className="maplibre" ref={mapContainer} style={{width: "100%", height: "500px"}} />
  )
}

export default MapLibre
