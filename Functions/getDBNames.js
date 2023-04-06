const { MongoClient, Binary } = require('mongodb')

const uriLogin = "mongodb+srv://samyakTest:samyakTest@testcluster.eqeij01.mongodb.net/test"
const uriQuestionPaper = "mongodb+srv://samyak970:samyak970@dbms.krybkqj.mongodb.net/test"
const uriSyllabus = "mongodb+srv://samyak970:samyak970@syllabus.vdys3eu.mongodb.net/test"
const uriNotes = "mongodb+srv://samyak970:samyak970@notes.jymuq4j.mongodb.net/test"

const clientQuestionPaper = new MongoClient(uriQuestionPaper)
const clientSyllabus = new MongoClient(uriSyllabus)
const clientNotes = new MongoClient(uriNotes);


async function getDBNames(selection) {

    try {

        if (selection == "qp") {
            await clientQuestionPaper.connect();
            var database = await clientQuestionPaper.db().admin().listDatabases();
        }

        else if (selection == "syllabus") {
            await clientSyllabus.connect();
            var database = await clientSyllabus.db().admin().listDatabases();
        }

        else if (selection == "notes") {
            await clientNotes.connect();
            var database = await clientNotes.db().admin().listDatabases();
        }

        var dbList = database.databases.map(db => db.name);
        dbList.pop();
        dbList.pop();
        return dbList;

    }
    catch (err) {
        console.log("Error at getDBNames");

    }
    finally {
        if (selection == "qp") {
            await clientQuestionPaper.close();
        }

        else if (selection == "syllabus") {
            await clientSyllabus.close();
        }

        else if (selection == "notes") {
            await clientNotes.close();
        }
    }


}

module.exports = getDBNames;