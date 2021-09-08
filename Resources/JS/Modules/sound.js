const bgmElement = document.getElementById("bgm");

export const BGMManager = {
    Play(src, currentTime = 0) {
        bgmElement.src = src;
        bgmElement.currentTime = currentTime;
        bgmElement.play();
        this.FadeIn();
    },
    Stop() {
        let time = bgmElement.currentTime;
        bgmElement.src = "";
        return time;
    },
    FadeOut(time = 1000) {
        if (bgmElement.volume > 0.01) {
            bgmElement.volume -= 0.01;
            setTimeout(() => this.FadeOut(time), Math.floor(time/100));
        }
        else {
            bgmElement.volume = 0;
        }
    },
    FadeIn(time = 1000) {
        if (bgmElement.volume < 0.99) {
            bgmElement.volume += 0.01;
            setTimeout(() => this.FadeIn(time), Math.floor(time/100));
        }
        else {
            bgmElement.volume = 1;
        }
    },
    IsChanged(url) {
        if (!url.startsWith("http")) url = `${location.protocol}//${location.host}${url}`;
        console.log(url, bgmElement.src)
        return !(url === bgmElement.src);
    }
}