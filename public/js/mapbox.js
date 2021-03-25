/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZmVkZXJpY29naWw4NyIsImEiOiJja21rcHhzZWsxM3V5MnBsOG5kdzA0MWpqIn0.qetc_ZUPB0hiWVwjTxJJXw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/federicogil87/ckmkq0bik7ltt17n4uc1hmxxn',
    scrollZoom: false,
    // interactive: false,
    // zoom: 10,
    // center: [-0.1, 51.509],
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup to locations
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extemd map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      right: 100,
      left: 100,
    },
  });
};
