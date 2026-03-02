const path = require("path");

module.exports = {
  packagerConfig: {
    asar: true,
    executableName: "cat-mood-eater",
    icon: path.join(__dirname, "build", "icon")
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"]
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO"
      }
    }
  ]
};
