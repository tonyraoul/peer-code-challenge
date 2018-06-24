//Simple key/value fs store By:Antoine Raoul, code-challenge for trufla
const crypto = require('crypto');
const fs = require('fs');
const DATAFOLDERPATH = './data/';
const utils = require('util');
const promisify = utils.promisify;
const appendFile = promisify(fs.appendFile);
const writeToFile = promisify(fs.writeFile);
const fileExists = promisify(fs.exists);
const fileRead = promisify(fs.readFile);
class store{
    constructor(){
        this.hasher = crypto.createHash("sha256");
    }
    calculateHash(key) {
        return this.hasher.update(key).digest('hex').slice(0,4);
    }
    add(key,value) {
        const hash = this.calculateHash(key);
        console.log(hash);
        this.write(DATAFOLDERPATH+'/'+hash,key,value);
    }
    async updateOrInsert(path,key,value){
        const content = await fileRead(path);
        const data = content.toString().split('\n'); //each line is a differenc key
        let found = false;
        for(let i=0;i<data.length;i++){
            let line = JSON.parse(data[i]);
            if(line.key == key){
                line.value = value;
                found = true;
                data[i] = JSON.stringify(line);
                break;
            }
        }
        if (!found) {data.push(JSON.stringify({key:key,value:value}))}
        await writeToFile(path,data.join('\n'));
    }
    async write(path,key,value) {
        const storageString = JSON.stringify({key:key,value:value});
        const _exists = await fileExists(path);
        if(!_exists){
            const file = await appendFile(path,storageString);
        }
        else{
            await this.updateOrInsert(path,key,value);
            console.log("updated");
        }
    }
    async read(key){
        const path = DATAFOLDERPATH+this.calculateHash(key);
        const exists = await fileExists(path);
        if(!exists) {
            console.error("not found");
        }
        else {
            const content = await fileRead(path);
            const data = content.toString().split('\n');
            for(let i=0;i<data.length;i++){
                let line = JSON.parse(data[i]);
                if(line.key == key){
                    console.log(line.value);
                    break;
                }
            }
        }

    }
}
class ComandHandler{
    constructor(args,storeInstance){
        this.args = args;
        switch(args[0]){
            case 'add': {
                this.add();
                break;
            }
            case 'get': {
                this.get();
                break;
            }
            default:this.showHelp();
        }
    }
    add(){
        if(this.args.length != 3) {
            this.showHelp();
            return;
        }
        storeInstance.add(this.args[1],this.args[2]);
    }
    showHelp(){
        console.log("Help: node store add [key] [value]");
    }
}
let storeInstance = new store();
let ch = new ComandHandler(process.argv.slice(2),storeInstance);
