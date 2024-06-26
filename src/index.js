import express from "express"; // hacer npm i express
import cors from "cors"; // hacer npm i cors
import ValidacionesHelper from "./modules/validaciones-helper.js";
import DateTimeHelper from "./modules/datetime-helper.js";

import { sumar, multiplicar, dividir, restar } from "./modules/matematica.js";
import { OMDBSearchByPage, OMDBSearchComplete, OMDBGetByImdbID } from "./modules/omdb-wrapper.js";
import Alumno from "./models/alumno.js";

const app = express();
const port = 3000;
// Agrego los Middlewares
app.use(cors()); // Middleware de CORS
app.use(express.json()); // Middleware para parsear y comprender JSON
//
// Aca pongo todos los EndPoints
//
app.get('/', (req, res) => { // EndPoint "/"
res.send('Ya estoy respondiendo!');
})
app.get('/saludar', (req, res) => { // EndPoint "/saludar"
res.send('Hello World!');
})

app.get('/saludar/:nombre', (req, res) => {
    let nombre = req.params['nombre']
    res.status(200).send(`Hola ${nombre}`)
})
app.get('/validarfecha/:ano/:mes/:dia', (req, res) => {
    if (Date.parse(`${req.params['ano']}-${req.params['mes']}-${req.params['dia']}`)) {
        res.status(200).send()
    }
    else {
        res.status(400).send()
    }
})
// Endpoints que usan el modulo matematica
app.get('/matematica/sumar', (req, res) => {
    let n1 = ValidacionesHelper.getIntegerOrDefault(req.query.n1, 0)
    let n2 = ValidacionesHelper.getIntegerOrDefault(req.query.n2, 0)
    res.status(200).send(`${sumar(n1, n2)}`)
})
app.get('/matematica/restar', (req, res) => {
    let n1 = ValidacionesHelper.getIntegerOrDefault(req.query.n1, 0)
    let n2 = ValidacionesHelper.getIntegerOrDefault(req.query.n2, 0)
    res.status(200).send(`${restar(n1, n2)}`)
})
app.get('/matematica/multiplicar', (req, res) => {
    let n1 = ValidacionesHelper.getIntegerOrDefault(req.query.n1, 0)
    let n2 = ValidacionesHelper.getIntegerOrDefault(req.query.n2, 0)
    res.status(200).send(`${multiplicar(n1, n2)}`)
})
app.get('/matematica/dividir', (req, res) => {
    let n1 = ValidacionesHelper.getIntegerOrDefault(req.query.n1, 0)
    let n2 = ValidacionesHelper.getIntegerOrDefault(req.query.n2, 0)
    if (n2 == 0) {
        res.status(400).send('El divisor no puede ser cero')
    }
    else {
        res.status(200).send(`${dividir(n1, n2)}`)
    }
})
// Endpoints que usan OMDB
app.get('/omdb/searchbypage', async (req, res) => {
    let texto = ValidacionesHelper.getStringOrDefault(req.query.search, 'Batman')
    let pagina = ValidacionesHelper.getIntegerOrDefault(req.query.page, 1)
    let respuesta = await OMDBSearchByPage(texto, pagina)
    res.status(200).send(respuesta)
})
app.get('/omdb/searchcomplete', async (req, res) => {
    let texto = ValidacionesHelper.getStringOrDefault(req.query.search, 'Batman')
    let respuesta = await OMDBSearchComplete(texto)
    res.status(200).send(respuesta)
})
app.get('/omdb/getbyomdbid', async (req, res) => {
    let imdb = ValidacionesHelper.getStringOrDefault(req.query.imdbId, 'tt0372784')
    let respuesta = await OMDBGetByImdbID(imdb)
    res.status(200).send(respuesta)
})
// Endpoints que usan la clase Alumno
const alumnosArray = [];
alumnosArray.push(new Alumno("Esteban Dido" , "22888444", 20));
alumnosArray.push(new Alumno("Matias Queroso", "28946255", 51));
alumnosArray.push(new Alumno("Elba Calao" , "32623391", 18));
app.get('/alumnos', (req, res) => {
    res.status(200).send(alumnosArray);
})
app.get('/alumnos/:dni', (req, res) => {
    let dni = ValidacionesHelper.getStringOrDefault(req.params['dni'], '');
    let alumno = alumnosArray.find(a => a.dni == dni);
    if (alumno) {
        res.status(200).send(alumno);
    }
    else {
        res.status(404).send();
    }
})
app.post('/alumnos', (req, res) => {
    let nombre = ValidacionesHelper.getStringOrDefault(req.body.nombre, '');
    let dni = ValidacionesHelper.getStringOrDefault(req.body.dni, '');
    let edad = ValidacionesHelper.getIntegerOrDefault(req.body.edad, 0);
    let alumno = new Alumno(nombre, dni, edad);
    alumnosArray.push(alumno);
    res.status(201).send();
})
app.delete('/alumnos', (req, res) => {
    let dni = ValidacionesHelper.getStringOrDefault(req.body.dni, '');
    let alumno = alumnosArray.find(a => a.dni == dni);
    if (alumno) {
        alumnosArray.splice(alumnosArray.findIndex(a => a === alumno), 1);
        res.status(200).send();
    }
    else {
        res.status(404).send();
    }
})
//Endpoints que utilizan DateTimeHelper
app.get('/fechas/isDate', (req, res) => {
    let date = ValidacionesHelper.getStringOrDefault(req.query.fecha, '');
    let result = DateTimeHelper.isDate(date);
    if (result) {
        res.status(200).send();
    }
    else {
        res.status(400).send();
    }
})
app.get('/fechas/getEdadActual', (req, res) => {
    let date = ValidacionesHelper.getStringOrDefault(req.query.fechaNacimiento, '');
    if (DateTimeHelper.isDate(date)) {
        res.status(200).send(DateTimeHelper.getEdadActual(date));
    }
    else {
        res.status(400).send();
    }
})
app.get('/fechas/getDiasHastaMiCumple', (req, res) => {
    let date = ValidacionesHelper.getStringOrDefault(req.query.fechaNacimiento, '')
    if (DateTimeHelper.isDate(date)) {
        res.status(200).send(DateTimeHelper.getDiasHastaMiCumple(date))
    }
    else {
        res.status(400).send();
    }
})
app.get('/fechas/getDiaTexto', (req, res) => {
    let date = ValidacionesHelper.getStringOrDefault(req.query.fecha)
    let abr = req.query.abr
    if (DateTimeHelper.isDate(date)) {
        res.status(200).send(DateTimeHelper.getDiaTexto(date, abr))
    }
    else {
        res.status(400).send();
    }
})
app.get('/fechas/getMesTexto', (req, res) => {
    let date = ValidacionesHelper.getStringOrDefault(req.query.fecha)
    let abr = req.query.abr
    if (DateTimeHelper.isDate(date)) {
        res.status(200).send(DateTimeHelper.getMesTexto(date, abr))
    }
    else {
        res.status(400).send();
    }
})

// Inicio el Server y lo pongo a escuchar.
app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})
