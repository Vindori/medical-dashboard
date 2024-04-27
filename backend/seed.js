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
        { name: "Jane Smith", age: 25, address: "456 Oak St", email: "jane.smith@example.com" },
        { name: "Alice Johnson", age: 28, address: "789 Pine St", email: "alice.j@example.com" },
        { name: "Bob Brown", age: 22, address: "321 Maple St", email: "bob.b@example.com" },
        { name: "Carol White", age: 31, address: "654 Spruce St", email: "carol.w@example.com" },
        { name: "Dave Black", age: 36, address: "987 Cedar St", email: "dave.b@example.com" },
        { name: "Eve Gray", age: 29, address: "543 Willow St", email: "eve.g@example.com" },
        { name: "Frank Walsh", age: 40, address: "210 Oak St", email: "frank.w@example.com" },
        { name: "Grace Hall", age: 35, address: "632 Elm St", email: "grace.h@example.com" },
        { name: "Henry Ford", age: 45, address: "111 Pine St", email: "henry.f@example.com" }
  
    ];
    const insertedPatients = await patients.insertMany(patientsData);

    // MongoDB Data for Doctors
    const doctorsData = [
        { name: "Dr. Emily Young", specialization: 'Cardiologist' },
        { name: "Dr. Michael Green", specialization: 'Dermatologist' },
        { name: "Dr. Sarah Connor", specialization: 'Neurologist' },
        { name: "Dr. John Watson", specialization: 'General Practitioner' },
        { name: "Dr. Jane Foster", specialization: 'Oncologist' }
    ];
    const insertedDoctors = await doctors.insertMany(doctorsData);

    console.log("Patients and Doctors collections seeded");

    return { insertedPatients, insertedDoctors };
  } catch (err) {
    console.error(err);
  }
}

async function cachePatientData() {
  try {
    const database = mongoClient.db('medicalDatabase');
    const patients = await database.collection('patients').find().toArray();
    patients.forEach(patient => {
      redisClient.set(`patient:${patient._id}`, JSON.stringify(patient), 'EX', 3600); // Кэшировать на 1 час
    });
    console.log("Patients data cached in Redis");
  } catch (err) {
    console.error("Redis caching error:", err);
  }
}


async function seedNeo4j(insertedPatients, insertedDoctors) {
  const session = neo4jDriver.session();
  try {
    const query = `
      CREATE (p1:Patient {id: $patient1Id})
      CREATE (p2:Patient {id: $patient2Id})
      CREATE (p3:Patient {id: $patient3Id})
      CREATE (p4:Patient {id: $patient4Id})
      CREATE (p5:Patient {id: $patient5Id})
      CREATE (p6:Patient {id: $patient6Id})
      CREATE (p7:Patient {id: $patient7Id})
      CREATE (p8:Patient {id: $patient8Id})
      CREATE (p9:Patient {id: $patient9Id})
      CREATE (p10:Patient {id: $patient10Id})
      CREATE (d1:Doctor {id: $doctor1Id})
      CREATE (d2:Doctor {id: $doctor2Id})
      CREATE (d3:Doctor {id: $doctor3Id})
      CREATE (d4:Doctor {id: $doctor4Id})
      CREATE (d5:Doctor {id: $doctor5Id})
      CREATE (p1)-[:TREATED_BY]->(d1)
      CREATE (p7)-[:TREATED_BY]->(d1)
      CREATE (p2)-[:TREATED_BY]->(d2)
      CREATE (p3)-[:TREATED_BY]->(d2)
      CREATE (p4)-[:TREATED_BY]->(d2)
      CREATE (p4)-[:TREATED_BY]->(d3)
      CREATE (p5)-[:TREATED_BY]->(d3)
      CREATE (p6)-[:TREATED_BY]->(d3)
      CREATE (p10)-[:TREATED_BY]->(d4)
      CREATE (p7)-[:TREATED_BY]->(d4)
      CREATE (p9)-[:TREATED_BY]->(d4)
      CREATE (p8)-[:TREATED_BY]->(d4)
      CREATE (p1)-[:TREATED_BY]->(d5)
      CREATE (p3)-[:TREATED_BY]->(d5)
      CREATE (p5)-[:TREATED_BY]->(d5)
    `;
    await session.run(query, {
      patient1Id: insertedPatients.insertedIds[0].toString(),
      patient2Id: insertedPatients.insertedIds[1].toString(),
      patient3Id: insertedPatients.insertedIds[2].toString(),
      patient4Id: insertedPatients.insertedIds[3].toString(),
      patient5Id: insertedPatients.insertedIds[4].toString(),
      patient6Id: insertedPatients.insertedIds[5].toString(),
      patient7Id: insertedPatients.insertedIds[6].toString(),
      patient8Id: insertedPatients.insertedIds[7].toString(),
      patient9Id: insertedPatients.insertedIds[8].toString(),
      patient10Id: insertedPatients.insertedIds[9].toString(),
      doctor1Id: insertedDoctors.insertedIds[0].toString(),
      doctor2Id: insertedDoctors.insertedIds[1].toString(),
      doctor3Id: insertedDoctors.insertedIds[2].toString(),
      doctor4Id: insertedDoctors.insertedIds[3].toString(),
      doctor5Id: insertedDoctors.insertedIds[4].toString()
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
