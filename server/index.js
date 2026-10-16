import express from "express";
import fs from "node:fs";

// locate dataset 
const filePath = new URL ("../data/ServiceRequest.txt", import.meta.url);

//read file 
const contents = fs.readFileSync(filePath, "utf8");

//note: file is pipe delimited
function parseRequest(line) {
    //console.log(contents.split("\n").slice(0,3));
    // //const firstLine = contents.split("\n")[3];
    const fields = line.split("|")

    const request = {
        serviceRequestId: fields[0],
        name: fields[1],
        description: fields[2],
        status: fields[3],
        longitude: fields[4],
        latitude: fields[5],
        address: fields[6],
        createdAt: fields[7],
        updatedAt: fields[8],
        permissions: fields[9],
        sourceSystem: fields[10]
    };
    return request;
}
const lines = contents.split("\n").slice(0, 10);
const requests = lines.map(parseRequest);
//console.log(requests); 
const app = express();

app.get("/api/requests", (req, res) => {
    res.json(requests);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
