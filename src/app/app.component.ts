import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Canvas, Rect, FabricImage, util, Control, TPointerEvent } from 'fabric';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
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
  objects: { type: string; zIndex: number }[] = [];
  public draggedIndex: number = -1;
  private isDragging = false;
  private startY = 0;
  private startX = 0;
  private initialTop = 0;
  private initialLeft = 0;

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
      width: 1280,
      height: 720
    });
    this.canvas.backgroundColor = 'lightgrey';
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

    // Insert rectangle at the top layer
    this.canvas.insertAt(this.canvas.getObjects().length,rectangle);
    this.canvas.renderAll();
    this.updateObjectsList();
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
      // Get highest z-index and place new image above it
      const objects = this.canvas.getObjects();
      const highestIndex = objects.length > 0 ? Math.max(...objects.map(obj => obj.get('zIndex') || 0)) : 0;
      
      img.set({
        left: Math.min(randomLeft, this.canvas.width! - img.width!),
        top: Math.min(randomTop, this.canvas.height! - img.height!),
        zIndex: highestIndex + 1
      });

      this.addControls(img, true);
      // Insert image at the top layer
      this.canvas.insertAt(this.canvas.getObjects().length, img);
      this.canvas.renderAll();
      this.updateObjectsList();
    });
  }

  addVideo(): void {
    // Generate random position within canvas bounds
    const maxLeft = this.canvas.width! - 1280;
    const maxTop = this.canvas.height! - 720;
    const randomLeft = Math.random() * maxLeft;
    const randomTop = Math.random() * maxTop;

    const videoElement = document.createElement('video');
    const sourceElement = document.createElement('source');
    
    videoElement.width = 1280;
    videoElement.height = 720;
    videoElement.muted = true;
    videoElement.appendChild(sourceElement);
    sourceElement.src = `https://res.cloudinary.com/diarzlyki/video/upload/v1738875626/prisma/Untitled_Project_V1_juf1l5.mp4`; // Random video source
    videoElement.onended = () => videoElement.play();

    const videoFabricImage = new FabricImage(videoElement, {
      left: Math.min(randomLeft, this.canvas.width! - videoElement.width),
      top: Math.min(randomTop, this.canvas.height! - videoElement.height),
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    });

    // Insert video at the top layer
    this.canvas.insertAt(this.canvas.getObjects().length, videoFabricImage);
    videoElement.play();

    // Set up animation frame to continuously render the canvas
    const render = () => {
      this.canvas.renderAll();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
    this.updateObjectsList();
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
          const objects = this.canvas.getObjects();
          
          objects.sort((a, b) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0));
          
          objects.forEach((obj, index) => {
            obj.set('zIndex', index);
          });
          
          target.set('zIndex', objects.length);
          target.bringToFront();
          this.canvas.requestRenderAll();
          this.updateObjectsList();
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
            this.canvas.insertAt(this.canvas.getObjects().length, newImg);
            this.canvas.renderAll();
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
            this.canvas.insertAt(this.canvas.getObjects().length, newVideoFabricImage);
            newVideoElement.play();
            this.canvas.renderAll();
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
            // Add controls to all objects after loading
            this.canvas.getObjects().forEach(obj => {
              const isVideo = obj instanceof FabricImage && obj.getElement() instanceof HTMLVideoElement;
              const isImage = obj instanceof FabricImage && !(obj.getElement() instanceof HTMLVideoElement);
              
              this.addControls(obj, isImage);
              
              // Restart video playback if it's a video
              if (isVideo) {
                const videoElement = obj.getElement() as HTMLVideoElement;
                videoElement.play();
                videoElement.onended = () => videoElement.play();
              }
            });
            
            this.canvas.renderAll();
            this.updateObjectsList();
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
    this.updateObjectsList();
  }

  private updateObjectsList(): void {
    const canvasObjects = this.canvas.getObjects();
    // Map objects in their natural order (removed .reverse())
    this.objects = canvasObjects.map(obj => ({
      type: obj instanceof Rect ? 'Rectangle' : 
            obj instanceof FabricImage && (obj.getElement() instanceof HTMLVideoElement) ? 'Video' : 'Image',
      zIndex: obj.get('zIndex') || 0
    }));

    // Sort canvas objects by z-index in descending order (changed to descending)
    canvasObjects.sort((a, b) => (b.get('zIndex') || 0) - (a.get('zIndex') || 0));

    // Update z-indices to match the new order
    canvasObjects.forEach((obj, index) => {
      obj.set('zIndex', canvasObjects.length - 1 - index); // Invert the z-index assignment
    });

    // Set the top object as active
    if (canvasObjects.length > 0) {
      this.canvas.setActiveObject(canvasObjects[0]); // Changed to get first object (highest z-index)
    }
  }

  onDragStart(index: number) {
    this.draggedIndex = index;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    if (this.draggedIndex === dropIndex) return;

    // Reorder array
    const item = this.objects[this.draggedIndex];
    this.objects.splice(this.draggedIndex, 1);
    this.objects.splice(dropIndex, 0, item);

    // Get all canvas objects
    const canvasObjects = this.canvas.getObjects();

    // Update object positions based on new order
    this.objects.forEach((obj, index) => {
      const canvasObj = canvasObjects.find(
        cObj => (cObj instanceof Rect && obj.type === 'Rectangle') ||
                (cObj instanceof FabricImage && obj.type === (cObj.getElement() instanceof HTMLVideoElement ? 'Video' : 'Image'))
      );
      if (canvasObj) {
        // Remove and insert at new position
        this.canvas.remove(canvasObj);
        this.canvas.insertAt(index, canvasObj);
      }
    });

    this.canvas.renderAll();
    this.draggedIndex = -1;
  }

  onContainerMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startY = event.clientY;
    this.startX = event.clientX;
    
    const container = (event.target as HTMLElement).closest('.objects-list-container') as HTMLElement;
    const rect = container.getBoundingClientRect();
    this.initialTop = rect.top;
    this.initialLeft = rect.left;
    
    // Prevent text selection while dragging
    event.preventDefault();
  }

  onContainerMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const container = (event.target as HTMLElement).closest('.objects-list-container') as HTMLElement;
    const deltaY = event.clientY - this.startY;
    const deltaX = event.clientX - this.startX;
    
    container.style.position = 'fixed';
    container.style.top = `${this.initialTop + deltaY}px`;
    container.style.left = `${this.initialLeft + deltaX}px`;
  }

  onContainerMouseUp() {
    this.isDragging = false;
  }
}