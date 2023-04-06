const { MongoClient, Binary } = require('mongodb')
const fs = require('fs');

const uriLogin = "mongodb+srv://samyakTest:samyakTest@testcluster.eqeij01.mongodb.net/test"
const uriQuestionPaper = "mongodb+srv://samyak970:samyak970@dbms.krybkqj.mongodb.net/test"
const uriSyllabus = "mongodb+srv://samyak970:samyak970@syllabus.wq1luon.mongodb.net/test"
const uriNotes = "mongodb+srv://samyak970:samyak970@notes.jymuq4j.mongodb.net/test"

const clientQuestionPaper = new MongoClient(uriQuestionPaper)
const clientSyllabus = new MongoClient(uriSyllabus)
const clientNotes = new MongoClient(uriNotes);


async function uploadPDF(databaseName, collectionName, pdfName, pdfFilePath, selection) {

    try {

        if (selection == "qp") {
            await clientQuestionPaper.connect();
            var database = clientQuestionPaper.db(databaseName);
        }

        else if (selection == "syllabus") {
            await clientSyllabus.connect();
            var database = clientSyllabus.db(databaseName);
        }

        else if (selection == "notes") {
            await clientNotes.connect();
            var database = clientNotes.db(databaseName);
        }

        var collection = database.collection(collectionName);
        var pdfFileData = fs.readFileSync(pdfFilePath);
        var pdfDocument = {
            name: pdfName,
            data: new Binary(pdfFileData),
            contentType: "application/pdf",
            uploadDate: new Date(),
        }
        var result = await collection.insertOne(pdfDocument);


    }
    catch (err) {
        console.log("Error at uploadPDF");
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

module.exports = uploadPDF;