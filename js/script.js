function getCityData(city) {
  if (city === "Trivandrum") return trivandrumData;
  if (city === "Kochi") return kochiData;
  return null;
}

function loadData(type) {
  const city = localStorage.getItem("selectedCity");

  if (!city) {
    alert("Please select a city first");
    window.location.href = "index.html";
    return;
  }

  const cityData = getCityData(city);

  if (!cityData || !cityData[type]) {
    document.getElementById("list").innerHTML =
      "<p style='text-align:center'>No data available</p>";
    return;
  }

  const container = document.getElementById("list");
  container.innerHTML = "";

  cityData[type].forEach(item => {
    container.innerHTML += `
      <div class="info-card">
        <h3>${item.name}</h3>
        <p>${item.department || item.type || ""}</p>
        <p>📍 ${item.address}</p>
        <p>📞 ${item.phone}</p>
      </div>
    `;
  });
}
