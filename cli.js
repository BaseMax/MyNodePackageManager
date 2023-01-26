const { installPackage } = require("./install");
const { readPackageJson } = require("./package");

const argv = process.argv.slice(2);

if (argv.length < 1) {
    console.log("Usage: `[command]`");
    console.log(`For help use help`);
    process.exit(1);
}
// Handling `install` command without passing any names
else if (argv.length === 1 && argv[0] === "install") {
    (async () => {
        const root = await readPackageJson();

        // Install the dependencies
        for (const dependency of Object.keys(root["dependencies"])) {
            const package = dependency + "=" + root["dependencies"][dependency];
            await installPackage(package);
        }

        // Install the devDependencies
        for (const devDependency of Object.keys(root["devDependencies"])) {
            const package = devDependency + "=" + root["devDependencies"][devDependency];
            await installPackage(package);
        }
    })();
}
// Handling `install` when passing a few or one name(s)
else if (argv.length >= 2 && argv[0] === "install") {
    const packages = argv.slice(1);

    for (const package of packages) installPackage(package);
}
// Suporting the main comands
else if (argv.length >= 1) {
    const command = argv[0];
    switch (command) {
        case "help":
            console.log("Help text");
            break;
        default:
            console.log("Unknown command");
            break;
    }
}
