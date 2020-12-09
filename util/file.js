const  fs = require('fs');

const deleteFile = (filePath) => {
    filePath = 'C:\\Users\\DOLLY\\Desktop\\Shopping\\public' + filePath ;
    fs.unlink(filePath, (err) => {
        if(err){
            throw (err);
        }
    })
}

exports.deleteFile = deleteFile ;
