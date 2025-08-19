import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent {
  isFetching = signal(false);
  error = signal<string | undefined>(undefined);

  private placesService = inject(PlacesService);
  
  // Utilizza computed per reagire ai cambiamenti del signal del servizio
  places = computed(() => this.placesService.loadedUserPlaces());

  constructor(
    private destroyRef: DestroyRef
  ) {
    this.isFetching.set(true);
    
    // Carica i posti iniziali
    const subscription = this.placesService.loadUserPlaces()
      .subscribe({
        next: (places) => {
          this.isFetching.set(false);
        },
        error: (error) => {
          this.error.set(error.message);
          this.isFetching.set(false);
        }
      });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onRemovePlace(place: Place) {
    const subscription = this.placesService.removeUserPlace(place).subscribe()

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}