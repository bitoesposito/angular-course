import { Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';

import { catchError, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);

  constructor(
    private httpClient: HttpClient
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
    // Controlla se il posto è già nella lista
    const currentPlaces = this.userPlaces();
    if (currentPlaces.some(p => p.id === place.id)) {
      return throwError(() => new Error('Place already in favorites'));
    }

    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id,
    })
    .pipe(
      tap(() => {
        // Aggiungi il posto al signal solo dopo la conferma del server
        this.userPlaces.update(prevPlaces => [...prevPlaces, place]);
      }),
      catchError((error) => {
        return throwError(() => new Error('Failed to add place to user places'))
      })
    )
  }

  removeUserPlace(place: Place) {}

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
