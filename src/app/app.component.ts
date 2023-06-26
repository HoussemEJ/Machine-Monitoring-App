import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FileReaderService } from './services/file-reader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Machine-Monitoring';

  constructor(private router: Router, public fileReaderService: FileReaderService) { }

  ngOnInit() {
    this.fileReaderService.startCounter();
  }

  isDefaultRoute(): boolean {
    return this.router.url === '/';
  }
}
