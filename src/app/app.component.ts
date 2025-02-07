import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Canvas, Rect, FabricImage, util, Control, TPointerEvent } from 'fabric';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
  private canvas!: Canvas;
  @ViewChild('fileInput') fileInput!: ElementRef;
  private deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
  private editIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%234CAF50'/%3E%3Cpath d='M7 12h10M12 7v10' stroke='white' stroke-width='2'/%3E%3C/svg%3E";
  private bringToFrontIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%232196F3'/%3E%3Cpath d='M8 12l4-4 4 4M8 16l4-4 4 4' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E";
  private deleteImg!: HTMLImageElement;
  private editImg!: HTMLImageElement;
  private bringToFrontImg!: HTMLImageElement;
  
  // Layer management
  layers: { type: string; zIndex: number }[] = [];
  public draggedIndex: number = -1;
  public selectedObjectIndex: number | null = null;
  
  // Dragging state
  private isDragging = false;
  private startY = 0;
  private startX = 0;
  private initialTop = 0;
  private initialLeft = 0;
  
  // Counter variables
  private rectangleCount = 0;
  private imageCount = 0;
  private videoCount = 0;

  // Add these properties to the class
  private isOptionsDragging = false;
  private optionsStartY = 0;
  private optionsStartX = 0;
  private optionsInitialTop = 0;
  private optionsInitialLeft = 0;

  constructor() {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
      window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      // Remove event listeners from both containers
      const optionsContainer = document.querySelector('.options-list-header') as HTMLElement;
      const layersContainer = document.querySelector('.objects-list-header') as HTMLElement;

      if (optionsContainer) {
        optionsContainer.removeEventListener('mousedown', this.onContainerMouseDown.bind(this));
      }
      if (layersContainer) {
        layersContainer.removeEventListener('mousedown', this.onContainerMouseDown.bind(this));
      }

      window.removeEventListener('mousemove', this.onMouseMove.bind(this));
      window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      // Add event listeners to both containers
      const optionsContainer = document.querySelector('.options-list-header') as HTMLElement;
      const layersContainer = document.querySelector('.objects-list-header') as HTMLElement;

      if (optionsContainer) {
        optionsContainer.addEventListener('mousedown', this.onContainerMouseDown.bind(this));
      }
      if (layersContainer) {
        layersContainer.addEventListener('mousedown', this.onContainerMouseDown.bind(this));
      }

      this.deleteImg = document.createElement('img');
      this.deleteImg.src = this.deleteIcon;
      this.editImg = document.createElement('img');
      this.editImg.src = this.editIcon;
      this.bringToFrontImg = document.createElement('img');
      this.bringToFrontImg.src = this.bringToFrontIcon;
      this.initializeCanvas();
    }
  }

  initializeCanvas(): void {
    this.canvas = new Canvas('canvasElementId');
    this.canvas.setDimensions({
      width: 1920,
      height: 1080
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
    this.canvas.setActiveObject(rectangle);
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
      this.canvas.setActiveObject(img);
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
    this.canvas.setActiveObject(videoFabricImage);
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
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target!.result as string);
          
          // Clear existing canvas
          this.canvas.clear();
          
          this.canvas.loadFromJSON(jsonData, () => {
            // Process each object after loading
            this.canvas.getObjects().forEach(obj => {
              if (obj instanceof FabricImage) {
                const element = obj.getElement();
                
                if (element instanceof HTMLVideoElement) {
                  // Recreate video element
                  const videoElement = document.createElement('video');
                  const sourceElement = document.createElement('source');
                  
                  videoElement.width = element.width;
                  videoElement.height = element.height;
                  videoElement.muted = true;
                  videoElement.appendChild(sourceElement);
                  sourceElement.src = element.currentSrc;
                  videoElement.onended = () => videoElement.play();
                  
                  // Update the fabric object with new video element
                  obj.setElement(videoElement);
                  videoElement.play();
                  
                  this.addControls(obj, false);
                } else {
                  // Handle regular images
                  this.addControls(obj, true);
                }
              } else if (obj instanceof Rect) {
                // Handle rectangles
                this.addControls(obj, false);
              }
            });
            setTimeout(() => {
              this.canvas.renderAll();
              this.updateObjectsList();
            }, 1000);
          });
        } catch (error) {
          console.error('Error loading JSON:', error);
        }
      };

      reader.readAsText(file);
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
    
    // Reset counts
    this.rectangleCount = 0;
    this.imageCount = 0;
    this.videoCount = 0;
    
    // Map objects in their natural order
    this.layers = canvasObjects.map(obj => {
      let type = '';
      if (obj instanceof Rect) {
        this.rectangleCount++;
        type = `Rectangle ${this.rectangleCount}`;
      } else if (obj instanceof FabricImage) {
        if (obj.getElement() instanceof HTMLVideoElement) {
          this.videoCount++;
          type = `Video ${this.videoCount}`;
        } else {
          this.imageCount++;
          type = `Image ${this.imageCount}`;
        }
      }
      
      return {
        type: type,
        zIndex: obj.get('zIndex') || 0
      };
    });
    
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

    // Update selectedObjectIndex based on active object
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.selectedObjectIndex = this.layers.findIndex(obj => 
        obj.type === this.getObjectType(activeObject)
      );
    } else {
      this.selectedObjectIndex = null;
    }
  }

  onDragStart(event: DragEvent, index: number) {
    // Stop propagation to prevent container drag
    event.stopPropagation();
    this.draggedIndex = index;
    // Set dragged data for HTML5 drag and drop
    event.dataTransfer?.setData('text/plain', index.toString());
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    // Add visual feedback for drop target
    const listItem = target.closest('.list-item');
    if (listItem) {
      listItem.classList.add('drag-over');
    }
  }

  onDragLeave(event: DragEvent) {
    const target = event.target as HTMLElement;
    const listItem = target.closest('.list-item');
    if (listItem) {
      listItem.classList.remove('drag-over');
    }
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove visual feedback
    const target = event.target as HTMLElement;
    const listItem = target.closest('.list-item');
    if (listItem) {
      listItem.classList.remove('drag-over');
    }

    if (this.draggedIndex === dropIndex) return;

    // Rest of the drop logic remains the same
    const item = this.layers[this.draggedIndex];
    this.layers.splice(this.draggedIndex, 1);
    this.layers.splice(dropIndex, 0, item);

    const canvasObjects = this.canvas.getObjects();
    this.layers.forEach((obj, index) => {
      const canvasObj = canvasObjects.find(
        cObj => this.getObjectType(cObj) === obj.type
      );
      if (canvasObj) {
        this.canvas.remove(canvasObj);
        this.canvas.insertAt(index, canvasObj);
      }
    });

    this.canvas.renderAll();
    this.draggedIndex = -1;
  }

  onContainerMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isOptionsHandle = target.closest('.options-list-header .drag-handle');
    const isLayersHandle = target.closest('.objects-list-header .drag-handle');
    
    if (!isOptionsHandle && !isLayersHandle) return;

    if (isOptionsHandle) {
      this.isOptionsDragging = true;
      this.optionsStartY = event.clientY;
      this.optionsStartX = event.clientX;
      
      const container = target.closest('.options-list-container') as HTMLElement;
      const rect = container.getBoundingClientRect();
      this.optionsInitialTop = rect.top;
      this.optionsInitialLeft = rect.left;
    } else {
      this.isDragging = true;
      this.startY = event.clientY;
      this.startX = event.clientX;
      
      const container = target.closest('.objects-list-container') as HTMLElement;
      const rect = container.getBoundingClientRect();
      this.initialTop = rect.top;
      this.initialLeft = rect.left;
    }
    
    event.preventDefault();
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const container = document.querySelector('.objects-list-container') as HTMLElement;
      if (!container) return;

      const deltaX = event.clientX - this.startX;
      const deltaY = event.clientY - this.startY;

      container.style.position = 'fixed';
      container.style.left = `${this.initialLeft + deltaX}px`;
      container.style.top = `${this.initialTop + deltaY}px`;
    }

    if (this.isOptionsDragging) {
      const container = document.querySelector('.options-list-container') as HTMLElement;
      if (!container) return;

      const deltaX = event.clientX - this.optionsStartX;
      const deltaY = event.clientY - this.optionsStartY;

      container.style.position = 'fixed';
      container.style.left = `${this.optionsInitialLeft + deltaX}px`;
      container.style.top = `${this.optionsInitialTop + deltaY}px`;
    }
  }

  private onMouseUp() {
    this.isDragging = false;
    this.isOptionsDragging = false;
  }

  onListItemClick(index: number): void {
    const canvasObjects = this.canvas.getObjects();
    // Find the corresponding canvas object
    const selectedObject = canvasObjects.find((obj, i) => 
      this.layers[index].type === this.getObjectType(obj)
    );
    
    if (selectedObject) {
      this.canvas.setActiveObject(selectedObject);
      this.canvas.requestRenderAll();
      this.selectedObjectIndex = index;
    }
  }

  private getObjectType(obj: any): string {
    if (obj instanceof Rect) {
      return `Rectangle ${this.layers.filter(o => o.type.startsWith('Rectangle')).length}`;
    } else if (obj instanceof FabricImage) {
      if (obj.getElement() instanceof HTMLVideoElement) {
        return `Video ${this.layers.filter(o => o.type.startsWith('Video')).length}`;
      } else {
        return `Image ${this.layers.filter(o => o.type.startsWith('Image')).length}`;
      }
    }
    return '';
  }
}