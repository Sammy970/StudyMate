const express = require('express')
var session = require('express-session')
const { MongoClient, Binary } = require('mongodb')
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');

// Importing Functions
const getDBNames = require('./Functions/getDBNames');
const getColNames = require('./Functions/getColNames');
const getData = require('./Functions/getData');
const downloadPDF = require('./Functions/downloadPDF');
const uploadPDF = require('./Functions/uploadPDF');
const previewPDF = require('./Functions/previewPDF');

const uriLogin = "mongodb+srv://samyakTest:samyakTest@testcluster.eqeij01.mongodb.net/test"
const uriQuestionPaper = "mongodb+srv://samyak970:samyak970@dbms.krybkqj.mongodb.net/test"
const uriSyllabus = "mongodb+srv://samyak970:samyak970@syllabus.wq1luon.mongodb.net/test"
const dbName = "Creds"
const colName = "Login"

const app = express();
const client = new MongoClient(uriQuestionPaper)
const clientLogin = new MongoClient(uriLogin)
const upload = multer({ dest: 'uploads/' });

async function checkCred(username, password, req, res) {
    await clientLogin.connect();
    const database = clientLogin.db("Creds")
    const collection = database.collection("Login");

    const find = await collection.findOne({ "username": username });
    // console.log(find.emailID);
    try {
        const pass = find.pass;
        if (pass == password) {
            console.log("Correct Password")
            req.session.loginState = "true";
            res.send("loginTrue");
        } else {
            res.send("loginFalse");
            return;
        }
    } catch (err) {
        console.log(err)
        res.send("Not found")
    }
    finally {
        await clientLogin.close();
    }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({ type: 'application/pdf', limit: '10mb' }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('trust proxy', 1) // trust first proxy

// Use the session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))


app.get('/', async (req, res) => {
    res.render('homepage');
})


app.get('/questionPaper', async (req, res) => {
    req.session.selection = "qp";
    const dbList = await getDBNames(req.session.selection);
    res.render('questionPaper', { dbList });
})

app.get('/syllabus', async (req, res) => {
    req.session.selection = "syllabus"
    const dbList = await getDBNames(req.session.selection);
    res.render('syllabus', { dbList });
})

app.get('/notes', async (req, res) => {
    req.session.selection = "notes"
    const dbList = await getDBNames(req.session.selection);
    res.render('notes', { dbList });
})

app.get('/admin', async (req, res) => {
    if (req.session.loginState == "true") {
        const dbList = await getDBNames(req.session.selection);
        var selection = req.session.selection
        res.render('admin', { dbList, selection });
    } else {
        res.render('adminLogin');
    }
})

app.get('/login', async (req, res) => {
    res.render('adminLogin');
})

app.post('/loginCred', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    req.session.selection = req.body.section;
    checkCred(username, password, req, res);
})

app.post('/logout', async (req, res) => {
    req.session.loginState = "false"
    res.redirect('/admin');
})

// Downloading PDF
app.post('/filter1', async (req, res) => {
    const formdata = req.body.filter;
    const colList = await getColNames(formdata, req.session.selection);
    res.send(colList);
})

app.post('/filter2', async (req, res) => {
    req.session.dbName = req.body.data1;
    req.session.colName = req.body.data2;
    const data = await getData(req.session.dbName, req.session.colName, req.session.selection);
    res.send(data);
    // console.log(data);
})

app.post('/filter3', async (req, res) => {

    //req.session.dbName & req.session.colName
    req.session.dataName = req.body.data3;

    await downloadPDF(req.session.dbName, req.session.colName, req.session.dataName, req.session.selection);

    res.send(req.hostname)
    // res.redirect('/test');
})

app.get('/download', (req, res) => {
    var dataName = req.session.dataName;

    const filePath = './downloadedPDF/' + dataName + '.pdf';
    const fileName = dataName + '.pdf';

    // set the response headers to indicate that the response will contain a file
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // read the file from the file system and pipe it to the response object
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('close', () => {
        fs.unlink(filePath, err => {
            if (err) {
                console.error(err);
            } else {
                console.log('File deleted');
            }
        });
    });
})

// Uploading PDF
app.post('/filter4', async (req, res) => {
    req.session.dbName = req.body.filterUP;
    const colList = await getColNames(req.session.dbName, req.session.selection);
    res.send(colList);
})

app.post('/filter5', async (req, res) => {
    req.session.colName = req.body.filterUP;
    res.send("awesome");
})

app.post('/filter6', upload.single('pdf'), async (req, res) => {
    // req.session.dbName && req.session.colName
    req.session.pdfName = req.body.pdfName;
    req.session.pdfFilePath = req.file.path;

    await uploadPDF(req.session.dbName, req.session.colName, req.session.pdfName, req.session.pdfFilePath, req.session.selection);

    uploadFolderPath = "./uploads"

    fs.readdir(uploadFolderPath, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        // Loop through all the files in the folder
        files.forEach(file => {
            // Delete the file
            fs.unlink(`${uploadFolderPath}/${file}`, err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(`Deleted file: ${file}`);
            });
        });
    })

    res.send('<script>alert("Successfully uploaded!!"); window.location.href = "/admin"; </script>');
})

// Preview PDF
app.get('/preview', async (req, res) => {
    // req.session.dbName && req.session.colName && req.session.dataName
    await previewPDF(req.session.dbName, req.session.colName, req.session.dataName, res, req.session.selection);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));