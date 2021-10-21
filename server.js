require('dotenv').config();
const { application } = require('express');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.static('public'));
app.use(express.json());

const { PORT = 3000, MONGODB_URI = 'mongodb://localhost/car-local' } =
  process.env;

(async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('connected', conn);
    mongoose.connection.on('error', (err) => {
      console.log(err);
    });
  } catch (error) {
    console.log(error);
  }
})();

const Schema = mongoose.Schema;
const carSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  bhp: {
    type: Number,
    required: true,
  },
  avatar_url: {
    type: String,
    default: 'https://static.thenounproject.com/png/449586-200.png',
  },
});

const Car = mongoose.model('Car', carSchema);

// const cars = [
//   {
//     make: 'tesla',
//     bhp: 3,
//   },
// ];

// app.use(function (req, res, next) {
//   console.log('middleware');
// });

app.get('/api/v1/cars', (req, res, next) => {
  Car.find({}).exec((err, cars) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(cars);
  });
});

app.post('/api/v1/cars', (req, res) => {
  console.log(req.body);
  const car = new Car(req.body);
  car.save((err, newCar) => {
    if (err) return res.status(500).send(err);
    res.status(201).send(newCar);
  });
});

app.delete('/api/v1/cars/:id', (req, res) => {
  Car.remove({ _id: req.params.id }, (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

app.put('/api/v1/cars/:id', (req, res) => {
  const carId = req.params.id;
  const updates = req.body;
  Car.update({ _id: carId }, updates, (err, raw) => {
    console.log('hello');
    if (err) return handleError(err);
    console.log('The raw response from Mongo was', raw);
    return res.sendStatus(200);
  });
});

// get just one record
app.get('/api/v1/cars/:id?', (req, res) => {
  Car.findById(req.params.id).exec((err, car) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(car);
  });
});

// get by condition, with a bhp greater than 3
app.get('/api/v1/cars/?bhpMin=3', (req, res, next) => {
  Car.find({
    bhp: {$gt: 3}
  }).exec((err, cars) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(cars);
  });
});

app.listen(PORT, () => {
  console.log(`The server is listening on port ${PORT}`);
});
