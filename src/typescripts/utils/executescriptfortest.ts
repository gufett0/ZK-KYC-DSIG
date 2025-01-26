import { execFile } from "child_process";
import Static from "@utils/static";

export default class ExecuteScriptForTest extends Static {
  constructor() {
    super();
  }

  public static runScript(scriptPath: string, args: string[], done: jest.DoneCallback) {
    var params = ["-File", scriptPath, ...args];
    execFile("powershell", params, { shell: true }, (error, stdout, stderr) => {
      if (error) {
        return done(error);
      }
      const lines = stdout.trim().split("\n");
      const lastLine = lines[lines.length - 1].trim();
      expect(lastLine).toBe("OK");
      done();
    });
  }
}
