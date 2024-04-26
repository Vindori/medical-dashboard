const { MongoClient } = require('mongodb');
const { driver, auth } = require('neo4j-driver');

// MongoDB connection
const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl, {});

// Neo4j connection
const neo4jUrl = 'bolt://localhost:7687';
const neo4jDriver = driver(neo4jUrl, auth.basic('neo4j', 'jupiter-house-stone-isotope-nectar-2717'));

async function clearMongoDB() {
  try {
    await mongoClient.connect();
    const database = mongoClient.db('medicalDatabase');
    await database.collection('patients').deleteMany({});
    await database.collection('doctors').deleteMany({});
    console.log("MongoDB collections cleared");
  } catch (err) {
    console.error(err);
  }
}

async function clearNeo4j() {
  const session = neo4jDriver.session();
  try {
    const query = `
      MATCH (n)
      DETACH DELETE n
    `;
    await session.run(query);
    console.log("Neo4j database cleared");
  } finally {
    await session.close();
  }
}

async function seedMongoDB() {
  try {
    const database = mongoClient.db('medicalDatabase');
    const patients = database.collection('patients');
    const doctors = database.collection('doctors');

    // MongoDB Data for Patients
    const patientsData = [
      { name: "John Doe", age: 30, address: "123 Elm St", email: "john.doe@example.com" },
      { name: "Jane Smith", age: 25, address: "456 Oak St", email: "jane.smith@example.com" }
    ];
    const insertedPatients = await patients.insertMany(patientsData);

    // MongoDB Data for Doctors
    const doctorsData = [
      { name: "Dr. Emily Young", specialization: 'Cardiologist' },
      { name: "Dr. Michael Green", specialization: 'Dermatologist' }
    ];
    const insertedDoctors = await doctors.insertMany(doctorsData);

    console.log("Patients and Doctors collections seeded");

    return { insertedPatients, insertedDoctors };
  } catch (err) {
    console.error(err);
  }
}

async function seedNeo4j(insertedPatients, insertedDoctors) {
  const session = neo4jDriver.session();
  try {
    const query = `
      CREATE (p1:Patient {id: $patient1Id})
      CREATE (p2:Patient {id: $patient2Id})
      CREATE (d1:Doctor {id: $doctor1Id})
      CREATE (d2:Doctor {id: $doctor2Id})
      CREATE (p1)-[:TREATED_BY]->(d1)
      CREATE (p2)-[:TREATED_BY]->(d2)
    `;
    await session.run(query, {
      patient1Id: insertedPatients.insertedIds[0].toString(),
      patient2Id: insertedPatients.insertedIds[1].toString(),
      doctor1Id: insertedDoctors.insertedIds[0].toString(),
      doctor2Id: insertedDoctors.insertedIds[1].toString()
    });
    console.log("Neo4j relationships have been seeded");
  } finally {
    await session.close();
  }
}

async function seedDatabases() {
  await clearMongoDB();
  await clearNeo4j();
  const { insertedPatients, insertedDoctors } = await seedMongoDB();
  await seedNeo4j(insertedPatients, insertedDoctors);
  console.log("All databases have been seeded");
  process.exit(0);
}

seedDatabases();
