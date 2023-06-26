import { Component, OnInit } from '@angular/core';
import { FileReaderService } from '../services/file-reader.service';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  columns: string[] = ['Status', 'JobNumber', 'Program', 'Program status', 'Load', 'Power', 'Temperature', 'Cycles'];
  filesData: { fileName: string, fileContent: string[] }[] = [];
  data: string[][] = [];
  counter: number = 0;
  private subscription!: Subscription;

  constructor(private fileReaderService: FileReaderService, private router: Router) { }

  ngOnInit() {
    // Initial run
    this.retrieveFilesData();

    // Update every second
    this.subscription = interval(1000).subscribe(() => {   
      this.retrieveFilesData();
    });
  }

  private retrieveFilesData(): void {
    this.fileReaderService.readFiles().subscribe({
      next: (files: { fileName: string, fileContent: string[] }[]) => {
        this.filesData = files;
      },
      error: (error: any) => {
        console.error('Error reading files:', error);
      }
    });
  }
}