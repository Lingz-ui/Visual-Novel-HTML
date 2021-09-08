export const Delay = ms => new Promise(res => setTimeout(res, ms));

export const Intro = (introText) => {
    introText = introText.map(e => { return `<p class="intro-text">${e.title}</p><p class="intro-text" style="font-size: 48px">${e.content.replace(/\n/g, '<br>')}</p>` });
    return new Promise(async (resolve) => {
        let introBox = document.createElement("div");
        introBox.classList.add("intro-box");
        document.getElementById("modal-box-content").appendChild(introBox);
        await Delay(2000);
        for (let i = 0; i < introText.length; i++) {
            introBox.innerHTML = introText[i];
            introBox.style.opacity = "1";
            await Delay(3000);
            introBox.style.opacity = "0";
            await Delay(2000);
        }
        document.getElementById("modal-box-content").innerHTML = "";
        return resolve();
    })
}

export const Ending = async (novelBox) => {
    novelBox.style.opacity = "0";
    await Delay(2000);
    let endingBox = document.createElement("div");
    endingBox.classList.add("intro-box");
    document.getElementById("modal-box-content").appendChild(endingBox);
    await Delay(1000);
    for (let i = 0; i < endingText.length; i++) {
        endingBox.innerHTML = endingText[i];
        endingBox.style.opacity = "1";
        BGMManager.FadeOut(3000);
        await Delay(3000);
        endingBox.style.opacity = "0";
        await Delay(2000);
    }
    document.getElementById("modal-box-content").innerHTML = "";
}

export const GameOver = async (battleBox = null, BGMManager) => {
    if (battleBox == null) {
        battleBox.style.opacity = 0;
        Delay(1000);
    }
    BGMManager.FadeOut(1000);
    let modal = document.getElementById("modal-box-content");
    modal.innerHTML = "";
    let endingBox = document.createElement("div");
    endingBox.classList.add("intro-box");
    document.getElementById("modal-box-content").appendChild(endingBox);
    let btn = `<p class="intro-text" onclick="location.reload()">Chơi lại</p>`;
    endingBox.insertAdjacentHTML("afterbegin", btn);
}

export class LogManager {
    constructor() {
        this.board = null;
        this.color = "White";
    }
    Add(message, color = null) {
        if (!this.board) return;
        let html = `<p class="log-message" style="color: ${color||this.color};">${message}</p>`;
        this.board.insertAdjacentHTML('beforeend', html);
        this.board.scrollTop = this.board.scrollHeight;
    }
    SetBoard(board) {
        this.board = board;
    }
}