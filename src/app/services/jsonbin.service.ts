import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class JsonbinService {
  private readonly API_URL = environment.jsonbinBaseUrl;
  private readonly API_KEY = environment.jsonbinApiKey;

  constructor(private http: HttpClient) {}

  createBin(data: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('X-Access-Key', this.API_KEY)
      .set('X-Bin-Private', 'false');

    return this.http.post(this.API_URL, data, { headers });
  }

  updateBin(binId: string, data: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('X-Access-Key', this.API_KEY);

    return this.http.put(`${this.API_URL}/${binId}`, data, { headers });
  }

  getBin(binId: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('X-Access-Key', this.API_KEY);

    return this.http.get(`${this.API_URL}/${binId}/latest`, { headers });
  }
}
