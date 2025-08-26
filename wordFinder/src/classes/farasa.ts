import { exec } from "child_process";
import {
  writeFileSync,
  unlinkSync,
  readFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import path from "path";

export class Farasa {
  private farasaPath: string;

  constructor() {
    this.farasaPath =
      "C:\\Users\\MJ\\Documents\\GitHub\\mj-projects\\quranInvestigation\\wordFinder\\FarasaDiacritizeJar.jar\\QCRI\\Dev\\ArabicNLP\\Farasa\\FarasaDiacritizeJar\\dist";
    this.createTmpDir();
  }

  private createTempFile(text: string): string {
    const tempFilePath = this.createTempPath();
    writeFileSync(tempFilePath, text);
    return tempFilePath;
  }

  private createTempPath(): string {
    return path.join(
      __dirname,
      "..",
      "..",
      "tmp",
      `temp-${Date.now()}-${Math.round(Math.random() * 10000)}.txt`
    );
  }

  private removeTempFile(filePath: string): void {
    unlinkSync(filePath);
  }

  private createTmpDir(): void {
    const tmpDir = path.join(__dirname, "..", "..", "tmp");
    if (!existsSync(tmpDir)) {
      mkdirSync(tmpDir);
    }
  }

  async lemmatize(
    text: string
  ): Promise<{ original: string; lemmatized: string }> {
    const jarName = "FarasaSegmenterJar.jar";
    const jarPath = path.join(this.farasaPath, jarName);
    const inputPath = this.createTempFile(text);
    const outputPath = this.createTempPath();
    const command = `java -jar ${jarPath} -i ${inputPath} -o ${outputPath}`;
    const lemmatized = await this.runFarasaCommand(
      command,
      inputPath,
      outputPath
    );
    return {
      original: text,
      lemmatized: lemmatized,
    };
  }

  private readOutputFile(outputPath: string): string {
    return readFileSync(outputPath, "utf-8");
  }

  private runFarasaCommand(
    command: string,
    inputPath: string,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = exec(command);

      let stderrData = "";
      process.stderr?.on("data", (data) => {
        stderrData += data;
      });

      process.on("close", (code) => {
        this.removeTempFile(inputPath);
        if (code !== 0) {
          reject(new Error(`Farasa exited with code ${code}: ${stderrData}`));
          return;
        }
        // Check if the output file is created and read its contents
        try {
          const output = this.readOutputFile(outputPath);
          this.removeTempFile(outputPath); // Clean up the output file
          resolve(output);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  // public analyzeText(text: string, moduleName: string): Promise<string> {
  //   const tempFilePath = this.createTempFile(text);
  //   return this.runFarasaModule(tempFilePath, moduleName);
  // }

  // Additional methods for other Farasa modules can be added here
}

// Usage
