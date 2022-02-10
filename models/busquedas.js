const fs = require('fs')
const axios = require("axios");


class Busquedas {

    historial = []
    dbPath = './db/database.json'

    constructor() {
        this.leerDB()
    }

    get paramsMapbox() {
        return {
            language: 'es',
            access_token: process.env.MAPBOX_KEY || '',
            limit: '5'
        }
    }

    get openWeatherParams() {
        return {
            units: 'metric',
            lang: 'es',
            appid: process.env.OPENWEATHER_KEY,
        }
    }

    get historialCapitalizado() {
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ')
            palabras = palabras.map(palabra => palabra[0].toUpperCase() + palabra.substring(1))

            return palabras.join(' ')
        })
    }

    async ciudad(lugar = '') {

        try {

            const instance = axios.create({
                baseURL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
                params: this.paramsMapbox
            })

            const resp = await instance.get(`/${lugar}.json`);
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }))

        } catch (e) {
            console.log(e)
            return [];
        }
    }

    async getClimaByLugar(lat, lon) {
        try {

            // instancia de axios
            const instance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5',
                params: {...this.openWeatherParams, lat, lon}
            })

            //res.data
            const res = await instance.get('/weather')
            const {main, weather} = res.data
            const {temp_min, temp_max, temp} = main


            return {
                desc: weather[0].description,
                min: temp_min,
                max: temp_max,
                temp: temp,
            }


        } catch (e) {
            console.log(e)
        }
    }

    agregarHistorial(lugar = '') {

        if (this.historial.includes(lugar.toLowerCase())) {
            return;
        }
        this.historial = this.historial.splice(0,5)
        // prevenir duplicados
        this.historial.unshift((lugar).toLowerCase())

        // Grabar en BD
        this.guardarDB()
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    leerDB() {

        // Debe de existir
        if (!fs.existsSync(this.dbPath)) return;

        // si existe cargar info
        const info = fs.readFileSync(this.dbPath, {
            encoding: 'utf-8'
        })

        const data = JSON.parse(info);

        this.historial = data.historial
    }
}

module.exports = Busquedas