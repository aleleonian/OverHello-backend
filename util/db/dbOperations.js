let dbClient;
let dbName;

function dbSetClient(client) {
    dbClient = client;
}
function dbSetName(name) {
    dbName = name;
}

async function dbInsert(collection, data) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const insertResult = await theCollection.insertOne(data);

    return insertResult;

}

async function dbUpdate(collection, filter, data) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const updateResult = await theCollection.updateOne(filter, { $set: data });

    return updateResult;
}

async function dbFindOne(collection, data) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const foundItem = await theCollection.findOne(data);

    return foundItem;
}
async function dbFindMany(collection) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const foundItems = await theCollection.find({}).toArray();

    return foundItems;
}
async function dbAggregate(collection, aggregateObj) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const foundItem = await theCollection.aggregate([aggregateObj]).toArray();
    return foundItem;
}

async function dbGetARandomGreeting() {
    let greetingsArray = await dbAggregate("greetings", { $sample: { size: 1 } });
    return greetingsArray[0].phrase;
}

async function emptyCollection(collection) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const emptyCollection = await theCollection.deleteMany({});

    return emptyCollection;
}

module.exports = { dbGetARandomGreeting, dbInsert, dbFindOne, dbFindMany, dbSetClient, dbSetName, dbUpdate, emptyCollection, dbAggregate }

