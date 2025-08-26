import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // To generate unique file names

@Injectable()
export class FarasaService {
  private jarPath: string;

  constructor() {
    // Corrected path to the JAR file, relative to the app's root
    this.jarPath = path.join(
      __dirname,
      '..',
      '..',
      'FarasaSegmenterJar.jar',
      'FarasaSegmenterJar.jar',
    );
  }

  // Main method that lemmatizes the text
  async lemmatize(
    text: string,
  ): Promise<{ original: string; lemmatized: string }> {
    const inputFile = this.createTempFile(text, '_input.txt');
    const outputFile = this.getTempFilePath('_output.txt');

    try {
      // Execute Farasa and wait for the file to be created
      await this.runFarasaJar(inputFile, outputFile);

      // Wait until the output file is created before proceeding
      const lemmatizedText = await this.waitForOutputFile(outputFile);
      // Clean up temporary files
      this.cleanUpFiles([inputFile, outputFile]);

      // Return the original text and the lemmatized text
      return { original: text, lemmatized: lemmatizedText };
    } catch (error) {
      this.cleanUpFiles([inputFile, outputFile]);
      console.error('Error in FarasaService:', error);
      throw new HttpException(
        'Failed to process text locally',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Create temporary input file
  private createTempFile(content: string, suffix: string): string {
    const filePath = this.getTempFilePath(suffix);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  // Generate the temporary file path
  private getTempFilePath(suffix: string): string {
    return path.join(__dirname, `${uuidv4()}${suffix}`);
  }

  // Run the Farasa JAR file with input and output
  private async runFarasaJar(
    inputFile: string,
    outputFile: string,
  ): Promise<void> {
    const command = `java -jar ${this.jarPath} -i "${inputFile}" -o "${outputFile}"`;
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);

        // Handle execution errors
        if (error) {
          console.error(`Error executing Farasa JAR: ${error.message}`);
          return reject(
            new Error(`Error running Farasa JAR: ${error.message}`),
          );
        }

        // Check if stderr contains a non-critical message
        if (
          (stderr && stderr.includes('Initializing the system')) ||
          stderr.includes('System ready!')
        ) {
          // These are non-critical, expected messages, so just log them
          console.log('Farasa initialization messages:', stderr);
        } else if (stderr) {
          // If stderr contains anything else, treat it as an error
          console.error(`Error output from Farasa JAR: ${stderr}`);
          return reject(new Error(`Error in Farasa processing: ${stderr}`));
        }

        // Log any relevant output from stdout
        if (stdout) {
          console.log(`Farasa JAR output: ${stdout}`);
        }

        // If everything is fine, resolve the promise
        resolve();
      });
    });
  }

  // Wait for the output file to be created and readable
  private waitForOutputFile(outputFile: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (fs.existsSync(outputFile)) {
          clearInterval(checkInterval); // Stop checking once the file exists
          try {
            const lemmatizedText = fs.readFileSync(outputFile, 'utf-8');
            resolve(lemmatizedText);
          } catch (err) {
            reject(new Error('Error reading output file'));
          }
        }
      }, 100); // Check every 100ms for the output file
    });
  }

  // Clean up temporary files
  private cleanUpFiles(files: string[]): void {
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}
