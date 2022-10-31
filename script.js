//constants
const numberFormatter = new Intl.NumberFormat("pt-br");
const moneyFormatter = new Intl.NumberFormat("pt-br", {
  style: "currency",
  currency: "BRL",
});

//variables
let countryOrigin = document.querySelector("#country-origin");
let cityOrigin = document.querySelector("#city-origin");
let countryDestination = document.querySelector("#country-destination");
let cityDestination = document.querySelector("#city-destination");
let distance = 0;
let latOrigin = null;
let longOrigin = null;
let latDestination = null;
let longDestination = null;
let radioEconomyClass = document.querySelector("#economy-class");
let radioFirstClass = document.querySelector("#first-class");
let adults = document.querySelector("#number-adults");
let children = document.querySelector("#number-children");
let ticketCostAdult = 0;
let ticketCostChild = 0;
let totalCost = 0;
let results = document.querySelector("#results");
let countTotalTrips = document.querySelector("#countTotalTrips");
let miles = 0;
let milesCost = 0;

//auxiliar functions
function helperFormatValue(value) {
  return numberFormatter.format(value);
}

function helperFormatMoney(value) {
  return moneyFormatter.format(value);
}

//functions
function degreesToRadians(degreeValue) {
  return degreeValue * (Math.PI / 180);
}

function showMiles() {
  let showMiles = document.getElementById("showMiles");
  let miles = document.getElementById("miles");
  showMiles.innerText = miles.value;
}

function updateMilesInput(val) {
  miles = val;
  renderResults();
}

function ticketWithMiles() {
  milesCost = miles * 0.02;
  totalCost = totalCost - milesCost;
}

//start aplication
async function start() {
  await fetchCountries();
}

//get json info
async function fetchCountries() {
  const resource = await fetch("http://localhost:3000/countries");
  const json = await resource.json();
  allTrips = json;
  render();
}

// render functions

function render() {
  renderCountryOption();
  renderCityOption();
  renderLatLong();
  renderDistance();
  renderPrice();
  renderResults();
}

//get json info and render countries
function renderCountryOption() {
  let countriesHTML = "";

  allTrips.forEach((countryOption) => {
    const { country } = countryOption;
    const countryHTML = `<option value="${country}">${country}</option>`;
    countriesHTML += countryHTML;
  });

  countryOrigin.innerHTML = countriesHTML;
  countryDestination.innerHTML = countriesHTML;
}

//get json info and render cities
function renderCityOption() {
  let cityOriginHTML = "";
  let cityDestinationHTML = "";

  for (let i = 0; i < allTrips.length; i++) {
    if (allTrips[i].country === countryOrigin.value) {
      allTrips[i]["cities"].forEach((cityOption) => {
        const { city } = cityOption;
        const cityHTML = `<option value="${city}">${city}</option>`;
        cityOriginHTML += cityHTML;
      });
    }
    if (allTrips[i].country === countryDestination.value) {
      allTrips[i]["cities"].forEach((cityOption) => {
        const { city } = cityOption;
        const cityHTML = `<option value="${city}">${city}</option>`;
        cityDestinationHTML += cityHTML;
      });
    }
  }

  cityOrigin.innerHTML = cityOriginHTML;
  cityDestination.innerHTML = cityDestinationHTML;

  renderResults();
}

// get json info and render lat/long
function renderLatLong() {
  let cityOrig;
  for (let i = 0; i < allTrips.length; i++) {
    if (allTrips[i].country === countryOrigin.value) {
      cityOrig = allTrips[i]["cities"].find(
        (city) => city.city === cityOrigin.value
      );
    }
  }
  latOrigin = cityOrig.latitude;
  longOrigin = cityOrig.longitude;

  let cityDest;
  for (let i = 0; i < allTrips.length; i++) {
    if (allTrips[i].country === countryDestination.value) {
      cityDest = allTrips[i]["cities"].find(
        (city) => city.city === cityDestination.value
      );
    }
  }
  latDestination = cityDest.latitude;
  longDestination = cityDest.longitude;
}

// render distance
function renderDistance() {
  const EARTH_RADIUS = 6_371.071;
  const diffLatitudeRadians = degreesToRadians(latDestination - latOrigin);
  const diffLongitudeRadians = degreesToRadians(longDestination - longOrigin);
  const originLatitudeRadians = degreesToRadians(latOrigin);
  const destinationLatitudeRadians = degreesToRadians(latDestination);
  const kmDistance =
    2 *
    EARTH_RADIUS *
    Math.asin(
      Math.sqrt(
        Math.sin(diffLatitudeRadians / 2) * Math.sin(diffLatitudeRadians / 2) +
          Math.cos(originLatitudeRadians) *
            Math.cos(destinationLatitudeRadians) *
            Math.sin(diffLongitudeRadians / 2) *
            Math.sin(diffLongitudeRadians / 2)
      )
    );
  distance = kmDistance;
}

// Render price
function renderPrice() {
  countryOrigin.value === countryDestination.value
    ? (ticketCostAdult = distance * 0.3)
    : (ticketCostAdult = distance * 0.5);
  countryOrigin.value === countryDestination.value
    ? (ticketCostChild = distance * 0.15)
    : (ticketCostChild = distance * 0.25);

  if (radioFirstClass.checked) {
    ticketCostAdult = ticketCostAdult * 1.8;
    ticketCostChild = ticketCostChild * 1.4;
  }

  totalCost = ticketCostAdult * adults.value + ticketCostChild * children.value;

  miles !== 0 && ticketWithMiles();
}

//Template literals with results
function renderResults() {
  renderLatLong();
  renderDistance();
  renderPrice();

  if (cityOrigin.value === cityDestination.value) {
    results.innerHTML = `
    <h2 class="booking-title">Attention!</h2>
    <p class="booking-subtitle">It is not possible to travel to the same city</p>
    `;
  } else {
    results.innerHTML = `
    <h2 class="booking-title">Travel Details</h2>
    <p>From: ${countryOrigin.value} (${cityOrigin.value})</p>
    <p>To: ${countryDestination.value} (${cityDestination.value})</p>
    <p>Distance: ${helperFormatValue(distance)} km</p>
    <p>${helperFormatValue(adults.value)} Adult(s), ${helperFormatValue(
      children.value
    )} Children</p>
    <p>Flight: ${radioFirstClass.checked ? "First Class" : "Coach"}</p>
    <p>${helperFormatMoney(ticketCostAdult)} per adult</p>
    <p>${helperFormatMoney(ticketCostChild)} per child</p>
    <p>Miles: ${helperFormatValue(miles)}</p>
    <p>Miles discount: ${helperFormatMoney(milesCost)}</p>
    <p>Total: ${helperFormatMoney(totalCost)}</p>
    `;
  }
}

start();
