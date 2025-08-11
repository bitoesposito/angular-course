import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  log(message: string) {
    const timeStamp = new Date().toISOString();
    console.log(`[${timeStamp}] ${message}`);
  }
}
