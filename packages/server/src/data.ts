import * as Fs from "fs";
import * as Path from "path";

class Store {
    private databasePath = Path.join(__dirname, "../database.json");
    private _data: any;

    constructor() {
        if (!Fs.existsSync(this.databasePath)) {
            Fs.writeFileSync(this.databasePath, "{}");
        }

        this._data = this.readSync();
    }

    public get data() {
        return this._data;
    }

    public set data(data: any) {
        this._data = data;
        this.write(this._data);
    }

    private async write(data: any) {
        return Fs.promises.writeFile(this.databasePath, JSON.stringify(data));
    }

    private async read() {
        const data = await Fs.promises.readFile(this.databasePath, "utf8");
        return JSON.parse(data);
    }

    private readSync() {
        const data = Fs.readFileSync(this.databasePath, "utf8");
        return JSON.parse(data);
    }
}



const store = new Store();
export default store;
