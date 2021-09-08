import { play } from "./Modules/play.js"

window.addEventListener('load', () => {
    let isFirstTime = true;

    const modal = document.getElementById("modal-box");
    const modalOpen = document.getElementById("modal-open");
    const modalClose = document.getElementById("modal-close");

    modal.style.top = `${modalOpen.getBoundingClientRect().top + modalOpen.offsetHeight}px`;
    modal.style.left = `${modalOpen.getBoundingClientRect().left}px`;
    modal.style.width = 0;
    modal.style.height = "3px";

    modalClose.addEventListener('click', function() {
        modal.classList.remove("is-open");
        modal.style.top = `${modalOpen.getBoundingClientRect().top + modalOpen.offsetHeight}px`;
        modal.style.left = `${modalOpen.getBoundingClientRect().left}px`;
        modal.style.width = 0;
        modal.style.height = "3px";
    });

    modalOpen.addEventListener('click', function() {
        if (isFirstTime) document.getElementById("modal-box-content").innerHTML = "";
        modal.classList.add("is-open");
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.width = "100%";
        modal.style.height = "100%";

        if (isFirstTime) {
            play(isFirstTime);
            isFirstTime = false;
        }
    });
})