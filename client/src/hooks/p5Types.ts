// Import p5 types dynamically to help with type resolution issues
import p5 from 'p5';
export type P5Type = typeof p5;
export default p5;