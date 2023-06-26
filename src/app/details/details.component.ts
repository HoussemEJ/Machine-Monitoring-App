import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FileReaderService } from '../services/file-reader.service';
import { Subscription, interval } from 'rxjs';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  machine: string;
  data: string[] = [];
  private subscription!: Subscription;
  temperature: number = 0;
  power: number = 0;
  load: number = 0;

  constructor(private fileReaderService: FileReaderService, 
              private route: ActivatedRoute, 
              private location: Location
  ) {
    this.machine = '';
  }

  ngOnInit() {
    this.machine = this.route.snapshot.paramMap.get('machine')!;
    // Initial run
    this.retrieveFilesData();

    // Update every second
    this.subscription = interval(1000).subscribe(() => {
      this.retrieveFilesData();
    });
  }

  goBack(): void {
    this.location.back();
  }

  private retrieveFilesData(): void {
    this.fileReaderService.readFiles().subscribe({
      next: (files: { fileName: string, fileContent: string[] }[]) => {
        const filteredFiles = files.filter(file => file.fileName === this.machine);
        this.data = filteredFiles.flatMap(file => file.fileContent);
        this.temperature = this.normalizeNumber(+(this.data[6].slice(0, -1)), 60, 170);
        this.power = this.normalizeNumber(+(this.data[5].slice(0, -4)), 400, 700);
        this.load = Math.round(+(this.data[4].slice(0, -1)));
      },
      error: (error: any) => {
        console.error('Error reading files:', error);
      }
    });
  }

  private normalizeNumber(number: number, min: number, max: number): number {
    // Ensure the number is within the specified range
    if (number < min) {
      number = min;
    } else if (number > max) {
      number = max;
    }

    // Normalize the number to a range between 0 and 100
    const range = max - min;
    const normalized = ((number - min) / range) * 100;

    // Round the normalized value to the closest integer
    const rounded = Math.round(normalized);

    return rounded;
  }

  getHeatGradient(power: number): string {
    // Calculate the color based on the power value
    const color = this.calculateHeatColor(power);

    // Generate the background image CSS value with the color
    const background = `conic-gradient(${color} ${power}%, #c7c7c7 0)`;

    return background;
  }

  calculateHeatColor(power: number): string {
    // Define the heat color range
    const minColor = [0, 255, 0]; // Green
    const maxColor = [255, 0, 0]; // Red

    // Calculate the color values based on the power value
    const red = this.interpolateColorValue(minColor[0], maxColor[0], power);
    const green = this.interpolateColorValue(minColor[1], maxColor[1], power);
    const blue = this.interpolateColorValue(minColor[2], maxColor[2], power);

    // Return the RGB color value as a string
    return `rgb(${red}, ${green}, ${blue})`;
  }

  interpolateColorValue(minValue: number, maxValue: number, power: number): number {
    const range = maxValue - minValue;
    const normalizedPower = power / 100;
    const interpolatedValue = Math.round(minValue + range * normalizedPower);
    return interpolatedValue;
  }
}