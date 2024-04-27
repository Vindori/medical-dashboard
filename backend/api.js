const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { driver, auth } = require('neo4j-driver');
const redis = require('redis');
const cors = require('cors');


const redisClient = redis.createClient({
    legacyMode: true // Включение режима совместимости для поддержки старого API
  });
redisClient.connect().catch(console.error);
const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl, { useUnifiedTopology: true });

const neo4jUrl = 'bolt://localhost:7687';
const neo4jDriver = driver(neo4jUrl, auth.basic('neo4j', 'jupiter-house-stone-isotope-nectar-2717'));

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Функция для получения кэшированных данных
async function getCachedData(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, data) => {
      if (err) reject(err);
      if (data) {
        resolve(JSON.parse(data));
      } else {
        resolve(null);
      }
    });
  });
}

// Функция для кэширования данных
function cacheData(key, data, duration = 3600) {
  redisClient.setex(key, duration, JSON.stringify(data)); // Кэшируем на один час по умолчанию
}

app.get('/patients', async (req, res) => {
    try {
        
        await mongoClient.connect();
        const database = mongoClient.db('medicalDatabase');
        const patients = database.collection('patients');
        const result = await patients.find({}).toArray();
        
        res.set('Access-Control-Allow-Origin', '*');
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
        
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await mongoClient.close();
    }
});


app.get('/patients/:doctorId', async (req, res) => {
    const doctorId = req.params.doctorId;
    const session = neo4jDriver.session();
    try {
        
        const relationResult = await session.run(
            'MATCH (d:Doctor {id: $doctorId})-[:TREATED_BY]-(p:Patient) RETURN p.id AS patientId',
            { doctorId }
        );
        const patientIds = relationResult.records.map(record => record.get('patientId'));

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
        session.close();
        await mongoClient.close();
    }
});

app.put('/patient/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    console.log(updateData)
    try {
        await mongoClient.connect();
        let database = mongoClient.db('medicalDatabase');
        let patients = database.collection('patients');

        const { modifiedCount } = await patients.updateOne(
            { _id: new ObjectId(id) },
            { $set: {                // <-- set stage
                email: req.body.email,    
                name: req.body.name,
                age: req.body.age,
                adress: req.body.adress
               }
             }, false, true
        );

        if (modifiedCount === 0) {
            return res.status(404).json({ message: 'No patient found with that ID' });
        }
        const updatedPatient = await patients.findOne({ _id: new ObjectId(id) });
        cacheData(`patient_${id}`, updatedPatient);
        
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json({ message: 'Patient updated successfully', patient: updatedPatient });
    } catch (e) {
        console.log(e.message);
        res.status(500).json({ error: e.message });
    } finally {
        await mongoClient.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
