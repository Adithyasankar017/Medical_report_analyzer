function loadData(type) {
  const city = localStorage.getItem("city");
  const area = localStorage.getItem("area");

  const url = `https://api.example.com/${type}?city=${city}&area=${area}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("list");
      container.innerHTML = "";

      data.forEach(item => {
        container.innerHTML += `
          <div class="info-card">
            <h3>${item.name}</h3>
            <p>${item.address}</p>
            <p>⭐ ${item.rating || "N/A"}</p>
            <p>📞 ${item.phone || "Not Available"}</p>
          </div>
        `;
      });
    })
    .catch(() => {
      document.getElementById("list").innerHTML =
        "<p style='text-align:center'>Unable to load data</p>";
    });
}

// Store city & area
document.addEventListener("change", () => {
  const city = document.getElementById("city");
  const area = document.getElementById("area");

  if (city && area) {
    localStorage.setItem("city", city.value);
    localStorage.setItem("area", area.value);
  }
});
