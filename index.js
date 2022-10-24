const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const MongoClient = require('mongodb').MongoClient;

//setting properties about the DB
const url = "mongodb://localhost:27017";
const dbName = "PharmacyDB";
const collectionName = "pharmacyData";


var app = express();
app.use(express.static("Public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

// getting my homepage running
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

//posting after the submit the nearest location of a pharmacy
app.post("/", function(req, res) {
  var latitude = Number(req.body.latitude);
  var longitude = Number(req.body.longitude);
  //waiting for the latitude and longitude to be inputed so that the function should start searching
  (async () => {
    var x = await getPharmacyLocation(latitude, longitude);
    res.write("<h1>The nearest Pharmacy is: " + x.DENOM_FARMACIA + " .</h1>");
    res.write("<h1>The address is: " + x.INDIRIZZO + " ," + x.LOCALITA + " .</h1>");
    res.send();

  })()

});
// setting the port for the
app.listen(3000, function() {
  console.log("Server started on port 3000");
});


// function in order to get the nearest pharmacy
const getPharmacyLocation = async (myLng, myLat) => {
  const client = new MongoClient(url, {
    useNewUrlParser: true
  });
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const tableData = await collection.find({}).toArray();
    // minDistance to 9999999 because we want to get the smallest difference
    var minDistance = 9999999;
    var pharmacy;

    tableData.map(item => {
      const lng = item.LNG;
      const lat = item.LAT;
      // calling the function for the distance between 2 points based on the latitude and longitude
      var dist = getDistance(myLat, myLng, parseFloat(lng), parseFloat(lat));
      // storing inside the minDistance the smallest distance
      if (dist < minDistance) {
        minDistance = dist;
        pharmacy = item;
      }
    });
    // returns the entire query from the collection, including all the docs.
    return pharmacy;

  } catch (err) {
    console.error(err);
  } finally {
    // close connection with the db
    client.close();
  }
}
//implementation of the mathematical formula to get the distance between two points.
const getDistance = (lat1, lng1, lat2, lng2) => {
  return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
}
