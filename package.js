const fs = require("fs");
const util = require("util");

const { PACKAGE_JSON } = require("./config");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const parsePackage = async (package) => {
    package = package.trim();

    let version = null;
    let name = null;

    // Check if the package name is invalid or empty
    if (!package || package === "") throw new ReferenceError("Invalid package name");
    // Check if there is `=` in the package variable
    else if (package.includes("=")) {
        // Split the package name and the version
        [name, version] = package.split("=");
        // Check if the name is invalid
        if (!name) throw new ReferenceError("Invalid package name");
        // Check if the version is invalid
        if (!version) throw new ReferenceError("Invalid package version");
    } else name = package;

    return [version, name];
};

const writePackageJson = async (data) => {
    const filePath = "./" + PACKAGE_JSON;

    // Convert JSON object to string
    data = JSON.stringify(data, null, 4);
    if (!data) throw new ReferenceError("Invalid package.json data");

    // Write package.json file
    try {
        // Write the data
        await writeFile(filePath, data);
    } catch (err) {
        console.error("Error writing package.json file");
    }
};

const readPackageJson = async () => {
    const filePath = "./" + PACKAGE_JSON;
    if (!fs.existsSync(filePath)) throw new ReferenceError("package.json file not found");

    let data = {};

    try {
        data = await readFile(filePath, "utf8");
        data = JSON.parse(data) || {};
    } catch (error) {
        console.error("Error reading package.json file");
    }

    if (!data["dependencies"]) data["dependencies"] = {};
    if (!data["devDependencies"]) data["devDependencies"] = {};

    return data;
};

exports = module.exports = {
    parsePackage,
    writePackageJson,
    readPackageJson
};
