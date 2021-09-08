const getRandomInt = (input, range) => {
    let min = input - range;
    let max = input + range;
    return Math.floor(Math.random() * (max - min) + min);
}

export class Character {
    constructor(name, hp, atk, def, bar, hit) {
        this.Name = name;
        this.TotalHP = hp;
        this.HP = hp;
        this.ATK = atk;
        this.DEF = def;
        this.Status = [];
        this.HPBar = bar;
        this.HPHit = hit;
    }
    Attack() {
        //let critical = false;
        let dmg = getRandomInt(this.ATK, this.ATK * 0.1);
        // if (Math.random() <= 0.1) {
        //     dmg *= Math.random() + 1;
        //     critical = true;
        // }
        let shield = this.Status.find(e => e.name === "Shield") ? true : false;
        this.Status = this.Status.filter(e => e.name !== "Shield");
        return {
            dmg: Math.floor(dmg),
            shield: shield
        }
    }
    TakenDmg(dmg) {
        if (this.DEF >= 100) dmg = 1;
        else {
            dmg -= (dmg * this.DEF)/100;
        }
        let status = this.Status.find(e => e.name === "Shield");
        let shield = status ? true : false;
        if (status) {
            dmg -= (dmg * status.reduce)/100;
            this.Status = this.Status.filter(e => e.name !== "Shield");
        }
        dmg = Math.floor(dmg);
        let current = this.HP;
        this.HP = this.HP >= dmg ? this.HP - dmg : 0;
        return {
            alive: this.HP == 0 ? false : true,
            oldHP: current,
            newHP: this.HP,
            shield: shield
        }
    }
    Heal(options = {}) {
        console.log(options);
        let percent = options.percent ? options.percent : getRandomInt(10, 5);
        let current = this.HP;
        let shield = false;
        if (!options.percent) {
            shield = this.Status.find(e => e.name === "Shield") ? true : false;
            this.Status = this.Status.filter(e => e.name !== "Shield");
        }
        this.HP += Math.floor((this.TotalHP * percent)/100);
        if (this.HP > this.TotalHP) this.HP = this.TotalHP;
        
        return {
            percent: percent,
            oldHP: current,
            newHP: this.HP,
            shield: shield
        } 
    }
    Shield() {
        let percent = getRandomInt(70, 10);
        let shield = this.Status.find(e => e.name === "Shield") ? true : false;
        this.Status = this.Status.filter(e => e.name !== "Shield");
        this.Status.push({name: "Shield", reduce: percent});
        return {
            percent: percent,
            shield: shield
        }
    }
}