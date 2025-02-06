import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Canvas, Rect, FabricImage, util, Control, TPointerEvent } from 'fabric';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  private canvas!: Canvas;
  @ViewChild('fileInput') fileInput!: ElementRef;
  private deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
  private editIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%234CAF50'/%3E%3Cpath d='M7 12h10M12 7v10' stroke='white' stroke-width='2'/%3E%3C/svg%3E";
  private bringToFrontIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%232196F3'/%3E%3Cpath d='M8 12l4-4 4 4M8 16l4-4 4 4' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E";
  private deleteImg!: HTMLImageElement;
  private editImg!: HTMLImageElement;
  private bringToFrontImg!: HTMLImageElement;

  constructor() {}

  ngAfterViewInit(): void {
    this.deleteImg = document.createElement('img');
    this.deleteImg.src = this.deleteIcon;
    this.editImg = document.createElement('img');
    this.editImg.src = this.editIcon;
    this.bringToFrontImg = document.createElement('img');
    this.bringToFrontImg.src = this.bringToFrontIcon;
    this.initializeCanvas();
  }

  initializeCanvas(): void {
    this.canvas = new Canvas('canvasElementId');
    this.canvas.setDimensions({
      width: 1920,
      height: 1080
    });
    this.canvas.backgroundColor = 'lightblue';
    this.canvas.renderAll();
  }

  addRectangle(): void {
    // Generate random position within canvas bounds
    const maxLeft = this.canvas.width! - 100;
    const maxTop = this.canvas.height! - 100;
    const randomLeft = Math.random() * maxLeft;
    const randomTop = Math.random() * maxTop;

    const rectangle = new Rect({
      left: randomLeft,
      top: randomTop,
      fill: 'red',
      width: 100,
      height: 100,
      hasControls: true,
      hasBorders: true,
      hasRotatingPoint: true,
      selectable: true,
      lockMovementX: false,
      lockMovementY: false,
      centeredRotation: true,
      transparentCorners: false,
      cornerColor: 'white',
      cornerStrokeColor: 'black',
      cornerStyle: 'circle',
      cornerSize: 12
    });

    // Get highest z-index and place new rectangle above it
    const objects = this.canvas.getObjects();
    const highestIndex = objects.length > 0 ? Math.max(...objects.map(obj => obj.get('zIndex') || 0)) : 0;
    rectangle.set('zIndex', highestIndex + 1);

    this.addControls(rectangle);
    this.canvas.add(rectangle);
    this.canvas.renderAll();
  }

  addImage(): void {
    // Generate random position within canvas bounds
    const maxLeft = this.canvas.width! - 200;
    const maxTop = this.canvas.height! - 200;
    const randomLeft = Math.random() * maxLeft;
    const randomTop = Math.random() * maxTop;

    FabricImage.fromURL('https://picsum.photos/200/200', {
      crossOrigin: 'anonymous'
    }).then((img) => {
      img.set({
        left: randomLeft,
        top: randomTop
      });

      this.addControls(img, true);
      this.canvas.add(img);
      this.canvas.renderAll();
    });
  }

  addVideo(): void {
    // Generate random position within canvas bounds
    const maxLeft = this.canvas.width! - 480;
    const maxTop = this.canvas.height! - 360;
    const randomLeft = Math.random() * maxLeft;
    const randomTop = Math.random() * maxTop;

    const videoElement = document.createElement('video');
    const sourceElement = document.createElement('source');
    
    videoElement.width = 480;
    videoElement.height = 360;
    videoElement.muted = true;
    videoElement.appendChild(sourceElement);
    sourceElement.src = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Replace with your video source
    videoElement.onended = () => videoElement.play();

    const videoFabricImage = new FabricImage(videoElement, {
      left: randomLeft,
      top: randomTop,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    });

    this.addControls(videoFabricImage, false);
    this.canvas.add(videoFabricImage);
    videoElement.play();

    // Set up animation frame to continuously render the canvas
    const render = () => {
      this.canvas.renderAll();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  private addControls(obj: any, isImage: boolean = false): void {
    // Delete control
    obj.controls.deleteControl = new Control({
      x: 0.5,
      y: -0.5,
      offsetY: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: this.deleteObject.bind(this),
      render: (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) => {
        const size = styleOverride.cornerSize || 24;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(this.deleteImg, -size/2, -size/2, size, size);
        ctx.restore();
      },
    });

    // Edit control
    obj.controls.editControl = new Control({
      x: 0.5,
      y: -0.5,
      offsetY: 48, // Position below delete control
      cursorStyle: 'pointer',
      mouseUpHandler: (eventData: TPointerEvent, transform: any) => {
        const target = transform.target;
        if (isImage) {
          this.handleImageEdit(target);
        } else {
          this.handleVideoEdit(target);
        }
      },
      render: (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) => {
        const size = styleOverride.cornerSize || 24;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(this.editImg, -size/2, -size/2, size, size);
        ctx.restore();
      },
    });

    // Bring to front control (only for images)
    if (isImage) {
      obj.controls.bringToFrontControl = new Control({
        x: 0.5,
        y: -0.5,
        offsetY: 80, // Position below edit control
        cursorStyle: 'pointer',
        mouseUpHandler: (eventData: TPointerEvent, transform: any) => {
          const target = transform.target;
          target.absolutePositioned = true;
          this.canvas.setActiveObject(target);
          this.canvas.requestRenderAll();
        },
        render: (ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) => {
          const size = styleOverride.cornerSize || 24;
          ctx.save();
          ctx.translate(left, top);
          ctx.rotate(util.degreesToRadians(fabricObject.angle));
          ctx.drawImage(this.bringToFrontImg, -size/2, -size/2, size, size);
          ctx.restore();
        },
      });
    }
  }

  private handleImageEdit(img: FabricImage): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string;
          FabricImage.fromURL(imgUrl, {
            crossOrigin: 'anonymous'
          }).then((newImg) => {
            newImg.set({
              left: img.left,
              top: img.top,
              scaleX: img.scaleX,
              scaleY: img.scaleY,
              angle: img.angle,
              absolutePositioned: img.absolutePositioned
            });
            this.canvas.remove(img);
            this.addControls(newImg, true);
            this.canvas.add(newImg);
            this.canvas.requestRenderAll();
          });
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  }

  private handleVideoEdit(video: FabricImage): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';

    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const videoUrl = event.target?.result as string;
          const newVideoElement = document.createElement('video');
          const newSourceElement = document.createElement('source');
          
          newVideoElement.onloadedmetadata = () => {
            const originalWidth = newVideoElement.videoWidth;
            const originalHeight = newVideoElement.videoHeight;
            
            newVideoElement.width = originalWidth;
            newVideoElement.height = originalHeight;
            newVideoElement.muted = true;
            newVideoElement.appendChild(newSourceElement);
            newSourceElement.src = videoUrl;
            newVideoElement.onended = () => newVideoElement.play();

            const newVideoFabricImage = new FabricImage(newVideoElement, {
              left: video.left,
              top: video.top,
              width: originalWidth,
              height: originalHeight,
              angle: video.angle,
              absolutePositioned: video.absolutePositioned,
              originX: 'center',
              originY: 'center',
              objectCaching: false,
            });

            this.canvas.remove(video);
            this.addControls(newVideoFabricImage, false);
            this.canvas.add(newVideoFabricImage);
            newVideoElement.play();
            this.canvas.requestRenderAll();
          };
          
          newVideoElement.src = videoUrl;
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  }

  saveToJson(): void {
    const json = this.canvas.toJSON();
    console.log(json);
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  loadJsonFile(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Selected file:', file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target!.result as string);
          console.log('Parsed JSON:', jsonData);
          
          this.canvas.loadFromJSON(jsonData, () => {
            console.log('Canvas loaded successfully!');
            this.canvas.renderAll();
          }).then(() => {
            console.log('Canvas fully loaded!');
          }).catch((error) => {
            console.error('Error loading canvas:', error);
          });

        } catch (error) {
          console.error('Invalid JSON format:', error);
        }
      };

      reader.readAsText(file);
    } else {
      console.error('No file selected');
    }
  }

  exportJsonFile() {
    const json = JSON.stringify(this.canvas.toJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.json';
    a.click();

    URL.revokeObjectURL(url);
  }

  private deleteObject(_eventData: TPointerEvent, transform: any): void {
    const target = transform.target;
    const canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
  }
}