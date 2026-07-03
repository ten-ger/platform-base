import { Component, h, Prop, Watch } from "@stencil/core";
import QRCode from 'qrcode';

@Component({
  tag: 'qr-code'
})
export class QrCode {

  private canvas: HTMLCanvasElement;

  /** The value to encode in the QR code */
  @Prop() value: string;

  /** Width and height in pixels */
  @Prop() size: number = 256;

  /** Error correction level — higher levels tolerate more damage but produce denser codes.
   *  L=7%, M=15%, Q=25%, H=30% */
  @Prop() errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M';

  /** Quiet zone (empty border) width in modules */
  @Prop() margin: number = 4;

  /** Dark module color (hex/rgb/css) */
  @Prop() darkColor: string = '#000000';

  /** Light module color (hex/rgb/css) */
  @Prop() lightColor: string = '#ffffff';

  componentDidLoad() {
    this.renderQr();
  }

  @Watch('value')
  @Watch('size')
  @Watch('errorCorrectionLevel')
  @Watch('margin')
  @Watch('darkColor')
  @Watch('lightColor')
  renderQr() {
    if (!this.canvas || !this.value) return;
    QRCode.toCanvas(this.canvas, this.value, {
      width: this.size,
      margin: this.margin,
      errorCorrectionLevel: this.errorCorrectionLevel,
      color: {
        dark: this.darkColor,
        light: this.lightColor,
      }
    });
  }

  render() {
    return <canvas ref={(el) => this.canvas = el as HTMLCanvasElement} />;
  }
}
