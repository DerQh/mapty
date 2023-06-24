"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
let inputDistance = document.querySelector(".form__input--distance");
let inputDuration = document.querySelector(".form__input--duration");
let inputCadence = document.querySelector(".form__input--cadence");
let inputElevation = document.querySelector(".form__input--elevation");

let map, mapEvent;

// ---------------------------------------CLASSES------------------------------------------- //
class Workouts {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(distance, cordinates, duration) {
    this.distance = distance;
    this.cordinates = cordinates; // [lat, lng]
    this.duration = duration;
  }
}

class Running extends Workouts {
  constructor(distance, cordinates, duration, cadence) {
    super(distance, cordinates, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workouts {
  constructor(distance, cordinates, duration, elevationGain) {
    super(distance, cordinates, duration);
    this.elevationGain = elevationGain;
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const eveRun = new Running(4, [39, -29], 30, 178);
const eveCycle = new Cycling(4, [39, -29], 30, 500);
console.log(eveCycle);

// //////////////////////////////// ////// //////////////////////////////
class App {
  #map;
  #mapEvent;
  constructor() {
    this.getPosition();

    form.addEventListener("submit", this.newWorkout.bind(this));

    inputType.addEventListener("change", this.elevationFieldToggle);
  }
  getPosition() {
    //   third library leaflet  //
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this.loadMAp.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
  }
  loadMAp(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const location = `https://www.google.com/maps/@${latitude},${longitude}`;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13); // empty div in the html should have and ID - "MAP"

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // L.marker(coords).addTo(map).bindPopup("Current Location.").openPopup();

    this.#map.on("click", this.showForm.bind(this)); // bind the this keyword to the main object
  }
  showForm(mapE) {
    this.#mapEvent = mapE;
    // console.log(mapEvent);
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  elevationFieldToggle() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden"); // parent class
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }
  newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    e.preventDefault();

    //  get data from the form

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    //  if runnung , create running object
    if (type === "running") {
      const cadence = +inputCadence.value;
      //  check if data is valid
      if (!validInputs(distance, duration, cadence))
        return alert("Input has to be a positive number ! ");
    }
    //  if cycling , create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (!validInputs(distance, duration, elevation))
        return alert("Input has to be a positive number ! ");
    }
    // add new object to workout array
    // render workout on map as marker
    //  rendere workout on list

    console.log(this);
    // clear input fields
    inputDistance.value = inputDuration = inputCadence = inputElevation = "";
    // display marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Workout")
      .openPopup();
  }
}

//  ---------------------------------------------------------------------------------//
//  ----- create objects  --------//
const app = new App();
