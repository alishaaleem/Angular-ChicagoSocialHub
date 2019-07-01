////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/27/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//////////////////////              SETUP NEEDED                ////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

//  Install Nodejs (the bundle includes the npm) from the following website:
//      https://nodejs.org/en/download/


//  Before you start nodejs make sure you install from the  
//  command line window/terminal the following packages:
//      1. npm install express
//      2. npm install pg
//      3. npm install pg-format
//      4. npm install moment --save
//      5. npm install elasticsearch


//  Read the docs for the following packages:
//      1. https://node-postgres.com/
//      2.  result API: 
//              https://node-postgres.com/api/result
//      3. Nearest Neighbor Search
//              https://postgis.net/workshops/postgis-intro/knn.html    
//      4. https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/quick-start.html
//      5. https://momentjs.com/
//      6. http://momentjs.com/docs/#/displaying/format/


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


const express = require('express');

var pg = require('pg');

var bodyParser = require('body-parser');

const moment = require('moment');


// Connect to elasticsearch Server

const elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
    host: '127.0.0.1:9200',
    log: 'error'
});


// Connect to PostgreSQL server

var conString = "pg://postgres:root@127.0.0.1:5432/chicago_divvy_stations";
var pgClient = new pg.Client(conString);
pgClient.connect();

var find_places_task_completed = false;


const app = express();
const router = express.Router();


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

router.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});



var places_found = [];
var logstash_divvy_data = [];
var stations_found = [];
var place_selected;
var station_selected;
var heatmap_data = [];
//var timeWindowSelected=['1 hour', '24 hours', '7 days'];


/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

//////   The following are the routes received from NG/Browser client        ////////

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



router.route('/places').get((req, res) => {

    res.json(places_found)

});



router.route('/place_selected').get((req, res) => {

    res.json(place_selected)

});



router.route('/allPlaces').get((req, res) => {

    res.json(places_found)

});




router.route('/stations').get((req, res) => {

    res.json(stations_found)

});


/////////////////////logstash/////////////////////////////////////
router.route('/logstashdata').get((req, res) => {

    res.json(logstash_divvy_data)

});

router.route('/logstashdata').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    logstash_divvy_task_completed = false;

    date = new Date();

    timeInterval = req.body.hours;
    console.log("server-hours:", timeInterval)
    console.log("time Interval from front end", timeInterval);

    formatdate = moment(date.setHours(date.getHours() - timeInterval)).format('YYYY-MM-DD HH:mm:ss');
    // formatdate = date.setHours(date.getHours() - timeInterval);

    console.log("Formated Date: ", formatdate);


    find_logstash_divvy_data(req.body.stationName, formatdate).then(function (response) {
        var hits = response;
        res.json(logstash_divvy_data);
    });

});
async function find_logstash_divvy_data(stationName, formatdate) {

    logstash_divvy_data = [];
    console.log(formatdate)
    let body = {
        size: 100000,
        from: 0,
        "query": {
            "bool": {
                "must": {

                    "match": { "stationName.keyword": stationName }
                },
                "filter": {
                    "range": { "lastCommunicationTime.keyword": { "gte": formatdate } }

                }

            }
        },
        "sort": {
            "lastCommunicationTime.keyword": { "order": "asc" }
        }
    }

    console.log("query passed");

    results = await esClient.search({ index: 'divvy_stations_logs', body: body });
    logstash_divvy_data = [];
    results.hits.hits.forEach((hit, index) => {
        //console.log("hits passed");

        var station = {
            "id": hit._source.id,
            "stationName": hit._source.stationName,
            "availableBikes": hit._source.availableBikes,
            "availableDocks": hit._source.availableDocks,
            "is_renting": hit._source.is_renting,
            "lastCommunicationTime": hit._source.lastCommunicationTime,
            "latitude": hit._source.latitude,
            "longitude": hit._source.longitude,
            "status": hit._source.status,
            "totalDocks": hit._source.totalDocks
        };
        logstash_divvy_data.push(station);
        //console.log(station.lastCommunicationTime);

    });

    logstash_divvy_task_completed = true;

}


/////////////////////Endlogstash/////////////////////////////////////

router.route('/places/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    find_places_task_completed = false;

    find_places_from_yelp(req.body.find, req.body.where, req.body.zipcode).then(function (response) {
        var hits = response;
        res.json(places_found);
    });

});

//alisha
router.route('/station_selected').get((req, res) => {

    res.json(station_selected)

});



router.route('/station_selected').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);
    for (var i = 0, len = stations_found.length; i < len; i++) {

        if (stations_found[i].stationName === req.body.stationName) { // strict equality test

            station_selected = stations_found[i];

            break;
        }
    }
    date = new Date();

    timeInterval = req.body.hours;
    console.log(timeInterval);

    stationName = req.body.stationName;

    console.log(stationName);

    // duration = date.setHours(date.getHours() - timeInterval);

    formatdate = moment(date.setHours(date.getHours() - timeInterval)).format('YYYY-MM-DD, h:mm:ss a');

    //  formatdate = moment(date).format('YYYY-MM-DD hh:mm:ss');
    console.log(formatdate);


    //var date='2019-03-23 23:44:00';

    const station_query = {
        name: 'fetch-24hours',
        text: 'SELECT DISTINCT *FROM divvy_stations_logs WHERE city=$1 and lastcommunicationtime>=$2 and stationname = $3 ORDER BY lastcommunicationtime',
        // text: ' SELECT * FROM divvy_stations_logs where divvy_stations_logs.stationName=$1 ORDER BY divvy_stations_logs.lastCommunicationTime',
        values: ['Chicago', formatdate, stationName]
    }

    find_selected_station_from_divvy(station_query).then(function (response) {
        var hits = response;
        res.json({ 'station_selected': 'Added successfully' });
        console.log('reached');
    });
});


//myown async
async function find_selected_station_from_divvy(station_query) {

    const response = await pgClient.query(station_query);

    station_selected = [];


    // response.rows.length
    for (var i = 0; i < response.rows.length; i++) {
        plainTextDateTime = moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');

        var station = {
            "id": response.rows[i].id,
            "stationName": response.rows[i].stationname,
            "availableBikes": response.rows[i].availablebikes,
            "availableDocks": response.rows[i].availabledocks,
            "is_renting": response.rows[i].is_renting,
            "lastCommunicationTime": plainTextDateTime,
            "latitude": response.rows[i].latitude,
            "longitude": response.rows[i].longitude,
            "status": response.rows[i].status,
            "totalDocks": response.rows[i].totaldocks
        };
        station_selected.push(station);


    }

    //res.json(station_selected);

}
//myown asyn end

//alisha

router.route('/stations/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    for (var i = 0, len = places_found.length; i < len; i++) {

        if (places_found[i].name === req.body.placeName) { // strict equality test

            place_selected = places_found[i];

            break;
        }
    }

    const query = {
        // give the query a unique name
        name: 'fetch-divvy',
        text: ' SELECT * FROM divvy_stations_status ORDER BY (divvy_stations_status.where_is <-> ST_POINT($1,$2)) LIMIT 3',
        values: [place_selected.latitude, place_selected.longitude]
    }

    find_stations_from_divvy(query).then(function (response) {
        var hits = response;
        res.json(stations_found);
    });


});




/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Divvy - PostgreSQL - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////


async function find_stations_from_divvy(query) {

    const response = await pgClient.query(query);

    stations_found = [];

    for (i = 0; i < 3; i++) {

        plainTextDateTime = moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');


        var station = {
            "id": response.rows[i].id,
            "stationName": response.rows[i].stationname,
            "availableBikes": response.rows[i].availablebikes,
            "availableDocks": response.rows[i].availabledocks,
            "is_renting": response.rows[i].is_renting,
            "lastCommunicationTime": plainTextDateTime,
            "latitude": response.rows[i].latitude,
            "longitude": response.rows[i].longitude,
            "status": response.rows[i].status,
            "totalDocks": response.rows[i].totaldocks
        };

        stations_found.push(station);

    }


}




/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Yelp - ElasticSerch - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



async function find_places_from_yelp(place, where, zipcode) {

    places_found = [];

    //////////////////////////////////////////////////////////////////////////////////////
    // Using the business name to search for businesses will leead to incomplete results
    // better to search using categorisa/alias and title associated with the business name
    // For example one of the famous places in chicago for HotDogs is Portillos
    // However, it also offers Salad and burgers
    // Here is an example of a busness review from Yelp for Pertilos
    //               alias': 'portillos-hot-dogs-chicago-4',
    //              'categories': [{'alias': 'hotdog', 'title': 'Hot Dogs'},
    //                             {'alias': 'salad', 'title': 'Salad'},
    //                             {'alias': 'burgers', 'title': 'Burgers'}],
    //              'name': "Portillo's Hot Dogs",
    //////////////////////////////////////////////////////////////////////////////////////


    let body = {
        size: 1000,
        from: 0,
        "query": {
            "bool": {
                "must": {
                    "term": { "categories.alias": place }
                },

                "filter" : {
                    "bool" : {
                      "should" : [
                         { "term" : {"location.address1" : where}}, 
                         { "term" : {"location.zip_code" : zipcode}} 
                      ]
                   }
                 },
    
                "must_not": {
                    "range": {
                        "rating": { "lte": 3 }
                    }
                },

                "must_not": {
                    "range": {
                        "review_count": { "lte": 500 }
                    }
                },

                "should": [
                    { "term": { "is_closed": "false" } }
                ],
            }
        }
    }

    results = await esClient.search({ index: 'chicago_yelp_reviews', body: body });

    results.hits.hits.forEach((hit, index) => {


        var place = {
            "name": hit._source.name,
            "display_phone": hit._source.display_phone,
            "address1": hit._source.location.address1,
            "is_closed": hit._source.is_closed,
            "rating": hit._source.rating,
            "review_count": hit._source.review_count,
            "latitude": hit._source.coordinates.latitude,
            "longitude": hit._source.coordinates.longitude
        };

        places_found.push(place);

    });

    find_places_task_completed = true;

}



app.use('/', router);

app.listen(4000, () => console.log('Express server running on port 4000'));




///////////////////////heatmap/////////////////////////////////

router.route('/divvy_docks').get((req, res) => {

    res.json(heatmap_data);

});

router.route('/divvy_docks/find').post((req, res) => {
  
	var str = JSON.stringify(req.body, null, 4);

    logstash_divvy_task_completed = false;

    date = new Date();

    timeInterval = req.body.hours;
    console.log("server-hours:", timeInterval)
    console.log("time Interval from front end", timeInterval);

    formatdate = moment(date.setHours(date.getHours() - timeInterval)).format('YYYY-MM-DD HH:mm:ss');
    // formatdate = date.setHours(date.getHours() - timeInterval);

    console.log("Formated Date: ", formatdate);


    find_logstash_divvy_heatmap_data(req.body.stationName, formatdate).then(function (response) {
        var hits = response;
        res.json(heatmap_data);
    });
	


});


async function find_logstash_divvy_heatmap_data(stationName, formatdate) {

    heatmap_data = [];
    console.log(formatdate)
    let body = {
        size: 1000000,
        from: 0,
        "query": {
            "bool": {
                "filter": {
                    "range": { "lastCommunicationTime.keyword": { "gte": formatdate } }
                }

            }
        },
        "sort": {
            "lastCommunicationTime.keyword": { "order": "asc" }
        }
    }

    console.log("query passed");

    results = await esClient.search({ index: 'divvy_stations_logs', body: body });
    heatmap_data = [];
    results.hits.hits.forEach((hit, index) => {
        //console.log("hits passed");

        var station = {
            "id": hit._source.id,
            "stationName": hit._source.stationName,
            "availableBikes": hit._source.availableBikes,
            "availableDocks": hit._source.availableDocks,
            "is_renting": hit._source.is_renting,
            "lastCommunicationTime": hit._source.lastCommunicationTime,
            "latitude": hit._source.latitude,
            "longitude": hit._source.longitude,
            "status": hit._source.status,
            "totalDocks": hit._source.totalDocks
        };
        heatmap_data.push(station);

    });

    logstash_divvy_task_completed = true;

}

async function find_heatmap_data(heatmap_query) {

    const response = await pgClient.query(heatmap_query);
	console.log("yahaan aya",response);
    heatmap_data = [];


    for (var i = 0; i < response.rows.length; i++) {
        plainTextDateTime = moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');

        var station = {
            "id": response.rows[i].id,
            "stationName": response.rows[i].stationname,
            "availableBikes": response.rows[i].availablebikes,
            "availableDocks": response.rows[i].availabledocks,
            "is_renting": response.rows[i].is_renting,
            "lastCommunicationTime": plainTextDateTime,
            "latitude": response.rows[i].latitude,
            "longitude": response.rows[i].longitude,
            "status": response.rows[i].status,
            "totalDocks": response.rows[i].totaldocks
        };
        heatmap_data.push(station);


    }

}





