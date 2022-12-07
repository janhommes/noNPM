import { remoteHello as remoteHello110 } from "https://nonpm.io/@no-npm/example@1.1.0";

const version = "2.0.0";

function remoteHello() {
  return `Remote hello world from version ${version}\n${remoteHello110()}`;
}

export { remoteHello, version };
