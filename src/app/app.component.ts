import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PlanMode = 'Vastu grid' | 'Floor plan' | 'Elevation';

@Component({
  selector: 'app-root', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html', styleUrl: './app.component.css',
})
export class AppComponent {
  readonly Math = Math;
  mode: PlanMode = 'Vastu grid';
  activeTool = 'Select';
  vastuEnabled = true;
  gridEnabled = true;
  showLabels = true;
  rotation = 0;
  plotWidth = 48;
  plotDepth = 48;
  zoom = 100;
  selectedZone = 'Brahmasthan';
  layers = [
    { name: 'Vastu mandala', color: '#c18b54', visible: true },
    { name: 'Temple structure', color: '#596b56', visible: true },
    { name: 'Site boundary', color: '#899084', visible: true },
  ];
  readonly modes: PlanMode[] = ['Vastu grid', 'Floor plan', 'Elevation'];
  readonly tools = [
    { name: 'Select', icon: '↖' }, { name: 'Wall', icon: '▱' },
    { name: 'Column', icon: '⊞' }, { name: 'Measure', icon: '↔' },
  ];
  readonly zoneNames = [
    ['NW', 'North-West', 'Vayu'], ['N', 'North', 'Kubera'], ['NE', 'North-East', 'Ishanya'],
    ['W', 'West', 'Varuna'], ['C', 'Centre', 'Brahmasthan'], ['E', 'East', 'Surya'],
    ['SW', 'South-West', 'Nairitya'], ['S', 'South', 'Yama'], ['SE', 'South-East', 'Agni'],
  ];
  readonly gridCells = Array.from({ length: 81 }, (_, i) => i);
  get plotArea(): number { return this.plotWidth * this.plotDepth; }
  setMode(mode: PlanMode): void { this.mode = mode; }
  toggleLayer(name: string): void {
    this.layers = this.layers.map((layer) => layer.name === name ? { ...layer, visible: !layer.visible } : layer);
  }
  layerVisible(name: string): boolean { return this.layers.find((layer) => layer.name === name)?.visible ?? false; }
  exportPlan(): void {
    const grid = Array.from({ length: 10 }, (_, i) => `<path d="M${80 + i * 80} 80v720M80 ${80 + i * 80}h720"/>`).join('');
    const labels = this.showLabels && this.vastuEnabled && this.layerVisible('Vastu mandala')
      ? this.zoneNames.map((zone, i) => `<text x="${200 + (i % 3) * 240}" y="${218 + Math.floor(i / 3) * 240}" text-anchor="middle" font-size="12" fill="#747a69">${zone[0]} · ${zone[1]}</text>`).join('') : '';
    const gridMarkup = this.gridEnabled && this.vastuEnabled && this.layerVisible('Vastu mandala')
      ? `<rect x="80" y="80" width="720" height="720" fill="#fbfaf7" stroke="#978b74"/><path d="${grid.replace(/<path d="|"\/>/g, '')}" fill="none" stroke="#d1c6b1" stroke-width="1"/>${labels}` : '';
    const structure = this.layerVisible('Temple structure')
      ? '<g transform="translate(440 440) rotate(45)"><rect x="-112" y="-112" width="224" height="224" fill="#d1c3a7" stroke="#897d67"/><rect x="-83" y="-83" width="166" height="166" fill="#e8dfcb" stroke="#978a70"/><rect x="-57" y="-57" width="114" height="114" fill="#c8b68f" stroke="#85775c"/><rect x="-35" y="-35" width="70" height="70" fill="#f8f5e9" stroke="#82765c"/></g><text x="440" y="446" text-anchor="middle" font-size="13" fill="#b27c48">✳</text>' : '';
    const boundary = this.layerVisible('Site boundary') ? '<rect x="68" y="68" width="744" height="744" fill="none" stroke="#899084" stroke-dasharray="6 5"/>' : '';
    const content = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#f8f7f3"/>${boundary}${gridMarkup}${structure}<text x="450" y="42" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#53604e">N · NORTH · ${this.rotation}°</text><text x="450" y="858" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#53604e">${this.mode.toUpperCase()} · ${this.plotWidth} × ${this.plotDepth} ft · ${this.plotArea.toLocaleString()} sq ft</text></svg>`;
    const blob = new Blob([content], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'temple-studio-plan.svg'; link.click();
    URL.revokeObjectURL(link.href);
  }
}
