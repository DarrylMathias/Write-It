const imagekit = require('../config/imagekit');
const fs = require('fs');

async function uploadFile(localPath, fileName) {
    try {
        const response = await imagekit.upload({
            file: fs.readFileSync(localPath),
            fileName,
        });
        return response;
    } catch (error) {
        console.error(error);
        throw new Error('ImageKit upload failed');
    }
}

module.exports = uploadFile;
