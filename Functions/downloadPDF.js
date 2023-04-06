const { MongoClient, Binary } = require('mongodb')
const fs = require('fs');

const uriLogin = "mongodb+srv://samyakTest:samyakTest@testcluster.eqeij01.mongodb.net/test"
const uriQuestionPaper = "mongodb+srv://samyak970:samyak970@dbms.krybkqj.mongodb.net/test"
const uriSyllabus = "mongodb+srv://samyak970:samyak970@syllabus.vdys3eu.mongodb.net/test"
const uriNotes = "mongodb+srv://samyak970:samyak970@notes.jymuq4j.mongodb.net/test"

const clientQuestionPaper = new MongoClient(uriQuestionPaper)
const clientSyllabus = new MongoClient(uriSyllabus)
const clientNotes = new MongoClient(uriNotes);

async function downloadPDF(databaseName, collectionName, dataName, selection) {

    try {
        if (selection == "qp") {
            await clientQuestionPaper.connect();
            var database = clientQuestionPaper.db(databaseName)
        }

        else if (selection == "syllabus") {
            await clientSyllabus.connect();
            var database = clientSyllabus.db(databaseName)
        }

        else if (selection == "notes") {
            await clientNotes.connect();
            var database = clientNotes.db(databaseName)
        }

        var collection = database.collection(collectionName);
        var find = await collection.findOne({ name: dataName });
        var data1 = find.data.buffer;

        if (fs.existsSync("./downloadedPDF")) {
            // Do nothing
        } else {
            // Make the folder
            fs.mkdirSync("./downloadedPDF")
        }

        var fileName = "./downloadedPDF/" + dataName + '.pdf';
        // console.log(fileName);
        fs.writeFileSync(fileName, data1, 'binary');
    }
    catch (err) {
        console.log("Error in downloadPDF Function");
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

module.exports = downloadPDF;