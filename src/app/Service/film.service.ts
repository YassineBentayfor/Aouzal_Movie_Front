import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { Movie } from '../Model/movie';
import { Comment } from '../Model/comment';
import { of } from 'rxjs';
import { UsersloginService } from './users.login.service';
import { User } from '../login/user.model';
import { Favorite } from '../Model/Favorite';
import { forkJoin } from 'rxjs';
import { Film } from '../Model/film';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private readonly api = 'https://emiflex-60e21-default-rtdb.firebaseio.com';
  private readonly baseurl = 'https://api.themoviedb.org/3/discover/movie';
  private readonly apikey = '4722616a8836f0b929a9cb3a04f6a6a4';
  private readonly dbPath = '/Movies';
  private secondBaseUrl = "http://localhost:9999/Commentaire";
  private favoritesUrl = 'http://localhost:9999/api';
  favoritesChanged: Subject<Favorite[]> = new Subject<Favorite[]>();
  favoritesMoviesIds: Subject<number[]> = new Subject<number[]>();
  commentsChanged: Subject<Comment[]> = new Subject<Comment[]>();
  allFilmsSource = new BehaviorSubject<Film[]>([]);
  allFilms$ = this.allFilmsSource.asObservable();

  filteredFilmsSource = new BehaviorSubject<Film[]>([]);
  filteredFilms$ = this.filteredFilmsSource.asObservable();

  user: User;

  constructor(
    private http: HttpClient,
    private usersService: UsersloginService
  ) {
  }

  setAllFilms(films: Film[]) {
    this.allFilmsSource.next(films);
    this.filteredFilmsSource.next(films);
  }

  updateFilteredFilms(films: Film[]) {
    this.filteredFilmsSource.next(films);
  }

  getAll(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.api}${this.dbPath}.json`);
  }


  getCommentaire(): Observable<any> {
    return this.http.get<any>(`${this.secondBaseUrl}/commentaires`)
  }

  getCommentaireFiltred(idFilm: number): Observable<any> {
    return this.http.get<any>(`${this.secondBaseUrl}/find/${idFilm}`)
  }

  addComment(commentData: any): Observable<any> {
    return this.http.post<any>(`${this.secondBaseUrl}/add`, commentData);
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.secondBaseUrl}/delete/${id}`);
  }


  getPopularMoviesById(id: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${this.apikey}`;
    return this.http.get<any>(url);

  }


  getPopularMovies(): Observable<any> {
    return this.http.get<any>(`${this.baseurl}?api_key=${this.apikey}`);
  }

  getMovieById(id: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${this.apikey}`;
    return this.http.get<any>(url);
  }

  getImageFromApi(poster_path: string): string {
    return 'https://image.tmdb.org/t/p/w1280' + poster_path;
  }

  searchMovies(moviePrefix: string): Observable<any> {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${this.apikey}&language=en-US&query=${moviePrefix}%20&page=1&include_adult=true`;
    return this.http.get<any>(url).pipe(map((res: any) => res.results));
  }


  // FAAAAAAAAAAAAAVVVVVVVVVVVVVOOOOOOOOOOOOOOOORRRRRRRRRRRRRRRIIIIIIIIIIIIIIIIIIITTTTTTTTTTTTTTTTTTTTTTEEEEEEEEE


  extractMovieIdsFromFavorites(favoriteMovies: any[]): number[] {
    return favoriteMovies.map((favorite) => favorite.movieId);
  }

  // Get favorite movie IDs
  getFavoriteMovieIds(): Observable<number[]> {
    return this.http.get<any[]>(`${this.favoritesUrl}/favorite`).pipe(
      map((response: any[]) => {
        console.log('Received favorite movies:', response);

        const movieIds = this.extractMovieIdsFromFavorites(response);
        console.log('Extracted movie IDs:', movieIds);

        return movieIds; // Return extracted movie IDs
      })
    );
  }

  // Add a movie to favorites
  addFavoriteMovie(movieId: number): Observable<any> {
    return this.http.post<any>(`${this.favoritesUrl}/add/${movieId}`, {});
  }

  // Remove a movie from favorites
  removeFavoriteMovie(id: number): Observable<any> {
    return this.http.delete<any>(`${this.favoritesUrl}/delete/${id}`);
  }
}
