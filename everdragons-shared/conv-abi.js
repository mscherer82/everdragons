const fs = require('fs');

function hasFileExtensions(file, fileExtensions) {

    if (fileExtensions === undefined) {
        return true;
    }

    let result = false;

    fileExtensions.forEach(function(fileExtension) {

        if (result === true) {
            return;
        }
        const idx = file.indexOf(fileExtension);

        if (file.length - fileExtension.length === idx) {
            result =  true;
        }
    });
    return result;
}

function walkDirectories(dir, fileExtensions, filelist) {
    filelist = filelist || [];
    const files = fs.readdirSync(dir);
    files.forEach(function (file) {
        const path = dir + '/' + file;
        if (!fs.statSync(path).isDirectory() && hasFileExtensions(file, fileExtensions)) {
			filelist.push({path, file});
        }
    });
    return filelist;
}


function main() {
	
	const dir = process.argv[2];
	const outDir = process.argv[3];
	const fileList = walkDirectories(dir, [".json"]);
	
	fileList.forEach(function(fileName) {
		console.log(fileName.path);
		let newJSON = {};
		let json = JSON.parse(fs.readFileSync(fileName.path, 'utf8'));
		newJSON.contractName = json.contractName;
		newJSON.networks = json.networks;
		newJSON.abi = json.abi;
		fs.writeFileSync(outDir + "/" + fileName.file, JSON.stringify(newJSON));
    });
	
}

main();