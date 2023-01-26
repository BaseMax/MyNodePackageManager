const fs = require("fs");
const tar = require("tar");
const ncp = require("ncp");
const rimraf = require("rimraf");
const fetch = require("node-fetch");

const { NODE_MODULES, REGISTERY } = require("./config");
const { parsePackage, readPackageJson, writePackageJson } = require("./package");

const cache = Object.create(null);

const installPackage = async (package) => {
    const root = await readPackageJson();
    let [version, name] = await parsePackage(package);

    console.log(`Installing ${name}`);

    // Check if package is already cached
    if (cache[name]) return cache[name];

    // Check the package in the registert
    const url = `${REGISTERY}/${name}`;
    // Send a request to registery
    const response = await fetch(url);
    const json = await response.json();
    if (json.error) throw new ReferenceError(json.error);

    const versions = Object.keys(json.versions);
    console.log("Versions:");
    console.log(versions);

    if (version == null) {
        version = versions[versions.length - 1];
        console.log("You did'nt specify a version, using the latest version " + version);
    } else {
        if (!versions.includes(version)) throw new ReferenceError("Invalid version");
    }

    // Create the node_modules directory if it doesn't exist
    const path1 = "./" + NODE_MODULES + "/";
    if (!fs.existsSync(path1)) fs.mkdirSync(path1);

    // Create package folder if it doesn't exist
    const dest = "./" + NODE_MODULES + "/" + name;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    else {
        // Delete the destination folder
        rimraf.sync(dest);
        // Re-create the directory (now it's empty)
        fs.mkdirSync(dest);
    }

    // Download the tgz package file
    const tgz_url = json.versions[version].dist.tarball;

    // Create a temp file
    const tempFile = `${dest}/temp.tgz`;

    // Download the tgz and fetch that
    fetch(tgz_url)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            // Write the buffer to temp file
            fs.writeFileSync(tempFile, Buffer.from(buffer));
            // Extract the temp file to the dest folder
            return tar.x({
                file: tempFile,
                cwd: dest
            });
        })
        .then(() => {
            console.log(`File extracted to ${dest}`);

            // Delete the temp file
            fs.unlinkSync(tempFile);
            console.log(`${tempFile} deleted`);

            // Check if package has a package sub-directory
            const packageFolder = `${dest}/package`;
            if (fs.existsSync(packageFolder)) {
                ncp(packageFolder, dest, (err) => {
                    if (err) console.error(err);
                    console.log("Moved files in package folder to " + dest);
                });
            }
        })
        .then(() => {
            // Adding the package to the dependencies in package.json
            root["dependencies"][name] = version;
            // console.log(root);

            // Save the package.json file
            writePackageJson(root);
        })
        .catch(err => {
            console.error(`Error: ${err}`);
        });

    // Adding the package and info to the cache
    cache[name] = version;
    return version;
};

exports = module.exports = {
    installPackage
};
