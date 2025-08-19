import { Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);

  constructor(
    private httpClient: HttpClient,
    private errorService: ErrorService
  ) {}

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', 'Failed to fetch places');
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places', 'Failed to fetch user places').pipe(
      tap({
        next: (places) => this.userPlaces.set(places),
        error: (error) => console.log(error)
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id,
    })
    .pipe(
      tap(() => {
        // Aggiungi il posto al signal solo dopo la conferma del server
        this.userPlaces.update(prevPlaces => [...prevPlaces, place]);
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to add place to user places';
        this.errorService.showError(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    )
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces()

    if (prevPlaces.some(p => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter(p => p.id !== place.id));
    }

    return this.httpClient.delete(`http://localhost:3000/user-places/${place.id}`)
    .pipe(
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to remove place from user places';
        this.errorService.showError(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    )
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient
      .get<{ places: Place[] }>(url)
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          return throwError(() => new Error(errorMessage))
        })
      )
  }
}
