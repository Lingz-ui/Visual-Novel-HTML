import { BGMManager } from "./sound.js"
import { Character } from "./character.js"
import { Delay, Intro, Ending, GameOver, LogManager } from "./exts.js"
import { intros, scenes } from "./scene.js"

let isBattleTime = false;
let battleToScene = false;
let isTyping = false;
let isPlayerTurn = false;
let isTransiting = false;

let bgmTime = 0;
let battleBox;
let Log = new LogManager();
let playerCharacter, enemyCharacter, pHpBar, eHpBar, pHit, eHit;
let index, context, scene;

let modalBoxContent = document.getElementById("modal-box-content");

const commands = {
    attack(attacking, attacked) {
        let attack = attacking.Attack();
        let result = attacked.TakenDmg(attack.dmg);
        if (attack.shield) {
            this.healing(attacking, 2);
        }
        healthBar(attacked.HPBar, attacked.HPHit, result.oldHP, attacked.TotalHP, result.oldHP - result.newHP);
        let logMsg = `<i class="fas fa-jedi"></i> ${attacking.Name} tấn công, gây ${result.oldHP - result.newHP}${result.shield ? " (do đối phương đang phòng ngự)" : ""} sát thương lên ${attacked.Name}!`;
        Log.Add(logMsg, "Red");
        return result;
    },
    defense(defender) {
        let result = defender.Shield();
        if (result.shield) {
            this.healing(defender, 2);
        }
        let logMsg = `<i class="fas fa-shield-alt"></i> ${defender.Name} phòng ngự, nếu trong lượt tiếp theo bị tấn công sẽ giảm ${result.percent}% sát thương!`;
        Log.Add(logMsg, "CornflowerBlue");
        return result;
    },
    healing(healer, hp = null) {
        let result = hp ? healer.Heal({percent: hp}) : healer.Heal();
        if (result.shield) {
            this.healing(healer, 2);
        }
        healthBar(healer.HPBar, healer.HPHit, result.oldHP, healer.TotalHP, result.oldHP - result.newHP);
        let logMsg = `<i class="fas fa-heart"></i> ${hp ? "Do không bị tấn công, " : ""}${healer.Name} hồi phục ${result.percent}% (${result.newHP - result.oldHP}) sinh lực!`;
        Log.Add(logMsg, "Green");
        return result;
    }
}

export const play = async () => {
    await Intro(intros);
    index = 0, context = 0;
    scene = scenes[index];
    //visual novel

    let novelBox = document.createElement("div");
    novelBox.classList.add("novel-box");
    novelBox.style.backgroundImage = `url('${scene.background}')`;
    modalBoxContent.appendChild(novelBox);
    await Delay(1000);

    BGMManager.Play(scene.bgm.url);

    let bodyDiv = document.createElement("div");
    bodyDiv.classList.add("body-area");
    novelBox.appendChild(bodyDiv);
    novelBox.style.opacity = "1";

    let bodyImg = document.createElement("img");
    bodyImg.classList.add("body-img");
    if (scene.contexts[context].body) {
        bodyImg.src =  `${scene.contexts[context].body}`;
        bodyDiv.style.opacity = "1";
    }
    bodyDiv.appendChild(bodyImg);

    let msgDiv = document.createElement("div");
    msgDiv.classList.add("message-area");
    novelBox.appendChild(msgDiv);

    let msgBox = document.createElement("div");
    msgBox.classList.add("message-box");
    msgDiv.appendChild(msgBox);

    let avatarBox = document.createElement("div");
    avatarBox.classList.add("avatar-box");
    msgDiv.appendChild(avatarBox);

    let avatarImg = document.createElement("img");
    avatarImg.classList.add("avatar-img");
    avatarImg.src = `${scene.contexts[context].portrait}`;
    avatarBox.appendChild(avatarImg);

    let msg = document.createElement("p");
    msg.classList.add("message");
    msgBox.appendChild(msg);

    //battle
    battleBox = document.createElement("div");
    battleBox.classList.add("battle-box");
    modalBoxContent.appendChild(battleBox);

    let blackBoard = document.createElement("div");
    blackBoard.classList.add("black-board");
    battleBox.appendChild(blackBoard);
    Log.SetBoard(blackBoard);

    let bAvatarBox = document.createElement("div");
    bAvatarBox.classList.add("battle-avatar-box");
    battleBox.appendChild(bAvatarBox);

    let bAvatarImg = document.createElement("img");
    bAvatarImg.classList.add("avatar-img");
    bAvatarBox.appendChild(bAvatarImg);

    let bBodyDiv = document.createElement("div");
    bBodyDiv.classList.add("enemy-area");
    battleBox.appendChild(bBodyDiv);

    let bBodyImg = document.createElement("img");
    bBodyImg.classList.add("body-img");
    bBodyDiv.appendChild(bBodyImg);

    //player hp bar
    let pHpWrapper = document.createElement("div");
    pHpWrapper.classList.add("player-hp");
    battleBox.appendChild(pHpWrapper);

    let pHealthBar = document.createElement("div");
    pHealthBar.classList.add("health-bar");
    pHpWrapper.appendChild(pHealthBar);

    pHpBar = document.createElement("div");
    pHpBar.classList.add("hp-bar");
    pHealthBar.appendChild(pHpBar);

    pHit = document.createElement("div");
    pHit.classList.add("hp-hit");
    pHpBar.appendChild(pHit);

    //enemy hp bar
    let eHpWrapper = document.createElement("div");
    eHpWrapper.classList.add("enemy-hp");
    battleBox.appendChild(eHpWrapper);

    let eHealthBar = document.createElement("div");
    eHealthBar.classList.add("health-bar");
    eHpWrapper.appendChild(eHealthBar);

    eHpBar = document.createElement("div");
    eHpBar.classList.add("hp-bar");
    eHealthBar.appendChild(eHpBar);

    eHit = document.createElement("div");
    eHit.classList.add("hp-hit");
    eHpBar.appendChild(eHit);

    let cmds = `
        <div class="command-area">
            <div class="icon-btn" id="atk-btn"><i class="fas fa-jedi"></i><span class="hint-radius"></span><div class="hint-content"><p id="playerAtkTooltip"></p></div></div>
            <div class="icon-btn" id="def-btn"><i class="fas fa-shield-alt"></i><span class="hint-radius"></span><div class="hint-content"><p id="playerDefTooltip"></p></div></div>
            <div class="icon-btn" id="heal-btn"><i class="fas fa-heart"></i><span class="hint-radius"></span><div class="hint-content"><p id="playerHealTooltip"></p></div></div>
        </div>`;
    battleBox.insertAdjacentHTML('beforeend', cmds);
    let playerAtkTooltip = document.getElementById("playerAtkTooltip");
    let playerDefTooltip = document.getElementById("playerDefTooltip");
    let playerHealTooltip = document.getElementById("playerHealTooltip");

    //Attack
    document.getElementById("atk-btn").onclick = () => {
        if (!isBattleTime || !isPlayerTurn || !playerCharacter || !enemyCharacter) return;
        let result = commands.attack(playerCharacter, enemyCharacter);
        isPlayerTurn = false;
        return enemyTurn();
    }
    //Defense
    document.getElementById("def-btn").onclick = () => {
        if (!isBattleTime || !isPlayerTurn || !playerCharacter || !enemyCharacter) return;
        let result = commands.defense(playerCharacter);
        isPlayerTurn = false;
        return enemyTurn();
    }
    //Healing
    document.getElementById("heal-btn").onclick = () => {
        if (!isBattleTime || !isPlayerTurn || !playerCharacter || !enemyCharacter) return;
        let result = commands.healing(playerCharacter);
        isPlayerTurn = false;
        return enemyTurn();
    }

    await Delay(1000);
    msgBox.style.opacity = "1";
    avatarBox.style.opacity = "1";
    await Delay(1000);
    writer(msg, scene.contexts[context].message);

    novelBox.addEventListener('click', async function() {
        if (isTransiting||isBattleTime) return;
        if (context > scene.contexts.length - 1) {
            context = 0;
            msg.innerHTML = "";
            scene = scenes[++index];
            if (scene.ending) {
                isTransiting = true;
                return Ending(novelBox);
            };
            if (scene.battle) {
                isBattleTime = true;
                battleBox.style.backgroundImage = `url('${scene.background}')`;
                bAvatarImg.src = `${scene.player}`;
                bBodyImg.src =  `${scene.enemy}`;
                blackBoard.innerHTML = "";
                modalBoxContent.style.transform = "rotateY(180deg)";
                if (scene.bgm) {
                    BGMManager.FadeOut(800);
                    setTimeout(() => {
                        bgmTime = BGMManager.Stop();
                        if (scene.bgm.time) BGMManager.Play(scene.bgm.url, scene.bgm.time||null);
                        else BGMManager.Play(scene.bgm.url);
                    }, 1000);
                }
                playerCharacter = new Character(scene.playerAtt.name, scene.playerAtt.hp, scene.playerAtt.atk, scene.playerAtt.def, pHpBar, pHit);
                enemyCharacter = new Character(scene.enemyAtt.name, scene.enemyAtt.hp, scene.enemyAtt.atk, scene.enemyAtt.def, eHpBar, eHit);
                playerAtkTooltip.innerText = `Tấn công: Gây sát thương trong khoảng ${Math.floor(scene.playerAtt.atk-(scene.playerAtt.atk*0.1))}-${Math.floor(scene.playerAtt.atk+(scene.playerAtt.atk*0.1))}`;
                playerDefTooltip.innerText = "Phòng ngự: Lượt tiếp theo nếu bị tấn công giảm 60-80% sát thương, nếu không hồi phục 2% tổng sinh lực";
                playerHealTooltip.innerText = "Hồi phục: Hồi phục một lượng sinh lực bằng 5-15% tổng sinh lực";
                bBodyDiv.style.opacity = "1";
                pHpBar.style.width = "100%";
                eHpBar.style.width = "100%";
                isPlayerTurn = true;
                setTimeout(() => {
                    pHpBar.style.transition = "width 0.5s linear";
                    eHpBar.style.transition = "width 0.5s linear";
                }, 1500);
            } else {
                novelBox.style.opacity = "0";
                msgBox.style.opacity = "0";
                avatarBox.style.opacity = "0";
                isTransiting = true;
                await Delay(2000);
                if (scene.bgm && BGMManager.IsChanged(scene.bgm)) {
                    BGMManager.FadeOut(800);
                    setTimeout(() => {
                        bgmTime = BGMManager.Stop();
                        if (scene.bgm.time) BGMManager.Play(scene.bgm.url, scene.bgm.time||null);
                        else BGMManager.Play(scene.bgm.url);
                    }, 1000);
                }
                avatarImg.src = `${scene.contexts[context].portrait}`;
                novelBox.style.backgroundImage = `url('${scene.background}')`;
                if (scene.contexts[context].body) {
                    bodyImg.src =  `${scene.contexts[context].body}`;
                    bodyDiv.style.opacity = "1";
                } else {
                    bodyDiv.style.opacity = "0";
                }
                await Delay(1000);
                novelBox.style.opacity = "1";
                msgBox.style.opacity = "1";
                avatarBox.style.opacity = "1";
                await Delay(1000);
                isTransiting = false;
                writer(msg, scene.contexts[context].message);
            }
        }
        else {
            if (isTyping) {
                isTyping = false;
                msg.innerHTML = scene.contexts[context].message;
            } else {
                context++;
                if (context < scene.contexts.length) {
                    if (scene.contexts[context].portrait !== scene.contexts[context-1].portrait) avatarImg.src = `${scene.contexts[context].portrait}`;
                    if (scene.contexts[context].body) {
                        bodyImg.src =  `${scene.contexts[context].body}`;
                        bodyDiv.style.opacity = "1";
                    } else {
                        bodyDiv.style.opacity = "0";
                    }
                    msg.innerHTML = "";
                    writer(msg, scene.contexts[context].message);
                }
            }
        }
    });

    battleBox.addEventListener('click', async () => {
        if (!battleToScene) return;
        battleToScene = false;
        context = 0;
        msg.innerHTML = "";
        scene = scenes[++index];
        pHpBar.style.transition = "width 1s linear";
        eHpBar.style.transition = "width 1s linear";
        if (scene.ending) {
            isTransiting = true;
            return Ending(novelBox);
        };
        avatarImg.src = `${scene.contexts[context].portrait}`;
        novelBox.style.backgroundImage = `url('${scene.background}')`;
        modalBoxContent.style.transform = "rotateY(0deg)";
        if (scene.bgm) {
            BGMManager.FadeOut(800);
            setTimeout(() => {
                BGMManager.Stop();
                BGMManager.Play(scene.bgm.url, bgmTime);
            }, 1000);
        }
        await Delay(500);
        writer(msg, scene.contexts[context].message);
    });
}

async function enemyTurn() {
    await Delay(500);
    if (!isBattleTime || isPlayerTurn || !playerCharacter || !enemyCharacter) return;
    if (enemyCharacter.HP > 0) {
        let rd = Object.keys(commands)[Math.floor(Math.random() * Object.keys(commands).length)];
        if (rd === "attack") {
            let result = commands.attack(enemyCharacter, playerCharacter);
            if (!result.alive) {
                isBattleTime = false;
                Log.Add(`<i class="fas fa-skull"></i> ${playerCharacter.Name} đã bị đánh bại!`, "red");
                return GameOver(battleBox, BGMManager);
            }
        } else if (rd === "defense") {
            commands.defense(enemyCharacter);
        } else if (rd === "healing") {
            if (enemyCharacter.HP >= enemyCharacter.TotalHP) return enemyTurn();
            commands.healing(enemyCharacter);
        }
    } else {
        Log.Add(`<i class="fas fa-skull"></i> ${enemyCharacter.Name} đã bị đánh bại!`, "red");
        isBattleTime = false;
        battleToScene = true;
    }
    isPlayerTurn = true;
}

function healthBar(bar, hit, value, total, dmg) {
    let newValue = ((value - dmg)/total) * 100;
    if (dmg >= 0) {
        if (dmg == 0) return;
        hit.style.width = (dmg/value) * 100 + "%";
        setTimeout(() => {
            hit.style.width = "0";
            bar.style.width = newValue >= 0 ? newValue + "%" : "0";
        }, 500);
    } else {
        bar.style.width = newValue >= 0 ? newValue + "%" : "0";
    }
}

async function writer(p, msg) {
    let i = 0;
    isTyping = true;
    while (i < msg.length && isTyping) {
        p.innerHTML += msg.charAt(i);
        if (msg.charAt(i) === ",") await Delay(40);
        else if ((msg.charAt(i) === "." && msg.charAt(i+1) !== "." ) || msg.charAt(i) === "?" || msg.charAt(i) === "!") await Delay(60);
        else await Delay(20);
        i++;
    }
    isTyping = false;
}