import { spawn, ChildProcess } from "child_process";
import { resolve } from "path";
import { AbstractEventEmitter } from "eify";
import qs from "querystring";
import dgram from "dgram";

const bin = resolve(__dirname, "../bin/xhook");

export type OSMouseEventType = "mousedown" | "mouseup" | "mousemove";

export type OSMouseEvent<T extends OSMouseEventType = OSMouseEventType> = {
  type: T;
  button: number;
  x: number;
  y: number;
  window: number;
};

type OSEvents = {
  mousedown: (event: OSMouseEvent<"mousedown">) => void;
  mouseup: (event: OSMouseEvent<"mouseup">) => void;
  mousemove: (event: OSMouseEvent<"mousemove">) => void;
};

function safeParse(text: string): unknown {
  try {
    return qs.parse(text);
  } catch {
    return;
  }
}

export class OSEventEmitter extends AbstractEventEmitter<OSEvents> {
  private server = dgram.createSocket("udp4");
  private agent: ChildProcess | undefined;

  constructor() {
    super();
    this.server.on("message", this.handleMessage);
    this.server.bind(5006);
    this.server.on("listening", () => {
      this.agent = spawn(bin, { stdio: ["ignore", "ignore", "ignore"] });
    });
  }

  private buffer: string = "";

  handleMessage = (chunk: Buffer) => {
    this.buffer += chunk.toString();
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() || "";
    lines.forEach((line) => this.handleLine(line));
  };

  private handleLine(line: string) {
    if (!line) return;
    const event = safeParse(line) as OSMouseEvent<any>;
    event.button = Number(event.button);
    event.x = Number(event.x);
    event.y = Number(event.y);
    event.window = Number(event.window);
    if (event) this.emit(event.type, event);
  }

  destroy() {
    this.agent?.kill();
    this.server.close();
  }
}
