"use strict";

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
  setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${
      this.type === "running" ? "🏃🏿" : "🚴🏿‍♀️"
    } ${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workouts {
  type = "running";
  constructor(distance, cordinates, duration, cadence) {
    super(distance, cordinates, duration);
    this.cadence = cadence;
    this.calcPace();
    this.setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workouts {
  type = "cycling";
  constructor(distance, cordinates, duration, elevationGain) {
    super(distance, cordinates, duration);
    this.elevationGain = elevationGain;
    this.setDescription();
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const eveRun = new Running(4, [39, -29], 30, 178);
// const eveCycle = new Cycling(4, [39, -29], 30, 500);

// //////////////////////////////// ////// //////////////////////////////
class App {
  #map;
  #mapEvent;
  #workouts = [];

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
  hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }
  elevationFieldToggle() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden"); // parent class
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }
  newWorkout(e) {
    // helper funtion
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);
    e.preventDefault();

    //  get data from the form

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //  if runnung , create running object
    if (type === "running") {
      const cadence = +inputCadence.value;
      //  check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert("Input has to be a positive number ! ");
      workout = new Running(distance, [lat, lng], duration, cadence);
    }
    //  if cycling , create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (!validInputs(distance, duration, elevation))
        return alert("Input has to be a positive number ! ");
      workout = new Cycling(distance, [lat, lng], duration, elevation);
    }
    // add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);

    // render workout on map as marker
    this.renderWorkoutMarker(workout);

    //  rendere workout on list
    this.renderWorkout(workout);

    // clear input fields and hide form
    this.hideForm();
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.cordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.description)
      .openPopup();
  }
  renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}<" data-id="${workout.id}<">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === "running" ? "🏃‍♂️" : "🚴🏿‍♀️"
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
         <span class="workout__icon">⏱</span>
         <span class="workout__value">${workout.duration}</span>
         <span class="workout__unit">min</span>
      </div>`;

    if (workout.type === "running")
      html += `   
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    if (workout.type === "cycling")
      html += `   
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    form.insertAdjacentHTML("afterend", html);
  }
}

//  ---------------------------------------------------------------------------------//
//  ----- create objects  --------//
const app = new App();
