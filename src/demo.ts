import { OSEventEmitter } from "./index";

const emitter = new OSEventEmitter();

emitter.on("mousedown", (event) => {
  console.log("::", JSON.stringify(event));
});
