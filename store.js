#!/usr/bin/env node
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
const readdir = promisify(fs.readdir);
const removeFile = promisify(fs.unlink);
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
    async remove(key){
        const path = DATAFOLDERPATH+this.calculateHash(key);
        const exists = await fileExists(path);
        if(!exists) {
            console.error("not found");
        }
        else {
            const content = await fileRead(path);
            const data = content.toString().split('\n');
            let found = false;
            for(let i=0;i<data.length;i++){
                let line = JSON.parse(data[i]);
                if(line.key == key){
                    found = true;
                    data.splice(i, 1);
                    break;
                }
            }
            if(!found){
                console.error("not found");
                return;
            }
            if(data.length>1) await writeToFile(path,data.join('\n'));
            else await removeFile(path);
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
    async list(){
        const allFiles = await readdir(DATAFOLDERPATH);
        for(let i=0;i<allFiles.length;i++){
            const content = await fileRead(DATAFOLDERPATH+allFiles[i]);
            const data = content.toString().split('\n');
            for(let j=0;j<data.length;j++) {
                const line = JSON.parse(data[j]);
                console.log(`key:${line.key} value:${line.value}`);
            }
        }
    }
    async clear(){
        const allFiles = await readdir(DATAFOLDERPATH);
        for(let i=0;i<allFiles.length;i++){
            await removeFile(DATAFOLDERPATH+allFiles[i]);
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
            case 'list': {
                this.list();
                break;
            }
            case 'remove': {
                this.remove();
                break;
            }
            case 'clear': {
                this.clear();
                break;
            }
            default:this.showHelp();
        }
    }
    list(){
        if(this.args.length != 1) {
            this.showHelp();
            return;
        }
        storeInstance.list();
    }
    remove(){
        if(this.args.length != 2) {
            this.showHelp();
            return;
        }
        storeInstance.remove(this.args[1]);
    }
    clear(){
        if(this.args.length != 1) {
            this.showHelp();
            return;
        }
        storeInstance.clear();
    }
    get(){
        if(this.args.length != 2) {
            this.showHelp();
            return;
        }
        storeInstance.read(this.args[1]);
    }
    add(){
        if(this.args.length != 3) {
            this.showHelp();
            return;
        }
        storeInstance.add(this.args[1],this.args[2]);
    }
    showHelp(){
        console.log("Help: node store add [key] [value],node store get [key]");
    }
}
let storeInstance = new store();
let ch = new ComandHandler(process.argv.slice(2),storeInstance);
