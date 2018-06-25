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
class StorageDriver{
    constructor(){
        this.fileRead = fileRead;
        this.writeFile = writeToFile;
        this.readdir = readdir;
        this.removeFile = removeFile;
        this.fileExists = fileExists;
        this.appendFile = appendFile;
    }

}
class Store{
    constructor(){
        this.hasher = crypto.createHash("sha256");
    }
    calculateHash(key) {
        return this.hasher.update(key).digest('hex').slice(0,4);
    }
    async add(key,value) {
        const hash = this.calculateHash(key);
        await this.write(DATAFOLDERPATH+'/'+hash,key,value);
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
        }
    }
    async remove(key){
        const path = DATAFOLDERPATH+this.calculateHash(key);
        const exists = await fileExists(path);
        if(!exists) {
            return null;
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
                return null;
            }
            if(data.length>1) await writeToFile(path,data.join('\n'));
            else await removeFile(path);
        }
    }
    async read(key){
        const path = DATAFOLDERPATH+this.calculateHash(key);
        const exists = await fileExists(path);
        if(!exists) {
            return null;
        }
        else {
            const content = await fileRead(path);
            const data = content.toString().split('\n');
            for(let i=0;i<data.length;i++){
                let line = JSON.parse(data[i]);
                if(line.key == key){
                    return line.value;
                }
            }
        }

    }
    async list(){
        const allFiles = await readdir(DATAFOLDERPATH);
        let result = [];
        for(let i=0;i<allFiles.length;i++){
            const content = await fileRead(DATAFOLDERPATH+allFiles[i]);
            const data = content.toString().split('\n');
            for(let j=0;j<data.length;j++) {
                const line = JSON.parse(data[j]);
                result.push(line);
            }
        }
        return result;
    }
    async clear(){
        const allFiles = await readdir(DATAFOLDERPATH);
        for(let i=0;i<allFiles.length;i++){
            await removeFile(DATAFOLDERPATH+allFiles[i]);
        }
    }
}
class CommandHandler{
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
    async list(){
        if(this.args.length != 1) {
            this.showHelp();
            return;
        }
        const result = await storeInstance.list();
        result.forEach(line => {
            console.log(`key:${line.key} value:${line.value}`);
        });
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
    async get(){
        if(this.args.length != 2) {
            this.showHelp();
            return;
        }
        const value = await storeInstance.read(this.args[1]);
        console.log(value==null?value:"not found");
    }
    add(){
        if(this.args.length != 3) {
            this.showHelp();
            return;
        }
        storeInstance.add(this.args[1],this.args[2]);
    }
    showHelp(){
        console.log("Help: node store add [key] [value],node store get [key],node store remove [key],node store list, nodes store clear");
    }
}
let storeInstance = new Store();
new CommandHandler(process.argv.slice(2),storeInstance);
exports.Store = Store;
exports.CommandHandler = CommandHandler;