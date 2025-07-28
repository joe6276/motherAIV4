const { google } = require('googleapis')
const dotenv = require("dotenv")
const path = require("path")
dotenv.config({ path: path.resolve(__dirname, "../.env") })
const fs= require('fs')

const CLIENT_ID ="1034743257294-k1ua0drj0kibbsn3mfasl7rcs6i6r0f0.apps.googleusercontent.com"
const CLIENT_SECRET = "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"
const REDIRECT_URL = "https://developers.google.com/oauthplayground"
const REFRESH_TOKEN = "1//048d4Er9qpib2CgYIARAAGAQSNwF-L9IrRkQfZ_7fJk9Qr4QpFZ2jHsBmjufP7IZfVtDiF7aSjG8LS25QF5DJkBGQIlcnKEp3_1c"

const oauthclient = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
)

oauthclient.setCredentials({ refresh_token: REFRESH_TOKEN })


const drive = google.drive({
    version: 'v3',
    auth: oauthclient
})


async function getFolderId(folderName) {
    try {
        const response = await drive.files.list({
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
            fields: 'files(id,name)'
        });

        if (response.data.files.length > 0) {
            return response.data.files[0].id;
        }
        throw new Error('Coltium folder not found');
    } catch (error) {
        console.error('Error finding coltium folder:', error);
        throw error;
    }
}



async function findorCreateDateFolder(folder) {
    const parentFolderId = await getFolderId(folder)
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const folderName = dateString;

    try {
        const searchResponse = await drive.files.list({
            q: `name='${folderName}' and parents in '${parentFolderId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)'
        });


        if (searchResponse.data.files && searchResponse.data.files.length > 0) {
            // Folder exists, return its ID
            console.log(`Folder '${folderName}' already exists`);
            return searchResponse.data.files[0].id;
        }

        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
        };

        const createResponse = await drive.files.create({
            resource: folderMetadata,
            fields: 'id, name'
        });

        console.log(`Created new folder: ${folderName}`);
        return createResponse.data.id;

    } catch (error) {
        console.error('Error finding/creating date folder:', error);
    }


}



async function createFileinDateFolder(content) {
    try {
        var dateFolderId = await findorCreateDateFolder("scripts")

        const now = new Date()
        const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        fileName = `script_${timeString}.txt`; // e.g., "script_14-30-25.txt"

        const fileMetadata = {
            name: fileName,
            parents: [dateFolderId]
        };

        const media = {
            mimeType: 'text/plain',
            body: content
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, parents'
        });

        return {
            fileId: response.data.id,
            fileName: fileName,
            dateFolderId: dateFolderId,
            webViewLink: response.data.webViewLink
        };
    } catch (error) {
        console.error('Error creating file in date folder:', error);
    }
}
// async function run() {
//     const parentFolderId = await createFileinDateFolder("Hello There")
//     console.log(parentFolderId);


// }

async function uploadVideoToDrive(videoPath){
try {
     const fileName = path.basename(videoPath);
    const fileSize = fs.statSync(videoPath).size;
    
    const folderId = await findorCreateDateFolder('videos') 

    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };
    const media = {
      mimeType: 'video/*', // Auto-detect video MIME type
      body: fs.createReadStream(videoPath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,size,mimeType'
    });

    
    // console.log('Upload successful!');
    // console.log('File ID:', response.data.id);
    // console.log('File Name:', response.data.name);
    // console.log('File Size:', response.data.size)

} catch (error) {
     console.error('Upload failed:', error.message);
}
}


module.exports={
    createFileinDateFolder,
    uploadVideoToDrive
}
