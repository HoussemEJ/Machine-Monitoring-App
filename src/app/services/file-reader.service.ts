import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileReaderService {
  counter: number = 0;
  private intervalId: any;

  constructor(private http: HttpClient) {
    // Prevents the read data from resetting when moving through pages
    const savedCounter = sessionStorage.getItem('counter');
    if (savedCounter) {
      this.counter = parseInt(savedCounter, 10);
    }
  }

  // Read data from files (should be a realtime data reading from server instead)
  public readFiles(): Observable<{ fileName: string, fileContent: string[] }[]> {
    const fileUrls: string[] = [
      'assets/data/ST640.txt',
      'assets/data/ST19.txt',
      'assets/data/ST14.txt',
      'assets/data/ST47.txt',
      'assets/data/ST50.txt',
      'assets/data/ST101.txt',
      'assets/data/ST530.txt'
    ];

    // Retrieve 1 line from each file the line index is the current timer counter
    const fileRequests: Observable<{ fileName: string, fileContent: string[] }>[] = fileUrls.map(url => {
      const fileName = this.extractFileName(url);
      return this.http.get(url, { responseType: 'text' }).pipe(
        map(fileContent => ({ fileName, fileContent: fileContent.split('\n')[this.counter].split('\t') }))
      );
    });

    return forkJoin(fileRequests);
  }

  startCounter() {
    this.intervalId = setInterval(() => {
      this.counter = this.counter > 999 ? 0 : this.counter + 1;
      sessionStorage.setItem('counter', this.counter.toString());
    }, 1000);
  }

  stopCounter() {
    clearInterval(this.intervalId);
  }

  private extractFileName(url: string): string {
    const fileExtensionIndex = url.lastIndexOf('.');
    const fileNameIndex = url.lastIndexOf('/', fileExtensionIndex) + 1;
    return url.substring(fileNameIndex, fileExtensionIndex);
  }
}
