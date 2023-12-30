import { Component, OnInit } from '@angular/core';
import { FilmService } from '../Service/film.service';
import { User } from '../login/user.model';
import { HashService } from '../Service/hash.service';
import { Film } from '../Model/film';
import { UsersloginService } from '../Service/users.login.service';
import { FilmCardComponent } from '../filmCard/filmCard.component';
import { CommonModule } from '@angular/common';
import {forkJoin, Observable} from "rxjs";

@Component({
  selector: 'app-my-favorites',
  templateUrl: 'MyFavorites.component.html',
  styleUrls: ['MyFavorites.component.css'],
  standalone: true,
  imports: [FilmCardComponent, CommonModule],
})
export class FavoritedComponent implements OnInit {
  favoriteMovieIds: number[] = [];
  favoriteMovies: Film[] = [];


  constructor(private filmService: FilmService) { }

  ngOnInit(): void {
    this.loadFavoriteMovies();
    console.log(this.favoriteMovies);
  }

  loadFavoriteMovies() {
    console.log('Fetching favorite movie IDs...');
    this.filmService.getFavoriteMovieIds().subscribe((ids: any[]) => {
      console.log('Received favorite movie IDs:', ids);

      const requests: Observable<any>[] = [];

      for (let i = 0; i < ids.length; i++) {
        const movieId = ids[i]; // Assuming the movieId field holds the ID
        console.log('Fetching details for movie ID:', movieId);

        const request = this.filmService.getPopularMoviesById(movieId);
        requests.push(request);
      }

      if (requests.length > 0) {
        forkJoin(requests).subscribe((movies: any[]) => {
          console.log('Favorite movies details:', movies);

          for (let i = 0; i < movies.length; i++) {
            this.favoriteMovies.push(movies[i]);
          }

          console.log(this.favoriteMovies); // Verify favoriteMovies array here
        }, error => {
          console.error('Error fetching favorite movies details:', error);
        });
      } else {
        console.log('No favorite movie IDs found.');
      }
    });
  }







  getFavoriteMoviesDetails() {
    const requests = this.favoriteMovieIds.map(id =>
      this.filmService.getPopularMoviesById(id)
    );

    if (requests.length > 0) {
      forkJoin(requests).subscribe((results: any[]) => {
        this.favoriteMovies = results;
      });
    }
  }

  onFavoriteRemoved(movieId: number) {
    console.log('Removing favorite movie with ID:', movieId);

    // Find the index of the movie to remove from the favoriteMovies array
    const indexToRemove = this.favoriteMovies.findIndex(movie => movie.id === movieId);

    if (indexToRemove !== -1) {
      // Remove the movie from the favoriteMovies array
      this.favoriteMovies.splice(indexToRemove, 1);
    }
  }

}

