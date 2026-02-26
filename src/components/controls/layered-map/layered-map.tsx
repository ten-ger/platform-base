import { Component, h, Element, Event, EventEmitter, Method, Prop, State } from '@stencil/core';
import { default as OLMap } from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Feature, MapBrowserEvent } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';
import { Point, LineString } from 'ol/geom';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { createEmpty, extend } from 'ol/extent';

export interface MapFeatureData {
  id: string | number;
  type: 'point' | 'line';
  coordinates: [number, number] | [number, number][]; // [lon, lat] or [[lon, lat], ...]
  style?: {
    color?: string;
    width?: number;
    radius?: number;
    dash?: number[];
  };
  featureData?: any; // The original domain object (Violation, Link, etc.)
}

@Component({
  tag: 'layered-map',
  styleUrl: 'layered-map.css',
  shadow: true,
})
export class LayeredMap {
  @Element() el: HTMLLayeredMapElement;

  @Event() mapReady: EventEmitter<HTMLLayeredMapElement>;
  @Event() featureClicked: EventEmitter<{ data: any, originalEvent: MouseEvent }>;
  @Event() mapClicked: EventEmitter<{ coordinates: [number, number], originalEvent: MouseEvent }>;

  @Prop() width: string = '100%';
  @Prop() height: string = '100%';
  @Prop() center: [number, number] = [0, 0];
  @Prop() zoom: number = 4;
  @Prop() showCoordinates: boolean = true;
  @Prop() showLayerControl: boolean = true;

  @State() layerIds: string[] = [];
  @State() lastClickedCoords: [number, number] | null = null;
  @State() showCopiedToast: boolean = false;

  private mapElement: HTMLDivElement;
  private map: OLMap;

  // Registry to hold dynamic layers
  private layers: Map<string, {
    source: VectorSource,
    layer: VectorLayer,
    isClustered: boolean
  }> = new Map();

  componentDidRender() {
    if (!this.map && this.mapElement) {
      this.initializeMap();
    }
  }

  disconnectedCallback() {
    if (this.map) {
      this.map.dispose();
      this.map = null;
    }
  }

  private initializeMap() {
    this.map = new OLMap({
      target: this.mapElement,
      layers: [
        new TileLayer({ 
          source: new OSM(), 
          zIndex: 0
        })
      ],
      view: new View({
        center: fromLonLat(this.center),
        zoom: this.zoom,
      }),
      controls: []
    });

    this.map.on('click', this.handleMapClick.bind(this));
    this.mapReady.emit(this.el);
  }

  private syncLayerIds() {
    this.layerIds = Array.from(this.layers.keys()).sort((a, b) => {
      const zA = this.layers.get(a)?.layer.getZIndex() || 0;
      const zB = this.layers.get(b)?.layer.getZIndex() || 0;
      return zB - zA; // Descending: High Z-Index first
    });
  }

  private handleMapClick(event: MapBrowserEvent<any>) {
    const clickedCoords = toLonLat(event.coordinate);

    if (this.showCoordinates) {
      this.lastClickedCoords = clickedCoords as [number, number];
    }

    let featureDetected = false;

    this.map.forEachFeatureAtPixel(event.pixel, (featureLike) => {
      featureDetected = true;
      const feature = featureLike as Feature;

      // Check if it's a cluster
      const clusteredFeatures = feature.get('features');
      if (clusteredFeatures) {
        if (clusteredFeatures.length > 1) {
          // Zoom into cluster bounds
          const extent = createEmpty();
          clusteredFeatures.forEach(f => extend(extent, f.getGeometry().getExtent()));
          this.map.getView().fit(extent, { duration: 600, padding: [50, 50, 50, 50] });
        } else {
          // Single item in cluster
          this.featureClicked.emit({
            data: clusteredFeatures[0].get('featureData'),
            originalEvent: event.originalEvent
          });
        }
        return true;
      }

      // Standard non-clustered feature
      const featureData = feature.get('featureData');
      if (featureData) {
        this.featureClicked.emit({
          data: featureData,
          originalEvent: event.originalEvent
        });
        return true;
      }
    });

    if (!featureDetected) {
      this.mapClicked.emit({ coordinates: clickedCoords as [number, number], originalEvent: event.originalEvent });
    }
  }

  /**
   * Adds a generic layer to the map.
   */
  @Method()
  async addLayer(id: string, clustered: boolean = false, clusterDist: number = 40, index?: number): Promise<void> {
    if (this.layers.has(id)) return;

    const source = new VectorSource();
    let finalSource: any = source;

    if (clustered) {
      finalSource = new Cluster({ distance: clusterDist, source: source });
    }

    // Default to putting it on top of existing layers if no index is provided
    const zIndex = typeof index === 'number' ? index : this.layers.size + 1;

    const layer = new VectorLayer({
      source: finalSource,
      zIndex: zIndex,
      style: (feature) => this.genericStyleFunction(feature, clustered)
    });

    this.map.addLayer(layer);
    this.layers.set(id, { source, layer, isClustered: clustered });
    
    this.syncLayerIds();
  }

  /**
   * Adds features to a specific layer.
   */
  @Method()
  async drawFeatures(layerId: string, features: MapFeatureData[], clearExisting: boolean = false): Promise<void> {
    const layerEntry = this.layers.get(layerId);
    if (!layerEntry) return;

    if (clearExisting) layerEntry.source.clear();

    const olFeatures = features.map(f => {
      const geometry = f.type === 'point'
        ? new Point(fromLonLat(f.coordinates as [number, number]))
        : new LineString((f.coordinates as [number, number][])).transform('EPSG:4326', 'EPSG:3857');

      const feature = new Feature({ geometry });
      feature.set('featureData', f.featureData);
      feature.set('styleConfig', f.style);
      return feature;
    });

    layerEntry.source.addFeatures(olFeatures);
  }

  private genericStyleFunction(feature: any, isClustered: boolean): Style {
    if (isClustered) {
      const subFeatures = feature.get('features');
      const size = subFeatures.length;
      if (size > 1) {
        return new Style({
          image: new CircleStyle({
            radius: 14,
            fill: new Fill({ color: '#333' }),
            stroke: new Stroke({ color: '#fff', width: 2 })
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({ color: '#fff' }),
            font: 'bold 12px sans-serif'
          })
        });
      }
      // Single feature in cluster: use its own style
      return this.createFeatureStyle(subFeatures[0].get('styleConfig'));
    }

    return this.createFeatureStyle(feature.get('styleConfig'));
  }

  private createFeatureStyle(config: any): Style {
    const color = config?.color || '#20a9f8';
    const radius = config?.radius || 6;
    const width = config?.width || 2;

    return new Style({
      image: new CircleStyle({
        radius: radius,
        fill: new Fill({ color: color }),
        stroke: new Stroke({ color: '#ffffff', width: width }),
      }),
      stroke: new Stroke({
        color: color,
        width: width,
        lineDash: config?.dash
      })
    });
  }

  @Method()
  async getLayerFeatures(layerId: string): Promise<MapFeatureData[]> {
    const layerEntry = this.layers.get(layerId);
    if (!layerEntry) return [];

    const features = layerEntry.source.getFeatures();
    return features.map(f => {
      const geometry = f.getGeometry();
      const type = geometry.getType();
      let coordinates: any;

      if (type === 'Point') {
        // Cast to Point and transform single coordinate
        const pointGeom = geometry as Point;
        coordinates = toLonLat(pointGeom.getCoordinates());
      } else if (type === 'LineString') {
        // Cast to LineString, clone it so we don't mutate the map display, 
        // transform it, and get the array of coordinates
        const lineGeom = geometry as LineString;
        coordinates = lineGeom.clone().transform('EPSG:3857', 'EPSG:4326').getCoordinates();
      }

      return {
        id: f.getId(),
        type: type === 'Point' ? 'point' : 'line',
        featureType: f.get('featureType'), // Ensure this is stored during drawFeatures
        coordinates: coordinates,
        style: f.get('styleConfig'),
        featureData: f.get('featureData') || f.get('metadata') // Fallback to metadata if that's where domain objects are stored
      };
    });
  }

  @Method()
  async clearLayer(layerId: string): Promise<void> {
    this.layers.get(layerId)?.source.clear();
  }

  @Method()
  async removeLayer(layerId: string): Promise<void> {
    const entry = this.layers.get(layerId);
    if (entry) {
      this.map.removeLayer(entry.layer);
      this.layers.delete(layerId);
      this.syncLayerIds();
    }
  }

  @Method()
  async setView(lon: number, lat: number, zoom: number = 16): Promise<void> {
    this.map?.getView().animate({ center: fromLonLat([lon, lat]), zoom, duration: 500 });
  }

  private toggleLayerVisibility(id: string) {
    const entry = this.layers.get(id);
    if (entry) {
      const isVisible = entry.layer.getVisible();
      entry.layer.setVisible(!isVisible);
      this.layerIds = [...this.layerIds];
    }
  }

  private async copyCoordinatesToClipboard() {
    if (!this.lastClickedCoords) return;

    const coordString = `${this.lastClickedCoords[1].toFixed(5)}, ${this.lastClickedCoords[0].toFixed(5)}`;

    try {
      await navigator.clipboard.writeText(coordString);
      this.showCopiedToast = true;

      // Hide toast after 2 seconds
      setTimeout(() => {
        this.showCopiedToast = false;
      }, 2000);
    } catch (error) {
      console.log('Failed to copy coordinates to clipboard:', error);
    }
  }

  render() {
    return (
      <div class="map-container">
        <div
          ref={(el) => (this.mapElement = el as HTMLDivElement)}
          style={{ width: this.width, height: this.height }}
        ></div>

        {this.showCoordinates && this.lastClickedCoords && (
          <div class="coordinates-wrapper">
            {this.showCopiedToast && (
              <div class="copied-toast">
                Copied to clipboard
              </div>
            )}
            <div
              class="coordinates-overlay"
              onClick={() => this.copyCoordinatesToClipboard()}
              title="Click to copy coordinates"
            >
              {this.lastClickedCoords[1].toFixed(5)}, {this.lastClickedCoords[0].toFixed(5)}
            </div>
          </div>
        )}

        {this.showLayerControl && this.layerIds.length > 0 && (
          <div class="layer-control-overlay">
            <div class="layer-control-header">Active Layers</div>
            <div class="layer-list">
              {this.layerIds.map(id => (
                <div class="layer-item">
                  <span class="layer-name">{id}</span>
                  <div class="layer-actions">
                    <button
                      onClick={() => this.toggleLayerVisibility(id)}
                      class="control-btn"
                      title="Toggle Visibility"
                    >
                      <ion-icon slot='icon-only' name={this.layers.get(id)?.layer.getVisible() ? 'eye-outline' : 'eye-off-outline'} />
                    </button>
                    <button
                      onClick={() => this.removeLayer(id)}
                      class="control-btn remove-btn"
                      title="Remove Layer"
                    >
                      <ion-icon slot='icon-only' name='trash-outline' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}