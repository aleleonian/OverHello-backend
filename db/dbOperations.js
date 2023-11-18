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

    console.log("filter->", filter);
    console.log("data->", data);

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const updateResult = await theCollection.updateOne(
        filter,
        { $set: data });
    return updateResult;

}

async function dbFind(collection, data) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const foundItem = await theCollection.findOne(data);

    return foundItem;
}

async function emptyCollection(collection) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const emptyCollection = await theCollection.deleteMany({});

    return emptyCollection;
}

module.exports = { dbInsert, dbFind, dbSetClient, dbSetName, dbUpdate, emptyCollection }

