import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private cloudName = environment.cloudinaryCloudName; // Replace with your Cloudinary cloud name
  private uploadPreset = environment.cloudinaryUploadPreset; // Use your actual upload preset name from Cloudinary

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<{ secure_url: string }>(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`, 
      formData
    ).pipe(
      map(response => response.secure_url)
    );
  }
}
