function getCityData(city) {
  if (city === "Trivandrum") {
    return typeof trivandrumData !== "undefined" ? trivandrumData : null;
  }
  if (city === "Kochi") {
    return typeof kochiData !== "undefined" ? kochiData : null;
  }
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
  const container = document.getElementById("list");

  if (!container) {
    console.error("List container not found");
    return;
  }

  container.innerHTML = "";
  console.log("1");
  if (!cityData || !cityData[type] || cityData[type].length === 0) {
    container.innerHTML = "<p>No data available for this category.</p>";
    return;
  }
  console.log("2");
  cityData[type].forEach(function(item) {
    console.log(item);
    const card = document.createElement("div");
    card.className = "list-card";

    if (type === "tests") {

      card.innerHTML = `
        <h3>${item.name || "Test Name"}</h3>
        <p>${item.type || ""}</p>
        <p> &#x1F4B0 Price: &#x20B9 ${item.price || "Not Available"}</p>
      `;

    } else {

      card.innerHTML = `
        <h3>${item.name || "Name"}</h3>
        <p>${item.department || item.type || ""}</p>
        <p>${item.address || ""}</p>
        <p> &#x1F4DE ${item.phone || ""}</p>
      `;

    }

    container.appendChild(card);

  });

}