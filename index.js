require('dotenv').config()
const  {leerInput, inquireMenu, pausa, listarLugares} = require("./helpers/inquire") ;
const Busquedas = require("./models/busquedas");



const main = async()=>{

    let opt

    const busquedas = new Busquedas()

    do {
        opt = await inquireMenu()

        switch (opt) {
            case 1:
                //code here
                const query = await leerInput('Ingrese el nombre de la ciudad:')
                // Buscar lugares
                const lugares =  await busquedas.ciudad(query)
                // Seleccionar el lugar
             //   console.log(lugares)
                const id = await  listarLugares(lugares)
                if(id === '0') continue

                const lugarSeleccionado = lugares.find( lugar => lugar.id === id)

                console.log(lugarSeleccionado)

                // Guardar en DB
                busquedas.agregarHistorial(lugarSeleccionado?.nombre)

                // Datos clima
                const clima = await busquedas.getClimaByLugar(lugarSeleccionado.lat, lugarSeleccionado.lng)
                const{ desc,min, max, temp } = clima



                // Mostrar resultados
                console.clear()
                console.log(`\nInformaciond de la ciudad\n`.green)
                console.log('Ciudad:',lugarSeleccionado.nombre)
                console.log('Lat:',lugarSeleccionado.lat)
                console.log('Lng:',lugarSeleccionado.lng)
                console.log('Temperatura:', temp)
                console.log('Minima:', min)
                console.log('Maxima:', max)
                console.log('Clima actualmente:', desc)
                break;
            case 2:
                //code here
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i+ 1}.`.green
                    console.log(` ${idx} ${lugar} `)
                })
                break;

            default:
                // code here
                break;
        }

        if(opt !== 0) await pausa();


    }while (opt !== 0)


}


main()