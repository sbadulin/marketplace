import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { lat: 59.93, lng: 30.31 },
  zoom: 12
};

// центр СПБ по умолчанию
function loadPlaces(map, lat = 59.93, lng = 30.31) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    if (!places.length) {
      alert('Компаний не найдено!');
      return;
    }

    // задаем границы карты
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      bounds.extend(position);
      const marker = new google.maps.Marker({ map, position });
      marker.place = place;
      return marker;
    });

    // показываем инфо о компании по клику на маркере
    markers.forEach(marker =>
      marker.addListener('click', function() {
        const html = `
        <div class="popup">
          <a href="/stores/${this.place.slug}">
            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${
          this.place.name
        }" />
        <p>${this.place.name} - ${this.place.location.address}</p>
          </a>
        </div>`;
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      })
    );

    // задаем увеличение карты
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return;

  // создаем карту
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(
      map,
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
  });
}

export default makeMap;
