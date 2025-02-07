import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = 'diarzlyki';
  private uploadPreset = 'ml_default'; // Use this preset configured for unsigned uploads

  constructor(private http: HttpClient) {}

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('cloud_name', this.cloudName);

    const response = await firstValueFrom(
      this.http.post<any>(`https://api.cloudinary.com/v1_1/${this.cloudName}/upload`, formData)
    );
    
    return response.secure_url;
  }
}
