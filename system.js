const os = require("os");

console.log("Platform:", os.platform());
console.log("Architecture:", os.arch());
console.log("CPU Info:", os.cpus().length, "cores");
console.log("Free Memory:", os.freemem() / 1024 / 1024, "MB");
