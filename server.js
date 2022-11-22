console.log('UTM Drone Sim Server running');
require("dotenv").config()

const express = require('express');
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const app = express();


const telemetryendpoint = process.env.telemetryendpoint // https://telemetry-endpoint.utm-labs-frequentis.com/pose
const opendpoint = process.env.opendpoint // https://operation-service.utm-labs-frequentis.com//api/authorizeOperationPlan
const ackendpoint = process.env.ackendpoint // https://alerting-endpoint.utm-labs-frequentis.com/processAck
const endendpoint = process.env.endendpoint // https://operation-service.utm-labs-frequentis.com/api/declareEndOfFlight
const activateendpoint = process.env.activateendpoint // https://operation-service.utm-labs-frequentis.com/api/activateOperationPlan
const keykloakendpoint = process.env.keycloakendpoint // https://keycloak-airlabs.utm-labs-frequentis.com/auth/realms/swim/protocol/openid-connect/token
const computeendpoint = process.env.computeendpoint //https://operation-service.utm-labs-frequentis.com/api/computeVolumeFromTrajectoryAndMinimumSeparation

app.use(express.static('public'));
app.use(express.json({limit: '50mb'}));

const alerts = [];
const OPs = [];

app.listen(8080, () => {
    console.log('listening on 8080');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/simulate', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(req.body),
        redirect: 'follow'
    };

    fetch(telemetryendpoint, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});

app.post('/alerts', (req, res) => {

    alerts.push(req.body);

    if (alerts.length > 100) {
        alerts.shift();
    }

    res.status(201).json({
        result: "27"
    });
});


app.post('/OPs', (req, res) => {

    OPs.push(req.body);

    if (OPs.length > 100) {
        OPs.shift();
    }

    res.status(201).json({
        result: "27"
    });
});


app.post('/ackAlert', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];

    ack = new Object();
    ack.status = "ACKNOWLEDGED";

    alerts.forEach(function (alert) {
        alert.operation_plans.forEach(function (op) {

            if (op === req.body.opID) {
                ack.message_id = alert.message_id;
            }
        });
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(ack),
        redirect: 'follow'
    };

    fetch(ackendpoint, requestOptions)
        .then(response => response.text())
        // .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});

app.post('/declareEndOfFlight', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(endendpoint+"/"+req.body.operationPlanId, requestOptions)
        .then(response => response.text())
         .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});



app.post('/flightplan', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(req.body),
        redirect: 'follow'
    };

    fetch(opendpoint, requestOptions)
        .then(response => response.text())
       .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});

app.post('/takeoff', (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(req.body),
        redirect: 'follow'
    };

    fetch(activateendpoint, requestOptions)
        .then(response => response.text())
       .then(result => console.log(result))
        .catch(error => console.log('error', error));

    res.status(201).json({
        result: "27"
    });
});

app.post('/computeVolumeFromTrajectory', async (req, res) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + req.body.access_token);
    delete req.body['access_token'];
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(req.body),
        redirect: 'follow'
    };

    const result = await fetch(computeendpoint, requestOptions)
        .then(response => response.text())
        .then(result => {
            res.status(201).json(result);
            console.log(result)
        })
        .catch(error => console.log('error', error));
});

app.post('/authutm', (req, res) => {
    authUTM(req, res);
});

function authUTM(req, res) {
    client = req.body.client;
    secret = req.body.secret;

    fetch(keykloakendpoint, {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + client + '&client_secret=' + secret,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (resp) {
        return resp.json();
    }).then(function (data) {
        //console.log('token', data);
        res.status(201).json(data);
    }).catch(function (err) {
        // Log any errors
        console.log('something went wrong', err);
        res.status(400).json(err);
    });
}