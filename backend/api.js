const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { driver, auth } = require('neo4j-driver');

const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });

const neo4jUrl = 'bolt://localhost:7687';
const neo4jDriver = driver(neo4jUrl, auth.basic('neo4j', 'jupiter-house-stone-isotope-nectar-2717'));

const app = express();
const port = 3000;

app.use(express.json());

app.get('/patients', async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db('medicalDatabase');
        const patients = database.collection('patients');
        const result = await patients.find({}).toArray();
        res.set('Access-Control-Allow-Origin', '*')
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await mongoClient.close();
    }
});

app.get('/doctors', async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db('medicalDatabase');
        const doctors = database.collection('doctors');
        const result = await doctors.find({}).toArray();
        res.set('Access-Control-Allow-Origin', '*')
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await mongoClient.close();
    }
});

app.get('/appointments', async (req, res) => {
    const session = neo4jDriver.session();
    try {
        const result = await session.run('MATCH (a:Appointment) RETURN a');
        const appointments = result.records.map(record => record.get('a').properties);
        res.set('Access-Control-Allow-Origin', '*')
        res.status(200).json(appointments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        session.close();
    }
});

app.get('/patients/:doctorId', async (req, res) => {
    const doctorId = req.params.doctorId;
    const session = neo4jDriver.session();
    try {
        // First, get patient IDs from Neo4j based on doctor ID
        const relationResult = await session.run(
            'MATCH (d:Doctor {id: $doctorId})-[:TREATED_BY]-(p:Patient) RETURN p.id AS patientId',
            { doctorId }
        );
        const patientIds = relationResult.records.map(record => record.get('patientId'));

        // Then, fetch these patients from MongoDB
        await mongoClient.connect();
        const database = mongoClient.db('medicalDatabase');
        const patients = database.collection('patients');
        const query = { _id: { $in: patientIds.map(id => new ObjectId(id)) } };
        const result = await patients.find(query).toArray();

        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await session.close();
        await mongoClient.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
