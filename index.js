// ==== DOM Element References ====
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");

// ==== Constants and Initial Setup ====
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
let currentTab = userTab;
currentTab.classList.add("current-tab");

getCoordinatesFromSession();

// ==== Tab Switch Logic ====
function switchTab(newTab) {
    if (newTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = newTab;
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            // Switching to Search Tab
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            // Switching to User Weather Tab
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getCoordinatesFromSession();
        }
    }
}

// ==== Event Listeners for Tabs ====
userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

// ==== Session Storage Location Fetch ====
function getCoordinatesFromSession() {
    const storedCoords = sessionStorage.getItem("user-coordinates");
    if (!storedCoords) {
        grantAccessContainer.classList.add("active");
    } else {
        fetchUserWeatherInfo(JSON.parse(storedCoords));
    }
}

// ==== Fetch Weather by Coordinates ====
async function fetchUserWeatherInfo({ lat, lon }) {
    try {
        grantAccessContainer.classList.remove("active");
        loadingScreen.classList.add("active");

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active");
        alert("Failed to fetch your weather. Try again later.");
    }
}

// ==== Render Weather to UI ====
function renderWeatherInfo(info) {
    document.querySelector("[data-cityName]").innerText = info?.name || "Unknown";
    document.querySelector("[data-countryIcon]").src = `https://flagcdn.com/144x108/${info?.sys?.country?.toLowerCase()}.png`;
    document.querySelector("[data-weatherDesc]").innerText = info?.weather?.[0]?.description || "N/A";
    document.querySelector("[data-weatherIcon]").src = `http://openweathermap.org/img/w/${info?.weather?.[0]?.icon}.png`;
    document.querySelector("[data-temp]").innerText = `${info?.main?.temp} °C`;
    document.querySelector("[data-windspeed]").innerText = `${info?.wind?.speed} m/s`;
    document.querySelector("[data-humidity]").innerText = `${info?.main?.humidity}%`;
    document.querySelector("[data-cloudiness]").innerText = `${info?.clouds?.all}%`;
}

// ==== Get User Location ====
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(storeAndFetchLocation, () => {
            alert("Permission denied. Please allow location access.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function storeAndFetchLocation(position) {
    const coordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(coordinates));
    fetchUserWeatherInfo(coordinates);
}

// ==== Event Listeners ====
grantAccessButton.addEventListener("click", getLocation);

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (city) fetchWeatherByCity(city);
});

// ==== Fetch Weather by City Name ====
async function fetchWeatherByCity(city) {
    try {
        loadingScreen.classList.add("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        if (data.cod === "404") {
            alert("City not found. Please check your spelling.");
            loadingScreen.classList.remove("active");
            return;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active");
        alert("Failed to fetch weather info. Try again.");
    }
}
