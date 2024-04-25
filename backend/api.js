const express = require('express');
const { MongoClient } = require('mongodb');
const { driver, auth } = require('neo4j-driver');

const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });

const neo4jUrl = 'bolt://localhost:7687';
const neo4jDriver = driver(neo4jUrl, auth.basic('username', 'password'));

const app = express();
const port = 3000;

app.use(express.json());

app.get('/patients', async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db('medicalDatabase');
        const patients = database.collection('patients');
        const result = await patients.find({}).toArray();
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await mongoClient.close();
    }
});

app.get('/doctors', async (req, res) => {
    const session = neo4jDriver.session();
    try {
        const result = await session.run('MATCH (d:Doctor) RETURN d');
        const doctors = result.records.map(record => record.get('d').properties);
        res.status(200).json(doctors);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        session.close();
    }
});

app.get('/appointments', async (req, res) => {
    const session = neo4jDriver.session();
    try {
        const result = await session.run('MATCH (a:Appointment) RETURN a');
        const appointments = result.records.map(record => record.get('a').properties);
        res.status(200).json(appointments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        session.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
