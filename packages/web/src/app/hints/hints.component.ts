import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hints',
  templateUrl: './hints.component.html',
  styleUrls: ['./hints.component.less'],
})
export class HintsComponent implements OnInit {

  randomNumber = this.generateRandomInteger(0, 2);

  constructor() {}

  ngOnInit(): void {}

  generateRandomInteger(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
}
