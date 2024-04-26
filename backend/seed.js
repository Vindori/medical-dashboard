const { MongoClient } = require('mongodb');
const { driver, auth } = require('neo4j-driver');

// MongoDB connection
const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl, { });

// Neo4j connection
const neo4jUrl = 'bolt://localhost:7687';
const neo4jDriver = driver(neo4jUrl, auth.basic('neo4j', 'jupiter-house-stone-isotope-nectar-2717'));

async function seedMongoDB() {
  try {
    await mongoClient.connect();
    console.log("Connected correctly to MongoDB server");

    const database = mongoClient.db('medicalDatabase');
    const patients = database.collection('patients');

    // MongoDB Data
    const patientsData = [
      { name: "John Doe", age: 30, address: "123 Elm St", email: "john.doe@example.com" },
      { name: "Jane Smith", age: 25, address: "456 Oak St", email: "jane.smith@example.com" }
      // Add more patients here
    ];

    await patients.insertMany(patientsData);
    console.log("Patients collection seeded");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoClient.close();
  }
}

async function seedNeo4j() {
  const session = neo4jDriver.session();

  try {
    // Neo4j Data
    const query = `
      CREATE (p1:Patient {name: 'John Doe', age: 30, email: 'john.doe@example.com'})
      CREATE (p2:Patient {name: 'Jane Smith', age: 25, email: 'jane.smith@example.com'})
      CREATE (d1:Doctor {name: 'Dr. Emily Young', specialization: 'Cardiologist'})
      CREATE (d2:Doctor {name: 'Dr. Michael Green', specialization: 'Dermatologist'})
      CREATE (p1)-[:TREATED_BY]->(d1)
      CREATE (p2)-[:TREATED_BY]->(d2)
    `;

    await session.run(query);
    console.log("Neo4j data has been seeded");
  } catch (err) {
    console.error(err);
  } finally {
    await session.close();
  }
}

async function seedDatabases() {
  await seedMongoDB();
  await seedNeo4j();
  console.log("All databases have been seeded");
  process.exit(0);
}

seedDatabases();
