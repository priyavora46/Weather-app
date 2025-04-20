// const apiKey = "2e8b0acaba96aef90912797ba1492a6b";
// let currentData = null;
// let forecastData = null;

// async function getWeather() {
//   const city = document.getElementById("cityInput").value;
//   if (!city) {
//     alert("Please enter a city name!");
//     return;
//   }

//   const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
//   const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

//   try {
//     const [currentRes, forecastRes] = await Promise.all([
//       fetch(currentURL),
//       fetch(forecastURL)
//     ]);

//     currentData = await currentRes.json();
//     forecastData = await forecastRes.json();

//     if (currentRes.status !== 200 || forecastRes.status !== 200) {
//       alert("City not found!");
//       return;
//     }

//     showToday(); // Show current data immediately
//   } catch (err) {
//     console.error(err);
//     alert("Failed to fetch weather");
//   }
// }

// function showToday() {
//   if (!currentData) return;
//   document.getElementById("city").textContent = currentData.name;
//   document.getElementById("temp").textContent = `Temperature: ${currentData.main.temp}°C`;
//   document.getElementById("description").textContent = `Condition: ${currentData.weather[0].description}`;
//   document.getElementById("forecast").innerHTML = "";
// }

// function showTomorrow() {
//   if (!forecastData) return;

//   const tomorrow = new Date();
//   tomorrow.setDate(tomorrow.getDate() + 1);
//   const dateStr = tomorrow.toISOString().split("T")[0];

//   const entry = forecastData.list.find(item => item.dt_txt.startsWith(dateStr));
//   if (!entry) {
//     document.getElementById("forecast").innerHTML = "No data for tomorrow.";
//     return;
//   }

//   document.getElementById("city").textContent = forecastData.city.name;
//   document.getElementById("temp").textContent = `Temperature: ${entry.main.temp}°C`;
//   document.getElementById("description").textContent = `Condition: ${entry.weather[0].description}`;
//   document.getElementById("forecast").innerHTML = "";
// }

// function showNext5Days() {
//   if (!forecastData) return;

//   const daily = {};
//   forecastData.list.forEach(item => {
//     const date = item.dt_txt.split(" ")[0];
//     if (!daily[date]) {
//       daily[date] = item; // Pick first of the day
//     }
//   });

//   const days = Object.keys(daily).slice(1, 6); // Skip today
//   let html = "<h3>Upcoming 5 Days</h3>";
//   days.forEach(date => {
//     const item = daily[date];
//     html += `<p>${date}: ${item.main.temp}°C - ${item.weather[0].description}</p>`;
//   });

//   document.getElementById("forecast").innerHTML = html;
//   document.getElementById("temp").textContent = "";
//   document.getElementById("description").textContent = "";
// }
const apiKey = "badd4de0d1d3b90c438a5c3a8d6299e0"; // Updated to your newer API key
let currentData = null;
let forecastData = null;

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  document.getElementById("city").textContent = "Loading...";
  
  const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL)
    ]);

    if (currentRes.status !== 200 || forecastRes.status !== 200) {
      const errorData = await currentRes.json();
      document.getElementById("city").textContent = "Error";
      document.getElementById("temp").textContent = "";
      document.getElementById("description").textContent = errorData.message || "City not found!";
      document.getElementById("forecast").innerHTML = "";
      return;
    }

    currentData = await currentRes.json();
    forecastData = await forecastRes.json();

    showToday(); // Show current data immediately
  } catch (err) {
    console.error(err);
    document.getElementById("city").textContent = "Error";
    document.getElementById("temp").textContent = "";
    document.getElementById("description").textContent = "Failed to fetch weather data";
    document.getElementById("forecast").innerHTML = "";
  }
}

function showToday() {
  if (!currentData) return;
  
  document.getElementById("city").textContent = currentData.name;
  document.getElementById("temp").textContent = `Temperature: ${Math.round(currentData.main.temp)}°C`;
  document.getElementById("description").textContent = `Condition: ${currentData.weather[0].description}`;
  document.getElementById("forecast").innerHTML = "";
}

function showTomorrow() {
  if (!forecastData) return;

  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  // Find forecast entries for tomorrow
  const tomorrowEntries = forecastData.list.filter(item => item.dt_txt.startsWith(dateStr));
  
  if (tomorrowEntries.length === 0) {
    document.getElementById("forecast").innerHTML = "No data for tomorrow.";
    return;
  }

  // Use midday forecast if available, otherwise use first entry
  const middayEntry = tomorrowEntries.find(item => item.dt_txt.includes("12:00:00")) || tomorrowEntries[0];

  document.getElementById("city").textContent = forecastData.city.name;
  document.getElementById("temp").textContent = `Temperature: ${Math.round(middayEntry.main.temp)}°C`;
  document.getElementById("description").textContent = `Condition: ${middayEntry.weather[0].description}`;
  document.getElementById("forecast").innerHTML = "";
}

function showNext5Days() {
  if (!forecastData) return;

  const daily = {};
  const today = new Date().toISOString().split("T")[0];
  
  // Group forecasts by date
  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (date > today && (!daily[date] || item.dt_txt.includes("12:00:00"))) {
      // Prefer midday forecasts
      daily[date] = item;
    }
  });

  // Get the next 5 days
  const days = Object.keys(daily).sort().slice(0, 5);
  
  if (days.length === 0) {
    document.getElementById("forecast").innerHTML = "No forecast data available.";
    return;
  }

  let html = "<h5>5-Day Forecast</h5>";
  days.forEach(date => {
    const item = daily[date];
    const formattedDate = new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    html += `<div class="mb-2">
      <strong>${formattedDate}</strong>: ${Math.round(item.main.temp)}°C - ${item.weather[0].description}
    </div>`;
  });

  document.getElementById("city").textContent = forecastData.city.name;
  document.getElementById("forecast").innerHTML = html;
  document.getElementById("temp").textContent = "";
  document.getElementById("description").textContent = "";
}