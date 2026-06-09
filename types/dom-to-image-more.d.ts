declare module "dom-to-image-more" {
  export function toPng(node: Node, options?: {
    width?: number; height?: number; style?: Record<string, string>;
    quality?: number; filter?: (node: Node) => boolean; bgcolor?: string;
    cacheBust?: boolean; imagePlaceholder?: string; pixelRatio?: number;
  }): Promise<string>;
  export function toJpeg(node: Node, options?: Record<string, unknown>): Promise<string>;
  export function toBlob(node: Node, options?: Record<string, unknown>): Promise<Blob>;
  export function toPixelData(node: Node, options?: Record<string, unknown>): Promise<Uint8ClampedArray>;
  export function toSvg(node: Node, options?: Record<string, unknown>): Promise<string>;
}
