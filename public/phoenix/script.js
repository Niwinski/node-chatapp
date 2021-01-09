const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");
const countdown = document.getElementById("countdown");
const loading = document.getElementById("loading");
const year = document.getElementById("year");

const currentYear = new Date().getFullYear();
console.log(currentYear);
//const target = new Date(currentYear + 1, 0);
const target = new Date("2021-01-25");
console.log(target);

setTimeout(() => {
    loading.remove();
    countdown.style.display = "flex";
}, 1100);

setInterval(() => {
    updateCountdown();
}, 1000);

updateCountdown = () => {
    const cur = new Date();
    let diff = Math.floor((target - cur) / 1000);

    seconds.innerText = String(diff % 60).padStart(2, "0");
    diff = Math.floor(diff / 60);
    minutes.innerText = String(diff % 60).padStart(2, "0");
    diff = Math.floor(diff / 60);
    hours.innerText = diff % 24;
    diff = Math.floor(diff / 24);
    days.innerText = diff;
};
