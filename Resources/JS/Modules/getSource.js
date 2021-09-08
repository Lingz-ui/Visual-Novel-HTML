export const GetSource = (url) => {
    return new Promise(async (resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) { 
                let result = JSON.parse(this.responseText);
                if (this.status != 200 || result.error) {
                    let err = result ? result.error||result : "Tải thông tin thất bại";
                    return reject(err);
                }
                let source = {
                    intros: result.intros.sort((a, b) => a.order-b.order),
                    scenes: result.scenes.sort((a, b) => a.order-b.order),
                }
                return resolve(source);
            }
        }
        xhttp.open("GET", url, true);
        xhttp.send();
    })
}