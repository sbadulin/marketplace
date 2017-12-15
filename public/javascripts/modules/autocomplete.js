function autocomplete(input, latInput, lngInput) {
  if (!input) return; // если адрес не введен, то ничего не делаем
  const dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener("place_changed", () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  // отключаем сабмит при нажатии ввода
  input.on("keydown", e => {
    if (e.keyCode === 13) e.preventDefault();
  });
}

export default autocomplete;
