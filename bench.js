const fs = require('fs');
const zlib = require('zlib');

const generateRevocationList = async (totalCredentials, totalRevoked, testNumber) => {
    const filePaths = []
    const percentageRevoked = Math.ceil(100 * totalRevoked / totalCredentials);
    filePaths.push(`./input.${testNumber}.txt`);

    // Make this code async
    const file = fs.createWriteStream(`./input.${testNumber}.txt`);
    // Push 0 or 1 base don the percentage to input.txt for totalCredentials times
    for (let i = 0; i < totalCredentials; i++) {
        const random = Math.floor(Math.random() * 100);
        if (random < percentageRevoked) {
            // Drain - https://stackoverflow.com/questions/50357777/why-does-attempting-to-write-a-large-file-cause-js-heap-to-run-out-of-memory
            if (!file.write('1')) {
                // Will pause every 16384 iterations until `drain` is emitted
                await new Promise(resolve => file.once('drain', resolve));
            }
        } else {
            if (!file.write('0')) {
                // Will pause every 16384 iterations until `drain` is emitted
                await new Promise(resolve => file.once('drain', resolve));
            }
        }
    }
    file.end();

    file.on('finish', () => {
        // console.log('Finished writing to file');
        // Check if the file is generated correctly
        const inputFile = fs.readFileSync(`./input.${testNumber}.txt`, 'utf8');
        if (inputFile.length === totalCredentials) {
        } else {
            console.log('Input file length mismatched - Failure');
        }

        // Compress the file
        filePaths.push(`./input.${testNumber}.txt.gz`);
        const fileContentsToBeZipped = fs.createReadStream(`./input.${testNumber}.txt`);
        const writeStreamToBeZippd = fs.createWriteStream(`./input.${testNumber}.txt.gz`);
        const zip = zlib.createGzip();
        fileContentsToBeZipped.pipe(zip).pipe(writeStreamToBeZippd);

        fileContentsToBeZipped.on('end', () => {
            //console.log('Finished compressing file');

            // Print compression Ratio
            var stats = fs.statSync(`./input.${testNumber}.txt.gz`)
            var outputFileSizeInBytes = stats.size;

            var stats = fs.statSync(`./input.${testNumber}.txt`)
            var inputFileSizeInBytes = stats.size;

            console.log(testNumber, totalCredentials, totalRevoked, inputFileSizeInBytes / outputFileSizeInBytes);

            filePaths.forEach((filePath) => {
                fs.unlinkSync(filePath);
            });

            // // Decompress the file
            // filePaths.push(`./output.${testNumber}.txt`);

            // const writeStream = fs.createWriteStream(`./output.${testNumber}.txt`);
            // const unzip = zlib.createGunzip();
            // fileContents.pipe(unzip).pipe(writeStream);

            // fileContents.on('end', () => {
            //     console.log('Finished decompressing file');
            //     // Check if the file is decompressed correctly
            //     const input = fs.readFileSync(`./input.${testNumber}.txt`, 'utf8');
            //     const output = fs.readFileSync(`./output.${testNumber}.txt`, 'utf8');
            //     if (input === output) {
            //         console.log('Input Output Matched - Success');

            //         // Delete the files
            //         filePaths.forEach((filePath) => {
            //             fs.unlinkSync(filePath);
            //         });
            //     } else {
            //         console.log('Input Output Mismatched - Failure', input.length, output.length);
            //     }
            // });
        });
    });
}

(async () => {
    for (let i = 6; i <= 8; i++) {
        for (let j = 1; j <= 10; j++) {
            await generateRevocationList(10 ** i, Math.ceil(10 ** i / (10 * j)), (i - 6) * 10 + j);
        }
    }
})();