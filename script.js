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
class App {
  #map;
  #mapEvent;
  constructor() {
    this.getPosition();

    form.addEventListener("submit", this.newWorkout.bind(this));

    inputType.addEventListener("change", function () {
      inputElevation
        .closest(".form__row")
        .classList.toggle("form__row--hidden"); // parent class
      inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    });
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

    this.#map.on("click", function (mapE) {});
  }
  showForm() {
    this.#mapEvent = mapE;
    // console.log(mapEvent);
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  elevationFieldToggle() {}
  newWorkout(e) {
    e.preventDefault();
    console.log(this);
    // clear input fields
    inputDistance.value = inputDuration = inputCadence = inputElevation = "";
    // display marker
    const { lat, lng } = mapEvent.latlng;
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
