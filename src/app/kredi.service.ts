import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Kredi } from './kredi';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class KrediService {
  [x: string]: any;
  private apiServerUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient){}

  public getKredi(): Observable<Kredi[]> {
    return this.http.get<Kredi[]>(`${this.apiServerUrl}/kredi/all`);
  }

  public addKredi(kredi: Kredi): Observable<Kredi> {
    return this.http.post<Kredi>(`${this.apiServerUrl}/kredi/add`, kredi);
  }

  public updateKredi(kredi: Kredi): Observable<Kredi> {
    return this.http.put<Kredi>(`${this.apiServerUrl}/kredi/update`, kredi);
  }

  public deleteKredi(krediId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiServerUrl}/kredi/delete/${krediId}`);
  }

  public taksitEkle(kredi: Kredi): Observable<Kredi[]> {
    return this.http.post<Kredi[]>(`${this.apiServerUrl}/kredi/taksitEkle`, kredi);
  }
  
}