function getLocationTitle(type) {
  const city = localStorage.getItem("selectedCity");
  const area = localStorage.getItem("selectedArea");
  return `${type} in ${area}, ${city}`;
}
